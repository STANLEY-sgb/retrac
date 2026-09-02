const PaymentProvider = require('./paymentProvider.interface');
const { v4: uuidv4 } = require('uuid');

class DemoPaymentProvider extends PaymentProvider {
  constructor() {
    super();
    this.name = 'demo';
  }

  async transfer({ reference, phoneNumber, amount, reason }) {
    console.log(`🧪 [DEMO PAYMENT] Disbursing UGX ${Number(amount).toLocaleString()} to ${phoneNumber} (${reason}) [Ref: ${reference}]`);
    
    // Simulate realistic transaction time
    await new Promise(resolve => setTimeout(resolve, 300));

    const externalId = 'MOMO-SIM-' + uuidv4().substring(0, 10).toUpperCase();

    return {
      success: true,
      status: 'successful',
      transactionId: externalId,
      reference,
      provider: 'demo (MTN/Airtel Sandbox)',
      amount,
      currency: 'UGX',
      recipient: phoneNumber,
      message: '🧪 DEMO MODE: Simulated mobile-money payout completed successfully.',
      rawResponse: {
        financialTransactionId: externalId,
        operator: phoneNumber.startsWith('+25677') || phoneNumber.startsWith('+25678') ? 'MTN Mobile Money' : 'Airtel Money',
        fee: 0,
        status: 'SUCCESSFUL',
        timestamp: new Date().toISOString()
      }
    };
  }
}

module.exports = DemoPaymentProvider;
