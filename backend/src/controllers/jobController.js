const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const AuditService = require('../services/audit/auditService');

class JobController {
  /**
   * Get all jobs with filters
   */
  static async getJobs(req, res, next) {
    try {
      const { status, category, location, search, employerId, limit = 50, offset = 0 } = req.query;

      let sql = `
        SELECT j.*, e.company_name, e.contact_person, e.phone as employer_phone, e.location as employer_location
        FROM jobs j
        JOIN employers e ON j.employer_id = e.id
        WHERE 1=1
      `;
      const params = [];
      let pIndex = 1;

      if (status) {
        sql += ` AND j.status = $${pIndex++}`;
        params.push(status);
      }
      if (category) {
        sql += ` AND j.preferred_job_category = $${pIndex++}`;
        params.push(category);
      }
      let effectiveEmployerId = employerId;
      if (!effectiveEmployerId && req.user && req.user.role === 'employer' && (req.query.scope === 'mine' || req.query.mine === 'true')) {
        const emp = await db.getOne('SELECT id FROM employers WHERE user_id = $1', [req.user.id]);
        if (emp) effectiveEmployerId = emp.id;
      }

      if (effectiveEmployerId) {
        sql += ` AND j.employer_id = $${pIndex++}`;
        params.push(effectiveEmployerId);
      }
      if (search) {
        sql += ` AND (j.title LIKE $${pIndex} OR j.description LIKE $${pIndex} OR j.location LIKE $${pIndex} OR e.company_name LIKE $${pIndex})`;
        params.push(`%${search}%`);
        pIndex++;
      }

      sql += ` ORDER BY j.created_at DESC LIMIT $${pIndex++} OFFSET $${pIndex++}`;
      params.push(parseInt(limit, 10), parseInt(offset, 10));

      const result = await db.query(sql, params);

      // Fetch skill tags for jobs
      const jobIds = result.rows.map(j => j.id);
      let skillsMap = {};

      if (jobIds.length > 0) {
        const skillsRes = await db.query(`
          SELECT js.job_id, s.id, s.name, s.category
          FROM job_skills js
          JOIN skills s ON js.skill_id = s.id
        `);
        skillsRes.rows.forEach(row => {
          if (!skillsMap[row.job_id]) skillsMap[row.job_id] = [];
          skillsMap[row.job_id].push({ id: row.id, name: row.name, category: row.category });
        });
      }

      const jobsWithSkills = result.rows.map(j => ({
        ...j,
        skills: skillsMap[j.id] || []
      }));

      const countRes = await db.getOne('SELECT COUNT(*) as total FROM jobs');

      return res.json({
        success: true,
        data: {
          jobs: jobsWithSkills,
          total: countRes ? parseInt(countRes.total, 10) : jobsWithSkills.length
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get single job by ID with applicants and match scores
   */
  static async getJobById(req, res, next) {
    try {
      const { id } = req.params;

      const job = await db.getOne(
        `SELECT j.*, e.company_name, e.contact_person, e.phone as employer_phone, e.email as employer_email, e.location as employer_location
         FROM jobs j
         JOIN employers e ON j.employer_id = e.id
         WHERE j.id = $1`,
        [id]
      );

      if (!job) {
        return res.status(404).json({
          success: false,
          message: `Job with ID '${id}' not found.`,
          code: 'JOB_NOT_FOUND'
        });
      }

      // Job Skills
      const skills = await db.query(
        `SELECT s.id, s.name, s.category
         FROM job_skills js
         JOIN skills s ON js.skill_id = s.id
         WHERE js.job_id = $1`,
        [id]
      );

      // Applications / Placements for this job
      const isEmployer = req.user && req.user.role === 'employer';
      const applications = await db.query(
        `SELECT ja.*, c.full_name as client_name, c.phone_number as client_phone, c.location as client_location, c.current_risk_level, c.current_risk_score
         FROM job_applications ja
         JOIN clients c ON ja.client_id = c.id
         WHERE ja.job_id = $1
         ORDER BY ja.match_score DESC, ja.created_at DESC`,
        [id]
      );

      // Fetch client skills
      const clientSkillsMap = {};
      const clientIds = [...new Set(applications.rows.map(r => r.client_id))];
      if (clientIds.length > 0) {
        const skRes = await db.query(
          `SELECT cs.client_id, s.name FROM client_skills cs JOIN skills s ON cs.skill_id = s.id`
        );
        skRes.rows.forEach(r => {
          if (!clientSkillsMap[r.client_id]) clientSkillsMap[r.client_id] = [];
          clientSkillsMap[r.client_id].push(r.name);
        });
      }

      const sanitizedApplications = applications.rows.map(row => {
        const candidateSkills = clientSkillsMap[row.client_id] || ['General Assistance'];
        if (isEmployer) {
          const names = (row.client_name || '').split(' ');
          const formattedName = names.length > 1 ? `${names[0]} ${names[1].charAt(0)}.` : names[0];
          return {
            id: row.id,
            job_id: row.job_id,
            client_id: row.client_id,
            candidate_name: formattedName,
            client_name: formattedName,
            client_location: row.client_location,
            client_phone: row.status === 'accepted' || row.status === 'completed' ? row.client_phone : 'Protected (Available upon hire)',
            skills: candidateSkills,
            availability: 'Full-time / Ready',
            match_score: row.match_score,
            status: row.status,
            applied_at: row.applied_at,
            accepted_at: row.accepted_at,
            completed_at: row.completed_at,
            notes: row.notes
          };
        }
        return {
          ...row,
          skills: candidateSkills,
          candidate_name: row.client_name
        };
      });

      return res.json({
        success: true,
        data: {
          job: {
            ...job,
            skills: skills.rows
          },
          applications: sanitizedApplications
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Create New Job Post
   */
  static async createJob(req, res, next) {
    try {
      let employer_id = req.body.employer_id;
      if (!employer_id && req.user && req.user.role === 'employer') {
        const emp = await db.getOne('SELECT id FROM employers WHERE user_id = $1', [req.user.id]);
        if (emp) employer_id = emp.id;
      }
      if (!employer_id) employer_id = 'emp-01';
      const title = req.body.title;
      const description = req.body.description || 'Reintegration employment opportunity';
      const location = req.body.location;
      const pay_amount = req.body.pay_amount;
      const pay_currency = req.body.pay_currency || 'UGX';
      const pay_frequency = req.body.pay_frequency || 'daily';
      const employment_type = req.body.employment_type || 'casual';
      const preferred_job_category = req.body.preferred_job_category || req.body.category || 'Logistics & Retail';
      const vacancies = req.body.vacancies || 1;
      const skill_ids = req.body.skill_ids || req.body.required_skills || [];

      if (!title || !location || !pay_amount) {
        return res.status(400).json({
          success: false,
          message: 'Title, location, and pay amount are required.',
          code: 'VALIDATION_FAILED'
        });
      }

      const jobId = 'job-' + uuidv4().substring(0, 8);

      await db.run(
        `INSERT INTO jobs (
          id, employer_id, title, description, location, pay_amount,
          pay_currency, pay_frequency, employment_type, preferred_job_category,
          status, vacancies, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'open', $11, datetime('now'), datetime('now'))`,
        [
          jobId, employer_id, title, description, location, parseFloat(pay_amount),
          pay_currency, pay_frequency, employment_type, preferred_job_category, parseInt(vacancies, 10)
        ]
      );

      // Link skills
      if (Array.isArray(skill_ids)) {
        for (const skillId of skill_ids) {
          await db.run(
            'INSERT INTO job_skills (job_id, skill_id, is_required) VALUES ($1, $2, 1) ON CONFLICT (job_id, skill_id) DO NOTHING',
            [jobId, skillId]
          );
        }
      }

      await AuditService.log({
        userId: req.user ? req.user.id : null,
        userName: req.user ? req.user.name : 'Employer',
        action: 'JOB_POSTED',
        entityType: 'JOB',
        entityId: jobId,
        metadata: { title, pay_amount, location }
      });

      return res.status(201).json({
        success: true,
        message: 'Job posted successfully.',
        data: { id: jobId, title, status: 'open' }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update or Close Job
   */
  static async updateJob(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, location, pay_amount, status, vacancies } = req.body;

      const job = await db.getOne('SELECT * FROM jobs WHERE id = $1', [id]);
      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found.', code: 'JOB_NOT_FOUND' });
      }

      await db.run(
        `UPDATE jobs 
         SET title = $1, description = $2, location = $3, pay_amount = $4,
             status = $5, vacancies = $6, updated_at = datetime('now')
         WHERE id = $7`,
        [
          title || job.title,
          description || job.description,
          location || job.location,
          pay_amount !== undefined ? parseFloat(pay_amount) : job.pay_amount,
          status || job.status,
          vacancies !== undefined ? parseInt(vacancies, 10) : job.vacancies,
          id
        ]
      );

      return res.json({ success: true, message: 'Job updated successfully.' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = JobController;
