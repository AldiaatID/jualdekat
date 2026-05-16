import type { ProductRow, ProductImageRow, ProfileRow } from '@/types/db';

export interface ProductFeedItem extends ProductRow {
  primary_image_url: string | null;
  images: ProductImageRow[];
  seller: Pick<ProfileRow, 'id' | 'full_name' | 'avatar_url' | 'rating_average' | 'rating_count'>;
  distance_km: number | null;
}

export interface ConversationListItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  product_status: string;
  peer_id: string;
  peer_name: string;
  peer_avatar: string | null;
  last_message_at: string;
  last_message_preview: string | null;
}

export interface FilterState {
  keyword: string;
  categoryId: string | null;
  priceMin: number | null;
  priceMax: number | null;
  condition: 'all' | 'baru' | 'bekas';
  radiusKm: number;
}
