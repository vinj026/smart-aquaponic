# Smart Aquaponic Dashboard — Architecture

## System Overview

The Smart Aquaponic Dashboard is a real-time IoT monitoring system that simulates an aquaponic environment. It consists of three main components: a sensor simulator, an Express backend with rule engine, and a Nuxt 3 frontend dashboard.

## Architecture Diagram

```
┌─────────────────┐
│   Simulator     │
│   (Node.js)     │
│                 │
│  - Generates    │
│    sensor data  │
│  - Injects      │
│    anomalies    │
└────────┬────────┘
         │ HTTP POST /api/ingest
         │ (every 5s)
         ▼
┌─────────────────────────────────────────┐
│           Express Backend               │
│           (Node.js)                     │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Ingest Endpoint                  │  │
│  │  POST /api/ingest                 │  │
│  └───────────────┬───────────────────┘  │
│                  │                      │
│  ┌───────────────▼───────────────────┐  │
│  │  Rule Engine                      │  │
│  │  - Threshold evaluation           │  │
│  │  - Pump decision logic            │  │
│  └───────────────┬───────────────────┘  │
│                  │                      │
│  ┌───────────────▼───────────────────┐  │
│  │  Firebase RTDB Writer             │  │
│  │  - sensors/latest                 │  │
│  │  - sensors/history                │  │
│  │  - alerts/latest                  │  │
│  │  - control/pump                   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                  │
                  │ Firebase Realtime Sync
                  ▼
┌─────────────────────────────────────────┐
│           Nuxt 3 Dashboard              │
│           (Vue 3 + Tailwind)            │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Status Indicator                 │  │
│  │  (Normal / Warning / Critical)    │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Alert Banner                     │  │
│  │  - Current alerts                 │  │
│  │  - Severity badges                │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Sensor Cards                     │  │
│  │  - pH, TDS, Turbidity, Temp       │  │
│  │  - Real-time updates              │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Historical Chart                 │  │
│  │  - 30 min time-series             │  │
│  │  - Threshold reference lines      │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Pump Control Panel               │  │
│  │  - Auto/Manual mode               │  │
│  │  - ON/OFF toggle                  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Firebase Schema

```
/aquaponic
  ├── /sensors
  │     ├── /latest          ← Latest sensor readings
  │     │     ├── ph: number
  │     │     ├── tds: number
  │     │     ├── turbidity: number
  │     │     └── timestamp: number
  │     └── /history         ← Historical data (max 60 entries)
  │           └── /{timestamp}
  │                 ├── ph: number
  │                 ├── tds: number
  │                 ├── turbidity: number
  │                 └── timestamp: number
  ├── /alerts
  │     └── /latest          ← Current active alert
  │           ├── type: string | null
  │           ├── message: string | null
  │           ├── severity: "warning" | "critical" | null
  │           └── timestamp: number
  └── /control
        └── /pump            ← Pump state
              ├── mode: "auto" | "manual"
              └── state: "ON" | "OFF"
```

## Sensor Thresholds

| Parameter  | Min  | Max  | Unit | Alert Type    |
|------------|------|------|------|---------------|
| pH         | 6.5  | 7.5  | –    | PH_LOW/PH_HIGH|
| TDS        | 200  | 800  | ppm  | TDS_LOW/TDS_HIGH|
| Turbidity  | –    | 50   | NTU  | TURBIDITY_HIGH|

## Rule Engine Logic

### Threshold Evaluation
```
IF pH < 6.5       → PH_LOW (warning)
IF pH > 7.5       → PH_HIGH (warning)
IF TDS < 200      → TDS_LOW (warning)
IF TDS > 800      → TDS_HIGH (critical) + pump OFF
IF turbidity > 50 → TURBIDITY_HIGH (warning)
All normal        → Clear alerts
```

### Pump Decision Logic
```
IF mode == "manual" → No automatic control (return null)
IF TDS > 800        → Pump OFF
ELSE                → Pump ON
```

## API Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/health` | Health check | – | `{ status: "ok" }` |
| POST | `/api/ingest` | Receive sensor data | `{ ph, tds, turbidity, timestamp }` | `{ success, data }` |
| POST | `/api/pump/mode` | Switch pump mode | `{ mode: "auto" \| "manual" }` | `{ mode, state }` |
| POST | `/api/pump/toggle` | Toggle pump state | `{}` | `{ mode, state }` |

## Data Flow

1. **Simulator** generates sensor data every 5 seconds
2. **Simulator** sends POST request to `/api/ingest`
3. **Backend** validates and saves data to Firebase
4. **Backend** runs rule engine on sensor data
5. **Backend** writes alerts and pump state to Firebase
6. **Frontend** receives real-time updates via Firebase listener
7. **Frontend** updates UI (cards, alerts, chart, pump control)

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | Nuxt 3, Vue 3, TailwindCSS, vue-chartjs |
| Backend | Node.js, Express |
| Database | Firebase Realtime Database |
| Simulator | Node.js |
| Deployment | Vercel (web), Railway (api + simulator) |

## Known Limitations

- No authentication/authorization (dev mode)
- History pruning keeps only last 60 entries
- Water temperature sensor not implemented (placeholder only)
- Single-user system (no multi-tenant support)