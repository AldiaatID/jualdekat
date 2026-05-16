import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';
import { fontSizes, fontWeights, radii, spacing } from '@/constants/spacing';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'primary';

interface Props {
  label: string;
  tone?: Tone;
  style?: ViewStyle;
}

export function Badge({ label, tone = 'neutral', style }: Props): React.ReactElement {
  const c = toneColors[tone];
  return (
    <View style={[styles.base, { backgroundColor: c.bg }, style]}>
      <Text style={[styles.text, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  text: { fontSize: fontSizes.xs, fontWeight: fontWeights.semibold },
});

const toneColors: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.surfaceAlt, fg: colors.textSecondary },
  success: { bg: colors.primaryLight, fg: colors.primaryDark },
  warning: { bg: '#FEF3C7', fg: '#92400E' },
  danger: { bg: '#FEE2E2', fg: colors.danger },
  info: { bg: '#DBEAFE', fg: '#1E40AF' },
  primary: { bg: colors.primaryLight, fg: colors.primaryDark },
};
