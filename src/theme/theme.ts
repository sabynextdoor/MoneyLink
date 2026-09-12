// ============================================================================
// CASHFLOW COACH — LUXURY THEME SYSTEM
// "Neo-Academia meets Spatial FinTech"
// ============================================================================

export const theme = {
  // === COLOR PALETTE: Deep Space & Bioluminescence ===
  colors: {
    // Background Void
    void: {
      primary: '#050505',
      deep: '#0A0A0F',
      obsidian: '#0D0D14',
      abyss: '#111118',
    },
    
    // Glass Surfaces
    glass: {
      surface: 'rgba(255, 255, 255, 0.03)',
      surfaceHover: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 255, 255, 0.08)',
      borderHover: 'rgba(255, 255, 255, 0.15)',
      blur: 'blur(40px)',
    },
    
    // Income/Energy (Positive Flow)
    income: {
      primary: '#00FFA3',    // Cyber Mint
      secondary: '#00E5FF',  // Plasma Cyan
      glow: '0 0 40px rgba(0, 255, 163, 0.4)',
      gradient: 'linear-gradient(135deg, #00FFA3 0%, #00E5FF 100%)',
    },
    
    // Expense/Gravity (Negative Flow)
    expense: {
      primary: '#FF2A6D',    // Neon Crimson
      secondary: '#FF8A00',  // Solar Flare
      glow: '0 0 40px rgba(255, 42, 109, 0.4)',
      gradient: 'linear-gradient(135deg, #FF2A6D 0%, #FF8A00 100%)',
    },
    
    // Savings Target (The Core)
    savings: {
      primary: '#7000FF',    // Ultraviolet
      secondary: '#B100FF',  // Magenta
      glow: '0 0 60px rgba(112, 0, 255, 0.5)',
      gradient: 'linear-gradient(135deg, #7000FF 0%, #B100FF 100%)',
    },
    
    // Text Hierarchy
    text: {
      primary: '#F8FAFC',    // Crisp White
      secondary: '#94A3B8',  // Slate Gray
      tertiary: '#64748B',   // Muted Slate
      disabled: '#475569',   // Deep Slate
    },
    
    // Accents
    accent: {
      gold: '#FFD700',       // Luxury Gold
      platinum: '#E5E4E2',   // Platinum
      diamond: '#B9F2FF',    // Diamond Blue
    },
  },
  
  // === TYPOGRAPHY ===
  typography: {
    // Font Families
    fontFamily: {
      display: '"Space Grotesk", "Syne", sans-serif',
      body: '"Inter", "Geist", sans-serif',
      mono: '"JetBrains Mono", "Geist Mono", monospace',
    },
    
    // Font Sizes (using clamp for fluid scaling)
    fontSize: {
      hero: 'clamp(4rem, 10vw, 12rem)',
      h1: 'clamp(3rem, 6vw, 6rem)',
      h2: 'clamp(2rem, 4vw, 4rem)',
      h3: 'clamp(1.5rem, 3vw, 2.5rem)',
      h4: 'clamp(1.25rem, 2vw, 1.75rem)',
      body: 'clamp(1rem, 1.2vw, 1.125rem)',
      small: 'clamp(0.875rem, 1vw, 1rem)',
      tiny: '0.75rem',
    },
    
    // Font Weights
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900,
    },
    
    // Line Heights
    lineHeight: {
      tight: 1.1,
      snug: 1.3,
      normal: 1.5,
      relaxed: 1.75,
    },
    
    // Letter Spacing
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.05em',
      wider: '0.1em',
    },
  },
  
  // === SPACING (8pt Grid System) ===
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '1rem',      // 16px
    md: '1.5rem',    // 24px
    lg: '2rem',      // 32px
    xl: '3rem',      // 48px
    '2xl': '4rem',   // 64px
    '3xl': '6rem',   // 96px
    '4xl': '8rem',   // 128px
  },
  
  // === BORDERS & RADII ===
  borders: {
    radius: {
      none: '0',
      sm: '0.5rem',    // 8px
      md: '1rem',      // 16px
      lg: '1.5rem',    // 24px
      xl: '2rem',      // 32px
      '2xl': '3rem',   // 48px
      full: '9999px',
    },
    
    width: {
      hairline: '1px',
      thin: '2px',
      medium: '3px',
      thick: '4px',
    },
  },
  
  // === SHADOWS & GLOWS ===
  shadows: {
    // Glass Shadows
    glass: {
      sm: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      md: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      lg: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
      xl: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    },
    
    // Neon Glows
    glow: {
      mint: '0 0 20px rgba(0, 255, 163, 0.3), 0 0 40px rgba(0, 255, 163, 0.2)',
      cyan: '0 0 20px rgba(0, 229, 255, 0.3), 0 0 40px rgba(0, 229, 255, 0.2)',
      crimson: '0 0 20px rgba(255, 42, 109, 0.3), 0 0 40px rgba(255, 42, 109, 0.2)',
      violet: '0 0 30px rgba(112, 0, 255, 0.4), 0 0 60px rgba(177, 0, 255, 0.3)',
      gold: '0 0 20px rgba(255, 215, 0, 0.3), 0 0 40px rgba(255, 215, 0, 0.2)',
    },
    
    // Inner Glows
    inner: {
      sm: 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.05)',
      md: 'inset 0 4px 8px 0 rgba(255, 255, 255, 0.08)',
      lg: 'inset 0 8px 16px 0 rgba(255, 255, 255, 0.1)',
    },
  },
  
  // === ANIMATIONS & TRANSITIONS ===
  animations: {
    // Easing Curves
    easing: {
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.16, 1, 0.3, 1)',
      expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
    
    // Durations
    duration: {
      instant: '0.1s',
      fast: '0.2s',
      normal: '0.3s',
      slow: '0.5s',
      slower: '0.8s',
      cinematic: '1.2s',
    },
  },
  
  // === Z-INDEX LAYERS ===
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    fixed: 300,
    modal: 400,
    popover: 500,
    tooltip: 600,
    cursor: 9999,
  },
  
  // === BREAKPOINTS ===
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// === UTILITY FUNCTIONS ===

export const getGradient = (type: 'income' | 'expense' | 'savings' | 'custom', customColors?: [string, string]) => {
  if (type === 'custom' && customColors) {
    return `linear-gradient(135deg, ${customColors[0]} 0%, ${customColors[1]} 100%)`;
  }
  if (type === 'income') return theme.colors.income.gradient;
  if (type === 'expense') return theme.colors.expense.gradient;
  if (type === 'savings') return theme.colors.savings.gradient;
  return theme.colors.income.gradient;
};

export const getGlow = (type: 'income' | 'expense' | 'savings' | 'gold') => {
  if (type === 'income') return theme.shadows.glow.mint;
  if (type === 'expense') return theme.shadows.glow.crimson;
  if (type === 'savings') return theme.shadows.glow.violet;
  if (type === 'gold') return theme.shadows.glow.gold;
  return theme.shadows.glow.mint;
};

export const getGlassStyle = (hover: boolean = false) => ({
  background: hover ? theme.colors.glass.surfaceHover : theme.colors.glass.surface,
  backdropFilter: theme.colors.glass.blur,
  border: `${theme.borders.width.hairline} solid ${hover ? theme.colors.glass.borderHover : theme.colors.glass.border}`,
});

// Export for use in components
export default theme;
