import { createI18n } from 'vue-i18n'
import { useGlobalStore } from '@/stores/global'

export const SUPPORT_LOCALES = ['zh', 'en', 'fr']

export function setupI18n(options = { locale: 'zh' }) {
  const globalStore = useGlobalStore()
  const { lang } = globalStore
  const i18n = createI18n({ ...options, allowComposition: true, legacy: false })
  setI18nLanguage(i18n, lang)
  return i18n
}


export async function setI18nLanguage(i18n, locale) {
  await loadLocaleMessages(i18n, locale)
  localStorage.setItem('lang', locale)

  const globalStore = useGlobalStore()
  globalStore.setLang(locale)

  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale
  } else {
    i18n.global.locale.value = locale
  }

  /**
   * NOTE:
   * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
   * The following is an example for axios.
   *
   * axios.defaults.headers.common['Accept-Language'] = locale
   */
  document.querySelector('html').setAttribute('lang', locale)
}

export async function loadLocaleMessages(i18n, locale) {
  // load locale messages with dynamic import
  const messages = await import(
    /* webpackChunkName: "locale-[request]" */ `../${locale}.js`
  )

  // set locale and locale message
  i18n.global.setLocaleMessage(locale, messages.default)
}