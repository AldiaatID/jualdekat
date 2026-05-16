# JualDekat - Requirements

## 1. Overview
JualDekat adalah aplikasi marketplace lokal berbasis lokasi untuk jual-beli barang baru dan bekas yang lokasinya dekat dengan pengguna. Aplikasi ini fokus pada *discovery* barang sekitar, *upload* produk, *chat* langsung dengan penjual/pembeli, transaksi COD/pickup, dan rating sederhana setelah transaksi. MVP dibangun dengan React Native (Expo) + TypeScript dan Supabase sebagai backend.

## 2. Problem Statement
Marketplace besar seperti Shopee/Tokopedia berfokus pada pengiriman jarak jauh dengan ongkir, voucher, dan checkout kompleks. Untuk anak kos, mahasiswa, dan warga sekitar kampus, kebutuhan utama justru:
- Membeli/menjual barang bekas dalam jarak dekat agar bisa COD tanpa ongkir.
- Menemukan barang yang tersedia di radius beberapa kilometer.
- Bertransaksi cepat tanpa harus melewati banyak tahap pembayaran.

Solusi berbasis grup chat atau Facebook Marketplace kurang terstruktur (tidak ada filter, rating, atau moderasi). JualDekat hadir sebagai alternatif yang lebih terstruktur dan ramah pengguna lokal.

## 3. Target User
- Anak kos
- Mahasiswa
- Warga sekitar kampus
- Penjual barang bekas yang ingin transaksi cepat
- Pembeli yang mencari barang murah dekat lokasi
- Pengguna yang lebih nyaman COD daripada kirim antar kota

## 4. User Stories

### 4.1 Autentikasi & Profil
- **US-01**: Sebagai pengguna baru, saya ingin daftar dengan email & password agar bisa mulai memakai aplikasi.
- **US-02**: Sebagai pengguna terdaftar, saya ingin login/logout agar akun saya aman.
- **US-03**: Sebagai pengguna baru, saya ingin melengkapi profil (nama, kota, area, foto, WhatsApp) agar pembeli/penjual lain bisa mengenali saya.
- **US-04**: Sebagai pengguna, saya ingin mengubah profil kapan saja.

### 4.2 Lokasi
- **US-05**: Sebagai pengguna, saya ingin memberikan izin lokasi agar bisa melihat barang terdekat.
- **US-06**: Sebagai pengguna, saya ingin memilih radius pencarian (1/3/5/10/20 km).
- **US-07**: Sebagai pengguna, saya ingin melihat estimasi jarak suatu barang dari lokasi saya, bukan koordinat persisnya.

### 4.3 Produk
- **US-08**: Sebagai penjual, saya ingin mengunggah produk dengan foto, harga, kondisi, kategori, area, lokasi, dan metode transaksi.
- **US-09**: Sebagai penjual, saya ingin mengedit/menghapus produk milik saya.
- **US-10**: Sebagai penjual, saya ingin menandai produk sebagai *proses* atau *terjual*.
- **US-11**: Sebagai pembeli, saya ingin melihat feed produk berdasarkan kedekatan lokasi.
- **US-12**: Sebagai pembeli, saya ingin mencari produk berdasarkan kata kunci, kategori, harga, kondisi, dan radius.
- **US-13**: Sebagai pembeli, saya ingin melihat detail produk dengan foto carousel, info lengkap, dan info penjual.

### 4.4 Favorit
- **US-14**: Sebagai pembeli, saya ingin menyimpan produk favorit untuk dilihat lagi nanti.
- **US-15**: Sebagai pembeli, saya ingin melihat daftar favorit dan menghapusnya.

### 4.5 Chat
- **US-16**: Sebagai pembeli, saya ingin chat langsung dengan penjual dari halaman detail produk.
- **US-17**: Sebagai pengguna, saya ingin melihat semua percakapan saya dalam satu tempat.
- **US-18**: Sebagai pengguna, saya ingin menerima pesan secara *realtime*.

### 4.6 Transaksi & Rating
- **US-19**: Sebagai penjual, saya ingin memilih buyer dari daftar conversation saat menandai produk terjual.
- **US-20**: Sebagai pengguna setelah transaksi selesai, saya ingin memberi rating 1-5 dan komentar singkat.
- **US-21**: Sebagai pengguna, saya ingin melihat rating rata-rata pengguna lain.

