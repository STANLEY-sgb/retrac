const db = require('../../database/db');
const SmsService = require('../sms/smsService');
const AuditService = require('../audit/auditService');

class CheckinCron {
  /**
   * Run automated broadcast for all eligible active clients
   */
  static async runWeeklyCheckinBroadcast() {
    console.log('⏰ [CRON BROADCAST] Starting automated weekly recovery check-in sweep...');
    
    // 1. Fetch active clients
    const activeClients = await db.query(
      "SELECT id, full_name, phone_number FROM clients WHERE status = 'active'"
    );

    if (!activeClients.rows || activeClients.rows.length === 0) {
      console.log('ℹ️ No active clients found for weekly check-in.');
      return { sent: 0, skipped: 0, total: 0 };
    }

    let sentCount = 0;
    let skippedCount = 0;
    const errors = [];

    // 2. Iterate each client and check for duplicate in last 5 days
    for (const client of activeClients.rows) {
      try {
        const recentCheckin = await db.getOne(
          `SELECT id, sent_at FROM check_ins 
           WHERE client_id = $1 
           AND sent_at >= datetime('now', '-5 days')
           ORDER BY sent_at DESC LIMIT 1`,
          [client.id]
        );

        if (recentCheckin) {
          skippedCount++;
          continue;
        }

        // Dispatch checkin prompt
        await SmsService.sendWeeklyCheckin(client.id);
        sentCount++;
      } catch (err) {
        console.error(`❌ Failed to send checkin to ${client.full_name}:`, err.message);
        errors.push({ clientId: client.id, name: client.full_name, error: err.message });
      }
    }

    // 3. Mark old unanswered check-ins (> 7 days without response) as 'missed' and escalate
    const overdueCheckins = await db.query(
      `SELECT id, client_id FROM check_ins 
       WHERE status = 'sent' 
       AND response_received_at IS NULL 
       AND sent_at <= datetime('now', '-7 days')`
    );

    if (overdueCheckins.rows.length > 0) {
      for (const chk of overdueCheckins.rows) {
        await db.run("UPDATE check_ins SET status = 'missed' WHERE id = $1", [chk.id]);
        const RiskEngine = require('../risk/riskEngine');
        await RiskEngine.updateRiskScore(chk.client_id, 'CHECKIN_MISSED_AUTO', { status: 'missed' });
      }
    }

    await AuditService.log({
      userName: 'CronScheduler',
      action: 'WEEKLY_CHECKIN_BROADCAST_COMPLETED',
      entityType: 'CRON',
      metadata: { sentCount, skippedCount, errorsCount: errors.length, overdueMarked: overdueCheckins.rows.length }
    });

    console.log(`✅ [CRON BROADCAST] Finished! Sent: ${sentCount} | Skipped (Recent): ${skippedCount} | Overdue Marked: ${overdueCheckins.rows.length}`);
    return {
      sent: sentCount,
      skipped: skippedCount,
      overdueMarked: overdueCheckins.rows.length,
      errors
    };
  }
}

module.exports = CheckinCron;
