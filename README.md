# AquaMonitor — Aquaponic IoT Simulation System

Simulator → Backend API → Firebase Realtime Database → Nuxt 4 Dashboard.

## Architecture (MVP)

```
Simulator (Node.js)
      │ HTTP POST /api/readings (every 5s)
      ▼
Express Backend (process + validate)
      │ write
      ▼
Firebase Realtime Database
      │ realtime listener
      ▼
Nuxt 4 + Tailwind Dashboard
```

## Project Structure

```
smart-aquaponic/
├── apps/
│   ├── api/          # Express backend (Firebase Admin writer)
│   ├── simulator/    # Node.js sensor simulator (HTTP client)
│   └── web/          # Nuxt 4 dashboard (Firebase listener)
└── docs/
```

## Firebase Schema

```
/aquaponic/sensors
  /latest          ← overwritten (1 record)
  /history/{pushId}← append-only
```

## Prerequisites

- Node.js 20+ (Nuxt 4 requirement)
- Firebase project with Realtime Database enabled
- A service account JSON for the backend (Firebase Admin SDK)

## Setup

```bash
npm install --prefix apps/api
npm install --prefix apps/simulator
npm install --prefix apps/web
```

Create env files:
```bash
cp apps/api/.env.example apps/api/.env
cp apps/simulator/.env.example apps/simulator/.env
cp apps/web/.env.example apps/web/.env
```

## Run (3 terminals)

Backend:
```bash
cd apps/api
npm run dev
```

Simulator:
```bash
cd apps/simulator
npm start
```

Dashboard:
```bash
cd apps/web
npm run dev
```

Note:
- If you don't set `NUXT_PUBLIC_FIREBASE_API_KEY`, dashboard will fall back to Firebase RTDB REST streaming (requires only `NUXT_PUBLIC_FIREBASE_DATABASE_URL` and open read rules).

## Backend Endpoints

- `GET /api/health`
- `POST /api/readings` (alias: `POST /api/ingest`)
