import React, { useContext, useEffect } from "react";

import Button from "../shared/Button";
import ThemeContext from "../../context/ThemeContext";
import { useThemeDetector } from "../../services/useThemeDetector";

const Theme = () => {
  const  { theme, setTheme } = useContext(ThemeContext);
  const autoTheme = useThemeDetector();
  
  return (
    <div className="stuffie__theme">
      <div className="stuffie__theme-title">
        Theme - {theme}
      </div>
      <div className="stuffie__theme-content">
        <Button text={"light"} onClick={() => setTheme("light")} />
        <Button text={"dark"} onClick={() => setTheme("dark")}/>
        <Button text={"auto (system)"} onClick={() => setTheme(autoTheme)} />
      </div>
    </div>
  );
};

export default Theme;
