import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/common/Button';
import { colors } from '@/constants/colors';
import { fontSizes, fontWeights, spacing } from '@/constants/spacing';
import { useLocation } from '@/hooks/useLocation';

export function LocationPermissionScreen(): React.ReactElement {
  const { request, permission } = useLocation();
  const [loading, setLoading] = useState(false);

  const handleGrant = async () => {
    setLoading(true);
    await request();
    setLoading(false);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <Ionicons name="location-outline" size={64} color={colors.primary} />
      </View>
      <Text style={styles.title}>Aktifkan lokasi</Text>
      <Text style={styles.desc}>
        JualDekat menampilkan barang berdasarkan jaraknya dari kamu. Kami tidak menampilkan
        lokasi presisi penjual ke pengguna lain.
      </Text>
      <Button
        title={permission === 'denied' ? 'Coba Lagi' : 'Izinkan akses lokasi'}
        onPress={handleGrant}
        loading={loading}
        fullWidth
        style={{ marginTop: spacing.lg }}
      />
      {permission === 'denied' ? (
        <Text style={styles.warn}>
          Akses ditolak. Buka pengaturan perangkat dan aktifkan izin lokasi untuk JualDekat.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  icon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: fontSizes.xxl, fontWeight: fontWeights.bold, color: colors.textPrimary },
  desc: {
    color: colors.textSecondary,
    fontSize: fontSizes.md,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 360,
  },
  warn: { color: colors.danger, marginTop: spacing.md, textAlign: 'center' },
});
