import { createI18n } from 'vue-i18n'

import { useGlobalStore } from '@/stores/global'

export const SUPPORT_LOCALES = ['zh', 'en', 'fr']

/**
 * 设置并初始化国际化实例
 * @param {Object} options - 配置对象，包含初始化i18n的选项，默认语言为'zh'。
 * @returns {Object} 返回初始化后的i18n实例。
 */
export function setupI18n(options = { locale: 'zh' }) {
  const globalStore = useGlobalStore()
  const { lang } = globalStore
  const i18n = createI18n({ ...options, allowComposition: true, legacy: false })
  setI18nLanguage(i18n, lang)
  return i18n
}

/**
 * 设置国际化语言
 * @param {Object} i18n - 国际化实例对象
 * @param {string} locale - 语言标识符
 */
export async function setI18nLanguage(i18n, locale) {
  await loadLocaleMessages(i18n, locale) // 加载指定语言
  localStorage.setItem('lang', locale) // 将当前语言设置存储到localStorage

  const globalStore = useGlobalStore()
  globalStore.setLang(locale) // 更新全局状态

  // 根据i18n的模式设置全局语言
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale
  } else {
    i18n.global.locale.value = locale
  }

  // 设置HTML文档的语言
  document.querySelector('html').setAttribute('lang', locale)
}

export async function loadLocaleMessages(i18n, locale) {
  // load locale messages with dynamic import
  const messages = await import(`../${locale}.js`)

  // set locale and locale message
  i18n.global.setLocaleMessage(locale, messages.default)
}