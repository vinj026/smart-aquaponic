# Aquaguard IoT — Product Requirements Document

**Version:** 2.0  
**Status:** In Development  
**Platform:** Web (Nuxt 3 + Supabase)  
**Last Updated:** 2025  
**Author:** Kevin

---

### Version History

| Versi | Platform | Stack | Keterangan |
|---|---|---|---|
| v0 | Mobile (React Native) | React Native + Firebase Realtime DB | Tugas Akhir — tidak bisa diakses publik tanpa install app |
| v1 | Web | Nuxt 3 + Tailwind CSS + Firebase Realtime DB + Node.js Simulator | Rebuild pertama ke web, simulator jalan sebagai Node.js process terpisah |
| v2 *(current)* | Web | Nuxt 3 + Tailwind CSS + Supabase (PostgreSQL + Realtime + Edge Function) | Migrasi dari Firebase ke Supabase, persistent storage, simulator via cron |

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [System Architecture](#4-system-architecture)
5. [Tech Stack](#5-tech-stack)
6. [Features](#6-features)
7. [Data Structure](#7-data-structure)
8. [Sensor Thresholds & Logic](#8-sensor-thresholds--logic)
9. [UI Structure & Design System](#9-ui-structure--design-system)
10. [Deployment](#10-deployment)
11. [Git Workflow](#11-git-workflow)
12. [Future Improvements](#12-future-improvements)

---

## 1. Project Overview

Aquaguard IoT adalah dashboard monitoring aquaponik berbasis web yang menyediakan insight real-time dan actionable terhadap ekosistem aquaponik. Sistem ini dirancang untuk melampaui tampilan data sensor mentah — menginterpretasikan data (pH, kadar nutrisi, turbiditas, volume air) bersama konteks siklus biologis (umur tanaman dan ikan) untuk menghasilkan diagnosis yang mudah dibaca beserta saran tindakan yang spesifik.

Project ini merupakan evolusi dari dua iterasi sebelumnya:

- **v0** — Aplikasi mobile React Native sebagai Tugas Akhir. Fungsional namun tidak bisa didemonstrasikan ke publik tanpa install app.
- **v1** — Rebuild ke web menggunakan Nuxt 3 + Firebase Realtime DB. Dashboard sudah bisa diakses browser, namun simulator masih butuh server terpisah dan tidak ada persistent storage.
- **v2** *(dokumen ini)* — Migrasi ke Supabase untuk menggabungkan realtime, persistent storage, dan simulator dalam satu platform. Target: fully deployable di Vercel tanpa server tambahan, live selama 6+ bulan tanpa biaya.

---

## 2. Problem Statement

Sistem monitoring aquaponik konvensional hanya menampilkan angka sensor tanpa konteks. Angka pH 7.8 tidak bermakna bagi petani pemula tanpa pengetahuan apakah nilai itu aman, borderline, atau berbahaya — apalagi dikaitkan dengan fase biologis tanaman dan ikan yang sedang tumbuh.

**Aquaguard menyelesaikan ini dengan:**

- Menggabungkan threshold sensor dengan kesadaran siklus biologis
- Menghasilkan diagnosis dalam bahasa yang mudah dipahami
- Memberikan saran tindakan yang spesifik dan kontekstual
- Menyimpan riwayat data untuk analisis tren jangka panjang

---

## 3. Target Users

| User Type | Konteks | Kebutuhan Utama |
|---|---|---|
| Petani skala kecil | Monitor 1-3 tank aquaponik, background teknis terbatas | Alert instan dan saran tindakan dalam bahasa sederhana |
| Hobbyist / Enthusiast | Setup aquaponik rumahan, monitor sesekali | Status kesehatan sistem sekilas tanpa membaca angka mentah |
| Peneliti / Mahasiswa | Eksperimen aquaponik, butuh data historis | Export data CSV dan visualisasi tren historis |

---

## 4. System Architecture

### 4.1 Arsitektur v0 — React Native (Tugas Akhir)

```
Hardware Sensor / Mock Data → Firebase Realtime DB → Mobile App (React Native)
```

**Keterbatasan:**
- Tidak bisa diakses publik tanpa install APK
- Tidak ada persistent storage — data hilang saat app ditutup
- Tidak ada riwayat data historis
- Sulit di-demo ke penyeleksi portofolio

---

### 4.2 Arsitektur v1 — Nuxt 3 + Firebase (Saat Ini)

```
Node.js Simulator (long-running process)
        │
        ▼
Firebase Realtime DB ──► Dashboard (Nuxt 3 + Tailwind)
```

**Yang sudah berjalan di v1:**
- Realtime sensor display via Firebase listener
- Intelligent insight engine
- Lifecycle tracking (Crop Age + Fish Age)
- Sparkline chart (data sementara, tidak persisten)
- System health indicator

**Keterbatasan v1 yang mendorong upgrade ke v2:**
- Simulator butuh server terpisah yang jalan terus (tidak bisa di Vercel)
- Firebase hanya menyimpan state terbaru — tidak ada riwayat data
- Tidak ada event log, tidak ada export CSV
- Tidak ada dark mode
- Firebase dan hosting frontend = dua platform terpisah

---

### 4.3 Arsitektur v2 — Nuxt 3 + Supabase (Target)

```
Supabase Edge Function (Cron)
        │
        ▼
Supabase PostgreSQL ──► Supabase Realtime ──► Dashboard (Nuxt 3 / Vercel)
        │
        ▼
  API Functions
  (Vercel Functions)
```

**Alur data lengkap:**

1. **Supabase Edge Function** berjalan sebagai cron job setiap 30-60 detik, menggantikan simulator Node.js yang sebelumnya butuh server tersendiri.
2. Edge Function men-generate pembacaan sensor simulasi dan menyimpannya ke **Supabase PostgreSQL**.
3. **Supabase Realtime** mendeteksi INSERT baru dan mem-push update ke semua klien yang sedang terhubung via WebSocket.
4. **Dashboard Nuxt 3** menerima update realtime, menghitung tren lokal, dan merender ulang UI.
5. **Vercel Functions** (`/api/*`) menangani query historis dan ekspor data.

### 4.3 Keunggulan Arsitektur Baru

- **Zero additional server** — tidak butuh Railway atau VPS terpisah
- **Persistent storage** — riwayat data tersimpan di PostgreSQL
- **Auto keep-alive** — cron job mencegah Supabase auto-pause
- **Satu platform database** — Firebase dihapus sepenuhnya, diganti Supabase

---

## 5. Tech Stack

| Layer | Teknologi | Alasan |
|---|---|---|
| Frontend | Nuxt 3, Vue 3 (Composition API) | SSR-ready, familiar dari LaundryIn |
| Styling | Tailwind CSS v3 | Utility-first, dark mode support |
| Database | Supabase (PostgreSQL) | Free tier, built-in Realtime, auto-pause prevention via cron |
| Realtime | Supabase Realtime | Ganti Firebase, satu platform |
| Simulator | Supabase Edge Function + pg_cron | Ganti Node.js process, tidak butuh server terpisah |
| API | Vercel Functions (`/api/*`) | Serverless, co-located dengan frontend |
| Deployment | Vercel | Free tier, zero config untuk Nuxt |
| State Management | Pinia | Standar Vue 3 ecosystem |
| Chart | Chart.js / Lightweight Charts | Sparkline + historical chart |

---

## 6. Features

### 6.1 Feature Overview

| Feature | Deskripsi | Prioritas | Status |
|---|---|---|---|
| Realtime Sensor Display | Tampilan pH, TDS, Turbidity, Water Level secara live | Critical | Done (perlu migrasi ke Supabase) |
| System Health Indicator | Badge global Normal / Warning / Danger | Critical | Done |
| Intelligent Insight Engine | Diagnosis otomatis + saran tindakan kontekstual | Critical | Done (perlu upgrade logika) |
| Lifecycle Tracking | Crop Age + Fish Age dengan fase biologis | High | Done (perlu input manual) |
| Historical Chart | Grafik tren data dengan time range selector | Critical | Missing — harus dibuat |
| Event Log | Log kronologis semua anomali sensor | High | Missing — harus dibuat |
| Alert / Notifikasi | Push notification atau in-app alert saat sensor masuk zona danger | High | Missing — harus dibuat |
| Dark Mode | Toggle dark/light mode | High | Missing — harus dibuat |
| Export CSV | Download riwayat data sebagai file CSV | Medium | Missing — harus dibuat |
| Threshold Customization | User bisa ubah batas normal/warning/danger per sensor | Medium | Missing — harus dibuat |
| Responsive Layout | Layout adaptif mobile, tablet, desktop | High | Partial (max-w-md only) |

---

### 6.2 Detail Fitur

#### F-01: Realtime Sensor Display

Menampilkan empat sensor utama dalam grid 2x2 yang diperbarui secara live.

**Sensor yang ditampilkan:**

| Sensor | Satuan | Deskripsi |
|---|---|---|
| pH | - | Tingkat keasaman air |
| TDS (Total Dissolved Solids) | ppm | Konsentrasi nutrisi terlarut |
| Turbidity | NTU | Tingkat kekeruhan air |
| Water Level | % | Persentase volume air dalam tank |

**Acceptance Criteria:**
- Data diperbarui setiap kali Supabase Realtime menerima INSERT baru
- Setiap kartu sensor menampilkan: nama sensor, nilai terkini, satuan, badge status (Normal/Warning/Danger)
- Warna background kartu berubah secara halus sesuai status (putih → amber → merah)
- Timestamp "Updated X seconds ago" diperbarui setiap detik

---

#### F-02: System Health Indicator

Badge global di header yang merepresentasikan kondisi keseluruhan sistem.

**Logika:**
```
if any sensor == "danger"  → overall = "danger"
else if any sensor == "warning" → overall = "warning"  
else → overall = "normal"
```

**Acceptance Criteria:**
- Badge berubah warna dan label sesuai status keseluruhan
- Badge visible di semua ukuran layar tanpa terpotong

---

#### F-03: Intelligent Insight Engine

Panel diagnostik yang menerjemahkan kondisi sistem menjadi teks yang mudah dipahami beserta saran tindakan.

**Prioritas pengecekan:**
1. Jika ada sensor berstatus `danger` → tampilkan diagnosis danger + saran
2. Jika ada sensor berstatus `warning` → tampilkan diagnosis warning + saran
3. Jika semua `normal` → cek fase biologis lifecycle, tampilkan saran berbasis fase
4. Fallback → "Semua parameter dalam kondisi normal."

**Contoh output insight:**

| Kondisi | Diagnosis | Saran Tindakan |
|---|---|---|
| pH > 8.0 | "pH sistem terlalu basa, dapat menghambat penyerapan nutrisi oleh tanaman." | "Tambahkan larutan buffer pH Down secara bertahap. Ukur ulang setelah 30 menit." |
| TDS < 200 ppm | "Konsentrasi nutrisi terlalu rendah untuk pertumbuhan optimal." | "Tambahkan larutan nutrisi sesuai dosis yang direkomendasikan untuk fase tanaman saat ini." |
| Semua normal, Crop Age > 30 hari | "Tanaman mendekati fase panen." | "Siapkan peralatan panen. Kurangi pemberian nutrisi secara bertahap 3-5 hari sebelum panen." |

**Upgrade yang diperlukan (dari v1):**

- Tambahkan deteksi tren: "pH stabil namun TDS terus naik selama 2 jam terakhir → potensi overfeeding."
- Tambahkan correlational insight: pH tinggi + TDS tinggi + turbidity naik = kemungkinan overfeeding.

---

#### F-04: Lifecycle Tracking

Melacak umur tanaman (Crop Age) dan umur ikan (Fish Age) dalam hari, dengan mapping ke fase biologis.

**Fase Biologis Tanaman:**

| Fase | Rentang Hari | Deskripsi |
|---|---|---|
| Seedling | 0 - 7 hari | Fase perkecambahan |
| Vegetative | 8 - 29 hari | Fase pertumbuhan daun aktif |
| Near Harvest | 30+ hari | Mendekati waktu panen |

**Fase Biologis Ikan:**

| Fase | Rentang Hari | Deskripsi |
|---|---|---|
| Fingerling | 0 - 29 hari | Benih / bibit ikan |
| Grow-out | 30 - 89 hari | Fase pertumbuhan aktif |
| Near Harvest | 90+ hari | Mendekati ukuran panen |

**Fitur baru yang harus ditambahkan:**
- UI untuk input tanggal tanam dan tanggal tebar ikan (sebelumnya hardcoded)
- Data tersimpan di Supabase agar persisten antar sesi

---

#### F-05: Historical Chart

Grafik tren data historis dengan kemampuan memilih rentang waktu.

**Time Range Options:** 1H / 6H / 24H / 7D

**Tampilan per chart:**
- Garis tren utama untuk metrik yang dipilih
- Indikator velocity: Increasing ↑ / Decreasing ↓ / Stable →
- Marker peak (nilai tertinggi) dan floor (nilai terendah) dalam range
- Titik data terbaru dengan pulsing indicator

**Metric selector:** pH / TDS / Turbidity / Water Level (tab atau dropdown)

**Acceptance Criteria:**
- Chart merender data dari Supabase sesuai range waktu yang dipilih
- Loading state saat fetch data
- Empty state jika belum ada data historis

---

#### F-06: Event Log

Panel log kronologis yang mencatat semua peristiwa anomali sensor.

**Tipe event yang dicatat:**

| Tipe | Trigger | Warna |
|---|---|---|
| `danger` | Sensor masuk zona danger | Merah |
| `warning` | Sensor masuk zona warning | Amber |
| `recovery` | Sensor kembali ke zona normal dari warning/danger | Hijau |

**Format entry log:**
```
[timestamp relatif] [nama sensor] [nilai] — [deskripsi singkat]

Contoh:
"12 menit lalu — pH mencapai 8.4, melampaui batas aman (8.0)"
"5 menit lalu — pH kembali normal (7.6)"
```

**Acceptance Criteria:**
- Maksimal menampilkan 50 event terbaru
- Scrollable panel dengan fixed height
- Event disimpan di Supabase (tabel terpisah `sensor_events`)

---

#### F-07: Dark Mode

Toggle dark/light mode yang mengikuti preferensi sistem secara default.

**Implementasi:**
- Deteksi `prefers-color-scheme` saat pertama load
- Toggle manual via ikon di header
- Preferensi disimpan di `localStorage`
- Implementasi via Tailwind CSS `darkMode: 'class'`

**Acceptance Criteria:**
- Semua komponen memiliki dark variant yang readable
- Status colors (danger red, warning amber) menggunakan versi muted di dark mode — bukan neon
- Transisi mode smooth (tidak flash)

---

#### F-08: Export CSV

Tombol download riwayat data sebagai file CSV.

**Format filename:** `aquaguard-export-[YYYY-MM-DD].csv`

**Kolom CSV:**
```
timestamp, ph, ph_status, tds, tds_status, turbidity, turbidity_status, water_level, water_level_status, overall_status
```

**Acceptance Criteria:**
- Export sesuai time range yang sedang aktif di Historical Chart
- File langsung terdownload tanpa redirect
- Timestamp dalam format ISO 8601

---

### 6.3 Fitur yang Tidak Masuk v2 (Backlog)

- Multi-tank support
- Push notification (Web Push API)
- Threshold customization UI
- Auth & multi-user

---

## 7. Data Structure

### 7.1 Tabel `sensor_readings`

```sql
CREATE TABLE sensor_readings (
  id                   BIGSERIAL PRIMARY KEY,
  timestamp            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ph                   NUMERIC(4,2),
  ph_status            VARCHAR(10),  -- 'normal' | 'warning' | 'danger'
  tds                  INTEGER,
  tds_status           VARCHAR(10),
  turbidity            NUMERIC(5,2),
  turbidity_status     VARCHAR(10),
  water_level          INTEGER,
  water_level_status   VARCHAR(10),
  overall_status       VARCHAR(10)
);

CREATE INDEX idx_sensor_readings_timestamp ON sensor_readings(timestamp DESC);

-- Enable Supabase Realtime
ALTER TABLE sensor_readings REPLICA IDENTITY FULL;
```

### 7.2 Tabel `sensor_events`

```sql
CREATE TABLE sensor_events (
  id          BIGSERIAL PRIMARY KEY,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type        VARCHAR(10),   -- 'danger' | 'warning' | 'recovery'
  metric      VARCHAR(20),   -- 'ph' | 'tds' | 'turbidity' | 'water_level'
  value       NUMERIC(7,2),
  message     TEXT
);

CREATE INDEX idx_sensor_events_timestamp ON sensor_events(timestamp DESC);
```

### 7.3 Tabel `lifecycle_config`

```sql
CREATE TABLE lifecycle_config (
  id              BIGSERIAL PRIMARY KEY,
  crop_start_date DATE,
  fish_start_date DATE,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.4 Auto-cleanup (Data Retention 7 Hari)

```sql
-- Jalankan sekali di SQL Editor Supabase
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'cleanup-old-readings',
  '0 0 * * *',
  $$
    DELETE FROM sensor_readings WHERE timestamp < NOW() - INTERVAL '7 days';
    DELETE FROM sensor_events WHERE timestamp < NOW() - INTERVAL '7 days';
  $$
);
```

---

## 8. Sensor Thresholds & Logic

### 8.1 Tabel Threshold

| Sensor | Normal | Warning | Danger |
|---|---|---|---|
| pH | 6.5 – 7.5 | 6.2 – 6.5 atau 7.5 – 7.8 | < 6.2 atau > 7.8 |
| TDS | 300 – 700 ppm | 200 – 300 atau 700 – 800 ppm | < 200 atau > 800 ppm |
| Turbidity | 0 – 5 NTU | 5 – 8 NTU | > 8 NTU |
| Water Level | 70 – 100% | 65 – 70% | < 65% |

### 8.2 Status Determination Logic

```typescript
type SensorStatus = 'normal' | 'warning' | 'danger'

const thresholds = {
  ph:          { warningLow: 6.2, normalLow: 6.5, normalHigh: 7.5, warningHigh: 7.8 },
  tds:         { warningLow: 200, normalLow: 300, normalHigh: 700, warningHigh: 800 },
  turbidity:   { normalHigh: 5, warningHigh: 8 },
  water_level: { warningLow: 65, normalLow: 70 },
}

function getStatus(metric: string, value: number): SensorStatus {
  const t = thresholds[metric]
  if (value < t.warningLow || value > t.warningHigh) return 'danger'
  if (value < t.normalLow  || value > t.normalHigh)  return 'warning'
  return 'normal'
}
```

### 8.3 Simulator (Supabase Edge Function)

```typescript
// supabase/functions/generate-reading/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async () => {
  const ph        = parseFloat((Math.random() * (8.5 - 6.0) + 6.0).toFixed(2))
  const tds       = Math.floor(Math.random() * (900 - 150) + 150)
  const turbidity = parseFloat((Math.random() * 12).toFixed(2))
  const water_level = Math.floor(Math.random() * (100 - 60) + 60)

  const reading = {
    ph, ph_status: getStatus('ph', ph),
    tds, tds_status: getStatus('tds', tds),
    turbidity, turbidity_status: getStatus('turbidity', turbidity),
    water_level, water_level_status: getStatus('water_level', water_level),
    overall_status: deriveOverall([...])
  }

  const { error } = await supabase.from('sensor_readings').insert(reading)
  return new Response(JSON.stringify({ ok: !error }), { status: error ? 500 : 200 })
})
```

---

## 9. UI Structure & Design System

### 9.1 Layout Hierarchy

```
┌─────────────────────────────┐
│         HEADER              │  App title | Updated Xs ago | Health badge | Dark mode toggle
├─────────────────────────────┤
│     INSIGHT ENGINE          │  Diagnosis text + Suggested Action
├──────────────┬──────────────┤
│  pH          │  TDS         │  Sensor Grid 2x2
├──────────────┼──────────────┤
│  Turbidity   │  Water Level │
├──────────────┴──────────────┤
│  Crop Age    │  Fish Age    │  Lifecycle Grid
├─────────────────────────────┤
│  [1H][6H][24H][7D]          │  Time Range Selector
│                             │
│      HISTORICAL CHART       │  Sparkline / Line chart
├─────────────────────────────┤
│      EVENT LOG              │  Chronological anomaly log
├─────────────────────────────┤
│  [Export CSV]               │  Export button
└─────────────────────────────┘
```

### 9.2 Design Principles

- **Mobile-first** dalam container `max-w-md`, adaptif ke `md:max-w-2xl` di tablet/desktop
- **Vercel-inspired aesthetic**: flat surface, 1px border, tabular numbers, minimal padding
- **No gradients, no glassmorphism** — surface bersih
- **State-aware styling**: background kartu sensor berubah halus saat warning/danger
- **Dark mode mandatory** — semua komponen harus punya dark variant

### 9.3 Color Tokens

```css
/* Status Colors */
--color-normal:  #22c55e  /* green-500 */
--color-warning: #f59e0b  /* amber-500 */
--color-danger:  #ef4444  /* red-500 */

/* Dark mode variants (lebih muted) */
--color-warning-dark: #d97706  /* amber-600 */
--color-danger-dark:  #dc2626  /* red-600 */
```

### 9.4 Responsive Breakpoints

| Breakpoint | Layout Perubahan |
|---|---|
| Default (mobile) | Semua komponen full-width, sensor grid 2x2 |
| `md` (768px+) | Sensor grid 2x4, chart lebih besar |
| `lg` (1024px+) | Chart dan Event Log side-by-side |

### 9.5 Touch Target Minimum

Semua interactive element minimum **44x44px** — mengikuti Apple HIG standard.

---

## 10. Deployment

### 10.1 Stack Deployment Final

```
Vercel          → Frontend (Nuxt 3) + API Functions (/api/*)
Supabase        → PostgreSQL + Realtime + Edge Function (simulator/cron)
```

Tidak ada platform ketiga. Railway tidak diperlukan.

### 10.2 Environment Variables

**Vercel (Frontend + API Functions):**
```env
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=...         # untuk frontend (public)
SUPABASE_SERVICE_KEY=...      # untuk API functions (secret)
```

**Supabase Edge Function:**
```env
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

### 10.3 Setup Supabase Cron (Keep-Alive + Simulator)

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Jalankan simulator setiap 60 detik
SELECT cron.schedule(
  'generate-sensor-reading',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://[project-ref].supabase.co/functions/v1/generate-reading',
    headers := '{"Authorization": "Bearer [anon-key]"}'::jsonb
  )
  $$
);
```

Cron ini sekaligus berfungsi sebagai **keep-alive** — database aktif dipanggil setiap menit sehingga Supabase tidak auto-pause. Project tetap live selama 6+ bulan tanpa biaya tambahan.

### 10.4 Estimasi Penggunaan Free Tier (6 Bulan)

| Resource | Estimasi | Limit Free Tier |
|---|---|---|
| Database size | ~50-100 MB | 500 MB |
| Bandwidth | ~500 MB/bulan | 2 GB/bulan |
| Edge Function invocations | ~43.000/bulan | 500.000/bulan |

Semua estimasi masih jauh di bawah limit free tier.

---

## 11. Git Workflow

### 11.1 Prinsip Dasar

> **Setiap file baru yang dibuat harus di-commit sebelum membuat file berikutnya.**

Ini bukan aturan kaku, tapi kebiasaan yang membuat history Git bermakna. Setiap commit harus bisa dibaca seperti kalimat — "apa yang berubah dan kenapa".

### 11.2 Branch Strategy

```
main
 └── dev                         ← branch aktif development
      ├── feat/supabase-setup     ← setup database & realtime
      ├── feat/historical-chart   ← fitur chart historis
      ├── feat/event-log          ← fitur event log
      ├── feat/dark-mode          ← implementasi dark mode
      ├── feat/export-csv         ← fitur export
      └── fix/sensor-threshold    ← bugfix threshold logic
```

**Aturan branch:**
- `main` — production only, tidak pernah commit langsung ke sini
- `dev` — integration branch, semua feature branch merge ke sini
- `feat/*` — untuk fitur baru
- `fix/*` — untuk bugfix
- `chore/*` — untuk update dependency, config, dokumentasi

### 11.3 Conventional Commits

Format: `type(scope): deskripsi singkat`

**Types yang dipakai:**

| Type | Kapan dipakai |
|---|---|
| `feat` | Menambahkan fitur baru |
| `fix` | Memperbaiki bug |
| `chore` | Update dependency, config, tidak ada perubahan logic |
| `docs` | Update dokumentasi atau PRD |
| `style` | Perubahan styling/CSS tanpa mengubah logic |
| `refactor` | Refactor kode tanpa menambah fitur atau fix bug |
| `perf` | Improvement performa |

**Contoh commit messages:**

```bash
feat(db): add sensor_readings table migration
feat(realtime): setup supabase realtime subscription composable
feat(chart): add historical chart with time range selector
feat(ui): add dark mode toggle with localStorage persistence
fix(threshold): correct turbidity danger threshold from 10 to 8
chore(deps): update @supabase/supabase-js to v2.39.0
docs(prd): update deployment section with supabase cron setup
style(sensor-card): adjust warning state background opacity
refactor(insight): extract correlational logic to separate composable
```

### 11.4 Workflow Harian — Step by Step

**Memulai fitur baru:**

```bash
# 1. Pastikan dev branch up to date
git checkout dev
git pull origin dev

# 2. Buat feature branch
git checkout -b feat/historical-chart

# 3. Mulai kerja...
```

**Setiap kali membuat file baru:**

```bash
# Contoh: baru saja buat composable baru
touch composables/useHistory.ts

# Tulis kode di file tersebut, lalu:
git add composables/useHistory.ts
git commit -m "feat(history): add useHistory composable for time-range queries"

# Lanjut ke file berikutnya
touch components/HistoricalChart.vue
# ...tulis kode...
git add components/HistoricalChart.vue
git commit -m "feat(chart): add HistoricalChart component with sparkline"
```

**Selesai fitur, merge ke dev:**

```bash
# Pastikan tidak ada yang belum di-commit
git status

# Push feature branch
git push origin feat/historical-chart

# Buat Pull Request ke dev di GitHub
# Review sendiri, pastikan tidak ada console.log tertinggal
# Merge PR

# Atau merge manual:
git checkout dev
git merge feat/historical-chart
git push origin dev
```

**Deploy ke production:**

```bash
# Merge dev ke main hanya saat siap deploy
git checkout main
git merge dev
git push origin main
# Vercel otomatis trigger deploy
```

### 11.5 Atomic Commit — Contoh Urutan untuk Fitur Historical Chart

```bash
# 1. Setup database
git commit -m "chore(db): add sensor_readings table migration script"

# 2. Composable untuk query
git commit -m "feat(history): add useHistory composable with supabase query"

# 3. Komponen time range selector
git commit -m "feat(ui): add TimeRangeSelector component"

# 4. Komponen chart
git commit -m "feat(chart): add HistoricalChart component using Chart.js"

# 5. Integrasi ke halaman utama
git commit -m "feat(dashboard): integrate historical chart into index page"

# 6. Styling dark mode untuk chart
git commit -m "style(chart): add dark mode variants for chart colors"
```

History ini bisa dibaca seperti changelog — setiap commit menceritakan satu langkah kecil yang bermakna.

### 11.6 Yang Harus Dihindari

```bash
# ❌ Jangan lakukan ini
git add .
git commit -m "update"

git add .
git commit -m "fix stuff"

git add .
git commit -m "wip"

# ✅ Lakukan ini
git add composables/useHistory.ts
git commit -m "feat(history): add time-range query composable"
```

### 11.7 .gitignore

Pastikan file-file ini ada di `.gitignore`:

```gitignore
# Dependencies
node_modules/

# Environment variables — JANGAN PERNAH COMMIT
.env
.env.local
.env.production

# Nuxt
.nuxt/
.output/
dist/

# Supabase
supabase/.temp/
```

> **PENTING:** File `.env` yang berisi `SUPABASE_SERVICE_KEY` atau credential apapun **tidak boleh pernah masuk ke repository**. Gunakan Vercel Dashboard dan Supabase Dashboard untuk set environment variables di production.

---

## 12. Future Improvements

Fitur-fitur ini sengaja tidak dimasukkan ke v2 karena scope terbatas, namun arsitektur sudah dirancang untuk mengakomodasi pengembangannya.

### 12.1 Hardware Integration

Mengganti Supabase Edge Function simulator dengan data sensor nyata dari hardware (ESP32 / Raspberry Pi) via MQTT atau HTTP POST langsung ke Supabase.

### 12.2 Push Notifications

Menggunakan Web Push API untuk mengirim notifikasi ke browser/device pengguna saat sensor masuk zona danger — bahkan ketika tab tidak sedang terbuka.

### 12.3 Threshold Customization

UI untuk mengubah batas normal/warning/danger per sensor, tersimpan di tabel `user_config` di Supabase. Berguna karena tiap spesies ikan dan tanaman punya toleransi berbeda.

### 12.4 Multi-Tank Support

Dukungan untuk memonitor lebih dari satu sistem aquaponik dalam satu dashboard, dengan tab atau sidebar selector per tank.

### 12.5 Auth & Multi-Tenancy

Integrasi Supabase Auth untuk memungkinkan multiple user mengelola tank mereka masing-masing dengan data yang terisolasi.

---

*Document ini adalah living document — akan diupdate seiring perkembangan project.*
