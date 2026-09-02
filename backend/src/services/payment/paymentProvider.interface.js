class PaymentProvider {
  /**
   * Initiate Mobile Money payout / disbursement
   * @param {object} params
   * @param {string} params.reference - Unique transaction reference (e.g. RTR-2026-000001)
   * @param {string} params.phoneNumber - Recipient mobile money number (+256...)
   * @param {number} params.amount - Amount in UGX
   * @param {string} params.reason - Disbursement reason/memo
   * @returns {Promise<{ success: boolean, status: string, transactionId: string, reference: string, provider: string, rawResponse: any }>}
   */
  async transfer(params) {
    throw new Error('transfer() must be implemented by concrete PaymentProvider');
  }
}

module.exports = PaymentProvider;
