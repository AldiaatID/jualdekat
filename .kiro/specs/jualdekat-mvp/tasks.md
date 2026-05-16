# JualDekat - Implementation Tasks

> Eksekusi task secara berurutan. Selesaikan satu task hingga acceptance criteria-nya tercapai sebelum lanjut ke task berikutnya. Setiap task ditulis dengan format: **Tujuan**, **File**, **Langkah**, **Cara test**, **Acceptance criteria**.

---

## Task 1 — Setup project Expo TypeScript
- **Tujuan**: Inisialisasi project Expo + TypeScript dengan struktur folder modular.
- **File**:
  - `package.json`, `tsconfig.json`, `app.json`, `babel.config.js`
  - `index.ts`, `src/app/App.tsx`, `src/app/providers.tsx`
  - `src/constants/colors.ts`, `src/constants/spacing.ts`
  - `.gitignore`, `.eslintrc.cjs`, `.prettierrc`
- **Langkah**:
  1. Inisialisasi Expo (`expo` template TS) dengan struktur `src/`.
  2. Buat root `App.tsx` yang load `providers.tsx` (Safe area, navigation container, future stores).
  3. Tambah ESLint + Prettier dasar.
  4. Setup theme constants (warna primary hijau/biru, spacing tokens).
  5. Verifikasi `npx expo start` menampilkan layar hello.
- **Cara test**: jalankan `npx expo start`, app tampil tanpa error di Expo Go / web.
- **Acceptance**: aplikasi compile, menampilkan "JualDekat" di layar awal, tidak ada warning TS.

---

## Task 2 — Setup Supabase client & environment variables
- **Tujuan**: Koneksi Supabase tersedia di seluruh app.
- **File**:
  - `.env.example`
  - `src/services/supabase.ts`
  - `src/types/db.ts` (tipe baseline)
- **Langkah**:
  1. Tambah deps: `@supabase/supabase-js`, `react-native-url-polyfill`, `@react-native-async-storage/async-storage`.
  2. Buat `supabase.ts` membaca `process.env.EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_ANON_KEY`, dengan storage adapter AsyncStorage.
  3. Tambah `.env.example` dengan kedua variabel.
  4. Update `app.json` jika perlu (tidak ada secret di sini).
- **Cara test**: Panggil `supabase.auth.getSession()` di App.tsx, log hasilnya tanpa crash.
- **Acceptance**: client Supabase singleton berfungsi tanpa hardcoded credentials.

---

## Task 3 — Database schema SQL
- **Tujuan**: Membuat seluruh schema, index, dan trigger sesuai design.md.
- **File**:
  - `supabase/schema.sql`
  - `supabase/policies.sql`
- **Langkah**:
  1. Tulis DDL semua tabel: profiles, categories, products, product_images, favorites, conversations, messages, transactions, ratings, reports.
  2. Tambahkan check constraint, foreign key, unique.
  3. Buat semua index sesuai design.
  4. Tambah trigger `set_updated_at` dan `update_profile_rating`.
  5. Aktifkan RLS dan tulis kebijakan di `policies.sql`.
  6. Buat storage policies untuk bucket `product-images` & `avatars`.
- **Cara test**: Jalankan SQL di Supabase SQL editor, pastikan tanpa error; tabel terlihat di Table Editor.
- **Acceptance**: Schema dan policies berhasil dieksekusi; RLS aktif di semua tabel.

---

## Task 4 — Seed kategori (& dummy produk opsional)
- **Tujuan**: Data awal kategori siap dipakai feed.
- **File**:
  - `supabase/seed.sql`
- **Langkah**:
  1. Insert 10 kategori (Elektronik, Fashion, Buku, Perabot, Kendaraan, Alat Rumah Tangga, Hobi & Olahraga, Perlengkapan Bayi, Kos & Kontrakan, Lainnya) dengan slug.
  2. (Opsional) Sertakan blok komentar untuk insert produk dummy ("Meja belajar bekas", "Kipas angin", "Rice cooker", "Buku kuliah", "Sepeda bekas", "Jaket preloved", "Rak sepatu", "Speaker bluetooth") yang bisa di-uncomment dengan UUID seller existing.
- **Cara test**: Run di SQL editor → `select * from categories order by sort_order;` mengembalikan 10 baris.
- **Acceptance**: 10 kategori tersedia.

---

