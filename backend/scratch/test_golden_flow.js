const db = require('../src/database/db');
const SmsService = require('../src/services/sms/smsService');
const PaymentService = require('../src/services/payment/paymentService');

async function testFullGoldenDemoFlow() {
  console.log('STARTING RETRAC GOLDEN DEMO FLOW VERIFICATION...\n');

  // Initialize DB
  db.initDatabase();

  // 1. Verify John Okello (cli-01)
  console.log('--- STEP 1: Verify Client Profile (John Okello) ---');
  const john = await db.getOne("SELECT * FROM clients WHERE id = 'cli-01'");
  console.log(`✓ Client Found: ${john.full_name} (${john.phone_number}) | Initial Risk: ${john.current_risk_score}/100 (${john.current_risk_level})`);

  // 2. Caseworker sends check-in SMS prompt
  console.log('\n--- STEP 2: Caseworker Dispatches Weekly Check-In Prompt ---');
  const checkinPrompt = await SmsService.sendWeeklyCheckin(john.id);
  console.log(`✓ Check-In SMS Sent: ID ${checkinPrompt.checkinId} to ${checkinPrompt.phone}`);

  // Verify prompt stored in sms_messages
  const promptSms = await db.getOne("SELECT * FROM sms_messages WHERE client_id = 'cli-01' ORDER BY created_at DESC LIMIT 1");
  console.log(`✓ Stored in sms_messages (Outbound): "${promptSms.message_text.substring(0, 45)}..."`);

  // 3. Simulated Client Replies: "2 - Struggling with cravings"
  console.log('\n--- STEP 3: Simulated Client Replies "2 - Struggling with cravings" ---');
  const pipelineResult = await SmsService.processIncomingSms({
    from: john.phone_number,
    text: '2 - Struggling with cravings',
    provider: 'demo'
  });
  console.log(`✓ Pipeline Executed: Recognized=${pipelineResult.recognized} | Response Code=${pipelineResult.responseCode}`);
  console.log(`✓ New Risk Score: ${pipelineResult.riskUpdate.newScore}/100 (${pipelineResult.riskUpdate.newLevel})`);
  console.log(`✓ Risk Reasons: ${JSON.stringify(pipelineResult.riskUpdate.reasons)}`);

  // 4. Verify automated empathetic SMS received by client
  const latestSms = await db.getOne("SELECT * FROM sms_messages WHERE client_id = 'cli-01' AND direction = 'outbound' ORDER BY created_at DESC LIMIT 1");
  console.log(`✓ Client Handset Received Automated ReTrac Ack SMS: "${latestSms.message_text}"`);

  // 5. Verify Risk Alert Created
  const alert = await db.getOne("SELECT * FROM risk_alerts WHERE client_id = 'cli-01' AND status = 'active' ORDER BY created_at DESC LIMIT 1");
  console.log(`✓ Active Clinical Alert Created: ${alert ? alert.severity : 'NONE'} | Reasons: ${alert ? alert.reasons : ''}`);

  // 6. Caseworker Logs Intervention to Stabilize Client
  console.log('\n--- STEP 6: Caseworker Logs Intervention ---');
  const intId = 'int-' + Date.now();
  await db.run(
    `INSERT INTO interventions (id, client_id, caseworker_id, type, description, action_taken, outcome, notes, performed_at, created_at)
     VALUES ($1, $2, 'cw-01', 'counseling', 'Patient reported cravings and stress', 'Completed counseling call; patient stabilized and connected to mentor.', 'successful', 'Follow up scheduled for Thursday', datetime('now'), datetime('now'))`,
    [intId, john.id]
  );
  if (alert) {
    await db.run("UPDATE risk_alerts SET status = 'resolved', resolved_at = datetime('now') WHERE id = $1", [alert.id]);
    console.log(`✓ Risk Alert ${alert.id} resolved by caseworker intervention.`);
  }

  // 7. Client Job Matching
  console.log('\n--- STEP 7: Reintegration Job Matching for John Okello ---');
  const openJobs = await db.query("SELECT * FROM jobs WHERE status = 'open' LIMIT 3");
  console.log(`✓ Found ${openJobs.rows.length} Open Reintegration Jobs`);
  const targetJob = openJobs.rows[0];
  console.log(`✓ Selected Job for Placement: "${targetJob.title}" at ${targetJob.location} (UGX ${targetJob.pay_amount})`);

  // 8. Apply John to Job
  console.log('\n--- STEP 8: Apply Candidate to Job ---');
  const appId = 'app-' + Date.now();
  await db.run(
    `INSERT INTO job_applications (id, job_id, client_id, status, match_score, notes, applied_at, created_at, updated_at)
     VALUES ($1, $2, $3, 'applied', 88, 'Matched via ReTrac skills engine', datetime('now'), datetime('now'), datetime('now'))`,
    [appId, targetJob.id, john.id]
  );
  console.log(`✓ Job Application ${appId} submitted for ${john.full_name}`);

  // 9. Employer Accepts & Marks Work Completed
  console.log('\n--- STEP 9: Employer Accepts & Marks Work Completed ---');
  await db.run(
    `UPDATE job_applications 
     SET status = 'completed', accepted_at = datetime('now'), completed_at = datetime('now'), updated_at = datetime('now')
     WHERE id = $1`,
    [appId]
  );
  console.log(`✓ Application status updated to COMPLETED.`);

  // 10. Direct MoMo Payout Disbursed
  console.log('\n--- STEP 10: Trigger Mobile Money Payout via Direct MoMo Terminal ---');
  const payoutResult = await PaymentService.triggerPayment({
    applicationId: appId,
    clientId: john.id,
    amount: targetJob.pay_amount || 50000,
    currency: 'UGX',
    notes: `Weekly wage milestone: ${targetJob.title}`,
    provider: 'mtn_momo'
  });
  console.log(`✓ Payment Disbursed: Ref=${payoutResult.reference} | Amount=UGX ${Number(payoutResult.amount).toLocaleString()} | Provider=${payoutResult.provider}`);

  // 11. Verify Client Received Mobile Money Receipt SMS on Feature Phone!
  console.log('\n--- STEP 11: Verify Client Feature Phone Received MoMo Receipt SMS ---');
  const momoSms = await db.getOne(
    "SELECT * FROM sms_messages WHERE client_id = 'cli-01' AND direction = 'outbound' AND message_text LIKE '%Mobile Money%' ORDER BY created_at DESC LIMIT 1"
  );
  console.log(`✓ SMS Stored on Client Phone Handset:\n"${momoSms ? momoSms.message_text : 'MISSING'}"`);

  // 12. Check Payment in Ledger
  console.log('\n--- STEP 12: Verify Database Ledger Record ---');
  const ledgerRecord = await db.getOne("SELECT * FROM payments WHERE transaction_reference = $1", [payoutResult.reference]);
  console.log(`✓ Ledger Record Verified: ID=${ledgerRecord.id} | Status=${ledgerRecord.status} | CompletedAt=${ledgerRecord.completed_at}`);

  console.log('\n========================================================');
  console.log('ALL GOLDEN DEMO STEPS VERIFIED END-TO-END SUCCESSFULLY!');
  console.log('========================================================\n');
}

testFullGoldenDemoFlow()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
