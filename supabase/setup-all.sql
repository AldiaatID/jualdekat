-- =====================================================================
-- JualDekat MVP - One-shot setup. Paste this entire file into
-- Supabase Dashboard > SQL Editor > New Query > Run.
-- Safe to re-run.
-- =====================================================================

-- =====================================================================
-- JualDekat MVP - Database Schema
-- Run order: 1) schema.sql  2) policies.sql  3) seed.sql
-- =====================================================================

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- profiles -----------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  phone_number text,
  city text,
  area text,
  latitude double precision,
  longitude double precision,
  rating_average numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ---------- categories ---------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- products -----------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.categories(id),
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_user_id     on public.products(user_id);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_status      on public.products(status);
create index if not exists idx_products_created_at  on public.products(created_at desc);
create index if not exists idx_products_lat_lng     on public.products(latitude, longitude);

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- ---------- product_images -----------------------------------------------
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_images_product on public.product_images(product_id, sort_order);

-- ---------- favorites ----------------------------------------------------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists idx_favorites_user_id on public.favorites(user_id);

-- ---------- conversations ------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (product_id, buyer_id, seller_id),
  check (buyer_id <> seller_id)
);

create index if not exists idx_conv_buyer   on public.conversations(buyer_id);
create index if not exists idx_conv_seller  on public.conversations(seller_id);
create index if not exists idx_conv_product on public.conversations(product_id);

-- ---------- messages -----------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(body) > 0),
  status text not null default 'sent' check (status in ('sent','read')),
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conv on public.messages(conversation_id, created_at);

create or replace function public.touch_conversation_last_message()
returns trigger language plpgsql as $$
begin
  update public.conversations
     set last_message_at = new.created_at
   where id = new.conversation_id;
  return new;
end $$;

drop trigger if exists trg_messages_touch_conv on public.messages;
create trigger trg_messages_touch_conv
after insert on public.messages
for each row execute function public.touch_conversation_last_message();

-- ---------- transactions -------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  buyer_id  uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'completed'
    check (status in ('pending','completed','cancelled')),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  check (buyer_id <> seller_id)
);

create index if not exists idx_tx_seller on public.transactions(seller_id);
create index if not exists idx_tx_buyer  on public.transactions(buyer_id);
create index if not exists idx_tx_product on public.transactions(product_id);

-- ---------- ratings ------------------------------------------------------
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewed_user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (transaction_id, reviewer_id),
  check (reviewer_id <> reviewed_user_id)
);

create index if not exists idx_ratings_reviewed on public.ratings(reviewed_user_id);

create or replace function public.update_profile_rating()
returns trigger language plpgsql as $$
declare
  target uuid;
begin
  target := coalesce(new.reviewed_user_id, old.reviewed_user_id);

  update public.profiles p
  set rating_average = coalesce((
        select round(avg(r.rating)::numeric, 2)
        from public.ratings r
        where r.reviewed_user_id = target
      ), 0),
      rating_count = (
        select count(*) from public.ratings r
        where r.reviewed_user_id = target
      )
  where p.id = target;

  return null;
end $$;

drop trigger if exists trg_ratings_update_profile on public.ratings;
create trigger trg_ratings_update_profile
after insert or update or delete on public.ratings
for each row execute function public.update_profile_rating();

-- ---------- reports ------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  reason text not null check (reason in (
    'barang_palsu','penipuan','konten_tidak_pantas',
    'harga_mencurigakan','spam','lainnya')),
  description text,
  status text not null default 'pending' check (status in ('pending','reviewed','dismissed')),
  created_at timestamptz not null default now()
);

-- ---------- realtime publication ----------------------------------------
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.conversations;
exception when duplicate_object then null; end $$;
-- =====================================================================
-- JualDekat MVP - RLS Policies (run AFTER schema.sql)
-- =====================================================================

alter table public.profiles        enable row level security;
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.product_images  enable row level security;
alter table public.favorites       enable row level security;
alter table public.conversations   enable row level security;
alter table public.messages        enable row level security;
alter table public.transactions    enable row level security;
alter table public.ratings         enable row level security;
alter table public.reports         enable row level security;

