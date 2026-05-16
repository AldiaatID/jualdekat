import { create } from 'zustand';

import { initAuth, onAuthStateChange, mockSignOut, type MockSession, type MockUser } from '@/services/mock/auth';
import { ensureSeed } from '@/services/mock/seed';
import { getMyProfile } from '@/services/profileService';
import type { ProfileRow } from '@/types/db';

interface AuthState {
  initialized: boolean;
  session: MockSession | null;
  user: MockUser | null;
  profile: ProfileRow | null;
  init: () => Promise<void>;
  setSession: (session: MockSession | null) => Promise<void>;
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
    await ensureSeed();
    const session = await initAuth();
    await get().setSession(session);
    onAuthStateChange((s) => {
      void get().setSession(s);
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
    await mockSignOut();
    set({ session: null, user: null, profile: null });
  },
}));

export function isProfileComplete(p: ProfileRow | null): boolean {
  return Boolean(p && p.full_name && p.city && p.area);
}

export function hasLocation(p: ProfileRow | null): boolean {
  return Boolean(p && p.latitude != null && p.longitude != null);
}
