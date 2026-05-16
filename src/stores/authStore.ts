import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

import { supabase, isSupabaseConfigured } from '@/services/supabase';
import { getMyProfile } from '@/services/profileService';
import type { ProfileRow } from '@/types/db';

interface AuthState {
  initialized: boolean;
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  init: () => Promise<void>;
  setSession: (session: Session | null) => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  initialized: false,
  session: null,
  user: null,
  profile: null,
  init: async () => {
    if (get().initialized) return;
    if (!isSupabaseConfigured) {
      set({ initialized: true });
      return;
    }
    const { data } = await supabase.auth.getSession();
    await get().setSession(data.session);
    supabase.auth.onAuthStateChange((_event, session) => {
      void get().setSession(session);
    });
    set({ initialized: true });
  },
  setSession: async (session) => {
    set({ session, user: session?.user ?? null });
    if (session?.user) {
      try {
        const profile = await getMyProfile(session.user.id);
        set({ profile });
      } catch {
        set({ profile: null });
      }
    } else {
      set({ profile: null });
    }
  },
  refreshProfile: async () => {
    const u = get().user;
    if (!u) return;
    try {
      const profile = await getMyProfile(u.id);
      set({ profile });
    } catch {
      // ignore
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },
}));

export function isProfileComplete(p: ProfileRow | null): boolean {
  return Boolean(p && p.full_name && p.city && p.area);
}

export function hasLocation(p: ProfileRow | null): boolean {
  return Boolean(p && p.latitude != null && p.longitude != null);
}
