# ReTrac Database Schema & Data Dictionary

**DOMINION 2026 — Track 05: Rehabilitation & Reintegration**

ReTrac utilizes a dual-engine architecture:
- **Production Engine**: PostgreSQL on Render with connection pooling and SSL encryption.
- **Development/Test Engine**: Embedded SQLite database (`data/retrac.db` and `data/test.db`) providing zero-configuration offline execution.

---

## 1. Table Definitions & Relationships

| # | Table Name | Purpose | Primary Key | Foreign Keys |
|---|------------|---------|-------------|--------------|
| 1 | `system_settings` | Dynamic platform parameters and risk weights | `key` | None |
| 2 | `users` | Core accounts (admin, caseworker, employer) | `id` | None |
| 3 | `caseworkers` | Clinical caseworker profiles & client counts | `id` | `user_id` -> `users(id)` |
| 4 | `employers` | Registered partner companies offering jobs | `id` | `user_id` -> `users(id)` |
| 5 | `skills` | Master skill catalog (Carpentry, Cooking, etc.) | `id` | None |
| 6 | `clients` | Recovering patients in aftercare program | `id` | `assigned_caseworker_id` -> `caseworkers(id)` |
| 7 | `client_skills` | Many-to-many client skills mapping | `(client_id, skill_id)` | `client_id`, `skill_id` |
| 8 | `sms_messages` | Inbound/outbound SMS & USSD message history | `id` | `client_id` -> `clients(id)` |
| 9 | `check_ins` | Weekly scheduled check-in tracking & sentiment | `id` | `client_id` -> `clients(id)` |
| 10 | `risk_scores` | Immutable clinical risk calculation audit log | `id` | `client_id` -> `clients(id)` |
| 11 | `risk_alerts` | Active and resolved triage risk alerts | `id` | `client_id`, `caseworker_id`, `resolved_by` |
| 12 | `interventions` | Caseworker clinical follow-ups and notes | `id` | `client_id`, `caseworker_id` |
| 13 | `jobs` | Reintegration job vacancies and pay rates | `id` | `employer_id` -> `employers(id)` |
| 14 | `job_skills` | Required skills for job positions | `(job_id, skill_id)` | `job_id`, `skill_id` |
| 15 | `job_applications`| Job matching, applications, and work status | `id` | `job_id`, `client_id` |
| 16 | `payments` | MTN/Airtel Mobile Money disbursement records | `id` | `application_id`, `client_id`, `employer_id` |
| 17 | `notifications` | In-app notification alerts for staff | `id` | `user_id`, `client_id` |
| 18 | `audit_logs` | Immutable audit trail for all system events | `id` | `user_id` -> `users(id)` |
