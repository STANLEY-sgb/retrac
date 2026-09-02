const db = require('../database/db');

class DashboardController {
  /**
   * Get Comprehensive Caseworker & System Dashboard Metrics
   */
  static async getOverview(req, res, next) {
    try {
      // 1. Client Status & Risk Distribution Metrics
      const clientStats = await db.getOne(`
        SELECT 
          COUNT(*) as total_clients,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_clients,
          SUM(CASE WHEN current_risk_level = 'STABLE' THEN 1 ELSE 0 END) as stable_clients,
          SUM(CASE WHEN current_risk_level = 'MONITOR' THEN 1 ELSE 0 END) as monitor_clients,
          SUM(CASE WHEN current_risk_level = 'AT_RISK' THEN 1 ELSE 0 END) as at_risk_clients,
          SUM(CASE WHEN current_risk_level = 'CRITICAL' THEN 1 ELSE 0 END) as critical_clients
        FROM clients
      `);

      // 2. Check-in Metrics (Today & Missed)
      const checkinStats = await db.getOne(`
        SELECT 
          COUNT(*) as total_checkins,
          SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END) as received_checkins,
          SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) as missed_checkins,
          SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as pending_checkins
        FROM check_ins
      `);

      // 3. Active Risk Alerts
      const activeAlerts = await db.query(`
        SELECT ra.*, c.full_name as client_name, c.phone_number, c.location
        FROM risk_alerts ra
        JOIN clients c ON ra.client_id = c.id
        WHERE ra.status = 'active'
        ORDER BY ra.risk_score DESC, ra.created_at DESC
        LIMIT 5
      `);

      // 4. Employment & Mobile Money Placements Summary
      const employmentStats = await db.getOne(`
        SELECT 
          (SELECT COUNT(*) FROM jobs WHERE status = 'open') as open_jobs,
          (SELECT COUNT(*) FROM job_applications WHERE status IN ('accepted', 'completed')) as placements_count,
          (SELECT COUNT(*) FROM payments WHERE status = 'successful') as payments_count,
          (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'successful') as total_disbursed
        FROM system_settings LIMIT 1
      `);

      // 5. Weekly Check-In Trend (Last 4 Weeks)
      const weeklyTrend = [
        { week: 'Week 1', completed: 11, missed: 1, struggling: 1 },
        { week: 'Week 2', completed: 10, missed: 2, struggling: 2 },
        { week: 'Week 3', completed: 12, missed: 0, struggling: 2 },
        { week: 'Week 4', completed: 9, missed: 2, struggling: 3 }
      ];

      // 6. Recovery Status Distribution (Pie Chart)
      const recoveryDistribution = [
        { name: 'Stable (0-29)', value: parseInt(clientStats.stable_clients || 0, 10), color: '#10b981' },
        { name: 'Monitor (30-49)', value: parseInt(clientStats.monitor_clients || 0, 10), color: '#f59e0b' },
        { name: 'At Risk (50-74)', value: parseInt(clientStats.at_risk_clients || 0, 10), color: '#f97316' },
        { name: 'Critical (75-100)', value: parseInt(clientStats.critical_clients || 0, 10), color: '#ef4444' }
      ];

      // 7. Live Activity Feed (Combined from SMS, Interventions, Jobs, Payments)
      const recentSms = await db.query(`
        SELECT sm.id, sm.message_text, sm.direction, sm.created_at, sm.phone_number,
               c.full_name as client_name, 'sms' as activity_type
        FROM sms_messages sm
        LEFT JOIN clients c ON sm.client_id = c.id
        ORDER BY sm.created_at DESC LIMIT 6
      `);

      const recentInterventions = await db.query(`
        SELECT i.id, i.type, i.description, i.created_at, c.full_name as client_name,
               'intervention' as activity_type
        FROM interventions i
        JOIN clients c ON i.client_id = c.id
        ORDER BY i.created_at DESC LIMIT 4
      `);

      const recentPayments = await db.query(`
        SELECT p.id, p.amount, p.currency, p.transaction_reference, p.created_at,
               c.full_name as client_name, 'payment' as activity_type
        FROM payments p
        JOIN clients c ON p.client_id = c.id
        ORDER BY p.created_at DESC LIMIT 3
      `);

      return res.json({
        success: true,
        data: {
          cards: {
            totalClients: parseInt(clientStats.total_clients || 0, 10),
            activeClients: parseInt(clientStats.active_clients || 0, 10),
            stable: parseInt(clientStats.stable_clients || 0, 10),
            monitor: parseInt(clientStats.monitor_clients || 0, 10),
            atRisk: parseInt(clientStats.at_risk_clients || 0, 10),
            critical: parseInt(clientStats.critical_clients || 0, 10),
            receivedCheckins: parseInt(checkinStats.received_checkins || 0, 10),
            missedCheckins: parseInt(checkinStats.missed_checkins || 0, 10),
            openJobs: parseInt(employmentStats ? employmentStats.open_jobs : 0, 10),
            placementsCount: parseInt(employmentStats ? employmentStats.placements_count : 0, 10),
            totalDisbursed: parseFloat(employmentStats ? employmentStats.total_disbursed : 0)
          },
          charts: {
            recoveryDistribution,
            weeklyTrend
          },
          activeAlerts: activeAlerts.rows,
          liveFeed: {
            sms: recentSms.rows,
            interventions: recentInterventions.rows,
            payments: recentPayments.rows
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DashboardController;
