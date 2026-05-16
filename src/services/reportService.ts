import { supabase } from '@/services/supabase';
import type { ReportReason, ReportRow } from '@/types/db';

export interface ReportInput {
  reporter_id: string;
  reported_user_id?: string | null;
  product_id?: string | null;
  reason: ReportReason;
  description?: string | null;
}

export async function submitReport(input: ReportInput): Promise<ReportRow> {
  const { data, error } = await supabase
    .from('reports')
    .insert(input as never)
    .select('*')
    .single();
  if (error) throw error;
  return data as ReportRow;
}
