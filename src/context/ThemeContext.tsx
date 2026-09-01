import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeMode, ThemeConfig } from '../types';

export const THEME_CONFIGS: Record<ThemeMode, ThemeConfig> = {
  'yellow-blue': {
    id: 'yellow-blue',
    name: 'Amber Gold & Slate Blue',
    shortName: 'Yellow & Blue',
    accent: '#F5B041',
    accentHover: '#E5A030',
    accentLight: '#FDE68A',
    accentSecondary: '#E8664A',
    bgBase: '#081018',
    bgCard: 'rgba(14, 23, 33, 0.72)',
    badgeBg: 'bg-[#F5B041]',
    badgeText: 'text-[#081018]',
    dotColor: '#F5B041',
    gradient: 'from-[#F5B041] to-[#E8664A]',
    description: 'Original signature Gold Amber accent paired with deep slate-blue glassmorphism.',
  },
  'red-blue': {
    id: 'red-blue',
    name: 'Crimson Rose & Midnight Blue',
    shortName: 'Red & Blue',
    accent: '#F43F5E',
    accentHover: '#E11D48',
    accentLight: '#FECDD3',
    accentSecondary: '#FB7185',
    bgBase: '#080D1A',
    bgCard: 'rgba(13, 20, 36, 0.75)',
    badgeBg: 'bg-[#F43F5E]',
    badgeText: 'text-white',
    dotColor: '#F43F5E',
    gradient: 'from-[#F43F5E] to-[#E11D48]',
    description: 'Vibrant crimson rose accents contrasted against dark midnight-blue glass.',
  },
  'green-blue': {
    id: 'green-blue',
    name: 'Emerald Mint & Cobalt Blue',
    shortName: 'Green & Blue',
    accent: '#10B981',
    accentHover: '#059669',
    accentLight: '#A7F3D0',
    accentSecondary: '#06B6D4',
    bgBase: '#06111C',
    bgCard: 'rgba(10, 24, 38, 0.75)',
    badgeBg: 'bg-[#10B981]',
    badgeText: 'text-[#06111C]',
    dotColor: '#10B981',
    gradient: 'from-[#10B981] to-[#06B6D4]',
    description: 'Electric emerald & mint highlights layered over deep ocean cobalt navy.',
  },
};

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  themeConfig: ThemeConfig;
  availableThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('claimsync_theme_mode');
      if (saved && (saved === 'yellow-blue' || saved === 'red-blue' || saved === 'green-blue')) {
        return saved as ThemeMode;
      }
    } catch {
      // Ignore localStorage errors
    }
    return 'yellow-blue';
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('claimsync_theme_mode', newTheme);
    } catch {
      // Ignore localStorage errors
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    
    // Set custom CSS variables directly on root
    const config = THEME_CONFIGS[theme];
    root.style.setProperty('--color-accent', config.accent);
    root.style.setProperty('--color-accent-hover', config.accentHover);
    root.style.setProperty('--color-accent-light', config.accentLight);
    root.style.setProperty('--color-accent-secondary', config.accentSecondary);
    root.style.setProperty('--color-slate-bg', config.bgBase);
    root.style.setProperty('--color-slate-card', config.bgCard);
    
    // RGB components for rgba() construction
    if (theme === 'yellow-blue') {
      root.style.setProperty('--color-accent-rgb', '245, 176, 65');
      root.style.setProperty('--color-accent-subtle', 'rgba(245, 176, 65, 0.15)');
      root.style.setProperty('--color-accent-border', 'rgba(245, 176, 65, 0.35)');
      root.style.setProperty('--color-accent-glow', 'rgba(245, 176, 65, 0.25)');
    } else if (theme === 'red-blue') {
      root.style.setProperty('--color-accent-rgb', '244, 63, 94');
      root.style.setProperty('--color-accent-subtle', 'rgba(244, 63, 94, 0.15)');
      root.style.setProperty('--color-accent-border', 'rgba(244, 63, 94, 0.35)');
      root.style.setProperty('--color-accent-glow', 'rgba(244, 63, 94, 0.25)');
    } else if (theme === 'green-blue') {
      root.style.setProperty('--color-accent-rgb', '16, 185, 129');
      root.style.setProperty('--color-accent-subtle', 'rgba(16, 185, 129, 0.15)');
      root.style.setProperty('--color-accent-border', 'rgba(16, 185, 129, 0.35)');
      root.style.setProperty('--color-accent-glow', 'rgba(16, 185, 129, 0.25)');
    }
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    themeConfig: THEME_CONFIGS[theme],
    availableThemes: Object.values(THEME_CONFIGS),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
