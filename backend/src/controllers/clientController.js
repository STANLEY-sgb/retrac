const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const SmsService = require('../services/sms/smsService');
const JobMatchingService = require('../services/matching/jobMatchingService');
const AuditService = require('../services/audit/auditService');

class ClientController {
  /**
   * Get all clients with rich filtering, search, and sorting
   */
  static async getClients(req, res, next) {
    try {
      const { search, status, riskLevel, caseworkerId, skillId, sort = 'highest_risk', limit = 50, offset = 0 } = req.query;

      let sql = `
        SELECT c.*, cw.full_name as caseworker_name, cw.organization as caseworker_org
        FROM clients c
        LEFT JOIN caseworkers cw ON c.assigned_caseworker_id = cw.id
        WHERE 1=1
      `;
      const params = [];
      let pIndex = 1;

      if (search) {
        sql += ` AND (c.full_name LIKE $${pIndex} OR c.phone_number LIKE $${pIndex} OR c.treatment_centre LIKE $${pIndex} OR c.location LIKE $${pIndex})`;
        params.push(`%${search}%`);
        pIndex++;
      }

      if (status) {
        sql += ` AND c.status = $${pIndex++}`;
        params.push(status);
      }

      if (riskLevel) {
        sql += ` AND c.current_risk_level = $${pIndex++}`;
        params.push(riskLevel);
      }

      if (caseworkerId) {
        sql += ` AND c.assigned_caseworker_id = $${pIndex++}`;
        params.push(caseworkerId);
      }

      // Sorting
      if (sort === 'highest_risk') {
        sql += ' ORDER BY c.current_risk_score DESC, c.updated_at DESC';
      } else if (sort === 'lowest_risk') {
        sql += ' ORDER BY c.current_risk_score ASC, c.updated_at DESC';
      } else if (sort === 'newest') {
        sql += ' ORDER BY c.created_at DESC';
      } else if (sort === 'name') {
        sql += ' ORDER BY c.full_name ASC';
      } else {
        sql += ' ORDER BY c.current_risk_score DESC';
      }

      sql += ` LIMIT $${pIndex++} OFFSET $${pIndex++}`;
      params.push(parseInt(limit, 10), parseInt(offset, 10));

      const result = await db.query(sql, params);

      // Fetch client skills for each returned client
      const clientIds = result.rows.map(c => c.id);
      let skillsMap = {};

      if (clientIds.length > 0) {
        const skillsResult = await db.query(`
          SELECT cs.client_id, s.id as skill_id, s.name as skill_name, s.category
          FROM client_skills cs
          JOIN skills s ON cs.skill_id = s.id
        `);
        skillsResult.rows.forEach(row => {
          if (!skillsMap[row.client_id]) skillsMap[row.client_id] = [];
          skillsMap[row.client_id].push({ id: row.skill_id, name: row.skill_name, category: row.category });
        });
      }

      const clientsWithSkills = result.rows.map(c => ({
        ...c,
        skills: skillsMap[c.id] || []
      }));

      // Count total
      const countRes = await db.getOne('SELECT COUNT(*) as total FROM clients');

      return res.json({
        success: true,
        data: {
          clients: clientsWithSkills,
          total: countRes ? parseInt(countRes.total, 10) : clientsWithSkills.length
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get single client by ID with 360-degree recovery profile
   */
  static async getClientById(req, res, next) {
    try {
      const { id } = req.params;

      const client = await db.getOne(
        `SELECT c.*, cw.full_name as caseworker_name, cw.email as caseworker_email, cw.phone as caseworker_phone, cw.organization as caseworker_org
         FROM clients c
         LEFT JOIN caseworkers cw ON c.assigned_caseworker_id = cw.id
         WHERE c.id = $1`,
        [id]
      );

      if (!client) {
        return res.status(404).json({
          success: false,
          message: `Client with ID '${id}' not found.`,
          code: 'CLIENT_NOT_FOUND'
        });
      }

      // Skills
      const skills = await db.query(
        `SELECT s.id, s.name, s.category, cs.proficiency_level
         FROM client_skills cs
         JOIN skills s ON cs.skill_id = s.id
         WHERE cs.client_id = $1`,
        [id]
      );

      // Active Risk Alert & Reasons
      const activeAlert = await db.getOne(
        "SELECT * FROM risk_alerts WHERE client_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1",
        [id]
      );

      // Check-ins History (Latest 10)
      const checkins = await db.query(
        'SELECT * FROM check_ins WHERE client_id = $1 ORDER BY created_at DESC LIMIT 10',
        [id]
      );

      // Risk Score History (Latest 10)
      const riskHistory = await db.query(
        'SELECT * FROM risk_scores WHERE client_id = $1 ORDER BY calculated_at DESC LIMIT 10',
        [id]
      );

      // Interventions
      const interventions = await db.query(
        `SELECT i.*, cw.full_name as caseworker_name
         FROM interventions i
         LEFT JOIN caseworkers cw ON i.caseworker_id = cw.id
         WHERE i.client_id = $1
         ORDER BY i.performed_at DESC`,
        [id]
      );

      // Job Applications & Placements
      const applications = await db.query(
        `SELECT ja.*, j.title as job_title, j.location as job_location, j.pay_amount, j.pay_currency, e.company_name as employer_name
         FROM job_applications ja
         JOIN jobs j ON ja.job_id = j.id
         JOIN employers e ON j.employer_id = e.id
         WHERE ja.client_id = $1
         ORDER BY ja.created_at DESC`,
        [id]
      );

      // Payments
      const payments = await db.query(
        'SELECT * FROM payments WHERE client_id = $1 ORDER BY created_at DESC',
        [id]
      );

      return res.json({
        success: true,
        data: {
          client: {
            ...client,
            skills: skills.rows,
            activeAlert: activeAlert ? {
              ...activeAlert,
              reasons: typeof activeAlert.reasons === 'string' ? JSON.parse(activeAlert.reasons) : activeAlert.reasons
            } : null
          },
          checkins: checkins.rows,
          riskHistory: riskHistory.rows.map(r => ({
            ...r,
            reasons: typeof r.reasons === 'string' ? JSON.parse(r.reasons) : r.reasons
          })),
          interventions: interventions.rows,
          applications: applications.rows,
          payments: payments.rows
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Create New Client
   */
  static async createClient(req, res, next) {
    try {
      const {
        full_name,
        phone_number,
        gender = 'Unspecified',
        age,
        treatment_centre,
        enrollment_date = new Date().toISOString().split('T')[0],
        recovery_start_date = new Date().toISOString().split('T')[0],
        assigned_caseworker_id = 'cw-01',
        location,
        preferred_job_category,
        emergency_contact_name,
        emergency_contact_phone,
        notes,
        skill_ids = []
      } = req.body;

      if (!full_name || !phone_number || !treatment_centre || !location) {
        return res.status(400).json({
          success: false,
          message: 'Please provide full name, phone number, treatment centre, and location.',
          code: 'VALIDATION_FAILED'
        });
      }

      const normalizedPhone = SmsService.normalizePhoneNumber(phone_number);

      // Check duplicate phone
      const existing = await db.getOne('SELECT id FROM clients WHERE phone_number = $1', [normalizedPhone]);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `A client with phone number '${normalizedPhone}' already exists in ReTrac.`,
          code: 'PHONE_DUPLICATE'
        });
      }

      const clientId = 'cli-' + uuidv4().substring(0, 8);

      await db.run(
        `INSERT INTO clients (
          id, full_name, phone_number, gender, age, treatment_centre,
          enrollment_date, recovery_start_date, assigned_caseworker_id,
          current_risk_score, current_risk_level, status, location,
          preferred_job_category, emergency_contact_name, emergency_contact_phone, notes,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 10, 'STABLE', 'active', $10, $11, $12, $13, $14, datetime('now'), datetime('now'))`,
        [
          clientId, full_name, normalizedPhone, gender, age ? parseInt(age, 10) : null,
          treatment_centre, enrollment_date, recovery_start_date, assigned_caseworker_id,
          location, preferred_job_category, emergency_contact_name, emergency_contact_phone, notes
        ]
      );

      // Add skills
      if (Array.isArray(skill_ids)) {
        for (const skillId of skill_ids) {
          await db.run(
            `INSERT INTO client_skills (client_id, skill_id, proficiency_level)
             VALUES ($1, $2, 'intermediate')
             ON CONFLICT (client_id, skill_id) DO NOTHING`,
            [clientId, skillId]
          );
        }
      }

      // Initial risk log
      const scoreLogId = 'rsk-' + uuidv4().substring(0, 8);
      await db.run(
        `INSERT INTO risk_scores (id, client_id, score, level, reasons, trigger_event, calculated_at, created_at)
         VALUES ($1, $2, 10, 'STABLE', $3, 'CLIENT_ENROLLMENT', datetime('now'), datetime('now'))`,
        [scoreLogId, clientId, JSON.stringify(['Initial intake baseline score'])]
      );

      // Audit log
      await AuditService.log({
        userId: req.user ? req.user.id : null,
        userName: req.user ? req.user.name : 'Caseworker',
        action: 'CLIENT_CREATED',
        entityType: 'CLIENT',
        entityId: clientId,
        metadata: { full_name, phone_number: normalizedPhone, location }
      });

      return res.status(201).json({
        success: true,
        message: 'Client profile registered successfully.',
        data: { id: clientId, full_name, phone_number: normalizedPhone, status: 'active', current_risk_score: 10, current_risk_level: 'STABLE' }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update Client Details
   */
  static async updateClient(req, res, next) {
    try {
      const { id } = req.params;
      const {
        full_name,
        phone_number,
        gender,
        age,
        treatment_centre,
        assigned_caseworker_id,
        status,
        location,
        preferred_job_category,
        emergency_contact_name,
        emergency_contact_phone,
        notes,
        skill_ids
      } = req.body;

      const client = await db.getOne('SELECT * FROM clients WHERE id = $1', [id]);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found.',
          code: 'CLIENT_NOT_FOUND'
        });
      }

      const normalizedPhone = phone_number ? SmsService.normalizePhoneNumber(phone_number) : client.phone_number;

      await db.run(
        `UPDATE clients 
         SET full_name = $1, phone_number = $2, gender = $3, age = $4,
             treatment_centre = $5, assigned_caseworker_id = $6, status = $7,
             location = $8, preferred_job_category = $9, emergency_contact_name = $10,
             emergency_contact_phone = $11, notes = $12, updated_at = datetime('now')
         WHERE id = $13`,
        [
          full_name || client.full_name,
          normalizedPhone,
          gender || client.gender,
          age !== undefined ? parseInt(age, 10) : client.age,
          treatment_centre || client.treatment_centre,
          assigned_caseworker_id || client.assigned_caseworker_id,
          status || client.status,
          location || client.location,
          preferred_job_category || client.preferred_job_category,
          emergency_contact_name || client.emergency_contact_name,
          emergency_contact_phone || client.emergency_contact_phone,
          notes || client.notes,
          id
        ]
      );

      // Update skills if provided
      if (Array.isArray(skill_ids)) {
        await db.run('DELETE FROM client_skills WHERE client_id = $1', [id]);
        for (const skillId of skill_ids) {
          await db.run(
            'INSERT INTO client_skills (client_id, skill_id, proficiency_level) VALUES ($1, $2, \'intermediate\')',
            [id, skillId]
          );
        }
      }

      await AuditService.log({
        userId: req.user ? req.user.id : null,
        userName: req.user ? req.user.name : 'Caseworker',
        action: 'CLIENT_UPDATED',
        entityType: 'CLIENT',
        entityId: id,
        metadata: { full_name, status }
      });

      return res.json({
        success: true,
        message: 'Client updated successfully.'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get Top Job Matches for Client
   */
  static async getMatches(req, res, next) {
    try {
      const { id } = req.params;
      const result = await JobMatchingService.getMatchesForClient(id);
      return res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ClientController;
