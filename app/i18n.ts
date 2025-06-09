import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './lang/en.json';
import frTranslations from './lang/fr.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      fr: {
        translation: frTranslations
      }
    },
    lng: 'fr', // Langue par défaut
    fallbackLng: 'en', // Langue de secours
    interpolation: {
      escapeValue: false // Non nécessaire pour React
    }
  });

export default i18n;
