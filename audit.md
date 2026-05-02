# Bug Audit

Tanggal audit: 2026-05-03  
Scope: aplikasi aktif di `apps/web` dengan backend data Supabase.

## Ringkasan

Audit ini fokus ke bug fungsional dan risiko perilaku runtime, bukan sekadar cleanup atau style issue. Temuan di bawah diprioritaskan berdasarkan dampak ke user dan kemungkinan muncul di penggunaan nyata.

## Findings

### 1. Tombol export bisa terkunci permanen saat history kosong

- Severity: High
- Lokasi: [apps/web/pages/index.vue](/home/vin/vin/Projects/smart-aquaponic/apps/web/pages/index.vue:453)

`exportCsv()` mengubah `isExporting.value = true`, lalu langsung `return` saat `history.value` kosong. Karena `isExporting` tidak di-reset di jalur itu, tombol export akan tetap disabled sampai page di-refresh.

Baris terkait:
- [apps/web/pages/index.vue:455](/home/vin/vin/Projects/smart-aquaponic/apps/web/pages/index.vue:455)
- [apps/web/pages/index.vue:459](/home/vin/vin/Projects/smart-aquaponic/apps/web/pages/index.vue:459)
- [apps/web/pages/index.vue:477](/home/vin/vin/Projects/smart-aquaponic/apps/web/pages/index.vue:477)

Dampak:
- User bisa kehilangan fungsi export sepenuhnya pada sesi itu.
- Skenario ini mudah terjadi saat data belum masuk atau query history gagal.

### 2. Halaman Alerts menampilkan “System is Healthy” sebelum data selesai dimuat

- Severity: High
- Lokasi: [apps/web/pages/alerts.vue](/home/vin/vin/Projects/smart-aquaponic/apps/web/pages/alerts.vue:22)

`activeAlerts` mengembalikan array kosong saat `latest` belum tersedia. Template lalu menganggap kondisi itu sebagai “tidak ada alert” dan menampilkan status sehat, padahal state sebenarnya masih loading.

Baris terkait:
- [apps/web/pages/alerts.vue:23](/home/vin/vin/Projects/smart-aquaponic/apps/web/pages/alerts.vue:23)
- [apps/web/pages/alerts.vue:78](/home/vin/vin/Projects/smart-aquaponic/apps/web/pages/alerts.vue:78)
- [apps/web/pages/alerts.vue:81](/home/vin/vin/Projects/smart-aquaponic/apps/web/pages/alerts.vue:81)

Dampak:
- False negative: sistem bisa sedang critical, tapi user lihat “healthy” beberapa detik pertama.
- Ini paling berbahaya di halaman yang fungsi utamanya justru untuk alert.

### 3. Halaman Logs menampilkan “No logs recorded yet” saat data masih loading atau query gagal

- Severity: Medium
- Lokasi: [apps/web/pages/logs.vue](/home/vin/vin/Projects/smart-aquaponic/apps/web/pages/logs.vue:29)

`useSystemEvents()` tidak expose `loading` atau `error`. Akibatnya page logs tidak bisa membedakan antara:

- data memang kosong
- request masih berjalan
- request gagal

Baris terkait:
- [apps/web/pages/logs.vue:29](/home/vin/vin/Projects/smart-aquaponic/apps/web/pages/logs.vue:29)
- [apps/web/composables/useSupabaseData.js:121](/home/vin/vin/Projects/smart-aquaponic/apps/web/composables/useSupabaseData.js:121)
- [apps/web/composables/useSupabaseData.js:126](/home/vin/vin/Projects/smart-aquaponic/apps/web/composables/useSupabaseData.js:126)

Dampak:
- User menerima informasi palsu saat koneksi lambat atau Supabase error.
- Debugging operasional jadi jauh lebih sulit karena failure terlihat seperti empty state normal.

### 4. Error Supabase disilent di semua composable, sehingga UI bisa menampilkan data kosong atau stale tanpa sinyal error

- Severity: Medium
- Lokasi utama: [apps/web/composables/useSupabaseData.js](/home/vin/vin/Projects/smart-aquaponic/apps/web/composables/useSupabaseData.js:12)

Semua query utama hanya membaca `data` dan mengabaikan `error`. Pola ini muncul di `useLatestReading`, `useReadingHistory`, `useSystemEvents`, `useLifecycleConfig`, dan `useThresholds`.

Baris terkait:
- [apps/web/composables/useSupabaseData.js:16](/home/vin/vin/Projects/smart-aquaponic/apps/web/composables/useSupabaseData.js:16)
- [apps/web/composables/useSupabaseData.js:68](/home/vin/vin/Projects/smart-aquaponic/apps/web/composables/useSupabaseData.js:68)
- [apps/web/composables/useSupabaseData.js:126](/home/vin/vin/Projects/smart-aquaponic/apps/web/composables/useSupabaseData.js:126)
- [apps/web/composables/useSupabaseData.js:162](/home/vin/vin/Projects/smart-aquaponic/apps/web/composables/useSupabaseData.js:162)
- [apps/web/composables/useSupabaseData.js:201](/home/vin/vin/Projects/smart-aquaponic/apps/web/composables/useSupabaseData.js:201)

Dampak:
- Query failure jatuh menjadi empty state biasa.
- Stale data lama bisa tetap terlihat valid.
- UI tidak punya mekanisme retry atau notifikasi kegagalan.

### 5. Realtime latest reading bisa menjadi stale permanen setelah disconnect karena channel global tidak pernah dipulihkan

- Severity: Medium
- Lokasi: [apps/web/composables/useSupabaseData.js](/home/vin/vin/Projects/smart-aquaponic/apps/web/composables/useSupabaseData.js:8)

