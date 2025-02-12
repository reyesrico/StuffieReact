import React, { useContext } from "react";

import { Button, FluentProvider, makeStyles, webDarkTheme, webLightTheme } from "@fluentui/react-components";
import ThemeContext, { ThemeType } from "../../context/ThemeContext";
import { useThemeDetector } from "../../services/useThemeDetector";

import "./Theme.scss";

const useStyles = makeStyles({
  button: {
    backgroundColor: "transparent",
    color: "black",
  },
  buttonSelected: {
    backgroundColor: "transparent",
    borderBottom: "2px solid blue",
    color: "black",
  }
});

const Theme = () => {
  const autoTheme = useThemeDetector();
  const  { theme, setTheme } = useContext(ThemeContext);

  // This is for controlling <Button> styles
  const [themeSelected, setThemeSelected] = React.useState<ThemeType | "auto">(theme);
  const styles = useStyles();

  const typeValues: (ThemeType | "auto")[] = ["light", "dark", "auto"];

  const onClick = (typeValue: ThemeType | "auto") => {
    const themeChanged: ThemeType = typeValue === "auto" ? autoTheme : typeValue;
    setTheme(themeChanged)
    setThemeSelected(typeValue);
    localStorage.setItem("theme", typeValue);
  }

  const buttonStyle = (typeValue: ThemeType | "auto") => {
    return themeSelected === typeValue ? styles.buttonSelected : styles.button;
  }
  
  return (
    <div className="stuffie__theme">
      <div className="stuffie__theme-title">
        Theme
      </div>
      <FluentProvider theme={theme === "light" ? webLightTheme : webDarkTheme}>
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
      </FluentProvider>
    </div>
  );
};

export default Theme;
