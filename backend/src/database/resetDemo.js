const db = require('./db');
const { seedDatabase } = require('./seed');

async function resetDemo() {
  console.log('🧹 Resetting ReTrac demo environment to clean initial state...');
  db.initDatabase();

  const tables = [
    'audit_logs',
    'notifications',
    'payments',
    'job_applications',
    'job_skills',
    'jobs',
    'interventions',
    'risk_alerts',
    'risk_scores',
    'check_ins',
    'sms_messages',
    'client_skills',
    'clients',
    'skills',
    'employers',
    'caseworkers',
    'users',
    'system_settings'
  ];

  for (const table of tables) {
    try {
      await db.run(`DELETE FROM ${table}`);
    } catch (e) {
      // Ignore if table doesn't exist yet
    }
  }

  await seedDatabase();
  console.log('✨ Demo reset complete! Everything is ready for a fresh presentation or test.');
}

if (require.main === module) {
  resetDemo()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Reset failed:', err);
      process.exit(1);
    });
}

module.exports = { resetDemo };
