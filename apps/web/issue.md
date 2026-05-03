# UI/UX Color Contrast — Issue Tracker

**Status:** ✅ RESOLVED  
**Date Resolved:** 2026-05-04  

---

All issues identified in the deep contrast analysis have been fixed. Below is the summary of changes applied.

## Changes Applied

### Phase 1 — Critical WCAG AA Contrast Fixes ✅
- [x] All `text-gray-400` content text → `text-gray-500` or `text-gray-600` (ratio 4.64:1+)
- [x] All `text-gray-300` separators → `text-gray-400` (ratio 2.85:1, acceptable for decorative)
- [x] Warning colors standardized: `text-amber-600/700` → `text-amber-700/800` for better contrast
- [x] Error text `text-red-500` → `text-red-600` (ratio 4.53:1, passes WCAG AA)
- [x] Dark mode: `dark:text-gray-500` → `dark:text-gray-400` where applicable
- [x] All input elements now have explicit `text-gray-900 dark:text-gray-100`

### Phase 2 — Color Harmony Standardization ✅
- [x] Unified green to `emerald` palette — `tokens.css` accent updated to `#10b981`
- [x] Unified warning to `amber` palette — removed all `yellow-*` mixing in dark mode
- [x] Updated `tokens.css --color-accent` from `#22c55e` → `#10b981`
- [x] Added complete `.dark` CSS custom property block in `tokens.css`
- [x] Removed unused CSS tokens: `--color-accent-2`, `--color-accent-light`, `--color-accent-bg`, `--color-surface`

### Phase 3 — Visual Polish ✅
- [x] Font sizes bumped from 8px/9px → 10px minimum
- [x] Dark mode borders: `dark:border-slate-800` → `dark:border-slate-700` (ratio 2.16:1)
- [x] Dark mode alert tint opacity: `/25` → `/40` for visibility
- [x] Body background gradient conflict resolved (uses CSS variable now)
- [x] Dot grid opacity: `opacity-20` → `opacity-[0.06]` (light), `opacity-[0.03]` → `opacity-[0.04]` (dark)
- [x] Suggested action box: solid colors instead of unpredictable blending

### Phase 4 — Cleanup ✅
- [x] Removed 7 unused components: InfoCard, MetricPill, SensorChart, SegmentedControl, NoticeBanner, StatusCard, OverallBadge

## Files Modified
- `assets/css/tokens.css` — Unified colors, added dark mode tokens, removed dead vars
- `pages/index.vue` — 25+ contrast fixes across template & script
- `pages/alerts.vue` — Nav icons, borders, label contrast, amber standardization
- `pages/logs.vue` — Timestamps, error text, borders, title colors
- `pages/config.vue` — Labels, input text colors, separators, borders
- `components/CompactSensorRow.vue` — Label dark mode, unit contrast, amber standardization
- `components/MinimalChart.vue` — Loading text contrast
