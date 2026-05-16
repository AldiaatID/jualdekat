import { supabase } from '@/services/supabase';
import type { ConversationRow, MessageRow, ProductRow, ProfileRow } from '@/types/db';
import type { ConversationListItem } from '@/types/domain';

export async function getOrCreateConversation(input: {
  productId: string;
  buyerId: string;
  sellerId: string;
}): Promise<ConversationRow> {
  // 1. lookup existing
  const { data: existing, error: e1 } = await supabase
    .from('conversations')
    .select('*')
    .eq('product_id', input.productId)
    .eq('buyer_id', input.buyerId)
    .eq('seller_id', input.sellerId)
    .maybeSingle();
  if (e1) throw e1;
  if (existing) return existing as ConversationRow;

  // 2. create
  const { data: created, error: e2 } = await supabase
    .from('conversations')
    .insert({
      product_id: input.productId,
      buyer_id: input.buyerId,
      seller_id: input.sellerId,
    } as never)
    .select('*')
    .single();
  if (e2) throw e2;
  return created as ConversationRow;
}

interface ConversationJoined extends ConversationRow {
  product:
    | (Pick<ProductRow, 'id' | 'name' | 'status'> & {
        product_images: { image_url: string; sort_order: number }[] | null;
      })
    | null;
  buyer: Pick<ProfileRow, 'id' | 'full_name' | 'avatar_url'> | null;
  seller: Pick<ProfileRow, 'id' | 'full_name' | 'avatar_url'> | null;
  last_message: { body: string }[] | null;
}

export async function listMyConversations(userId: string): Promise<ConversationListItem[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select(
      `*,
       product:products(id, name, status, product_images(image_url, sort_order)),
       buyer:profiles!conversations_buyer_id_fkey(id, full_name, avatar_url),
       seller:profiles!conversations_seller_id_fkey(id, full_name, avatar_url),
       last_message:messages(body)`,
    )
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as unknown as ConversationJoined[];
  return rows.map((r) => {
    const isBuyer = r.buyer_id === userId;
    const peer = isBuyer ? r.seller : r.buyer;
    const images = (r.product?.product_images ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order);
    const preview = (r.last_message ?? []).at(-1)?.body ?? null;
    return {
      id: r.id,
      product_id: r.product_id,
      product_name: r.product?.name ?? 'Produk',
      product_image: images[0]?.image_url ?? null,
      product_status: r.product?.status ?? 'tersedia',
      peer_id: peer?.id ?? '',
      peer_name: peer?.full_name ?? 'Pengguna',
      peer_avatar: peer?.avatar_url ?? null,
      last_message_at: r.last_message_at,
      last_message_preview: preview,
    };
  });
}

export async function fetchMessages(conversationId: string): Promise<MessageRow[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as MessageRow[];
}

export async function sendMessage(input: {
  conversationId: string;
  senderId: string;
  body: string;
}): Promise<MessageRow> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: input.conversationId,
      sender_id: input.senderId,
      body: input.body,
    } as never)
    .select('*')
    .single();
  if (error) throw error;
  return data as MessageRow;
}

export function subscribeMessages(
  conversationId: string,
  onInsert: (msg: MessageRow) => void,
) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onInsert(payload.new as MessageRow);
      },
    )
    .subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}
