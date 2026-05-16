# JualDekat

Marketplace lokal berbasis lokasi untuk anak kos, mahasiswa, dan warga sekitar kampus. Fokus pada COD tanpa ongkir, barang baru/bekas yang ada di radius beberapa kilometer.

> **Spec lengkap**: [`.kiro/specs/jualdekat-mvp/`](.kiro/specs/jualdekat-mvp/) — `requirements.md`, `design.md`, `tasks.md`.

## 🌐 Live demo

**https://aldiaatid.github.io/jualdekat/**

Tinggal buka — tidak perlu setup apa pun. Tap salah satu **chip akun demo** di layar Login (`rina@demo.com`, `budi@demo.com`, `andi@demo.com`, `dewi@demo.com`, password semua **`demo1234`**).

## Bagaimana ini berjalan tanpa server?

Backend dijalankan **di sisi client**, di browser/perangkat kamu sendiri:

| Bagian | Implementasi |
|---|---|
| Storage data | `AsyncStorage` (web: IndexedDB/localStorage) |
| Auth | mock — credential di-hash sederhana di tabel `_creds` |
| Realtime chat | `BroadcastChannel` (lintas tab di browser yang sama) |
| Foto produk/avatar | base64 data URL embedded di tabel |
| Lokasi | `expo-location` (web: `navigator.geolocation`); ada fallback "Lokasi demo (Beji, Depok)" |
| Seed data | otomatis: 10 kategori + 4 user demo + 10 produk + foto SVG |

Konsekuensi yang harus diketahui:

- Setiap pengunjung punya **dunia datanya sendiri** (data tidak dishare antar perangkat).
- Realtime chat hanya bekerja **antar tab** di browser yang sama (BroadcastChannel).
- Reset data: di DevTools jalankan `localStorage.clear()` lalu reload.

Kalau nanti ingin shared backend, semua service di `src/services/` bisa di-swap dengan adapter ke API beneran tanpa mengubah komponen.

## Tech Stack

- React Native + Expo SDK 51 (TypeScript strict)
- React Navigation v6 (native stack + bottom tabs)
- Zustand (state management)
- Expo Location, Expo Image Picker
- StyleSheet + theme tokens (`src/constants/colors.ts`, `src/constants/spacing.ts`)
- Mock backend (`src/services/mock/`)

## Setup lokal (5 menit)

```bash
git clone https://github.com/AldiaatID/jualdekat
cd jualdekat
npm install
npm run web              # buka di browser
# atau
npm start                # scan QR di Expo Go (mobile)
```

Tidak perlu `.env`, tidak perlu Supabase, tidak perlu apa pun. Buka URL → langsung jalan.

## Struktur folder

```
src/
  app/                  Entry & providers (init mock auth + seed)
  components/
    common/             Button, Input, Avatar, Badge, EmptyState, ...
    product/            ProductCard, ProductGrid, ImageCarousel, ImagePickerGrid
    chat/               MessageBubble, ConversationItem
    profile/            SellerCard
  screens/
    auth/               LoginScreen (with demo accounts), RegisterScreen
    onboarding/         ProfileOnboardingScreen, LocationPermissionScreen
    home/, search/, product/, chat/, profile/, rating/, report/
  navigation/           RootNavigator, AppTabs, types
  services/
    mock/               db, auth, seed, realtime, storage, uuid
    authService, profileService, productService, chatService,
    favoriteService, ratingService, reportService, transactionService,
    locationService, storageService
  hooks/                useAuth, useLocation
  stores/               authStore, locationStore, filterStore
  utils/                distance, formatCurrency, formatDate, validation
  types/                db, domain
  constants/            colors, spacing, categories, radius
.github/workflows/      deploy-web.yml (otomatis deploy ke GitHub Pages)
.kiro/specs/jualdekat-mvp/  requirements.md, design.md, tasks.md
docs/                   manual-test-checklist.md
```

## Fitur MVP

- Auth (register/login/logout), 4 akun demo siap pakai
- Onboarding profil + edit (nama, kota, area, foto, WhatsApp)
- Izin lokasi + radius pencarian (1/3/5/10/20 km), opsi lokasi demo
- Upload produk (1-5 foto, kategori, kondisi, area, lokasi, metode transaksi)
- Feed berbasis lokasi (sort by jarak → terbaru) + filter kategori/kondisi/harga/radius + search
- Detail produk: carousel, info penjual, tombol chat/favorit/laporkan
- Favorit (toggle dari kartu/detail, halaman daftar)
- Chat realtime via BroadcastChannel (anti-duplikat conversation)
- Mark-as-sold + transaksi (pilih buyer dari conversation)
- Rating 1-5 + komentar (auto-update average/count profile)
- Report produk/pengguna dengan alasan baku
- Loading / empty / error state di setiap layar list

## Privasi

- Koordinat presisi penjual tidak ditampilkan; hanya estimasi jarak.
- Data hanya tersimpan di perangkat masing-masing.

## Roadmap (di luar MVP)

- Backend nyata (Postgres + WebSocket) untuk shared data antar device.
- Push notification (Expo Notifications) untuk pesan baru.
- OAuth login (Google).
- Image di chat, typing indicator, read-receipt.
- Admin moderation dashboard.

## Scripts

| Script | Kegunaan |
|---|---|
| `npm run web` | Jalankan versi web |
| `npm start` | Expo dev server (mobile) |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Testing

[`docs/manual-test-checklist.md`](docs/manual-test-checklist.md) — skenario end-to-end lengkap.