-- ---------- profiles -----------------------------------------------------
drop policy if exists profiles_select_authed on public.profiles;
create policy profiles_select_authed on public.profiles
  for select to authenticated using (true);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ---------- categories ---------------------------------------------------
drop policy if exists categories_select_all on public.categories;
create policy categories_select_all on public.categories
  for select using (true);

-- ---------- products -----------------------------------------------------
drop policy if exists products_select_authed on public.products;
create policy products_select_authed on public.products
  for select to authenticated using (true);

drop policy if exists products_insert_self on public.products;
create policy products_insert_self on public.products
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists products_update_self on public.products;
create policy products_update_self on public.products
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists products_delete_self on public.products;
create policy products_delete_self on public.products
  for delete to authenticated using (user_id = auth.uid());

-- ---------- product_images -----------------------------------------------
drop policy if exists product_images_select_authed on public.product_images;
create policy product_images_select_authed on public.product_images
  for select to authenticated using (true);

drop policy if exists product_images_insert_owner on public.product_images;
create policy product_images_insert_owner on public.product_images
  for insert to authenticated with check (
    exists (select 1 from public.products p where p.id = product_id and p.user_id = auth.uid())
  );

drop policy if exists product_images_delete_owner on public.product_images;
create policy product_images_delete_owner on public.product_images
  for delete to authenticated using (
    exists (select 1 from public.products p where p.id = product_id and p.user_id = auth.uid())
  );

-- ---------- favorites ----------------------------------------------------
drop policy if exists favorites_select_self on public.favorites;
create policy favorites_select_self on public.favorites
  for select to authenticated using (user_id = auth.uid());

drop policy if exists favorites_insert_self on public.favorites;
create policy favorites_insert_self on public.favorites
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists favorites_delete_self on public.favorites;
create policy favorites_delete_self on public.favorites
  for delete to authenticated using (user_id = auth.uid());

-- ---------- conversations ------------------------------------------------
drop policy if exists conversations_select_member on public.conversations;
create policy conversations_select_member on public.conversations
  for select to authenticated using (auth.uid() in (buyer_id, seller_id));

drop policy if exists conversations_insert_buyer on public.conversations;
create policy conversations_insert_buyer on public.conversations
  for insert to authenticated with check (buyer_id = auth.uid() and buyer_id <> seller_id);

drop policy if exists conversations_update_member on public.conversations;
create policy conversations_update_member on public.conversations
  for update to authenticated using (auth.uid() in (buyer_id, seller_id));

-- ---------- messages -----------------------------------------------------
drop policy if exists messages_select_member on public.messages;
create policy messages_select_member on public.messages
  for select to authenticated using (
    exists (select 1 from public.conversations c
            where c.id = conversation_id and auth.uid() in (c.buyer_id, c.seller_id))
  );

drop policy if exists messages_insert_member on public.messages;
create policy messages_insert_member on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid()
    and exists (select 1 from public.conversations c
                where c.id = conversation_id and auth.uid() in (c.buyer_id, c.seller_id))
  );

-- ---------- transactions -------------------------------------------------
drop policy if exists transactions_select_member on public.transactions;
create policy transactions_select_member on public.transactions
  for select to authenticated using (auth.uid() in (buyer_id, seller_id));

drop policy if exists transactions_insert_seller on public.transactions;
create policy transactions_insert_seller on public.transactions
  for insert to authenticated with check (seller_id = auth.uid() and seller_id <> buyer_id);

drop policy if exists transactions_update_member on public.transactions;
create policy transactions_update_member on public.transactions
  for update to authenticated using (auth.uid() in (buyer_id, seller_id));

-- ---------- ratings ------------------------------------------------------
drop policy if exists ratings_select_all on public.ratings;
create policy ratings_select_all on public.ratings
  for select to authenticated using (true);

