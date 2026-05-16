/**
 * Fallback category list ketika DB belum di-seed.
 * Slug harus identik dengan supabase/seed.sql.
 */
export const FALLBACK_CATEGORIES = [
  { slug: 'elektronik', name: 'Elektronik', sort_order: 1 },
  { slug: 'fashion', name: 'Fashion', sort_order: 2 },
  { slug: 'buku', name: 'Buku', sort_order: 3 },
  { slug: 'perabot', name: 'Perabot', sort_order: 4 },
  { slug: 'kendaraan', name: 'Kendaraan', sort_order: 5 },
  { slug: 'alat-rumah-tangga', name: 'Alat Rumah Tangga', sort_order: 6 },
  { slug: 'hobi-olahraga', name: 'Hobi & Olahraga', sort_order: 7 },
  { slug: 'perlengkapan-bayi', name: 'Perlengkapan Bayi', sort_order: 8 },
  { slug: 'kos-kontrakan', name: 'Kos & Kontrakan', sort_order: 9 },
  { slug: 'lainnya', name: 'Lainnya', sort_order: 99 },
] as const;
