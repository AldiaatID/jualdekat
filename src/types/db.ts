/**
 * Hand-written Supabase database types for JualDekat MVP.
 * Mirrors supabase/schema.sql.
 */
export type ProductStatus = 'tersedia' | 'proses' | 'terjual';
export type ProductCondition = 'baru' | 'bekas';
export type TransactionMethod = 'COD' | 'pickup' | 'kirim_lokal';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled';
export type MessageStatus = 'sent' | 'read';
export type ReportReason =
  | 'barang_palsu'
  | 'penipuan'
  | 'konten_tidak_pantas'
  | 'harga_mencurigakan'
  | 'spam'
  | 'lainnya';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed';

export interface ProfileRow {
  id: string;
  full_name: string;
  avatar_url: string | null;
  phone_number: string | null;
  city: string | null;
  area: string | null;
  latitude: number | null;
  longitude: number | null;
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface ProductRow {
  id: string;
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
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface ProductImageRow {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface FavoriteRow {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface ConversationRow {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  created_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  status: MessageStatus;
  created_at: string;
}

export interface TransactionRow {
  id: string;
  product_id: string;
  seller_id: string;
  buyer_id: string;
  status: TransactionStatus;
  created_at: string;
  completed_at: string | null;
}

export interface RatingRow {
  id: string;
  transaction_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  product_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ReportRow {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  product_id: string | null;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: Partial<ProfileRow> & Pick<ProfileRow, 'id' | 'full_name'>; Update: Partial<ProfileRow> };
      categories: { Row: CategoryRow; Insert: Partial<CategoryRow>; Update: Partial<CategoryRow> };
      products: { Row: ProductRow; Insert: Omit<ProductRow, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<ProductRow, 'id' | 'created_at' | 'updated_at'>>; Update: Partial<ProductRow> };
      product_images: { Row: ProductImageRow; Insert: Omit<ProductImageRow, 'id' | 'created_at'> & Partial<Pick<ProductImageRow, 'id' | 'created_at'>>; Update: Partial<ProductImageRow> };
      favorites: { Row: FavoriteRow; Insert: Omit<FavoriteRow, 'id' | 'created_at'> & Partial<Pick<FavoriteRow, 'id' | 'created_at'>>; Update: Partial<FavoriteRow> };
      conversations: { Row: ConversationRow; Insert: Omit<ConversationRow, 'id' | 'created_at' | 'last_message_at'> & Partial<Pick<ConversationRow, 'id' | 'created_at' | 'last_message_at'>>; Update: Partial<ConversationRow> };
      messages: { Row: MessageRow; Insert: Omit<MessageRow, 'id' | 'created_at' | 'status'> & Partial<Pick<MessageRow, 'id' | 'created_at' | 'status'>>; Update: Partial<MessageRow> };
      transactions: { Row: TransactionRow; Insert: Omit<TransactionRow, 'id' | 'created_at'> & Partial<Pick<TransactionRow, 'id' | 'created_at'>>; Update: Partial<TransactionRow> };
      ratings: { Row: RatingRow; Insert: Omit<RatingRow, 'id' | 'created_at'> & Partial<Pick<RatingRow, 'id' | 'created_at'>>; Update: Partial<RatingRow> };
      reports: { Row: ReportRow; Insert: Omit<ReportRow, 'id' | 'created_at' | 'status'> & Partial<Pick<ReportRow, 'id' | 'created_at' | 'status'>>; Update: Partial<ReportRow> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
