import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ConversationItem } from '@/components/chat/ConversationItem';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorView } from '@/components/common/ErrorView';
import { LoadingView } from '@/components/common/LoadingView';
import { colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { listMyConversations } from '@/services/chatService';
import { isSupabaseConfigured } from '@/services/supabase';
import type { ConversationListItem } from '@/types/domain';

interface Props {
  onOpenChat: (conversationId: string, productName: string, peerName: string) => void;
}

export function ChatListScreen({ onOpenChat }: Props): React.ReactElement {
  const { user } = useAuth();
  const [items, setItems] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      if (!isSupabaseConfigured) { setItems([]); return; }
      setItems(await listMyConversations(user.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat chat.');
    }
  }, [user]);

  useEffect(() => { void (async () => { setLoading(true); await load(); setLoading(false); })(); }, [load]);

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  return (
    <View style={styles.flex}>
      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => (
          <ConversationItem
            item={item}
            onPress={() => onOpenChat(item.id, item.product_name, item.peer_name)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={async () => {
            setRefreshing(true); await load(); setRefreshing(false);
          }} />
        }
        ListEmptyComponent={
          <EmptyState
            title="Belum ada percakapan"
            description="Mulai chat dari halaman detail produk untuk bertanya ke penjual."
            icon={<Ionicons name="chatbubbles-outline" size={32} color={colors.textTertiary} />}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1, backgroundColor: colors.background } });
