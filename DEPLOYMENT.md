# ReTrac Cloud Deployment Guide (Render)

**DOMINION 2026 — Track 05: Rehabilitation & Reintegration**

---

## 1. Architecture on Render

```
1. Render PostgreSQL Database  -->  Persistent relational storage (SSL enabled)
2. Render Web Service          -->  Node.js / Express backend API (Port 5000 / $PORT)
3. Render Static Site          -->  Vite React single page application (Port 5173 / static CDN)
4. Render Cron Job             -->  Scheduled weekly check-in trigger
```

---

## 2. Infrastructure Configuration (`render.yaml`)

Refer to `render.yaml` in the root repository for automated infrastructure as code deployment.

---

## 3. Scheduled Check-In Cron Job

To automatically send check-ins every Monday morning (08:00 UTC / 11:00 EAT):

- **Cron Expression**: `0 8 * * 1`
- **Command**:
  ```bash
  curl -X POST https://retrac-backend.onrender.com/api/checkins/send \
       -H "Authorization: Bearer $INTERNAL_CRON_SECRET"
  ```
