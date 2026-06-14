export const colors = {
  background: '#0F1115',
  surface: '#1B1F27',
  surfaceAlt: '#262C38',
  border: '#323A48',
  primary: '#3DDC97',
  primaryDark: '#2BB07E',
  text: '#F5F7FA',
  textMuted: '#9AA5B5',
  danger: '#FF6B6B',
  warning: '#FFB020',
  shopee: '#EE4D2D',
  lazada: '#0F146D',
} as const;

export const confidenceColors: Record<'high' | 'medium' | 'low', string> = {
  high: '#3DDC97',
  medium: '#FFB020',
  low: '#FF6B6B',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
} as const;
