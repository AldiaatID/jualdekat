import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { colors } from '@/constants/colors';
import { fontSizes, fontWeights, spacing } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { upsertProfile } from '@/services/profileService';
import { uploadAvatar } from '@/services/storageService';
import { validateProfile } from '@/utils/validation';

interface Props {
  onClose: () => void;
}

export function EditProfileScreen({ onClose }: Props): React.ReactElement {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [area, setArea] = useState(profile?.area ?? '');
  const [phone, setPhone] = useState(profile?.phone_number ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(profile?.avatar_url ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const pickAvatar = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!r.canceled && r.assets[0]) setAvatarUri(r.assets[0].uri);
  };

  const submit = async () => {
    if (!user) return;
    const v = validateProfile({ fullName, city, area });
    setErrors(v.errors);
    if (!v.valid) return;
    setLoading(true);
    try {
      let avatarUrl = profile?.avatar_url ?? null;
      if (avatarUri && avatarUri !== profile?.avatar_url && !avatarUri.startsWith('http')) {
        avatarUrl = await uploadAvatar(avatarUri, user.id);
      }
      await upsertProfile({
        id: user.id,
        full_name: fullName.trim(),
        city: city.trim(),
        area: area.trim(),
        phone_number: phone.trim() || null,
        avatar_url: avatarUrl,
      });
      await refreshProfile();
      onClose();
    } catch (e) {
      Alert.alert('Gagal menyimpan', e instanceof Error ? e.message : 'Coba lagi.');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <View style={styles.avatarWrap}>
        <Pressable onPress={pickAvatar}>
          <Avatar uri={avatarUri} name={fullName} size={96} />
          <Text style={styles.avatarHint}>Ubah foto</Text>
        </Pressable>
      </View>
      <Input label="Nama lengkap" value={fullName} onChangeText={setFullName} error={errors.fullName} />
      <Input label="Kota" value={city} onChangeText={setCity} error={errors.city} />
      <Input label="Area" value={area} onChangeText={setArea} error={errors.area} />
      <Input label="Nomor WhatsApp" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <Button title="Simpan perubahan" onPress={submit} loading={loading} fullWidth />
      <Button title="Batal" variant="ghost" onPress={onClose} fullWidth />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  avatarWrap: { alignItems: 'center', marginVertical: spacing.lg },
  avatarHint: { textAlign: 'center', color: colors.primary, marginTop: spacing.xs, fontWeight: fontWeights.semibold, fontSize: fontSizes.sm },
});
