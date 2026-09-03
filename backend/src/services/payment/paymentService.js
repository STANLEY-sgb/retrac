const { v4: uuidv4 } = require('uuid');
const config = require('../../config/env');
const db = require('../../database/db');
const DemoPaymentProvider = require('./demoPaymentProvider');
const MtnMomoProvider = require('./mtnMomoProvider');
const AirtelMoneyProvider = require('./airtelMoneyProvider');
const NotificationService = require('../notification/notificationService');
const AuditService = require('../audit/auditService');

class PaymentService {
  /**
   * Get active Payment Provider
   */
  static getProvider() {
    if (config.PAYMENT_PROVIDER === 'mtn') {
      return new MtnMomoProvider();
    }
    if (config.PAYMENT_PROVIDER === 'airtel') {
      return new AirtelMoneyProvider();
    }
    return new DemoPaymentProvider();
  }

  /**
   * Generate official ReTrac Transaction Reference (e.g. RTR-2026-000042)
   */
  static async generateTransactionReference() {
    const countRes = await db.getOne('SELECT COUNT(*) as total FROM payments');
    const nextNum = (countRes ? parseInt(countRes.total, 10) : 0) + 1;
    const padded = String(nextNum).padStart(6, '0');
    return `RTR-2026-${padded}`;
  }

  /**
   * Main payment execution with safety workflow
   */
  static async triggerPayment({
    applicationId = null,
    clientId,
    employerId = null,
    amount,
    currency = 'UGX',
    notes = 'Reintegration work completion stipend',
    provider: requestedProvider = 'demo',
    user = null
  }) {
    // 1. Fetch Client
    const client = await db.getOne('SELECT * FROM clients WHERE id = $1', [clientId]);
    if (!client) {
      throw new Error(`Client with ID '${clientId}' not found.`);
    }

    // 2. Generate unique reference
    const reference = await this.generateTransactionReference();
    const paymentId = 'pay-' + uuidv4().substring(0, 8);

    // 3. Select provider & dispatch
    const provider = this.getProvider();
    const result = await provider.transfer({
      reference,
      phoneNumber: client.phone_number,
      amount: Number(amount),
      reason: notes
    });

    const isSuccess = result.status === 'successful';
    const status = isSuccess ? 'successful' : 'failed';
    const providerName = requestedProvider || provider.name;

    // Normalize to database CHECK constraint ('demo', 'mtn', 'airtel')
    let dbProvider = 'demo';
    const lowerProv = String(providerName).toLowerCase();
    if (lowerProv.includes('mtn')) dbProvider = 'mtn';
    else if (lowerProv.includes('airtel')) dbProvider = 'airtel';

    // 4. Save to payments table
    await db.run(
      `INSERT INTO payments (
        id, application_id, client_id, employer_id, amount, currency,
        payment_provider, transaction_reference, status, initiated_at,
        completed_at, provider_response, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, datetime('now'), datetime('now'), $10, $11, datetime('now'), datetime('now'))`,
      [
        paymentId,
        applicationId,
        clientId,
        employerId,
        amount,
        currency,
        dbProvider,
        reference,
        status,
        JSON.stringify(result.rawResponse || {}),
        notes
      ]
    );

    // 5. If application is linked, update application status to 'completed'
    if (applicationId) {
      await db.run(
        `UPDATE job_applications 
         SET status = 'completed', completed_at = datetime('now'), updated_at = datetime('now')
         WHERE id = $1`,
        [applicationId]
      );
    }

    // 5b. Automatically dispatch Mobile Money Receipt SMS to client's phone
    if (isSuccess && client.phone_number) {
      const receiptSms = `ReTrac MoMo: ${currency} ${Number(amount).toLocaleString()} has been credited for completed work. Ref: ${reference}. This is a simulated demo transaction.`;
      
      try {
        const SmsService = require('../sms/smsService');
        await SmsService.sendSms({
          clientId: client.id,
          to: client.phone_number,
          message: receiptSms
        });
      } catch (smsErr) {
        console.warn('⚠️ Could not dispatch payment receipt SMS to client:', smsErr.message);
      }
    }

    // 6. Broadcast notification
    const formattedAmount = `${currency} ${Number(amount).toLocaleString()}`;
    await NotificationService.broadcastToStaff({
      clientId: client.id,
      type: 'payment_update',
      title: `💰 Payment Disbursed: ${formattedAmount}`,
      message: `Mobile money payout ${reference} of ${formattedAmount} successfully transferred to ${client.full_name} (${client.phone_number}).`,
      metadata: { paymentId, reference, amount, recipient: client.full_name, provider: providerName }
    });

    // 7. Audit log
    await AuditService.log({
      userId: user ? user.id : null,
      userName: user ? user.name : 'PaymentService',
      action: 'PAYMENT_EXECUTED',
      entityType: 'PAYMENT',
      entityId: paymentId,
      metadata: {
        reference,
        amount,
        currency,
        client: client.full_name,
        provider: providerName,
        status
      }
    });

    return {
      success: isSuccess,
      paymentId,
      reference,
      status,
      amount,
      currency,
      recipient: {
        id: client.id,
        name: client.full_name,
        phone: client.phone_number
      },
      provider: providerName,
      notes,
      message: result.message || 'Payment processed successfully.'
    };
  }

  /**
   * Get payment history with filters
   */
  static async getPayments({ clientId = null, employerId = null, status = null, limit = 50, offset = 0 } = {}) {
    let sql = `
      SELECT p.*, c.full_name as client_name, c.phone_number as client_phone,
             e.company_name as employer_name, j.title as job_title
      FROM payments p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN employers e ON p.employer_id = e.id
      LEFT JOIN job_applications ja ON p.application_id = ja.id
      LEFT JOIN jobs j ON ja.job_id = j.id
      WHERE 1=1
    `;
    const params = [];
    let pIndex = 1;

    if (clientId) {
      sql += ` AND p.client_id = $${pIndex++}`;
      params.push(clientId);
    }
    if (employerId) {
      sql += ` AND p.employer_id = $${pIndex++}`;
      params.push(employerId);
    }
    if (status) {
      sql += ` AND p.status = $${pIndex++}`;
      params.push(status);
    }

    sql += ` ORDER BY p.created_at DESC LIMIT $${pIndex++} OFFSET $${pIndex++}`;
    params.push(limit, offset);

    const result = await db.query(sql, params);

    // Summary statistics
    let statsSql = `
      SELECT 
        COUNT(*) as total_count,
        SUM(CASE WHEN status = 'successful' THEN amount ELSE 0 END) as total_amount_paid,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'successful' THEN 1 ELSE 0 END) as successful_count,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count
      FROM payments
      WHERE 1=1
    `;
    const statsParams = [];
    if (employerId) {
      statsSql += ' AND employer_id = $1';
      statsParams.push(employerId);
    }
    const stats = await db.getOne(statsSql, statsParams);

    return {
      payments: result.rows,
      statistics: {
        totalCount: parseInt(stats.total_count || 0, 10),
        totalAmountPaid: parseFloat(stats.total_amount_paid || 0),
        pendingCount: parseInt(stats.pending_count || 0, 10),
        successfulCount: parseInt(stats.successful_count || 0, 10),
        failedCount: parseInt(stats.failed_count || 0, 10)
      }
    };
  }
}

module.exports = PaymentService;
