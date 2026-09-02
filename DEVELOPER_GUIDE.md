# ReTrac Developer & Programmer Guide

**DOMINION 2026 — Track 05: Rehabilitation & Reintegration**  
*Comprehensive handbook for engineers maintaining, extending, and testing the ReTrac platform.*

---

## 1. System Philosophy & Architecture Principles

### 1.1 Core Business Rule: Backend is the Brain
The frontend (React/Vite) is strictly a presentation and state synchronization layer.
- **NEVER** calculate risk scores, match formulas, authentication privileges, or payment statuses inside React components.
- All clinical business logic, risk weighting, NLP analysis, phone number normalization, and transaction reference generation **MUST reside in the backend service layer** (`backend/src/services/`).

### 1.2 Dual Database Architecture
ReTrac uses a database abstraction layer (`backend/src/database/db.js`) supporting:
1. **Embedded SQLite (`better-sqlite3`)**: Runs out of the box in `data/retrac.db` (and `data/test.db` for tests) without requiring a PostgreSQL server locally.
2. **PostgreSQL (`pg`)**: Activates automatically in production or when a valid `DATABASE_URL` is configured in `.env`.
3. **Query Compatibility**: Queries use PostgreSQL parameter syntax (`$1`, `$2`, etc.), which `db.js` automatically adapts for SQLite when running locally.

---

## 2. Directory Structure & Key Files

```
retrac/
├── backend/
│   ├── data/                   # SQLite database files (.gitignored)
│   ├── src/
│   │   ├── config/
│   │   │   ├── constants.js    # Risk thresholds, weights, and levels
│   │   │   └── env.js          # Validated environment variables
│   │   ├── controllers/        # Request handlers & HTTP response formatting
│   │   │   ├── authController.js
│   │   │   ├── clientController.js
│   │   │   ├── checkinController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── demoController.js
│   │   │   ├── jobController.js
│   │   │   ├── paymentController.js
│   │   │   └── webhookController.js
│   │   ├── database/
│   │   │   ├── db.js           # Database connection & query helper
│   │   │   ├── schema.sql      # 18-table relational DDL schema
│   │   │   ├── migrate.js      # Migration runner
│   │   │   ├── seed.js         # Realistic Uganda demo data seeder
│   │   │   └── resetDemo.js    # Fast database state reset
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT verification & role-based access control (RBAC)
│   │   │   ├── errorHandler.js # Standardized error responses
│   │   │   └── rateLimiter.js  # Express rate limiting
│   │   ├── routes/             # Express route declarations
│   │   ├── services/           # CORE BUSINESS LOGIC ENGINES:
│   │   │   ├── audit/          # auditService.js (Immutable compliance logging)
│   │   │   ├── matching/       # jobMatchingService.js (60/20/20 matching algorithm)
│   │   │   ├── notification/   # notificationService.js (In-app staff broadcasts)
│   │   │   ├── payment/        # paymentService.js + Provider abstractions
│   │   │   ├── risk/           # riskEngine.js & aiRiskAnalyzer.js
│   │   │   └── sms/            # smsService.js + Africa's Talking & Demo providers
│   │   ├── app.js              # Express app configuration & middleware
│   │   └── server.js           # HTTP server startup
│   └── tests/                  # Jest test suites
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js       # Axios instance with Bearer token interceptor
│   │   ├── components/
│   │   │   ├── common/         # StatCard, RiskScoreGauge, StatusBadge, Modal, Toast
│   │   │   ├── dashboard/      # ActiveAlertsBanner, RecoveryDistributionChart, LiveActivityFeed
│   │   │   └── layout/         # AppLayout, Navbar, Sidebar
│   │   ├── context/
│   │   │   ├── AuthContext.jsx         # User authentication & token lifecycle
│   │   │   └── NotificationContext.jsx # Live 12-second polling & toast alerts
│   │   ├── pages/              # 23 full-page application views
│   │   ├── App.jsx             # React Router v6 & PrivateRoute role guards
│   │   └── main.jsx
│   └── vite.config.js          # Vite config with backend proxy
│
└── docs/                       # Architectural & API Documentation
```

