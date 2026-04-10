import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const csrfToken = Cookies.get('csrftoken')
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken
  }
  return config
})

const emitLogout = () => {
  window.dispatchEvent(new Event("force-logout"))
}

let isRefreshing = false
let failedQueue: any[] = []
let isLoggingOut = false


const processQueue = (error: any) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

const isFrontendLog = (url: string) =>
  url.includes('/api/frontend-log/')


const sendLogToBackend = async (error: any) => {
  try {
    await api.post('/api/frontend-log/', {
      type: "FRONTEND_ERROR",
      message: error?.message || "Error desconocido",
      url: window.location.href,
      userAgent: navigator.userAgent,
    })
  } catch {
  }
}

let requestCount = 0
let lastReset = Date.now()

const detectSpam = () => {
  requestCount++

  const now = Date.now()

  if (now - lastReset > 5000) {
    requestCount = 0
    lastReset = now
  }

  if (requestCount > 20) {
    sendLogToBackend({
      message: "Posible spam detectado"
    })
  }
}

const detectBot = () => {
  const ua = navigator.userAgent.toLowerCase()

  const bots = ["curl", "wget", "python", "postman", "insomnia", "httpie"]

  if (bots.some(bot => ua.includes(bot))) {
    sendLogToBackend({
      message: "Posible bot detectado"
    })
  }
}

api.interceptors.response.use(
  (response) => {
    detectSpam()
    detectBot()
    return response
  },

  async (error) => {

    const originalRequest = error.config

    if (isFrontendLog(originalRequest?.url || "")) {
      return Promise.reject(error)
    }

    if (
      error.response?.status === 401 &&
      originalRequest?.url?.includes('/api/check-session/')
    ) {
      return Promise.reject(error)
    }

    if (isLoggingOut) return Promise.reject(error)

    const ignoreUrls = [
      '/refresh/',
      '/api/login/',
      '/api/logout/',
      '/api/verificar-totp/',
      '/api/check-session/',
      '/csrf/',
      '/api/session-expired/',
    ]

    if (ignoreUrls.some(url => originalRequest.url.includes(url))) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => api(originalRequest))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await api.post('/refresh/')
        processQueue(null)
        return api(originalRequest)

      } catch (err) {

        processQueue(err)
        isLoggingOut = true

        if (!import.meta.env.PROD) {
          console.warn("Sesión expirada → logout global")
        }

        emitLogout()

        return Promise.reject(err)

      } finally {
        isRefreshing = false
      }
    }

    if (import.meta.env.PROD) {
      sendLogToBackend(error)
    }

    return Promise.reject(error)
  }
)

export default api
