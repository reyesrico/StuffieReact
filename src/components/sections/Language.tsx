import React, { useContext } from "react";
import { useTranslation } from "react-i18next";

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
import { LocalLanguage24Regular } from "@fluentui/react-icons";
import ThemeContext from "../../context/ThemeContext";
import { options } from "../../config/options";

import "./Language.scss";

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

const Language = () => {
  const { theme } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();

  const [languageSelected, setLanguageSelected] = React.useState(i18n.language);
  const [open, setOpen] = React.useState(false);
  const styles = useStyles();

  const onClick = (langValue: string) => {
    i18n.changeLanguage(langValue);
    setLanguageSelected(langValue);
    setOpen(false);
  };

  const buttonStyle = (langValue: string) => {
    return languageSelected === langValue ? styles.buttonSelected : styles.button;
  };

  return (
    <FluentProvider theme={theme === "light" ? webLightTheme : webDarkTheme}>
      <Popover open={open} onOpenChange={(_, data) => setOpen(data.open)} positioning="below">
        <PopoverTrigger disableButtonEnhancement>
          <Button
            className={styles.triggerButton}
            appearance="subtle"
            icon={<LocalLanguage24Regular />}
          >
            {t('Language')}
          </Button>
        </PopoverTrigger>
        <PopoverSurface className={styles.popoverSurface}>
          <div className="stuffie__language">
            <div className="stuffie__language-title">{t('Language')}</div>
            <div className="language__buttons-container">
              {options.map((option) => (
                <Button
                  className={buttonStyle(option.value)}
                  key={option.value}
                  onClick={() => onClick(option.value)}
                  shape="rounded"
                  appearance="subtle"
                  size="small"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </PopoverSurface>
      </Popover>
    </FluentProvider>
  );
};

export default Language;
