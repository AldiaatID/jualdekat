import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fontSizes, fontWeights, radii, spacing } from '@/constants/spacing';

export function SafetyNote(): React.ReactElement {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Tips keamanan</Text>
      <Text style={styles.body}>
        Untuk keamanan, lakukan COD di tempat umum yang ramai (mis. minimarket, kampus, atau
        pos satpam). Jangan transfer di muka tanpa kepastian.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: '#FEF3C7',
    gap: spacing.xs,
  },
  title: { fontWeight: fontWeights.semibold, color: '#92400E', fontSize: fontSizes.sm },
  body: { color: '#92400E', fontSize: fontSizes.sm, lineHeight: 20 },
});
