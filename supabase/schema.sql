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
