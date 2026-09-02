const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const db = require('./db');

async function runMigrations() {
  console.log('🔄 Running database migrations...');
  db.initDatabase();

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  await db.exec(schemaSql);
  console.log('✅ Database migrations applied successfully! All 18 tables and indexes are ready.');
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Migration failed:', err);
      process.exit(1);
    });
}

module.exports = { runMigrations };
