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

if (import.meta.env.PROD) {
  console.log = () => { }
  console.warn = () => { }
}

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
  },
})

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    window.location.reload()
  }
})

async function bootstrap() {
  try {
    await api.get("/csrf/")
  } catch (error) {
    if (!import.meta.env.PROD) {
      console.error("Error obteniendo CSRF", error)
    }
  }

  const app = createApp(App)

  app.use(createPinia())
  app.use(router)
  app.use(vuetify)
  app.mount('#app')

  let checkingSession = false

  window.addEventListener("focus", async () => {
    if (checkingSession) return
    checkingSession = true

    try {
      const isAuth = await checkSession()
      if (!isAuth && window.location.pathname !== "/login") {
        window.location.replace("/login")
      }
    } finally {
      setTimeout(() => {
        checkingSession = false
      }, 1000)
    }
  })

  window.addEventListener("force-logout", () => {
    sessionStorage.clear()
    localStorage.clear()
    window.location.replace('/login')
  })


  const isAuth = await checkSession()

  if (isAuth) {
    initSessionTimeout()
  }

}

bootstrap()
