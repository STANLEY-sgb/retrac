const db = require('../database/db');
const PaymentService = require('../services/payment/paymentService');

class PaymentController {
  /**
   * Trigger Mobile Money Payment / Stipend
   */
  static async triggerPayment(req, res, next) {
    try {
      const clientId = req.body.clientId || req.body.client_id;
      const applicationId = req.body.applicationId || req.body.application_id || null;
      let employerId = req.body.employerId || req.body.employer_id || null;
      const amount = req.body.amount;
      const currency = req.body.currency || 'UGX';
      const notes = req.body.notes || 'Reintegration work completion stipend';
      const provider = req.body.provider || req.body.network || 'demo';

      if (!clientId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Client ID and amount are required.',
          code: 'VALIDATION_FAILED'
        });
      }

      // If employer role, ensure employerId matches caller
      if (req.user && req.user.role === 'employer') {
        const emp = await db.getOne('SELECT id FROM employers WHERE user_id = $1', [req.user.id]);
        if (emp) employerId = emp.id;
      }

      const result = await PaymentService.triggerPayment({
        applicationId,
        clientId,
        employerId,
        amount,
        currency,
        notes,
        provider,
        user: req.user
      });

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get Payments History
   */
  static async getPayments(req, res, next) {
    try {
      const { clientId, status, limit = 50, offset = 0 } = req.query;
      let effectiveEmployerId = req.query.employerId;

      // Employer role can ONLY view payments associated with their own business
      if (req.user && req.user.role === 'employer') {
        const emp = await db.getOne('SELECT id FROM employers WHERE user_id = $1', [req.user.id]);
        effectiveEmployerId = emp ? emp.id : 'emp-unknown';
      }

      const result = await PaymentService.getPayments({
        clientId,
        employerId: effectiveEmployerId,
        status,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10)
      });

      return res.json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PaymentController;
