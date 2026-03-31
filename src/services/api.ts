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

api.interceptors.response.use(
  (response) => response,
  async (error) => {

    const originalRequest = error.config

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

        console.warn("Sesión expirada → logout global")

        // 🔥 ESTE ES EL CAMBIO IMPORTANTE
        emitLogout()

        return Promise.reject(err)

      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
