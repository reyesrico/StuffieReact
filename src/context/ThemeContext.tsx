import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { useThemeDetector } from '../hooks/useThemeDetector';

export type ThemeType = 'light' | 'dark';
export type ThemeSetting = ThemeType | 'auto';

export type ThemeContextType = {
  theme: ThemeType;
  themeSetting: ThemeSetting;
  setTheme: (theme: ThemeSetting) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  themeSetting: 'auto',
  setTheme: () => {}
});

/**
 * ThemeProvider - Provides theme context to the entire app
 * 
 * Features:
 * - Persists theme choice to localStorage
 * - Auto mode: switches based on time of day (6 AM - 6 PM light, 6 PM - 6 AM dark)
 * - Provides light/dark theme across all components
 */
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const autoTheme = useThemeDetector();
  const savedSetting = (localStorage.getItem('theme') as ThemeSetting) || 'auto';
  
  const [themeSetting, setThemeSetting] = React.useState<ThemeSetting>(savedSetting);
  const [theme, setThemeType] = React.useState<ThemeType>(
    savedSetting === 'auto' ? autoTheme : savedSetting
  );

  // Update theme when autoTheme changes (time-based) and we're in auto mode
  useEffect(() => {
    if (themeSetting === 'auto') {
      setThemeType(autoTheme);
    }
  }, [autoTheme, themeSetting]);

  const setTheme = useCallback((newSetting: ThemeSetting) => {
    setThemeSetting(newSetting);
    localStorage.setItem('theme', newSetting);
    
    if (newSetting === 'auto') {
      // Will be handled by useEffect above
    } else {
      setThemeType(newSetting);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, themeSetting, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to access theme context
 * Usage: const { theme, themeSetting, setTheme } = useTheme();
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;