## Task 5 — Auth flow (register/login/logout) + RootNavigator gating
- **Tujuan**: User dapat register & login. Aplikasi mengarahkan ke stack sesuai status.
- **File**:
  - `src/services/authService.ts`
  - `src/stores/authStore.ts`
  - `src/screens/auth/LoginScreen.tsx`, `RegisterScreen.tsx`
  - `src/navigation/RootNavigator.tsx`, `AuthStack.tsx`
  - `src/hooks/useAuth.ts`
  - `src/utils/validation.ts`
- **Langkah**:
  1. Buat `authStore` (Zustand) dengan session/profile dan listener `onAuthStateChange`.
  2. `authService.signUp/signIn/signOut/getSession`.
  3. Form login/register dengan validasi (email, password ≥ 6 char).
  4. RootNavigator memilih AuthStack vs OnboardingStack vs AppTabs berdasar `session` & `profile`.
  5. AppTabs sementara berisi 1 tab placeholder.
- **Cara test**: register akun baru → diarahkan ke onboarding (Task 6); login/logout berfungsi.
- **Acceptance**: register, login, logout berfungsi; gating navigasi sesuai.

---

## Task 6 — Profile onboarding & edit profile
- **Tujuan**: User melengkapi profil (nama, kota, area, foto, WA) lalu bisa edit.
- **File**:
  - `src/services/profileService.ts`, `storageService.ts`
  - `src/screens/onboarding/ProfileOnboardingScreen.tsx`
  - `src/screens/profile/EditProfileScreen.tsx`, `MyProfileScreen.tsx`
  - `src/components/profile/ProfileHeader.tsx`
  - `src/components/common/AvatarPicker.tsx`
- **Langkah**:
  1. `profileService` CRUD (`getMyProfile`, `upsertMyProfile`).
  2. `AvatarPicker` pakai `expo-image-picker`, upload ke bucket `avatars` via `storageService.uploadAvatar`.
  3. Onboarding: validasi nama wajib, kota wajib, area wajib.
  4. Setelah save, refresh `authStore.profile` → RootNavigator pindah ke AppTabs.
  5. MyProfileScreen menampilkan info dasar + tombol Edit.
- **Cara test**: register baru → isi profil → masuk Home; buka Profile → Edit → simpan → data ter-update.
- **Acceptance**: profile tersimpan di DB; navigasi pindah ke AppTabs setelah lengkap; edit berhasil.

---

## Task 7 — Location permission & distance helper
- **Tujuan**: Aplikasi minta izin lokasi, simpan ke profile, sediakan helper jarak.
- **File**:
  - `src/services/locationService.ts`
  - `src/stores/locationStore.ts`
  - `src/hooks/useLocation.ts`
  - `src/utils/distance.ts`
  - `src/screens/onboarding/LocationPermissionScreen.tsx`
  - `src/constants/radius.ts`
- **Langkah**:
  1. Tambah deps `expo-location`.
  2. `locationService.requestPermissionAndGetCoords()`.
  3. `useLocation` mengelola: permission status, coords, refresh.
  4. Update `profiles.latitude/longitude` saat coords tersedia.
  5. `distance.ts` haversine + `formatDistance(km)`.
  6. `radius.ts` ekspor `[1, 3, 5, 10, 20]` km, default 5.
  7. Onboarding: jika user belum set lokasi, route ke LocationPermissionScreen sebelum Home.
- **Cara test**: ijinkan lokasi → coords tersimpan; deny → fallback screen muncul; jarak dummy dihitung benar.
- **Acceptance**: lat/lng tersimpan; helper jarak teruji manual; UI tidak menampilkan koordinat mentah.

---

## Task 8 — Upload produk (form, foto, lokasi)
- **Tujuan**: User dapat menambah produk lengkap dengan foto.
- **File**:
  - `src/services/productService.ts`, `storageService.ts`
  - `src/screens/product/ProductCreateScreen.tsx`
  - `src/components/product/ProductForm.tsx`
  - `src/components/product/ImagePickerGrid.tsx`
  - `src/components/common/CategoryPicker.tsx`, `ConditionToggle.tsx`
- **Langkah**:
  1. `productService.createProduct(payload)` insert ke `products` lalu `product_images`.
  2. `storageService.uploadProductImage(file, productId)` ke bucket `product-images`.
  3. Form: nama, deskripsi, harga (numeric, formatted Rp saat tampil), kategori (fetch dari `categories`), kondisi, area, metode transaksi (multi-select), foto (1-5).
  4. Lokasi default = lokasi user; ada catatan "Gunakan titik area umum, bukan rumah Anda".
  5. Validasi sesuai requirements.
  6. Sukses → balik ke Home / MyProducts.
