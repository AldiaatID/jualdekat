import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { RatingStars } from '@/components/common/RatingStars';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Chip } from '@/components/common/Chip';
import { colors } from '@/constants/colors';
import { fontSizes, fontWeights, radii, spacing } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { listMyTransactions } from '@/services/transactionService';
import { listProductsByUser } from '@/services/productService';
import { existingRatingFor, listRatingsForUser } from '@/services/ratingService';
import type { ProductFeedItem } from '@/types/domain';
import type { RatingRow, TransactionRow } from '@/types/db';
import { formatRelativeId, formatDate } from '@/utils/formatDate';

interface Props {
  onEdit: () => void;
  onSignOut: () => void;
  onPressProduct: (item: ProductFeedItem) => void;
  onOpenRating: (params: {
    transactionId: string;
    reviewedUserId: string;
    productId: string | null;
  }) => void;
}

type Tab = 'jualan' | 'terjual' | 'rating' | 'transaksi';

export function MyProfileScreen({
  onEdit,
  onSignOut,
  onPressProduct,
  onOpenRating,
}: Props): React.ReactElement {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<Tab>('jualan');
  const [products, setProducts] = useState<ProductFeedItem[]>([]);
  const [sold, setSold] = useState<ProductFeedItem[]>([]);
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [transactions, setTransactions] = useState<
    (TransactionRow & { product: { id: string; name: string } | null; alreadyRated: boolean })[]
  >([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [available, soldList, rats, txs] = await Promise.all([
        listProductsByUser(user.id, ['tersedia', 'proses']),
        listProductsByUser(user.id, ['terjual']),
        listRatingsForUser(user.id),
        listMyTransactions(user.id),
      ]);
      setProducts(available);
      setSold(soldList);
      setRatings(rats);
      const txsWithRated = await Promise.all(
        txs.map(async (t) => {
          const existing = await existingRatingFor(t.id, user.id).catch(() => null);
          return { ...t, alreadyRated: !!existing };
        }),
      );
      setTransactions(txsWithRated);
    } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  return (
    <ScrollView style={styles.flex} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
      <View style={styles.header}>
        <Avatar uri={profile?.avatar_url} name={profile?.full_name} size={72} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{profile?.full_name ?? 'Pengguna'}</Text>
          <Text style={styles.area}>
            {[profile?.area, profile?.city].filter(Boolean).join(', ') || 'Lokasi belum diisi'}
          </Text>
          <RatingStars value={profile?.rating_average ?? 0} count={profile?.rating_count ?? 0} />
        </View>
      </View>
      <View style={styles.actions}>
        <Button title="Edit Profil" variant="secondary" onPress={onEdit} />
        <Button title="Keluar" variant="ghost" onPress={onSignOut} />
      </View>

      <View style={styles.tabRow}>
        {(['jualan', 'terjual', 'rating', 'transaksi'] as Tab[]).map((t) => (
          <Chip key={t} label={tabLabel(t)} selected={tab === t} onPress={() => setTab(t)} />
        ))}
      </View>

      {tab === 'jualan' ? (
        <ProductGrid data={products} onPressItem={onPressProduct} ListEmptyComponent={<Empty title="Belum ada produk dijual" />} />
      ) : tab === 'terjual' ? (
        <ProductGrid data={sold} onPressItem={onPressProduct} ListEmptyComponent={<Empty title="Belum ada produk terjual" />} />
      ) : tab === 'rating' ? (
        <View style={styles.list}>
          {ratings.length === 0 ? (
            <Empty title="Belum ada rating diterima" />
          ) : (
            ratings.map((r) => (
              <View key={r.id} style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <RatingStars value={r.rating} showValue={false} />
                  <Text style={styles.muted}>{formatRelativeId(r.created_at)}</Text>
                </View>
                {r.comment ? <Text style={styles.cardBody}>{r.comment}</Text> : null}
              </View>
            ))
          )}
        </View>
      ) : (
        <View style={styles.list}>
          {transactions.length === 0 ? (
            <Empty title="Belum ada transaksi" />
          ) : (
            transactions.map((t) => {
              const isSeller = t.seller_id === user?.id;
              const peer = isSeller ? t.buyer_id : t.seller_id;
              return (
                <View key={t.id} style={styles.card}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {t.product?.name ?? 'Produk'}
                  </Text>
                  <Text style={styles.muted}>
                    {isSeller ? 'Sebagai penjual' : 'Sebagai pembeli'} · {t.status}
                    {t.completed_at ? ` · ${formatDate(t.completed_at)}` : ''}
                  </Text>
                  {!t.alreadyRated && t.status === 'completed' ? (
                    <Button
                      title={`Beri rating ke ${isSeller ? 'pembeli' : 'penjual'}`}
                      variant="secondary"
                      onPress={() =>
                        onOpenRating({ transactionId: t.id, reviewedUserId: peer, productId: t.product_id })
                      }
                    />
                  ) : t.alreadyRated ? (
                    <Text style={styles.muted}>Sudah dirating</Text>
                  ) : null}
                </View>
              );
            })
          )}
        </View>
      )}
      {loading ? <Text style={styles.muted}>Memuat...</Text> : null}
    </ScrollView>
  );
}

function tabLabel(t: Tab): string {
  if (t === 'jualan') return 'Dijual';
  if (t === 'terjual') return 'Terjual';
  if (t === 'rating') return 'Rating';
  return 'Transaksi';
}

function Empty({ title }: { title: string }): React.ReactElement {
  return (
    <View style={{ padding: spacing.xl, alignItems: 'center' }}>
      <Text style={{ color: colors.textSecondary }}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  name: { fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.textPrimary },
  area: { color: colors.textSecondary, fontSize: fontSizes.sm, marginTop: 2 },
  actions: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg },
  tabRow: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, flexWrap: 'wrap' },
  list: { padding: spacing.md, gap: spacing.sm },
  card: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  cardTitle: { fontWeight: fontWeights.semibold, color: colors.textPrimary, fontSize: fontSizes.md },
  cardBody: { color: colors.textSecondary, fontSize: fontSizes.sm },
  muted: { color: colors.textTertiary, fontSize: fontSizes.xs },
});
