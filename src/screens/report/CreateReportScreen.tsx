import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { Chip } from '@/components/common/Chip';
import { Input } from '@/components/common/Input';
import { colors } from '@/constants/colors';
import { REPORT_REASONS } from '@/constants/radius';
import { fontSizes, fontWeights, spacing } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { submitReport } from '@/services/reportService';
import type { ReportReason } from '@/types/db';

interface Props {
  productId?: string;
  reportedUserId?: string;
  onClose: () => void;
}

export function CreateReportScreen({ productId, reportedUserId, onClose }: Props): React.ReactElement {
  const { user } = useAuth();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!user) return;
    if (!reason) { setError('Pilih alasan laporan'); return; }
    setLoading(true);
    try {
      await submitReport({
        reporter_id: user.id,
        product_id: productId ?? null,
        reported_user_id: reportedUserId ?? null,
        reason,
        description: description.trim() || null,
      });
      Alert.alert('Terima kasih', 'Laporan kamu sudah kami terima.');
      onClose();
    } catch (e) {
      Alert.alert('Gagal mengirim', e instanceof Error ? e.message : 'Coba lagi.');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Laporkan</Text>
      <Text style={styles.hint}>Bantu kami menjaga komunitas. Laporan akan ditinjau tim kami.</Text>
      <Text style={styles.label}>Alasan</Text>
      <View style={styles.chipRow}>
        {REPORT_REASONS.map((r) => (
          <Chip key={r.value} label={r.label} selected={reason === r.value} onPress={() => setReason(r.value as ReportReason)} />
        ))}
      </View>
      {error ? <Text style={{ color: colors.danger, fontSize: fontSizes.xs }}>{error}</Text> : null}
      <Input
        label="Deskripsi (opsional)"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={{ minHeight: 100, textAlignVertical: 'top' }}
      />
      <Button title="Kirim laporan" onPress={submit} loading={loading} fullWidth />
      <Button title="Batal" variant="ghost" onPress={onClose} fullWidth />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.textPrimary },
  hint: { color: colors.textSecondary, fontSize: fontSizes.sm },
  label: { fontWeight: fontWeights.semibold, color: colors.textSecondary, fontSize: fontSizes.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
