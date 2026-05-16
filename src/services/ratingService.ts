import { supabase } from '@/services/supabase';
import type { RatingRow } from '@/types/db';

export interface RatingInput {
  transaction_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  product_id: string | null;
  rating: number;
  comment?: string | null;
}

export async function submitRating(input: RatingInput): Promise<RatingRow> {
  const { data, error } = await supabase
    .from('ratings')
    .insert(input as never)
    .select('*')
    .single();
  if (error) throw error;
  return data as RatingRow;
}

export async function listRatingsForUser(userId: string): Promise<RatingRow[]> {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('reviewed_user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as RatingRow[];
}

export async function existingRatingFor(
  transactionId: string,
  reviewerId: string,
): Promise<RatingRow | null> {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('transaction_id', transactionId)
    .eq('reviewer_id', reviewerId)
    .maybeSingle();
  if (error) throw error;
  return (data as RatingRow | null) ?? null;
}
