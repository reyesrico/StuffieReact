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
import ThemeContext, { ThemeSetting } from "../../context/ThemeContext";

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
  const { theme, themeSetting, setTheme } = useContext(ThemeContext);
  const [open, setOpen] = React.useState(false);
  const styles = useStyles();

  const typeValues: ThemeSetting[] = ["light", "dark", "auto"];

  const onClick = (typeValue: ThemeSetting) => {
    setTheme(typeValue);
    setOpen(false);
  };

  const buttonStyle = (typeValue: ThemeSetting) => {
    return themeSetting === typeValue ? styles.buttonSelected : styles.button;
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
