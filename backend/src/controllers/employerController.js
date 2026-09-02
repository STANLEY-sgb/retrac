const db = require('../database/db');

class EmployerController {
  /**
   * Get all registered employers
   */
  static async getEmployers(req, res, next) {
    try {
      const result = await db.query('SELECT * FROM employers ORDER BY company_name ASC');
      return res.json({
        success: true,
        data: { employers: result.rows }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get Employer Portal Dashboard Stats & Active Postings
   */
  static async getEmployerDashboard(req, res, next) {
    try {
      const { id } = req.params;

      const employer = await db.getOne('SELECT * FROM employers WHERE id = $1', [id]);
      if (!employer) {
        return res.status(404).json({ success: false, message: 'Employer not found', code: 'EMPLOYER_NOT_FOUND' });
      }

      // Open jobs
      const jobs = await db.query('SELECT * FROM jobs WHERE employer_id = $1 ORDER BY created_at DESC', [id]);

      // Applications received
      const applications = await db.query(
        `SELECT ja.*, j.title as job_title, c.full_name as client_name, c.phone_number as client_phone, c.location as client_location
         FROM job_applications ja
         JOIN jobs j ON ja.job_id = j.id
         JOIN clients c ON ja.client_id = c.id
         WHERE j.employer_id = $1
         ORDER BY ja.applied_at DESC`,
        [id]
      );

      // Payments made
      const payments = await db.query(
        `SELECT p.*, c.full_name as client_name, j.title as job_title
         FROM payments p
         JOIN clients c ON p.client_id = c.id
         LEFT JOIN job_applications ja ON p.application_id = ja.id
         LEFT JOIN jobs j ON ja.job_id = j.id
         WHERE p.employer_id = $1
         ORDER BY p.created_at DESC`,
        [id]
      );

      return res.json({
        success: true,
        data: {
          employer,
          stats: {
            openJobsCount: jobs.rows.filter(j => j.status === 'open').length,
            totalApplicationsCount: applications.rows.length,
            hiredCount: applications.rows.filter(a => a.status === 'accepted' || a.status === 'completed').length,
            completedCount: applications.rows.filter(a => a.status === 'completed').length,
            totalDisbursed: payments.rows.filter(p => p.status === 'successful').reduce((sum, p) => sum + parseFloat(p.amount), 0)
          },
          jobs: jobs.rows,
          applications: applications.rows,
          payments: payments.rows
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = EmployerController;
