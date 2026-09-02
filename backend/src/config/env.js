const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'retrac_jwt_super_secret_session_key_2026_dominion',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  DEMO_MODE: process.env.DEMO_MODE !== 'false',
  CRON_SECRET: process.env.CRON_SECRET || 'retrac_internal_cron_secret_key_2026',

  // Providers
  SMS_PROVIDER: process.env.SMS_PROVIDER || 'demo',
  AFRICASTALKING_USERNAME: process.env.AFRICASTALKING_USERNAME || 'sandbox',
  AFRICASTALKING_API_KEY: process.env.AFRICASTALKING_API_KEY || '',
  AFRICASTALKING_SENDER_ID: process.env.AFRICASTALKING_SENDER_ID || 'RETRAC',

  AI_PROVIDER: process.env.AI_PROVIDER || 'demo',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',

  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER || 'demo',
  MTN_MOMO_API_KEY: process.env.MTN_MOMO_API_KEY || '',
  MTN_MOMO_API_SECRET: process.env.MTN_MOMO_API_SECRET || '',
  MTN_MOMO_PRIMARY_KEY: process.env.MTN_MOMO_PRIMARY_KEY || '',
  AIRTEL_MONEY_CLIENT_ID: process.env.AIRTEL_MONEY_CLIENT_ID || '',
  AIRTEL_MONEY_CLIENT_SECRET: process.env.AIRTEL_MONEY_CLIENT_SECRET || ''
};
