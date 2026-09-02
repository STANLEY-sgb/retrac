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
    const message = `ReTrac:\nHi ${firstName} 👋\n\nHow are you doing this week?\n\nReply:\n1 — I'm doing well\n2 — I'm struggling\n\nYou can also reply with a message if you'd like to tell us more.`;

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
    if (cleanText.toUpperCase() === 'JOB' || cleanText.toUpperCase() === 'JOBS') {
      return await this.handleSmsJobSearch(client);
    }

    // 4. Recovery Check-in Response Processing
    let responseCode = 'FREE_TEXT';
    if (cleanText.startsWith('1')) {
      responseCode = '1';
    } else if (cleanText.startsWith('2')) {
      responseCode = '2';
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
        [cleanText, responseCode, aiAnalysis.sentiment, responseCode === '2' ? 25 : 0, checkinId]
      );
    } else {
      checkinId = 'chk-' + uuidv4().substring(0, 8);
      const today = new Date().toISOString().split('T')[0];
      await db.run(
        `INSERT INTO check_ins (
          id, client_id, scheduled_date, sent_at, response_received_at,
          response_raw, response_code, status, sentiment, risk_contribution, created_at
        ) VALUES ($1, $2, $3, datetime('now'), datetime('now'), $4, $5, 'received', $6, $7, datetime('now'))`,
        [checkinId, client.id, today, cleanText, responseCode, aiAnalysis.sentiment, responseCode === '2' ? 25 : 0]
      );
    }

    // 5. Run Risk Engine to compute new risk score & update database
    const riskUpdate = await RiskEngine.updateRiskScore(client.id, 'SMS_RESPONSE_RECEIVED', {
      responseCode,
      status: 'received',
      sentiment: aiAnalysis.sentiment
    });

    // 6. Notify Caseworker
    const firstName = client.full_name.split(' ')[0];
    let notificationTitle;
    let notificationMessage;

    if (responseCode === '2' || riskUpdate.newLevel === 'CRITICAL' || riskUpdate.newLevel === 'AT_RISK') {
      notificationTitle = `🚨 ${firstName} replied "${responseCode}" (${riskUpdate.newLevel})`;
      notificationMessage = `${client.full_name} replied: "${cleanText}". Risk score updated to ${riskUpdate.newScore}. Triage advice: ${aiAnalysis.recommended_action}`;
    } else {
      notificationTitle = `✅ ${firstName} completed weekly check-in`;
      notificationMessage = `${client.full_name} replied "${cleanText}". Recovery status remains STABLE (${riskUpdate.newScore}).`;
    }

    await NotificationService.createNotification({
      userId: 'usr-cw-01',
      clientId: client.id,
      type: responseCode === '2' ? 'risk_alert' : 'new_checkin',
      title: notificationTitle,
      message: notificationMessage,
      metadata: { checkinId, responseCode, riskUpdate }
    });

    // 7. Send empathetic automated confirmation SMS back to client
    let ackMessage;
    if (responseCode === '2') {
      ackMessage = `ReTrac: Thank you for sharing honestly, ${firstName}. Your recovery team is here for you. A caseworker will be in touch shortly to support you. You are not alone.`;
    } else if (responseCode === '1') {
      ackMessage = `ReTrac: Wonderful to hear, ${firstName}! Keep taking it one day at a time. We are proud of your progress. Have a blessed week!`;
    } else {
      ackMessage = `ReTrac: Thank you for your message, ${firstName}. It has been logged with your caseworker. Stay strong!`;
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
      aiAnalysis,
      riskUpdate,
      ackMessageSent: true
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

    let jobListText = "ReTrac:\nHere are jobs matching your skills:\n";
    jobs.rows.forEach((job, idx) => {
      jobListText += `${idx + 1}. ${job.title} — ${job.location.split(',')[0]} (UGX ${Number(job.pay_amount).toLocaleString()})\n`;
    });
    jobListText += "\nReply: 1, 2 or 3 to apply.";

    await this.sendSms({ clientId: client.id, to: client.phone_number, message: jobListText });

    return {
      success: true,
      action: 'SMS_JOB_MENU_SENT',
      matchedJobs: jobs.rows
    };
  }
}

module.exports = SmsService;
