const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const db = require('./db');
const { runMigrations } = require('./migrate');

async function seedDatabase() {
  console.log('🌱 Seeding ReTrac database with realistic Uganda demonstration data...');
  
  // Ensure schema exists
  await runMigrations();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. System Settings
  const settings = [
    ['sms_provider', 'demo', 'Active SMS delivery engine (demo or africastalking)'],
    ['ai_provider', 'demo', 'Active free-text AI Risk Analyzer (demo or openai)'],
    ['payment_provider', 'demo', 'Active Mobile Money integration (demo, mtn, or airtel)'],
    ['weekly_checkin_day', 'Monday', 'Designated weekly check-in broadcast day'],
    ['risk_weight_missed', '15', 'Score added per missed check-in'],
    ['risk_weight_reply_struggling', '25', 'Score added for replying "2" (struggling)'],
    ['risk_weight_consecutive_struggling', '20', 'Score added for 2+ consecutive struggling replies'],
    ['risk_weight_consecutive_missed', '20', 'Score added for 3+ consecutive missed check-ins'],
    ['risk_weight_freetext_distress', '20', 'Score added for NLP distress sentiment'],
    ['risk_weight_unresolved_alert', '10', 'Score added for active unresolved risk alerts']
  ];

  for (const [key, val, desc] of settings) {
    await db.run(
      `INSERT INTO system_settings (key, value, description, updated_at)
       VALUES ($1, $2, $3, datetime('now'))
       ON CONFLICT (key) DO UPDATE SET value = $2, description = $3`,
      [key, val, desc]
    );
  }

  // 2. Users (Admin, Caseworkers, Employers)
  const users = [
    {
      id: 'usr-admin-01',
      name: 'Musinguzi Alituha Stanley',
      email: 'admin@retrac.ug',
      role: 'admin',
      phone: '+256700000001'
    },
    {
      id: 'usr-cw-01',
      name: 'Bwambale Sulait',
      email: 'sulait.bwambale@retrac.ug',
      role: 'caseworker',
      phone: '+256700000002'
    },
    {
      id: 'usr-cw-02',
      name: 'Sarah Namukasa',
      email: 'sarah.namukasa@retrac.ug',
      role: 'caseworker',
      phone: '+256700000003'
    },
    {
      id: 'usr-emp-01',
      name: 'Kampala Skills & Services Ltd',
      email: 'employer@kampalaskills.ug',
      role: 'employer',
      phone: '+256700000004'
    },
    {
      id: 'usr-emp-02',
      name: 'Nile Agricultural Ventures',
      email: 'contact@nileagri.ug',
      role: 'employer',
      phone: '+256700000005'
    },
    {
      id: 'usr-emp-03',
      name: 'Victoria Urban Logistics',
      email: 'hr@victoriagroup.ug',
      role: 'employer',
      phone: '+256700000006'
    }
  ];

  for (const u of users) {
    await db.run(
      `INSERT INTO users (id, name, email, password_hash, role, phone, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, 1)
       ON CONFLICT (email) DO UPDATE SET name = $2, role = $5, phone = $6`,
      [u.id, u.name, u.email, passwordHash, u.role, u.phone]
    );
  }

  // 3. Caseworkers
  const caseworkers = [
    {
      id: 'cw-01',
      user_id: 'usr-cw-01',
      full_name: 'Bwambale Sulait',
      phone: '+256700000002',
      email: 'sulait.bwambale@retrac.ug',
      organization: 'Butabika National Recovery Centre',
      title: 'Senior Reintegration Caseworker',
      active_client_count: 7
    },
    {
      id: 'cw-02',
      user_id: 'usr-cw-02',
      full_name: 'Sarah Namukasa',
      phone: '+256700000003',
      email: 'sarah.namukasa@retrac.ug',
      organization: 'Hope Recovery Community Outreach',
      title: 'Community Aftercare Specialist',
      active_client_count: 5
    }
  ];

  for (const cw of caseworkers) {
    await db.run(
      `INSERT INTO caseworkers (id, user_id, full_name, phone, email, organization, title, active_client_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET full_name = $3, organization = $6, active_client_count = $8`,
      [cw.id, cw.user_id, cw.full_name, cw.phone, cw.email, cw.organization, cw.title, cw.active_client_count]
    );
  }

  // 4. Employers
  const employers = [
    {
      id: 'emp-01',
      user_id: 'usr-emp-01',
      company_name: 'Kampala Skills & Services Ltd',
      contact_person: 'Grace Tumusiime',
      phone: '+256700000004',
      email: 'employer@kampalaskills.ug',
      location: 'Industrial Area, 7th Street, Kampala',
      sector: 'Facility Services & Retail'
    },
    {
      id: 'emp-02',
      user_id: 'usr-emp-02',
      company_name: 'Nile Agricultural Ventures',
      contact_person: 'David Kintu',
      phone: '+256700000005',
      email: 'contact@nileagri.ug',
      location: 'Wakiso District, Matugga',
      sector: 'Agribusiness & Horticulture'
    },
    {
      id: 'emp-03',
      user_id: 'usr-emp-03',
      company_name: 'Victoria Urban Logistics',
      contact_person: 'Patricia Nansubuga',
      phone: '+256700000006',
      email: 'hr@victoriagroup.ug',
      location: 'Nakawa Business Park, Kampala',
      sector: 'Warehousing & Transportation'
    }
  ];

  for (const emp of employers) {
    await db.run(
      `INSERT INTO employers (id, user_id, company_name, contact_person, phone, email, location, sector, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)
       ON CONFLICT (id) DO UPDATE SET company_name = $3, contact_person = $4, location = $7`,
      [emp.id, emp.user_id, emp.company_name, emp.contact_person, emp.phone, emp.email, emp.location, emp.sector]
    );
  }

  // 5. Skills
  const skillsList = [
    ['skl-01', 'Cleaning & Sanitation', 'Facility Maintenance'],
    ['skl-02', 'Cooking & Food Prep', 'Hospitality & Catering'],
    ['skl-03', 'Agriculture & Farming', 'Agriculture'],
    ['skl-04', 'Customer Service', 'Retail & Hospitality'],
    ['skl-05', 'Stock Handling & Inventory', 'Logistics & Retail'],
    ['skl-06', 'Car Washing & Auto Detailing', 'Automotive Services'],
    ['skl-07', 'Tailoring & Garments', 'Manufacturing'],
    ['skl-08', 'Computer Basics & Data Entry', 'Office Administration'],
    ['skl-09', 'Construction Helper', 'Building & Construction'],
    ['skl-10', 'Hairdressing & Barbering', 'Personal Care'],
    ['skl-11', 'Electrical Maintenance', 'Trades & Repairs'],
    ['skl-12', 'Plumbing Assistance', 'Trades & Repairs']
  ];

  for (const [id, name, cat] of skillsList) {
    await db.run(
      `INSERT INTO skills (id, name, category)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET name = $2, category = $3`,
      [id, name, cat]
    );
  }

  // 6. Clients
  const clients = [
    {
      id: 'cli-01',
      full_name: 'John Okello',
      phone_number: '+256772111222',
      gender: 'Male',
      age: 28,
      treatment_centre: 'Butabika National Recovery Hospital',
      enrollment_date: '2026-06-12',
      recovery_start_date: '2026-06-01',
      assigned_caseworker_id: 'cw-01',
      current_risk_score: 12,
      current_risk_level: 'STABLE',
      status: 'active',
      location: 'Makindye, Kampala',
      preferred_job_category: 'Logistics & Retail',
      emergency_contact_name: 'Josephine Okello (Sister)',
      emergency_contact_phone: '+256772999001',
      notes: 'Completed 90-day residential program. High motivation for store management work.',
      skills: ['skl-04', 'skl-05', 'skl-08']
    },
    {
      id: 'cli-02',
      full_name: 'Mary Namukasa',
      phone_number: '+256783222333',
      gender: 'Female',
      age: 32,
      treatment_centre: 'Serenity Rehabilitation Centre Entebbe',
      enrollment_date: '2026-05-18',
      recovery_start_date: '2026-05-01',
      assigned_caseworker_id: 'cw-01',
      current_risk_score: 15,
      current_risk_level: 'STABLE',
      status: 'active',
      location: 'Kajjansi, Entebbe Road',
      preferred_job_category: 'Hospitality & Catering',
      emergency_contact_name: 'Robert Mukasa (Husband)',
      emergency_contact_phone: '+256783888002',
      notes: 'Active member of weekly peer support circle. Consistent check-in history.',
      skills: ['skl-02', 'skl-01', 'skl-04']
    },
    {
      id: 'cli-03',
      full_name: 'Peter Ouma',
      phone_number: '+256704333444',
      gender: 'Male',
      age: 26,
      treatment_centre: 'Mukono Youth Recovery Project',
      enrollment_date: '2026-07-01',
      recovery_start_date: '2026-06-15',
      assigned_caseworker_id: 'cw-01',
      current_risk_score: 68,
      current_risk_level: 'AT_RISK',
      status: 'active',
      location: 'Seeta, Mukono',
      preferred_job_category: 'Agriculture',
      emergency_contact_name: 'Samuel Ouma (Father)',
      emergency_contact_phone: '+256704777003',
      notes: 'Reported sleeping difficulties and social isolation. Follow-up prioritized.',
      skills: ['skl-03', 'skl-09']
    },
    {
      id: 'cli-04',
      full_name: 'Sarah Nankya',
      phone_number: '+256755444555',
      gender: 'Female',
      age: 24,
      treatment_centre: 'Hope Haven Center Wakiso',
      enrollment_date: '2026-06-20',
      recovery_start_date: '2026-06-10',
      assigned_caseworker_id: 'cw-02',
      current_risk_score: 38,
      current_risk_level: 'MONITOR',
      status: 'active',
      location: 'Nateete, Rubaga',
      preferred_job_category: 'Manufacturing',
      emergency_contact_name: 'Agnes Nankya (Mother)',
      emergency_contact_phone: '+256755666004',
      notes: 'Skilled in garment cutting. Occasional transport challenges.',
      skills: ['skl-07', 'skl-04']
    },
    {
      id: 'cli-05',
      full_name: 'David Mugisha',
      phone_number: '+256776555666',
      gender: 'Male',
      age: 35,
      treatment_centre: 'Butabika National Recovery Hospital',
      enrollment_date: '2026-04-10',
      recovery_start_date: '2026-03-25',
      assigned_caseworker_id: 'cw-01',
      current_risk_score: 82,
      current_risk_level: 'CRITICAL',
      status: 'active',
      location: 'Kasubi, Kampala',
      preferred_job_category: 'Building & Construction',
      emergency_contact_name: 'George Mugisha (Brother)',
      emergency_contact_phone: '+256776555005',
      notes: 'Missed 2 consecutive check-ins and indicated severe emotional stress in last text reply.',
      skills: ['skl-09', 'skl-11', 'skl-12']
    },
    {
      id: 'cli-06',
      full_name: 'Grace Achieng',
      phone_number: '+256787666777',
      gender: 'Female',
      age: 23,
      treatment_centre: 'Kampala Community Health Link',
      enrollment_date: '2026-06-01',
      recovery_start_date: '2026-05-20',
      assigned_caseworker_id: 'cw-02',
      current_risk_score: 10,
      current_risk_level: 'STABLE',
      status: 'active',
      location: 'Kyambogo, Nakawa',
      preferred_job_category: 'Office Administration',
      emergency_contact_name: 'Susan Achieng (Aunt)',
      emergency_contact_phone: '+256787444006',
      notes: 'Computer literate. Successfully finished intake and resume drafting.',
      skills: ['skl-08', 'skl-04', 'skl-05']
    },
    {
      id: 'cli-07',
      full_name: 'Brian Kato',
      phone_number: '+256708777888',
      gender: 'Male',
      age: 27,
      treatment_centre: 'Kawempe Recovery Support Group',
      enrollment_date: '2026-07-10',
      recovery_start_date: '2026-07-01',
      assigned_caseworker_id: 'cw-01',
      current_risk_score: 42,
      current_risk_level: 'MONITOR',
      status: 'active',
      location: 'Kawempe Tula, Kampala',
      preferred_job_category: 'Automotive Services',
      emergency_contact_name: 'Paul Kato (Brother)',
      emergency_contact_phone: '+256708333007',
      notes: 'Looking for immediate daytime car wash placement.',
      skills: ['skl-06', 'skl-01']
    },
    {
      id: 'cli-08',
      full_name: 'Esther Akello',
      phone_number: '+256759888999',
      gender: 'Female',
      age: 29,
      treatment_centre: 'Butabika National Recovery Hospital',
      enrollment_date: '2026-05-01',
      recovery_start_date: '2026-04-15',
      assigned_caseworker_id: 'cw-02',
      current_risk_score: 20,
      current_risk_level: 'STABLE',
      status: 'active',
      location: 'Ntinda, Nakawa',
      preferred_job_category: 'Retail & Hospitality',
      emergency_contact_name: 'Jane Akello (Sister)',
      emergency_contact_phone: '+256759222008',
      notes: 'High customer communication aptitude. 100% check-in compliance.',
      skills: ['skl-04', 'skl-05', 'skl-02']
    },
    {
      id: 'cli-09',
      full_name: 'Joseph Ssempijja',
      phone_number: '+256770999000',
      gender: 'Male',
      age: 31,
      treatment_centre: 'Rubaga Mission Wellness Center',
      enrollment_date: '2026-07-05',
      recovery_start_date: '2026-06-25',
      assigned_caseworker_id: 'cw-01',
      current_risk_score: 58,
      current_risk_level: 'AT_RISK',
      status: 'active',
      location: 'Nabbingo, Wakiso',
      preferred_job_category: 'Trades & Repairs',
      emergency_contact_name: 'Maria Ssempijja (Wife)',
      emergency_contact_phone: '+256770111009',
      notes: 'Experienced domestic electrician. Recent family health strain.',
      skills: ['skl-11', 'skl-12', 'skl-09']
    },
    {
      id: 'cli-10',
      full_name: 'Florence Nabakooza',
      phone_number: '+256781000111',
      gender: 'Female',
      age: 25,
      treatment_centre: 'Hope Recovery Outreach Jinja Road',
      enrollment_date: '2026-06-15',
      recovery_start_date: '2026-06-01',
      assigned_caseworker_id: 'cw-02',
      current_risk_score: 8,
      current_risk_level: 'STABLE',
      status: 'active',
      location: 'Bweyogerere, Wakiso',
      preferred_job_category: 'Personal Care',
      emergency_contact_name: 'Betty Nabakooza (Mother)',
      emergency_contact_phone: '+256781999010',
      notes: 'Certified in braiding and salon styling. Excellent progress.',
      skills: ['skl-10', 'skl-04']
    },
    {
      id: 'cli-11',
      full_name: 'Emmanuel Tumwine',
      phone_number: '+256702111333',
      gender: 'Male',
      age: 30,
      treatment_centre: 'Butabika National Recovery Hospital',
      enrollment_date: '2026-05-10',
      recovery_start_date: '2026-04-28',
      assigned_caseworker_id: 'cw-01',
      current_risk_score: 18,
      current_risk_level: 'STABLE',
      status: 'completed',
      location: 'Nansana, Wakiso',
      preferred_job_category: 'Logistics & Retail',
      emergency_contact_name: 'Eunice Tumwine (Sister)',
      emergency_contact_phone: '+256702888011',
      notes: 'Completed 6-month reintegration program and established stable livelihood.',
      skills: ['skl-05', 'skl-01']
    },
    {
      id: 'cli-12',
      full_name: 'Agnes Chandiru',
      phone_number: '+256753222444',
      gender: 'Female',
      age: 27,
      treatment_centre: 'Kira Community Wellness Project',
      enrollment_date: '2026-07-15',
      recovery_start_date: '2026-07-05',
      assigned_caseworker_id: 'cw-02',
      current_risk_score: 35,
      current_risk_level: 'MONITOR',
      status: 'active',
      location: 'Kira Municipality, Wakiso',
      preferred_job_category: 'Facility Maintenance',
      emergency_contact_name: 'Doreen Chandiru (Sister)',
      emergency_contact_phone: '+256753777012',
      notes: 'Recently enrolled. Attended all scheduled group sessions.',
      skills: ['skl-01', 'skl-02']
    }
  ];

  for (const c of clients) {
    await db.run(
      `INSERT INTO clients (
        id, full_name, phone_number, gender, age, treatment_centre,
        enrollment_date, recovery_start_date, assigned_caseworker_id,
        current_risk_score, current_risk_level, status, location,
        preferred_job_category, emergency_contact_name, emergency_contact_phone, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (id) DO UPDATE SET
        full_name = $2, phone_number = $3, current_risk_score = $10,
        current_risk_level = $11, status = $12, location = $13`,
      [
        c.id, c.full_name, c.phone_number, c.gender, c.age, c.treatment_centre,
        c.enrollment_date, c.recovery_start_date, c.assigned_caseworker_id,
        c.current_risk_score, c.current_risk_level, c.status, c.location,
        c.preferred_job_category, c.emergency_contact_name, c.emergency_contact_phone, c.notes
      ]
    );

    // Seed client skills
    for (const skillId of c.skills) {
      await db.run(
        `INSERT INTO client_skills (client_id, skill_id, proficiency_level)
         VALUES ($1, $2, 'intermediate')
         ON CONFLICT (client_id, skill_id) DO NOTHING`,
        [c.id, skillId]
      );
    }
  }

  // 7. Check-ins History (Realistic check-in progression for demo)
  const checkins = [
    // John Okello (Stable history)
    { id: 'chk-01', client_id: 'cli-01', date: '2026-08-04', resp_raw: '1', code: '1', status: 'received', sent_at: '2026-08-04 09:00:00', resp_at: '2026-08-04 09:12:00', sentiment: 'positive', risk_contrib: 0 },
    { id: 'chk-02', client_id: 'cli-01', date: '2026-08-11', resp_raw: '1', code: '1', status: 'received', sent_at: '2026-08-11 09:00:00', resp_at: '2026-08-11 09:15:00', sentiment: 'positive', risk_contrib: 0 },
    { id: 'chk-03', client_id: 'cli-01', date: '2026-08-18', resp_raw: '1', code: '1', status: 'received', sent_at: '2026-08-18 09:00:00', resp_at: '2026-08-18 09:08:00', sentiment: 'positive', risk_contrib: 0 },
    { id: 'chk-04', client_id: 'cli-01', date: '2026-08-25', resp_raw: '1 - doing well thank you', code: '1', status: 'received', sent_at: '2026-08-25 09:00:00', resp_at: '2026-08-25 09:30:00', sentiment: 'positive', risk_contrib: 0 },

    // David Mugisha (Critical history with missed and struggling)
    { id: 'chk-05', client_id: 'cli-05', date: '2026-08-04', resp_raw: '1', code: '1', status: 'received', sent_at: '2026-08-04 09:00:00', resp_at: '2026-08-04 10:04:00', sentiment: 'positive', risk_contrib: 0 },
    { id: 'chk-06', client_id: 'cli-05', date: '2026-08-11', resp_raw: null, code: 'NONE', status: 'missed', sent_at: '2026-08-11 09:00:00', resp_at: null, sentiment: null, risk_contrib: 15 },
    { id: 'chk-07', client_id: 'cli-05', date: '2026-08-18', resp_raw: null, code: 'NONE', status: 'missed', sent_at: '2026-08-18 09:00:00', resp_at: null, sentiment: null, risk_contrib: 15 },
    { id: 'chk-08', client_id: 'cli-05', date: '2026-08-25', resp_raw: '2 - I am finding it hard to stay focused. Things are getting difficult at home.', code: '2', status: 'received', sent_at: '2026-08-25 09:00:00', resp_at: '2026-08-25 11:22:00', sentiment: 'distressed', risk_contrib: 45 },

    // Peter Ouma (At Risk)
    { id: 'chk-09', client_id: 'cli-03', date: '2026-08-18', resp_raw: '2', code: '2', status: 'received', sent_at: '2026-08-18 09:00:00', resp_at: '2026-08-18 10:14:00', sentiment: 'struggling', risk_contrib: 25 },
    { id: 'chk-10', client_id: 'cli-03', date: '2026-08-25', resp_raw: '2 - Struggling with cravings this week', code: '2', status: 'received', sent_at: '2026-08-25 09:00:00', resp_at: '2026-08-25 14:02:00', sentiment: 'distressed', risk_contrib: 45 }
  ];

  for (const chk of checkins) {
    await db.run(
      `INSERT INTO check_ins (
        id, client_id, scheduled_date, sent_at, response_received_at,
        response_raw, response_code, status, sentiment, risk_contribution
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO NOTHING`,
      [chk.id, chk.client_id, chk.date, chk.sent_at, chk.resp_at, chk.resp_raw, chk.code, chk.status, chk.sentiment, chk.risk_contrib]
    );
  }

  // 8. Risk Alerts
  const alerts = [
    {
      id: 'alt-01',
      client_id: 'cli-05',
      caseworker_id: 'cw-01',
      risk_score: 82,
      risk_level: 'CRITICAL',
      reasons: JSON.stringify(['2 consecutive missed check-ins (+30)', 'Struggling response "2" (+25)', 'NLP emotional distress signal detected (+20)', 'Unresolved risk alert (+10)']),
      status: 'active',
      created_at: '2026-08-25 11:25:00'
    },
    {
      id: 'alt-02',
      client_id: 'cli-03',
      caseworker_id: 'cw-01',
      risk_score: 68,
      risk_level: 'AT_RISK',
      reasons: JSON.stringify(['2 consecutive struggling responses (+45)', 'Craving risk signal (+20)']),
      status: 'active',
      created_at: '2026-08-25 14:05:00'
    },
    {
      id: 'alt-03',
      client_id: 'cli-09',
      caseworker_id: 'cw-01',
      risk_score: 58,
      risk_level: 'AT_RISK',
      reasons: JSON.stringify(['Struggling reply "2" (+25)', 'Family health distress (+20)', 'Missed follow-up (+15)']),
      status: 'active',
      created_at: '2026-08-26 09:15:00'
    }
  ];

  for (const a of alerts) {
    await db.run(
      `INSERT INTO risk_alerts (id, client_id, caseworker_id, risk_score, risk_level, reasons, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [a.id, a.client_id, a.caseworker_id, a.risk_score, a.risk_level, a.reasons, a.status, a.created_at]
    );
  }

  // 9. Interventions
  const interventions = [
    {
      id: 'int-01',
      client_id: 'cli-01',
      caseworker_id: 'cw-01',
      type: 'phone_call',
      description: 'Routine 60-day recovery stability check-in call.',
      action_taken: 'Discussed workplace reintegration goals and verified support system.',
      outcome: 'successful',
      notes: 'John confirmed zero cravings and requested assistance matching for retail inventory work.',
      performed_at: '2026-08-20 14:30:00'
    },
    {
      id: 'int-02',
      client_id: 'cli-04',
      caseworker_id: 'cw-02',
      type: 'counseling',
      description: 'One-on-one session addressing transport stress.',
      action_taken: 'Helped plan commute schedule and linked with local peer group in Rubaga.',
      outcome: 'successful',
      notes: 'Mood noticeably improved. Client feels supported.',
      performed_at: '2026-08-22 11:00:00'
    }
  ];

  for (const intv of interventions) {
    await db.run(
      `INSERT INTO interventions (id, client_id, caseworker_id, type, description, action_taken, outcome, notes, performed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO NOTHING`,
      [intv.id, intv.client_id, intv.caseworker_id, intv.type, intv.description, intv.action_taken, intv.outcome, intv.notes, intv.performed_at]
    );
  }

  // 10. Jobs (15 realistic Ugandan reintegration opportunities)
  const jobs = [
    {
      id: 'job-01',
      employer_id: 'emp-01',
      title: 'Store & Inventory Assistant',
      description: 'Assist in receiving, logging, organizing warehouse goods, and daily retail shelf restocking in Kampala Industrial Area.',
      location: 'Industrial Area, 7th Street, Kampala',
      pay_amount: 25000,
      pay_currency: 'UGX',
      pay_frequency: 'daily',
      employment_type: 'part-time',
      preferred_job_category: 'Logistics & Retail',
      status: 'open',
      vacancies: 2,
      skills: ['skl-05', 'skl-04', 'skl-08']
    },
    {
      id: 'job-02',
      employer_id: 'emp-01',
      title: 'Commercial Office Cleaner',
      description: 'Maintain corporate office floor hygiene, sanitation of common rooms, and waste sorting.',
      location: 'Nakawa Business Park, Kampala',
      pay_amount: 18000,
      pay_currency: 'UGX',
      pay_frequency: 'daily',
      employment_type: 'casual',
      preferred_job_category: 'Facility Maintenance',
      status: 'open',
      vacancies: 3,
      skills: ['skl-01']
    },
    {
      id: 'job-03',
      employer_id: 'emp-02',
      title: 'Horticulture & Farm Assistant',
      description: 'Support greenhouse vegetable harvesting, nursery bed weeding, and irrigation management.',
      location: 'Matugga, Wakiso District',
      pay_amount: 20000,
      pay_currency: 'UGX',
      pay_frequency: 'daily',
      employment_type: 'casual',
      preferred_job_category: 'Agriculture',
      status: 'open',
      vacancies: 4,
      skills: ['skl-03']
    },
    {
      id: 'job-04',
      employer_id: 'emp-01',
      title: 'Kitchen & Meal Prep Assistant',
      description: 'Food prep, vegetable chopping, washing dishes, and canteen service support during lunchtime rushes.',
      location: 'Bugolobi, Kampala',
      pay_amount: 22000,
      pay_currency: 'UGX',
      pay_frequency: 'daily',
      employment_type: 'part-time',
      preferred_job_category: 'Hospitality & Catering',
      status: 'open',
      vacancies: 2,
      skills: ['skl-02', 'skl-01']
    },
    {
      id: 'job-05',
      employer_id: 'emp-03',
      title: 'Vehicle Wash & Detailing Attendant',
      description: 'Exterior foam washing, vacuuming, interior conditioning of corporate fleet delivery vans.',
      location: 'Lugogo Bypass, Kampala',
      pay_amount: 20000,
      pay_currency: 'UGX',
      pay_frequency: 'daily',
      employment_type: 'casual',
      preferred_job_category: 'Automotive Services',
      status: 'open',
      vacancies: 2,
      skills: ['skl-06', 'skl-01']
    },
    {
      id: 'job-06',
      employer_id: 'emp-01',
      title: 'Garment Finishing & Tailoring Helper',
      description: 'Ironing, button fixing, hem stitching, and packaging finished school uniform batches.',
      location: 'Makindye, Kampala',
      pay_amount: 24000,
      pay_currency: 'UGX',
      pay_frequency: 'daily',
      employment_type: 'part-time',
      preferred_job_category: 'Manufacturing',
      status: 'open',
      vacancies: 2,
      skills: ['skl-07']
    },
    {
      id: 'job-07',
      employer_id: 'emp-03',
      title: 'Data Entry & Records Clerk',
      description: 'Input paper delivery manifests and shipment confirmations into spreadsheets.',
      location: 'Nakawa Business Park, Kampala',
      pay_amount: 30000,
      pay_currency: 'UGX',
      pay_frequency: 'daily',
      employment_type: 'part-time',
      preferred_job_category: 'Office Administration',
      status: 'open',
      vacancies: 1,
      skills: ['skl-08', 'skl-04']
    },
    {
      id: 'job-08',
      employer_id: 'emp-02',
      title: 'Poultry Care & Feed Attendant',
      description: 'Feeding broiler flocks, monitoring drinker lines, egg collection, and coop sanitation.',
      location: 'Kira, Wakiso District',
      pay_amount: 20000,
      pay_currency: 'UGX',
      pay_frequency: 'daily',
      employment_type: 'full-time',
      preferred_job_category: 'Agriculture',
      status: 'open',
      vacancies: 2,
      skills: ['skl-03', 'skl-01']
    },
    {
      id: 'job-09',
      employer_id: 'emp-01',
      title: 'Retail Shop Assistant',
      description: 'Customer greeting, bag packaging, pricing tag checks, and counter assistance.',
      location: 'Wandegeya Market, Kampala',
      pay_amount: 22000,
      pay_currency: 'UGX',
      pay_frequency: 'daily',
      employment_type: 'part-time',
      preferred_job_category: 'Retail & Hospitality',
      status: 'open',
      vacancies: 1,
      skills: ['skl-04', 'skl-05']
    },
    {
      id: 'job-10',
      employer_id: 'emp-03',
      title: 'Warehouse Loading & Offloading Helper',
      description: 'Safe offloading of packaged consumer goods containers and sorting pallets.',
      location: 'Namanve Industrial Park',
      pay_amount: 25000,
      pay_currency: 'UGX',
      pay_frequency: 'daily',
      employment_type: 'casual',
      preferred_job_category: 'Logistics & Retail',
      status: 'open',
      vacancies: 4,
      skills: ['skl-05', 'skl-09']
    },
    {
      id: 'job-11',
      employer_id: 'emp-01',
      title: 'Salon Shampoo & Assistant Stylist',
      description: 'Hair washing, blow drying assistance, salon chair sanitation, and product preparation.',
      location: 'Ntinda Complex, Kampala',
      pay_amount: 20000,
      pay_currency: 'UGX',
      pay_frequency: 'daily',
      employment_type: 'part-time',
      preferred_job_category: 'Personal Care',
      status: 'open',
      vacancies: 2,
      skills: ['skl-10', 'skl-04']
    },
    {
      id: 'job-12',
      employer_id: 'emp-03',
      title: 'Electrical Apprentice & Conduit Helper',
      description: 'Chasing walls, laying electrical conduits, pulling wiring harnesses under supervision of master electrician.',
      location: 'Kololo Construction Site, Kampala',
      pay_amount: 28000,
      pay_currency: 'UGX',
      pay_frequency: 'daily',
      employment_type: 'contract',
      preferred_job_category: 'Trades & Repairs',
      status: 'open',
      vacancies: 2,
      skills: ['skl-11', 'skl-09']
    },
    {
      id: 'job-13',
      employer_id: 'emp-02',
      title: 'Coffee Nursery Attendant',
      description: 'Bagging potting soil, seedling transplanting, pest inspection on Arabica coffee beds.',
      location: 'Gayaza, Wakiso',
      pay_amount: 19000,
      pay_currency: 'UGX',
      pay_frequency: 'daily',
      employment_type: 'casual',
      preferred_job_category: 'Agriculture',
      status: 'open',
      vacancies: 3,
      skills: ['skl-03']
    },
    {
      id: 'job-14',
      employer_id: 'emp-01',
      title: 'Sanitation & Waste Sorting Aide',
      description: 'Eco-sorting of recyclables, cardboard bailing, and compound sweeping.',
      location: 'Kireka, Kira Municipality',
      pay_amount: 18000,
      pay_currency: 'UGX',
      pay_frequency: 'daily',
      employment_type: 'casual',
      preferred_job_category: 'Facility Maintenance',
      status: 'open',
      vacancies: 2,
      skills: ['skl-01']
    },
    {
      id: 'job-15',
      employer_id: 'emp-03',
      title: 'Security Gate Logistics Assistant',
      description: 'Visitor badge logging, delivery vehicle recording at logistics park gatehouse.',
      location: 'Bweyogerere Depot, Wakiso',
      pay_amount: 23000,
      pay_currency: 'UGX',
      pay_frequency: 'daily',
      employment_type: 'full-time',
      preferred_job_category: 'Logistics & Retail',
      status: 'open',
      vacancies: 1,
      skills: ['skl-04', 'skl-08']
    }
  ];

  for (const j of jobs) {
    await db.run(
      `INSERT INTO jobs (
        id, employer_id, title, description, location, pay_amount,
        pay_currency, pay_frequency, employment_type, preferred_job_category,
        status, vacancies
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        title = $3, description = $4, pay_amount = $6, status = $11`,
      [
        j.id, j.employer_id, j.title, j.description, j.location, j.pay_amount,
        j.pay_currency, j.pay_frequency, j.employment_type, j.preferred_job_category,
        j.status, j.vacancies
      ]
    );

    // Link job skills
    for (const skillId of j.skills) {
      await db.run(
        `INSERT INTO job_skills (job_id, skill_id, is_required)
         VALUES ($1, $2, 1)
         ON CONFLICT (job_id, skill_id) DO NOTHING`,
        [j.id, skillId]
      );
    }
  }

  // 11. Applications & Placements
  const applications = [
    {
      id: 'app-01',
      job_id: 'job-01',
      client_id: 'cli-01',
      match_score: 92,
      status: 'matched',
      applied_at: '2026-08-26 10:00:00',
      notes: 'High match: skills (Inventory, Customer Service, Computer Basics) & location align.'
    },
    {
      id: 'app-02',
      job_id: 'job-04',
      client_id: 'cli-02',
      match_score: 88,
      status: 'completed',
      applied_at: '2026-08-15 09:00:00',
      accepted_at: '2026-08-16 10:00:00',
      completed_at: '2026-08-22 17:00:00',
      notes: 'Completed 5-day catering placement with glowing employer review.'
    },
    {
      id: 'app-03',
      job_id: 'job-07',
      client_id: 'cli-06',
      match_score: 95,
      status: 'accepted',
      applied_at: '2026-08-24 11:00:00',
      accepted_at: '2026-08-25 09:00:00',
      notes: 'Scheduled to begin onboarding next Monday.'
    }
  ];

  for (const app of applications) {
    await db.run(
      `INSERT INTO job_applications (
        id, job_id, client_id, match_score, status, applied_at, accepted_at, completed_at, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO NOTHING`,
      [app.id, app.job_id, app.client_id, app.match_score, app.status, app.applied_at, app.accepted_at, app.completed_at, app.notes]
    );
  }

  // 12. Mobile Money Payments
  const payments = [
    {
      id: 'pay-01',
      application_id: 'app-02',
      client_id: 'cli-02',
      employer_id: 'emp-01',
      amount: 110000,
      currency: 'UGX',
      payment_provider: 'demo',
      transaction_reference: 'RTR-2026-000001',
      status: 'successful',
      initiated_at: '2026-08-22 17:30:00',
      completed_at: '2026-08-22 17:31:15',
      provider_response: JSON.stringify({ status: 'SUCCESSFUL', operator: 'MTN MoMo Sandbox', fee: 0, recipient_phone: '+256783222333' }),
      notes: 'Payment for 5 days of Kitchen Assistance (UGX 22,000/day)'
    }
  ];

  for (const p of payments) {
    await db.run(
      `INSERT INTO payments (
        id, application_id, client_id, employer_id, amount, currency,
        payment_provider, transaction_reference, status, initiated_at, completed_at, provider_response, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO NOTHING`,
      [p.id, p.application_id, p.client_id, p.employer_id, p.amount, p.currency, p.payment_provider, p.transaction_reference, p.status, p.initiated_at, p.completed_at, p.provider_response, p.notes]
    );
  }

  // 13. Notifications
  const notifications = [
    {
      id: 'notif-01',
      user_id: 'usr-cw-01',
      client_id: 'cli-05',
      type: 'risk_alert',
      title: '🚨 CRITICAL RISK ALERT: David Mugisha',
      message: 'Risk score reached 82 (CRITICAL). 2 missed check-ins and struggling message received.',
      is_read: 0,
      created_at: '2026-08-25 11:25:00'
    },
    {
      id: 'notif-02',
      user_id: 'usr-cw-01',
      client_id: 'cli-03',
      type: 'risk_alert',
      title: '⚠️ AT RISK ALERT: Peter Ouma',
      message: 'Risk score increased to 68. Two consecutive struggling check-ins recorded.',
      is_read: 0,
      created_at: '2026-08-25 14:05:00'
    },
    {
      id: 'notif-03',
      user_id: 'usr-cw-01',
      client_id: 'cli-01',
      type: 'job_match',
      title: '💼 92% Job Match: John Okello',
      message: 'Matched with Store & Inventory Assistant at Kampala Skills & Services Ltd.',
      is_read: 1,
      created_at: '2026-08-26 10:00:00'
    },
    {
      id: 'notif-04',
      user_id: 'usr-emp-01',
      client_id: 'cli-02',
      type: 'payment_update',
      title: '💰 Payout Successful: UGX 110,000',
      message: 'Mobile money disbursement RTR-2026-000001 completed to Mary Namukasa.',
      is_read: 1,
      created_at: '2026-08-22 17:31:15'
    }
  ];

  for (const n of notifications) {
    await db.run(
      `INSERT INTO notifications (id, user_id, client_id, type, title, message, is_read, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [n.id, n.user_id, n.client_id, n.type, n.title, n.message, n.is_read, n.created_at]
    );
  }

  // 14. Audit Logs
  const auditEntries = [
    ['aud-01', 'usr-admin-01', 'Musinguzi Alituha Stanley', 'SYSTEM_INITIALIZATION', 'SYSTEM', 'CONFIG_INIT', '127.0.0.1', '{"status":"ReTrac Seeded"}'],
    ['aud-02', 'usr-cw-01', 'Bwambale Sulait', 'CLIENT_INTAKE', 'CLIENT', 'cli-01', '127.0.0.1', '{"client":"John Okello","score":12}'],
    ['aud-03', 'usr-cw-01', 'Bwambale Sulait', 'RISK_ALERT_GENERATED', 'ALERT', 'alt-01', '127.0.0.1', '{"client":"David Mugisha","score":82}']
  ];

  for (const [id, uid, uname, act, etype, eid, ip, meta] of auditEntries) {
    await db.run(
      `INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, ip_address, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [id, uid, uname, act, etype, eid, ip, meta]
    );
  }

  console.log('✅ ReTrac database successfully seeded with all 12 patients, caseworkers, jobs, alerts, and demo payments!');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