### 4.7 Moderasi
- **US-22**: Sebagai pengguna, saya ingin melaporkan produk atau pengguna bermasalah.

## 5. Functional Requirements

### FR-1 Autentikasi
- FR-1.1 Register dengan email + password (Supabase Auth).
- FR-1.2 Login dengan email + password.
- FR-1.3 Logout.
- FR-1.4 Setelah register, redirect ke onboarding profil.
- FR-1.5 Proteksi route untuk halaman yang membutuhkan auth.

### FR-2 Profil
- FR-2.1 Tabel `profiles` menyimpan: id, full_name, avatar_url, phone_number, city, area, latitude, longitude, rating_average, rating_count, created_at, updated_at.
- FR-2.2 User bisa edit nama, foto profil, WhatsApp, kota, area.
- FR-2.3 Halaman profil menampilkan: info, produk yang dijual, produk terjual, rating.

### FR-3 Lokasi
- FR-3.1 Minta izin lokasi pertama kali aplikasi dibuka (atau pertama kali masuk Home).
- FR-3.2 Simpan latitude/longitude user di `profiles`.
- FR-3.3 Helper Haversine untuk hitung jarak.
- FR-3.4 Tampilkan jarak dalam format "800 m", "1.2 km", "5 km".
- FR-3.5 Tampilkan area teks (mis. "Beji", "Kemanggisan").
- FR-3.6 Pemilihan radius: 1, 3, 5, 10, 20 km.
- FR-3.7 **Privasi**: koordinat penjual tidak ditampilkan di UI publik.

### FR-4 Kategori
- FR-4.1 Kategori awal: Elektronik, Fashion, Buku, Perabot, Kendaraan, Alat Rumah Tangga, Hobi & Olahraga, Perlengkapan Bayi, Kos & Kontrakan, Lainnya.
- FR-4.2 Kategori disimpan di tabel `categories` dengan slug.

### FR-5 Upload Produk
- FR-5.1 Form: nama, deskripsi, harga, kategori, kondisi (baru/bekas), foto (1-5), area, lat/lng, metode transaksi (COD/pickup/kirim_lokal), status (tersedia/proses/terjual).
- FR-5.2 Validasi: nama wajib, harga > 0, kategori wajib, kondisi wajib, foto >= 1, area wajib, lokasi wajib.
- FR-5.3 Edit, hapus, mark-as-sold hanya oleh pemilik.
- FR-5.4 Upload foto ke Supabase Storage bucket `product-images`.

### FR-6 Feed
- FR-6.1 Halaman Home menampilkan produk berdasarkan radius user.
- FR-6.2 Sorting: jarak terdekat lebih dulu, jika mirip → terbaru.
- FR-6.3 Filter: keyword, kategori, harga min/max, kondisi, radius, status (default: tersedia).
- FR-6.4 Empty state jika tidak ada produk dalam radius, dengan tombol "Perluas Radius".
- FR-6.5 Layout grid 2 kolom; kartu memuat foto utama, nama, harga, kondisi, area, jarak, waktu upload.

### FR-7 Search
- FR-7.1 Halaman search terpisah dengan input keyword.
- FR-7.2 Filter sama seperti feed.
- FR-7.3 Simpan keyword terakhir di AsyncStorage.

### FR-8 Detail Produk
- FR-8.1 Tampilkan: carousel foto, nama, harga, kondisi, kategori, deskripsi, area, jarak, metode transaksi, status, info penjual (nama, foto, rating), tombol chat, favorit, report.
- FR-8.2 Jika produk milik sendiri: tombol Edit, Hapus, Tandai Terjual.
- FR-8.3 Jika produk terjual: badge "Terjual", warning saat chat baru.
- FR-8.4 Catatan keamanan: "Untuk keamanan, lakukan COD di tempat umum."

### FR-9 Favorit
- FR-9.1 Tombol favorit di kartu & detail produk.
- FR-9.2 Halaman daftar favorit + hapus.
- FR-9.3 Badge "Terjual" tetap ditampilkan jika produk terjual.

