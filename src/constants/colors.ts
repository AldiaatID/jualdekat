/**
 * Theme color tokens for JualDekat.
 * Primary palette: green (kesan ramah & lokal).
 */
export const colors = {
  // Brand
  primary: '#16A34A',
  primaryDark: '#15803D',
  primaryLight: '#DCFCE7',

  // Neutrals
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  divider: '#EEF2F6',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',

  // Status
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#2563EB',

  // Misc
  overlay: 'rgba(15, 23, 42, 0.5)',
} as const;

export type ColorToken = keyof typeof colors;
