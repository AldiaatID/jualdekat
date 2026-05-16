import { create } from 'zustand';

import { DEFAULT_RADIUS_KM } from '@/constants/radius';

interface LocationState {
  coords: { latitude: number; longitude: number } | null;
  permission: 'granted' | 'denied' | 'unknown';
  radiusKm: number;
  setCoords: (c: { latitude: number; longitude: number } | null) => void;
  setPermission: (p: 'granted' | 'denied' | 'unknown') => void;
  setRadiusKm: (r: number) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  coords: null,
  permission: 'unknown',
  radiusKm: DEFAULT_RADIUS_KM,
  setCoords: (coords) => set({ coords }),
  setPermission: (permission) => set({ permission }),
  setRadiusKm: (radiusKm) => set({ radiusKm }),
}));
