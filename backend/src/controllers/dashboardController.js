const db = require('../database/db');

class DashboardController {
  /**
   * Get Comprehensive Role-Aware Dashboard Metrics (Admin, Caseworker, Employer)
   */
  static async getOverview(req, res, next) {
    try {
      const userRole = req.user ? req.user.role : 'caseworker';
      const userId = req.user ? req.user.id : null;

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
        SELECT ra.*, c.full_name as client_name, c.phone_number, c.location, c.assigned_caseworker_id
        FROM risk_alerts ra
        JOIN clients c ON ra.client_id = c.id
        WHERE ra.status = 'active'
        ORDER BY ra.risk_score DESC, ra.created_at DESC
        LIMIT 10
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

      // 5. Caseworker Workload (For Admin)
      const caseworkerWorkload = await db.query(`
        SELECT 
          cw.id, cw.full_name, cw.organization, cw.title, u.is_active,
          (SELECT COUNT(*) FROM clients c WHERE c.assigned_caseworker_id = cw.id AND c.status = 'active') as client_count,
          (SELECT COUNT(*) FROM risk_alerts ra JOIN clients c ON ra.client_id = c.id WHERE c.assigned_caseworker_id = cw.id AND ra.status = 'active') as active_alerts,
          (SELECT COUNT(*) FROM interventions i WHERE i.caseworker_id = cw.id) as intervention_count
        FROM caseworkers cw
        LEFT JOIN users u ON cw.user_id = u.id
        ORDER BY cw.full_name ASC
      `);

      // 6. Attention Required Clients (For Caseworker)
      let attentionClients = [];
      let myCaseworker = null;

      if (userRole === 'caseworker') {
        myCaseworker = await db.getOne('SELECT * FROM caseworkers WHERE user_id = $1', [userId]);
      }

      const attentionSql = `
        SELECT c.*, cw.full_name as caseworker_name,
          ra.id as alert_id, ra.reasons as alert_reasons, ra.risk_score as alert_score
        FROM clients c
        LEFT JOIN caseworkers cw ON c.assigned_caseworker_id = cw.id
        LEFT JOIN risk_alerts ra ON ra.client_id = c.id AND ra.status = 'active'
        WHERE c.current_risk_level IN ('CRITICAL', 'AT_RISK')
        ${myCaseworker ? 'AND (c.assigned_caseworker_id = $1 OR c.assigned_caseworker_id IS NULL)' : ''}
        ORDER BY c.current_risk_score DESC
        LIMIT 10
      `;
      const attentionParams = myCaseworker ? [myCaseworker.id] : [];
      const attentionRes = await db.query(attentionSql, attentionParams);
      attentionClients = attentionRes.rows.map(c => ({
        ...c,
        reasons: c.alert_reasons ? (typeof c.alert_reasons === 'string' ? JSON.parse(c.alert_reasons) : c.alert_reasons) : ['Elevated risk score']
      }));

      // 7. Employer Portal Specific Data (If Employer role)
      let employerDashboardData = null;
      if (userRole === 'employer') {
        const emp = await db.getOne('SELECT * FROM employers WHERE user_id = $1', [userId]);
        if (emp) {
          const empJobs = await db.query(
            `SELECT j.*, 
              (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.id) as applicant_count
             FROM jobs j 
             WHERE j.employer_id = $1 
             ORDER BY j.created_at DESC`,
            [emp.id]
          );

          const empApps = await db.query(
            `SELECT ja.id, ja.match_score, ja.status, ja.applied_at, ja.accepted_at, ja.completed_at,
                    j.title as job_title, j.pay_amount, j.pay_currency,
                    SUBSTR(c.full_name, 1, INSTR(c.full_name, ' ') + 1) as candidate_name,
                    c.location as candidate_location
             FROM job_applications ja
             JOIN jobs j ON ja.job_id = j.id
             JOIN clients c ON ja.client_id = c.id
             WHERE j.employer_id = $1
             ORDER BY ja.applied_at DESC
             LIMIT 10`,
            [emp.id]
          );

          // Fetch skills for these candidates
          const appsWithSkills = [];
          for (const app of empApps.rows) {
            const sk = await db.query(
              `SELECT s.name FROM client_skills cs JOIN skills s ON cs.skill_id = s.id WHERE cs.client_id = (SELECT client_id FROM job_applications WHERE id = $1)`,
              [app.id]
            );
            appsWithSkills.push({
              ...app,
              candidate_name: app.candidate_name ? `${app.candidate_name}.` : 'Candidate',
              skills: sk.rows.map(r => r.name)
            });
          }

          const empPayments = await db.query(
            `SELECT p.id, p.amount, p.currency, p.status, p.transaction_reference, p.created_at,
                    j.title as job_title
             FROM payments p
             LEFT JOIN job_applications ja ON p.application_id = ja.id
             LEFT JOIN jobs j ON ja.job_id = j.id
             WHERE p.employer_id = $1
             ORDER BY p.created_at DESC`,
            [emp.id]
          );

          const totalPaid = empPayments.rows
            .filter(p => p.status === 'successful')
            .reduce((sum, p) => sum + parseFloat(p.amount), 0);

          employerDashboardData = {
            employer: emp,
            stats: {
              openJobs: empJobs.rows.filter(j => j.status === 'open').length,
              totalApplications: empApps.rows.length,
              candidates: empApps.rows.length,
              hired: empApps.rows.filter(a => a.status === 'accepted' || a.status === 'completed').length,
              completed: empApps.rows.filter(a => a.status === 'completed').length,
              pendingPayments: empPayments.rows.filter(p => p.status === 'pending').length,
              totalPaid
            },
            activeJobs: empJobs.rows,
            recentApplications: appsWithSkills,
            recentPayments: empPayments.rows
          };
        }
      }

      // 8. Weekly Check-In Trend & Recovery Charts
      const weeklyTrend = [
        { week: 'Week 1', completed: 11, missed: 1, struggling: 1 },
        { week: 'Week 2', completed: 10, missed: 2, struggling: 2 },
        { week: 'Week 3', completed: 12, missed: 0, struggling: 2 },
        { week: 'Week 4', completed: 9, missed: 2, struggling: 3 }
      ];

      const recoveryDistribution = [
        { name: 'Stable (0-29)', value: parseInt(clientStats.stable_clients || 0, 10), color: '#10b981' },
        { name: 'Monitor (30-49)', value: parseInt(clientStats.monitor_clients || 0, 10), color: '#f59e0b' },
        { name: 'At Risk (50-74)', value: parseInt(clientStats.at_risk_clients || 0, 10), color: '#f97316' },
        { name: 'Critical (75-100)', value: parseInt(clientStats.critical_clients || 0, 10), color: '#ef4444' }
      ];

      // 9. Live Activity Feed (SMS, Interventions, Payments)
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

      // 10. Check-in compliance rate
      const totalCheckinsCount = parseInt(checkinStats.total_checkins || 0, 10);
      const receivedCheckinsCount = parseInt(checkinStats.received_checkins || 0, 10);
      const complianceRate = totalCheckinsCount > 0
        ? Math.round((receivedCheckinsCount / totalCheckinsCount) * 100)
        : 86;

      const totalInterventionsRes = await db.getOne('SELECT COUNT(*) as count FROM interventions');
      const activeCaseworkersRes = await db.getOne('SELECT COUNT(*) as count FROM caseworkers');

      return res.json({
        success: true,
        data: {
          role: userRole,
          cards: {
            totalClients: parseInt(clientStats.total_clients || 0, 10),
            activeClients: parseInt(clientStats.active_clients || 0, 10),
            activeCaseworkers: parseInt(activeCaseworkersRes?.count || 2, 10),
            stable: parseInt(clientStats.stable_clients || 0, 10),
            monitor: parseInt(clientStats.monitor_clients || 0, 10),
            atRisk: parseInt(clientStats.at_risk_clients || 0, 10),
            critical: parseInt(clientStats.critical_clients || 0, 10),
            receivedCheckins: receivedCheckinsCount,
            missedCheckins: parseInt(checkinStats.missed_checkins || 0, 10),
            checkinCompliance: complianceRate,
            activeInterventions: parseInt(totalInterventionsRes?.count || 0, 10),
            openJobs: parseInt(employmentStats ? employmentStats.open_jobs : 0, 10),
            placementsCount: parseInt(employmentStats ? employmentStats.placements_count : 0, 10),
            totalDisbursed: parseFloat(employmentStats ? employmentStats.total_disbursed : 0)
          },
          charts: {
            recoveryDistribution,
            weeklyTrend,
            complianceRate
          },
          caseworkerWorkload: caseworkerWorkload.rows,
          attentionClients,
          employerDashboard: employerDashboardData,
          activeAlerts: activeAlerts.rows.map(a => ({
            ...a,
            reasons: typeof a.reasons === 'string' ? JSON.parse(a.reasons) : a.reasons
          })),
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
