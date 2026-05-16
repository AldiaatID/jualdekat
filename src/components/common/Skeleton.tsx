import React from 'react';
import { StyleSheet, View, type DimensionValue, type ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';
import { radii } from '@/constants/spacing';

interface Props {
  height?: number;
  width?: DimensionValue;
  radius?: number;
  style?: ViewStyle;
}

export function Skeleton({ height = 16, width = '100%', radius = radii.sm, style }: Props): React.ReactElement {
  return (
    <View
      style={[
        { height, width, borderRadius: radius, backgroundColor: colors.surfaceAlt },
        styles.box,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  box: { opacity: 0.7 },
});
