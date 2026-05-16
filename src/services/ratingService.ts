import { db } from '@/services/mock/db';
import { uuid } from '@/services/mock/uuid';
import type { ProfileRow, RatingRow, TransactionRow } from '@/types/db';

export interface RatingInput {
  transaction_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  product_id: string | null;
  rating: number;
  comment?: string | null;
}

async function recomputeRating(userId: string): Promise<void> {
  const ratings = await db.filter<RatingRow>(
    'ratings',
    (r) => r.reviewed_user_id === userId,
  );
  const count = ratings.length;
  const avg = count
    ? Math.round((ratings.reduce((s, r) => s + r.rating, 0) / count) * 100) / 100
    : 0;
  await db.update<ProfileRow>('profiles', userId, {
    rating_average: avg,
    rating_count: count,
    updated_at: new Date().toISOString(),
  });
}

export async function submitRating(input: RatingInput): Promise<RatingRow> {
  if (input.reviewer_id === input.reviewed_user_id) {
    throw new Error('Tidak bisa memberi rating ke diri sendiri');
  }
  if (input.rating < 1 || input.rating > 5) {
    throw new Error('Rating harus 1-5');
  }
  const tx = await db.findById<TransactionRow>('transactions', input.transaction_id);
  if (!tx || tx.status !== 'completed') {
    throw new Error('Transaksi tidak valid');
  }
  if (![tx.buyer_id, tx.seller_id].includes(input.reviewer_id)) {
    throw new Error('Bukan peserta transaksi');
  }
  const existing = await db.findOne<RatingRow>(
    'ratings',
    (r) =>
      r.transaction_id === input.transaction_id && r.reviewer_id === input.reviewer_id,
  );
  if (existing) throw new Error('Sudah memberi rating untuk transaksi ini');

  const row: RatingRow = {
    id: uuid(),
    transaction_id: input.transaction_id,
    reviewer_id: input.reviewer_id,
    reviewed_user_id: input.reviewed_user_id,
    product_id: input.product_id,
    rating: input.rating,
    comment: input.comment ?? null,
    created_at: new Date().toISOString(),
  };
  await db.insert('ratings', row);
  await recomputeRating(input.reviewed_user_id);
  return row;
}

export async function listRatingsForUser(userId: string): Promise<RatingRow[]> {
  const rows = await db.filter<RatingRow>('ratings', (r) => r.reviewed_user_id === userId);
  return rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function existingRatingFor(
  transactionId: string,
  reviewerId: string,
): Promise<RatingRow | null> {
  return db.findOne<RatingRow>(
    'ratings',
    (r) => r.transaction_id === transactionId && r.reviewer_id === reviewerId,
  );
}
