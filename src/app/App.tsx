import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppProviders } from '@/app/providers';
import { colors } from '@/constants/colors';
import { fontSizes, fontWeights, spacing } from '@/constants/spacing';

export default function App(): React.ReactElement {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <Text style={styles.brand}>JualDekat</Text>
          <Text style={styles.tagline}>Jual-beli barang dekat lokasimu.</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>MVP - Task 1 Setup OK</Text>
          </View>
        </View>
      </SafeAreaView>
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  brand: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  tagline: {
    marginTop: spacing.sm,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  badge: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: 999,
  },
  badgeText: {
    color: colors.primaryDark,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
});