---

## 3. Core Subsystems & How They Work

### 3.1 SMS Check-in & Inbound Webhook Pipeline
When an SMS arrives from a patient (or via `/demo/sms` simulator):

```
Inbound SMS
   │
   ▼
POST /api/webhook/sms (or POST /api/demo/sms)
   │
   ▼
SmsService.processIncomingSms({ from, text, provider })
   │
   ├── 1. Phone Normalization: Converts local formats (0772...) to E.164 (+256772...)
   ├── 2. Client Identification: Matches phone against `clients` table
   ├── 3. Job Command Check: If text is "JOB", returns 3 matching jobs via SMS
   ├── 4. Response Classification: Parses "1" (Well), "2" (Struggling), or Free-Text
   ├── 5. AI/NLP Distress Analysis: AiRiskAnalyzer evaluates emotional distress
   ├── 6. Check-in Persistence: Updates `check_ins` record
   ├── 7. Risk Engine Execution: RiskEngine.updateRiskScore() recalculates risk
   ├── 8. Alert Escalation: If score >= 50, creates `risk_alerts` record
   ├── 9. Staff Notification: NotificationService.broadcastToStaff() fires toast
   └── 10. Patient Auto-Reply: Sends empathetic SMS confirmation back to patient
```

### 3.2 The Clinical Risk Engine (`backend/src/services/risk/riskEngine.js`)

#### Scoring Formula:
The score starts at 0 and adds deterministic clinical weights:

| Trigger Event | Points | Reason Code |
|---|---|---|
| Reply `"2"` (Struggling) | `+25` | `Reply indicated struggling "2"` |
| Missed Weekly Check-in | `+15` | `Missed weekly check-in` |
| 2+ Consecutive Struggling Check-ins | `+20` | `Multiple consecutive struggling check-ins` |
| 3+ Total Missed Check-ins | `+20` | `3 or more total missed check-ins` |
| NLP Distress Signal (Free-text) | `+20` | `High emotional distress keywords detected` |
| Active Unresolved Alert | `+10` | `Existing unresolved risk alert` |
| Successful Caseworker Intervention | `-30` to `-35` | `Caseworker follow-up completed` |
| Reply `"1"` (Doing well) | `-20` | `Reply indicated doing well "1"` |

*Final score is strictly clamped between `0` and `100`.*

#### Threshold Classifications:
```
0  – 29  : STABLE   (Green)  -> Normal weekly cadence
30 – 49  : MONITOR  (Yellow) -> Watchlist for caseworker
50 – 74  : AT_RISK  (Orange) -> Active high-risk alert generated
75 – 100 : CRITICAL (Red)    -> Immediate clinical intervention required
```

### 3.3 Reintegration Job Matching Engine (`backend/src/services/matching/jobMatchingService.js`)

Calculates a match percentage (0–100%) between a client and an open job posting using three weighted dimensions:

$$\text{Total Score} = \text{Skill Score (60\%)} + \text{Location Score (20\%)} + \text{Category Score (20\%)}$$

1. **Skills (Max 60 pts)**:
   $$\text{Skill Score} = \left(\frac{\text{Client Matched Skills}}{\text{Job Required Skills}}\right) \times 60$$
2. **Location (Max 20 pts)**:
   - Same district / area (e.g. Makindye, Nakawa, Kampala): `20 pts`
   - Adjacent district (e.g. Kampala $\leftrightarrow$ Wakiso): `15 pts`
   - Different district: `5 pts`
3. **Category Preference (Max 20 pts)**:
   - Matches client's preferred category: `20 pts`
   - No preference specified: `10 pts`
   - Mismatched: `0 pts`

### 3.4 Mobile Money Payment Engine (`backend/src/services/payment/paymentService.js`)

