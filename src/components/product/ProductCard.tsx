import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Badge } from '@/components/common/Badge';
import { colors } from '@/constants/colors';
import { fontSizes, fontWeights, radii, spacing } from '@/constants/spacing';
import type { ProductFeedItem } from '@/types/domain';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatRelativeId } from '@/utils/formatDate';
import { formatDistance } from '@/utils/distance';

interface Props {
  item: ProductFeedItem;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

export function ProductCard({ item, onPress, onToggleFavorite, isFavorite }: Props): React.ReactElement {
  const isSold = item.status === 'terjual';
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        {item.primary_image_url ? (
          <Image source={{ uri: item.primary_image_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={28} color={colors.textTertiary} />
          </View>
        )}
        {isSold ? (
          <View style={styles.soldOverlay}>
            <Text style={styles.soldText}>TERJUAL</Text>
          </View>
        ) : null}
        {onToggleFavorite ? (
          <Pressable style={styles.heart} onPress={onToggleFavorite} hitSlop={10}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? colors.danger : colors.textPrimary}
            />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.price}>{formatCurrency(item.price)}</Text>
        <View style={styles.row}>
          <Badge label={item.condition === 'baru' ? 'Baru' : 'Bekas'} tone="primary" />
          <Text style={styles.area} numberOfLines={1}>
            {item.area}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.meta}>
            {item.distance_km != null ? formatDistance(item.distance_km) : '-'}
          </Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.meta}>{formatRelativeId(item.created_at)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceAlt,
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  soldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldText: { color: '#fff', fontWeight: fontWeights.bold, letterSpacing: 1 },
  heart: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: '#fff',
    borderRadius: 999,
    padding: spacing.xs + 2,
  },
  body: { padding: spacing.sm, gap: spacing.xs },
  name: { fontSize: fontSizes.sm, color: colors.textPrimary, fontWeight: fontWeights.medium, lineHeight: 18 },
  price: { fontSize: fontSizes.md, color: colors.textPrimary, fontWeight: fontWeights.bold },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  area: { fontSize: fontSizes.xs, color: colors.textSecondary, flex: 1 },
  meta: { fontSize: fontSizes.xs, color: colors.textTertiary },
  metaDot: { fontSize: fontSizes.xs, color: colors.textTertiary, marginHorizontal: 2 },
});
