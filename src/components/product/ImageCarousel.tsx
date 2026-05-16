import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

interface Props {
  images: { id: string; image_url: string }[];
}

export function ImageCarousel({ images }: Props): React.ReactElement {
  const [index, setIndex] = useState(0);
  const width = Dimensions.get('window').width;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    setIndex(Math.round(x / width));
  };

  if (!images.length) {
    return <View style={[styles.placeholder, { width: '100%', aspectRatio: 1 }]} />;
  }

  return (
    <View>
      <FlatList
        data={images}
        keyExtractor={(it) => it.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <Image source={{ uri: item.image_url }} style={[styles.image, { width }]} />
        )}
      />
      {images.length > 1 ? (
        <View style={styles.dotsRow}>
          {images.map((_, i) => (
            <View key={i} style={[styles.dot, i === index ? styles.dotActive : null]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  image: { aspectRatio: 1, backgroundColor: colors.surfaceAlt },
  placeholder: { backgroundColor: colors.surfaceAlt },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 16 },
});
