# Aquaguard IoT Testing Report

**Date:** 2026-05-04  
**Source PRD:** [testing-prd.md](./testing-prd.md)  
**Environment:** Nuxt dev server `http://127.0.0.1:3000`, Chromium headless via Playwright, Supabase realtime data  
**Build:** PASS (`npm run build`)

## Summary

| Area | Result | Notes |
|---|---|---|
| Dashboard load | PASS | Sensor cards, chart, lifecycle, and recent activity rendered with live Supabase data. |
| Realtime sync | PASS | Two browser tabs showed matching sensor/status updates during observation. |
| Chart controls | PASS | 1H/6H/24H and Turb/pH/TDS/Wtr controls changed active state and chart units. |
| Config persistence | PASS | Lifecycle dates saved, survived refresh, and were restored to original values after test. |
| Dark mode toggle | PARTIAL | Toggle and refresh persistence pass; first load does not follow system dark preference. |
| Responsive | PARTIAL | No horizontal overflow on mobile/desktop, but desktop layout is not automatic and touch targets are too small. |
| Event frequency | FAIL | 40 events in the last hour: 20 warning + 20 recovery, all water level. PRD allows only 2-3 warnings/hour in normal conditions. |

## Critical Findings

### BUG-TEST-01: Timestamp does not update every second

**Severity:** Medium  
**PRD IDs:** F-03  
**Component:** Dashboard header

**Expected:** "Diperbarui X lalu" updates every second.  
**Actual:** Text updates roughly every 5 seconds and jumps values.

Observed samples:

```text
Diperbarui baru saja
Diperbarui baru saja
Diperbarui baru saja
Diperbarui baru saja
Diperbarui 6 detik lalu
Diperbarui 6 detik lalu
```

Likely cause: dashboard timer interval is `5000ms` in `apps/web/pages/index.vue`.

### BUG-TEST-02: Normal insight is generic, not lifecycle-based

**Severity:** Medium  
**PRD IDs:** F-06, E-06  
**Component:** Insight Engine

**Expected:** Normal state insight should reference lifecycle context.  
**Actual:** Normal insight says:

```text
Semua parameter akuatik berada dalam rentang optimal untuk ekosistem yang seimbang.
```

This is useful, but it is still generic and does not mention crop/fish lifecycle.

### BUG-TEST-03: First load ignores system dark preference

**Severity:** Medium  
**PRD IDs:** F-33  
**Component:** Color mode

**Expected:** First load follows `prefers-color-scheme`.  
**Actual:** With browser `colorScheme: dark`, first load still used `html.light` and `localStorage.nuxt-color-mode = light`.

Toggle and refresh persistence passed after manually switching to dark.

### BUG-TEST-04: Touch targets are below 44x44px

**Severity:** Medium  
**PRD IDs:** M-07  
**Component:** Header controls, chart tabs, config controls

Observed sizes:

| Element | Size |
|---|---|
| Header icon links/buttons | 22x22px |
| Back link | 28x28px |
| Chart range/metric buttons | ~34-45x23px |
| Config number inputs | ~75x25px |
| Config save button | 166x34px |

### BUG-TEST-05: Desktop layout is manual, not responsive by default

**Severity:** Medium  
**PRD IDs:** D-01, D-02, D-03  
**Component:** Layout mode

**Expected:** Desktop viewport (>1024px) uses two-column dashboard and 2x2 config threshold grid automatically.  
**Actual:** Initial desktop viewport still opens in mobile-width layout unless user toggles layout mode. `useLayoutMode()` defaults `isDesktopLayout` to `false`.

### BUG-TEST-06: Warning/recovery events are too frequent

**Severity:** High  
**PRD IDs:** R-06  
**Component:** Simulator / event generation

**Expected:** Warning no more than 2-3x/hour in normal conditions.  
**Actual:** Last-hour Supabase sample returned 40 events:

| Type | Count |
|---|---:|
| warning | 20 |
| recovery | 20 |

Recent sequence alternates between water level warning at 69% and recovery at 70-71%, creating noisy event churn.

## Functional Checklist

| ID | Result | Evidence |
|---|---|---|
| F-01 | PASS | Four sensor cards rendered with pH, TDS, turbidity, water level. |
| F-02 | PASS | Values changed gradually during observation: pH 6.98 -> 7.01, TDS 499 -> 494, water 69 -> 70. |
| F-03 | FAIL | Timestamp updates every ~5s, not every second. |
| F-04 | PASS | Sensor badges showed NORMAL/WARNING according to current values. |
| F-05 | PASS | Header showed WARNING when water level card was WARNING. |
| F-06 | FAIL | Normal insight is generic, not lifecycle-based. |
| F-07 | PASS | Warning state showed diagnosis and action for water level. |
| F-08 | NOT TESTED | No DANGER state occurred during runtime observation. Code has danger branches. |
| F-09 | PASS | Insight/event copy is conversational Indonesian. |
| F-10 | PASS | Warning insight includes explicit value, e.g. `69%`. |
| F-11 | PASS | Code maps severity to matching red/amber/emerald icon classes. |
| F-12 | PASS | 1H chart active state and labels verified. |
| F-13 | PASS | 6H chart active state and labels verified. |
| F-14 | PASS | 24H chart active state and labels verified. |
| F-15 | PASS | Turb/pH/TDS/Wtr metric switching verified via chart units. |
| F-16 | PASS | Trend labels changed with selected metric (`Meningkat`, `Menurun`, `Stabil`). |
| F-17 | PASS | Chart line and values moved gradually in observed data. |
| F-18 | PASS | WARNING and Recovery badges rendered with expected colors. |
| F-19 | PASS | Event messages are contextual and include values. |
| F-20 | PASS | Event timestamps rendered as latest-first time/minute values. |
| F-21 | PASS | New event appeared at top without refresh during realtime observation. |
| F-22 | PASS | Event order is latest-first. |
| F-23 | PASS | Crop age changed after date update. |
| F-24 | PASS | Fish age changed after date update. |
| F-25 | PASS | Save button changed to `✓ Tersimpan`. |
| F-26 | PASS | Saved dates persisted after refresh; original values restored after test. |
| F-27 | NOT TESTED | Avoided changing live thresholds in a way that affects simulator behavior. |
| F-28 | NOT TESTED | Avoided changing live thresholds in a way that affects simulator behavior. |
| F-29 | PASS | Inputs use `type="number"` for numeric thresholds. |
| F-30 | PASS | `min_normal > max_normal` shows validation error and resets values. |
| F-31 | PASS | Dark/light toggle works. |
| F-32 | PASS | Dark mode persisted after refresh. |
| F-33 | FAIL | First load uses light mode even when system preference is dark. |

