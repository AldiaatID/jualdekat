import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Chip } from '@/components/common/Chip';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorView } from '@/components/common/ErrorView';
import { LoadingView } from '@/components/common/LoadingView';
import { ProductGrid } from '@/components/product/ProductGrid';
import { colors } from '@/constants/colors';
import { RADIUS_OPTIONS_KM } from '@/constants/radius';
import { fontSizes, fontWeights, radii, spacing } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { addFavorite, listFavorites, removeFavorite } from '@/services/favoriteService';
import { fetchFeed, listCategories } from '@/services/productService';
import { isSupabaseConfigured } from '@/services/supabase';
import { useFilterStore } from '@/stores/filterStore';
import type { CategoryRow } from '@/types/db';
import type { ProductFeedItem } from '@/types/domain';

interface Props {
  onPressProduct: (item: ProductFeedItem) => void;
  onPressSearch: () => void;
}

export function HomeScreen({ onPressProduct, onPressSearch }: Props): React.ReactElement {
  const { user, profile } = useAuth();
  const { coords, radiusKm, setRadiusKm, refresh } = useLocation();
  const filter = useFilterStore((s) => s.filter);
  const setFilter = useFilterStore((s) => s.setFilter);

  const [items, setItems] = useState<ProductFeedItem[]>([]);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const center = useMemo(() => {
    if (coords) return coords;
    if (profile?.latitude != null && profile.longitude != null) {
      return { latitude: profile.latitude, longitude: profile.longitude };
    }
    return null;
  }, [coords, profile]);

  const load = useCallback(async () => {
    setError(null);
    try {
      if (!isSupabaseConfigured) {
        setItems([]);
        return;
      }
      const [feed, favs] = await Promise.all([
        fetchFeed({
          center,
          radiusKm,
          categoryId: filter.categoryId,
          condition: filter.condition,
        }),
        user ? listFavorites(user.id) : Promise.resolve([]),
      ]);
      setItems(feed);
      setFavIds(new Set(favs.map((f) => f.id)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Tidak bisa memuat produk.');
    }
  }, [center, filter.categoryId, filter.condition, radiusKm, user]);

  useEffect(() => {
    setLoading(true);
    void (async () => {
      try {
        if (isSupabaseConfigured) {
          const cats = await listCategories();
          setCategories(cats);
        }
      } catch {
        // ignore
      }
      await load();
      setLoading(false);
    })();
  }, [load]);

  useEffect(() => {
    if (!coords) void refresh();
  }, [coords, refresh]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onToggleFav = async (item: ProductFeedItem) => {
    if (!user) return;
    const has = favIds.has(item.id);
    const next = new Set(favIds);
    if (has) {
      next.delete(item.id);
      setFavIds(next);
      try { await removeFavorite(user.id, item.id); } catch { setFavIds(favIds); }
    } else {
      next.add(item.id);
      setFavIds(next);
      try { await addFavorite(user.id, item.id); } catch { setFavIds(favIds); }
    }
  };

  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Text style={styles.greet}>Halo, {profile?.full_name?.split(' ')[0] ?? 'Teman'} 👋</Text>
        <Text style={styles.area}>Sekitar {profile?.area ?? 'kamu'}</Text>
        <Pressable onPress={onPressSearch} style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <Text style={styles.searchPlaceholder}>Cari barang...</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Text style={styles.chipsTitle}>Radius:</Text>
        {RADIUS_OPTIONS_KM.map((r) => (
          <Chip
            key={r}
            label={`${r} km`}
            selected={radiusKm === r}
            onPress={() => setRadiusKm(r)}
          />
        ))}
      </ScrollView>

      {categories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          <Chip
            label="Semua"
            selected={!filter.categoryId}
            onPress={() => setFilter({ categoryId: null })}
          />
          {categories.map((c) => (
            <Chip
              key={c.id}
              label={c.name}
              selected={filter.categoryId === c.id}
              onPress={() => setFilter({ categoryId: c.id })}
            />
          ))}
        </ScrollView>
      ) : null}

      {loading ? (
        <LoadingView label="Memuat produk sekitar..." />
      ) : error ? (
        <ErrorView message={error} onRetry={load} />
      ) : (
        <ProductGrid
          data={items}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onPressItem={onPressProduct}
          onToggleFavorite={onToggleFav}
          isFavorite={(it) => favIds.has(it.id)}
          ListEmptyComponent={
            <EmptyState
              title="Belum ada barang di sekitarmu"
              description="Coba perluas radius pencarian."
              actionLabel={radiusKm < 20 ? `Naikkan radius ke ${nextRadius(radiusKm)} km` : undefined}
              onAction={radiusKm < 20 ? () => setRadiusKm(nextRadius(radiusKm)) : undefined}
              icon={<Ionicons name="map-outline" size={32} color={colors.textTertiary} />}
            />
          }
        />
      )}
    </View>
  );
}

function nextRadius(current: number): number {
  const idx = RADIUS_OPTIONS_KM.indexOf(current as never);
  if (idx < 0 || idx >= RADIUS_OPTIONS_KM.length - 1) return RADIUS_OPTIONS_KM[RADIUS_OPTIONS_KM.length - 1] as number;
  return RADIUS_OPTIONS_KM[idx + 1] as number;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.xs, backgroundColor: colors.background },
  greet: { fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.textPrimary },
  area: { color: colors.textSecondary, fontSize: fontSizes.sm },
  searchBar: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchPlaceholder: { color: colors.textTertiary, fontSize: fontSizes.md },
  chips: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingVertical: spacing.sm, alignItems: 'center' },
  chipsTitle: { fontSize: fontSizes.sm, color: colors.textSecondary, marginRight: spacing.xs },
});
