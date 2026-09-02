# ReTrac Live Demonstration Scenario & Judge Walkthrough

**DOMINION 2026 — Track 05: Rehabilitation & Reintegration**

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

1. **Login as Caseworker**: Sign in as **Bwambale Sulait** (`sulait.bwambale@retrac.ug`).
2. **Dashboard Overview**: View live cards, charts, and activity feeds populated with actual database metrics.
3. **Inspect Patient**: Open **John Okello** (`/clients/cli-01`) — currently **STABLE** (Score `12/100`).
4. **Open SMS Simulator**: Go to **"SMS Simulator"** (`/demo/sms`), select **John Okello**, choose **"2 — Struggling"**, and click **"Send SMS & Run Full Pipeline"**.
5. **Observe Real Backend Execution**: Watch the phone preview update as the backend processes the message, recalculates risk score (+25), creates a risk alert, and broadcasts notifications.
6. **Verify Dashboard Escalation**: Return to `/dashboard` — John Okello appears in the active alerts banner.
7. **Record Follow-Up Intervention**: Click **"Conduct Follow-Up"** on John's profile, record counseling notes, and mark alert resolved.
8. **Reintegration Job Match**: Open **"Skill Matcher"** (`/job-matches`). Match John to **Store Inventory Assistant** (87% Match).
9. **Disburse Mobile Money**: Go to **"Payment Simulator"** (`/demo/payment`), select John, and execute stipend payout of `UGX 25,000`.
10. **Verify Transaction Reference**: Confirm payout receives official `RTR-2026-XXXXXX` reference and updates live payments feed.
