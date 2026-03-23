import React, { createContext, useContext, useCallback } from 'react';
import { useThemeDetector } from '../services/useThemeDetector';

export type ThemeType = 'light' | 'dark';

export type ThemeContextType = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
};

/**
 * Hook to get initial theme from localStorage or OS preference
 */
const useInitTheme = (): ThemeType => {
  const autoTheme = useThemeDetector();
  const savedTheme = (localStorage.getItem('theme') as ThemeType | 'auto') || 'auto';
  return savedTheme === 'auto' ? autoTheme : savedTheme;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {}
});

/**
 * ThemeProvider - Provides theme context to the entire app
 * 
 * Features:
 * - Persists theme choice to localStorage
 * - Respects OS theme preference when set to 'auto'
 * - Provides light/dark theme across all components
 */
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const initTheme = useInitTheme();
  const [theme, setThemeType] = React.useState<ThemeType>(initTheme);

  const setTheme = useCallback((newTheme: ThemeType) => {
    setThemeType(newTheme);
    localStorage.setItem('theme', newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to access theme context
 * Usage: const { theme, setTheme } = useTheme();
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;