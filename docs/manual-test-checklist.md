# JualDekat — Checklist Test Manual

## Akun demo (siap pakai)
| Email | Password | Lokasi |
|---|---|---|
| `rina@demo.com`  | `demo1234` | Beji, Depok |
| `budi@demo.com`  | `demo1234` | Kemiri Muka, Depok |
| `andi@demo.com`  | `demo1234` | Pondok Cina, Depok |
| `dewi@demo.com`  | `demo1234` | Kemanggisan, Jakbar |

Atau klik chip akun demo di layar Login.

## Skenario

### 1. Login akun demo
- [ ] Login dengan Rina → langsung masuk ke layar permission lokasi.

### 2. Lokasi
- [ ] Tap "Izinkan akses lokasi" → browser meminta izin → diberi → masuk Home.
- [ ] Atau tap "Gunakan lokasi demo (Beji, Depok)" → langsung masuk Home tanpa izin GPS.

### 3. Home — feed berbasis lokasi
- [ ] Daftar produk muncul (8-10 produk seed).
- [ ] Estimasi jarak tampil ("800 m dari kamu" / "1.2 km dari kamu").
- [ ] Ubah radius (chip 1/3/5/10/20) → daftar berubah.
- [ ] Filter kategori (chip) → daftar terfilter.

### 4. Detail produk
- [ ] Tap kartu → carousel + info penjual + tombol Chat / Favorit / Lapor.
- [ ] Status `tersedia` aktif; jika owner → tombol Edit/Hapus/Tandai Terjual.

### 5. Favorit
- [ ] Tap heart pada kartu/detail → muncul di tab Favorit.
- [ ] Tap heart lagi → hilang.

### 6. Search
- [ ] Cari "rice" → produk Rice Cooker muncul.
- [ ] Buka Filter → set harga 50000–200000 → daftar terfilter.
- [ ] Reload tab → keyword terakhir auto-terisi.

### 7. Upload produk
- [ ] Tab Jual → isi nama, deskripsi, harga, kategori, kondisi, area, foto (≥1).
- [ ] Submit → produk muncul di Home & profil.

### 8. Chat realtime (di **2 tab browser yang sama**)
- [ ] Tab A: login Rina. Tab B: login Budi. Buka detail produk Rina → Chat → kirim pesan dari Budi.
- [ ] Tab A: pesan masuk realtime tanpa refresh.

### 9. Mark as sold + transaksi
- [ ] Login sebagai pemilik produk → detail → Tandai Terjual → pilih buyer → konfirmasi.
- [ ] Produk pindah ke tab Terjual; transaksi tercatat di tab Saya → Transaksi.

### 10. Rating
- [ ] Setelah transaksi completed → muncul tombol "Beri rating ke pembeli/penjual".
- [ ] Beri 5 bintang + komentar → rating tersimpan, average user terupdate.
- [ ] Coba beri rating lagi untuk transaksi sama → ditolak.

### 11. Report
- [ ] Tap "Laporkan produk" / "Laporkan pengguna" → pilih alasan + deskripsi → submit.

### 12. Logout
- [ ] Tab Saya → Keluar → kembali ke layar Login.

## Catatan

- Data tersimpan **di browser kamu** (AsyncStorage / IndexedDB). Buka di browser/komputer lain → datamu sendiri.
- Reset data: dev console → `localStorage.clear()` lalu reload.
- Realtime chat hanya antar tab di browser yang sama (BroadcastChannel).
