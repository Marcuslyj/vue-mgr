<script setup>
import { setI18nLanguage } from '@/lang/scripts/i18n'
import { useGlobalStore } from '@/stores/global'

const globalStore = useGlobalStore()

const lang = ref(globalStore.lang)
const instance = getCurrentInstance()
const setLang = (lang) => {
  const app = instance.appContext.app
  setI18nLanguage(app.__VUE_I18N__, lang)
}
</script>

<template>
  <main>
    <!-- <h1 class="title tw-comp">home<span class="underline">kk</span></h1> -->
    <el-select class="!w-[100px]" v-model="lang" @change="setLang">
      <el-option label="中文" value="zh"></el-option>
      <el-option label="English" value="en"></el-option>
      <el-option label="Français" value="fr"></el-option>
    </el-select>

    <h1>{{ $t('setting.close') }}</h1>
    <h1>{{ $t('setting.open') }}</h1>
    <h1>{{ $t('setting.home') }}</h1>
    <h1>{{ $t('customer.column.gender.male') }}</h1>
  </main>
</template>

<style lang="scss" scoped>
.tw-comp {
  @apply text-[30px] text-[red] hover:text-slate-50;
}
</style>