- **Reference Format**: `RTR-2026-XXXXXX` (e.g. `RTR-2026-000004`).
- **Provider Abstraction**: Extends `PaymentProviderInterface`.
- **Implementations**:
  - `DemoPaymentProvider`: Realistic simulation with artificial 300ms latency.
  - `MtnMomoProvider`: Production integration with MTN Open API Collections & Disbursements.
  - `AirtelMoneyProvider`: Production integration with Airtel Money B2C API.
- **Workflow State**: `pending` $\rightarrow$ `initiated` $\rightarrow$ `successful` / `failed`. Updates linked `job_applications.status = 'completed'` upon success.

---

## 4. How to Extend the Codebase

### 4.1 Adding a New REST API Endpoint
1. **Controller**: Create or add a method in `backend/src/controllers/myController.js`:
   ```javascript
   static async getMyData(req, res, next) {
     try {
       const data = await db.query('SELECT * FROM my_table WHERE user_id = $1', [req.user.id]);
       return res.json({ success: true, data: data.rows });
     } catch (err) {
       next(err);
     }
   }
   ```
2. **Route**: Add route in `backend/src/routes/myRoute.routes.js`:
   ```javascript
   const router = require('express').Router();
   const { authenticateToken, requireRole } = require('../middleware/auth');
   router.get('/my-data', authenticateToken, requireRole(['caseworker', 'admin']), MyController.getMyData);
   module.exports = router;
   ```
3. **Mount in `backend/src/routes/index.js`**:
   ```javascript
   router.use('/my-feature', myRoutes);
   ```

### 4.2 Adding a New Database Table
1. Open `backend/src/database/schema.sql` and add the `CREATE TABLE IF NOT EXISTS` block with UUID primary key, foreign keys, timestamps, and indexes.
2. In `backend/src/database/seed.js`, add initial realistic demonstration records.
3. Run:
   ```bash
   cd backend && npm run seed
   ```

### 4.3 Adding a New Frontend Page
1. Create `frontend/src/pages/MyNewPage.jsx`.
2. Open `frontend/src/App.jsx` and add the route inside the `<AppLayout />` child routes:
   ```jsx
   <Route path="my-feature" element={<MyNewPage />} />
   ```
3. Add navigation link in `frontend/src/components/layout/Sidebar.jsx`.

---

## 5. Testing Guide

The test suite uses Jest and Supertest with an isolated SQLite database (`backend/data/test.db`).

### Running Tests:
```bash
cd backend
npm test
```

### Test Structure:
- `backend/tests/integration.test.js`: Full end-to-end integration test exercising the complete user journey:
  - Auth $\rightarrow$ Client List $\rightarrow$ Inbound SMS Webhook $\rightarrow$ Risk Score Escalation $\rightarrow$ Caseworker Intervention $\rightarrow$ Job Match $\rightarrow$ Mobile Money Payout.
- `backend/tests/riskEngine.test.js`: Unit tests verifying scoring weights, boundary conditions, and clamping (0–100).
- `backend/tests/jobMatching.test.js`: Unit tests verifying 60/20/20 matching calculations.

---

## 6. Common Developer Gotchas & Tips

1. **Phone Number Formatting**: Ugandan numbers should be saved in E.164 format (e.g. `+256772111222`). Always pass raw input through `SmsService.normalizePhoneNumber(phone)`.
2. **Database Queries**: Always use parameterized queries (`db.query('SELECT ... WHERE id = $1', [id])`) to ensure compatibility across SQLite and PostgreSQL, and prevent SQL injection.
3. **Frontend API Calls**: Always use `api` from `frontend/src/api/client.js` instead of raw `fetch` or `axios`. It automatically injects the JWT Bearer token and handles session expiration redirects.
4. **Real-time Live Polling**: The dashboard and notification centers poll every 12–15 seconds via `NotificationContext.jsx` and `DashboardPage.jsx`. When testing locally, changes update automatically without manual page refreshes.
