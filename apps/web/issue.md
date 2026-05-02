# UI/UX Improvement Issues (Aquaguard IoT Dashboard)

Berikut adalah hasil *deep analysis* terkait UI/UX dari dashboard saat ini. Semua *issue* di bawah ini difokuskan pada perbaikan praktis tanpa *over-engineering* (quick wins).

## 1. Chart Visualization & Bounds (Kritis)
**Masalah:** 
- Garis grafik pada `MinimalChart` sering terpotong di batas atas atau bawah karena nilai statis, membuat data seolah "hilang".
- Label Y-axis (`10.2`, `8.1`) posisinya kurang rapi dan menabrak garis grafik.
- Sumbu X tidak memiliki keterangan waktu sama sekali.

**Solusi Simple:**
- Buat *bounds* Y-axis menjadi dinamis (ambil nilai `min` dan `max` dari data, beri *padding* 10%).
- Rapikan posisi *absolute* label Y-axis (geser sedikit ke kiri).
- Tambahkan 3 label waktu sederhana di bagian bawah sumbu X (misal: waktu awal, tengah, dan akhir dari rentang data).

---

## 2. Contrast & Readability (Menengah)
**Masalah:**
- Pada *Light Mode*, komponen **Critical Alert** menggunakan teks merah di atas *background* merah muda. Untuk dibaca dalam waktu lama, kontras ini kurang nyaman.
- Daftar "Recent Activity" terlihat cukup padat; teks log berukuran kecil (`11px`) tanpa *spacing* yang cukup antar item.

**Solusi Simple:**
- Tingkatkan kontras alert di *Light Mode* (misal: *background* putih dengan *border* merah tebal, atau teks merah yang lebih solid/gelap).
- Tambahkan sedikit *padding* atau margin di `Recent Activity` agar daftar log lebih mudah di-*scan* secara visual.

---

## 3. Empty & Loading States (Menengah)
**Masalah:**
- Saat halaman di-*refresh*, tidak ada *feedback* visual bahwa data sedang dimuat. UI kosong beberapa milidetik lalu tiba-tiba muncul (*layout shift*).

**Solusi Simple:**
- Gunakan state `pending` dari `useSupabaseData` untuk menampilkan *skeleton loader* sederhana (kotak abu-abu dengan efek `animate-pulse`) di komponen **Live Sensors** dan **Critical Alert**.

---

## 4. Lifecycle Card Proportion (Minor)
**Masalah:**
- Pada kartu **Crop Age** dan **Fish Age**, angka `34` atau `40` sangat besar namun keterangan teks `Days` di sebelahnya sangat kecil dan terlihat melayang, meninggalkan cukup banyak *dead space* vertikal.

**Solusi Simple:**
- Sesuaikan ukuran tipografi: besarkan sedikit teks "Days" dan atur *alignment* (`items-baseline`) agar sejajar secara horizontal dengan angka utama, sehingga *card* terlihat lebih kokoh.
