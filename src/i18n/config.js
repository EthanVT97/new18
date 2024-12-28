import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en/translation.json';
import myTranslation from './locales/my/translation.json';
import thTranslation from './locales/th/translation.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  my: {
    translation: myTranslation,
  },
  th: {
    translation: thTranslation,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
