const SmsProvider = require('./smsProvider.interface');
const { v4: uuidv4 } = require('uuid');

class DemoSmsProvider extends SmsProvider {
  constructor() {
    super();
    this.name = 'demo';
  }

  async sendSms(to, message) {
    const messageId = 'DEMO-SMS-' + uuidv4().substring(0, 8);
    console.log(`📱 [DEMO SMS DISPATCH] To: ${to} | ID: ${messageId}`);
    console.log(`💬 Content: "${message}"`);

    return {
      success: true,
      messageId,
      provider: 'demo',
      status: 'delivered',
      cost: 'UGX 0.00 (Demo Mode)',
      rawResponse: {
        status: 'Success',
        simulatedRecipient: to,
        timestamp: new Date().toISOString()
      }
    };
  }
}

module.exports = DemoSmsProvider;