- **Cara test**: upload produk dengan 2 foto, harga 50.000, kategori Buku → tampil di Home (jika dalam radius).
- **Acceptance**: produk + foto tersimpan; validasi berfungsi; pesan error jelas saat gagal.

---

## Task 9 — Product feed berbasis lokasi
- **Tujuan**: HomeScreen menampilkan produk terdekat dengan radius pilihan.
- **File**:
  - `src/screens/home/HomeScreen.tsx`
  - `src/components/product/ProductGrid.tsx`, `ProductCard.tsx`
  - `src/components/common/RadiusChips.tsx`, `EmptyState.tsx`, `Skeleton.tsx`
  - `src/hooks/useProducts.ts`
  - `src/utils/formatDate.ts`, `formatCurrency.ts`
- **Langkah**:
  1. `useProducts({ coords, radiusKm, filters })` — query Supabase dengan bounding box (delta lat/lng dari radius), kemudian filter Haversine di client; sort by jarak asc, lalu created_at desc.
  2. ProductCard menampilkan foto utama, nama, harga (Rp...), badge kondisi, area, jarak, "x jam lalu".
  3. RadiusChips di header (1/3/5/10/20).
  4. Empty state: "Belum ada barang di sekitarmu. Coba perluas radius pencarian." + tombol naikkan radius.
  5. Skeleton saat loading; ErrorView saat gagal.
- **Cara test**: dengan 2-3 produk seed di sekitar lokasi, ubah radius → list berubah; jika radius 1 km dan tidak ada produk, empty state muncul.
- **Acceptance**: feed urut by jarak, jarak tampil benar, empty/loading/error state ada.

---

## Task 10 — Filter & search
- **Tujuan**: Halaman search dengan filter lengkap; filter chips di Home.
- **File**:
  - `src/screens/search/SearchScreen.tsx`
  - `src/components/common/FilterSheet.tsx`, `Chip.tsx`
  - `src/stores/filterStore.ts`
- **Langkah**:
  1. SearchScreen: input keyword (debounced), filter button → BottomSheet (kategori, harga min/max, kondisi, radius).
  2. Query: `ilike` pada `name` dan `description`; gabungkan filter.
  3. Persist keyword terakhir via AsyncStorage.
  4. Home: tambah filter chips (kategori populer, kondisi).
- **Cara test**: cari "rice", filter kategori Elektronik, harga 50000-200000 → hasil sesuai.
- **Acceptance**: filter & search berfungsi; default status `tersedia`; keyword terakhir muncul saat reopen.

---

## Task 11 — Detail produk
- **Tujuan**: Halaman detail dengan seluruh info & aksi.
- **File**:
  - `src/screens/product/ProductDetailScreen.tsx`
  - `src/components/product/ImageCarousel.tsx`
  - `src/components/profile/SellerCard.tsx`, `RatingStars.tsx`
  - `src/components/common/Badge.tsx`, `SafetyNote.tsx`
- **Langkah**:
  1. Fetch product + images + seller profile.
  2. Render carousel, info, status badge.
  3. Jika owner → tombol Edit, Hapus, Tandai Terjual; jika tidak → Chat, Favorit, Report.
  4. Jika `status = terjual` → badge Terjual, disable chat baru, tampilkan warning.
  5. Catatan keamanan COD selalu tampil.
- **Cara test**: buka produk milik sendiri vs milik orang lain → aksi tampil sesuai; produk terjual menampilkan badge.
- **Acceptance**: semua field tampil; aksi sesuai role; tidak ada koordinat mentah.

---

## Task 12 — Favorit
- **Tujuan**: Toggle favorit + halaman favorit.
- **File**:
  - `src/services/favoriteService.ts`
  - `src/hooks/useFavorites.ts`
  - `src/screens/profile/FavoritesScreen.tsx`
- **Langkah**:
  1. `addFavorite/removeFavorite/listFavorites/isFavorite`.
  2. Tombol heart di ProductCard & ProductDetail dengan optimistic update.
  3. FavoritesScreen pakai ProductGrid; produk terjual tetap muncul dengan badge.
- **Cara test**: tap heart pada beberapa produk → muncul di Favorit; tap lagi → hilang.
- **Acceptance**: data tersimpan di DB; UI sinkron.

