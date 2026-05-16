import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { colors } from '@/constants/colors';
import { fontSizes, fontWeights, spacing } from '@/constants/spacing';
import type { ConversationListItem } from '@/types/domain';
import { formatRelativeId } from '@/utils/formatDate';

interface Props {
  item: ConversationListItem;
  onPress?: () => void;
}

export function ConversationItem({ item, onPress }: Props): React.ReactElement {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Avatar uri={item.peer_avatar} name={item.peer_name} size={48} />
      <View style={{ flex: 1 }}>
        <View style={styles.head}>
          <Text style={styles.name} numberOfLines={1}>
            {item.peer_name}
          </Text>
          <Text style={styles.time}>{formatRelativeId(item.last_message_at)}</Text>
        </View>
        <Text style={styles.product} numberOfLines={1}>
          tentang: {item.product_name}
        </Text>
        <View style={styles.bodyRow}>
          <Text style={styles.preview} numberOfLines={1}>
            {item.last_message_preview ?? 'Mulai percakapan...'}
          </Text>
          {item.product_status === 'terjual' ? <Badge label="Terjual" tone="danger" /> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  name: { fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.textPrimary, flex: 1 },
  time: { fontSize: fontSizes.xs, color: colors.textTertiary, marginLeft: spacing.sm },
  product: { fontSize: fontSizes.xs, color: colors.textTertiary, marginTop: 2 },
  bodyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
  preview: { fontSize: fontSizes.sm, color: colors.textSecondary, flex: 1 },
});
