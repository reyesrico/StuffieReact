import React, { useContext } from "react";
import { WeatherMoon24Regular, WeatherSunny24Regular, WeatherPartlyCloudyDay24Regular } from "@fluentui/react-icons";
import ThemeContext, { ThemeSetting } from "../../context/ThemeContext";

const Theme = () => {
  const { theme, themeSetting, setTheme } = useContext(ThemeContext);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const typeValues: ThemeSetting[] = ["light", "dark", "auto"];

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const onClick = (typeValue: ThemeSetting) => {
    setTheme(typeValue);
    setOpen(false);
  };

  const ThemeIcon = theme === "light" ? WeatherSunny24Regular : WeatherMoon24Regular;

  const OptionIcon = ({ value }: { value: ThemeSetting }) => {
    if (value === 'light') return <WeatherSunny24Regular />;
    if (value === 'dark') return <WeatherMoon24Regular />;
    return <WeatherPartlyCloudyDay24Regular />;
  };

  return (
    <div ref={ref} className="settings__dropdown-wrapper">
      <button className="settings__row" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className="settings__row-icon"><ThemeIcon /></span>
        <span className="settings__row-label">Theme</span>
        <span className="settings__row-badge">{themeSetting}</span>
      </button>
      {open && (
        <div className="settings__dropdown">
          {typeValues.map((typeValue) => (
            <button
              key={typeValue}
              className={`settings__dropdown-option${themeSetting === typeValue ? ' settings__dropdown-option--active' : ''}`}
              onClick={() => onClick(typeValue)}
            >
              <span className="settings__dropdown-option-icon"><OptionIcon value={typeValue} /></span>
              {typeValue}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Theme;
