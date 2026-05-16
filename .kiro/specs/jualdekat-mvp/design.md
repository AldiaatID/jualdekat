# JualDekat - Design Document

## 1. Arsitektur Aplikasi

```
+--------------------------------------+
|   Mobile App (React Native + Expo)   |
|  ----------------------------------  |
|  Screens (UI)                        |
|  Components (UI primitives)          |
|  Navigation (React Navigation)       |
|  Hooks (useAuth/useLocation/...)     |
|  Stores (Zustand)                    |
|  Services (Supabase wrappers)        |
+----------------+---------------------+
                 |
                 | HTTPS / WSS
                 v
+--------------------------------------+
|             Supabase                 |
|  ----------------------------------  |
|  Auth (email + password)             |
|  PostgreSQL (RLS enabled)            |
|  Storage (product-images, avatars)   |
|  Realtime (postgres_changes)         |
+--------------------------------------+
```

- Client *thin*: tidak ada server custom. Seluruh logic data mengakses Supabase via SDK.
- Layer `services/*` membungkus akses Supabase agar mudah dimock & ditest.
- Layer `hooks/*` menyatukan state + lifecycle untuk dipakai komponen.
- `stores/*` (Zustand) menyimpan auth session, lokasi user, dan preferensi radius.

## 2. Tech Stack

| Layer | Pilihan | Alasan |
|---|---|---|
| Framework | Expo (managed) + React Native | Cepat dev, mudah dijalankan tanpa native build |
| Bahasa | TypeScript (strict) | Tipe ketat, lebih sedikit bug |
| Navigasi | `@react-navigation/native` + `native-stack` + `bottom-tabs` | Standar, mature |
| State | Zustand | Sederhana, no boilerplate, cocok untuk MVP |
| Async | React Query opsional → MVP cukup `useEffect` + Zustand | Hindari over-engineering |
| Backend | Supabase (Auth, Postgres, Storage, Realtime) | All-in-one |
| Lokasi | `expo-location` | Native API stabil |
| Image picker | `expo-image-picker` | Pilih foto dari galeri/kamera |
| Storage lokal | `@react-native-async-storage/async-storage` | Simpan keyword terakhir, radius, dsb. |
| Styling | **StyleSheet + Theme tokens**. NativeWind opsional, tetapi MVP pilih StyleSheet untuk stabilitas dan menghindari masalah konfigurasi tailwind di Expo SDK terbaru. | Stabil, no extra build step |
| Format Rupiah | `Intl.NumberFormat('id-ID')` | Native |
| Linting | ESLint + Prettier | Konsistensi |

## 3. Struktur Folder

```
src/
  app/                    # Entry & app providers
    App.tsx
    providers.tsx
  components/
    common/               # Button, Input, Avatar, Badge, EmptyState, ...
    product/              # ProductCard, ProductGrid, ProductForm, ImageCarousel
    chat/                 # MessageBubble, ConversationItem
    profile/              # ProfileHeader, RatingStars
  screens/
    auth/                 # LoginScreen, RegisterScreen
    onboarding/           # ProfileOnboardingScreen, LocationPermissionScreen
    home/                 # HomeScreen
    search/               # SearchScreen
    product/              # ProductDetailScreen, ProductCreateScreen, ProductEditScreen
    chat/                 # ChatListScreen, ChatRoomScreen
    profile/              # MyProfileScreen, EditProfileScreen, UserProfileScreen, MyProductsScreen
    rating/               # CreateRatingScreen
    report/               # CreateReportScreen
  navigation/
    RootNavigator.tsx
    AuthStack.tsx
    AppTabs.tsx
    HomeStack.tsx
    ChatStack.tsx
    ProfileStack.tsx
  services/
    supabase.ts
    authService.ts
    profileService.ts
    productService.ts
    chatService.ts
    locationService.ts
    favoriteService.ts
    ratingService.ts
    reportService.ts
    transactionService.ts
    storageService.ts
  hooks/
    useAuth.ts
    useLocation.ts
    useProducts.ts
    useChat.ts
    useFavorites.ts
  stores/
    authStore.ts
    locationStore.ts
    filterStore.ts
  utils/
    distance.ts            # haversine
    formatCurrency.ts
    formatDate.ts          # "2 jam lalu"
    validation.ts
  types/
    db.ts                  # Generated/handwritten Supabase types
    domain.ts              # UI-level types (ProductCardItem, ...)
  constants/
    colors.ts
    spacing.ts
    categories.ts
    radius.ts

supabase/
  schema.sql
  policies.sql
  seed.sql
.env.example
README.md
```

