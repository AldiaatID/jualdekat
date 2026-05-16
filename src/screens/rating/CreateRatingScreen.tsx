import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { colors } from '@/constants/colors';
import { fontSizes, fontWeights, spacing } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { submitRating } from '@/services/ratingService';

interface Props {
  transactionId: string;
  reviewedUserId: string;
  productId: string | null;
  reviewedUserName?: string;
  onClose: () => void;
}

export function CreateRatingScreen({
  transactionId,
  reviewedUserId,
  productId,
  reviewedUserName,
  onClose,
}: Props): React.ReactElement {
  const { user } = useAuth();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!user) return;
    if (stars < 1) { Alert.alert('Beri minimal 1 bintang'); return; }
    setLoading(true);
    try {
      await submitRating({
        transaction_id: transactionId,
        reviewer_id: user.id,
        reviewed_user_id: reviewedUserId,
        product_id: productId,
        rating: stars,
        comment: comment.trim() || null,
      });
      Alert.alert('Terima kasih', 'Rating kamu sudah dicatat.');
      onClose();
    } catch (e) {
      Alert.alert('Gagal mengirim rating', e instanceof Error ? e.message : 'Coba lagi.');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Beri rating{reviewedUserName ? ` untuk ${reviewedUserName}` : ''}</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setStars(n)} hitSlop={8}>
            <Ionicons name={n <= stars ? 'star' : 'star-outline'} size={36} color="#F59E0B" />
          </Pressable>
        ))}
      </View>
      <Input
        label="Komentar (opsional)"
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={4}
        style={{ minHeight: 100, textAlignVertical: 'top' }}
      />
      <Button title="Kirim rating" onPress={submit} loading={loading} fullWidth />
      <Button title="Batal" variant="ghost" onPress={onClose} fullWidth />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.textPrimary, textAlign: 'center' },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md },
});
