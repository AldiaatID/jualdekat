import { supabase } from '@/services/supabase';
import type { FavoriteRow, ProductImageRow, ProductRow, ProfileRow } from '@/types/db';
import type { ProductFeedItem } from '@/types/domain';

interface FavoriteWithProduct extends FavoriteRow {
  product:
    | (ProductRow & {
        product_images: ProductImageRow[] | null;
        seller: Pick<
          ProfileRow,
          'id' | 'full_name' | 'avatar_url' | 'rating_average' | 'rating_count'
        > | null;
      })
    | null;
}

export async function listFavorites(userId: string): Promise<ProductFeedItem[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select(
      `*, product:products(*, product_images(*), seller:profiles!products_user_id_fkey(id, full_name, avatar_url, rating_average, rating_count))`,
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const rows = (data as unknown as FavoriteWithProduct[]).filter((r) => r.product != null);
  return rows.map((r) => {
    const p = r.product!;
    const images = (p.product_images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
    return {
      ...p,
      images,
      primary_image_url: images[0]?.image_url ?? null,
      seller: p.seller ?? {
        id: p.user_id,
        full_name: 'Pengguna',
        avatar_url: null,
        rating_average: 0,
        rating_count: 0,
      },
      distance_km: null,
    };
  });
}

export async function isFavorited(userId: string, productId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function addFavorite(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, product_id: productId } as never);
  if (error && error.code !== '23505') throw error;
}

export async function removeFavorite(userId: string, productId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) throw error;
}
