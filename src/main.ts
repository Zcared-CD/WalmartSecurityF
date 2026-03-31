import './assets/main.css'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { initSessionTimeout } from "@/services/sessionTimeout"
import { checkSession } from "@/services/auth"

import App from './App.vue'
import router from './router'
import api from "@/services/api"

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
  },
})

async function bootstrap() {
  try {
    await api.get("/csrf/")
  } catch (error) {
    console.error("Error obteniendo CSRF", error)
  }

  const app = createApp(App)

  app.use(createPinia())
  app.use(router)
  app.use(vuetify)
  app.mount('#app')

  const isAuth = await checkSession()

  if (isAuth) {
    initSessionTimeout()
  }

  setInterval(async () => {
    const stillAuth = await checkSession()

    if (!stillAuth) {
      window.location.replace('/login')
    }
  }, 15000)
}


bootstrap()
