# AquaMonitor — Architecture (MVP)

## Overview

This project is a simulated aquaponic monitoring system with clear separation of concerns:

```
Simulator → Backend API → Firebase RTDB → Nuxt 4 Dashboard
```

## Data Flow

1. **Simulator** generates random readings every N seconds
2. **Simulator** sends raw JSON to the backend via `POST /api/readings`
3. **Backend** validates + computes per-parameter status (`normal` / `warning` / `danger`)
4. **Backend** writes processed readings to Firebase Realtime Database:
   - `readings/latest` (overwrite)
   - `readings/history/{pushId}` (append)
5. **Dashboard (Nuxt 4)** subscribes to RTDB and updates UI in realtime (no polling)

## Firebase Paths

```
/aquaponic/sensors
  /latest
  /history/{pushId}
```

## Backend Endpoints

- `GET /api/health`
- `POST /api/readings` (alias: `POST /api/ingest`)