drop policy if exists ratings_insert_member on public.ratings;
create policy ratings_insert_member on public.ratings
  for insert to authenticated with check (
    reviewer_id = auth.uid()
    and reviewer_id <> reviewed_user_id
    and exists (
      select 1 from public.transactions t
      where t.id = transaction_id
        and t.status = 'completed'
        and auth.uid() in (t.buyer_id, t.seller_id)
        and reviewed_user_id in (t.buyer_id, t.seller_id)
    )
  );

-- ---------- reports ------------------------------------------------------
drop policy if exists reports_select_self on public.reports;
create policy reports_select_self on public.reports
  for select to authenticated using (reporter_id = auth.uid());

drop policy if exists reports_insert_self on public.reports;
create policy reports_insert_self on public.reports
  for insert to authenticated with check (reporter_id = auth.uid());

-- =====================================================================
-- Storage policies (run after creating buckets `product-images` and `avatars`)
-- =====================================================================

drop policy if exists "product images public read" on storage.objects;
create policy "product images public read" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "product images upload owner" on storage.objects;
create policy "product images upload owner" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "product images delete owner" on storage.objects;
create policy "product images delete owner" on storage.objects
  for delete to authenticated using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars upload owner" on storage.objects;
create policy "avatars upload owner" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars delete owner" on storage.objects;
create policy "avatars delete owner" on storage.objects
  for delete to authenticated using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
-- =====================================================================
-- JualDekat MVP - Seed Data
-- =====================================================================

insert into public.categories (name, slug, sort_order) values
  ('Elektronik',          'elektronik',          1),
  ('Fashion',             'fashion',             2),
  ('Buku',                'buku',                3),
  ('Perabot',             'perabot',             4),
  ('Kendaraan',           'kendaraan',           5),
  ('Alat Rumah Tangga',   'alat-rumah-tangga',   6),
  ('Hobi & Olahraga',     'hobi-olahraga',       7),
  ('Perlengkapan Bayi',   'perlengkapan-bayi',   8),
  ('Kos & Kontrakan',     'kos-kontrakan',       9),
  ('Lainnya',             'lainnya',             99)
on conflict (slug) do nothing;

-- =====================================================================
-- (Opsional) contoh produk dummy. Uncomment & ganti :seller_uuid setelah
-- ada user terdaftar (lihat auth.users untuk UUID-nya).
-- =====================================================================
-- insert into public.products (user_id, category_id, name, description, price, condition, area, latitude, longitude, transaction_methods)
-- select :seller_uuid, c.id, x.name, x.description, x.price, x.condition, x.area, x.lat, x.lng, x.tx
-- from public.categories c
-- join (values
--   ('elektronik', 'Speaker Bluetooth',    'Suara mantap, baterai awet',     150000, 'bekas', 'Beji', -6.3623, 106.8316, ARRAY['COD']),
--   ('elektronik', 'Rice Cooker',          'Masih baru, jarang dipakai',     180000, 'bekas', 'Beji', -6.3611, 106.8302, ARRAY['COD','pickup']),
--   ('elektronik', 'Kipas Angin',          'Kondisi mulus',                   90000, 'bekas', 'Beji', -6.3601, 106.8290, ARRAY['COD']),
--   ('buku',       'Buku Kuliah Algoritma','Edisi 2nd, ada catatan tipis',    60000, 'bekas', 'Beji', -6.3640, 106.8330, ARRAY['COD']),
--   ('perabot',    'Meja Belajar Bekas',   'Kayu solid, kaki kokoh',         250000, 'bekas', 'Beji', -6.3650, 106.8340, ARRAY['pickup']),
--   ('perabot',    'Rak Sepatu',           'Muat 6 pasang sepatu',            80000, 'bekas', 'Beji', -6.3625, 106.8320, ARRAY['COD']),
--   ('fashion',    'Jaket Preloved',       'Ukuran M, masih bagus',          120000, 'bekas', 'Beji', -6.3610, 106.8295, ARRAY['COD']),
--   ('kendaraan',  'Sepeda Bekas',         'Cocok ke kampus',                900000, 'bekas', 'Beji', -6.3675, 106.8350, ARRAY['pickup'])
-- ) as x(slug, name, description, price, condition, area, lat, lng, tx)
-- on c.slug = x.slug;
