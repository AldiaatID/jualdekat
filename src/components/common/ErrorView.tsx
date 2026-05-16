import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { fontSizes, fontWeights, spacing } from '@/constants/spacing';

import { Button } from './Button';

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorView({ message, onRetry }: Props): React.ReactElement {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Terjadi kesalahan</Text>
      <Text style={styles.desc}>{message}</Text>
      {onRetry ? <Button title="Coba Lagi" onPress={onRetry} variant="secondary" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  title: { fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, color: colors.textPrimary },
  desc: { color: colors.textSecondary, fontSize: fontSizes.sm, textAlign: 'center' },
});
