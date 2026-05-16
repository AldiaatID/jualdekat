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
