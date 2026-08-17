export const Colors = {
  light: {
    background: '#F5F0E8',
    surface:    '#FDFAF5',
    card:       '#FDFAF5',
    border:     '#EDE8DF',
    text: {
      primary:   '#1A1612',
      secondary: '#6B6560',
      muted:     '#A09A94',
      inverse:   '#FDFAF5',
    },
    accent: {
      primary:   '#6495ED',
      secondary: '#87ADEF',
      success:   '#6FAF8A',
      warning:   '#C9946F',
      danger:    '#C96F6F',
    },
    tab: {
      active:     '#6495ED',
      inactive:   '#A09A94',
      background: '#F5F0E8',
    },
  },
  dark: {
    background: '#181B20',
    surface:    '#222730',
    card:       '#222730',
    border:     '#30353E',
    text: {
      primary:   '#EEF2F8',
      secondary: '#9AA5B8',
      muted:     '#656F80',
      inverse:   '#181B20',
    },
    accent: {
      primary:   '#87ADEF',
      secondary: '#ACC5F1',
      success:   '#6FAF8A',
      warning:   '#C9946F',
      danger:    '#C96F6F',
    },
    tab: {
      active:     '#87ADEF',
      inactive:   '#656F80',
      background: '#181B20',
    },
  },
} as const;

export const EventTypeColors = {
  meeting:     '#6495ED',
  competition: '#C96F9A',
  social:      '#6FAF8A',
  deadline:    '#C9946F',
} as const;

// Gradient stops for hero sections
export const GradientHero = ['#D3DCED', '#C5D2E8', '#BFCEE8'] as const;
