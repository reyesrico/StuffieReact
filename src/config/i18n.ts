import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locale/en.json';
import es from '../locale/es.json';

i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    resources: {
      en,
      es,
    },
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    ns: ['translations'],
    defaultNS: 'translations',
    keySeparator: false,
    interpolation: {
      escapeValue: false,
      formatSeparator: ',',
    },
  }, (err, _t) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.info('i18n.language', i18n.language);
    }
  });

export default i18n;
