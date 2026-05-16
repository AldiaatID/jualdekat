import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { RatingStars } from '@/components/common/RatingStars';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ErrorView } from '@/components/common/ErrorView';
import { LoadingView } from '@/components/common/LoadingView';
import { colors } from '@/constants/colors';
import { fontSizes, fontWeights, spacing } from '@/constants/spacing';
import { listProductsByUser } from '@/services/productService';
import { getUserProfile } from '@/services/profileService';
import type { ProfileRow } from '@/types/db';
import type { ProductFeedItem } from '@/types/domain';

interface Props {
  userId: string;
  onPressProduct: (item: ProductFeedItem) => void;
  onReport: (params: { reportedUserId: string }) => void;
}

export function UserProfileScreen({ userId, onPressProduct, onReport }: Props): React.ReactElement {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [products, setProducts] = useState<ProductFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null); setLoading(true);
    try {
      const [p, items] = await Promise.all([
        getUserProfile(userId),
        listProductsByUser(userId, ['tersedia', 'proses']),
      ]);
      setProfile(p); setProducts(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat profil.');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, [userId]);

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={load} />;
  if (!profile) return <ErrorView message="Profil tidak ditemukan." />;

  return (
    <ScrollView style={styles.flex} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
      <View style={styles.header}>
        <Avatar uri={profile.avatar_url} name={profile.full_name} size={72} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{profile.full_name}</Text>
          <Text style={styles.area}>{[profile.area, profile.city].filter(Boolean).join(', ')}</Text>
          <RatingStars value={profile.rating_average} count={profile.rating_count} />
        </View>
      </View>
      <View style={styles.action}>
        <Button title="Laporkan pengguna" variant="ghost" onPress={() => onReport({ reportedUserId: userId })} />
      </View>
      <Text style={styles.sectionTitle}>Produk</Text>
      <ProductGrid data={products} onPressItem={onPressProduct} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', padding: spacing.lg },
  name: { fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.textPrimary },
  area: { color: colors.textSecondary, fontSize: fontSizes.sm, marginTop: 2 },
  action: { paddingHorizontal: spacing.lg },
  sectionTitle: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, fontWeight: fontWeights.semibold, color: colors.textPrimary, fontSize: fontSizes.md },
});