## 4. Database Design

### 4.1 Tabel

```sql
-- profiles  (1:1 dengan auth.users.id)
profiles (
  id uuid PK references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  phone_number text,
  city text,
  area text,
  latitude double precision,
  longitude double precision,
  rating_average numeric(3,2) default 0,
  rating_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)

categories (
  id uuid PK default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  sort_order int default 0,
  created_at timestamptz default now()
)

products (
  id uuid PK default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  category_id uuid not null references categories(id),
  name text not null,
  description text,
  price numeric(14,2) not null check (price >= 0),
  condition text not null check (condition in ('baru','bekas')),
  area text not null,
  latitude double precision not null,
  longitude double precision not null,
  transaction_methods text[] not null default '{COD}',
  status text not null default 'tersedia'
        check (status in ('tersedia','proses','terjual')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)

product_images (
  id uuid PK default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  sort_order int default 0,
  created_at timestamptz default now()
)

favorites (
  id uuid PK default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, product_id)
)

conversations (
  id uuid PK default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  buyer_id uuid not null references profiles(id) on delete cascade,
  seller_id uuid not null references profiles(id) on delete cascade,
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(product_id, buyer_id, seller_id),
  check (buyer_id <> seller_id)
)

messages (
  id uuid PK default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  body text not null check (length(body) > 0),
  status text not null default 'sent' check (status in ('sent','read')),
  created_at timestamptz default now()
)

transactions (
  id uuid PK default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  seller_id uuid not null references profiles(id) on delete cascade,
  buyer_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'completed'
        check (status in ('pending','completed','cancelled')),
  created_at timestamptz default now(),
  completed_at timestamptz,
  check (buyer_id <> seller_id)
)

ratings (
  id uuid PK default gen_random_uuid(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  reviewer_id uuid not null references profiles(id) on delete cascade,
  reviewed_user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  unique(transaction_id, reviewer_id),
  check (reviewer_id <> reviewed_user_id)
)

reports (
  id uuid PK default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  reported_user_id uuid references profiles(id) on delete set null,
  product_id uuid references products(id) on delete set null,
  reason text not null check (reason in (
    'barang_palsu','penipuan','konten_tidak_pantas',
    'harga_mencurigakan','spam','lainnya')),
  description text,
  status text not null default 'pending' check (status in ('pending','reviewed','dismissed')),
  created_at timestamptz default now()
)
```

### 4.2 Index

```sql
create index idx_products_user_id     on products(user_id);
create index idx_products_category_id on products(category_id);
create index idx_products_status      on products(status);
create index idx_products_created_at  on products(created_at desc);
create index idx_favorites_user_id    on favorites(user_id);
create index idx_conv_buyer           on conversations(buyer_id);
create index idx_conv_seller          on conversations(seller_id);
create index idx_conv_product         on conversations(product_id);
create index idx_msg_conv             on messages(conversation_id, created_at);
create index idx_ratings_reviewed     on ratings(reviewed_user_id);
```

### 4.3 Trigger
- `update_profile_rating()` — setelah insert/update/delete di `ratings`, recompute `rating_average` & `rating_count` untuk `reviewed_user_id`.
- `set_updated_at()` — trigger generic untuk kolom `updated_at` di `profiles` & `products`.

### 4.4 Pertimbangan PostGIS
Untuk MVP **tidak menggunakan PostGIS**. Pencarian by-radius dilakukan dengan:
1. *Coarse filter* di SQL (bounding box berdasarkan latitude ± Δlat, longitude ± Δlng).
2. *Fine filter* Haversine di client.

Alasan: setup lebih sederhana, jumlah produk MVP masih kecil. Bisa di-upgrade ke PostGIS atau RPC `nearby_products` di iterasi berikutnya.

## 5. RLS Policies (rencana)

`profiles`
- SELECT: semua user terautentikasi (`auth.uid() is not null`).
- INSERT: hanya saat onboarding, `id = auth.uid()`.
- UPDATE: hanya pemilik (`id = auth.uid()`).
- DELETE: dilarang dari client.

`categories`
- SELECT: publik.
- INSERT/UPDATE/DELETE: dilarang dari client (admin via service role).

`products`
- SELECT: semua user terautentikasi.
- INSERT: `user_id = auth.uid()`.
- UPDATE/DELETE: hanya pemilik.

`product_images`
- SELECT: semua terautentikasi.
- INSERT/UPDATE/DELETE: hanya pemilik produk (cek via subquery).

