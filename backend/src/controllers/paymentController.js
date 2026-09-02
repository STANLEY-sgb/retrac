const PaymentService = require('../services/payment/paymentService');

class PaymentController {
  /**
   * Trigger Mobile Money Payment / Stipend
   */
  static async triggerPayment(req, res, next) {
    try {
      const {
        applicationId,
        clientId,
        employerId,
        amount,
        currency = 'UGX',
        notes
      } = req.body;

      if (!clientId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Client ID and amount are required.',
          code: 'VALIDATION_FAILED'
        });
      }

      const result = await PaymentService.triggerPayment({
        applicationId,
        clientId,
        employerId,
        amount,
        currency,
        notes,
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
      const { clientId, employerId, status, limit = 50, offset = 0 } = req.query;
      const result = await PaymentService.getPayments({
        clientId,
        employerId,
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
