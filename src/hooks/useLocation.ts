import { useCallback } from 'react';

import {
  getCurrentCoords,
  getDemoFallback,
  getStatus,
  requestPermission,
} from '@/services/locationService';
import { updateMyLocation } from '@/services/profileService';
import { useAuthStore } from '@/stores/authStore';
import { useLocationStore } from '@/stores/locationStore';

export function useLocation() {
  const coords = useLocationStore((s) => s.coords);
  const permission = useLocationStore((s) => s.permission);
  const radiusKm = useLocationStore((s) => s.radiusKm);
  const setCoords = useLocationStore((s) => s.setCoords);
  const setPermission = useLocationStore((s) => s.setPermission);
  const setRadiusKm = useLocationStore((s) => s.setRadiusKm);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);

  const persistCoords = useCallback(
    async (c: { latitude: number; longitude: number }) => {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) return;
      try {
        await updateMyLocation(userId, c.latitude, c.longitude);
        await refreshProfile();
      } catch {
        // ignore
      }
    },
    [refreshProfile],
  );

  const refresh = useCallback(async () => {
    const status = await getStatus();
    setPermission(status === 'granted' ? 'granted' : status);
    const c = await getCurrentCoords();
    if (c) {
      setCoords(c);
      await persistCoords(c);
      return c;
    }
    return null;
  }, [persistCoords, setCoords, setPermission]);

  const request = useCallback(async () => {
    const status = await requestPermission();
    setPermission(status);
    if (status === 'granted') {
      const c = await getCurrentCoords();
      if (c) {
        setCoords(c);
        await persistCoords(c);
        return c;
      }
    }
    // fallback: gunakan koordinat demo supaya pengguna web tetap bisa lanjut
    const fallback = getDemoFallback();
    setCoords(fallback);
    await persistCoords(fallback);
    return fallback;
  }, [persistCoords, setCoords, setPermission]);

  /**
   * Skip permission flow entirely and use the demo fallback.
   * Lets users without location access still browse the demo feed.
   */
  const setDemoLocation = useCallback(async () => {
    const fallback = getDemoFallback();
    setCoords(fallback);
    setPermission('denied');
    await persistCoords(fallback);
    return fallback;
  }, [persistCoords, setCoords, setPermission]);

  return { coords, permission, radiusKm, setRadiusKm, refresh, request, setDemoLocation };
}
