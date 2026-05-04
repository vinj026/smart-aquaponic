# Aquaguard IoT — Testing PRD

**Version:** 1.0  
**Status:** In Progress  
**Last Updated:** 2025

---

## Table of Contents

1. [Tujuan Testing](#1-tujuan-testing)
2. [Scope](#2-scope)
3. [Functional Testing](#3-functional-testing)
4. [UX & Visual Testing](#4-ux--visual-testing)
5. [Realtime & Data Testing](#5-realtime--data-testing)
6. [Responsive Testing](#6-responsive-testing)
7. [Edge Cases](#7-edge-cases)
8. [Bug Reporting](#8-bug-reporting)

---

## 1. Tujuan Testing

Memastikan semua fitur Aquaguard IoT berjalan sesuai ekspektasi sebelum di-present sebagai portofolio ADA. Testing difokuskan pada tiga area utama:

- **Fungsionalitas** — semua fitur bekerja sebagaimana mestinya
- **Visual & UX** — tampilan konsisten, copy jelas, tidak ada broken UI
- **Data & Realtime** — data sensor realistis, event log akurat, realtime sync aktif

---

## 2. Scope

### In Scope

- Dashboard utama (halaman index)
- Halaman System Config (`/config`)
- Realtime sensor display
- Historical chart
- Event log / Recent Activity
- Insight Engine (Critical Alert, Warning, Normal)
- Dark mode
- Responsive layout (mobile & desktop)

### Out of Scope

- Auth & multi-user (belum diimplementasi)
- Push notification (belum diimplementasi)
- Export CSV (belum diimplementasi)

---

## 3. Functional Testing

### 3.1 Realtime Sensor Display

| # | Test Case | Expected Result | Status |
|---|---|---|---|
| F-01 | Buka dashboard | Keempat sensor card tampil dengan nilai terkini | ⬜ |
| F-02 | Tunggu 1 menit | Nilai sensor berubah secara gradual, tidak spike ekstrem | ⬜ |
| F-03 | Cek timestamp | "Diperbarui X lalu" terus update setiap detik | ⬜ |
| F-04 | Cek badge status | Badge NORMAL / WARNING / DANGER muncul sesuai nilai sensor | ⬜ |
| F-05 | Cek overall status di header | Badge di header match dengan status sensor terparah | ⬜ |

### 3.2 Insight Engine

| # | Test Case | Expected Result | Status |
|---|---|---|---|
| F-06 | Sensor dalam kondisi normal semua | Insight menampilkan pesan berbasis fase lifecycle, bukan "all good" generik | ⬜ |
| F-07 | Ada sensor WARNING | Insight menampilkan diagnosis warning + tindakan yang disarankan | ⬜ |
| F-08 | Ada sensor DANGER | Insight menampilkan Critical Alert + tindakan urgent | ⬜ |
| F-09 | Cek tone pesan | Pesan terasa santai dan conversational, bukan kaku seperti system log | ⬜ |
| F-10 | Cek nilai sensor di pesan | Pesan menyebut nilai sensor secara eksplisit (misal "pH turun ke 6.4") | ⬜ |
| F-11 | Icon alert | Warna icon match dengan severity (merah untuk danger) | ⬜ |

### 3.3 Historical Chart

| # | Test Case | Expected Result | Status |
|---|---|---|---|
| F-12 | Klik time range 1H | Chart menampilkan data 1 jam terakhir | ⬜ |
| F-13 | Klik time range 6H | Chart menampilkan data 6 jam terakhir | ⬜ |
| F-14 | Klik time range 24H | Chart menampilkan data 24 jam terakhir | ⬜ |
| F-15 | Klik metric Turb / pH / TDS / Wtr | Chart berganti menampilkan metrik yang dipilih | ⬜ |
| F-16 | Cek velocity indicator | Label "Meningkat / Menurun / Stabil" akurat sesuai tren data | ⬜ |
| F-17 | Cek bentuk grafik | Garis bergerak gradual, tidak ada spike chaotic | ⬜ |

### 3.4 Event Log / Recent Activity

| # | Test Case | Expected Result | Status |
|---|---|---|---|
| F-18 | Cek badge event | Badge WARNING / DANGER / Recovery tampil dengan warna yang benar | ⬜ |
| F-19 | Cek pesan event | Pesan kontekstual dan menyebut nilai sensor secara eksplisit | ⬜ |
| F-20 | Cek timestamp event | Timestamp akurat sesuai waktu kejadian | ⬜ |
| F-21 | Tunggu status berubah | Event baru muncul di atas log tanpa perlu refresh | ⬜ |
| F-22 | Cek urutan event | Event terbaru selalu di atas | ⬜ |

### 3.5 System Config — Lifecycle Settings

| # | Test Case | Expected Result | Status |
|---|---|---|---|
| F-23 | Ubah tanggal tanam | Crop Age di dashboard berubah sesuai tanggal baru | ⬜ |
| F-24 | Ubah tanggal tebar ikan | Fish Age di dashboard berubah sesuai tanggal baru | ⬜ |
| F-25 | Klik "Simpan konfigurasi" | Muncul feedback sukses (tombol berubah jadi "Tersimpan ✓") | ⬜ |
| F-26 | Refresh setelah save | Tanggal yang disimpan tetap tersimpan, tidak reset | ⬜ |

### 3.6 System Config — Sensor Thresholds

| # | Test Case | Expected Result | Status |
|---|---|---|---|
| F-27 | Ubah rentang normal pH | Simulator menggunakan threshold baru untuk menentukan status | ⬜ |
| F-28 | Ubah rentang aman pH | Status warning/danger muncul sesuai threshold baru | ⬜ |
| F-29 | Input nilai tidak valid (huruf) | Form tidak menerima input non-angka | ⬜ |
| F-30 | Input nilai min > max | Form menampilkan validasi error | ⬜ |

### 3.7 Dark Mode

| # | Test Case | Expected Result | Status |
|---|---|---|---|
| F-31 | Klik toggle dark/light | Mode berganti tanpa flash atau glitch | ⬜ |
| F-32 | Refresh setelah ganti mode | Mode yang dipilih tetap tersimpan | ⬜ |
| F-33 | Buka pertama kali | Mode mengikuti preferensi sistem (prefers-color-scheme) | ⬜ |

---

## 4. UX & Visual Testing

### 4.1 Copy & Bahasa

| # | Test Case | Expected Result | Status |
|---|---|---|---|
| U-01 | Cek semua badge status | WARNING / DANGER / NORMAL / Recovery → tetap Bahasa Inggris | ⬜ |
| U-02 | Cek label form di config | "Tanggal tanam", "Rentang normal", "Simpan konfigurasi" → Bahasa Indonesia | ⬜ |
| U-03 | Cek pesan insight & event log | Bahasa Indonesia, tone santai, tidak kaku | ⬜ |
| U-04 | Cek fase lifecycle | "Near Harvest", "Grow-out", "Seedling" → tetap Bahasa Inggris | ⬜ |
| U-05 | Tidak ada typo | Semua teks bebas typo dan konsisten | ⬜ |

### 4.2 Color Semantics

| # | Test Case | Expected Result | Status |
|---|---|---|---|
| U-06 | Warna badge WARNING | Amber / kuning — tidak merah | ⬜ |
| U-07 | Warna badge DANGER | Merah — paling mencolok | ⬜ |
| U-08 | Warna badge Recovery | Hijau | ⬜ |
| U-09 | Warna label "Rentang aman" di config | Muted / netral — bukan amber atau hijau | ⬜ |
| U-10 | Warna icon insight | Match dengan severity badge di sampingnya | ⬜ |
| U-11 | Dark mode — status colors | Warna status lebih muted, tidak neon | ⬜ |

### 4.3 Visual Hierarchy

| # | Test Case | Expected Result | Status |
|---|---|---|---|
| U-12 | Insight Engine saat DANGER | Terasa paling urgent secara visual dibanding elemen lain | ⬜ |
| U-13 | Sensor card saat WARNING | Background berubah subtle amber | ⬜ |
| U-14 | Sensor card saat DANGER | Background berubah subtle merah | ⬜ |
| U-15 | Tidak ada dead space | Tidak ada area kosong besar yang tidak intentional | ⬜ |

---

## 5. Realtime & Data Testing

| # | Test Case | Expected Result | Status |
|---|---|---|---|
| R-01 | Buka dua tab sekaligus | Kedua tab update secara bersamaan | ⬜ |
| R-02 | Matikan internet lalu nyalakan lagi | Dashboard reconnect otomatis tanpa perlu refresh | ⬜ |
| R-03 | Tunggu 10 menit | Data terus masuk, tidak ada gap atau stuck | ⬜ |
| R-04 | Cek pola data sensor | Nilai bergerak gradual, ada korelasi TDS naik → turbidity naik | ⬜ |
| R-05 | Cek water level | Volume air turun perlahan, naik saat sudah terlalu rendah (simulasi refill) | ⬜ |
| R-06 | Cek frekuensi warning | Warning tidak muncul terlalu sering — tidak lebih dari 2-3x per jam dalam kondisi normal | ⬜ |

---

## 6. Responsive Testing

### 6.1 Mobile (< 768px)

| # | Test Case | Expected Result | Status |
|---|---|---|---|
| M-01 | Dashboard di mobile | Single column, semua komponen readable | ⬜ |
| M-02 | Sensor card di mobile | Nilai sensor tidak terpotong | ⬜ |
| M-03 | Chart di mobile | Full width, label terbaca | ⬜ |
| M-04 | Event log di mobile | Scrollable, tidak overflow horizontal | ⬜ |
| M-05 | Config page di mobile | Form input readable, tombol save accessible | ⬜ |
| M-06 | Font size di mobile | Tidak terlalu kecil (minimum 12px untuk body) | ⬜ |
| M-07 | Touch target | Semua button dan interactive element minimum 44x44px | ⬜ |

### 6.2 Desktop (> 1024px)

| # | Test Case | Expected Result | Status |
|---|---|---|---|
| D-01 | Dashboard di desktop | Two-column layout, konten tidak stretch full width | ⬜ |
| D-02 | Config page di desktop | Sensor threshold cards tampil 2x2 grid | ⬜ |
| D-03 | Max width | Konten dibatasi max-w-4xl, tidak ada teks yang terlalu panjang per baris | ⬜ |
| D-04 | Font size di desktop | Proporsional, tidak terlalu besar atau kecil | ⬜ |

### 6.3 Browser Compatibility

| Browser | Tested | Notes |
|---|---|---|
| Chrome (latest) | ⬜ | |
| Firefox (latest) | ⬜ | |
| Safari (latest) | ⬜ | |
| Mobile Chrome | ⬜ | |
| Mobile Safari | ⬜ | |

---

## 7. Edge Cases

| # | Skenario | Expected Result | Status |
|---|---|---|---|
| E-01 | Supabase sedang down | Dashboard menampilkan error state yang jelas, tidak blank putih | ⬜ |
| E-02 | Koneksi internet lambat | Loading state tampil saat fetch data | ⬜ |
| E-03 | Belum ada data historis (fresh deploy) | Chart menampilkan empty state yang jelas | ⬜ |
| E-04 | Event log kosong | Panel menampilkan empty state, tidak blank | ⬜ |
| E-05 | Lifecycle date belum di-set | Crop Age dan Fish Age menampilkan fallback yang masuk akal | ⬜ |
| E-06 | Semua sensor normal sekaligus | Insight engine menampilkan pesan berbasis lifecycle, bukan kosong | ⬜ |

---

## 8. Bug Reporting

Setiap bug yang ditemukan dicatat dengan format berikut dan dibuat sebagai GitHub Issue:

```markdown
**Judul:** [Komponen] Deskripsi singkat bug

**Severity:** Critical / High / Medium / Low

**Steps to reproduce:**
1. ...
2. ...
3. ...

**Expected:** Apa yang seharusnya terjadi
**Actual:** Apa yang terjadi
**Screenshot:** (attach jika ada)
**Browser/Device:** Chrome desktop / Mobile Safari / dll
```

### Severity Guide

| Severity | Definisi | Contoh |
|---|---|---|
| **Critical** | App tidak bisa digunakan, data salah | Sensor tidak update, config tidak tersimpan |
| **High** | Fitur utama broken tapi ada workaround | Chart tidak load, event log kosong terus |
| **Medium** | Fitur minor broken atau visual salah | Warna badge salah, typo di copy |
| **Low** | Cosmetic issue, tidak mempengaruhi fungsi | Spacing tidak konsisten, font size kurang pas |

### Branch untuk Bug Fix

```bash
# Format branch untuk bug fix
git checkout -b fix/[komponen]-[deskripsi-singkat]

# Contoh
git checkout -b fix/insight-icon-color
git checkout -b fix/config-date-not-persisting
git checkout -b fix/chart-empty-state
```

---

*Testing PRD ini harus diselesaikan sebelum submit portofolio ke Apple Developer Academy.*
