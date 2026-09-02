const app = require('./app');
const config = require('./config/env');
const db = require('./database/db');
const { runMigrations } = require('./database/migrate');
const { seedDatabase } = require('./database/seed');

async function startServer() {
  try {
    console.log('🚀 Starting ReTrac Backend API Server...');
    
    // 1. Initialize Database & Run Initial Setup
    db.initDatabase();
    await runMigrations();

    // Check if seeding is needed (if no users exist)
    const userCount = await db.getOne('SELECT COUNT(*) as count FROM users');
    if (!userCount || parseInt(userCount.count, 10) === 0) {
      console.log('ℹ️ First time launch detected: seeding demonstration database...');
      await seedDatabase();
    }

    // 2. Start Listening
    const server = app.listen(config.PORT, () => {
      console.log(`=======================================================`);
      console.log(`✨ ReTrac Backend API running on port ${config.PORT}`);
      console.log(`🌐 Health endpoint: http://localhost:${config.PORT}/api/health`);
      console.log(`🧪 Demo Mode: ${config.DEMO_MODE ? 'ENABLED' : 'DISABLED'}`);
      console.log(`📱 SMS Provider: ${config.SMS_PROVIDER}`);
      console.log(`🤖 AI Provider: ${config.AI_PROVIDER}`);
      console.log(`💰 Payment Provider: ${config.PAYMENT_PROVIDER}`);
      console.log(`=======================================================`);
    });

    // Graceful Shutdown
    const shutdown = () => {
      console.log('🛑 Shutting down ReTrac server gracefully...');
      server.close(() => {
        console.log('👋 Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (err) {
    console.error('❌ Failed to start ReTrac server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
