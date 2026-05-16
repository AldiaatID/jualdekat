# JualDekat — Manual E2E Test Checklist

Gunakan minimal **dua akun** (penjual A & pembeli B) di dua device/browser berbeda untuk skenario chat realtime.

## Setup
- [ ] Supabase project sudah running, schema/policies/seed dijalankan.
- [ ] Buckets `product-images` dan `avatars` dibuat dengan public read.
- [ ] `.env` terisi `EXPO_PUBLIC_SUPABASE_URL` & `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] App jalan di Expo Go / web.

## Acceptance Criteria

### AC-01 Auth
- [ ] User A bisa register dengan email + password.
- [ ] Email konfirmasi diterima (jika "Confirm email" aktif).
- [ ] User A login berhasil → diarahkan ke onboarding.
- [ ] Logout berfungsi (di tab Saya → Keluar).

### AC-02 Profil
- [ ] Onboarding wajib mengisi nama, kota, area.
- [ ] Foto profil bisa di-upload.
- [ ] Edit profil mengubah data.

### AC-03 Lokasi
- [ ] Layar `LocationPermissionScreen` muncul jika belum ada lat/lng.
- [ ] Setelah izin diberikan, lat/lng tersimpan di tabel `profiles`.
- [ ] Deny akses → muncul instruksi.

### AC-04 Feed berbasis lokasi
- [ ] Home menampilkan produk dengan jarak terhitung.
- [ ] Sort: produk terdekat lebih dulu.
- [ ] Tidak ada koordinat angka di UI.

### AC-05 Radius
- [ ] Mengubah chip radius (1/3/5/10/20 km) → list berubah.
- [ ] Empty state muncul saat radius kecil + tombol "Naikkan radius" bekerja.

### AC-06 Upload produk
- [ ] User A bisa upload produk dengan 2-3 foto.
- [ ] Validasi: tidak bisa submit tanpa nama / harga / kategori / kondisi / foto / area.
- [ ] Setelah submit, produk muncul di Home & profile sendiri.

### AC-07 Search & filter
- [ ] Keyword search bekerja (nama & deskripsi).
- [ ] Filter kategori, kondisi, harga min/max, radius berfungsi.
- [ ] Keyword terakhir terisi otomatis saat reopen Search.

### AC-08 Detail produk
- [ ] Carousel foto bekerja.
- [ ] Tombol berbeda untuk owner vs non-owner.
- [ ] Catatan keamanan COD tampil.

### AC-09 Chat realtime
- [ ] User B membuka detail produk A → tap "Chat" → masuk ChatRoom.
- [ ] User B mengirim pesan → muncul di User A tanpa refresh (Realtime).
- [ ] Buka chat dari produk yang sama lagi → tidak duplikat conversation.

### AC-10 Daftar chat
- [ ] Tab Chat menampilkan conversation aktif User A & B.
- [ ] Preview pesan terakhir tampil.

### AC-11 Favorit
- [ ] Tap heart di kartu/detail → tersimpan.
- [ ] Tab Favorit menampilkan produk favorit.
- [ ] Tap heart lagi → terhapus.

### AC-12 Profil sendiri & produk dijual
- [ ] Tab Saya menampilkan info, rating, list "Dijual" / "Terjual" / "Rating" / "Transaksi".

### AC-13 Mark as sold
- [ ] User A buka detail produk miliknya → "Tandai Terjual" → pilih User B → konfirmasi.
- [ ] Produk pindah ke tab "Terjual"; transaksi tercatat.
- [ ] Badge TERJUAL muncul di detail produk.

### AC-14 Rating
- [ ] User A & B bisa beri rating 1-5 + komentar.
- [ ] Rating average & count user yang dirating ter-update.
- [ ] Tidak bisa double rating untuk transaksi yang sama (RLS unique).

### AC-15 Report
- [ ] User B bisa laporkan produk A dengan alasan & deskripsi opsional.
- [ ] Record `reports` baru tersimpan (cek di Supabase).

### AC-16 Privasi lokasi
- [ ] Tidak ada angka koordinat yang tampil di UI.
- [ ] Hanya area teks + estimasi jarak yang ditampilkan.

### AC-17 README setup
- [ ] Developer baru bisa mengikuti README → app jalan.
