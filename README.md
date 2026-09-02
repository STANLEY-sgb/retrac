# ReTrac — Digital Aftercare & Reintegration Platform

<div align="center">
  <h3><strong>Stay Connected. Stay Recovered. Rebuild Your Life.</strong></h3>
  <p><strong>DOMINION 2026 Hackathon — Track 05: Rehabilitation & Reintegration</strong></p>
  <p><em>Target Context: Uganda (Kampala, Wakiso, Mukono, Jinja, Gulu)</em></p>
</div>

---

## 🌟 The Core Principle

> **"Build for the phone people already own, not the phone we wish they had."**

In Uganda and across East Africa, recovering individuals post-rehabilitation often lack reliable internet, laptops, or smartphones, but virtually all have access to basic 2G feature phones with SMS and USSD.

**ReTrac** bridges this gap:
1. **Automated Weekly SMS/USSD Check-ins** (`1` = Doing well, `2` = Struggling).
2. **Deterministic & Explainable Clinical Risk Engine** (Scores 0–100 with category thresholds `STABLE`, `MONITOR`, `AT_RISK`, `CRITICAL`).
3. **Assistive AI Free-Text Triage** detecting emotional distress and cravings without replacing trained human caseworkers.
4. **Caseworker Intervention Hub** with real-time risk alerts and 360-degree patient recovery profiles.
5. **Reintegration Employment & Skill Matching Engine** (60% skills, 20% location, 20% category).
6. **Mobile Money Disbursal Engine** via MTN MoMo, Airtel Money, and Demo Provider with formal `RTR-2026-XXXXXX` references.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Recharts, Lucide React, Axios |
| **Backend** | Node.js, Express.js, JWT Auth, BCrypt, Helmet, CORS, Express Rate Limit, Morgan |
| **Database** | PostgreSQL (Production on Render) & Embedded SQLite (`better-sqlite3` for offline local dev/testing) — 18 Relational Tables & Indexes |
| **External Integrations** | Africa's Talking (SMS/USSD), OpenAI API (Free-Text Distress Triage), MTN MoMo, Airtel Money |
| **Testing** | Jest, Supertest (15 unit & end-to-end integration tests) |
| **Deployment** | Render Web Service (Backend), Render Static Site (Frontend), Render PostgreSQL, Render Cron |

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18+) & npm

### 1. Clone & Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Seed the Database
Populates 12 patients, 3 caseworkers, 3 employers, 15 jobs, active alerts, check-in history, and mobile money records:
```bash
cd backend
npm run seed
```

### 3. Run the Complete Platform
You can start both backend (port 5000) and frontend (port 5173) simultaneously:
```bash
# In backend terminal:
cd backend
npm run dev

# In frontend terminal:
cd frontend
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend REST API**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`

---

## 🔑 Demo User Accounts

| Role | Name | Email | Password |
|------|------|-------|----------|
| **Admin** | Musinguzi Alituha Stanley | `admin@retrac.ug` | `Password123!` |
| **Caseworker 1** | Bwambale Sulait | `sulait.bwambale@retrac.ug` | `Password123!` |
| **Caseworker 2** | Sarah Namukasa | `sarah.namukasa@retrac.ug` | `Password123!` |
| **Employer** | Kampala Skills & Services Ltd | `employer@kampalaskills.ug` | `Password123!` |

*(One-click quick login buttons are available directly on the login page).*

---

## 🧪 Live Demonstration Walkthrough (DOMINION 2026 Judges)

