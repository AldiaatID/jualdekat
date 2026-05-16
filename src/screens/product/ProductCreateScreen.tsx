import React, { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { Chip } from '@/components/common/Chip';
import { Input } from '@/components/common/Input';
import { ImagePickerGrid } from '@/components/product/ImagePickerGrid';
import { colors } from '@/constants/colors';
import { TRANSACTION_METHODS } from '@/constants/radius';
import { fontSizes, fontWeights, spacing } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import {
  attachImagesToProduct,
  createProduct,
  listCategories,
} from '@/services/productService';
import { uploadProductImage } from '@/services/storageService';
import type { CategoryRow, ProductCondition, TransactionMethod } from '@/types/db';
import { formatCurrency, parseCurrencyInput } from '@/utils/formatCurrency';
import { validateProduct } from '@/utils/validation';

interface Props {
  onCreated: () => void;
}

export function ProductCreateScreen({ onCreated }: Props): React.ReactElement {
  const { user, profile } = useAuth();
  const { coords } = useLocation();

  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [condition, setCondition] = useState<ProductCondition | null>(null);
  const [methods, setMethods] = useState<TransactionMethod[]>(['COD']);
  const [area, setArea] = useState(profile?.area ?? '');
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const lat = coords?.latitude ?? profile?.latitude ?? null;
  const lng = coords?.longitude ?? profile?.longitude ?? null;

  useEffect(() => {
    void (async () => {
      try { setCategories(await listCategories()); } catch { /* ignore */ }
    })();
  }, []);

  const toggleMethod = (m: TransactionMethod) => {
    setMethods((cur) =>
      cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m],
    );
  };

  const submit = async () => {
    if (!user) return;
    const v = validateProduct({
      name,
      price,
      categoryId,
      condition,
      area,
      latitude: lat,
      longitude: lng,
      imagesCount: images.length,
    });
    setErrors(v.errors);
    if (!v.valid) return;
    setLoading(true);
    try {
      const product = await createProduct({
        user_id: user.id,
        category_id: categoryId!,
        name: name.trim(),
        description: description.trim() || null,
        price,
        condition: condition!,
        area: area.trim(),
        latitude: lat!,
        longitude: lng!,
        transaction_methods: methods.length ? methods : ['COD'],
      });
      const urls: string[] = [];
      for (const uri of images) {
        const url = await uploadProductImage(uri, user.id, product.id);
        urls.push(url);
      }
      await attachImagesToProduct(product.id, urls);
      Alert.alert('Berhasil', 'Produk kamu sudah dipublikasikan.');
      onCreated();
      // reset
      setName(''); setDescription(''); setPrice(0); setCategoryId(null);
      setCondition(null); setImages([]);
    } catch (e) {
      Alert.alert('Gagal upload', e instanceof Error ? e.message : 'Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sort_order - b.sort_order),
    [categories],
  );

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Jual barang</Text>
        <Text style={styles.hint}>Gunakan titik area umum, bukan rumahmu, untuk menjaga privasi.</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Foto produk (1-5)</Text>
          <ImagePickerGrid uris={images} onChange={setImages} max={5} />
          {errors.images ? <Text style={styles.errorText}>{errors.images}</Text> : null}
        </View>

        <Input label="Nama produk" value={name} onChangeText={setName} error={errors.name} />
        <Input
          label="Deskripsi (opsional)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ minHeight: 100, textAlignVertical: 'top' }}
        />
        <Input
          label="Harga"
          value={price ? formatCurrency(price) : ''}
          onChangeText={(t) => setPrice(parseCurrencyInput(t))}
          keyboardType="numeric"
          error={errors.price}
        />

        <View style={styles.section}>
          <Text style={styles.label}>Kategori</Text>
          <View style={styles.chipRow}>
            {sortedCategories.length === 0 ? (
              <Text style={styles.hint}>Memuat kategori...</Text>
            ) : null}
            {sortedCategories.map((c) => (
              <Chip
                key={c.id}
                label={c.name}
                selected={categoryId === c.id}
                onPress={() => setCategoryId(c.id)}
              />
            ))}
          </View>
          {errors.categoryId ? <Text style={styles.errorText}>{errors.categoryId}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Kondisi</Text>
          <View style={styles.chipRow}>
            <Chip label="Baru" selected={condition === 'baru'} onPress={() => setCondition('baru')} />
            <Chip label="Bekas" selected={condition === 'bekas'} onPress={() => setCondition('bekas')} />
          </View>
          {errors.condition ? <Text style={styles.errorText}>{errors.condition}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Metode transaksi</Text>
          <View style={styles.chipRow}>
            {TRANSACTION_METHODS.map((m) => (
              <Chip
                key={m.value}
                label={m.label}
                selected={methods.includes(m.value as TransactionMethod)}
                onPress={() => toggleMethod(m.value as TransactionMethod)}
              />
            ))}
          </View>
        </View>

        <Input label="Area" placeholder="mis. Beji" value={area} onChangeText={setArea} error={errors.area} />
        <Text style={styles.hint}>
          Lokasi otomatis: {lat != null && lng != null ? 'Ada' : 'Belum tersedia'} (digunakan untuk
          menghitung jarak; koordinat presisi tidak ditampilkan publik).
        </Text>
        {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}

        <Button title="Publikasikan" onPress={submit} loading={loading} fullWidth />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  title: { fontSize: fontSizes.xxl, fontWeight: fontWeights.bold, color: colors.textPrimary },
  hint: { color: colors.textSecondary, fontSize: fontSizes.sm },
  label: { fontWeight: fontWeights.semibold, color: colors.textSecondary, fontSize: fontSizes.sm },
  section: { gap: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  errorText: { color: colors.danger, fontSize: fontSizes.xs },
});
