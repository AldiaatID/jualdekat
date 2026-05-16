# JualDekat

Aplikasi marketplace lokal berbasis lokasi untuk jual-beli barang baru dan bekas yang dekat dari pengguna. Fokus pada anak kos, mahasiswa, dan warga sekitar kampus yang ingin transaksi COD tanpa ongkir.

> **Spec lengkap**: lihat folder [`.kiro/specs/jualdekat-mvp/`](.kiro/specs/jualdekat-mvp/) — `requirements.md`, `design.md`, `tasks.md`.

## Demo Web

Setelah workflow CI berhasil, demo akan tersedia di:
**https://aldiaatid.github.io/jualdekat/**

Tanpa konfigurasi Supabase, halaman akan berjalan dalam **mode demo** (login & data tidak akan jalan, tapi aplikasi tidak crash).

## Tech Stack

- React Native + Expo (SDK 51, TypeScript strict)
- Supabase (Auth, Postgres, Storage, Realtime)
- React Navigation v6 (native stack + bottom tabs)
- Zustand (state management)
- Expo Location, Expo Image Picker
- StyleSheet + theme tokens (`src/constants/colors.ts`, `src/constants/spacing.ts`)

## Setup Cepat

### 1. Clone & install

```bash
git clone https://github.com/AldiaatID/jualdekat
cd jualdekat
npm install
```

### 2. Buat project Supabase

1. Buka [supabase.com](https://supabase.com), buat project baru.
2. Catat `Project URL` dan `anon` key dari **Project Settings → API**.

### 3. Buat tabel & RLS

Buka **SQL Editor** di dashboard Supabase, jalankan berurutan:

```sql
-- 1) supabase/schema.sql       (tabel, index, trigger, realtime publication)
-- 2) supabase/policies.sql     (RLS + storage policies)
-- 3) supabase/seed.sql         (10 kategori awal)
```

### 4. Buat Storage buckets

Di **Storage**:
- Buat bucket `product-images` (public ON).
- Buat bucket `avatars` (public ON).

Storage policies sudah dibuat oleh `policies.sql`.

### 5. Konfigurasi `.env`

```bash
cp .env.example .env
```

Isi:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 6. Jalankan

```bash
npm start              # Expo dev server, scan QR di Expo Go
npm run web            # versi web (browser)
npm run android        # emulator/device Android
npm run ios            # simulator iOS (Mac)
```

## Struktur Folder

```
src/
  app/                  Entry & providers
  components/
    common/             Button, Input, Avatar, Badge, EmptyState, ...
    product/            ProductCard, ProductGrid, ImageCarousel, ImagePickerGrid
    chat/               MessageBubble, ConversationItem
    profile/            SellerCard
  screens/
    auth/               LoginScreen, RegisterScreen
    onboarding/         ProfileOnboardingScreen, LocationPermissionScreen
    home/               HomeScreen
    search/             SearchScreen
    product/            ProductCreateScreen, ProductDetailScreen, MarkAsSoldScreen
    chat/               ChatListScreen, ChatRoomScreen
    profile/            MyProfileScreen, EditProfileScreen, UserProfileScreen, FavoritesScreen
    rating/             CreateRatingScreen
    report/             CreateReportScreen
  navigation/           RootNavigator, AppTabs, types
  services/             supabase, auth, profile, product, chat, location, favorite,
                        rating, report, transaction, storage
  hooks/                useAuth, useLocation
  stores/               authStore, locationStore, filterStore (Zustand)
  utils/                distance, formatCurrency, formatDate, validation
  types/                db, domain
  constants/            colors, spacing, categories, radius
supabase/               schema.sql, policies.sql, seed.sql
.github/workflows/      deploy-web.yml (GitHub Pages CI)
.kiro/specs/jualdekat-mvp/  requirements.md, design.md, tasks.md
docs/                   manual-test-checklist.md
```

## Fitur MVP

- Auth (register/login/logout) via Supabase Auth.
- Onboarding profil (nama, kota, area, foto, WhatsApp).
- Izin lokasi + radius pencarian (1/3/5/10/20 km).
- Upload produk (1-5 foto, kategori, kondisi, area, lokasi, metode transaksi).
- Feed berbasis lokasi (sort by jarak → terbaru) + filter (kategori, kondisi, harga, radius) + search.
- Detail produk dengan carousel, info penjual, rating, tombol chat/favorit/laporkan.
- Favorit (toggle dari kartu/detail, halaman daftar).
- Chat realtime (Supabase Realtime channel per conversation), anti-duplikat conversation.
- Mark-as-sold + transaksi sederhana (penjual pilih buyer dari conversation).
- Rating 1-5 + komentar (auto-update `rating_average`/`rating_count` via trigger).
- Report produk/pengguna dengan alasan baku.
- Loading / empty / error state di setiap layar list.

## Privasi & Keamanan

- Koordinat presisi penjual **tidak ditampilkan** di UI; hanya estimasi jarak.
- Penjual diingatkan untuk memakai titik area umum saat upload, bukan rumah.
- Catatan keamanan COD muncul di detail produk dan ruang chat.
- RLS aktif di semua tabel; kebijakan ditulis eksplisit per operasi.
- Anon key di `.env` (publik by design, dilindungi RLS); tidak ada service-role key di client.

## Batasan MVP

Belum termasuk: payment gateway, checkout, ongkir/ekspedisi, voucher, live shopping, affiliate, multi-store dashboard, admin panel kompleks, AI recommendation, push notification kompleks, gambar/voice di chat, typing indicator, read-receipt detail.

## Rencana Pengembangan Berikutnya

- RPC server-side untuk distance (PostGIS / `nearby_products` function).
- Push notification (Expo Notifications) untuk pesan baru.
- Read receipt & typing indicator chat.
- OAuth login (Google).
- Admin moderation dashboard.
- Image di chat.

## Testing

Lihat [`docs/manual-test-checklist.md`](docs/manual-test-checklist.md) untuk skenario end-to-end.

## Scripts

| Script | Kegunaan |
|---|---|
| `npm start` | Expo dev server |
| `npm run web` | Jalankan versi web |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
