# Smart Aquaponic Dashboard

A real-time IoT aquaponic monitoring system with a data-driven dashboard, rule engine, and control system — runnable entirely without hardware via a simulator.

## Architecture

```
Simulator (Node.js)
      │
      │ HTTP POST /api/ingest (every 5s)
      ▼
Express Backend
      ├── Rule Engine (threshold evaluation)
      ├── Pump decision logic
      └── Write to Firebase RTDB
                  │
                  │ Firebase Realtime listener
                  ▼
         Nuxt 3 Dashboard
```

## Project Structure

```
smart-aquaponic/
├── apps/
│   ├── web/          # Nuxt 3 frontend dashboard
│   ├── api/          # Express.js backend API
│   └── simulator/    # Node.js sensor simulator
├── docs/
│   └── architecture.md
├── .env.example
├── .gitignore
└── README.md
```

## Sensor Thresholds

| Parameter  | Min  | Max  | Unit |
|------------|------|------|------|
| pH         | 6.5  | 7.5  | –    |
| TDS        | 200  | 800  | ppm  |
| Turbidity  | –    | 50   | NTU  |

## Prerequisites

- Node.js 18+
- npm or pnpm
- Firebase project (free Spark plan)

## Setup

1. Clone the repository:
```bash
git clone <repo-url>
cd smart-aquaponic
```

2. Install dependencies for all apps:
```bash
npm install --prefix apps/web
npm install --prefix apps/api
npm install --prefix apps/simulator
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Firebase credentials
```

## Running the Apps

### Backend (Express API)
```bash
cd apps/api
npm run dev
# Server runs on http://localhost:3001
```

### Simulator (Sensor Data Generator)
```bash
cd apps/simulator
npm start
# Sends data to http://localhost:3001/api/ingest every 5s
```

### Frontend (Nuxt 3 Dashboard)
```bash
cd apps/web
npm run dev
# Dashboard runs on http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/ingest` | Receive sensor data from simulator |
| POST | `/api/pump/mode` | Switch pump mode (auto/manual) |
| POST | `/api/pump/toggle` | Toggle pump state (manual mode only) |

## Firebase Schema

```
/aquaponic
  /sensors/latest         ← Latest sensor readings
  /sensors/history/{id}   ← Historical data (last 30 min)
  /alerts/latest          ← Current active alerts
  /control/pump           ← Pump state { mode, state }
```

## Development

### Git Workflow
```
main          ← stable, production-ready
  └── dev     ← integration branch
        └── feature/ISSUE-XX-short-description
```

### Commit Convention
```
feat(scope): description        → new feature
fix(scope): description         → bug fix
refactor(scope): description    → code improvement
chore(scope): description       → config/setup
docs(scope): description        → documentation
```

## License

MIT