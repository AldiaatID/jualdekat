import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fontSizes, radii, spacing } from '@/constants/spacing';
import { formatTime } from '@/utils/formatDate';

interface Props {
  body: string;
  createdAt: string;
  mine: boolean;
}

export function MessageBubble({ body, createdAt, mine }: Props): React.ReactElement {
  return (
    <View style={[styles.wrap, mine ? styles.right : styles.left]}>
      <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
        <Text style={[styles.text, mine && styles.textMine]}>{body}</Text>
      </View>
      <Text style={styles.time}>{formatTime(createdAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 2, paddingHorizontal: spacing.md, maxWidth: '85%' },
  left: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  right: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubble: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radii.lg },
  mine: { backgroundColor: colors.primary },
  theirs: { backgroundColor: colors.surfaceAlt },
  text: { fontSize: fontSizes.md, color: colors.textPrimary, lineHeight: 22 },
  textMine: { color: colors.textInverse },
  time: { fontSize: fontSizes.xs, color: colors.textTertiary, marginTop: 2 },
});
