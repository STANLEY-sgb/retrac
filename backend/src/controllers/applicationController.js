const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const JobMatchingService = require('../services/matching/jobMatchingService');
const NotificationService = require('../services/notification/notificationService');
const AuditService = require('../services/audit/auditService');

class ApplicationController {
  /**
   * Match or Apply a client to a job
   */
  static async applyForJob(req, res, next) {
    try {
      const { id: jobId } = req.params;
      const { client_id, notes = 'Matched by caseworker via ReTrac algorithm' } = req.body;

      if (!client_id) {
        return res.status(400).json({
          success: false,
          message: 'Client ID is required.',
          code: 'CLIENT_ID_REQUIRED'
        });
      }

      const client = await db.getOne('SELECT * FROM clients WHERE id = $1', [client_id]);
      const job = await db.getOne('SELECT * FROM jobs WHERE id = $1', [jobId]);

      if (!client || !job) {
        return res.status(404).json({
          success: false,
          message: 'Client or Job not found.',
          code: 'ENTITY_NOT_FOUND'
        });
      }

      // Check existing application
      const existing = await db.getOne(
        'SELECT id, status FROM job_applications WHERE job_id = $1 AND client_id = $2',
        [jobId, client_id]
      );

      if (existing) {
        return res.json({
          success: true,
          message: 'Application already on file for this candidate.',
          data: existing
        });
      }

      // Calculate match score
      const clientSkills = await db.query(
        'SELECT s.id, s.name FROM client_skills cs JOIN skills s ON cs.skill_id = s.id WHERE cs.client_id = $1',
        [client_id]
      );
      const jobSkills = await db.query(
        'SELECT s.id, s.name FROM job_skills js JOIN skills s ON js.skill_id = s.id WHERE js.job_id = $1',
        [jobId]
      );

      const { matchScore } = JobMatchingService.calculateMatchScore(client, clientSkills.rows, job, jobSkills.rows);

      const appId = 'app-' + uuidv4().substring(0, 8);

      await db.run(
        `INSERT INTO job_applications (
          id, job_id, client_id, match_score, status, applied_at, notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, 'applied', datetime('now'), $5, datetime('now'), datetime('now'))`,
        [appId, jobId, client_id, matchScore, notes]
      );

      // Notify Employer
      const employer = await db.getOne('SELECT user_id FROM employers WHERE id = $1', [job.employer_id]);
      if (employer) {
        await NotificationService.createNotification({
          userId: employer.user_id,
          clientId: client.id,
          type: 'application_update',
          title: `📝 New Candidate: ${client.full_name} (${matchScore}% Match)`,
          message: `${client.full_name} applied for "${job.title}". Match Score: ${matchScore}%.`,
          metadata: { appId, jobId, clientId: client.id, matchScore }
        });
      }

      await AuditService.log({
        userId: req.user ? req.user.id : null,
        userName: req.user ? req.user.name : 'Caseworker',
        action: 'JOB_APPLICATION_SUBMITTED',
        entityType: 'APPLICATION',
        entityId: appId,
        metadata: { client: client.full_name, job: job.title, matchScore }
      });

      return res.status(201).json({
        success: true,
        message: 'Client successfully matched and applied for job.',
        data: {
          id: appId,
          jobId,
          clientId: client_id,
          matchScore,
          status: 'applied'
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update Application Status (accepted, rejected, in_progress, completed)
   */
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const app = await db.getOne(
        `SELECT ja.*, c.full_name as client_name, c.phone_number, j.title as job_title, j.pay_amount, j.employer_id
         FROM job_applications ja
         JOIN clients c ON ja.client_id = c.id
         JOIN jobs j ON ja.job_id = j.id
         WHERE ja.id = $1`,
        [id]
      );

      if (!app) {
        return res.status(404).json({ success: false, message: 'Application not found.', code: 'APP_NOT_FOUND' });
      }

      let acceptedAtClause = '';
      let completedAtClause = '';
      if (status === 'accepted') acceptedAtClause = ", accepted_at = datetime('now')";
      if (status === 'completed') completedAtClause = ", completed_at = datetime('now')";

      await db.run(
        `UPDATE job_applications 
         SET status = $1, notes = COALESCE($2, notes), updated_at = datetime('now') ${acceptedAtClause} ${completedAtClause}
         WHERE id = $3`,
        [status, notes, id]
      );

      // Notify Caseworker
      await NotificationService.broadcastToStaff({
        clientId: app.client_id,
        type: 'application_update',
        title: `💼 Application Status Updated: ${status.toUpperCase()}`,
        message: `${app.client_name}'s application for "${app.job_title}" changed to ${status}.`,
        metadata: { appId: id, status }
      });

      await AuditService.log({
        userId: req.user ? req.user.id : null,
        userName: req.user ? req.user.name : 'Employer',
        action: 'APPLICATION_STATUS_UPDATED',
        entityType: 'APPLICATION',
        entityId: id,
        metadata: { status, client: app.client_name, job: app.job_title }
      });

      return res.json({
        success: true,
        message: `Application status updated to ${status}.`,
        data: { id, status }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ApplicationController;
