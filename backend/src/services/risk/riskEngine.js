const { v4: uuidv4 } = require('uuid');
const db = require('../../database/db');
const { RISK_LEVELS, RISK_THRESHOLDS, RISK_WEIGHTS } = require('../../config/constants');
const NotificationService = require('../notification/notificationService');
const AuditService = require('../audit/auditService');

class RiskEngine {
  /**
   * Determine categorical risk level from numerical score
   */
  static calculateRiskLevel(score) {
    if (score >= RISK_THRESHOLDS.CRITICAL_MIN) {
      return RISK_LEVELS.CRITICAL;
    }
    if (score >= 50) {
      return RISK_LEVELS.AT_RISK;
    }
    if (score >= 30) {
      return RISK_LEVELS.MONITOR;
    }
    return RISK_LEVELS.STABLE;
  }

  /**
   * Calculate comprehensive risk score and generate explainable reasons
   */
  static calculateRiskScore({
    currentScore = 0,
    checkinResponseCode = null,
    checkinStatus = 'received',
    aiSentiment = null,
    recentCheckins = [],
    hasUnresolvedAlert = false,
    isInterventionResolved = false
  }) {
    let score = 0;
    const reasons = [];

    // If a caseworker successfully resolved an intervention, allow score stabilization
    if (isInterventionResolved) {
      score = Math.max(0, currentScore - 30);
      reasons.push('Caseworker follow-up completed (-30)');
    }

    // 1. Check-in status analysis
    if (checkinStatus === 'missed') {
      score += RISK_WEIGHTS.MISSED_CHECKIN;
      reasons.push(`Missed weekly check-in (+${RISK_WEIGHTS.MISSED_CHECKIN})`);
    }

    // 2. Direct Struggling Reply ("2")
    if (checkinResponseCode === '2') {
      score += RISK_WEIGHTS.REPLY_STRUGGLING;
      reasons.push(`Reply indicated struggling "2" (+${RISK_WEIGHTS.REPLY_STRUGGLING})`);
    } else if (checkinResponseCode === '1') {
      // Doing well reduces risk
      score = Math.max(0, score - 20);
      reasons.push('Reply indicated doing well "1" (-20)');
    }

    // 3. Historical Consecutive Struggling replies
    const recentStrugglingCount = recentCheckins
      .slice(0, 3)
      .filter(c => c.response_code === '2' || c.sentiment === 'struggling' || c.sentiment === 'distressed').length;

    if (recentStrugglingCount >= 2) {
      score += RISK_WEIGHTS.CONSECUTIVE_STRUGGLING;
      reasons.push(`Multiple consecutive struggling check-ins (+${RISK_WEIGHTS.CONSECUTIVE_STRUGGLING})`);
    }

    // 4. Historical Missed check-ins count
    const missedCount = recentCheckins.filter(c => c.status === 'missed').length;
    if (missedCount >= 3) {
      score += RISK_WEIGHTS.CONSECUTIVE_MISSED;
      reasons.push(`3 or more total missed check-ins (+${RISK_WEIGHTS.CONSECUTIVE_MISSED})`);
    } else if (missedCount === 2) {
      score += RISK_WEIGHTS.MISSED_CHECKIN;
      reasons.push(`2 missed check-ins recorded (+${RISK_WEIGHTS.MISSED_CHECKIN})`);
    }

    // 5. NLP Distress / Sentiment Flag
    if (aiSentiment === 'distressed') {
      score += RISK_WEIGHTS.NLP_DISTRESS_SIGNAL;
      reasons.push(`High emotional distress keywords detected in message (+${RISK_WEIGHTS.NLP_DISTRESS_SIGNAL})`);
    } else if (aiSentiment === 'struggling') {
      score += 10;
      reasons.push('Elevated life stress signal detected in text (+10)');
    }

    // 6. Recent Unresolved Alert
    if (hasUnresolvedAlert) {
      score += RISK_WEIGHTS.RECENT_UNRESOLVED_ALERT;
      reasons.push(`Existing unresolved risk alert (+${RISK_WEIGHTS.RECENT_UNRESOLVED_ALERT})`);
    }

    // Clamp score strictly between 0 and 100
    const finalScore = Math.min(100, Math.max(0, score));
    const level = this.calculateRiskLevel(finalScore);

    // If stable and reasons empty, add clean state reason
    if (reasons.length === 0) {
      reasons.push('Consistent weekly check-in compliance and positive recovery trajectory');
    }

    return {
      score: finalScore,
      level,
      reasons
    };
  }