`favorites`
- SELECT/INSERT/DELETE: hanya pemilik (`user_id = auth.uid()`).

`conversations`
- SELECT: hanya peserta (buyer atau seller).
- INSERT: buyer (`buyer_id = auth.uid()`) untuk produk yang seller-nya bukan dirinya.
- UPDATE: hanya peserta (untuk update `last_message_at`).

`messages`
- SELECT: hanya peserta conversation.
- INSERT: `sender_id = auth.uid()` dan harus peserta conversation.

`transactions`
- SELECT: hanya peserta.
- INSERT: `seller_id = auth.uid()` (penjual yang menandai terjual).
- UPDATE: hanya peserta (untuk kasus cancelled).

`ratings`
- SELECT: publik (untuk menampilkan rating user).
- INSERT: `reviewer_id = auth.uid()` dan reviewer adalah peserta dari transaction; transaction status `completed`; tidak self-rating; unique per (transaction, reviewer).

`reports`
- SELECT: hanya reporter.
- INSERT: `reporter_id = auth.uid()`.

## 6. Storage

Bucket:
- `product-images` — public read, authenticated write.
- `avatars` — public read, authenticated write.

Path convention:
- `product-images/{user_id}/{product_id}/{uuid}.{ext}`
- `avatars/{user_id}/{uuid}.{ext}`

Validasi client:
- Tipe: jpg/jpeg/png/webp.
- Maks 5 MB per file.

Storage policies:
- Upload: user hanya bisa upload ke folder dengan prefix `auth.uid()`.
- Read: public.
- Delete: hanya owner.

## 7. Navigation Flow

```
RootNavigator
├── (unauth) AuthStack
│     ├── LoginScreen
│     └── RegisterScreen
├── (auth, profile incomplete) OnboardingStack
│     ├── ProfileOnboardingScreen
│     └── LocationPermissionScreen
└── (auth, profile complete) AppTabs
      ├── HomeTab → HomeStack
      │     ├── HomeScreen
      │     ├── ProductDetailScreen
      │     ├── UserProfileScreen
      │     └── CreateReportScreen
      ├── SearchTab → SearchScreen
      ├── SellTab → ProductCreateScreen / ProductEditScreen
      ├── ChatTab → ChatStack
      │     ├── ChatListScreen
      │     └── ChatRoomScreen
      └── ProfileTab → ProfileStack
            ├── MyProfileScreen
            ├── EditProfileScreen
            ├── MyProductsScreen
            ├── FavoritesScreen
            └── CreateRatingScreen
```

Logic gating:
1. Belum auth → AuthStack.
2. Auth tetapi `profiles` belum ada / belum lengkap (no `full_name` / no `city` / no lat-lng) → Onboarding.
3. Sudah lengkap → AppTabs.

## 8. Screen List & Komponen Utama

| Screen | Komponen |
|---|---|
| LoginScreen | Input, Button, ErrorText |
| RegisterScreen | Input, Button |
| ProfileOnboardingScreen | AvatarPicker, Input, Button |
| LocationPermissionScreen | Illustration, Button (request perm), helper text |
| HomeScreen | SearchBar, RadiusChips, FilterChips, ProductGrid, EmptyState |
| SearchScreen | SearchBar, FilterSheet, ProductGrid |
| ProductDetailScreen | ImageCarousel, PriceTag, SellerCard, ActionButtons, SafetyNote |
| ProductCreateScreen | ImagePickerGrid, Input, NumericInput, CategoryPicker, ConditionToggle, MapPickerLite |
| ProductEditScreen | (reuse ProductForm) |
| ChatListScreen | ConversationItem |
| ChatRoomScreen | MessageBubble, MessageComposer |
| MyProfileScreen | ProfileHeader, TabsView (jualan / terjual / rating) |
| EditProfileScreen | AvatarPicker, Input |
| UserProfileScreen | ProfileHeader, ProductGrid, ReportButton |
| FavoritesScreen | ProductGrid |
| MyProductsScreen | ProductGrid + status filter |
| CreateRatingScreen | StarPicker, Input |
| CreateReportScreen | ReasonPicker, Input |

Komponen common:
- `Button`, `Input`, `TextArea`, `Chip`, `Badge`, `Avatar`, `RatingStars`
- `EmptyState`, `LoadingView`, `ErrorView`, `Skeleton`
- `ProductCard`, `ProductGrid`, `ImageCarousel`
- `BottomSheet` (gunakan `@gorhom/bottom-sheet` opsional, atau modal RN sederhana)

