import { db } from '@/services/mock/db';
import { uuid } from '@/services/mock/uuid';
import type { ReportReason, ReportRow } from '@/types/db';

export interface ReportInput {
  reporter_id: string;
  reported_user_id?: string | null;
  product_id?: string | null;
  reason: ReportReason;
  description?: string | null;
}

export async function submitReport(input: ReportInput): Promise<ReportRow> {
  const row: ReportRow = {
    id: uuid(),
    reporter_id: input.reporter_id,
    reported_user_id: input.reported_user_id ?? null,
    product_id: input.product_id ?? null,
    reason: input.reason,
    description: input.description ?? null,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  await db.insert('reports', row);
  return row;
}
