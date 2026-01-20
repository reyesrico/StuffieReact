import React, { useContext } from "react";

import {
  Button,
  FluentProvider,
  makeStyles,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  webDarkTheme,
  webLightTheme,
} from "@fluentui/react-components";
import { WeatherMoon24Regular, WeatherSunny24Regular } from "@fluentui/react-icons";
import ThemeContext, { ThemeType } from "../../context/ThemeContext";
import { useThemeDetector } from "../../services/useThemeDetector";

import "./Theme.scss";

const useStyles = makeStyles({
  button: {
    backgroundColor: "transparent",
    color: "inherit",
  },
  buttonSelected: {
    backgroundColor: "transparent",
    borderBottom: "2px solid blue",
    color: "inherit",
  },
  popoverSurface: {
    padding: "12px",
  },
  triggerButton: {
    minWidth: "auto",
    padding: "6px",
  },
});

const Theme = () => {
  const autoTheme = useThemeDetector();
  const { theme, setTheme } = useContext(ThemeContext);

  // This is for controlling <Button> styles
  const [themeSelected, setThemeSelected] = React.useState<ThemeType | "auto">(theme);
  const [open, setOpen] = React.useState(false);
  const styles = useStyles();

  const typeValues: (ThemeType | "auto")[] = ["light", "dark", "auto"];

  const onClick = (typeValue: ThemeType | "auto") => {
    const themeChanged: ThemeType = typeValue === "auto" ? autoTheme : typeValue;
    setTheme(themeChanged);
    setThemeSelected(typeValue);
    localStorage.setItem("theme", typeValue);
    setOpen(false);
  };

  const buttonStyle = (typeValue: ThemeType | "auto") => {
    return themeSelected === typeValue ? styles.buttonSelected : styles.button;
  };

  const ThemeIcon = theme === "light" ? WeatherSunny24Regular : WeatherMoon24Regular;

  return (
    <FluentProvider theme={theme === "light" ? webLightTheme : webDarkTheme}>
      <Popover open={open} onOpenChange={(_, data) => setOpen(data.open)} positioning="below">
        <PopoverTrigger disableButtonEnhancement>
          <Button
            className={styles.triggerButton}
            appearance="subtle"
            icon={<ThemeIcon />}
          >
            Theme
          </Button>
        </PopoverTrigger>
        <PopoverSurface className={styles.popoverSurface}>
          <div className="stuffie__theme">
            <div className="stuffie__theme-title">Theme</div>
            <div className="theme__buttons-container">
              {typeValues.map((typeValue) => (
                <Button
                  className={buttonStyle(typeValue)}
                  key={typeValue}
                  onClick={() => onClick(typeValue)}
                  shape="rounded"
                  appearance="subtle"
                  size="small"
                >
                  {typeValue}
                </Button>
              ))}
            </div>
          </div>
        </PopoverSurface>
      </Popover>
    </FluentProvider>
  );
};

export default Theme;
