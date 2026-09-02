const dotenv = require('dotenv');
dotenv.config();

const db = require('../database/db');
const CheckinCron = require('../services/scheduler/checkinCron');

async function main() {
  db.initDatabase();
  const result = await CheckinCron.runWeeklyCheckinBroadcast();
  console.log('Cron Job Result:', JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal Cron Error:', err);
  process.exit(1);
});
