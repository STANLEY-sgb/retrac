const db = require('../database/db');

class ReportController {
  /**
   * Get Comprehensive System & Recovery Analytics
   */
  static async getOverview(req, res, next) {
    try {
      const clientStats = await db.getOne(`
        SELECT 
          COUNT(*) as total_enrolled,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
          SUM(CASE WHEN status = 'lost_contact' THEN 1 ELSE 0 END) as lost_contact_count,
          SUM(CASE WHEN current_risk_level = 'STABLE' THEN 1 ELSE 0 END) as stable_count,
          SUM(CASE WHEN current_risk_level = 'MONITOR' THEN 1 ELSE 0 END) as monitor_count,
          SUM(CASE WHEN current_risk_level = 'AT_RISK' THEN 1 ELSE 0 END) as at_risk_count,
          SUM(CASE WHEN current_risk_level = 'CRITICAL' THEN 1 ELSE 0 END) as critical_count
        FROM clients
      `);

      const checkinStats = await db.getOne(`
        SELECT 
          COUNT(*) as total_sent,
          SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END) as total_received,
          SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) as total_missed
        FROM check_ins
      `);

      const interventionStats = await db.getOne(`
        SELECT 
          COUNT(*) as total_interventions,
          SUM(CASE WHEN outcome = 'successful' THEN 1 ELSE 0 END) as successful_interventions
        FROM interventions
      `);

      const employmentStats = await db.getOne(`
        SELECT 
          (SELECT COUNT(*) FROM jobs) as total_jobs_posted,
          (SELECT COUNT(*) FROM jobs WHERE status = 'open') as open_jobs,
          (SELECT COUNT(*) FROM job_applications WHERE status = 'completed') as completed_placements,
          (SELECT COUNT(*) FROM payments WHERE status = 'successful') as total_payouts,
          (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'successful') as total_disbursed_ugx
        FROM system_settings LIMIT 1
      `);

      const totalSent = parseInt(checkinStats.total_sent || 0, 10);
      const totalReceived = parseInt(checkinStats.total_received || 0, 10);
      const completionRate = totalSent > 0 ? Math.round((totalReceived / totalSent) * 100) : 100;

      return res.json({
        success: true,
        data: {
          clients: {
            totalEnrolled: parseInt(clientStats.total_enrolled || 0, 10),
            active: parseInt(clientStats.active_count || 0, 10),
            completed: parseInt(clientStats.completed_count || 0, 10),
            lostContact: parseInt(clientStats.lost_contact_count || 0, 10),
            stable: parseInt(clientStats.stable_count || 0, 10),
            monitor: parseInt(clientStats.monitor_count || 0, 10),
            atRisk: parseInt(clientStats.at_risk_count || 0, 10),
            critical: parseInt(clientStats.critical_count || 0, 10)
          },
          checkins: {
            totalSent,
            totalReceived,
            totalMissed: parseInt(checkinStats.total_missed || 0, 10),
            completionRate
          },
          interventions: {
            total: parseInt(interventionStats.total_interventions || 0, 10),
            successful: parseInt(interventionStats.successful_interventions || 0, 10)
          },
          employment: {
            jobsPosted: parseInt(employmentStats.total_jobs_posted || 0, 10),
            openJobs: parseInt(employmentStats.open_jobs || 0, 10),
            placementsFilled: parseInt(employmentStats.completed_placements || 0, 10),
            totalPayouts: parseInt(employmentStats.total_payouts || 0, 10),
            totalDisbursedUgx: parseFloat(employmentStats.total_disbursed_ugx || 0)
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Export Clients & Recovery Status as CSV
   */
  static async exportCsv(req, res, next) {
    try {
      const clients = await db.query(`
        SELECT c.full_name, c.phone_number, c.gender, c.age, c.treatment_centre,
               c.enrollment_date, c.recovery_start_date, c.current_risk_score,
               c.current_risk_level, c.status, c.location, c.preferred_job_category,
               cw.full_name as caseworker_name
        FROM clients c
        LEFT JOIN caseworkers cw ON c.assigned_caseworker_id = cw.id
        ORDER BY c.full_name ASC
      `);

      let csv = 'Full Name,Phone Number,Gender,Age,Treatment Centre,Enrollment Date,Recovery Start Date,Risk Score,Risk Level,Status,Location,Preferred Job Category,Caseworker\n';

      clients.rows.forEach(c => {
        const row = [
          `"${c.full_name}"`,
          `"${c.phone_number}"`,
          `"${c.gender || ''}"`,
          c.age || '',
          `"${c.treatment_centre || ''}"`,
          c.enrollment_date,
          c.recovery_start_date,
          c.current_risk_score,
          c.current_risk_level,
          c.status,
          `"${c.location}"`,
          `"${c.preferred_job_category || ''}"`,
          `"${c.caseworker_name || ''}"`
        ];
        csv += row.join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="retrac_recovery_report_2026.csv"');
      return res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ReportController;