---

## Task 13 — Chat conversation (init & list)
- **Tujuan**: Buat/akses conversation tanpa duplikat & tampilkan list chat user.
- **File**:
  - `src/services/chatService.ts`
  - `src/screens/chat/ChatListScreen.tsx`
  - `src/components/chat/ConversationItem.tsx`
  - `src/navigation/ChatStack.tsx`
- **Langkah**:
  1. `chatService.getOrCreateConversation(productId, sellerId)`: cek existing → insert jika belum (handle unique).
  2. `listMyConversations()` join product, peer profile, last message preview.
  3. Tombol Chat di ProductDetail → buka ChatRoomScreen.
  4. ChatListScreen tampil semua conversation user, urut last_message_at desc.
- **Cara test**: dari produk milik user lain klik Chat → conversation muncul di ChatList; klik Chat lagi → tidak duplikat.
- **Acceptance**: tidak ada duplicate conversation; list akurat.

---

## Task 14 — Realtime messages
- **Tujuan**: ChatRoom menerima pesan realtime.
- **File**:
  - `src/screens/chat/ChatRoomScreen.tsx`
  - `src/components/chat/MessageBubble.tsx`, `MessageComposer.tsx`
  - `src/hooks/useChat.ts`
- **Langkah**:
  1. `useChat(conversationId)`: fetch history + subscribe channel `messages:<id>` filter by `conversation_id`.
  2. Kirim pesan: insert message + update `conversations.last_message_at`.
  3. Auto-scroll ke bawah saat pesan baru; tampilkan timestamp.
- **Cara test**: di dua device/akun → pesan masuk realtime tanpa refresh.
- **Acceptance**: pesan tampil realtime; kirim sukses; UI clean.

---

## Task 15 — Profile page (info, jualan, terjual, rating)
- **Tujuan**: Halaman profil sendiri dan profil user lain.
- **File**:
  - `src/screens/profile/MyProfileScreen.tsx`, `UserProfileScreen.tsx`
  - `src/components/profile/ProfileTabs.tsx`
  - `src/services/ratingService.ts` (read-only di task ini)
- **Langkah**:
  1. ProfileHeader: foto, nama, kota/area, rating average + count, tombol Edit (jika sendiri) / Report (jika orang lain).
  2. Tabs: "Dijual" (status tersedia/proses), "Terjual" (status terjual), "Rating" (list rating yang user terima).
- **Cara test**: cek tampilan profil sendiri & profil user lain dari ProductDetail (tap nama penjual).
- **Acceptance**: data lengkap, tab berfungsi.

---

## Task 16 — My products page
- **Tujuan**: Daftar produk milik user dengan aksi.
- **File**:
  - `src/screens/profile/MyProductsScreen.tsx`
- **Langkah**:
  1. List produk user (filter by status di chip).
  2. Tap produk → ProductDetail (sebagai owner).
  3. Tombol cepat: Edit, Hapus.
- **Cara test**: hapus produk → hilang dari list.
- **Acceptance**: CRUD tampak konsisten.

---

## Task 17 — Mark as sold + pilih buyer + transaksi
- **Tujuan**: Penjual menandai produk terjual dan memilih buyer dari conversations.
- **File**:
  - `src/services/transactionService.ts`
  - `src/screens/product/MarkAsSoldScreen.tsx`
- **Langkah**:
  1. `transactionService.completeSale(productId, buyerId)` — insert transactions (status completed, completed_at = now), update products.status = `terjual`.
  2. UI: dari ProductDetail (owner) tombol Tandai Terjual → screen pilih buyer (dari conversations produk tsb) → konfirmasi.
  3. Update store + UI menampilkan badge Terjual.
- **Cara test**: produk dengan beberapa chat → mark sold pilih buyer → muncul di Profile > Terjual; transaksi tercatat.
- **Acceptance**: transaksi tersimpan, status produk terupdate.

---

## Task 18 — (Telah digabung di Task 17) Transaksi sederhana
> Catatan: implementasi transaksi dilakukan di Task 17. Task ini mencakup penyempurnaan: tampilkan riwayat transaksi pengguna (sebagai buyer & seller) di halaman profile.
- **File**:
  - `src/screens/profile/MyTransactionsSection.tsx` (mini section di MyProfileScreen)
- **Langkah**:
  1. Query transactions where `buyer_id = uid` OR `seller_id = uid`.
  2. Tampilkan list ringkas: nama produk, peran (Penjual/Pembeli), tanggal, status.
