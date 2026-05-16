import { db } from '@/services/mock/db';
import { uuid } from '@/services/mock/uuid';
import type { FavoriteRow, ProductImageRow, ProductRow, ProfileRow } from '@/types/db';
import type { ProductFeedItem } from '@/types/domain';

export async function listFavorites(userId: string): Promise<ProductFeedItem[]> {
  const favs = await db.filter<FavoriteRow>('favorites', (f) => f.user_id === userId);
  if (!favs.length) return [];
  const products = await db.all<ProductRow>('products');
  const profiles = await db.all<ProfileRow>('profiles');
  const images = await db.all<ProductImageRow>('product_images');

  const items: ProductFeedItem[] = [];
  for (const f of favs.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )) {
    const p = products.find((x) => x.id === f.product_id);
    if (!p) continue;
    const seller = profiles.find((x) => x.id === p.user_id);
    const imgs = images
      .filter((i) => i.product_id === p.id)
      .sort((a, b) => a.sort_order - b.sort_order);
    items.push({
      ...p,
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
        : { id: p.user_id, full_name: 'Pengguna', avatar_url: null, rating_average: 0, rating_count: 0 },
      distance_km: null,
    });
  }
  return items;
}

export async function isFavorited(userId: string, productId: string): Promise<boolean> {
  const found = await db.findOne<FavoriteRow>(
    'favorites',
    (f) => f.user_id === userId && f.product_id === productId,
  );
  return !!found;
}

export async function addFavorite(userId: string, productId: string): Promise<void> {
  if (await isFavorited(userId, productId)) return;
  await db.insert<FavoriteRow>('favorites', {
    id: uuid(),
    user_id: userId,
    product_id: productId,
    created_at: new Date().toISOString(),
  });
}

export async function removeFavorite(userId: string, productId: string): Promise<void> {
  await db.deleteWhere<FavoriteRow>(
    'favorites',
    (f) => f.user_id === userId && f.product_id === productId,
  );
}
