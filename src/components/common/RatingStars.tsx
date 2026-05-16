import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/colors';
import { fontSizes, fontWeights, spacing } from '@/constants/spacing';

interface Props {
  value: number;
  size?: number;
  count?: number | null;
  showValue?: boolean;
}

export function RatingStars({ value, size = 14, count, showValue = true }: Props): React.ReactElement {
  return (
    <View style={styles.wrap}>
      <Ionicons name="star" size={size} color="#F59E0B" />
      {showValue ? (
        <Text style={styles.value}>{value > 0 ? value.toFixed(1) : '-'}</Text>
      ) : null}
      {count != null ? <Text style={styles.count}>({count})</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  value: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textPrimary },
  count: { fontSize: fontSizes.xs, color: colors.textSecondary },
});
