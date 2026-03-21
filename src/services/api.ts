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


    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/api/check-session/') &&
      !originalRequest.url.includes('/api/login/') &&
      !originalRequest.url.includes('/api/logout/')
    ) {

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

        console.error("Refresh expirado, cerrar sesión")

        try {
          // 🔔 NOTIFICAR BACKEND → DISCORD
          await axios.post(
            `${import.meta.env.VITE_API_URL}/session-expired/`,
            {},
            { withCredentials: true }
          )
        } catch (e) {
          console.warn("No se pudo notificar sesión expirada")
        }

        // 🔥 REDIRIGIR AL LOGIN
        window.location.href = "/login"

        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
