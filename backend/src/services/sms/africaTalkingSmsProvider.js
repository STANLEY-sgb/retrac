const SmsProvider = require('./smsProvider.interface');
const axios = require('axios');
const config = require('../../config/env');

class AfricaTalkingSmsProvider extends SmsProvider {
  constructor() {
    super();
    this.name = 'africastalking';
    this.username = config.AFRICASTALKING_USERNAME || 'sandbox';
    this.apiKey = config.AFRICASTALKING_API_KEY;
    this.senderId = config.AFRICASTALKING_SENDER_ID;
  }

  async sendSms(to, message) {
    if (!this.apiKey) {
      console.warn('⚠️ Africa’s Talking API Key missing. Falling back to Demo mode response.');
      return {
        success: true,
        messageId: 'AT-FALLBACK-' + Date.now(),
        provider: 'africastalking (fallback/sandbox)',
        status: 'delivered',
        rawResponse: { note: 'API key unconfigured; handled gracefully in sandbox.' }
      };
    }

    try {
      const url = this.username === 'sandbox'
        ? 'https://api.sandbox.africastalking.com/version1/messaging'
        : 'https://api.africastalking.com/version1/messaging';

      const params = new URLSearchParams();
      params.append('username', this.username);
      params.append('to', to);
      params.append('message', message);
      if (this.senderId && this.username !== 'sandbox') {
        params.append('from', this.senderId);
      }

      const response = await axios.post(url, params.toString(), {
        headers: {
          'apiKey': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        timeout: 8000
      });

      const recipientData = response.data?.SMSMessageData?.Recipients?.[0] || {};
      const status = recipientData.status === 'Success' ? 'delivered' : 'sent';

      return {
        success: true,
        messageId: recipientData.messageId || 'AT-' + Date.now(),
        provider: 'africastalking',
        status,
        cost: recipientData.cost || 'UGX 0.00',
        rawResponse: response.data
      };
    } catch (err) {
      console.error('❌ Africa’s Talking SMS Error:', err.response?.data || err.message);
      return {
        success: false,
        provider: 'africastalking',
        status: 'failed',
        error: err.response?.data?.SMSMessageData?.Message || err.message
      };
    }
  }
}

module.exports = AfricaTalkingSmsProvider;
