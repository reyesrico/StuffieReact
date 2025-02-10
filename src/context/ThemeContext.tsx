import React, { createContext } from 'react';

export type ThemeType = 'light' | 'dark';

export type ThemeContext = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
};

const ThemeContext = createContext<ThemeContext>({ theme: 'light', setTheme: () => {} });

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeType] = React.useState<ThemeType>('light');

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