  /**
   * Main Engine Entry: Update client risk score, log history, create alerts/notifications
   */
  static async updateRiskScore(clientId, triggerEvent = 'CHECKIN_RECEIVED', { responseCode = null, status = 'received', sentiment = null } = {}) {
    // 1. Fetch client data
    const client = await db.getOne('SELECT * FROM clients WHERE id = $1', [clientId]);
    if (!client) {
      throw new Error(`Client with ID '${clientId}' not found.`);
    }

    // 2. Fetch recent check-ins history
    const checkinHistory = await db.query(
      'SELECT * FROM check_ins WHERE client_id = $1 ORDER BY created_at DESC LIMIT 5',
      [clientId]
    );

    // 3. Check for active unresolved alerts
    const activeAlert = await db.getOne(
      "SELECT * FROM risk_alerts WHERE client_id = $1 AND status = 'active'",
      [clientId]
    );

    // 4. Calculate new risk
    const calculation = this.calculateRiskScore({
      currentScore: client.current_risk_score || 0,
      checkinResponseCode: responseCode,
      checkinStatus: status,
      aiSentiment: sentiment,
      recentCheckins: checkinHistory.rows,
      hasUnresolvedAlert: !!activeAlert
    });

    // 5. Update client table
    await db.run(
      `UPDATE clients 
       SET current_risk_score = $1, current_risk_level = $2, updated_at = datetime('now')
       WHERE id = $3`,
      [calculation.score, calculation.level, clientId]
    );

    // 6. Record immutable risk_scores log entry
    const scoreLogId = 'rsk-' + uuidv4().substring(0, 8);
    await db.run(
      `INSERT INTO risk_scores (id, client_id, score, level, reasons, trigger_event, calculated_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, datetime('now'), datetime('now'))`,
      [scoreLogId, clientId, calculation.score, calculation.level, JSON.stringify(calculation.reasons), triggerEvent]
    );

    // 7. If risk escalated to AT_RISK or CRITICAL, create alert and notification
    let alertCreated = null;
    if (calculation.level === RISK_LEVELS.AT_RISK || calculation.level === RISK_LEVELS.CRITICAL) {
      if (!activeAlert) {
        alertCreated = await this.createRiskAlert({
          clientId,
          caseworkerId: client.assigned_caseworker_id,
          riskScore: calculation.score,
          riskLevel: calculation.level,
          reasons: calculation.reasons
        });
      }
    }

    // 8. Audit log
    await AuditService.log({
      userName: 'RiskEngine',
      action: 'RISK_SCORE_UPDATED',
      entityType: 'CLIENT',
      entityId: clientId,
      metadata: {
        previousScore: client.current_risk_score,
        newScore: calculation.score,
        newLevel: calculation.level,
        triggerEvent,
        reasons: calculation.reasons
      }
    });

    return {
      clientId,
      previousScore: client.current_risk_score,
      previousLevel: client.current_risk_level,
      newScore: calculation.score,
      newLevel: calculation.level,
      reasons: calculation.reasons,
      alert: alertCreated
    };
  }

  /**
   * Create high risk alert and broadcast notifications
   */
  static async createRiskAlert({ clientId, caseworkerId, riskScore, riskLevel, reasons }) {
    const client = await db.getOne('SELECT full_name, phone_number FROM clients WHERE id = $1', [clientId]);
    const clientName = client ? client.full_name : 'Client';
    const alertId = 'alt-' + uuidv4().substring(0, 8);
    const reasonsStr = JSON.stringify(reasons);

    await db.run(
      `INSERT INTO risk_alerts (id, client_id, caseworker_id, risk_score, risk_level, reasons, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'active', datetime('now'))`,
      [alertId, clientId, caseworkerId, riskScore, riskLevel, reasonsStr]
    );

    // Broadcast in-app notification
    const alertIcon = riskLevel === RISK_LEVELS.CRITICAL ? '🚨 CRITICAL RISK' : '⚠️ AT RISK';
    await NotificationService.broadcastToStaff({
      clientId,
      type: 'risk_alert',
      title: `${alertIcon}: ${clientName}`,
      message: `Risk score elevated to ${riskScore} (${riskLevel}). Reasons: ${reasons.slice(0, 2).join('; ')}. Immediate follow-up advised.`,
      metadata: { alertId, riskScore, riskLevel }
    });

    return { id: alertId, clientId, riskScore, riskLevel, reasons, status: 'active' };
  }

  /**
   * Resolve an existing risk alert (Caseworker Action)
   */
  static async resolveRiskAlert(alertId, userId, resolutionNotes = 'Caseworker completed intervention') {
    const alert = await db.getOne('SELECT * FROM risk_alerts WHERE id = $1', [alertId]);
    if (!alert) {
      throw new Error(`Risk alert with ID '${alertId}' not found.`);
    }

    // 1. Mark alert resolved
    await db.run(
      `UPDATE risk_alerts 
       SET status = 'resolved', resolved_at = datetime('now'), resolution_notes = $1, resolved_by = $2
       WHERE id = $3`,
      [resolutionNotes, userId, alertId]
    );

    // 2. Adjust client risk downwards
    const client = await db.getOne('SELECT * FROM clients WHERE id = $1', [alert.client_id]);
    if (client) {
      const newScore = Math.max(20, (client.current_risk_score || 50) - 35);
      const newLevel = this.calculateRiskLevel(newScore);

      await db.run(
        `UPDATE clients 
         SET current_risk_score = $1, current_risk_level = $2, updated_at = datetime('now')
         WHERE id = $3`,
        [newScore, newLevel, client.id]
      );

      // Record score adjustment log
      const scoreLogId = 'rsk-' + uuidv4().substring(0, 8);
      await db.run(
        `INSERT INTO risk_scores (id, client_id, score, level, reasons, trigger_event, calculated_at, created_at)
         VALUES ($1, $2, $3, $4, $5, 'ALERT_RESOLVED', datetime('now'), datetime('now'))`,
        [
          scoreLogId,
          client.id,
          newScore,
          newLevel,
          JSON.stringify([`Risk alert resolved by caseworker (-35): "${resolutionNotes}"`])
        ]
      );
    }

    // 3. Audit log
    await AuditService.log({
      userId,
      action: 'RISK_ALERT_RESOLVED',
      entityType: 'ALERT',
      entityId: alertId,
      metadata: { clientId: alert.client_id, resolutionNotes }
    });

    return {
      success: true,
      alertId,
      status: 'resolved',
      resolutionNotes
    };
  }
}

module.exports = RiskEngine;
