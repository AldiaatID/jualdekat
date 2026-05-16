export const RADIUS_OPTIONS_KM = [1, 3, 5, 10, 20] as const;
export const DEFAULT_RADIUS_KM: number = 5;

export const REPORT_REASONS = [
  { value: 'barang_palsu', label: 'Barang palsu' },
  { value: 'penipuan', label: 'Penipuan' },
  { value: 'konten_tidak_pantas', label: 'Konten tidak pantas' },
  { value: 'harga_mencurigakan', label: 'Harga mencurigakan' },
  { value: 'spam', label: 'Spam' },
  { value: 'lainnya', label: 'Lainnya' },
] as const;

export const TRANSACTION_METHODS = [
  { value: 'COD', label: 'COD' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'kirim_lokal', label: 'Kirim lokal' },
] as const;
