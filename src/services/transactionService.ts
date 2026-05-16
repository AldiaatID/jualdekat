import { supabase } from '@/services/supabase';
import type { TransactionRow } from '@/types/db';

export async function completeSale(input: {
  productId: string;
  sellerId: string;
  buyerId: string;
}): Promise<TransactionRow> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      product_id: input.productId,
      seller_id: input.sellerId,
      buyer_id: input.buyerId,
      status: 'completed',
      completed_at: new Date().toISOString(),
    } as never)
    .select('*')
    .single();
  if (error) throw error;

  // best-effort: mark product as terjual
  const { error: e2 } = await supabase
    .from('products')
    .update({ status: 'terjual' } as never)
    .eq('id', input.productId);
  if (e2) throw e2;
  return data as TransactionRow;
}

export async function listMyTransactions(userId: string): Promise<
  (TransactionRow & { product: { id: string; name: string } | null })[]
> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, product:products(id, name)')
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as never;
}
