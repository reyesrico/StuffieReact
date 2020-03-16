import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locale/en';
import es from '../locale/es';

i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    resources: {
      en,
      es,
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV !== 'production',
    ns: ['translations'],
    defaultNS: 'translations',
    keySeparator: false,
    interpolation: {
      escapeValue: false,
      formatSeparator: ',',
    },
    react: {
      wait: true,
    },
  }, (err, t) => {
    if (err) {
      console.log(err);
      console.log(t);
      console.info('i18n.language', i18n.language);
    }
  });

export default i18n;
