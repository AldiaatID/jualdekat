import { db } from '@/services/mock/db';
import type { ProfileRow } from '@/types/db';

export async function getMyProfile(userId: string): Promise<ProfileRow | null> {
  return db.findById<ProfileRow>('profiles', userId);
}

export async function getUserProfile(userId: string): Promise<ProfileRow | null> {
  return db.findById<ProfileRow>('profiles', userId);
}

export interface ProfileUpsertInput {
  id: string;
  full_name: string;
  city: string;
  area: string;
  avatar_url?: string | null;
  phone_number?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export async function upsertProfile(input: ProfileUpsertInput): Promise<ProfileRow> {
  const now = new Date().toISOString();
  const existing = await db.findById<ProfileRow>('profiles', input.id);
  const merged: ProfileRow = {
    id: input.id,
    full_name: input.full_name,
    avatar_url: input.avatar_url ?? existing?.avatar_url ?? null,
    phone_number: input.phone_number ?? existing?.phone_number ?? null,
    city: input.city,
    area: input.area,
    latitude: input.latitude ?? existing?.latitude ?? null,
    longitude: input.longitude ?? existing?.longitude ?? null,
    rating_average: existing?.rating_average ?? 0,
    rating_count: existing?.rating_count ?? 0,
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };
  return db.upsert('profiles', merged);
}

export async function updateMyLocation(
  userId: string,
  latitude: number,
  longitude: number,
): Promise<void> {
  const existing = await db.findById<ProfileRow>('profiles', userId);
  if (!existing) return;
  await db.update<ProfileRow>('profiles', userId, {
    latitude,
    longitude,
    updated_at: new Date().toISOString(),
  });
}
