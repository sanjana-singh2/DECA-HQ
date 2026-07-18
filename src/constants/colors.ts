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
      primary:   '#756FC9',
      secondary: '#908BD4',
      success:   '#6FAF8A',
      warning:   '#C9946F',
      danger:    '#C96F6F',
    },
    tab: {
      active:     '#756FC9',
      inactive:   '#A09A94',
      background: '#F5F0E8',
    },
  },
  dark: {
    background: '#1A1820',
    surface:    '#242230',
    card:       '#242230',
    border:     '#32303E',
    text: {
      primary:   '#F0EEF8',
      secondary: '#A09AB8',
      muted:     '#6B6580',
      inverse:   '#1A1820',
    },
    accent: {
      primary:   '#908BD4',
      secondary: '#ADA9DF',
      success:   '#6FAF8A',
      warning:   '#C9946F',
      danger:    '#C96F6F',
    },
    tab: {
      active:     '#908BD4',
      inactive:   '#6B6580',
      background: '#1A1820',
    },
  },
} as const;

export const EventTypeColors = {
  meeting:     '#756FC9',
  competition: '#C96F9A',
  social:      '#6FAF8A',
  deadline:    '#C9946F',
} as const;

// Gradient stops for hero sections
export const GradientHero = ['#D4D3ED', '#C5C8E8', '#CBBFE8'] as const;