## UX & Visual Checklist

| ID | Result | Evidence |
|---|---|---|
| U-01 | PASS | Status badges use English labels: NORMAL, WARNING, DANGER, Recovery. |
| U-02 | PASS | Config labels are Indonesian. |
| U-03 | PASS | Insight and event log use Indonesian conversational copy. |
| U-04 | FAIL | Some lifecycle labels are Indonesian in code (`Vegetatif`, `Pematangan`, `Larva`, `Siap Panen`). |
| U-05 | PARTIAL | No obvious typo found in tested views; `Nutrient (TDS)` is singular and may need copy review. |
| U-06 | PASS | WARNING uses amber. |
| U-07 | PASS | DANGER uses red in code and alerts page styles. |
| U-08 | PASS | Recovery uses green. |
| U-09 | PASS | `Rentang aman` uses muted gray. |
| U-10 | PASS | Insight icon color matches severity classes. |
| U-11 | PASS | Dark mode colors are muted, not neon. |
| U-12 | PARTIAL | Warning alert is visually prominent; DANGER was not observed live. |
| U-13 | PASS | Warning sensor card uses subtle amber background. |
| U-14 | PASS | Danger sensor card uses subtle red background in code. |
| U-15 | PASS | No unintended large dead space observed. |

## Realtime & Data Checklist

| ID | Result | Evidence |
|---|---|---|
| R-01 | PASS | Two tabs stayed synchronized during observation. |
| R-02 | NOT TESTED | Network-off reconnect was not simulated. |
| R-03 | PARTIAL | Last-hour query found 60 readings, consistent with 1/minute; full 10-minute live watch was not completed. |
| R-04 | PASS | Last-hour data showed gradual movement and TDS/turbidity both trending upward overall. |
| R-05 | PARTIAL | Water level oscillated around 69-71%; refill behavior exists but is too noisy. |
| R-06 | FAIL | 20 warnings/hour observed. |

## Responsive Checklist

| ID | Result | Evidence |
|---|---|---|
| M-01 | PASS | Mobile dashboard single-column and readable. |
| M-02 | PASS | Sensor values did not clip at 375px viewport. |
| M-03 | PASS | Chart full-width with visible labels. |
| M-04 | PASS | Event log had no horizontal overflow. |
| M-05 | PARTIAL | Config readable, but controls are below 44px touch target. |
| M-06 | FAIL | UI uses many `text-[10px]` labels; PRD minimum body size is 12px. |
| M-07 | FAIL | Multiple interactive elements are below 44x44px. |
| D-01 | FAIL | Desktop viewport does not automatically use two-column layout. |
| D-02 | FAIL | Config page does not automatically use 2x2 grid on desktop. |
| D-03 | FAIL | Initial desktop content remains mobile-width until manual toggle. |
| D-04 | PASS | Font scale is visually consistent, though many labels are intentionally compact. |

## Browser Compatibility

| Browser | Tested | Notes |
|---|---|---|
| Chrome/Chromium | PASS | Tested through Playwright Chromium. |
| Firefox | NOT TESTED | No Firefox run in this pass. |
| Safari | NOT TESTED | No Safari/WebKit run in this pass. |
| Mobile Chrome | PARTIAL | Simulated mobile Chromium viewport. |
| Mobile Safari | NOT TESTED | No real iOS Safari/WebKit run in this pass. |

## Edge Cases

| ID | Result | Evidence |
|---|---|---|
| E-01 | PARTIAL | Code has error states; Supabase-down scenario not forced. |
| E-02 | PARTIAL | Loading states observed in code; slow network not simulated. |
| E-03 | PARTIAL | Chart has loading/empty behavior in code; fresh deploy not tested. |
| E-04 | PASS | Empty event state exists and SSR snapshot showed `Belum ada aktivitas tercatat` before hydration. |
| E-05 | PASS | Missing lifecycle date falls back to `0 Hari` / `Belum Diatur`. |
| E-06 | FAIL | Normal insight is generic, not lifecycle-based. |

## Commands Used

```bash
npm run build
npm run dev -- --host 127.0.0.1 --port 3000
```

Additional verification used temporary Playwright installs outside the repo and Supabase reads through the existing public client configuration.
