import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ErrorView } from '@/components/common/ErrorView';
import { LoadingView } from '@/components/common/LoadingView';
import { SafetyNote } from '@/components/common/SafetyNote';
import { ImageCarousel } from '@/components/product/ImageCarousel';
import { SellerCard } from '@/components/profile/SellerCard';
import { colors } from '@/constants/colors';
import { fontSizes, fontWeights, spacing } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { getOrCreateConversation } from '@/services/chatService';
import { addFavorite, isFavorited, removeFavorite } from '@/services/favoriteService';
import {
  deleteProduct,
  getProductDetail,
  setProductStatus,
} from '@/services/productService';
import { isSupabaseConfigured } from '@/services/supabase';
import type { ProductFeedItem } from '@/types/domain';
import { formatDistance } from '@/utils/distance';
import { formatCurrency } from '@/utils/formatCurrency';

interface Props {
  productId: string;
  onClose: () => void;
  onOpenChat: (conversationId: string, productName: string, peerName: string) => void;
  onEdit?: (productId: string) => void;
  onMarkSold: (productId: string) => void;
  onReport: (params: { productId?: string; reportedUserId?: string }) => void;
  onOpenSeller: (sellerId: string) => void;
}

export function ProductDetailScreen({
  productId,
  onClose,
  onOpenChat,
  onMarkSold,
  onReport,
  onOpenSeller,
}: Props): React.ReactElement {
  const { user } = useAuth();
  const { coords } = useLocation();
  const [item, setItem] = useState<ProductFeedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!isSupabaseConfigured) { setItem(null); return; }
      const detail = await getProductDetail(productId, coords);
      setItem(detail);
      if (user && detail) setFav(await isFavorited(user.id, detail.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat detail.');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, [productId]);

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={load} />;
  if (!item) return <ErrorView message="Produk tidak ditemukan." onRetry={onClose} />;

  const isOwner = user?.id === item.user_id;
  const isSold = item.status === 'terjual';

  const toggleFav = async () => {
    if (!user) return;
    const next = !fav;
    setFav(next);
    try {
      if (next) await addFavorite(user.id, item.id);
      else await removeFavorite(user.id, item.id);
    } catch {
      setFav(!next);
    }
  };

  const startChat = async () => {
    if (!user) return;
    if (isSold) {
      Alert.alert('Produk sudah terjual', 'Cari produk lain yang masih tersedia.');
      return;
    }
    setBusy(true);
    try {
      const conv = await getOrCreateConversation({
        productId: item.id,
        buyerId: user.id,
        sellerId: item.user_id,
      });
      onOpenChat(conv.id, item.name, item.seller.full_name);
    } catch (e) {
      Alert.alert('Gagal membuka chat', e instanceof Error ? e.message : 'Coba lagi.');
    } finally { setBusy(false); }
  };

  const remove = async () => {
    Alert.alert('Hapus produk?', 'Produk dan fotonya akan dihapus permanen.', [
      { text: 'Batal' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(item.id);
            onClose();
          } catch (e) {
            Alert.alert('Gagal hapus', e instanceof Error ? e.message : 'Coba lagi.');
          }
        },
      },
    ]);
  };

  const setStatus = async (status: 'tersedia' | 'proses') => {
    try {
      await setProductStatus(item.id, status);
      await load();
    } catch (e) {
      Alert.alert('Gagal update status', e instanceof Error ? e.message : 'Coba lagi.');
    }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
      <ImageCarousel images={item.images} />

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{item.name}</Text>
          {isSold ? <Badge label="TERJUAL" tone="danger" /> : item.status === 'proses' ? <Badge label="Proses" tone="warning" /> : null}
        </View>
        <Text style={styles.price}>{formatCurrency(item.price)}</Text>
        <View style={styles.metaRow}>
          <Badge label={item.condition === 'baru' ? 'Baru' : 'Bekas'} tone="primary" />
          <Text style={styles.meta}>{item.area}</Text>
          {item.distance_km != null ? <Text style={styles.meta}>· {formatDistance(item.distance_km)}</Text> : null}
        </View>

        {item.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deskripsi</Text>
            <Text style={styles.desc}>{item.description}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metode transaksi</Text>
          <Text style={styles.desc}>
            {item.transaction_methods.map((m) => (m === 'kirim_lokal' ? 'Kirim lokal' : m)).join(' · ')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Penjual</Text>
          <SellerCard
            name={item.seller.full_name}
            avatarUrl={item.seller.avatar_url}
            ratingAverage={item.seller.rating_average}
            ratingCount={item.seller.rating_count}
            area={item.area}
            onPress={() => onOpenSeller(item.user_id)}
          />
        </View>

        <SafetyNote />

        <View style={styles.actions}>
          {isOwner ? (
            <>
              {!isSold ? (
                <>
                  <Button title="Tandai Terjual" onPress={() => onMarkSold(item.id)} fullWidth />
                  {item.status !== 'proses' ? (
                    <Button title="Tandai Proses" variant="secondary" onPress={() => setStatus('proses')} fullWidth />
                  ) : (
                    <Button title="Tandai Tersedia" variant="secondary" onPress={() => setStatus('tersedia')} fullWidth />
                  )}
                </>
              ) : null}
              <Button title="Hapus produk" variant="danger" onPress={remove} fullWidth />
            </>
          ) : (
            <>
              <Button
                title={isSold ? 'Produk Terjual' : 'Chat Penjual'}
                onPress={startChat}
                loading={busy}
                disabled={isSold}
                fullWidth
                leftIcon={<Ionicons name="chatbubble-outline" size={16} color="#fff" />}
              />
              <Button
                title={fav ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
                variant="secondary"
                onPress={toggleFav}
                fullWidth
                leftIcon={<Ionicons name={fav ? 'heart' : 'heart-outline'} size={16} color={colors.textPrimary} />}
              />
              <Button
                title="Laporkan produk"
                variant="ghost"
                onPress={() => onReport({ productId: item.id, reportedUserId: item.user_id })}
                fullWidth
              />
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.lg, gap: spacing.md },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  name: { fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.textPrimary, flex: 1 },
  price: { fontSize: fontSizes.xxl, fontWeight: fontWeights.bold, color: colors.primary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  meta: { color: colors.textSecondary, fontSize: fontSizes.sm },
  section: { gap: spacing.xs, marginTop: spacing.md },
  sectionTitle: { fontWeight: fontWeights.semibold, color: colors.textPrimary, fontSize: fontSizes.md },
  desc: { color: colors.textSecondary, fontSize: fontSizes.md, lineHeight: 22 },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
});
