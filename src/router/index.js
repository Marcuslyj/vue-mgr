import { createRouter, createWebHistory } from 'vue-router/auto'
import cusRoutes from './routes'
// import { SUPPORT_LOCALES, setI18nLanguage, loadLocaleMessages } from '@/common/lang/scripts/i18n'
// import { i18n } from '@/common/lang/scripts/i18n'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  extendRoutes:
    (routes) => ([].concat(routes, cusRoutes)),
})

// router.beforeEach(async (to, from, next) => {
//   debugger
//   const paramsLocale = to.params.locale

//   // // use locale if paramsLocale is not in SUPPORT_LOCALES
//   // if (!SUPPORT_LOCALES.includes(paramsLocale)) {
//   //   return next(`/${locale}`)
//   // }

//   // load locale messages
//   if (!i18n.global.availableLocales.includes(paramsLocale)) {
//     await loadLocaleMessages(i18n, paramsLocale)
//   }

//   // set i18n language
//   setI18nLanguage(i18n, paramsLocale)

//   return next()
// })

export default router
