import { db } from '@/services/mock/db';
import { uuid } from '@/services/mock/uuid';
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

async function decorate(
  rows: ProductRow[],
  center: LatLng | null,
): Promise<ProductFeedItem[]> {
  const profiles = await db.all<ProfileRow>('profiles');
  const images = await db.all<ProductImageRow>('product_images');
  return rows.map((row) => {
    const seller = profiles.find((p) => p.id === row.user_id);
    const imgs = images
      .filter((i) => i.product_id === row.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    const distance =
      center && row.latitude != null && row.longitude != null
        ? haversineKm(center, { latitude: row.latitude, longitude: row.longitude })
        : null;
    return {
      ...row,
      images: imgs,
      primary_image_url: imgs[0]?.image_url ?? null,
      seller: seller
        ? {
            id: seller.id,
            full_name: seller.full_name,
            avatar_url: seller.avatar_url,
            rating_average: seller.rating_average,
            rating_count: seller.rating_count,
          }
        : { id: row.user_id, full_name: 'Pengguna', avatar_url: null, rating_average: 0, rating_count: 0 },
      distance_km: distance,
    };
  });
}

export async function listCategories(): Promise<CategoryRow[]> {
  const rows = await db.all<CategoryRow>('categories');
  return rows.sort((a, b) => a.sort_order - b.sort_order);
}

export async function fetchFeed(input: FeedQueryInput): Promise<ProductFeedItem[]> {
  const all = await db.all<ProductRow>('products');
  const statuses = input.includeStatuses ?? ['tersedia'];

  let filtered = all.filter((p) => statuses.includes(p.status));

  if (input.center) {
    const bb = boundingBox(input.center, input.radiusKm);
    filtered = filtered.filter(
      (p) =>
        p.latitude >= bb.minLat &&
        p.latitude <= bb.maxLat &&
        p.longitude >= bb.minLng &&
        p.longitude <= bb.maxLng,
    );
  }

  if (input.keyword?.trim()) {
    const k = input.keyword.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(k) || (p.description?.toLowerCase().includes(k) ?? false),
    );
  }
  if (input.categoryId) filtered = filtered.filter((p) => p.category_id === input.categoryId);
  if (input.priceMin != null) filtered = filtered.filter((p) => p.price >= input.priceMin!);
  if (input.priceMax != null) filtered = filtered.filter((p) => p.price <= input.priceMax!);
  if (input.condition && input.condition !== 'all') {
    filtered = filtered.filter((p) => p.condition === input.condition);
  }
  if (input.excludeUserId) filtered = filtered.filter((p) => p.user_id !== input.excludeUserId);

  const items = await decorate(filtered, input.center);

  const refined = input.center
    ? items.filter((it) => (it.distance_km ?? Infinity) <= input.radiusKm)
    : items;

  refined.sort((a, b) => {
    const da = a.distance_km ?? Infinity;
    const dbk = b.distance_km ?? Infinity;
    if (Math.abs(da - dbk) > 0.05) return da - dbk;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return refined.slice(0, input.limit ?? 50);
}

export async function getProductDetail(
  productId: string,
  center: LatLng | null,
): Promise<ProductFeedItem | null> {
  const row = await db.findById<ProductRow>('products', productId);
  if (!row) return null;
  const list = await decorate([row], center);
  return list[0] ?? null;
}

export async function listProductsByUser(
  userId: string,
  statuses?: ProductStatus[],
): Promise<ProductFeedItem[]> {
  const rows = await db.filter<ProductRow>('products', (p) => {
    if (p.user_id !== userId) return false;
    if (statuses?.length) return statuses.includes(p.status);
    return true;
  });
  rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return decorate(rows, null);
}

export async function createProduct(input: ProductCreateInput): Promise<ProductRow> {
  const now = new Date().toISOString();
  const row: ProductRow = {
    id: uuid(),
    user_id: input.user_id,
    category_id: input.category_id,
    name: input.name,
    description: input.description,
    price: input.price,
    condition: input.condition,
    area: input.area,
    latitude: input.latitude,
    longitude: input.longitude,
    transaction_methods: input.transaction_methods,
    status: 'tersedia',
    created_at: now,
    updated_at: now,
  };
  await db.insert('products', row);
  return row;
}

export async function attachImagesToProduct(
  productId: string,
  imageUrls: string[],
): Promise<void> {
  if (!imageUrls.length) return;
  const rows: ProductImageRow[] = imageUrls.map((url, idx) => ({
    id: uuid(),
    product_id: productId,
    image_url: url,
    sort_order: idx,
    created_at: new Date().toISOString(),
  }));
  await db.insertMany('product_images', rows);
}

export async function updateProduct(
  productId: string,
  patch: Partial<ProductRow>,
): Promise<void> {
  await db.update<ProductRow>('products', productId, {
    ...patch,
    updated_at: new Date().toISOString(),
  });
}

export async function setProductStatus(productId: string, status: ProductStatus): Promise<void> {
  await db.update<ProductRow>('products', productId, {
    status,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteProduct(productId: string): Promise<void> {
  await db.deleteById('products', productId);
  await db.deleteWhere<ProductImageRow>('product_images', (img) => img.product_id === productId);
}
