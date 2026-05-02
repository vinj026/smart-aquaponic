# Unused / Legacy File Audit

Tanggal audit: 2026-05-03  
Scope: repo `smart-aquaponic`, berdasarkan import graph, routing Nuxt, package usage, git status, dan build frontend.

## Ringkasan

Project aktif saat ini adalah dashboard Nuxt di `apps/web` yang membaca data dari Supabase lewat `apps/web/composables/useSupabaseData.js` dan `apps/web/utils/supabase.ts`.

Kode lama masih tersisa dari arsitektur Firebase + simulator:

- `apps/simulator` sudah terhapus di working tree.
- `apps/api` masih Express + Firebase RTDB, tetapi frontend aktif tidak memanggil API ini.
- Beberapa komponen Vue lama tidak lagi diimport oleh halaman aktif.
- Beberapa dependency masih ada di `package.json`, tetapi tidak dipakai oleh source aktif.

## File yang Tidak Digunakan oleh App Aktif

### Frontend Components Lama

File berikut tidak punya referensi dari `pages`, `app.vue`, atau komponen aktif lain. Nuxt build tetap berhasil tanpa jalur import ke file-file ini.

| File | Status | Alasan |
|---|---|---|
| `apps/web/components/SegmentedControl.vue` | Unused | Tidak diimport atau dipakai di template aktif. Control chart sekarang dibuat inline di `pages/index.vue`. |
| `apps/web/components/MetricPill.vue` | Unused | Digantikan oleh `CompactSensorRow.vue`. Tidak ada referensi aktif. |
| `apps/web/components/OverallBadge.vue` | Unused | Status badge sekarang dibuat inline di header `pages/index.vue`. |
| `apps/web/components/SensorChart.vue` | Unused | Chart aktif memakai `MinimalChart.vue`. |
| `apps/web/components/InfoCard.vue` | Unused | Lifecycle card sekarang dibuat inline di `pages/index.vue`. |
| `apps/web/components/NoticeBanner.vue` | Unused | Alert/insight banner sekarang dibuat inline di `pages/index.vue`. |
| `apps/web/components/StatusCard.vue` | Unused | Tidak ada import aktif. |

### Frontend Icons Lama

File berikut adalah icon custom lama. Halaman aktif sekarang memakai `lucide-vue-next`, bukan icon custom ini.

| File | Status | Alasan |
|---|---|---|
| `apps/web/components/icons/IconBell.vue` | Unused | Header memakai `BellIcon` dari `lucide-vue-next`. |
| `apps/web/components/icons/IconChart.vue` | Unused | Tidak ada referensi aktif. |
| `apps/web/components/icons/IconDrop.vue` | Unused | Tidak ada referensi aktif. |
| `apps/web/components/icons/IconFish.vue` | Unused | Tidak ada referensi aktif. |
| `apps/web/components/icons/IconLeaf.vue` | Unused | Tidak ada referensi aktif. |
| `apps/web/components/icons/IconPencil.vue` | Unused | Tidak ada referensi aktif. |
| `apps/web/components/icons/IconStatus.vue` | Indirect unused | Hanya dipakai oleh `NoticeBanner.vue`, dan `NoticeBanner.vue` sendiri unused. |

## Legacy / Kandidat Dihapus Setelah Keputusan Arsitektur

File berikut masih saling terhubung secara internal, tetapi tidak dipakai oleh frontend Supabase saat ini. Kalau project sudah resmi pindah ke Supabase penuh, bagian ini bisa dihapus sebagai legacy Firebase API.

| File | Status | Alasan |
|---|---|---|
| `apps/api/src/index.js` | Legacy candidate | Menjalankan Express API Firebase. Frontend aktif tidak memanggil endpoint ini. |
| `apps/api/src/routes/readings.js` | Legacy candidate | Menulis ke Firebase RTDB path `aquaponic/sensors/*`, bukan Supabase table aktif. |
| `apps/api/src/config/firebaseAdmin.js` | Legacy candidate | Hanya dipakai oleh route Firebase API. |
| `apps/api/src/services/statusService.js` | Legacy candidate | Hanya dipakai oleh `apps/api/src/routes/readings.js`. |
| `apps/api/src/services/validate.js` | Legacy candidate | Hanya dipakai oleh `apps/api/src/routes/readings.js`. |
| `apps/api/package.json` | Legacy candidate | Dibutuhkan hanya kalau API Firebase masih dipertahankan. |
| `apps/api/package-lock.json` | Legacy candidate | Lockfile untuk API Firebase. |
| `apps/api/.env.example` | Legacy/outdated | Masih berisi konfigurasi Firebase. Tidak cocok dengan target Supabase v2. |

Catatan: jangan hapus `apps/api` kalau masih ada kebutuhan menjalankan ingestion Firebase lama atau demo v1.

## File yang Sudah Dihapus di Working Tree

