<script setup>
import { ElButton } from 'element-plus'
import { getCurrentInstance } from 'vue'

// import TheWelcome from '../components/TheWelcome.vue'
import { setI18nLanguage } from '@/lang/scripts/i18n'
import { useGlobalStore } from '@/stores/global'

const globalStore = useGlobalStore()

const instance = getCurrentInstance()
const setLang = (lang) => {
  const app = instance.appContext.app
  setI18nLanguage(app.__VUE_I18N__, lang)
}
const btnActive = (lang) => (globalStore.lang === lang ? 'primary' : 'default')
</script>

<template>
  <main>
    <!-- <TheWelcome /> -->
    <!-- <h1 class="title tw-comp">home<span class="underline">kk</span></h1> -->
    <ElButton :type="btnActive('zh')" @click="setLang('zh')">中文</ElButton>
    <ElButton :type="btnActive('en')" @click="setLang('en')">English</ElButton>
    <ElButton :type="btnActive('fr')" @click="setLang('fr')">Français</ElButton>

    <h1>{{ $t('setting.close') }}</h1>
    <h1>{{ $t('setting.open') }}</h1>
    <h1>{{ $t('setting.home') }}</h1>
  </main>
</template>

<style lang="scss" scoped>
.tw-comp {
  @apply text-[30px] text-[red] hover:text-slate-50;
}
</style>
