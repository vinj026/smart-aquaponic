# Bug Audit

Tanggal audit: 2026-05-03  
Scope: follow-up fix setelah audit final check.

## Ringkasan

Semua temuan pada audit terbaru sudah ditangani di working tree saat ini. Fokus fix kali ini ada pada failure mode jaringan, race condition async, sinkronisasi form, dan validasi input threshold.

## Resolved Findings

### 1. Error latest reading bisa tertutup data stale

- Status: Fixed
- File: [apps/web/composables/useSupabaseData.js](/home/vin/vin/Projects/smart-aquaponic/apps/web/composables/useSupabaseData.js:23)

Saat fetch latest reading gagal atau channel realtime masuk status error/closed, `sharedLatestReading` sekarang ikut dikosongkan. UI tidak lagi merender sensor lama sebagai data aktif ketika error sedang terjadi.

### 2. Event feed tidak auto-recover jika fetch awal gagal

- Status: Fixed
- File: [apps/web/composables/useSupabaseData.js](/home/vin/vin/Projects/smart-aquaponic/apps/web/composables/useSupabaseData.js:211)

`useSystemEvents()` sekarang tetap membuat subscription realtime walaupun query awal gagal. Dengan begitu event baru masih bisa masuk saat koneksi/realtime pulih tanpa menunggu user refresh halaman.

### 3. Race condition saat ganti range chart cepat

- Status: Fixed
- File: [apps/web/composables/useSupabaseData.js](/home/vin/vin/Projects/smart-aquaponic/apps/web/composables/useSupabaseData.js:140)

`useReadingHistory()` sekarang memakai request id guard. Response lama yang datang terlambat tidak lagi boleh menimpa hasil range terbaru.

### 4. Form lifecycle tidak sinkron saat backend mengembalikan nilai kosong

- Status: Fixed
- File: [apps/web/pages/config.vue](/home/vin/vin/Projects/smart-aquaponic/apps/web/pages/config.vue:138)

Watcher config sekarang selalu menyinkronkan field date, termasuk saat nilai backend `null` atau string kosong. Field lokal tidak lagi mempertahankan nilai lama yang sudah tidak ada di database.

### 5. Input threshold belum memvalidasi `NaN`

- Status: Fixed
- File: [apps/web/pages/config.vue](/home/vin/vin/Projects/smart-aquaponic/apps/web/pages/config.vue:163)

`handleThresholdChange()` sekarang membangun payload update terlebih dahulu, memvalidasi semua nilai dengan `Number.isFinite`, dan melakukan refetch threshold bila input invalid agar UI kembali ke state database.

## Final Check

- `npm run build` di `apps/web`: berhasil.
- Sisa risiko utama: belum ada automated test suite untuk mensimulasikan network failure, Supabase subscription recovery, dan rapid range switching.
