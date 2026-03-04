import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from './locales/en/common.json'
import esCommon from './locales/es/common.json'

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      es: { common: esCommon },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    defaultNS: 'common',
    ns: ['common'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    load: 'languageOnly',
  })

// Ensure <html lang="..."> reflects the active language
const updateHtmlLang = () => {
  if (typeof document === 'undefined') return
  const lang = i18n.language && i18n.language.startsWith('es') ? 'es' : 'en'
  document.documentElement.lang = lang
}

i18n.on('initialized', updateHtmlLang)
i18n.on('languageChanged', updateHtmlLang)

export default i18n

