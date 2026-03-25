import { useEffect, useState } from "react";
import { ThemeType } from "../context/ThemeContext";

/**
 * Hook to detect theme based on time of day
 * Light: 6 AM to 6 PM (6:00 - 18:00)
 * Dark: 6 PM to 6 AM (18:00 - 6:00)
 */
export const useThemeDetector = () => {
  const getTimeBasedTheme = (): ThemeType => {
    const hour = new Date().getHours();
    // Light mode from 6 AM (6) to 6 PM (18)
    return hour >= 6 && hour < 18 ? "light" : "dark";
  };

  const [autoTheme, setAutoTheme] = useState<ThemeType>(getTimeBasedTheme);

  useEffect(() => {
    // Update theme immediately
    setAutoTheme(getTimeBasedTheme());

    // Check every minute in case the hour changes while app is open
    const interval = setInterval(() => {
      setAutoTheme(getTimeBasedTheme());
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  return autoTheme;
}
