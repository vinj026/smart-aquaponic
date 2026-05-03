# 🔍 Smart Aquaponic — Full Project Audit

**Date:** 2026-05-04  
**Scope:** Security, Bugs, Performance, Data Integrity, UX, Code Quality  
**Status:** 🔴 Action Required

---

## Table of Contents

1. [🔴 CRITICAL — Security](#1--critical--security)
2. [🟠 HIGH — Bugs & Data Integrity](#2--high--bugs--data-integrity)
3. [🟡 MEDIUM — Performance & Scalability](#3--medium--performance--scalability)
4. [🔵 LOW — Code Quality & Maintainability](#4--low--code-quality--maintainability)
5. [⚪ INFO — Suggestions & Enhancements](#5--info--suggestions--enhancements)

---

## 1. 🔴 CRITICAL — Security

### SEC-01: Supabase Credentials Hardcoded in Source Code
**File:** `apps/web/utils/supabase.ts`  
**Severity:** 🔴 CRITICAL

The Supabase URL and anon key are **hardcoded directly** in the source file instead of reading from environment variables via `useRuntimeConfig()`.

```typescript
// ❌ Current (hardcoded)
export const supabase = createClient('https://tnmytfvkywdqjtovhbug.supabase.co', 'eyJhbG...')

// ✅ Should be
const config = useRuntimeConfig()
export const supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey)
```

**Risk:** Credentials get committed to git history and are visible in the client bundle. The `nuxt.config.ts` already defines `runtimeConfig.public.supabaseUrl` and `supabaseAnonKey` but they are **never used**.

**Fix:** Refactor `supabase.ts` to use runtime config, and ensure `.env` has the correct values.

---

### SEC-02: RLS Disabled on 3 of 4 Tables
**Severity:** 🔴 CRITICAL  
**Source:** Supabase Security Advisor

| Table | RLS Enabled | Policies Exist | Status |
|---|---|---|---|
| `sensor_readings` | ❌ No | Yes (SELECT) | 🔴 Policies ignored |
| `sensor_events` | ❌ No | Yes (SELECT) | 🔴 Policies ignored |
| `lifecycle_config` | ❌ No | Yes (SELECT) | 🔴 Policies ignored |
| `system_thresholds` | ✅ Yes | Yes (SELECT) | ⚠️ Read-only |

**Risk:** All 3 tables are **fully open** to anyone with the anon key — including INSERT, UPDATE, DELETE. A malicious user could:
- Delete all sensor readings
- Inject fake sensor data
- Modify lifecycle config

**Fix:** Enable RLS on all tables and add proper policies:
```sql
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifecycle_config ENABLE ROW LEVEL SECURITY;
```
Then add INSERT/UPDATE policies that only allow the `service_role` (edge function) to write.

---

### SEC-03: Edge Function Has JWT Verification Disabled  
**File:** Edge Function `generate-reading`  
**Severity:** 🟠 HIGH

The edge function is deployed with `verify_jwt: false`. This means **anyone** can call the endpoint and trigger fake data insertion.

**Fix:** Either:
- Enable `verify_jwt: true` and have the cron use the service role key
- Add custom auth check inside the function (e.g., check for a secret header)

---

### SEC-04: `lifecycle_config` and `system_thresholds` Have No Write Protection
**Severity:** 🟠 HIGH

The frontend uses `supabase.from('lifecycle_config').upsert(...)` and `supabase.from('system_thresholds').update(...)` directly from the **client** with the **anon key**. Since RLS is disabled (or has no write policies), there's **zero access control** on who can modify system configuration.

**Fix:** Add RLS write policies restricted to authenticated users or specific roles. For a public-facing demo, consider a shared password or simple auth gate.

---

### SEC-05: Firebase Service Account Key Exists on Disk
**File:** `apps/api/smartaquaponic-42799-firebase-adminsdk-fbsvc-812891e222.json`  
**Severity:** 🟡 MEDIUM

The file exists on disk (confirmed). While `.gitignore` excludes `*firebase-adminsdk*.json` and it's **not tracked** in git, the filename is referenced in `.env.example` which means developers might accidentally commit it.

**Fix:** 
- Move it outside the project directory or use environment variables exclusively
- Add a pre-commit hook to block `.json` files containing `"private_key"`

---

### SEC-06: `rls_auto_enable()` Function Callable by Anonymous Users
**Severity:** 🟡 MEDIUM  
**Source:** Supabase Security Advisor

A `SECURITY DEFINER` function `public.rls_auto_enable()` is executable by both `anon` and `authenticated` roles via the REST API (`/rest/v1/rpc/rls_auto_enable`).

**Fix:** Revoke execute or switch to `SECURITY INVOKER`:
```sql
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated;
```

---

### SEC-07: API Server Has No Authentication
**File:** `apps/api/src/index.js`  
**Severity:** 🟡 MEDIUM

The Express API uses `cors()` with no origin restriction and has zero authentication on the `POST /api/readings` endpoint. Anyone can push fake sensor data to Firebase.

**Fix:** Add API key validation middleware or restrict CORS to known origins.

---

### SEC-08: CORS Allows All Origins
**File:** `apps/api/src/index.js` — `app.use(cors())`  
**Severity:** 🟡 MEDIUM

No origin restriction. In production, this should be restricted:
```javascript
app.use(cors({ origin: ['https://your-domain.com'] }))
```

---

## 2. 🟠 HIGH — Bugs & Data Integrity

### BUG-01: `useReadingHistory` Never Reconnects on Channel Error
**File:** `apps/web/composables/useSupabaseData.js:187-191`  
**Severity:** 🟠 HIGH

When the realtime channel encounters `CHANNEL_ERROR` or `TIMED_OUT`, it only sets `error.value` but **never attempts to reconnect**. Compare with `useLatestReading` which has `scheduleLatestReconnect()`.

**Impact:** If the WebSocket drops (network glitch), the chart stops updating forever until a full page reload.

**Fix:** Add reconnection logic similar to `useLatestReading`.

---

### BUG-02: `useSystemEvents` Never Reconnects on Channel Error
**File:** `apps/web/composables/useSupabaseData.js:245-249`  
**Severity:** 🟠 HIGH

Same issue as BUG-01. The events feed will silently stop updating after a WebSocket error.

---

### BUG-03: Realtime Sets `sharedLatestReading` to `null` on Error
**File:** `apps/web/composables/useSupabaseData.js:96`  
**Severity:** 🟠 HIGH

```javascript
sharedLatestReading.value = null  // line 96
```

When the channel errors, the **last known reading is thrown away**. This causes the entire dashboard to flash to "Loading..." state even though valid cached data exists.

**Fix:** Don't null-out the reading on connection error. Keep stale data visible with an error indicator.

---

### BUG-04: Threshold Validation Allows Out-of-Range Values
**File:** `apps/web/pages/config.vue:190`  
**Severity:** 🟡 MEDIUM

The threshold update only checks `Number.isFinite()`, but doesn't validate:
- `min_normal <= max_normal`
- `min_warning <= min_normal` (safety range must be wider)
- `max_normal <= max_warning`
- Negative values for things like water_level

**Impact:** A user could set `min_normal: 8.0, max_normal: 6.0` which would break status calculations in the edge function.

---

### BUG-05: `useLifecycleConfig` Hardcodes ID=1
**File:** `apps/web/composables/useSupabaseData.js:293`  
**Severity:** 🟡 MEDIUM

```javascript
id: config.value.id || 1
```

If `config.value.id` is `0` (falsy), it defaults to `1`. While unlikely for an auto-incrementing PK, this is a semantic bug. Use `config.value.id ?? 1` instead.

---

### BUG-06: `.env.example` for Web Still References Firebase
**File:** `apps/web/.env.example`  
**Severity:** 🟡 MEDIUM

The web app `.env.example` still lists Firebase environment variables (`NUXT_PUBLIC_FIREBASE_*`), but the frontend has been migrated to Supabase. It should list:
```
NUXT_PUBLIC_SUPABASE_URL=
NUXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

### BUG-07: `overallDotClass` Uses `bg-yellow-500` Instead of `bg-amber-500`
**File:** `apps/web/pages/index.vue:482`  
**Severity:** 🔵 LOW

```javascript
if (s === 'warning') return 'bg-yellow-500'  // ❌ inconsistent
```

The rest of the codebase uses `amber` for warnings. This dot uses `yellow` which breaks the unified palette.

---

## 3. 🟡 MEDIUM — Performance & Scalability

### PERF-01: `sensor_readings` Table Growing Without Retention Policy
**Severity:** 🟡 MEDIUM

The table currently has **3,188+ rows** and growing at **1 row/minute** (1,440/day). In 1 year that's **525,600 rows**. There's no cleanup job.

**Fix:** Add a cron job to purge old data:
```sql
SELECT cron.schedule(
  'cleanup-old-readings',
  '0 0 * * *',
  $$DELETE FROM sensor_readings WHERE timestamp < NOW() - INTERVAL '30 days'$$
);
```

---

### PERF-02: `sensor_events` Table Growing Without Retention  
**Severity:** 🟡 MEDIUM

Same as PERF-01. Currently 916 rows and growing.

---

### PERF-03: `useReadingHistory` Fetches All Columns  
**File:** `apps/web/composables/useSupabaseData.js:153`  
**Severity:** 🟡 MEDIUM

```javascript
.select('*')  // fetches all 11 columns
```

The chart only needs `timestamp` + the selected metric column. Fetching all columns wastes bandwidth, especially on mobile.

**Fix:** Use targeted select: `.select('timestamp,ph,tds,turbidity,water_level')`

---

### PERF-04: Dashboard Creates 3 Separate Realtime Channels
**Severity:** 🟡 MEDIUM

The index page mounts `useLatestReading()`, `useReadingHistory()`, and `useSystemEvents()` — each opening its own WebSocket channel. This could be consolidated into fewer channels.

---

### PERF-05: No Rate Limiting on API Endpoints
**File:** `apps/api/src/index.js`  
**Severity:** 🟡 MEDIUM

The Express API has no rate limiting. A malicious actor could flood the `/api/readings` endpoint.

**Fix:** Add `express-rate-limit`:
```javascript
import rateLimit from 'express-rate-limit'
app.use('/api', rateLimit({ windowMs: 60000, max: 30 }))
```

---

## 4. 🔵 LOW — Code Quality & Maintainability

### CQ-01: Dual Backend Architecture (Firebase + Supabase)
**Severity:** 🔵 LOW

The project has two backends:
- **`apps/api/`** — Express + Firebase RTDB (for ESP32 ingest)
- **Supabase Edge Function** — `generate-reading` (simulated cron data)

The web frontend **only reads from Supabase**. The Firebase API is effectively orphaned from the user-facing app.

**Impact:** Confusing architecture. Data written to Firebase is never displayed.

**Recommendation:** Decide on one backend. Either migrate the ESP32 ingest to Supabase, or make the frontend read from Firebase.

---

### CQ-02: API Backend Has Hardcoded Thresholds
**File:** `apps/api/src/services/statusService.js:1-18`  
**Severity:** 🔵 LOW

The Express API has its own hardcoded threshold values that **don't sync** with the `system_thresholds` table in Supabase. If a user changes thresholds in the config page, the API backend won't know.

---

### CQ-03: No Test Suite
**Severity:** 🔵 LOW

Both `apps/web` and `apps/api` have zero tests. The API `package.json` literally has:
```json
"test": "echo \"No tests configured\" && exit 0"
```

**Recommendation:** At minimum, add unit tests for:
- `validateReadingPayload()`
- `processReading()` 
- `getStatus()` logic in the edge function

---

### CQ-04: Tailwind Config Missing `darkMode` Setting
**File:** `apps/web/tailwind.config.js`  
**Severity:** 🔵 LOW

The config doesn't explicitly set `darkMode: 'class'`. It works because `@nuxtjs/color-mode` handles it, but it's best practice to be explicit.

---

### CQ-05: `plugins/` Directory Is Empty
**Severity:** 🔵 LOW (cosmetic)

The empty `plugins/` directory can be removed to reduce clutter.

---

### CQ-06: `pg_net` Extension Installed in Public Schema
**Severity:** 🔵 LOW  
**Source:** Supabase Security Advisor

The `pg_net` extension should be moved to the `extensions` schema for security isolation.

---

## 5. ⚪ INFO — Suggestions & Enhancements

### ENH-01: PWA Manifest Only Has 1 Icon Size
**File:** `apps/web/public/manifest.json`

Only a single 512x512 icon is defined. For proper PWA support, add at least:
- 192x192
- 384x384  
- 512x512

---

### ENH-02: No `<meta name="description">` Tag
**File:** `apps/web/nuxt.config.ts`

The `<head>` has a title but no meta description. Add:
```typescript
{ name: 'description', content: 'Real-time IoT monitoring dashboard for smart aquaponics systems' }
```

---

### ENH-03: CSV Export Has No Error Feedback
**File:** `apps/web/pages/index.vue:502-503`

If `history.value` is empty, the function silently returns. The user gets no feedback that there's no data to export.

---

### ENH-04: Logs Page Has No Pagination
**File:** `apps/web/pages/logs.vue`

Currently limited to 50 events with no way to load more. As the system runs longer, older events become inaccessible.

---

### ENH-05: `format` from `date-fns` Imported but Could Be Tree-Shaken
The `date-fns` import is fine, but only `format` is used. Confirm that tree-shaking is working in the production build so unused date-fns modules aren't bundled.

---

## Summary Matrix

| Category | 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low | Total |
|---|---|---|---|---|---|
| Security | 2 | 2 | 4 | 1 | **9** |
| Bugs | 0 | 3 | 3 | 1 | **7** |
| Performance | 0 | 0 | 5 | 0 | **5** |
| Code Quality | 0 | 0 | 0 | 6 | **6** |
| Enhancements | 0 | 0 | 0 | 0 | **5** |
| **Total** | **2** | **5** | **12** | **8** | **32** |

---

## Priority Fix Order

1. **SEC-01** — Move credentials to env vars (5 min fix)
2. **SEC-02** — Enable RLS on all tables + add write policies (15 min)
3. **BUG-03** — Stop nulling cached data on WS error (5 min)
4. **BUG-01/02** — Add reconnection logic to history & events channels (20 min)
5. **SEC-03** — Secure edge function endpoint (10 min)
6. **SEC-04** — Add write policies for config/thresholds (10 min)
7. **BUG-04** — Add threshold validation (10 min)
8. **PERF-01/02** — Add data retention cron jobs (10 min)
9. **BUG-06** — Update .env.example (2 min)
10. **BUG-07** — Fix yellow→amber inconsistency (1 min)
