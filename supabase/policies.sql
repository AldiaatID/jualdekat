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
