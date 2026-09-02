# ReTrac Security & Privacy Specification

**DOMINION 2026 — Track 05: Rehabilitation & Reintegration**

---

## 1. Security Architecture & Threat Model

1. **Authentication & Password Protection**:
   - Salted and hashed passwords with BCrypt (10 rounds).
   - Stateless JWT tokens signed with secure server secret (`7d` expiration).
   - Role-based route authorization guards for `admin`, `caseworker`, and `employer`.

2. **Network & Web Security**:
   - Helmet.js for secure HTTP headers.
   - CORS allowlist for trusted origins.
   - API rate limiting (200 req / 15 min window).
   - Parameterized queries to eliminate SQL injection.

3. **Clinical AI Boundary**:
   - AI models strictly triage free-text messages for distress and sentiment.
   - Models **never** diagnose addiction or replace clinical decision-making.
   - Full rule-based fallback when external APIs are unavailable.

4. **Audit Trail**:
   - Immutable audit logging in `audit_logs` records all user logins, client data modifications, alert resolutions, and mobile money payouts.
