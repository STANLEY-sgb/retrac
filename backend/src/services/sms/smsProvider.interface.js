class SmsProvider {
  /**
   * Send outbound SMS
   * @param {string} to - Recipient phone number (+256...)
   * @param {string} message - Text message content
   * @returns {Promise<{ success: boolean, messageId: string, provider: string, rawResponse: any }>}
   */
  async sendSms(to, message) {
    throw new Error('sendSms() must be implemented by concrete SmsProvider');
  }
}

module.exports = SmsProvider;
