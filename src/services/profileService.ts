import { supabase } from '@/services/supabase';
import type { ProfileRow } from '@/types/db';

export async function getMyProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as ProfileRow | null) ?? null;
}

export async function getUserProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as ProfileRow | null) ?? null;
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
  const { data, error } = await supabase
    .from('profiles')
    .upsert(input as never, { onConflict: 'id' })
    .select('*')
    .single();
  if (error) throw error;
  return data as ProfileRow;
}

export async function updateMyLocation(
  userId: string,
  latitude: number,
  longitude: number,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ latitude, longitude } as never)
    .eq('id', userId);
  if (error) throw error;
}
