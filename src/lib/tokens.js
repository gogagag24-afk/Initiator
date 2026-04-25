// src/lib/tokens.js - ერთიანი დიზაინი სამივე აპისთვის
export const colors = {
  bg: {
    primary: '#0a0a0a',
    secondary: '#111827',
    card: '#1f2937',
    hover: '#2d3748',
  },
  border: {
    default: '#374151',
    active: '#e8a020',
    light: '#4b5563',
  },
  text: {
    primary: '#f9fafb',
    secondary: '#9ca3af',
    muted: '#6b7280',
  },
  status: {
    collecting: '#e8a020',
    sent: '#3b82f6',
    received: '#8b5cf6',
    numbered: '#8b5cf6',
    scheduled: '#10b981',
    resolved: '#059669',
  },
  statusBg: {
    collecting: 'rgba(232, 160, 32, 0.12)',
    sent: 'rgba(59, 130, 246, 0.12)',
    received: 'rgba(139, 92, 246, 0.12)',
    numbered: 'rgba(139, 92, 246, 0.12)',
    scheduled: 'rgba(16, 185, 129, 0.12)',
    resolved: 'rgba(5, 150, 105, 0.12)',
  },
  accent: { gold: '#e8a020', red: '#ef4444', purple: '#8b5cf6' },
};

export const fonts = {
  georgian: "'Noto Sans Georgian', sans-serif",
  serif: "'Noto Serif Georgian', Georgia, serif",
  mono: "'IBM Plex Mono', monospace",
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24 };
export const radii = { sm: 6, md: 10, lg: 12, xl: 16 };
export const transitions = { fast: '0.15s ease', normal: '0.2s ease' };
