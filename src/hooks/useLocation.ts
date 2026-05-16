import { useCallback } from 'react';

import { getCurrentCoords, requestPermission, getStatus } from '@/services/locationService';
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

  const refresh = useCallback(async () => {
    const status = await getStatus();
    setPermission(status === 'granted' ? 'granted' : status);
    if (status !== 'granted') return null;
    const c = await getCurrentCoords();
    if (c) {
      setCoords(c);
      const userId = useAuthStore.getState().user?.id;
      if (userId) {
        try {
          await updateMyLocation(userId, c.latitude, c.longitude);
          await refreshProfile();
        } catch {
          // ignore
        }
      }
    }
    return c;
  }, [refreshProfile, setCoords, setPermission]);

  const request = useCallback(async () => {
    const status = await requestPermission();
    setPermission(status);
    if (status === 'granted') return refresh();
    return null;
  }, [refresh, setPermission]);

  return { coords, permission, radiusKm, setRadiusKm, refresh, request };
}
