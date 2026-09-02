const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/db');
const { seedDatabase } = require('../src/database/seed');

describe('ReTrac Complete End-to-End Integration Suite', () => {
  let authToken = null;

  beforeAll(async () => {
    db.initDatabase();
    await seedDatabase();
  });

  test('1. GET /api/health returns healthy system status with all providers', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.providers.sms).toBeDefined();
    expect(res.body.providers.ai).toBeDefined();
    expect(res.body.providers.payment).toBeDefined();
  });

  test('2. POST /api/auth/login authenticates Caseworker Bwambale Sulait', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'sulait.bwambale@retrac.ug',
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('caseworker');
    authToken = res.body.token;
  });

  test('3. GET /api/clients returns seeded patient list', async () => {
    const res = await request(app)
      .get('/api/clients')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.clients.length).toBeGreaterThanOrEqual(10);

    const john = res.body.data.clients.find(c => c.full_name === 'John Okello');
    expect(john).toBeDefined();
    expect(john.phone_number).toBe('+256772111222');
  });

  test('4. POST /api/webhook/sms processes SMS reply "2" (struggling) through full pipeline', async () => {
    const res = await request(app)
      .post('/api/webhook/sms')
      .send({
        from: '+256772111222', // John Okello
        text: '2 - Struggling with cravings and lack of work'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recognized).toBe(true);
    expect(res.body.data.responseCode).toBe('2');
    expect(res.body.data.riskUpdate.newScore).toBeGreaterThan(30);
  });

  test('5. GET /api/clients/:id reflects updated risk score and explainability reasons', async () => {
    const res = await request(app)
      .get('/api/clients/cli-01')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.client.current_risk_score).toBeGreaterThan(30);
    expect(res.body.data.checkins.length).toBeGreaterThan(0);
  });

  test('6. POST /api/interventions records caseworker follow-up and stabilizes risk', async () => {
    const res = await request(app)
      .post('/api/interventions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        client_id: 'cli-01',
        type: 'phone_call',
        description: 'Urgent follow-up after struggling check-in response.',
        action_taken: 'Conducted 30-minute motivational counseling and connected with retail placement.',
        outcome: 'successful',
        notes: 'John was receptive, calm, and agreed to report for interview.'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.outcome).toBe('successful');
  });

  test('7. GET /api/clients/cli-01/matches returns top job matches with score breakdown', async () => {
    const res = await request(app)
      .get('/api/clients/cli-01/matches')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.matches.length).toBeGreaterThan(0);
    expect(res.body.data.matches[0].matchScore).toBeGreaterThanOrEqual(70);
  });

  test('8. POST /api/payments/trigger executes Mobile Money payout with RTR-2026 reference', async () => {
    const res = await request(app)
      .post('/api/payments/trigger')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        clientId: 'cli-01',
        amount: 25000,
        currency: 'UGX',
        notes: 'Store inventory assistant daily placement stipend'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reference).toMatch(/^RTR-2026-\d{6}$/);
    expect(res.body.data.status).toBe('successful');
    expect(res.body.data.amount).toBe(25000);
  });
});
