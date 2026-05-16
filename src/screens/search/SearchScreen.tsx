import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/common/Button';
import { Chip } from '@/components/common/Chip';
import { EmptyState } from '@/components/common/EmptyState';
import { Input } from '@/components/common/Input';
import { LoadingView } from '@/components/common/LoadingView';
import { ProductGrid } from '@/components/product/ProductGrid';
import { colors } from '@/constants/colors';
import { RADIUS_OPTIONS_KM } from '@/constants/radius';
import { fontSizes, fontWeights, spacing } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { fetchFeed, listCategories } from '@/services/productService';
import { useFilterStore } from '@/stores/filterStore';
import type { CategoryRow } from '@/types/db';
import type { ProductFeedItem } from '@/types/domain';
import { parseCurrencyInput, formatCurrency } from '@/utils/formatCurrency';

interface Props {
  onPressProduct: (item: ProductFeedItem) => void;
}

export function SearchScreen({ onPressProduct }: Props): React.ReactElement {
  const { profile } = useAuth();
  const { coords, radiusKm, setRadiusKm } = useLocation();
  const filter = useFilterStore((s) => s.filter);
  const setFilter = useFilterStore((s) => s.setFilter);
  const loadLast = useFilterStore((s) => s.loadLastKeyword);
  const saveLast = useFilterStore((s) => s.saveLastKeyword);

  const [keyword, setKeyword] = useState(filter.keyword);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [items, setItems] = useState<ProductFeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { void loadLast(); }, [loadLast]);
  useEffect(() => {
    void (async () => {
      try {
        setCategories(await listCategories());
      } catch { /* ignore */ }
    })();
  }, []);

  const center = useMemo(() => {
    if (coords) return coords;
    if (profile?.latitude != null && profile.longitude != null) {
      return { latitude: profile.latitude, longitude: profile.longitude };
    }
    return null;
  }, [coords, profile]);

  const runSearch = async (overrideKeyword?: string) => {
    setLoading(true);
    try {
      const data = await fetchFeed({
        center,
        radiusKm: filter.radiusKm,
        keyword: overrideKeyword ?? keyword,
        categoryId: filter.categoryId,
        priceMin: filter.priceMin,
        priceMax: filter.priceMax,
        condition: filter.condition,
      });
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setRadiusKm(filter.radiusKm); }, [filter.radiusKm, setRadiusKm]);
  useEffect(() => { void runSearch(filter.keyword); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const onChangeKeyword = (text: string) => {
    setKeyword(text);
    setFilter({ keyword: text });
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      void saveLast(text);
      void runSearch(text);
    }, 350);
  };

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Input
          placeholder="Cari produk..."
          value={keyword}
          onChangeText={onChangeKeyword}
          autoCapitalize="none"
          containerStyle={{ flex: 1 }}
        />
        <Button
          title={showFilter ? 'Tutup' : 'Filter'}
          variant="secondary"
          onPress={() => setShowFilter((v) => !v)}
          leftIcon={<Ionicons name="options-outline" size={16} />}
        />
      </View>

      {showFilter ? (
        <ScrollView style={styles.filterPanel} contentContainerStyle={{ gap: spacing.md, padding: spacing.lg }}>
          <Text style={styles.filterTitle}>Kategori</Text>
          <View style={styles.chipRow}>
            <Chip label="Semua" selected={!filter.categoryId} onPress={() => setFilter({ categoryId: null })} />
            {categories.map((c) => (
              <Chip key={c.id} label={c.name} selected={filter.categoryId === c.id} onPress={() => setFilter({ categoryId: c.id })} />
            ))}
          </View>
          <Text style={styles.filterTitle}>Kondisi</Text>
          <View style={styles.chipRow}>
            <Chip label="Semua" selected={filter.condition === 'all'} onPress={() => setFilter({ condition: 'all' })} />
            <Chip label="Baru" selected={filter.condition === 'baru'} onPress={() => setFilter({ condition: 'baru' })} />
            <Chip label="Bekas" selected={filter.condition === 'bekas'} onPress={() => setFilter({ condition: 'bekas' })} />
          </View>
          <Text style={styles.filterTitle}>Radius</Text>
          <View style={styles.chipRow}>
            {RADIUS_OPTIONS_KM.map((r) => (
              <Chip key={r} label={`${r} km`} selected={filter.radiusKm === r} onPress={() => setFilter({ radiusKm: r })} />
            ))}
          </View>
          <Text style={styles.filterTitle}>Harga</Text>
          <View style={styles.priceRow}>
            <Input
              label="Minimum"
              keyboardType="numeric"
              value={filter.priceMin ? formatCurrency(filter.priceMin) : ''}
              onChangeText={(t) => setFilter({ priceMin: parseCurrencyInput(t) || null })}
              containerStyle={{ flex: 1 }}
            />
            <Input
              label="Maksimum"
              keyboardType="numeric"
              value={filter.priceMax ? formatCurrency(filter.priceMax) : ''}
              onChangeText={(t) => setFilter({ priceMax: parseCurrencyInput(t) || null })}
              containerStyle={{ flex: 1 }}
            />
          </View>
          <Button title="Terapkan" onPress={() => { setShowFilter(false); void runSearch(); }} />
        </ScrollView>
      ) : null}

      {loading ? (
        <LoadingView />
      ) : (
        <ProductGrid
          data={items}
          onPressItem={onPressProduct}
          ListEmptyComponent={
            <EmptyState
              title="Tidak ada hasil"
              description="Coba kata kunci lain atau ubah filter."
              icon={<Ionicons name="search-outline" size={32} color={colors.textTertiary} />}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  filterPanel: {
    maxHeight: 460,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterTitle: { fontWeight: fontWeights.semibold, color: colors.textPrimary, fontSize: fontSizes.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  priceRow: { flexDirection: 'row', gap: spacing.md },
});
