import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fontSizes, spacing } from '@/constants/spacing';

interface Props {
  label?: string;
}

export function LoadingView({ label = 'Memuat...' }: Props): React.ReactElement {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  text: { color: colors.textSecondary, fontSize: fontSizes.sm },
});