### FR-10 Chat
- FR-10.1 Conversation berbasis (buyer_id, seller_id, product_id) - unique.
- FR-10.2 Reuse conversation existing untuk kombinasi sama.
- FR-10.3 Pesan teks; Supabase Realtime channel per conversation.
- FR-10.4 Halaman daftar percakapan + halaman detail percakapan.
- FR-10.5 Status pesan: sent (read opsional MVP).

### FR-11 Transaksi
- FR-11.1 Tabel `transactions` (id, product_id, seller_id, buyer_id, status, created_at, completed_at).
- FR-11.2 Penjual mark sold → pilih buyer dari conversation → buat transaction status `completed`.

### FR-12 Rating
- FR-12.1 Tabel `ratings` (id, transaction_id, reviewer_id, reviewed_user_id, product_id, rating, comment, created_at).
- FR-12.2 Rating 1-5 + komentar opsional.
- FR-12.3 Tidak boleh self-rating; hanya untuk transaksi `completed`; satu user satu rating per transaksi.
- FR-12.4 Update rating_average & rating_count di profile.

### FR-13 Report
- FR-13.1 Tabel `reports` (id, reporter_id, reported_user_id?, product_id?, reason, description, status, created_at).
- FR-13.2 Alasan: Barang palsu, Penipuan, Konten tidak pantas, Harga mencurigakan, Spam, Lainnya.
- FR-13.3 Form report di detail produk dan halaman profil user lain.

## 6. Non-Functional Requirements

- **NFR-1 Performa**: Feed harus load < 2 detik di koneksi 4G normal.
- **NFR-2 Privasi lokasi**: Koordinat penjual tidak boleh dikirim ke client publik; hanya jarak yang dihitung.
- **NFR-3 Keamanan**: Semua tabel pakai RLS. Anon key Supabase di env var.
- **NFR-4 Skalabilitas**: Index pada kolom yang sering di-query.
- **NFR-5 Maintainability**: Struktur folder modular; tipe TypeScript ketat; layanan terpisah dari komponen.
- **NFR-6 UX**: Mobile-first, bottom tab navigation, empty/loading/error state di setiap layar list.
- **NFR-7 i18n**: Bahasa default Indonesia. Format Rupiah `Rp1.200.000`.
- **NFR-8 Reliability**: Semua mutasi network punya error handling + toast/snackbar.

## 7. MVP Scope (In)
1. Auth (register/login/logout).
2. Profile + onboarding.
3. Lokasi + radius + jarak.
4. Kategori statis dari DB.
5. Upload produk (foto 1-5, lokasi).
6. Feed berdasarkan lokasi.
7. Search & filter.
8. Detail produk.
9. Favorit.
10. Chat realtime.
11. Mark as sold + transaksi sederhana.
12. Rating pasca transaksi.
13. Report produk/user.
14. Loading/empty/error states.

## 8. Out of Scope (untuk MVP)
- Payment gateway, checkout, voucher, ongkir/ekspedisi.
- Live shopping, affiliate, multi-store dashboard.
- Admin dashboard kompleks (data report cukup masuk DB).
- AI recommendation.
- Push notification kompleks (cukup polling/realtime).
- Image/voice di chat, typing indicator, read-receipt detail.
- Login social (Google/Apple) - dapat ditambahkan nanti.

## 9. Acceptance Criteria (MVP Selesai jika...)
- AC-01 User bisa register & login.
- AC-02 User bisa melengkapi & edit profil.
- AC-03 User bisa memberi izin lokasi & lat/lng tersimpan.
- AC-04 User bisa melihat produk terdekat.
- AC-05 User bisa mengubah radius pencarian.
- AC-06 User bisa upload produk dengan foto.
- AC-07 User bisa search & filter produk.
- AC-08 User bisa membuka detail produk.
- AC-09 User bisa chat dengan penjual (realtime).
- AC-10 User bisa melihat daftar chat.
- AC-11 User bisa menyimpan & melihat favorit.
- AC-12 User bisa melihat profil sendiri & produk yang dijual.
- AC-13 User bisa menandai produk terjual.
- AC-14 User bisa memberi rating setelah transaksi selesai.
- AC-15 User bisa melaporkan produk/user.
- AC-16 Aplikasi tidak menampilkan koordinat presisi penjual.
- AC-17 Aplikasi bisa dijalankan lokal mengikuti README.
