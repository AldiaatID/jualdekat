import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorView } from '@/components/common/ErrorView';
import { LoadingView } from '@/components/common/LoadingView';
import { colors } from '@/constants/colors';
import { fontSizes, fontWeights, radii, spacing } from '@/constants/spacing';
import { listMyConversations } from '@/services/chatService';
import { useAuth } from '@/hooks/useAuth';
import { completeSale } from '@/services/transactionService';
import { isSupabaseConfigured } from '@/services/supabase';
import type { ConversationListItem } from '@/types/domain';

interface Props {
  productId: string;
  onClose: () => void;
}

export function MarkAsSoldScreen({ productId, onClose }: Props): React.ReactElement {
  const { user } = useAuth();
  const [items, setItems] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!user) return;
    setError(null); setLoading(true);
    try {
      if (!isSupabaseConfigured) { setItems([]); return; }
      const all = await listMyConversations(user.id);
      setItems(all.filter((c) => c.product_id === productId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat percakapan.');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, [productId, user]);

  const submit = async () => {
    if (!user || !selected) return;
    setSubmitting(true);
    try {
      await completeSale({ productId, sellerId: user.id, buyerId: selected });
      Alert.alert('Sukses', 'Produk ditandai terjual.');
      onClose();
    } catch (e) {
      Alert.alert('Gagal', e instanceof Error ? e.message : 'Coba lagi.');
    } finally { setSubmitting(false); }
  };

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  return (
    <View style={styles.flex}>
      <Text style={styles.title}>Pilih pembeli</Text>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelected(item.peer_id)}
            style={[styles.row, selected === item.peer_id && styles.rowSelected]}
          >
            <Avatar uri={item.peer_avatar} name={item.peer_name} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.peer_name}</Text>
              <Text style={styles.preview} numberOfLines={1}>
                {item.last_message_preview ?? 'Belum ada pesan'}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Belum ada percakapan"
            description="Tunggu pembeli chat tentang produk ini sebelum menandai terjual."
          />
        }
      />
      <View style={styles.footer}>
        <Button
          title="Tandai Terjual"
          onPress={submit}
          loading={submitting}
          disabled={!selected}
          fullWidth
        />
        <Button title="Batal" variant="ghost" onPress={onClose} fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color: colors.textPrimary, padding: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  rowSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  name: { fontWeight: fontWeights.semibold, color: colors.textPrimary },
  preview: { color: colors.textSecondary, fontSize: fontSizes.xs },
  footer: { padding: spacing.lg, gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.divider },
});
