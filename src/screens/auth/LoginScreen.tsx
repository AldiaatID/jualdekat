import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { colors } from '@/constants/colors';
import { fontSizes, fontWeights, spacing } from '@/constants/spacing';
import { signIn } from '@/services/authService';
import { mapAuthError, validateLogin } from '@/utils/validation';
import { isSupabaseConfigured } from '@/services/supabase';

interface Props {
  onGoToRegister: () => void;
}

export function LoginScreen({ onGoToRegister }: Props): React.ReactElement {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const v = validateLogin({ email, password });
    setErrors(v.errors);
    if (!v.valid) return;
    if (!isSupabaseConfigured) {
      Alert.alert(
        'Mode Demo',
        'Supabase belum dikonfigurasi. Buat file .env dengan EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_ANON_KEY untuk login.',
      );
      return;
    }
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert('Login gagal', mapAuthError(error.message));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>JualDekat</Text>
        <Text style={styles.tagline}>Marketplace lokal di sekitarmu.</Text>
        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="kamu@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />
          <Input
            label="Password"
            placeholder="******"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />
          <Button title="Masuk" onPress={submit} loading={loading} fullWidth />
          <Button
            title="Belum punya akun? Daftar"
            onPress={onGoToRegister}
            variant="ghost"
            fullWidth
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, gap: spacing.lg, flexGrow: 1, justifyContent: 'center' },
  brand: { fontSize: 36, fontWeight: fontWeights.bold, color: colors.primary, textAlign: 'center' },
  tagline: { textAlign: 'center', color: colors.textSecondary, fontSize: fontSizes.md },
  form: { gap: spacing.md, marginTop: spacing.lg },
});
