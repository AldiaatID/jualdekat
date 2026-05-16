import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { MessageBubble } from '@/components/chat/MessageBubble';
import { ErrorView } from '@/components/common/ErrorView';
import { LoadingView } from '@/components/common/LoadingView';
import { SafetyNote } from '@/components/common/SafetyNote';
import { colors } from '@/constants/colors';
import { fontSizes, fontWeights, radii, spacing } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { fetchMessages, sendMessage, subscribeMessages } from '@/services/chatService';
import type { MessageRow } from '@/types/db';

interface Props {
  conversationId: string;
  productName: string;
  peerName: string;
}

export function ChatRoomScreen({ conversationId, productName, peerName }: Props): React.ReactElement {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<MessageRow>>(null);

  const load = async () => {
    setError(null); setLoading(true);
    try {
      setMessages(await fetchMessages(conversationId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat pesan.');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line */ }, [conversationId]);

  useEffect(() => {
    const unsub = subscribeMessages(conversationId, (m) => {
      setMessages((cur) => (cur.some((x) => x.id === m.id) ? cur : [...cur, m]));
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    });
    return unsub;
  }, [conversationId]);

  const send = async () => {
    if (!user || !text.trim()) return;
    setSending(true);
    try {
      const msg = await sendMessage({ conversationId, senderId: user.id, body: text.trim() });
      setMessages((cur) => (cur.some((x) => x.id === msg.id) ? cur : [...cur, msg]));
      setText('');
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengirim.');
    } finally { setSending(false); }
  };

  if (loading) return <LoadingView />;
  if (error && !messages.length) return <ErrorView message={error} onRetry={load} />;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.peer}>{peerName}</Text>
        <Text style={styles.product} numberOfLines={1}>tentang: {productName}</Text>
      </View>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <MessageBubble body={item.body} createdAt={item.created_at} mine={item.sender_id === user?.id} />
        )}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        ListHeaderComponent={
          <View style={styles.safety}>
            <SafetyNote />
          </View>
        }
      />
      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Tulis pesan..."
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          multiline
        />
        <Pressable
          onPress={send}
          disabled={sending || !text.trim()}
          style={[styles.send, (!text.trim() || sending) && { opacity: 0.5 }]}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.background,
  },
  peer: { fontWeight: fontWeights.semibold, color: colors.textPrimary, fontSize: fontSizes.md },
  product: { color: colors.textTertiary, fontSize: fontSizes.xs },
  listContent: { paddingVertical: spacing.md, gap: spacing.sm },
  safety: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    color: colors.textPrimary,
    maxHeight: 120,
    minHeight: 40,
  },
  send: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
