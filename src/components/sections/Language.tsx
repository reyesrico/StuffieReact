import React from "react";
import { useTranslation } from "react-i18next";
import { LocalLanguage20Regular } from "@fluentui/react-icons";
import { options } from "../../config/options";

const Language = () => {
  const { t, i18n } = useTranslation();
  const [languageSelected, setLanguageSelected] = React.useState(i18n.language);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const onClick = (langValue: string) => {
    i18n.changeLanguage(langValue);
    setLanguageSelected(langValue);
    setOpen(false);
  };

  return (
    <div ref={ref} className="settings__dropdown-wrapper">
      <button className="settings__row" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className="settings__row-icon"><LocalLanguage20Regular /></span>
        <span className="settings__row-label">{t('Language')}</span>
        <span className="settings__row-badge">{languageSelected.slice(0, 2).toUpperCase()}</span>
      </button>
      {open && (
        <div className="settings__dropdown">
          {options.map((option) => (
            <button
              key={option.value}
              className={`settings__dropdown-option${languageSelected === option.value ? ' settings__dropdown-option--active' : ''}`}
              onClick={() => onClick(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Language;
