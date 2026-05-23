export const Colors = {
  light: {
    background: '#ffffff',
    surface: '#f8fafc',
    card: '#ffffff',
    border: '#e2e8f0',
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      muted: '#94a3b8',
      inverse: '#ffffff',
    },
    accent: {
      primary: '#1a56db',
      secondary: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
    tab: {
      active: '#1a56db',
      inactive: '#94a3b8',
      background: '#ffffff',
    },
  },
  dark: {
    background: '#0f172a',
    surface: '#1e293b',
    card: '#1e293b',
    border: '#334155',
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
      muted: '#64748b',
      inverse: '#0f172a',
    },
    accent: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      success: '#34d399',
      warning: '#fbbf24',
      danger: '#f87171',
    },
    tab: {
      active: '#60a5fa',
      inactive: '#64748b',
      background: '#1e293b',
    },
  },
} as const;

export const EventTypeColors = {
  meeting: '#1a56db',
  competition: '#7c3aed',
  social: '#10b981',
  deadline: '#ef4444',
} as const;

export const RoleColors = {
  member: '#64748b',
  officer: '#1a56db',
  advisor: '#7c3aed',
} as const;
