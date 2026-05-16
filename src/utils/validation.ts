export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateLogin(values: { email: string; password: string }): ValidationResult {
  const errors: Record<string, string> = {};
  if (!values.email) errors.email = 'Email wajib diisi';
  else if (!emailRegex.test(values.email)) errors.email = 'Format email tidak valid';
  if (!values.password) errors.password = 'Password wajib diisi';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateRegister(values: {
  email: string;
  password: string;
  confirmPassword: string;
}): ValidationResult {
  const errors: Record<string, string> = {};
  if (!values.email) errors.email = 'Email wajib diisi';
  else if (!emailRegex.test(values.email)) errors.email = 'Format email tidak valid';
  if (!values.password) errors.password = 'Password wajib diisi';
  else if (values.password.length < 6) errors.password = 'Minimal 6 karakter';
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Konfirmasi password tidak cocok';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateProfile(values: {
  fullName: string;
  city: string;
  area: string;
}): ValidationResult {
  const errors: Record<string, string> = {};
  if (!values.fullName.trim()) errors.fullName = 'Nama wajib diisi';
  if (!values.city.trim()) errors.city = 'Kota wajib diisi';
  if (!values.area.trim()) errors.area = 'Area wajib diisi';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateProduct(values: {
  name: string;
  price: number;
  categoryId: string | null;
  condition: 'baru' | 'bekas' | null;
  area: string;
  latitude: number | null;
  longitude: number | null;
  imagesCount: number;
}): ValidationResult {
  const errors: Record<string, string> = {};
  if (!values.name.trim()) errors.name = 'Nama produk wajib diisi';
  if (!values.price || values.price <= 0) errors.price = 'Harga harus angka positif';
  if (!values.categoryId) errors.categoryId = 'Kategori wajib dipilih';
  if (!values.condition) errors.condition = 'Kondisi wajib dipilih';
  if (!values.area.trim()) errors.area = 'Area wajib diisi';
  if (values.latitude == null || values.longitude == null) errors.location = 'Lokasi wajib diisi';
  if (values.imagesCount < 1) errors.images = 'Minimal 1 foto';
  if (values.imagesCount > 5) errors.images = 'Maksimal 5 foto';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function mapAuthError(message: string | null | undefined): string {
  const msg = (message ?? '').toLowerCase();
  if (!msg) return 'Terjadi kesalahan, coba lagi.';
  if (msg.includes('invalid login')) return 'Email atau password salah.';
  if (msg.includes('email rate')) return 'Terlalu banyak percobaan. Coba lagi nanti.';
  if (msg.includes('already registered') || msg.includes('user already')) {
    return 'Email sudah terdaftar.';
  }
  if (msg.includes('network')) return 'Tidak ada koneksi internet.';
  return message ?? 'Terjadi kesalahan, coba lagi.';
}