Git status menunjukkan file berikut sudah dihapus dari working tree. Berdasarkan PRD v2 yang memindahkan simulator ke Supabase Edge Function/Cron, penghapusan ini konsisten dengan arsitektur baru.

| File | Status | Alasan |
|---|---|---|
| `apps/simulator/index.js` | Deleted, likely obsolete | Simulator Node.js lama digantikan oleh target Supabase cron/edge function. |
| `apps/simulator/package.json` | Deleted, likely obsolete | Package untuk simulator lama. |
| `apps/simulator/package-lock.json` | Deleted, likely obsolete | Lockfile simulator lama. |
| `apps/simulator/.env.example` | Deleted, likely obsolete | Env simulator lama. |
| `apps/simulator/.continue/skills/supabase` | Deleted, unrelated/dev artifact | Skill/tooling lokal di dalam app simulator. |
| `apps/simulator/.continue/skills/supabase-postgres-best-practices` | Deleted, unrelated/dev artifact | Skill/tooling lokal di dalam app simulator. |
| `apps/simulator/.qwen/skills/supabase` | Deleted, unrelated/dev artifact | Skill/tooling lokal di dalam app simulator. |
| `apps/simulator/.qwen/skills/supabase-postgres-best-practices` | Deleted, unrelated/dev artifact | Skill/tooling lokal di dalam app simulator. |

## Env / Dokumentasi yang Outdated

File ini bukan selalu “unused”, tetapi isinya tidak sinkron dengan kode aktif Supabase.

| File | Status | Alasan |
|---|---|---|
| `.env.example` | Outdated | Masih menyebut `apps/simulator` dan `NUXT_PUBLIC_FIREBASE_*`. |
| `apps/web/.env.example` | Outdated | Masih Firebase, sementara kode aktif memakai Supabase. |
| `README.md` | Outdated | Masih menjelaskan `Simulator -> Backend API -> Firebase -> Dashboard`. |
| `docs/architecture.md` | Outdated | Masih menjelaskan Firebase RTDB dan simulator Node.js. |

## Dependency yang Tampak Tidak Dipakai

### `apps/web/package.json`

| Dependency | Status | Alasan |
|---|---|---|
| `chart.js` | Unused | Tidak ada import dari source aktif. Chart dibuat manual di `MinimalChart.vue` dengan SVG. |
| `vue-chartjs` | Unused | Tidak ada import dari source aktif. |

Dependency web yang masih dipakai:

- `@supabase/supabase-js`
- `date-fns`
- `lucide-vue-next`
- `nuxt`
- `@nuxtjs/color-mode`
- `@nuxtjs/tailwindcss`
- `tailwindcss`

### `apps/api/package.json`

Semua dependency API (`express`, `cors`, `dotenv`, `firebase-admin`) hanya relevan kalau `apps/api` tetap dipertahankan. Jika API Firebase dihapus, dependency ini ikut tidak diperlukan.

## Generated / Cache, Bukan Source Project

Direktori berikut bukan source yang perlu dianalisis sebagai fitur. Sudah masuk `.gitignore`, tetapi ada di filesystem lokal karena hasil install/build.

| Path | Status | Alasan |
|---|---|---|
| `apps/web/.nuxt/` | Generated | Output Nuxt prepare/build. |
| `apps/web/.output/` | Generated | Output `npm run build`. |
| `apps/web/node_modules/` | Dependency install | Tidak perlu commit. |
| `apps/api/node_modules/` | Dependency install | Tidak perlu commit. |

## File Sensitif / Perlu Diperhatikan

| File | Status | Catatan |
|---|---|---|
| `apps/api/smartaquaponic-42799-firebase-adminsdk-fbsvc-812891e222.json` | Local secret / should stay ignored | Firebase service account. Sudah cocok dengan pola `.gitignore` `apps/api/*firebase-adminsdk*.json`. |
| `apps/web/utils/supabase.ts` | Active, but risky | File aktif, namun Supabase URL dan anon key di-hardcode. `nuxt.config.ts` sudah punya runtime config, jadi sebaiknya pindahkan ke env. |

## File Aktif Utama

File ini masih menjadi jalur app aktif dan tidak disarankan dihapus:

- `apps/web/app.vue`
- `apps/web/pages/index.vue`
- `apps/web/pages/alerts.vue`
- `apps/web/pages/logs.vue`
- `apps/web/pages/config.vue`
- `apps/web/composables/useSupabaseData.js`
- `apps/web/utils/supabase.ts`
- `apps/web/components/CompactSensorRow.vue`
- `apps/web/components/MinimalChart.vue`
- `apps/web/assets/css/tokens.css`
- `apps/web/nuxt.config.ts`
- `apps/web/tailwind.config.js`
- `apps/web/public/manifest.json`
- `apps/web/public/icon.png`

## Verifikasi

- `npm run build` di `apps/web`: berhasil.
- `npm test` di `apps/api`: berhasil, tetapi hanya menjalankan placeholder `No tests configured`.
