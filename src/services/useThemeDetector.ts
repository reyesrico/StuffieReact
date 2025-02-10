import React, { useEffect, useState } from "react";
import { ThemeType } from "../context/ThemeContext";

export const useThemeDetector = () => {
  const [autoTheme, setAutoTheme] = useState<ThemeType>("light");

  const getSystemTheme = ():  ThemeType => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
  };
  
  useEffect(() => {
    setAutoTheme(getSystemTheme());
  }, []);

  return autoTheme;
}
