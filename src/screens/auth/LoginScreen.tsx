import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { colors } from '@/constants/colors';
import { fontSizes, fontWeights, radii, spacing } from '@/constants/spacing';
import { signIn } from '@/services/authService';
import { mapAuthError, validateLogin } from '@/utils/validation';

interface Props {
  onGoToRegister: () => void;
}

const DEMO_ACCOUNTS = [
  { email: 'rina@demo.com', label: 'Rina (Beji)' },
  { email: 'budi@demo.com', label: 'Budi (Kemiri Muka)' },
  { email: 'andi@demo.com', label: 'Andi (Pondok Cina)' },
  { email: 'dewi@demo.com', label: 'Dewi (Kemanggisan)' },
];

export function LoginScreen({ onGoToRegister }: Props): React.ReactElement {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = async (overrideEmail?: string, overridePassword?: string) => {
    const e = overrideEmail ?? email;
    const p = overridePassword ?? password;
    if (!overrideEmail) {
      const v = validateLogin({ email: e, password: p });
      setErrors(v.errors);
      if (!v.valid) return;
    }
    setLoading(true);
    const { error } = await signIn(e.trim(), p);
    setLoading(false);
    if (error) Alert.alert('Login gagal', mapAuthError(error.message));
  };

  const loginAsDemo = (demoEmail: string) => submit(demoEmail, 'demo1234');

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>JualDekat</Text>
        <Text style={styles.tagline}>Marketplace lokal di sekitarmu.</Text>

        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>Coba akun demo</Text>
          <Text style={styles.demoHint}>
            Tap salah satu untuk masuk instan. Password semua: <Text style={styles.bold}>demo1234</Text>
          </Text>
          <View style={styles.demoRow}>
            {DEMO_ACCOUNTS.map((a) => (
              <Pressable
                key={a.email}
                style={styles.demoChip}
                onPress={() => loginAsDemo(a.email)}
              >
                <Text style={styles.demoChipText}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

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
          <Button title="Masuk" onPress={() => submit()} loading={loading} fullWidth />
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
  demoBox: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  demoTitle: { fontWeight: fontWeights.bold, color: colors.primaryDark, fontSize: fontSizes.md },
  demoHint: { color: colors.primaryDark, fontSize: fontSizes.sm },
  demoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  demoChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  demoChipText: { color: colors.primaryDark, fontWeight: fontWeights.semibold, fontSize: fontSizes.sm },
  bold: { fontWeight: fontWeights.bold },
  form: { gap: spacing.md, marginTop: spacing.sm },
});
