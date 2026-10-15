import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import am from './locales/am.json'
import en from './locales/en.json'

const requestedLanguage = new URLSearchParams(window.location.search).get('lang')
const savedLanguage = localStorage.getItem('delala-language')
const initialLanguage = ['am', 'en'].includes(requestedLanguage)
  ? requestedLanguage
  : ['am', 'en'].includes(savedLanguage) ? savedLanguage : 'am'

i18n.use(initReactI18next).init({
  resources: { am: { translation: am }, en: { translation: en } },
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (language) => {
  localStorage.setItem('delala-language', language)
  const url = new URL(window.location.href)
  url.searchParams.set('lang', language)
  window.history.replaceState(window.history.state, '', url)
})

export default i18n
