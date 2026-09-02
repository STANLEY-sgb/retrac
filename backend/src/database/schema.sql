-- ============================================================================
-- ReTrac MVP — PostgreSQL Database Schema
-- Track 05: Rehabilitation & Reintegration (DOMINION 2026)
-- Target Context: Uganda (SMS/USSD Check-ins, Risk Engine, Jobs & MoMo)
-- ============================================================================

-- 1. System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users (Role-Based Access Control: admin, caseworker, employer)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'caseworker', 'employer')),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Caseworkers
CREATE TABLE IF NOT EXISTS caseworkers (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    organization VARCHAR(255) DEFAULT 'ReTrac Healthcare & Recovery Uganda',
    title VARCHAR(100) DEFAULT 'Recovery Caseworker',
    active_client_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Employers
CREATE TABLE IF NOT EXISTS employers (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Skills
CREATE TABLE IF NOT EXISTS skills (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Clients (Patients / Recovering Individuals)
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) UNIQUE NOT NULL,
    gender VARCHAR(20),
    age INTEGER,
    treatment_centre VARCHAR(255) NOT NULL,
    enrollment_date DATE NOT NULL,
    recovery_start_date DATE NOT NULL,
    assigned_caseworker_id VARCHAR(36) REFERENCES caseworkers(id) ON DELETE SET NULL,
    current_risk_score INTEGER DEFAULT 0 CHECK (current_risk_score >= 0 AND current_risk_score <= 100),
    current_risk_level VARCHAR(50) DEFAULT 'STABLE' CHECK (current_risk_level IN ('STABLE', 'MONITOR', 'AT_RISK', 'CRITICAL')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'lost_contact')),
    location VARCHAR(255) NOT NULL,
    preferred_job_category VARCHAR(100),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Client Skills Mapping
CREATE TABLE IF NOT EXISTS client_skills (
    client_id VARCHAR(36) REFERENCES clients(id) ON DELETE CASCADE,
    skill_id VARCHAR(36) REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(50) DEFAULT 'intermediate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (client_id, skill_id)
);

-- 8. SMS & USSD Messages History
CREATE TABLE IF NOT EXISTS sms_messages (
    id VARCHAR(36) PRIMARY KEY,
    client_id VARCHAR(36) REFERENCES clients(id) ON DELETE SET NULL,
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    phone_number VARCHAR(50) NOT NULL,
    message_text TEXT NOT NULL,
    provider VARCHAR(50) DEFAULT 'demo',
    status VARCHAR(50) DEFAULT 'sent',
    external_message_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Weekly Check-Ins
CREATE TABLE IF NOT EXISTS check_ins (
    id VARCHAR(36) PRIMARY KEY,
    client_id VARCHAR(36) REFERENCES clients(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_received_at TIMESTAMP,
    response_raw TEXT,
    response_code VARCHAR(50) DEFAULT 'NONE',
    status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'received', 'missed')),
    sentiment VARCHAR(50),
    risk_contribution INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Risk Scores & Explainability Log
CREATE TABLE IF NOT EXISTS risk_scores (
    id VARCHAR(36) PRIMARY KEY,
    client_id VARCHAR(36) REFERENCES clients(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    level VARCHAR(50) NOT NULL CHECK (level IN ('STABLE', 'MONITOR', 'AT_RISK', 'CRITICAL')),
    reasons TEXT NOT NULL, -- JSON string array of risk reasons
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trigger_event VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. High-Risk Alerts
CREATE TABLE IF NOT EXISTS risk_alerts (
    id VARCHAR(36) PRIMARY KEY,
    client_id VARCHAR(36) REFERENCES clients(id) ON DELETE CASCADE,
    caseworker_id VARCHAR(36) REFERENCES caseworkers(id) ON DELETE SET NULL,
    risk_score INTEGER NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    reasons TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed')),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    resolved_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Caseworker Interventions
CREATE TABLE IF NOT EXISTS interventions (
    id VARCHAR(36) PRIMARY KEY,
    client_id VARCHAR(36) REFERENCES clients(id) ON DELETE CASCADE,
    caseworker_id VARCHAR(36) REFERENCES caseworkers(id) ON DELETE SET NULL,
    type VARCHAR(100) NOT NULL CHECK (type IN ('phone_call', 'in_person', 'referral', 'family_support', 'employment_support', 'counseling', 'other')),
    description TEXT NOT NULL,
    action_taken TEXT NOT NULL,
    outcome VARCHAR(50) DEFAULT 'successful' CHECK (outcome IN ('successful', 'pending', 'rescheduled', 'escalated')),
    notes TEXT,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Jobs / Reintegration Employment Opportunities
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(36) PRIMARY KEY,
    employer_id VARCHAR(36) REFERENCES employers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    pay_amount DECIMAL(12, 2) NOT NULL,
    pay_currency VARCHAR(10) DEFAULT 'UGX',
    pay_frequency VARCHAR(50) DEFAULT 'weekly' CHECK (pay_frequency IN ('daily', 'weekly', 'monthly', 'one-time', 'piece-rate')),
    employment_type VARCHAR(50) DEFAULT 'casual' CHECK (employment_type IN ('casual', 'part-time', 'full-time', 'contract', 'apprenticeship')),
    preferred_job_category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'filled', 'closed')),
    vacancies INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Job Skills Mapping
CREATE TABLE IF NOT EXISTS job_skills (
    job_id VARCHAR(36) REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id VARCHAR(36) REFERENCES skills(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (job_id, skill_id)
);

-- 15. Job Applications & Placements
CREATE TABLE IF NOT EXISTS job_applications (
    id VARCHAR(36) PRIMARY KEY,
    job_id VARCHAR(36) REFERENCES jobs(id) ON DELETE CASCADE,
    client_id VARCHAR(36) REFERENCES clients(id) ON DELETE CASCADE,
    match_score INTEGER DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100),
    status VARCHAR(50) DEFAULT 'matched' CHECK (status IN ('matched', 'applied', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled')),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Mobile-Money Payments
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    application_id VARCHAR(36) REFERENCES job_applications(id) ON DELETE SET NULL,
    client_id VARCHAR(36) REFERENCES clients(id) ON DELETE CASCADE,
    employer_id VARCHAR(36) REFERENCES employers(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'UGX',
    payment_provider VARCHAR(50) DEFAULT 'demo' CHECK (payment_provider IN ('demo', 'mtn', 'airtel')),
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'initiated', 'successful', 'failed')),
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    provider_response TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. In-App Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    client_id VARCHAR(36) REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('risk_alert', 'missed_checkin', 'new_checkin', 'job_match', 'application_update', 'payment_update', 'intervention_reminder', 'system')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Audit Logs (Immutable)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    ip_address VARCHAR(50),
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR HIGH-PERFORMANCE SEARCH & FILTERING
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone_number);
CREATE INDEX IF NOT EXISTS idx_clients_risk_level ON clients(current_risk_level);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_caseworker ON clients(assigned_caseworker_id);
CREATE INDEX IF NOT EXISTS idx_checkins_client ON check_ins(client_id);
CREATE INDEX IF NOT EXISTS idx_checkins_status ON check_ins(status);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_status ON risk_alerts(status);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_client ON risk_alerts(client_id);
CREATE INDEX IF NOT EXISTS idx_interventions_client ON interventions(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_job_apps_client ON job_applications(client_id);
CREATE INDEX IF NOT EXISTS idx_job_apps_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_payments_client ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
