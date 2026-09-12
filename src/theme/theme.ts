// ============================================================================
// CASHFLOW COACH — LUXURY THEME SYSTEM
// "Neo-Academia meets Spatial FinTech"
// ============================================================================

export type ThemeId = 'midnight' | 'cyberpunk' | 'light' | 'forest' | 'ocean' | 'sunset' | 'monochrome';

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  colors: {
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
      elevated: string;
    };
    accent: {
      primary: string;
      secondary: string;
      income: string;
      expense: string;
      savings: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      muted: string;
    };
    border: {
      subtle: string;
      medium: string;
      strong: string;
    };
    glass: {
      bg: string;
      bgHover: string;
      border: string;
    };
  };
}

export const themes: Record<ThemeId, Theme> = {
  midnight: {
    id: 'midnight',
    name: 'Midnight Void',
    description: 'Deep space darkness with cyan accents',
    colors: {
      background: {
        primary: '#050505',
        secondary: '#0A0A0F',
        tertiary: '#0D0D14',
        elevated: '#111118',
      },
      accent: {
        primary: '#00E5FF',
        secondary: '#7000FF',
        income: '#00FFA3',
        expense: '#FF2A6D',
        savings: '#B100FF',
      },
      text: {
        primary: '#F8FAFC',
        secondary: '#94A3B8',
        tertiary: '#64748B',
        muted: '#475569',
      },
      border: {
        subtle: 'rgba(255, 255, 255, 0.06)',
        medium: 'rgba(255, 255, 255, 0.1)',
        strong: 'rgba(255, 255, 255, 0.15)',
      },
      glass: {
        bg: 'rgba(255, 255, 255, 0.025)',
        bgHover: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.08)',
      },
    },
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'High contrast neon with purple and pink',
    colors: {
      background: {
        primary: '#0a0a0f',
        secondary: '#12121a',
        tertiary: '#1a1a2e',
        elevated: '#222233',
      },
      accent: {
        primary: '#FF00FF',
        secondary: '#00FFFF',
        income: '#00FF99',
        expense: '#FF0066',
        savings: '#FFCC00',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#E0E0E0',
        tertiary: '#A0A0A0',
        muted: '#606060',
      },
      border: {
        subtle: 'rgba(255, 0, 255, 0.1)',
        medium: 'rgba(255, 0, 255, 0.2)',
        strong: 'rgba(255, 0, 255, 0.3)',
      },
      glass: {
        bg: 'rgba(255, 0, 255, 0.03)',
        bgHover: 'rgba(255, 0, 255, 0.08)',
        border: 'rgba(255, 0, 255, 0.15)',
      },
    },
  },
  light: {
    id: 'light',
    name: 'Clean Light',
    description: 'Minimalist light theme with blue accents',
    colors: {
      background: {
        primary: '#FFFFFF',
        secondary: '#F8FAFC',
        tertiary: '#F1F5F9',
        elevated: '#E2E8F0',
      },
      accent: {
        primary: '#0066FF',
        secondary: '#00C2FF',
        income: '#00AA55',
        expense: '#FF4444',
        savings: '#8844FF',
      },
      text: {
        primary: '#0F172A',
        secondary: '#475569',
        tertiary: '#64748B',
        muted: '#94A3B8',
      },
      border: {
        subtle: 'rgba(0, 0, 0, 0.06)',
        medium: 'rgba(0, 0, 0, 0.1)',
        strong: 'rgba(0, 0, 0, 0.15)',
      },
      glass: {
        bg: 'rgba(0, 102, 255, 0.03)',
        bgHover: 'rgba(0, 102, 255, 0.06)',
        border: 'rgba(0, 0, 0, 0.08)',
      },
    },
  },
  forest: {
    id: 'forest',
    name: 'Forest Mist',
    description: 'Natural green tones with earth accents',
    colors: {
      background: {
        primary: '#0d1410',
        secondary: '#121f18',
        tertiary: '#1a2f22',
        elevated: '#224030',
      },
      accent: {
        primary: '#00DD88',
        secondary: '#44FFAA',
        income: '#00FF88',
        expense: '#FF6B6B',
        savings: '#88DDFF',
      },
      text: {
        primary: '#E8F5E9',
        secondary: '#A5D6A7',
        tertiary: '#81C784',
        muted: '#66BB6A',
      },
      border: {
        subtle: 'rgba(0, 221, 136, 0.1)',
        medium: 'rgba(0, 221, 136, 0.2)',
        strong: 'rgba(0, 221, 136, 0.3)',
      },
      glass: {
        bg: 'rgba(0, 221, 136, 0.03)',
        bgHover: 'rgba(0, 221, 136, 0.08)',
        border: 'rgba(0, 221, 136, 0.15)',
      },
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Depths',
    description: 'Deep blue gradients with teal highlights',
    colors: {
      background: {
        primary: '#021019',
        secondary: '#051f2e',
        tertiary: '#0a2d42',
        elevated: '#0f3d57',
      },
      accent: {
        primary: '#00D4FF',
        secondary: '#0099CC',
        income: '#00FFCC',
        expense: '#FF6B9D',
        savings: '#00CCFF',
      },
      text: {
        primary: '#E0F7FF',
        secondary: '#B3E5FC',
        tertiary: '#81D4FA',
        muted: '#4FC3F7',
      },
      border: {
        subtle: 'rgba(0, 212, 255, 0.1)',
        medium: 'rgba(0, 212, 255, 0.2)',
        strong: 'rgba(0, 212, 255, 0.3)',
      },
      glass: {
        bg: 'rgba(0, 212, 255, 0.03)',
        bgHover: 'rgba(0, 212, 255, 0.08)',
        border: 'rgba(0, 212, 255, 0.15)',
      },
    },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Glow',
    description: 'Warm orange and pink gradients',
    colors: {
      background: {
        primary: '#1a0f0a',
        secondary: '#2d1810',
        tertiary: '#3d2218',
        elevated: '#4f2e22',
      },
      accent: {
        primary: '#FF8C42',
        secondary: '#FF6B9D',
        income: '#FFB347',
        expense: '#FF4757',
        savings: '#FFA07A',
      },
      text: {
        primary: '#FFF5E6',
        secondary: '#FFE4CC',
        tertiary: '#FFD4B3',
        muted: '#FFC499',
      },
      border: {
        subtle: 'rgba(255, 140, 66, 0.1)',
        medium: 'rgba(255, 140, 66, 0.2)',
        strong: 'rgba(255, 140, 66, 0.3)',
      },
      glass: {
        bg: 'rgba(255, 140, 66, 0.03)',
        bgHover: 'rgba(255, 140, 66, 0.08)',
        border: 'rgba(255, 140, 66, 0.15)',
      },
    },
  },
  monochrome: {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Pure grayscale elegance',
    colors: {
      background: {
        primary: '#000000',
        secondary: '#1a1a1a',
        tertiary: '#2a2a2a',
        elevated: '#3a3a3a',
      },
      accent: {
        primary: '#FFFFFF',
        secondary: '#CCCCCC',
        income: '#AAAAAA',
        expense: '#888888',
        savings: '#666666',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#CCCCCC',
        tertiary: '#999999',
        muted: '#666666',
      },
      border: {
        subtle: 'rgba(255, 255, 255, 0.08)',
        medium: 'rgba(255, 255, 255, 0.15)',
        strong: 'rgba(255, 255, 255, 0.25)',
      },
      glass: {
        bg: 'rgba(255, 255, 255, 0.03)',
        bgHover: 'rgba(255, 255, 255, 0.08)',
        border: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
};

export const getGradient = (type: 'income' | 'expense' | 'savings' | 'custom', customColors?: [string, string], themeId: ThemeId = 'midnight') => {
  if (type === 'custom' && customColors) {
    return `linear-gradient(135deg, ${customColors[0]} 0%, ${customColors[1]} 100%)`;
  }
  const theme = themes[themeId];
  if (type === 'income') return `linear-gradient(135deg, ${theme.colors.accent.income} 0%, ${theme.colors.accent.primary} 100%)`;
  if (type === 'expense') return `linear-gradient(135deg, ${theme.colors.accent.expense} 0%, #FF8A00 100%)`;
  if (type === 'savings') return `linear-gradient(135deg, ${theme.colors.accent.savings} 0%, ${theme.colors.accent.secondary} 100%)`;
  return `linear-gradient(135deg, ${theme.colors.accent.primary} 0%, ${theme.colors.accent.secondary} 100%)`;
};

export const getGlow = (type: 'income' | 'expense' | 'savings' | 'gold', themeId: ThemeId = 'midnight') => {
  const theme = themes[themeId];
  if (type === 'income') return `0 0 20px ${theme.colors.accent.income}50, 0 0 40px ${theme.colors.accent.income}30`;
  if (type === 'expense') return `0 0 20px ${theme.colors.accent.expense}50, 0 0 40px ${theme.colors.accent.expense}30`;
  if (type === 'savings') return `0 0 30px ${theme.colors.accent.savings}60, 0 0 60px ${theme.colors.accent.secondary}40`;
  if (type === 'gold') return `0 0 20px #FFD70050, 0 0 40px #FFD70030`;
  return `0 0 20px ${theme.colors.accent.primary}50, 0 0 40px ${theme.colors.accent.primary}30`;
};

export const getGlassStyle = (hover: boolean = false, themeId: ThemeId = 'midnight') => {
  const theme = themes[themeId];
  return {
    background: hover ? theme.colors.glass.bgHover : theme.colors.glass.bg,
    backdropFilter: 'blur(40px)',
    border: `1px solid ${hover ? theme.colors.border.medium : theme.colors.glass.border}`,
  };
};

// Export for use in components
export default themes;
