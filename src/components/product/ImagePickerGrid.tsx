import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/constants/colors';
import { fontSizes, radii, spacing } from '@/constants/spacing';

interface Props {
  uris: string[];
  onChange: (uris: string[]) => void;
  max?: number;
}

export function ImagePickerGrid({ uris, onChange, max = 5 }: Props): React.ReactElement {
  const pick = async () => {
    const remaining = max - uris.length;
    if (remaining <= 0) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Izin galeri ditolak', 'Berikan izin akses galeri untuk memilih foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.7,
    });
    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      onChange([...uris, ...newUris].slice(0, max));
    }
  };

  const remove = (i: number) => onChange(uris.filter((_, idx) => idx !== i));

  return (
    <View style={styles.row}>
      {uris.map((uri, i) => (
        <View key={`${uri}-${i}`} style={styles.cell}>
          <Image source={{ uri }} style={styles.image} />
          <Pressable style={styles.remove} onPress={() => remove(i)} hitSlop={6}>
            <Ionicons name="close" size={14} color="#fff" />
          </Pressable>
        </View>
      ))}
      {uris.length < max ? (
        <Pressable style={[styles.cell, styles.add]} onPress={pick}>
          <Ionicons name="camera-outline" size={24} color={colors.primary} />
          <Text style={styles.addText}>Tambah</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: {
    width: 88,
    height: 88,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  add: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    gap: spacing.xs,
  },
  addText: { fontSize: fontSizes.xs, color: colors.primary },
  remove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
