import React, { createContext } from 'react';
import { useThemeDetector } from '../services/useThemeDetector';
import { use } from 'i18next';

export type ThemeType = 'light' | 'dark';

export type ThemeContext = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
};

const useInitTheme = () => {
  const autoTheme = useThemeDetector();
  const savedTheme = (localStorage.getItem('theme') as ThemeType | "auto") || "light";
  return savedTheme === "auto" ? autoTheme : savedTheme;
}

const ThemeContext = createContext<ThemeContext>({
  theme: "light",
  setTheme: () => {}
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const initTheme = useInitTheme();
  const [theme, setThemeType] = React.useState<ThemeType>(initTheme);

  const setTheme = (theme: ThemeType) => {
    setThemeType(theme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;