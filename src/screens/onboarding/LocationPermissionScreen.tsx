import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/common/Button';
import { colors } from '@/constants/colors';
import { fontSizes, fontWeights, spacing } from '@/constants/spacing';
import { useLocation } from '@/hooks/useLocation';

export function LocationPermissionScreen(): React.ReactElement {
  const { request, setDemoLocation, permission } = useLocation();
  const [loading, setLoading] = useState<'gps' | 'demo' | null>(null);

  const handleGrant = async () => {
    setLoading('gps');
    await request();
    setLoading(null);
  };
  const handleDemo = async () => {
    setLoading('demo');
    await setDemoLocation();
    setLoading(null);
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
        title={permission === 'denied' ? 'Coba lagi izinkan lokasi' : 'Izinkan akses lokasi'}
        onPress={handleGrant}
        loading={loading === 'gps'}
        fullWidth
        style={{ marginTop: spacing.lg }}
      />
      <Button
        title="Gunakan lokasi demo (Beji, Depok)"
        variant="secondary"
        onPress={handleDemo}
        loading={loading === 'demo'}
        fullWidth
      />
      {permission === 'denied' ? (
        <Text style={styles.warn}>
          Akses lokasi ditolak. Kamu tetap bisa mencoba aplikasi dengan lokasi demo.
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
  warn: { color: colors.warning, marginTop: spacing.md, textAlign: 'center', fontSize: fontSizes.sm },
});
