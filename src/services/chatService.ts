import { db } from '@/services/mock/db';
import { emit, on } from '@/services/mock/realtime';
import { uuid } from '@/services/mock/uuid';
import type {
  ConversationRow,
  MessageRow,
  ProductImageRow,
  ProductRow,
  ProfileRow,
} from '@/types/db';
import type { ConversationListItem } from '@/types/domain';

export async function getOrCreateConversation(input: {
  productId: string;
  buyerId: string;
  sellerId: string;
}): Promise<ConversationRow> {
  if (input.buyerId === input.sellerId) {
    throw new Error('Tidak bisa chat dengan diri sendiri');
  }
  const existing = await db.findOne<ConversationRow>(
    'conversations',
    (c) =>
      c.product_id === input.productId &&
      c.buyer_id === input.buyerId &&
      c.seller_id === input.sellerId,
  );
  if (existing) return existing;
  const now = new Date().toISOString();
  return db.insert<ConversationRow>('conversations', {
    id: uuid(),
    product_id: input.productId,
    buyer_id: input.buyerId,
    seller_id: input.sellerId,
    last_message_at: now,
    created_at: now,
  });
}

export async function listMyConversations(userId: string): Promise<ConversationListItem[]> {
  const convs = await db.filter<ConversationRow>(
    'conversations',
    (c) => c.buyer_id === userId || c.seller_id === userId,
  );
  if (!convs.length) return [];
  const products = await db.all<ProductRow>('products');
  const profiles = await db.all<ProfileRow>('profiles');
  const images = await db.all<ProductImageRow>('product_images');
  const messages = await db.all<MessageRow>('messages');

  return convs
    .map((c): ConversationListItem => {
      const product = products.find((p) => p.id === c.product_id);
      const isBuyer = c.buyer_id === userId;
      const peerId = isBuyer ? c.seller_id : c.buyer_id;
      const peer = profiles.find((p) => p.id === peerId);
      const productImages = images
        .filter((i) => i.product_id === c.product_id)
        .sort((a, b) => a.sort_order - b.sort_order);
      const convMessages = messages
        .filter((m) => m.conversation_id === c.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      const last = convMessages[convMessages.length - 1];
      return {
        id: c.id,
        product_id: c.product_id,
        product_name: product?.name ?? 'Produk',
        product_image: productImages[0]?.image_url ?? null,
        product_status: product?.status ?? 'tersedia',
        peer_id: peer?.id ?? peerId,
        peer_name: peer?.full_name ?? 'Pengguna',
        peer_avatar: peer?.avatar_url ?? null,
        last_message_at: c.last_message_at,
        last_message_preview: last?.body ?? null,
      };
    })
    .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
}

export async function fetchMessages(conversationId: string): Promise<MessageRow[]> {
  const rows = await db.filter<MessageRow>('messages', (m) => m.conversation_id === conversationId);
  return rows.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function sendMessage(input: {
  conversationId: string;
  senderId: string;
  body: string;
}): Promise<MessageRow> {
  const now = new Date().toISOString();
  const message: MessageRow = {
    id: uuid(),
    conversation_id: input.conversationId,
    sender_id: input.senderId,
    body: input.body,
    status: 'sent',
    created_at: now,
  };
  await db.insert('messages', message);
  await db.update<ConversationRow>('conversations', input.conversationId, {
    last_message_at: now,
  });
  emit(`messages:${input.conversationId}`, message);
  return message;
}

export function subscribeMessages(
  conversationId: string,
  onInsert: (msg: MessageRow) => void,
): () => void {
  return on<MessageRow>(`messages:${conversationId}`, onInsert);
}
