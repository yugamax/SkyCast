import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemePreset = 'deep-indigo' | 'mint';
export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  themePreset: ThemePreset;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setThemePreset: (preset: ThemePreset) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themePreset, setThemePresetState] = useState<ThemePreset>(() => {
    const saved = localStorage.getItem('skycast_theme_preset') as ThemePreset;
    return (saved === 'deep-indigo' || saved === 'mint') ? saved : 'deep-indigo';
  });

  // Permanently enforce dark theme
  const theme: Theme = 'dark';

  useEffect(() => {
    localStorage.setItem('skycast_theme_preset', themePreset);
    localStorage.setItem('skycast_theme', 'dark');

    // Remove legacy light classes
    document.documentElement.classList.remove('theme-light', 'light');
    document.body.classList.remove('theme-light', 'light-theme');

    // Add dark tactical classes
    document.documentElement.classList.add(`theme-${themePreset}`, 'dark');
    document.body.classList.add(`theme-${themePreset}`, 'dark-theme');
  }, [themePreset]);

  const toggleTheme = () => {
    // Light mode removed: keep dark theme locked
  };

  const setTheme = (_t: Theme) => {
    // Light mode removed: always dark
  };

  const setThemePreset = (preset: ThemePreset) => {
    setThemePresetState(preset);
  };

  return (
    <ThemeContext.Provider value={{ theme, themePreset, toggleTheme, setTheme, setThemePreset }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
