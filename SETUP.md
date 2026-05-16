# JualDekat — Quick Setup (5 menit)

Ikuti urutan ini supaya web demo + aplikasi mobile benar-benar berfungsi penuh.

## Langkah 1 — Buat Supabase project (3 menit)

1. Buka https://supabase.com → **Sign in with GitHub**.
2. Klik **New project**:
   - Name: `jualdekat`
   - Database password: bebas (catat di tempat aman)
   - Region: **Southeast Asia (Singapore)**
3. Tunggu ~2 menit hingga project siap.

## Langkah 2 — Jalankan SQL setup (1 menit)

1. Di dashboard Supabase, buka **SQL Editor → New query**.
2. Buka file [`supabase/setup-all.sql`](supabase/setup-all.sql) di repo ini, **copy semua isinya**, lalu paste ke SQL editor.
3. Klik **Run**. Harusnya ada notif "Success. No rows returned".

Hasil: 10 tabel + RLS + 10 kategori sudah siap.

## Langkah 3 — Buat 2 Storage buckets

Di **Storage**:

1. **New bucket** → name: `product-images` → toggle **Public bucket: ON** → Save.
2. **New bucket** → name: `avatars` → toggle **Public bucket: ON** → Save.

(Storage policies sudah dibuat oleh `setup-all.sql`.)

## Langkah 4 — Matikan email confirmation (untuk testing)

**Authentication → Providers → Email** → matikan toggle **"Confirm email"** → Save.

> Untuk production, nyalakan kembali. Untuk MVP testing, ini supaya Anda bisa langsung login setelah daftar tanpa harus cek email.

## Langkah 5 — Ambil credentials

**Project Settings → API**:
- Salin **Project URL** (`https://xxxxx.supabase.co`)
- Salin **`anon` `public` key** (string panjang `eyJ...`)

⚠️ Jangan share `service_role` key — itu rahasia.

## Langkah 6A — Untuk pengembangan lokal

Buat file `.env` di root project:

```bash
cp .env.example .env
```

Isi:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Lalu jalankan:
```bash
npm install
npm run web      # buka di browser
# atau
npm start        # scan QR di Expo Go (mobile)
```

## Langkah 6B — Untuk web demo publik (GitHub Pages)

Tambahkan kedua nilai sebagai **GitHub Actions Secrets**:

1. Buka https://github.com/AldiaatID/jualdekat/settings/secrets/actions
2. Klik **New repository secret**, tambahkan:
   - Name: `EXPO_PUBLIC_SUPABASE_URL`, Secret: URL dari langkah 5.
3. Klik **New repository secret** lagi:
   - Name: `EXPO_PUBLIC_SUPABASE_ANON_KEY`, Secret: anon key dari langkah 5.
4. Buka tab **Actions** → klik workflow **"Deploy Web (GitHub Pages)"** → klik **Run workflow** (atau push commit baru ke `main`).

Setelah workflow hijau (~2 menit), web demo sudah connect ke Supabase Anda:
**https://aldiaatid.github.io/jualdekat/**

## Verifikasi (test cepat)

1. Buka web demo → tap **Daftar**.
2. Isi email + password (mis. `test1@example.com` / `123456`).
3. Setelah masuk, lengkapi profil (nama, kota, area).
4. Izinkan lokasi (browser akan minta).
5. Coba upload 1 produk dummy.
6. (Opsional) buka di browser/incognito kedua, daftar akun lain, dan chat ke produk dari akun pertama → pesan masuk realtime.

## Troubleshooting

| Gejala | Solusi |
|---|---|
| "Invalid login credentials" | Pastikan password benar; jika "Confirm email" masih aktif, cek inbox email. |
| Tombol Daftar/Masuk tampil alert "Mode Demo" | `.env` belum diisi (lokal) atau secrets belum di-set (web demo). |
| "permission denied for table profiles" | Re-run `supabase/setup-all.sql` — pastikan policies dijalankan. |
| Foto tidak ter-upload | Pastikan kedua bucket dibuat & public; cek policies di Storage. |
| Realtime chat tidak masuk | Cek di Supabase Dashboard → Database → Replication → publication `supabase_realtime` mencakup tabel `messages`. `setup-all.sql` sudah menambahkannya. |
