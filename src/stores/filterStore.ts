import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { DEFAULT_RADIUS_KM } from '@/constants/radius';
import type { FilterState } from '@/types/domain';

const KEY_LAST_KEYWORD = '@jualdekat:last_keyword';

interface FilterStore {
  filter: FilterState;
  setFilter: (patch: Partial<FilterState>) => void;
  resetFilter: () => void;
  loadLastKeyword: () => Promise<void>;
  saveLastKeyword: (keyword: string) => Promise<void>;
}

const initial: FilterState = {
  keyword: '',
  categoryId: null,
  priceMin: null,
  priceMax: null,
  condition: 'all',
  radiusKm: DEFAULT_RADIUS_KM,
};

export const useFilterStore = create<FilterStore>((set) => ({
  filter: initial,
  setFilter: (patch) => set((s) => ({ filter: { ...s.filter, ...patch } })),
  resetFilter: () => set({ filter: initial }),
  loadLastKeyword: async () => {
    try {
      const k = await AsyncStorage.getItem(KEY_LAST_KEYWORD);
      if (k) set((s) => ({ filter: { ...s.filter, keyword: k } }));
    } catch {
      // ignore
    }
  },
  saveLastKeyword: async (keyword) => {
    try {
      await AsyncStorage.setItem(KEY_LAST_KEYWORD, keyword);
    } catch {
      // ignore
    }
  },
}));