- **Cara test**: setelah Task 17 dijalankan, transaksi muncul.
- **Acceptance**: list transaksi terlihat di profil sendiri.

---

## Task 19 — Rating
- **Tujuan**: Buyer/seller bisa beri rating setelah transaksi.
- **File**:
  - `src/services/ratingService.ts`
  - `src/screens/rating/CreateRatingScreen.tsx`
  - `src/components/profile/RatingStars.tsx`, `StarPicker.tsx`
- **Langkah**:
  1. `ratingService.submitRating({ transactionId, reviewedUserId, productId, rating, comment })`.
  2. Validasi server (RLS + check) + client (rating 1-5).
  3. Dari MyTransactionsSection: tombol "Beri Rating" (muncul jika belum pernah memberi rating untuk transaksi tsb).
  4. Trigger DB akan recompute rating_average & rating_count di profile reviewed user.
- **Cara test**: beri rating 5 → ratings_average user berubah; coba submit ulang → ditolak unique constraint.
- **Acceptance**: rating tersimpan; rating profile ter-update; tidak bisa double rating.

---

## Task 20 — Report produk/user
- **Tujuan**: Form report dari ProductDetail & UserProfile.
- **File**:
  - `src/services/reportService.ts`
  - `src/screens/report/CreateReportScreen.tsx`
- **Langkah**:
  1. Param `{ productId? , reportedUserId? }`.
  2. Form: alasan (radio), deskripsi (opsional).
  3. Insert ke `reports` dengan reporter_id = auth.uid().
  4. Tampilkan toast sukses.
- **Cara test**: laporkan produk → record `reports` baru tersimpan.
- **Acceptance**: data tersimpan; reporter tidak bisa melihat report orang lain.

---

## Task 21 — Loading, empty, error states global
- **Tujuan**: Pengalaman pengguna konsisten saat loading/empty/error.
- **File**:
  - `src/components/common/LoadingView.tsx`, `EmptyState.tsx`, `ErrorView.tsx`, `Skeleton.tsx`
  - Update semua screen list (Home, Search, Favorites, ChatList, MyProducts, Rating, Profile).
- **Langkah**:
  1. Standardisasi pesan empty (sesuai requirements).
  2. Tambah skeleton untuk grid produk; spinner kecil untuk tombol async.
  3. ErrorView dengan tombol Coba Lagi.
- **Cara test**: matikan jaringan → ErrorView muncul dengan retry.
- **Acceptance**: tidak ada layar list tanpa state lengkap.

---

## Task 22 — Testing manual end-to-end
- **Tujuan**: Verifikasi setiap acceptance criteria MVP.
- **File**:
  - `docs/manual-test-checklist.md`
- **Langkah**:
  1. Tulis checklist sesuai daftar AC-01..AC-17 di requirements.
  2. Lakukan run-through dengan minimal 2 akun (penjual & pembeli) di area dummy.
  3. Catat bug → fix → re-test.
- **Cara test**: Centang setiap item.
- **Acceptance**: semua AC checked.

---

## Task 23 — Rapikan UI
- **Tujuan**: Polish visual & konsistensi.
- **File**:
  - `src/constants/colors.ts`, `spacing.ts`
  - Komponen common
- **Langkah**:
  1. Audit padding/margin, ukuran font, kontras warna.
  2. Pastikan tap target ≥ 44pt.
  3. Tambah sedikit animasi (fade/slide) di list.
- **Cara test**: review manual antar layar.
- **Acceptance**: UI konsisten di Home, Search, Detail, Chat, Profile.

---

## Task 24 — README setup
- **Tujuan**: README lengkap untuk onboarding developer.
- **File**:
  - `README.md`
  - `.env.example`
- **Langkah**:
  1. Deskripsi aplikasi & fitur MVP.
  2. Tech stack.
  3. Setup Supabase: buat project, run `supabase/schema.sql`, `policies.sql`, `seed.sql`, buat bucket `product-images` & `avatars`, set policies.
  4. Cara membuat `.env` dari `.env.example` dengan URL & anon key.
  5. Cara menjalankan: `npm install`, `npx expo start`.
  6. Struktur folder.
  7. Batasan MVP & rencana next.
- **Cara test**: developer baru bisa mengikuti README sampai aplikasi berjalan.
- **Acceptance**: README jelas, lengkap, runnable.
