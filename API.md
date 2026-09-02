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

### `POST /api/auth/logout`
Log out and record an audit log event.

### `GET /api/auth/me`
Retrieve authenticated user profile and caseworker/employer metadata.

---

## 2. Dashboard (`/api/dashboard`)

### `GET /api/dashboard`
Returns live system metrics, risk distribution, check-in completion, open alerts, and real-time activity stream.

---

## 3. Clients Management (`/api/clients`)

### `GET /api/clients`
List clients with search, status, riskLevel, and caseworker filters.

### `POST /api/clients`
Register a new client/patient.

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
Log a caseworker follow-up intervention.

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