1. **Login as Caseworker**: Sign in as **Bwambale Sulait** (`sulait.bwambale@retrac.ug`).
2. **Dashboard Overview**: View live cards (12 Clients, 6 Stable, 3 Monitor, 2 At Risk, 1 Critical), active alerts, and recovery chart.
3. **Inspect Patient**: Open **John Okello** (`/clients/cli-01`) — currently **STABLE** (Score `12/100`).
4. **Open SMS Simulator**: Go to **"SMS Simulator"** (`/demo/sms`), select **John Okello**, choose **"2 — Struggling"** (or custom distress message), and click **"Send SMS & Run Full Pipeline"**.
5. **Observe Real Backend Execution**: Watch the feature phone interface update. The real backend identifies John, logs inbound SMS, runs NLP sentiment analysis, increases risk score (+25 pts), creates an alert, broadcasts notifications, and dispatches a compassionate auto-reply.
6. **Verify Dashboard Escalation**: Return to `/dashboard` — John Okello appears in the **🚨 ACTIVE RISK ALERTS** banner with explainable clinical reasons.
7. **Record Follow-Up Intervention**: Click **"Conduct Follow-Up"** on John's profile, record counseling notes, and mark alert resolved. Observe John's score stabilize.
8. **Reintegration Job Match**: Open **"Skill Matcher"** (`/job-matches`). Match John to **Store Inventory Assistant** (87% Match) and submit placement.
9. **Disburse Mobile Money**: Go to **"Payment Simulator"** (`/demo/payment`), select John, and execute stipend payout of `UGX 25,000`.
10. **Verify Transaction Reference**: Confirm payout receives official `RTR-2026-00000X` reference and appears in live payments feed.

---

## 🧪 Running Automated Tests

Run the full Jest test suite (15 passed unit and integration tests):
```bash
cd backend
npm test
```

### Verified Test Suites:
- `tests/integration.test.js`: Full end-to-end user journey (Auth -> Clients -> Webhook -> Risk Escalation -> Intervention -> Job Match -> Mobile Money).
- `tests/riskEngine.test.js`: Rule-based risk scoring weights, clinical thresholds, and score clamping (0–100).
- `tests/jobMatching.test.js`: Multi-factor matching algorithm (60% skill, 20% location, 20% category).

---

## 📁 Repository Structure

```
retrac/
├── backend/
│   ├── src/
│   │   ├── config/            # Environment & clinical constants
│   │   ├── controllers/       # 16 REST API controllers
│   │   ├── database/          # PostgreSQL schema, migrations & seeders
│   │   ├── middleware/        # JWT auth, rate limiter & error handler
│   │   ├── routes/            # 17 route definitions
│   │   ├── services/          # Core business logic:
│   │   │   ├── audit/         # Immutable audit logging
│   │   │   ├── matching/      # Reintegration job matching engine
│   │   │   ├── notification/  # In-app broadcast service
│   │   │   ├── payment/       # MTN MoMo, Airtel & Demo payment providers
│   │   │   ├── risk/          # Rule-based RiskEngine & AI Risk Analyzer
│   │   │   └── sms/           # Africa's Talking & Demo SMS providers
│   │   ├── app.js             # Express application setup
│   │   └── server.js          # Server entrypoint
│   ├── tests/                 # Jest integration & unit test suites
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/               # Axios API client with JWT interceptor
│   │   ├── components/        # Layout, Dashboard, Gauges, Modals, StatCards
│   │   ├── context/           # AuthContext & NotificationContext
│   │   ├── pages/             # 23 full-featured React views
│   │   ├── App.jsx            # Routing and role guards
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
│
├── docs/                      # Architectural, API & deployment docs
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE.md
│   ├── DEMO.md
│   ├── DEPLOYMENT.md
│   └── SECURITY.md
│
├── render.yaml                # Render cloud deployment blueprint
├── docker-compose.yml         # Container configuration
└── README.md
```

---

## 🔒 Security & Privacy Notice

This software handles sensitive recovery information:
- Passwords hashed with BCrypt.
- Parameterized SQL prevents SQL injection.
- Role-based route authorization separates caseworker, admin, and employer actions.
- AI features are strictly assistive for sentiment triage and **never** diagnose or substitute medical professionals.
- Demo data uses fictional personas for hackathon demonstration purposes.

---

## 🏆 DOMINION 2026 Submission Summary

- **Track**: Track 05 — Rehabilitation & Reintegration
- **Platform**: ReTrac MVP
- **Built By**: Senior Full-Stack Engineering Team
- **Tagline**: *Stay Connected. Stay Recovered. Rebuild Your Life.*
