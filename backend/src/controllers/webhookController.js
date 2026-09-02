const SmsService = require('../services/sms/smsService');

class WebhookController {
  /**
   * Africa's Talking / Standard SMS Inbound Webhook
   * Africa's Talking posts: { from: '+256...', text: '...', to: '...', date: '...', id: '...' }
   */
  static async handleIncomingSms(req, res, next) {
    try {
      const from = req.body.from || req.body.phoneNumber || req.query.from;
      const text = req.body.text || req.body.message || req.query.text;

      if (!from || !text) {
        return res.status(400).json({
          success: false,
          message: 'Missing required webhook fields (from, text).'
        });
      }

      const result = await SmsService.processIncomingSms({
        from,
        text,
        provider: 'africastalking'
      });

      // Africa's Talking expects standard 200 OK or 201 Created
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = WebhookController;
