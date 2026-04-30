# Aquaguard IoT - Smart Aquaponic Dashboard

## 1. Project Overview

**Aquaguard IoT** is a data-driven aquaponic monitoring dashboard designed to provide real-time, actionable insights into an aquaponic ecosystem. 

The primary problem it solves is moving beyond raw sensor data displays to provide **intelligent system insights**. Instead of just showing numbers, the system interprets the data (e.g., pH, nutrient levels, turbidity, water volume) alongside the biological lifecycle context (plant and fish age) to offer immediate, readable diagnoses and suggested actions. It relies purely on simulated data for development and testing, operating without physical hardware dependencies.

## 2. System Architecture

The project follows a decoupled, real-time data architecture:

**Simulator → Backend (API) → Database → Dashboard (UI)**

1. **Simulator**: A Node.js background process that generates mock sensor readings (pH, TDS, turbidity, water level). It simulates natural fluctuations and triggers occasional anomaly events.
2. **Backend (API)**: Processes the incoming simulated data, applies logic if needed, and pushes it to the realtime database.
3. **Database (Firebase Realtime Database)**: Acts as the central pub/sub hub. The dashboard listens to a Firebase node to instantly react whenever new data is written.
4. **Dashboard (UI)**: The frontend client that consumes the Firebase stream. It calculates trends locally, derives system health, checks lifecycle rules, and visually renders the interface.

## 3. Tech Stack

- **Frontend**: Nuxt 3, Vue 3 (Composition API), Tailwind CSS v3+.
- **Backend / API**: Node.js, Express (or generic Node API layer).
- **Database**: Firebase Realtime Database.
- **Simulator**: Node.js script.

## 4. Features

- **Sensor Monitoring**: Real-time tracking of pH, TDS (ppm), Turbidity (NTU), and Water Level (%).
- **System Status Indicator**: A global health assessment (Normal, Warning, Critical) calculated based on whether any sensor is out of bounds.
- **Intelligent System Insight**: A diagnostic banner that translates the current system status into a readable cause-and-effect notification, coupled with a specific **Suggested Action**. 
- **Lifecycle Tracking**: Monitors "Crop Age" and "Fish Age", tagging them with biological phases (e.g., *Vegetative*, *Grow-out*, *Near Harvest*). This context drives insights when immediate sensor conditions are normal.
- **Historical Trend Chart**: A sparkline visualization displaying the timeline velocity (Increasing, Decreasing, Stable), a pulsing latest-data point, and peak/floor reference markers.
- **Simulated Control Panel (Optional integration boundary)**: Extensible UI patterns designed to allow manual overrides for pumps or feeders in the future.

## 5. Data Structure

The system consumes real-time data from Firebase. A typical latest payload structure looks like this:

```json
{
  "timestamp": 1714500000000,
  "ph": 7.2,
  "ph_status": "normal",
  "tds": 520,
  "tds_status": "normal",
  "turbidity": 4.5,
  "turbidity_status": "normal",
  "water_level": 88,
  "water_level_status": "normal",
  "overall_status": "normal"
}
```

- **`[metric]`**: The raw numeric value.
- **`[metric]_status`**: The severity state (`normal`, `warning`, `danger`), pre-processed or processed on ingestion.
- **`overall_status`**: Determines the global UI state. If any metric is `danger`, this becomes `danger`.
- **`timestamp`**: Epoch time used for the "Updated Xs ago" relative timer and chart sorting.

## 6. Logic & Rules

- **Status Determination**: 
  - Each metric has specific threshold rules (e.g., pH ideal is 6.5 - 7.5. Below 6.0 or above 8.0 might trigger `danger`).
- **Insight Generation**:
  - The UI prioritizes `danger` or `warning` states. If pH is high, the system surfaces the text: *"System pH is too alkaline..."* along with an action: *"Adjust pH using diluted buffers..."*.
- **Lifecycle Context**:
  - Fish and Crop Ages (measured in days) map to fixed phases (e.g., Crop > 30 days = *Near Harvest*).
  - If the `overall_status` is `normal`, the Insight engine falls back to checking the biological phase. If the crop is near harvest, it suggests preparing harvesting tools rather than displaying a generic "Systems nominal" message.

## 7. UI Structure

The dashboard adopts a strictly mobile-first, high-density, **Vercel-inspired** aesthetic inside a `max-w-md` container.

- **Header**: Contains the App title, "Updated 5s ago" live timer, and the Global Health badge.
- **Alert / System Insight Box**: A hierarchical card dedicated strictly to diagnoses, cause/effect text, and actionable suggestions.
- **Sensor Grid (2x2)**: Compact rows displaying the metric name, value, unit, and state-aware background styling (flushing amber/red subtly upon warnings).
- **Lifecycle Grid (1x2)**: Sits below the sensors, showcasing continuous system ages and micro-tags (e.g., *Vegetative*).
- **Chart Section**: The prominent "hero" visual displaying sparklines with velocity indicators.

**Design Principles**: Flat surfaces, 1px borders, tabular numbers, strictly limited padding (compact formatting), state-aware UI elements, and no colorful gradients/glassmorphism. 

## 8. Setup & Run Instructions

To run the full stack locally:

### Install Dependencies
Navigate to the root directory and install workspace dependencies (assuming mono-repo / standard layout):
```bash
npm install
```

### Run the Simulator
Generates mock data into the Firebase structure.
```bash
cd apps/simulator
npm run start
```

### Run the Backend (API)
(Optional depending on exact data flow routing)
```bash
cd apps/api
npm run dev
```

### Run the Frontend Dashboard
```bash
cd apps/web
npm run dev
```
Open `http://localhost:3000` to view the UI.

## 9. Development Workflow

- **Branching**: Do all active development in the `dev` branch. Create feature branches (`feat/xyz`) for major inclusions. 
- **Commit Convention**: Strict adherence to Conventional Commits (e.g., `feat(ui): add chart`, `fix(api): resolve payload mismatch`).
- **Adding Features**: 
  - To add a new sensor, define its metric and status in the backend Simulator payload, then add a `CompactSensorRow` to `index.vue`.
  - Extend insights logic inside the `insightText` and `suggestedAction` computed properties in `index.vue`.

## 10. Future Improvements

This codebase is specifically architected for scalability. Future transitions include:
- **Hardware Integration**: Replacing the Simulator app with an MQTT broker or direct Firebase writers from ESP32/Raspberry Pi microcontrollers.
- **Two-Way Telemetry**: Activating the UI to write control commands back to Firebase (e.g., an "Activate Feeder" button) which hardware nodes would listen to.
- **Auth & Multi-Tenancy**: Integrating Firebase Auth to allow multiple users to manage distinct tanks or farms.
- **Time-Series DB Integration**: Migrating history arrays to a robust TSDB (like InfluxDB or Timescale) to handle massive historical records.
