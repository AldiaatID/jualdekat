const formatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (n == null || !Number.isFinite(n)) return 'Rp0';
  return formatter.format(n).replace(/\s/g, '');
}

export function parseCurrencyInput(text: string): number {
  const digits = text.replace(/\D+/g, '');
  if (!digits) return 0;
  return Math.min(Number(digits), 9_999_999_999);
}
