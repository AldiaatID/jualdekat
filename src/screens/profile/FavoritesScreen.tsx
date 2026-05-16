import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '@/components/common/EmptyState';
import { ErrorView } from '@/components/common/ErrorView';
import { LoadingView } from '@/components/common/LoadingView';
import { ProductGrid } from '@/components/product/ProductGrid';
import { colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { listFavorites, removeFavorite } from '@/services/favoriteService';
import { isSupabaseConfigured } from '@/services/supabase';
import type { ProductFeedItem } from '@/types/domain';

interface Props {
  onPressProduct: (item: ProductFeedItem) => void;
}

export function FavoritesScreen({ onPressProduct }: Props): React.ReactElement {
  const { user } = useAuth();
  const [items, setItems] = useState<ProductFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setError(null); setLoading(true);
    try {
      if (!isSupabaseConfigured) { setItems([]); return; }
      setItems(await listFavorites(user.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat favorit.');
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  return (
    <View style={styles.flex}>
      <ProductGrid
        data={items}
        onPressItem={onPressProduct}
        isFavorite={() => true}
        onToggleFavorite={async (item) => {
          if (!user) return;
          setItems((prev) => prev.filter((p) => p.id !== item.id));
          try { await removeFavorite(user.id, item.id); } catch { void load(); }
        }}
        ListEmptyComponent={
          <EmptyState
            title="Belum ada favorit"
            description="Tap ikon hati pada produk untuk menyimpannya di sini."
            icon={<Ionicons name="heart-outline" size={32} color={colors.textTertiary} />}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1, backgroundColor: colors.background } });
