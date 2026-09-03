const { v4: uuidv4 } = require('uuid');
const config = require('../../config/env');
const db = require('../../database/db');
const DemoSmsProvider = require('./demoSmsProvider');
const AfricaTalkingSmsProvider = require('./africaTalkingSmsProvider');
const AiRiskAnalyzer = require('../risk/aiRiskAnalyzer');
const RiskEngine = require('../risk/riskEngine');
const NotificationService = require('../notification/notificationService');
const AuditService = require('../audit/auditService');

class SmsService {
  /**
   * Get configured SMS Provider instance
   */
  static getProvider() {
    if (config.SMS_PROVIDER === 'africastalking') {
      return new AfricaTalkingSmsProvider();
    }
    return new DemoSmsProvider();
  }

  /**
   * Normalize Ugandan telephone numbers to E.164 (+256...)
   */
  static normalizePhoneNumber(phone) {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9+]/g, '');
    
    if (cleaned.startsWith('0')) {
      // 0772111222 -> +256772111222
      cleaned = '+256' + cleaned.substring(1);
    } else if (cleaned.startsWith('256')) {
      cleaned = '+' + cleaned;
    } else if (!cleaned.startsWith('+')) {
      cleaned = '+256' + cleaned;
    }
    return cleaned;
  }

  /**
   * Send arbitrary SMS and log to sms_messages
   */
  static async sendSms({ clientId = null, to, message }) {
    const normalizedPhone = this.normalizePhoneNumber(to);
    const provider = this.getProvider();
    const dispatch = await provider.sendSms(normalizedPhone, message);

    const smsId = 'sms-' + uuidv4().substring(0, 8);
    await db.run(
      `INSERT INTO sms_messages (id, client_id, direction, phone_number, message_text, provider, status, external_message_id, created_at)
       VALUES ($1, $2, 'outbound', $3, $4, $5, $6, $7, datetime('now'))`,
      [smsId, clientId, normalizedPhone, message, dispatch.provider, dispatch.status, dispatch.messageId]
    );

    return {
      smsId,
      ...dispatch
    };
  }

  /**
   * Send weekly check-in SMS prompt to a specific client
   */
  static async sendWeeklyCheckin(clientId) {
    const client = await db.getOne('SELECT * FROM clients WHERE id = $1', [clientId]);
    if (!client) {
      throw new Error(`Client with ID '${clientId}' not found.`);
    }

    const firstName = client.full_name.split(' ')[0];
    const message = `ReTrac:\nHi ${firstName} 👋\n\nHow are you doing this week?\n1 — I'm doing well\n2 — I'm struggling / need support\n3 — I'd like to talk to someone\n4 — I'm making progress\n5 — I need practical support\n\nReply 1, 2, 3, 4, 5, JOB or type your own message.`;

    const dispatch = await this.sendSms({
      clientId: client.id,
      to: client.phone_number,
      message
    });

    // Create a new check-in record in 'sent' state
    const checkinId = 'chk-' + uuidv4().substring(0, 8);
    const today = new Date().toISOString().split('T')[0];

    await db.run(
      `INSERT INTO check_ins (id, client_id, scheduled_date, sent_at, status, response_code, created_at)
       VALUES ($1, $2, $3, datetime('now'), 'sent', 'NONE', datetime('now'))`,
      [checkinId, client.id, today]
    );

    await AuditService.log({
      userName: 'SmsService',
      action: 'CHECKIN_SMS_SENT',
      entityType: 'CHECKIN',
      entityId: checkinId,
      metadata: { clientId: client.id, phone: client.phone_number }
    });

    return {
      success: true,
      checkinId,
      clientId: client.id,
      phone: client.phone_number,
      dispatch
    };
  }

  /**
   * Process Inbound SMS / USSD webhook payload
   * Handles:
   * 1. 1/2 Check-in responses
   * 2. Free-text recovery messages with AI triage
   * 3. Feature phone "JOB" search and application workflow
   */
  static async processIncomingSms({ from, text, provider = 'demo' }) {
    const normalizedPhone = this.normalizePhoneNumber(from);
    const cleanText = (text || '').trim();

    console.log(`📥 [INBOUND SMS] From: ${normalizedPhone} | Content: "${cleanText}"`);

    // 1. Identify Client by Phone Number
    const client = await db.getOne(
      'SELECT * FROM clients WHERE phone_number = $1 OR phone_number LIKE $2',
      [normalizedPhone, `%${normalizedPhone.replace('+256', '')}%`]
    );

    const clientId = client ? client.id : null;

    // 2. Log incoming SMS
    const smsId = 'sms-' + uuidv4().substring(0, 8);
    await db.run(
      `INSERT INTO sms_messages (id, client_id, direction, phone_number, message_text, provider, status, created_at)
       VALUES ($1, $2, 'inbound', $3, $4, $5, 'received', datetime('now'))`,
      [smsId, clientId, normalizedPhone, cleanText, provider]
    );

    if (!client) {
      console.warn(`⚠️ Inbound SMS from unrecognized number: ${normalizedPhone}`);
      return {
        success: true,
        recognized: false,
        message: 'Message logged, but phone number is not registered to an active patient.'
      };
    }

    // 3. Check for Feature Phone SMS Job Search Command ("JOB" / "JOBS")
    const isJobCommand = cleanText.toUpperCase() === 'JOB' || cleanText.toUpperCase() === 'JOBS';
    if (isJobCommand) {
      return await this.handleSmsJobSearch(client);
    }

    // 3b. Check if client is replying to a recent Job Menu with 1, 2, or 3
    const lastOutbound = await db.getOne(
      "SELECT message_text FROM sms_messages WHERE client_id = $1 AND direction = 'outbound' ORDER BY created_at DESC LIMIT 1",
      [client.id]
    );
    const wasJobMenuPrompt = lastOutbound && (
      lastOutbound.message_text.includes('ReTrac Jobs:') ||
      lastOutbound.message_text.includes('Reply with 1, 2 or 3') ||
      lastOutbound.message_text.includes('Reply: 1, 2 or 3')
    );

    const firstChar = cleanText.substring(0, 1);
    if (wasJobMenuPrompt && ['1', '2', '3'].includes(firstChar) && cleanText.length <= 5) {
      return await this.handleJobSelectionReply(client, parseInt(firstChar, 10));
    }

    // 4. Recovery Check-in Response Processing (1, 2, 3, 4, 5, or Free Text)
    let responseCode = 'FREE_TEXT';
    let classification = 'FREE_TEXT';
    let riskContribution = 0;

    if (firstChar === '1') {
      responseCode = '1';
      classification = 'STABLE';
      riskContribution = -20;
    } else if (firstChar === '2') {
      responseCode = '2';
      classification = 'STRUGGLING';
      riskContribution = 25;
    } else if (firstChar === '3') {
      responseCode = '3';
      classification = 'SUPPORT_REQUEST';
      riskContribution = 10;
    } else if (firstChar === '4') {
      responseCode = '4';
      classification = 'PROGRESS';
      riskContribution = -10;
    } else if (firstChar === '5') {
      responseCode = '5';
      classification = 'PRACTICAL_SUPPORT';
      riskContribution = 5;
    }

    // Run AI / NLP Sentiment & Distress Analyzer
    const aiAnalysis = await AiRiskAnalyzer.analyzeText(cleanText);

    // Save or update latest open check-in
    let checkin = await db.getOne(
      "SELECT * FROM check_ins WHERE client_id = $1 AND status = 'sent' ORDER BY created_at DESC LIMIT 1",
      [client.id]
    );

    let checkinId;
    if (checkin) {
      checkinId = checkin.id;
      await db.run(
        `UPDATE check_ins 
         SET response_received_at = datetime('now'),
             response_raw = $1,
             response_code = $2,
             status = 'received',
             sentiment = $3,
             risk_contribution = $4
         WHERE id = $5`,
        [cleanText, responseCode, aiAnalysis.sentiment || classification, riskContribution, checkinId]
      );
    } else {
      checkinId = 'chk-' + uuidv4().substring(0, 8);
      const today = new Date().toISOString().split('T')[0];
      await db.run(
        `INSERT INTO check_ins (
          id, client_id, scheduled_date, sent_at, response_received_at,
          response_raw, response_code, status, sentiment, risk_contribution, created_at
        ) VALUES ($1, $2, $3, datetime('now'), datetime('now'), $4, $5, 'received', $6, $7, datetime('now'))`,
        [checkinId, client.id, today, cleanText, responseCode, aiAnalysis.sentiment || classification, riskContribution]
      );
    }

    // 5. Run Risk Engine to compute new risk score & update database
    const riskUpdate = await RiskEngine.updateRiskScore(client.id, 'SMS_RESPONSE_RECEIVED', {
      responseCode,
      status: 'received',
      sentiment: aiAnalysis.sentiment
    });

    // 6. Notify Assigned Caseworker
    const firstName = client.full_name.split(' ')[0];
    let caseworkerUserId = 'usr-cw-01';
    if (client.assigned_caseworker_id) {
      const cw = await db.getOne('SELECT user_id FROM caseworkers WHERE id = $1', [client.assigned_caseworker_id]);
      if (cw && cw.user_id) caseworkerUserId = cw.user_id;
    }

    let notificationTitle;
    let notificationMessage;
    let notificationType = 'new_checkin';

    if (responseCode === '2') {
      notificationTitle = `🚨 ${firstName} is Struggling (Score: ${riskUpdate.newScore})`;
      notificationMessage = `${client.full_name} reported struggling with recovery. Risk score elevated to ${riskUpdate.newScore} (${riskUpdate.newLevel}). Immediate follow-up required.`;
      notificationType = 'risk_alert';
    } else if (responseCode === '3') {
      notificationTitle = `📞 Support Request: ${client.full_name}`;
      notificationMessage = `${client.full_name} replied "3" — requested to speak with a caseworker as soon as possible.`;
      notificationType = 'system';
    } else if (responseCode === '4') {
      notificationTitle = `🌟 Recovery Progress: ${client.full_name}`;
      notificationMessage = `${client.full_name} replied "4" — reported positive recovery progress and engagement.`;
    } else if (responseCode === '5') {
      notificationTitle = `🤝 Practical Support Request: ${client.full_name}`;
      notificationMessage = `${client.full_name} replied "5" — requested practical assistance (reintegration, employment, or referral).`;
      notificationType = 'system';
    } else if (responseCode === '1') {
      notificationTitle = `✅ Check-in Completed: ${client.full_name}`;
      notificationMessage = `${client.full_name} replied "1" — Doing well. Recovery trajectory STABLE (${riskUpdate.newScore}).`;
    } else {
      // Free text
      if (riskUpdate.newLevel === 'CRITICAL' || riskUpdate.newLevel === 'AT_RISK') {
        notificationTitle = `🚨 ${firstName} sent high-risk message (${riskUpdate.newLevel})`;
        notificationMessage = `${client.full_name} wrote: "${cleanText}". Risk score: ${riskUpdate.newScore}. Triage advice: ${aiAnalysis.recommended_action}`;
        notificationType = 'risk_alert';
      } else {
        notificationTitle = `📱 New SMS message from ${firstName}`;
        notificationMessage = `${client.full_name} wrote: "${cleanText}". Risk score remains ${riskUpdate.newScore} (${riskUpdate.newLevel}).`;
      }
    }

    await NotificationService.createNotification({
      userId: caseworkerUserId,
      clientId: client.id,
      type: notificationType,
      title: notificationTitle,
      message: notificationMessage,
      metadata: { checkinId, responseCode, classification, riskUpdate }
    });

    // 7. Send empathetic automated confirmation SMS back to client
    let ackMessage;
    if (responseCode === '1') {
      ackMessage = 'ReTrac: Thank you for checking in. Keep taking recovery one day at a time. Your progress matters. We are here with you.';
    } else if (responseCode === '2') {
      ackMessage = 'ReTrac: Thank you for telling us. You do not have to face this alone. A ReTrac caseworker will follow up with you for support.';
    } else if (responseCode === '3') {
      ackMessage = 'ReTrac: We hear you. Thank you for reaching out. A caseworker will contact you as soon as possible. You are not alone.';
    } else if (responseCode === '4') {
      ackMessage = 'ReTrac: That is encouraging to hear. Keep going, one step at a time. Your effort and progress are important. Keep checking in with us.';
    } else if (responseCode === '5') {
      ackMessage = 'ReTrac: Thank you for letting us know. We are here to help. A caseworker will review your request and follow up with you.';
    } else {
      // Free Text
      const lowerText = cleanText.toLowerCase();
      if (aiAnalysis.sentiment === 'distressed' || lowerText.includes('craving') || lowerText.includes('shake') || lowerText.includes('struggling') || lowerText.includes('relapse')) {
        ackMessage = 'ReTrac: Thank you for telling us. You do not have to face this alone. A ReTrac caseworker will follow up with you for support.';
      } else if (aiAnalysis.sentiment === 'positive' || lowerText.includes('better') || lowerText.includes('good') || lowerText.includes('progress')) {
        ackMessage = 'ReTrac: That is encouraging to hear. Keep going, one step at a time. Your effort and progress are important. Keep checking in with us.';
      } else if (lowerText.includes('work') || lowerText.includes('job') || lowerText.includes('help')) {
        ackMessage = 'ReTrac: Thank you for letting us know. We are here to help. A caseworker will review your request and follow up with you.';
      } else {
        ackMessage = 'ReTrac: Thank you for your message. We are here with you. Your caseworker has been updated. Keep taking it one day at a time.';
      }
    }

    await this.sendSms({
      clientId: client.id,
      to: client.phone_number,
      message: ackMessage
    });

    return {
      success: true,
      recognized: true,
      clientId: client.id,
      clientName: client.full_name,
      checkinId,
      responseCode,
      classification,
      aiAnalysis,
      riskUpdate,
      ackMessageSent: true,
      ackMessage
    };
  }

  /**
   * Handle SMS-based job exploration for feature phones
   */
  static async handleSmsJobSearch(client) {
    const jobs = await db.query(
      "SELECT id, title, location, pay_amount, pay_frequency FROM jobs WHERE status = 'open' LIMIT 3"
    );

    if (!jobs.rows || jobs.rows.length === 0) {
      const emptyMsg = "ReTrac:\nNo new job vacancies currently open. We will alert you by SMS as soon as a new placement opens.";
      await this.sendSms({ clientId: client.id, to: client.phone_number, message: emptyMsg });
      return { success: true, message: 'No open jobs found' };
    }

    let jobListText = "ReTrac Jobs:\n";
    jobs.rows.forEach((job, idx) => {
      jobListText += `${idx + 1} ${job.title} — ${job.location.split(',')[0]} — UGX ${Number(job.pay_amount).toLocaleString()}/day\n`;
    });
    jobListText += "\nReply with 1, 2 or 3.";

    await this.sendSms({ clientId: client.id, to: client.phone_number, message: jobListText });

    return {
      success: true,
      action: 'SMS_JOB_MENU_SENT',
      matchedJobs: jobs.rows
    };
  }

  /**
   * Handle SMS reply to Job Menu (1, 2, or 3)
   */
  static async handleJobSelectionReply(client, optionIndex) {
    const jobs = await db.query(
      "SELECT id, title, location, pay_amount, employer_id FROM jobs WHERE status = 'open' LIMIT 3"
    );

    const selectedJob = jobs.rows[optionIndex - 1];
    const firstName = client.full_name.split(' ')[0];

    if (!selectedJob) {
      const fallbackMsg = `ReTrac: Job option ${optionIndex} is not available. Send "JOB" to view current open listings.`;
      await this.sendSms({ clientId: client.id, to: client.phone_number, message: fallbackMsg });
      return { success: true, message: 'Invalid job selection' };
    }

    // Check or create job application
    const existing = await db.getOne(
      'SELECT id FROM job_applications WHERE job_id = $1 AND client_id = $2',
      [selectedJob.id, client.id]
    );

    let appId = existing ? existing.id : 'app-' + uuidv4().substring(0, 8);
    if (!existing) {
      await db.run(
        `INSERT INTO job_applications (id, job_id, client_id, match_score, status, applied_at, notes, created_at, updated_at)
         VALUES ($1, $2, $3, 85, 'applied', datetime('now'), 'Applied via feature phone SMS command', datetime('now'), datetime('now'))`,
        [appId, selectedJob.id, client.id]
      );
    }

    // Notify caseworker
    let caseworkerUserId = 'usr-cw-01';
    if (client.assigned_caseworker_id) {
      const cw = await db.getOne('SELECT user_id FROM caseworkers WHERE id = $1', [client.assigned_caseworker_id]);
      if (cw && cw.user_id) caseworkerUserId = cw.user_id;
    }

    await NotificationService.createNotification({
      userId: caseworkerUserId,
      clientId: client.id,
      type: 'job_match',
      title: `💼 SMS Job Application: ${client.full_name}`,
      message: `${client.full_name} applied via SMS for "${selectedJob.title}". Match score: 85%.`,
      metadata: { appId, jobId: selectedJob.id, clientId: client.id }
    });

    const confirmMsg = `ReTrac: Thank you ${firstName}. Your interest in "${selectedJob.title}" has been recorded. Your caseworker will follow up to assist you with the placement.`;
    await this.sendSms({ clientId: client.id, to: client.phone_number, message: confirmMsg });

    return {
      success: true,
      action: 'SMS_JOB_APPLICATION_SAVED',
      jobId: selectedJob.id,
      jobTitle: selectedJob.title
    };
  }
}

module.exports = SmsService;