## 9. State Management Plan

**Zustand stores**:
- `authStore`: `session`, `user`, `profile`, `setSession`, `signOut`, `refreshProfile`.
- `locationStore`: `coords`, `permissionStatus`, `radiusKm` (default 5), `setCoords`, `setRadius`.
- `filterStore`: filter aktif untuk Home/Search (kategori, harga, kondisi, keyword) - persist di AsyncStorage untuk keyword terakhir.

State turunan (mis. produk feed) tidak disimpan global — di-fetch lewat hook `useProducts({ radius, filters, coords })`.

## 10. Location & Privacy Design

- Saat user login pertama kali / membuka Home, request `Location.requestForegroundPermissionsAsync()`.
- Jika granted, ambil `getCurrentPositionAsync({ accuracy: Balanced })`, simpan ke `profiles` (UPDATE). Cache di `locationStore`.
- Jika denied, tampilkan layar fallback dengan instruksi & tombol "Coba lagi"; user tetap bisa browse dengan radius global tetapi feed by-distance tidak aktif.

**Privasi**:
- View di tabel produk yang dipakai client (mis. `products_public` view) **tidak meng-expose** lat/lng pemilik secara publik. Tetapi karena MVP butuh lat/lng untuk distance calc client-side, kita pilih pendekatan:
  - Pendekatan terpilih: **distance dihitung di client** dari lat/lng produk dan user. Untuk privasi, lat/lng yang dikirim ke client adalah lat/lng *barang* yang sudah dimasukkan penjual (penjual diminta memilih lokasi area barang, bukan rumah). Tetap tampilkan area teks, jangan render peta detail.
  - UI: tidak ada layar yang menampilkan koordinat numerik. Tidak ada peta dengan pin tepat di rumah.
  - Catatan: penjual diberi tip "gunakan titik area umum" saat upload.
- Iterasi berikutnya: pindah perhitungan ke RPC server-side dan kembalikan hanya `distance_km`.

Helper Haversine:
```ts
export function haversineKm(a: LatLng, b: LatLng): number { /* ... */ }
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m dari kamu`;
  return `${km.toFixed(1)} km dari kamu`;
}
```

## 11. Chat Realtime Design

- Saat user buka `ChatRoomScreen`, fetch existing messages (`order by created_at asc`) → subscribe Supabase Realtime channel:
  ```ts
  supabase
    .channel(`messages:${conversationId}`)
    .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages',
          filter: `conversation_id=eq.${conversationId}` },
        handleNewMessage)
    .subscribe();
  ```
- Saat user kirim pesan: `insert into messages` + UPDATE `conversations.last_message_at`.
- `ChatListScreen` subscribe ke `conversations` user untuk update list.
- Memulai chat dari detail produk: gunakan `upsert` dengan `on_conflict (product_id, buyer_id, seller_id)` agar tidak duplikat (atau SELECT-then-INSERT).

## 12. Error Handling Strategy

- Semua service mengembalikan `{ data, error }` (sesuai pola Supabase) dan diterjemahkan ke pesan user-friendly via util `mapError(error)` (mis. "Email sudah terdaftar", "Tidak ada koneksi").
- Komponen list selalu memiliki tiga state: `loading | empty | error` selain `success`.
- Form: validasi via util `validation.ts`; tampilkan error inline di bawah field.
- Toast/snackbar global untuk error mutasi (gunakan komponen `Snackbar` sederhana).

## 13. Security Considerations

- Anon key & URL Supabase di `.env` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
- Tidak ada service-role key di client.
- Semua tabel RLS `enable` + policies eksplisit.
- Validasi server-side (CHECK constraints) selain validasi client.
- Pesan keamanan COD ditampilkan di detail & chat ("Untuk keamanan, lakukan COD di tempat umum.").
- Foto user tidak boleh di-share antar user (path foto produk tidak mengandung info sensitif).
- Tidak ada PII real di seed data.

## 14. Dependency List (utama)

- `expo`
- `expo-location`
- `expo-image-picker`
- `expo-constants`
- `@supabase/supabase-js`
- `@react-native-async-storage/async-storage`
- `react-native-url-polyfill` (Supabase requirement di RN)
- `@react-navigation/native`
- `@react-navigation/native-stack`
- `@react-navigation/bottom-tabs`
- `react-native-screens`, `react-native-safe-area-context`, `react-native-gesture-handler`, `react-native-reanimated`
- `zustand`
- `react-native-svg` (icons)
- `@expo/vector-icons` (built-in)
