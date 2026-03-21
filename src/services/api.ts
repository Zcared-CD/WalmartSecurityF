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

let isRefreshing = false
let failedQueue: any[] = []

// ✅ Ahora procesa la cola con éxito o error claramente
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

// ✅ Función centralizada para limpiar y redirigir al login
const forceLogout = () => {
  isRefreshing = false
  failedQueue = []
  // Limpia cualquier dato local
  localStorage.removeItem('username')
  localStorage.removeItem('totp_step')
  localStorage.removeItem('totp_qr')
  // Redirige al login
  window.location.href = '/'
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/refresh/') &&
      !originalRequest.url.includes('/api/check-session/') &&
      !originalRequest.url.includes('/api/login/') &&
      !originalRequest.url.includes('/api/logout/')
    ) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => api(originalRequest))
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await api.post('/refresh/')
        processQueue(null)
        return api(originalRequest)

      } catch (err) {
        processQueue(err)
        // ✅ Ahora sí redirige al login cuando la sesión expiró
        forceLogout()
        return Promise.reject(err)

      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
