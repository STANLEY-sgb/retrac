const db = require('../database/db');
const RiskEngine = require('../services/risk/riskEngine');

class RiskController {
  /**
   * Get all active and historical risk alerts
   */
  static async getAlerts(req, res, next) {
    try {
      const { status = 'active', limit = 50, offset = 0 } = req.query;

      let sql = `
        SELECT ra.*, c.full_name as client_name, c.phone_number, c.location, c.treatment_centre,
               cw.full_name as caseworker_name
        FROM risk_alerts ra
        JOIN clients c ON ra.client_id = c.id
        LEFT JOIN caseworkers cw ON ra.caseworker_id = cw.id
        WHERE 1=1
      `;
      const params = [];
      let pIndex = 1;

      if (status && status !== 'all') {
        sql += ` AND ra.status = $${pIndex++}`;
        params.push(status);
      }

      sql += ` ORDER BY ra.created_at DESC LIMIT $${pIndex++} OFFSET $${pIndex++}`;
      params.push(parseInt(limit, 10), parseInt(offset, 10));

      const result = await db.query(sql, params);

      const parsedAlerts = result.rows.map(a => ({
        ...a,
        reasons: typeof a.reasons === 'string' ? JSON.parse(a.reasons) : a.reasons
      }));

      return res.json({
        success: true,
        data: {
          alerts: parsedAlerts
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Resolve an active risk alert by Alert ID or Client ID
   */
  static async resolveAlert(req, res, next) {
    try {
      const { alertId, clientId } = req.params;
      const { resolutionNotes } = req.body;

      let targetAlertId = alertId;

      // If resolving by clientId
      if (clientId && !targetAlertId) {
        const active = await db.getOne(
          "SELECT id FROM risk_alerts WHERE client_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1",
          [clientId]
        );
        if (!active) {
          return res.status(404).json({
            success: false,
            message: 'No active risk alert found for this client.',
            code: 'NO_ACTIVE_ALERT'
          });
        }
        targetAlertId = active.id;
      }

      const result = await RiskEngine.resolveRiskAlert(
        targetAlertId,
        req.user ? req.user.id : null,
        resolutionNotes || 'Caseworker follow-up intervention completed.'
      );

      return res.json({
        success: true,
        message: 'Risk alert resolved successfully and client score updated.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = RiskController;
