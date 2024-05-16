import './assets/main.css'
import "tailwindcss/tailwind.css"

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { setupI18n } from '@/common/lang/scripts/i18n'


const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(setupI18n())
app.mount('#app')

console.log(app)

