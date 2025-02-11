import React, { useContext } from "react";

import { Button, FluentProvider, webDarkTheme, webLightTheme } from "@fluentui/react-components";
import ThemeContext, { ThemeType } from "../../context/ThemeContext";
import { useThemeDetector } from "../../services/useThemeDetector";

const Theme = () => {
  const  { theme, setTheme } = useContext(ThemeContext);
  const autoTheme = useThemeDetector();

  const typeValues: (ThemeType | "auto")[] = ["light", "dark", "auto"];

  const onClick = (typeValue: ThemeType | "auto") => {
    const themeChanged: ThemeType = typeValue === "auto" ? autoTheme : typeValue;
    setTheme(themeChanged)
  }
  
  return (
    <div className="stuffie__theme">
      <div className="stuffie__theme-title">
        Theme - {theme}
      </div>
      <FluentProvider theme={theme === "light" ? webLightTheme : webDarkTheme}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}> { /* className="stuffie__theme-content" */ }
            {typeValues.map((typeValue) => (
              <Button
                key={typeValue}
                onClick={() => onClick(typeValue)}
                shape="rounded"
                appearance="primary"
                size="small"
                disabled={typeValue === theme}
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
