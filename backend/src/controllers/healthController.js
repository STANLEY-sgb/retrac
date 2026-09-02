const config = require('../config/env');
const db = require('../database/db');

class HealthController {
  static async getHealth(req, res) {
    const dbHealth = await db.testConnection();
    const isHealthy = dbHealth.status === 'connected';

    const healthData = {
      status: isHealthy ? 'healthy' : 'degraded',
      application: 'ReTrac MVP Platform (DOMINION 2026)',
      version: '1.0.0',
      environment: config.NODE_ENV,
      demoMode: config.DEMO_MODE,
      database: dbHealth,
      providers: {
        sms: config.SMS_PROVIDER,
        ai: config.AI_PROVIDER,
        payment: config.PAYMENT_PROVIDER
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };

    return res.status(isHealthy ? 200 : 503).json(healthData);
  }
}

module.exports = HealthController;