`useLatestReading()` memakai shared singleton:

- `sharedLatestReading` disimpan global
- `latestChannel` dibuat sekali
- tidak ada `onBeforeUnmount`
- tidak ada handler reconnect / resubscribe saat channel drop

Jika koneksi realtime putus atau channel masuk status error/closed, composable hanya `console.log`, lalu state global yang lama tetap dipakai.

Baris terkait:
- [apps/web/composables/useSupabaseData.js:9](/home/vin/vin/Projects/smart-aquaponic/apps/web/composables/useSupabaseData.js:9)
- [apps/web/composables/useSupabaseData.js:32](/home/vin/vin/Projects/smart-aquaponic/apps/web/composables/useSupabaseData.js:32)
- [apps/web/composables/useSupabaseData.js:48](/home/vin/vin/Projects/smart-aquaponic/apps/web/composables/useSupabaseData.js:48)

Dampak:
- Dashboard bisa berhenti update tetapi tetap terlihat “normal”.
- Navigasi antar halaman tidak otomatis memaksa refetch karena state singleton sudah terisi.

### 6. Chart salah menyatakan “Loading data...” ketika sebenarnya sudah ada 1 titik data

- Severity: Medium
- Lokasi: [apps/web/components/MinimalChart.vue](/home/vin/vin/Projects/smart-aquaponic/apps/web/components/MinimalChart.vue:3)

Chart menganggap data valid hanya jika `values.length > 1`. Saat baru ada satu reading, komponen tetap menampilkan “Loading data...”, padahal data pertama sudah tersedia.

Baris terkait:
- [apps/web/components/MinimalChart.vue:3](/home/vin/vin/Projects/smart-aquaponic/apps/web/components/MinimalChart.vue:3)
- [apps/web/components/MinimalChart.vue:142](/home/vin/vin/Projects/smart-aquaponic/apps/web/components/MinimalChart.vue:142)

Dampak:
- Fresh deployment atau database baru terlihat seperti loading terus.
- User bisa salah mengira realtime belum jalan padahal data pertama sudah masuk.

### 7. Edit threshold optimistically mutates form state, tetapi gagal save tidak di-rollback

- Severity: Medium
- Lokasi: [apps/web/pages/config.vue](/home/vin/vin/Projects/smart-aquaponic/apps/web/pages/config.vue:87)

Input threshold memakai `v-model.number` langsung ke object pada list `thresholds`. Kalau update ke Supabase gagal, UI sudah telanjur menampilkan nilai baru, sementara database tetap nilai lama. Tidak ada rollback atau refetch.

Baris terkait:
- [apps/web/pages/config.vue:87](/home/vin/vin/Projects/smart-aquaponic/apps/web/pages/config.vue:87)
- [apps/web/pages/config.vue:95](/home/vin/vin/Projects/smart-aquaponic/apps/web/pages/config.vue:95)
- [apps/web/pages/config.vue:148](/home/vin/vin/Projects/smart-aquaponic/apps/web/pages/config.vue:148)
- [apps/web/composables/useSupabaseData.js:210](/home/vin/vin/Projects/smart-aquaponic/apps/web/composables/useSupabaseData.js:210)

Dampak:
- UI dan database bisa divergen.
- User merasa perubahan tersimpan padahal gagal.

### 8. Perhitungan umur tanaman/ikan rawan off-by-one karena parsing tanggal bergantung timezone browser

- Severity: Low
- Lokasi: [apps/web/pages/index.vue](/home/vin/vin/Projects/smart-aquaponic/apps/web/pages/index.vue:332)

`new Date(config.value.crop_start_date)` dan `new Date(config.value.fish_start_date)` dipakai langsung untuk hitung selisih hari. Jika nilai yang disimpan berupa string tanggal `YYYY-MM-DD`, JavaScript memperlakukannya sebagai UTC, sehingga di timezone tertentu umur bisa bergeser satu hari di sekitar pergantian hari lokal.

Baris terkait:
- [apps/web/pages/index.vue:334](/home/vin/vin/Projects/smart-aquaponic/apps/web/pages/index.vue:334)
- [apps/web/pages/index.vue:341](/home/vin/vin/Projects/smart-aquaponic/apps/web/pages/index.vue:341)

Dampak:
- Label lifecycle bisa berubah terlalu cepat atau terlambat satu hari.
- Diagnosis berbasis fase biologis bisa ikut meleset.

## Temuan Tambahan

- [apps/web/utils/supabase.ts](/home/vin/vin/Projects/smart-aquaponic/apps/web/utils/supabase.ts:3) masih hardcode URL dan anon key, padahal [apps/web/nuxt.config.ts](/home/vin/vin/Projects/smart-aquaponic/apps/web/nuxt.config.ts:24) sudah menyiapkan runtime config. Ini lebih tepat dikategorikan sebagai deployment/security risk daripada bug fungsional murni.
- [apps/web/pages/index.vue](/home/vin/vin/Projects/smart-aquaponic/apps/web/pages/index.vue:285) mendestructure `loading: historyLoading` dari `useReadingHistory()`, tetapi composable tidak mengembalikan `loading`. Ini belum memicu bug langsung karena variabelnya tidak dipakai, tetapi menunjukkan contract yang tidak sinkron.

## Verifikasi yang Dilakukan

- Baca import graph dan state flow halaman utama, alerts, logs, config.
- Verifikasi build frontend dengan `npm run build` di `apps/web`: berhasil.
- Tidak ada test suite nyata yang bisa memverifikasi perilaku runtime; `apps/api` hanya punya placeholder test.
