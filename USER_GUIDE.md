# 📘 ReTrac Platform — Comprehensive User Manual & Operational Guide

> **Project:** ReTrac — *“Stay Connected. Stay Recovered. Rebuild Your Life.”*  
> **Event:** DOMINION 2026 Hackathon | **Track 05:** Rehabilitation & Reintegration  
> **Target Audience:** Caseworkers, Rehabilitation Clinicians, Programme Managers, System Administrators, Partner Employers, and Hackathon Evaluators.

---

## 📑 Table of Contents

1. [Executive Summary & System Overview](#1-executive-summary--system-overview)
2. [User Roles & Access Levels](#2-user-roles--access-levels)
3. [Step-by-Step Navigation & Section Directory](#3-step-by-step-navigation--section-directory)
   - [Section 1: Landing Page & Public Information](#section-1-landing-page--public-information)
   - [Section 2: Authentication & Secure Sign-In](#section-2-authentication--secure-sign-in)
   - [Section 3: Caseworker Overview & Clinical Dashboard](#section-3-caseworker-overview--clinical-dashboard)
   - [Section 4: Patient Registry & 360° Profile Management](#section-4-patient-registry--360-profile-management)
   - [Section 5: Patient Intake & Enrollment Form](#section-5-patient-intake--enrollment-form)
   - [Section 6: SMS Check-In System & Logs](#section-6-sms-check-in-system--logs)
   - [Section 7: Active Risk Alerts & Explainable AI Triage](#section-7-active-risk-alerts--explainable-ai-triage)
   - [Section 8: Caseworker Interventions & Care Actions](#section-8-caseworker-interventions--care-actions)
   - [Section 9: Reintegration Jobs Board & Posting](#section-9-reintegration-jobs-board--posting)
   - [Section 10: Automated Skill & Job Matcher](#section-10-automated-skill--job-matcher)
   - [Section 11: Employer Directory & Partner Portal](#section-11-employer-directory--partner-portal)
   - [Section 12: Mobile Money Payouts & Stipends](#section-12-mobile-money-payouts--stipends)
   - [Section 13: Clinical Reports & CSV Data Export](#section-13-clinical-reports--csv-data-export)
   - [Section 14: System Settings & Clinical Weight Tuning](#section-14-system-settings--clinical-weight-tuning)
   - [Section 15: Administration & User Management](#section-15-administration--user-management)
   - [Section 16: Immutable Audit Logs & Compliance](#section-16-immutable-audit-logs--compliance)
   - [Section 17: Interactive SMS & Mobile Money Simulators](#section-17-interactive-sms--mobile-money-simulators)
4. [Recovering Patient Workflow (2G Feature Phone SMS Experience)](#4-recovering-patient-workflow-2g-feature-phone-sms-experience)
5. [End-to-End Operational Walkthrough (The "Golden Flow")](#5-end-to-end-operational-walkthrough-the-golden-flow)
6. [Frequently Asked Questions & Troubleshooting](#6-frequently-asked-questions--troubleshooting)

---

## 1. Executive Summary & System Overview

**ReTrac** is a digital aftercare and economic reintegration platform designed specifically for individuals recovering from substance use disorders in Uganda. 

### Why ReTrac Exists:
* **The Aftercare Gap:** In Uganda, over **70% of individuals who complete residential rehabilitation relapse within 90 days** due to a complete breakdown of follow-up once they leave the treatment centre.
* **Technology Reality:** The majority of recovering individuals in low-income urban and peri-urban areas (Kampala, Wakiso, Mukono, Jinja, Gulu) use **basic 2G feature phones** (e.g., button phones) and lack smartphones, continuous internet connectivity, or mobile data bundles.
* **The Solution:** ReTrac bridges this gap by connecting treatment centres to patients via **zero-friction 2G SMS prompts**, evaluating relapse risk using an **Explainable Clinical AI Risk Engine**, providing **immediate caseworker intervention tools**, and offering **sustainable economic reintegration** through verified jobs and instant **Mobile Money stipends (MTN MoMo & Airtel Money)**.

---

## 2. User Roles & Access Levels

| Role | Target Persona | Primary Responsibilities & Permissions |
| :--- | :--- | :--- |
| **Caseworker / Counselor** | Rehabilitation counselors, social workers, community case managers | • Monitor patient risk trajectories & check-in replies.<br>• Enroll new clients into the recovery registry.<br>• Respond to active risk alerts and document care interventions.<br>• Match recovering patients with vetted employment openings.<br>• Trigger performance-based reintegration stipends. |
| **System Administrator** | Clinical directors, IT managers, programme evaluators | • Everything a Caseworker can do, plus:<br>• Manage staff user accounts (create, activate, deactivate).<br>• Configure risk engine weights, SMS schedules, and service providers.<br>• Review immutable compliance audit logs.<br>• Export institutional donor and clinical impact reports. |
| **Employer Partner** | Vetted businesses, social enterprises, micro-enterprises | • Post vacancies with specific skill requirements and daily pay rates.<br>• Review candidate applications matched by ReTrac.<br>• Accept applicants, track shift progress, and confirm work completion.<br>• Authorize Mobile Money stipend payouts for completed jobs. |
| **Recovering Client / Patient** | Individuals in post-rehab aftercare across Uganda | • Receives automated weekly SMS check-in prompts on basic 2G phones.<br>• Replies with 1 (Stable) or 2 (Struggling) or free-text descriptions.<br>• Receives motivational follow-ups, caseworker calls, and job offers.<br>• Receives Mobile Money stipends directly to their registered SIM. |

---

## 3. Step-by-Step Navigation & Section Directory

### Section 1: Landing Page & Public Information (`/`)
* **Purpose:** Introduces the ReTrac mission, key statistics on substance rehabilitation in Uganda, core features (2G SMS, Explainable AI, Job Matching, Mobile Money), and quick navigation entry points.
* **Key Actions:** 
  - Click **Explore Live Demo** to jump straight to the SMS Simulator.
  - Click **Portal Login** to enter the workspace.

### Section 2: Authentication & Secure Sign-In (`/login`)
* **Purpose:** Provides secure, JWT-authenticated entry into the ReTrac clinical workspace.
* **1-Click Demo Login (DOMINION 2026):**
  - **Bwambale Sulait** (`sulait.bwambale@retrac.ug`): Senior Caseworker.
  - **Sarah Namukasa** (`sarah.namukasa@retrac.ug`): Community Caseworker.
  - **Musinguzi Alituha Stanley** (`admin@retrac.ug`): System Administrator.
  - **Kampala Skills & Services** (`employer@kampalaskills.ug`): Employer Partner.

### Section 3: Caseworker Overview & Clinical Dashboard (`/dashboard`)
* **Purpose:** The primary command centre providing real-time clinical triage, patient recovery statistics, compliance metrics, and live event monitoring.
* **Key Actions:**
  - **Active Alerts Banner:** High-visibility banner highlighting any patient flagged as Critical or At-Risk.
  - **Top KPI Cards:** Enrolled Clients, Stable (0-29), Monitor (30-49), At Risk (50-74), Critical (75-100).
  - **Check-in Compliance & Disbursed Funds:** Real-time metrics from the database.
  - **Visual Charts:** Donut recovery distribution and weekly check-in trend curves.
  - **Live Activity Feed:** Streaming updates of check-ins, risk recalculations, and payouts.

### Section 4: Patient Registry & 360° Profile (`/clients` & `/clients/:id`)
* **Purpose:** Longitudinal care tracking and comprehensive clinical dossiers.
* **Key Actions:**
  - **Search & Filter:** Search by name, phone, or location; filter by risk level or status.
  - **360° Profile View:** Gauge needle showing 0–100 risk score, active alerts, risk history, check-in log, interventions, jobs, and Mobile Money payouts.
  - **Send Check-in:** Instantly triggers an SMS check-in to that specific patient's phone.
  - **Log Intervention:** Opens the clinical action modal to document care provided.

### Section 5: Patient Intake & Enrollment Form (`/clients/new`)
* **Purpose:** Registers recovering patients discharged from rehabilitation centres into automated monitoring.
* **Key Actions:**
  - Enter full name, phone number (`+256...`), age, gender, rehabilitation centre, and home location.
  - Select preferred job category and assign verified skills (Cleaning, Agriculture, Stock Handling, etc.).
  - Enter emergency contact/sponsor and clinical intake notes.

### Section 6: SMS Check-In System & Logs (`/check-ins`)
* **Purpose:** Operational log of all automated weekly SMS prompts sent and replies received across Uganda.
* **Key Actions:**
  - **Broadcast Weekly Check-In:** Triggers the scheduled batch SMS check-in to all active clients.
  - **Review Sentiment & Code:** View whether patients replied `1` (Stable), `2` (Struggling), or descriptive text with automated NLP sentiment tags.

### Section 7: Active Risk Alerts & Explainable AI Triage (`/risk-alerts`)
* **Purpose:** Real-time emergency triage list for patients exhibiting relapse risk indicators.
* **Explainable Risk Reasons:** Clear clinical justifications (e.g., reply "2", missed check-ins, negative sentiment).
* **Key Actions:** Click **Resolve & Log Intervention** to document caseworker counseling and return the patient to a stabilized trajectory.

### Section 8: Caseworker Interventions & Care Actions (`/interventions`)
* **Purpose:** Centralized medical/social work record of all counseling sessions, home visits, phone calls, and referrals.
* **Key Actions:** Click **New Intervention** to record a new care action, its outcome, and whether it resolves active alerts.

### Section 9: Reintegration Jobs Board & Posting (`/jobs`, `/jobs/new`, `/jobs/:id`)
* **Purpose:** Marketplace of recovery-friendly, vetted employment opportunities in Uganda.
* **Key Actions:** Post jobs with pay rates (daily, weekly), view applicants with match percentages, accept candidates, mark shifts completed, and disburse pay.

### Section 10: Automated Skill & Job Matcher (`/job-matches`)
* **Purpose:** Algorithmic matching engine connecting recovering patients to suitable jobs:
  $$\text{Match Score} = 60\% \text{ Skills} + 20\% \text{ Location} + 20\% \text{ Category Preference}$$
* **Key Actions:** Select any client to immediately calculate and view ranked job matches with percentage breakdowns.

### Section 11: Employer Directory & Partner Portal (`/employers`)
* **Purpose:** Directory of partner companies providing supportive workplaces for recovering individuals.

### Section 12: Mobile Money Payouts & Stipends (`/payments`)
* **Purpose:** Financial ledger tracking daily wage and stipend disbursements sent to clients via MTN Mobile Money and Airtel Money.
* **Key Actions:** Click **Trigger Payout** to disburse funds. Every transaction generates an immutable **`RTR-2026-XXXXXX`** reference code.

### Section 13: Clinical Reports & CSV Data Export (`/reports`)
* **Purpose:** Clinical KPI evaluations, 90-day retention metrics, weekly trend graphs, and one-click **Export CSV** for institutional reporting.

### Section 14: System Settings & Clinical Weights (`/settings`)
* **Purpose:** Admin controls to adjust risk engine scoring weights (missed check-in points, struggling reply points), check-in schedules, and provider modes.

### Section 15: Administration & User Management (`/admin/users`)
* **Purpose:** Staff management to create, activate, or deactivate caseworker and employer accounts.

### Section 16: Immutable Audit Logs & Compliance (`/admin/audit-logs`)
* **Purpose:** Tamper-proof chronological log recording every single system action, timestamp, IP address, and JSON metadata.

### Section 17: Interactive SMS & Payment Simulators (`/demo/sms` & `/demo/payment`)
* **Purpose:** Test the end-to-end backend processing pipeline in real-time without physical SIM cards or live telecom charges.

---

## 4. Recovering Patient Workflow (2G Feature Phone SMS Experience)

1. **Monday 08:00 AM EAT:** Patient receives an SMS prompt on their button phone:
   > *"ReTrac Check-In: Hello John, how is your recovery this week? Reply 1 for Doing Well / Stable, or 2 if you are Struggling / Need Support."*
2. **Patient Replies:** The patient texts back `1`, `2`, or descriptive text (e.g., *"2 - feeling stressed today"*).
3. **Automated Response (within 2 seconds):**
   > *"ReTrac: Thank you for sharing honestly, John. Your recovery team is here for you. A caseworker will be in touch shortly to support you. You are not alone."*
4. **Caseworker Follow-Up:** A critical triage alert appears on the caseworker dashboard; the caseworker places a phone call or schedules a visit to stabilize the client.

---

## 5. End-to-End Operational Walkthrough (The "Golden Flow")

1. **Sign In:** Go to `/login` and click **Bwambale Sulait** (Caseworker).
2. **Review Dashboard:** Go to `/dashboard` and check the recovery stats.
3. **Simulate a Risk Event:** Go to `/demo/sms`, select **John Okello**, type `2 - Struggling with cravings`, and click **Send Inbound SMS**.
4. **Inspect the Triage Alert:** Go to `/dashboard` or `/risk-alerts`. Notice that John Okello has been flagged with an increased risk score and explainable reasons.
5. **Log Clinical Intervention:** Click **Resolve & Log Intervention**, enter *"Completed counseling call; patient stabilized"*, and save. John's risk level drops back to Stable.
6. **Find Job Opportunity:** Go to `/job-matches`, select **John Okello**, and view his top job matches. Click **Apply Candidate**.
7. **Employer Confirmation & Payout:** Go to `/jobs/job-02`, accept the application, click **Mark Complete**, and click **Trigger Payout**.
8. **Verify Financial Ledger:** Go to `/payments` and `/admin/audit-logs` to confirm the payout reference `RTR-2026-XXXXXX` has been immutably recorded.

---

*ReTrac Platform • Developed for the DOMINION 2026 Hackathon (Track 05: Rehabilitation & Reintegration)*  
*“Stay Connected. Stay Recovered. Rebuild Your Life.”*