import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/common/Avatar';
import { RatingStars } from '@/components/common/RatingStars';
import { colors } from '@/constants/colors';
import { fontSizes, fontWeights, radii, spacing } from '@/constants/spacing';

interface Props {
  name: string;
  avatarUrl?: string | null;
  ratingAverage: number;
  ratingCount: number;
  area?: string | null;
  onPress?: () => void;
}

export function SellerCard({
  name,
  avatarUrl,
  ratingAverage,
  ratingCount,
  area,
  onPress,
}: Props): React.ReactElement {
  return (
    <Pressable style={styles.wrap} onPress={onPress}>
      <Avatar uri={avatarUrl} name={name} size={44} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.row}>
          <RatingStars value={ratingAverage} count={ratingCount} />
          {area ? <Text style={styles.area} numberOfLines={1}>· {area}</Text> : null}
        </View>
      </View>
      <Text style={styles.cta}>Lihat</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontSize: fontSizes.md, fontWeight: fontWeights.semibold, color: colors.textPrimary },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 2 },
  area: { fontSize: fontSizes.xs, color: colors.textSecondary, flex: 1 },
  cta: { color: colors.primary, fontWeight: fontWeights.semibold },
});
