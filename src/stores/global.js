import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const locales = {};
export const useGlobalStore = defineStore('global', () => {
  const initLang = localStorage.getItem('lang') || 'zh'
  const lang = ref(initLang)
  const activeLang = computed(() => locales[lang.value])
  const setLang = (l) => lang.value = l

  return { lang, activeLang, setLang }
})
