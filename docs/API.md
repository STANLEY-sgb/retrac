# ReTrac REST API Reference

**DOMINION 2026 — Track 05: Rehabilitation & Reintegration**

Base URL: `http://localhost:5000/api` (or production Render backend URL)  
Authentication: `Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/login`
Authenticate a user (admin, caseworker, employer).
- **Request Body**:
  ```json
  {
    "email": "sulait.bwambale@retrac.ug",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "token": "eyJhbGciOi...",
    "user": {
      "id": "usr-cw-01",
      "name": "Bwambale Sulait",
      "email": "sulait.bwambale@retrac.ug",
      "role": "caseworker"
    }
  }
  ```

### `POST /api/auth/logout`
Log out and record an audit log event.

### `GET /api/auth/me`
Retrieve authenticated user profile and caseworker/employer metadata.

---

## 2. Dashboard (`/api/dashboard`)

### `GET /api/dashboard`
Returns live system metrics, risk distribution, check-in completion, open alerts, and real-time activity stream.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "cards": {
        "totalClients": 12,
        "activeClients": 11,
        "stable": 6,
        "monitor": 3,
        "atRisk": 2,
        "critical": 1,
        "receivedCheckins": 8,
        "missedCheckins": 2,
        "openJobs": 15,
        "placementsCount": 2,
        "totalDisbursed": 110000
      },
      "charts": {
        "recoveryDistribution": [...],
        "weeklyTrend": [...]
      },
      "activeAlerts": [...],
      "liveFeed": {
        "sms": [...],
        "interventions": [...],
        "payments": [...]
      }
    }
  }
  ```

---

## 3. Clients Management (`/api/clients`)

### `GET /api/clients`
List clients with search, status, riskLevel, and caseworker filters.
- **Query Parameters**:
  - `search`: string (Name, phone, treatment center, location)
  - `status`: `active` | `completed` | `lost_contact`
  - `riskLevel`: `STABLE` | `MONITOR` | `AT_RISK` | `CRITICAL`
  - `caseworkerId`: string
  - `sort`: `highest_risk` | `lowest_risk` | `newest` | `name`

### `POST /api/clients`
Register a new client/patient.
- **Request Body**:
  ```json
  {
    "full_name": "Peter Ouma",
    "phone_number": "+256772333444",
    "gender": "Male",
    "age": 28,
    "treatment_centre": "Butabika National Referral Hospital",
    "enrollment_date": "2026-05-10",
    "recovery_start_date": "2026-05-10",
    "assigned_caseworker_id": "cw-01",
    "location": "Makindye, Kampala",
    "preferred_job_category": "Logistics & Stock Handling",
    "skill_ids": ["sk-04", "sk-06"],
    "emergency_contact_name": "Grace Ouma",
    "emergency_contact_phone": "+256772999888"
  }
  ```

### `GET /api/clients/:id`
Returns 360° patient recovery profile, timeline, check-in history, risk score history, interventions, job placements, and mobile money payments.

### `PUT /api/clients/:id`
Update client profile fields and skill tags.

### `GET /api/clients/:id/matches`
Returns ranked jobs matching the client's skills, location, and preferred category with full match score breakdown (0–100%).

---

## 4. SMS & USSD Webhooks (`/api/webhook` & `/api/checkins`)

### `POST /api/webhook/sms`
Inbound webhook receiver compatible with Africa's Talking SMS callback format.
- **Request Body**:
  ```json
  {
    "from": "+256772111222",
    "text": "2 - Struggling with cravings"
  }
  ```
- **Workflow**:
  1. Identifies client by phone number.
  2. Saves message into `sms_messages`.
  3. Updates check-in status to `received`.
  4. Runs NLP sentiment & distress analyzer.
  5. Computes updated risk score in `RiskEngine`.
  6. Escalates alert and broadcasts notification if score >= 50.
  7. Sends empathetic SMS confirmation back to patient.

### `POST /api/checkins/send`
Dispatches automated weekly check-in SMS broadcasts to all active patients due for check-in.

### `POST /api/checkins/send/:clientId`
Dispatches an immediate check-in SMS prompt to a specific patient.

---

## 5. Clinical Risk & Interventions (`/api/risk` & `/api/interventions`)

### `POST /api/risk/resolve/:alertId`
Resolves an active high-risk alert, records resolution notes, and adjusts the patient's risk score downwards.

### `GET /api/interventions`
List historical interventions with filter by client, type, or outcome.

### `POST /api/interventions`
Log a caseworker follow-up intervention:
- **Request Body**:
  ```json
  {
    "client_id": "cli-01",
    "caseworker_id": "cw-01",
    "type": "phone_call",
    "description": "Follow-up call regarding struggling check-in response",
    "action_taken": "Conducted 20-minute counseling and scheduled in-person session",
    "outcome": "successful",
    "notes": "Patient expressed relief and agreed to attend peer meeting",
    "resolve_active_alert": true
  }
  ```

---

## 6. Jobs & Skill Matching (`/api/jobs`)

### `GET /api/jobs`
List all reintegration job vacancies with employer details and skill requirements.

### `POST /api/jobs`
Create a new job posting (Employer or Admin role).

### `POST /api/jobs/:id/apply`
Match and apply a client to a job vacancy.

---

## 7. Mobile Money Payments (`/api/payments`)

### `POST /api/payments/trigger`
Triggers a mobile money stipend payout via MTN MoMo, Airtel Money, or Demo Provider.
- **Request Body**:
  ```json
  {
    "clientId": "cli-01",
    "applicationId": "app-01",
    "amount": 25000,
    "currency": "UGX",
    "notes": "Store inventory assistant daily placement stipend"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Payment disbursed successfully via Demo Provider.",
    "data": {
      "paymentId": "pay-391290fa",
      "reference": "RTR-2026-000004",
      "status": "successful",
      "amount": 25000,
      "currency": "UGX",
      "recipient": {
        "name": "John Okello",
        "phone": "+256772111222"
      }
    }
  }
  ```

---

## 8. Demo Simulator Endpoints (`/api/demo`)

### `POST /api/demo/sms`
Simulates a patient SMS check-in through the identical production backend pipeline.

### `POST /api/demo/payment`
Simulates a stipend payment with realistic reference generation.

### `POST /api/demo/reset`
Resets the database to pristine demonstration state.

---

## 9. Health Status (`/api/health`)

### `GET /api/health`
Returns health check status of database, SMS provider, AI provider, and payment gateway.
