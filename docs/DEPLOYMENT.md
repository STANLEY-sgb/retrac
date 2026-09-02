# ReTrac Cloud Deployment Guide (Render)

**DOMINION 2026 — Track 05: Rehabilitation & Reintegration**

ReTrac is configured for deployment on **Render** (as specified in `render.yaml`).

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

```yaml
services:
  # 1. Backend REST API
  - type: web
    name: retrac-backend
    env: node
    plan: free
    region: frankfurt
    rootDir: backend
    buildCommand: npm install
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: retrac-postgres
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: FRONTEND_URL
        value: https://retrac.onrender.com
      - key: SMS_PROVIDER
        value: demo
      - key: PAYMENT_PROVIDER
        value: demo
      - key: DEMO_MODE
        value: "true"

  # 2. Frontend React Client
  - type: web
    name: retrac-frontend
    env: static
    plan: free
    region: frankfurt
    rootDir: frontend
    buildCommand: npm install && npm run build
    staticPublishPath: dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: VITE_API_URL
        value: https://retrac-backend.onrender.com/api

databases:
  - name: retrac-postgres
    plan: free
    region: frankfurt
    databaseName: retrac
    user: retrac_admin
```

---

## 3. Scheduled Check-In Cron Job

To automatically send check-ins every Monday morning (08:00 UTC / 11:00 EAT):

- **Cron Expression**: `0 8 * * 1`
- **Command**:
  ```bash
  curl -X POST https://retrac-backend.onrender.com/api/checkins/send \
       -H "Authorization: Bearer $INTERNAL_CRON_SECRET"
  ```
