const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const RiskEngine = require('../services/risk/riskEngine');
const AuditService = require('../services/audit/auditService');

class InterventionController {
  /**
   * Get all interventions with search and filter
   */
  static async getInterventions(req, res, next) {
    try {
      const { clientId, type, outcome, limit = 50, offset = 0 } = req.query;

      let sql = `
        SELECT i.*, c.full_name as client_name, c.phone_number, cw.full_name as caseworker_name
        FROM interventions i
        JOIN clients c ON i.client_id = c.id
        LEFT JOIN caseworkers cw ON i.caseworker_id = cw.id
        WHERE 1=1
      `;
      const params = [];
      let pIndex = 1;

      if (clientId) {
        sql += ` AND i.client_id = $${pIndex++}`;
        params.push(clientId);
      }
      if (type) {
        sql += ` AND i.type = $${pIndex++}`;
        params.push(type);
      }
      if (outcome) {
        sql += ` AND i.outcome = $${pIndex++}`;
        params.push(outcome);
      }

      sql += ` ORDER BY i.performed_at DESC LIMIT $${pIndex++} OFFSET $${pIndex++}`;
      params.push(parseInt(limit, 10), parseInt(offset, 10));

      const result = await db.query(sql, params);

      return res.json({
        success: true,
        data: {
          interventions: result.rows
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Record a new Caseworker Intervention
   */
  static async recordIntervention(req, res, next) {
    try {
      const {
        client_id,
        type,
        description,
        action_taken,
        outcome = 'successful',
        notes,
        resolve_active_alert = true
      } = req.body;

      let caseworker_id = req.body.caseworker_id;
      if (!caseworker_id && req.user) {
        const cw = await db.getOne('SELECT id FROM caseworkers WHERE user_id = $1', [req.user.id]);
        if (cw) caseworker_id = cw.id;
      }
      if (!caseworker_id) caseworker_id = 'cw-01';

      if (!client_id || !type || !description || !action_taken) {
        return res.status(400).json({
          success: false,
          message: 'Client ID, intervention type, description, and action taken are required.',
          code: 'VALIDATION_FAILED'
        });
      }

      const id = 'int-' + uuidv4().substring(0, 8);

      await db.run(
        `INSERT INTO interventions (id, client_id, caseworker_id, type, description, action_taken, outcome, notes, performed_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, datetime('now'), datetime('now'))`,
        [id, client_id, caseworker_id, type, description, action_taken, outcome, notes]
      );

      // If requested, resolve any active risk alert for this client
      let resolvedAlert = null;
      if (resolve_active_alert) {
        const active = await db.getOne(
          "SELECT id FROM risk_alerts WHERE client_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1",
          [client_id]
        );
        if (active) {
          resolvedAlert = await RiskEngine.resolveRiskAlert(
            active.id,
            req.user ? req.user.id : null,
            `Intervention completed (${type}): ${action_taken}`
          );
        }
      }

      await AuditService.log({
        userId: req.user ? req.user.id : null,
        userName: req.user ? req.user.name : 'Caseworker',
        action: 'INTERVENTION_RECORDED',
        entityType: 'INTERVENTION',
        entityId: id,
        metadata: { client_id, type, outcome }
      });

      return res.status(201).json({
        success: true,
        message: 'Intervention logged successfully.',
        data: {
          id,
          client_id,
          type,
          outcome,
          resolvedAlert
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = InterventionController;
