# ReTrac Security & Privacy Specification

**DOMINION 2026 — Track 05: Rehabilitation & Reintegration**

---

## 1. Threat Modeling & Safeguards

Addiction recovery data involves sensitive personal health information. ReTrac adheres to strict healthcare privacy safeguards:

### 1.1 Authentication & Authorization
- **BCrypt Hashing**: All passwords salted and hashed with minimum 10 rounds.
- **Stateless JWTs**: Signed with secure server-side secrets with expiration (`7d`).
- **Role-Based Guards**: Protected routes (`/admin/*`, `/settings`) enforce roles.

### 1.2 Defense in Depth
- **Helmet.js**: Sets CSP, HSTS, X-Frame-Options, and X-Content-Type-Options.
- **CORS Allowlist**: Restricts cross-origin requests to configured frontend URLs.
- **Express Rate Limiting**: 200 requests per 15-minute window per IP.
- **Parameterized SQL**: All database queries use parameter placeholders (`$1`, `$2` in Postgres / `?` in SQLite) to eliminate SQL injection risks.

### 1.3 Assistive Clinical AI Boundary
- AI models are assistive-only for text distress triage; they **never** diagnose addiction or replace clinical decision-making.
- Patient medical records are strictly anonymized before external API analysis.
- When external APIs are unavailable, rule-based fallback engines execute with full explainability.

### 1.4 Immutable Audit Logging
The `audit_logs` table records every critical system event:
- User logins & logouts
- Patient creations & updates
- SMS check-in receptions & risk score updates
- Alerts raised & resolved
- Mobile Money disbursements
