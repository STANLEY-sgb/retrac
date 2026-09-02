const db = require('../database/db');
const SmsService = require('../services/sms/smsService');
const CheckinCron = require('../services/scheduler/checkinCron');

class CheckinController {
  /**
   * Get all check-ins with filters
   */
  static async getCheckins(req, res, next) {
    try {
      const { clientId, status, responseCode, limit = 50, offset = 0 } = req.query;

      let sql = `
        SELECT chk.*, c.full_name as client_name, c.phone_number, c.current_risk_level, c.current_risk_score
        FROM check_ins chk
        JOIN clients c ON chk.client_id = c.id
        WHERE 1=1
      `;
      const params = [];
      let pIndex = 1;

      if (clientId) {
        sql += ` AND chk.client_id = $${pIndex++}`;
        params.push(clientId);
      }
      if (status) {
        sql += ` AND chk.status = $${pIndex++}`;
        params.push(status);
      }
      if (responseCode) {
        sql += ` AND chk.response_code = $${pIndex++}`;
        params.push(responseCode);
      }

      sql += ` ORDER BY chk.sent_at DESC LIMIT $${pIndex++} OFFSET $${pIndex++}`;
      params.push(parseInt(limit, 10), parseInt(offset, 10));

      const result = await db.query(sql, params);
      const countRes = await db.getOne('SELECT COUNT(*) as total FROM check_ins');

      return res.json({
        success: true,
        data: {
          checkins: result.rows,
          total: countRes ? parseInt(countRes.total, 10) : result.rows.length
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Manually trigger weekly check-in for a specific client
   */
  static async sendCheckinToClient(req, res, next) {
    try {
      const { clientId } = req.params;
      const result = await SmsService.sendWeeklyCheckin(clientId);
      return res.json({
        success: true,
        message: 'Weekly check-in SMS sent to client successfully.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Trigger batch check-in broadcast
   */
  static async triggerBatchCheckins(req, res, next) {
    try {
      const result = await CheckinCron.runWeeklyCheckinBroadcast();
      return res.json({
        success: true,
        message: `Batch check-in broadcast complete. ${result.sent} messages sent.`,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CheckinController;
