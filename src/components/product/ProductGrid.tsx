import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View, type ListRenderItem } from 'react-native';

import { spacing } from '@/constants/spacing';
import type { ProductFeedItem } from '@/types/domain';

import { ProductCard } from './ProductCard';

interface Props {
  data: ProductFeedItem[];
  onPressItem?: (item: ProductFeedItem) => void;
  onToggleFavorite?: (item: ProductFeedItem) => void;
  isFavorite?: (item: ProductFeedItem) => boolean;
  ListHeaderComponent?: React.ReactElement | null;
  ListEmptyComponent?: React.ReactElement | null;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function ProductGrid({
  data,
  onPressItem,
  onToggleFavorite,
  isFavorite,
  ListHeaderComponent,
  ListEmptyComponent,
  refreshing,
  onRefresh,
}: Props): React.ReactElement {
  const renderItem: ListRenderItem<ProductFeedItem> = ({ item, index }) => (
    <View style={[styles.cell, index % 2 === 0 ? styles.cellLeft : styles.cellRight]}>
      <ProductCard
        item={item}
        onPress={() => onPressItem?.(item)}
        onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(item) : undefined}
        isFavorite={isFavorite?.(item)}
      />
    </View>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(it) => it.id}
      numColumns={2}
      renderItem={renderItem}
      contentContainerStyle={styles.content}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={
        onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xxxl, gap: spacing.md },
  cell: { flex: 1, marginBottom: spacing.md },
  cellLeft: { marginRight: spacing.sm },
  cellRight: { marginLeft: spacing.sm },
});
