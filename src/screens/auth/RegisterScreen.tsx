import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { colors } from '@/constants/colors';
import { fontSizes, fontWeights, spacing } from '@/constants/spacing';
import { signUp } from '@/services/authService';
import { mapAuthError, validateRegister } from '@/utils/validation';

interface Props {
  onGoToLogin: () => void;
}

export function RegisterScreen({ onGoToLogin }: Props): React.ReactElement {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const v = validateRegister({ email, password, confirmPassword });
    setErrors(v.errors);
    if (!v.valid) return;
    setLoading(true);
    const { error } = await signUp(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert('Daftar gagal', mapAuthError(error.message));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>Daftar JualDekat</Text>
        <Text style={styles.tagline}>Mulai jual-beli barang dekat lokasimu.</Text>
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
            placeholder="Minimal 6 karakter"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />
          <Input
            label="Konfirmasi password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
          />
          <Button title="Buat Akun" onPress={submit} loading={loading} fullWidth />
          <Button
            title="Sudah punya akun? Masuk"
            onPress={onGoToLogin}
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
  brand: { fontSize: 28, fontWeight: fontWeights.bold, color: colors.textPrimary, textAlign: 'center' },
  tagline: { textAlign: 'center', color: colors.textSecondary, fontSize: fontSizes.md },
  form: { gap: spacing.md, marginTop: spacing.lg },
});
