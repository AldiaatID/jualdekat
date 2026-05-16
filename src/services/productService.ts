import { supabase } from '@/services/supabase';
import type {
  CategoryRow,
  ProductCondition,
  ProductImageRow,
  ProductRow,
  ProductStatus,
  ProfileRow,
  TransactionMethod,
} from '@/types/db';
import type { ProductFeedItem } from '@/types/domain';
import { boundingBox, haversineKm, type LatLng } from '@/utils/distance';

export interface ProductCreateInput {
  user_id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  condition: ProductCondition;
  area: string;
  latitude: number;
  longitude: number;
  transaction_methods: TransactionMethod[];
}

export interface FeedQueryInput {
  center: LatLng | null;
  radiusKm: number;
  keyword?: string | null;
  categoryId?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  condition?: 'all' | ProductCondition;
  includeStatuses?: ProductStatus[];
  excludeUserId?: string | null;
  limit?: number;
}

interface RawProductWithRelations extends ProductRow {
  product_images: ProductImageRow[] | null;
  seller: Pick<ProfileRow, 'id' | 'full_name' | 'avatar_url' | 'rating_average' | 'rating_count'> | null;
}

function mapRowToFeedItem(
  row: RawProductWithRelations,
  center: LatLng | null,
): ProductFeedItem {
  const images = (row.product_images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
  const distance =
    center && row.latitude != null && row.longitude != null
      ? haversineKm(center, { latitude: row.latitude, longitude: row.longitude })
      : null;
  return {
    ...row,
    images,
    primary_image_url: images[0]?.image_url ?? null,
    seller: row.seller ?? {
      id: row.user_id,
      full_name: 'Pengguna',
      avatar_url: null,
      rating_average: 0,
      rating_count: 0,
    },
    distance_km: distance,
  };
}

export async function listCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as CategoryRow[];
}

export async function fetchFeed(input: FeedQueryInput): Promise<ProductFeedItem[]> {
  let q = supabase
    .from('products')
    .select(
      `*, product_images(*), seller:profiles!products_user_id_fkey(id, full_name, avatar_url, rating_average, rating_count)`,
    );

  const statuses = input.includeStatuses ?? ['tersedia'];
  q = q.in('status', statuses);

  if (input.center) {
    const bb = boundingBox(input.center, input.radiusKm);
    q = q
      .gte('latitude', bb.minLat)
      .lte('latitude', bb.maxLat)
      .gte('longitude', bb.minLng)
      .lte('longitude', bb.maxLng);
  }

  if (input.keyword?.trim()) {
    const k = input.keyword.trim();
    q = q.or(`name.ilike.%${k}%,description.ilike.%${k}%`);
  }
  if (input.categoryId) q = q.eq('category_id', input.categoryId);
  if (input.priceMin != null) q = q.gte('price', input.priceMin);
  if (input.priceMax != null) q = q.lte('price', input.priceMax);
  if (input.condition && input.condition !== 'all') q = q.eq('condition', input.condition);
  if (input.excludeUserId) q = q.neq('user_id', input.excludeUserId);

  q = q.order('created_at', { ascending: false }).limit(input.limit ?? 50);

  const { data, error } = await q;
  if (error) throw error;

  const items = (data as unknown as RawProductWithRelations[]).map((row) =>
    mapRowToFeedItem(row, input.center),
  );

  // Fine-filter by Haversine + sort by distance
  const filtered = input.center
    ? items.filter((it) => (it.distance_km ?? Infinity) <= input.radiusKm)
    : items;

  filtered.sort((a, b) => {
    const da = a.distance_km ?? Infinity;
    const db = b.distance_km ?? Infinity;
    if (Math.abs(da - db) > 0.05) return da - db;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return filtered;
}

export async function getProductDetail(
  productId: string,
  center: LatLng | null,
): Promise<ProductFeedItem | null> {
  const { data, error } = await supabase
    .from('products')
    .select(
      `*, product_images(*), seller:profiles!products_user_id_fkey(id, full_name, avatar_url, rating_average, rating_count)`,
    )
    .eq('id', productId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapRowToFeedItem(data as unknown as RawProductWithRelations, center);
}

export async function listProductsByUser(
  userId: string,
  statuses?: ProductStatus[],
): Promise<ProductFeedItem[]> {
  let q = supabase
    .from('products')
    .select(
      `*, product_images(*), seller:profiles!products_user_id_fkey(id, full_name, avatar_url, rating_average, rating_count)`,
    )
    .eq('user_id', userId);
  if (statuses?.length) q = q.in('status', statuses);
  q = q.order('created_at', { ascending: false });
  const { data, error } = await q;
  if (error) throw error;
  return (data as unknown as RawProductWithRelations[]).map((row) => mapRowToFeedItem(row, null));
}

export async function createProduct(input: ProductCreateInput): Promise<ProductRow> {
  const { data, error } = await supabase
    .from('products')
    .insert(input as never)
    .select('*')
    .single();
  if (error) throw error;
  return data as ProductRow;
}

export async function attachImagesToProduct(
  productId: string,
  imageUrls: string[],
): Promise<void> {
  if (!imageUrls.length) return;
  const rows = imageUrls.map((url, idx) => ({
    product_id: productId,
    image_url: url,
    sort_order: idx,
  }));
  const { error } = await supabase.from('product_images').insert(rows as never);
  if (error) throw error;
}

export async function updateProduct(
  productId: string,
  patch: Partial<ProductRow>,
): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update(patch as never)
    .eq('id', productId);
  if (error) throw error;
}

export async function setProductStatus(productId: string, status: ProductStatus): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ status } as never)
    .eq('id', productId);
  if (error) throw error;
}

export async function deleteProduct(productId: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw error;
}
