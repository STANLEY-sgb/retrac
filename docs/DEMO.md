# ReTrac Live Demonstration Scenario & Judge Walkthrough

**DOMINION 2026 — Track 05: Rehabilitation & Reintegration**

This guide walks through the live end-to-end demonstration scenario designed specifically for the DOMINION 2026 judging committee.

---

## 1. Demo Credentials

| Role | Name | Email | Password |
|------|------|-------|----------|
| **Admin** | Musinguzi Alituha Stanley | `admin@retrac.ug` | `Password123!` |
| **Caseworker 1** | Bwambale Sulait | `sulait.bwambale@retrac.ug` | `Password123!` |
| **Caseworker 2** | Sarah Namukasa | `sarah.namukasa@retrac.ug` | `Password123!` |
| **Employer** | Kampala Skills & Services Ltd | `employer@kampalaskills.ug` | `Password123!` |

---

## 2. The 10-Step Live Judge Scenario

### Step 1: Login
- Navigate to `http://localhost:5173/login`
- Click the **"Quick Login as Caseworker (Bwambale Sulait)"** button.
- Observe immediate redirect to the Caseworker Dashboard.

### Step 2: Review Initial Dashboard Metrics
- Observe the live metric cards: Total Patients (12), Stable (6), Monitor (3), At Risk (2), Critical (1).
- Notice the Recovery Distribution donut chart, weekly check-in compliance, and recent activity feed.

### Step 3: Inspect Patient John Okello (cli-01)
- Go to `/clients` and find **John Okello** (`+256772111222`).
- Open John's profile (`/clients/cli-01`).
- Confirm John is currently in **STABLE** recovery state with score `12/100`.

### Step 4: Open the Live SMS Simulator
- Click **"SMS Simulator"** in the top navigation or sidebar (`/demo/sms`).
- Under Step 1, select **John Okello**.
- Under Step 2, select **"2 — Struggling"** (or enter a custom distress message such as *"I am finding it hard to stay focused and have strong cravings"*).
- Click **"Send SMS & Run Full Pipeline"**.

### Step 5: Observe Full Backend Pipeline Execution
- The simulator updates the feature phone screen with the inbound reply.
- The real backend executes:
  1. Phone number normalization (`+256772111222`).
  2. Patient identification.
  3. NLP distress analysis.
  4. Risk score calculation in `RiskEngine` (+25 points added).
  5. High-Risk Alert creation (`risk_alerts` table).
  6. Real-time toast notification dispatched.
  7. Automated compassionate SMS response returned to John.

### Step 6: Verify Dashboard Escalation
- Return to `/dashboard`.
- Notice the **🚨 CRITICAL / AT RISK Active Alert Banner** at the top displaying John Okello with explainable clinical reasons:
  - *Reply indicated struggling "2" (+25)*
  - *Multiple consecutive struggling check-ins (+20)*
- The "At Risk" and "Critical" counter increments in real-time.

### Step 7: Record Caseworker Intervention
- Click **"Conduct Follow-Up"** on John's profile or alert banner.
- Open the Intervention modal:
  - **Type**: Phone Call / Counseling
  - **Action Taken**: *"Conducted 25-minute motivational interview and scheduled family check-in."*
  - **Outcome**: Successful
  - **Resolve Active Alert**: Checked (Yes)
- Click **"Log Intervention"**.
- Observe John's risk score stabilize and the active alert resolve automatically.

### Step 8: Match John to Reintegration Employment
- Navigate to **"Skill Matcher"** (`/job-matches`) or click **"Match Jobs"** from John's profile.
- Select John Okello.
- The matching algorithm evaluates:
  - Skill overlap (Carpentry, Stock Handling, Cleaning) -> 60% weight
  - Location proximity (Makindye, Kampala) -> 20% weight
  - Category preference -> 20% weight
- Observe **"Store Inventory Assistant"** at Kampala Skills & Services Ltd scoring **87% Match**.
- Click **"Match & Apply Patient"**.

### Step 9: Employer Work Completion & Payment Approval
- Navigate to **"Mobile Money"** (`/payments`) or **"Payment Simulator"** (`/demo/payment`).
- Select John Okello and the completed job placement.
- Specify stipend amount: `UGX 25,000`.
- Click **"Execute Mobile Money Payout"**.

### Step 10: Confirm Real Transaction Reference
- The payment engine initiates the transfer through the configured provider (Demo / MTN MoMo / Airtel).
- A verified reference is issued: `RTR-2026-00000X`.
- The live mobile money stream updates immediately showing `UGX 25,000 SUCCESS`.
- Full recovery and economic reintegration loop is complete!
