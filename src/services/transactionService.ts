import { db } from '@/services/mock/db';
import { uuid } from '@/services/mock/uuid';
import type { ProductRow, TransactionRow } from '@/types/db';

export async function completeSale(input: {
  productId: string;
  sellerId: string;
  buyerId: string;
}): Promise<TransactionRow> {
  if (input.sellerId === input.buyerId) {
    throw new Error('Penjual dan pembeli tidak boleh sama');
  }
  const now = new Date().toISOString();
  const tx: TransactionRow = {
    id: uuid(),
    product_id: input.productId,
    seller_id: input.sellerId,
    buyer_id: input.buyerId,
    status: 'completed',
    created_at: now,
    completed_at: now,
  };
  await db.insert('transactions', tx);
  await db.update<ProductRow>('products', input.productId, {
    status: 'terjual',
    updated_at: now,
  });
  return tx;
}

export async function listMyTransactions(userId: string): Promise<
  (TransactionRow & { product: { id: string; name: string } | null })[]
> {
  const txs = await db.filter<TransactionRow>(
    'transactions',
    (t) => t.buyer_id === userId || t.seller_id === userId,
  );
  const products = await db.all<ProductRow>('products');
  return txs
    .map((t) => {
      const p = products.find((x) => x.id === t.product_id);
      return { ...t, product: p ? { id: p.id, name: p.name } : null };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
