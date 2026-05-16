import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fontWeights } from '@/constants/spacing';

interface Props {
  uri?: string | null;
  name?: string | null;
  size?: number;
}

export function Avatar({ uri, name, size = 40 }: Props): React.ReactElement {
  const initial = (name?.trim()?.[0] ?? 'U').toUpperCase();
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.base, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }
  return (
    <View
      style={[
        styles.base,
        styles.placeholder,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.42 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.surfaceAlt },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.primaryDark, fontWeight: fontWeights.bold },
});
