const db = require('../database/db');
const SmsService = require('../services/sms/smsService');
const PaymentService = require('../services/payment/paymentService');
const { resetDemo } = require('../database/resetDemo');

class DemoController {
  /**
   * Simulate Inbound SMS through the EXACT same backend pipeline as the real webhook
   */
  static async simulateSms(req, res, next) {
    try {
      const { clientId, message } = req.body;

      if (!clientId || !message) {
        return res.status(400).json({
          success: false,
          message: 'Client ID and message text are required.',
          code: 'VALIDATION_FAILED'
        });
      }

      const client = await db.getOne('SELECT phone_number, full_name FROM clients WHERE id = $1', [clientId]);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found.',
          code: 'CLIENT_NOT_FOUND'
        });
      }

      // Execute identical business logic pipeline
      const pipelineResult = await SmsService.processIncomingSms({
        from: client.phone_number,
        text: message,
        provider: 'demo'
      });

      return res.status(200).json({
        success: true,
        message: 'Simulated SMS executed through real backend pipeline successfully.',
        data: {
          clientName: client.full_name,
          clientPhone: client.phone_number,
          sentText: message,
          pipelineResult
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get SMS History for a client
   */
  static async getSmsHistory(req, res, next) {
    try {
      const { clientId } = req.params;
      const client = await db.getOne('SELECT id, full_name, phone_number, current_risk_level, current_risk_score FROM clients WHERE id = $1', [clientId]);
      if (!client) {
        return res.status(404).json({ success: false, message: 'Client not found.' });
      }

      const messages = await db.query(
        'SELECT * FROM sms_messages WHERE client_id = $1 OR phone_number = $2 ORDER BY created_at ASC',
        [client.id, client.phone_number]
      );

      const checkins = await db.query(
        'SELECT * FROM check_ins WHERE client_id = $1 ORDER BY created_at DESC LIMIT 5',
        [client.id]
      );

      return res.json({
        success: true,
        data: {
          client,
          messages: messages.rows,
          checkins: checkins.rows
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Reset SMS messages for a client
   */
  static async resetClientSms(req, res, next) {
    try {
      const { clientId } = req.params;
      const client = await db.getOne('SELECT id, phone_number FROM clients WHERE id = $1', [clientId]);
      if (!client) {
        return res.status(404).json({ success: false, message: 'Client not found.' });
      }

      await db.run(
        'DELETE FROM sms_messages WHERE client_id = $1 OR phone_number = $2',
        [client.id, client.phone_number]
      );

      return res.json({
        success: true,
        message: 'Client SMS conversation reset successfully.'
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Simulate Mobile Money Payment
   */
  static async simulatePayment(req, res, next) {
    try {
      const { clientId, amount = 20000, notes = 'Simulated demo work completion stipend', provider = 'demo', applicationId = null } = req.body;

      const result = await PaymentService.triggerPayment({
        clientId,
        applicationId,
        amount,
        notes,
        provider,
        user: req.user
      });

      return res.json({
        success: true,
        message: 'Simulated payout executed successfully.',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Reset Demo State
   */
  static async resetDemoState(req, res, next) {
    try {
      await resetDemo();
      return res.json({
        success: true,
        message: 'Demo database reset to initial pristine state successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DemoController;
