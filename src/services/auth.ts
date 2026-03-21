import api from './api'
import { initSessionTimeout } from "@/services/sessionTimeout"


let authCache: boolean | null = null

export const login = async (username: string, password: string) => {
  try {
    const response = await api.post('/api/login/', {
      username: username.trim(),
      password: password
    })

    localStorage.setItem('username', username.trim())
    localStorage.setItem('totp_step', response.data.step)

    if (response.data.step === 'setup') {
      localStorage.setItem('totp_qr', response.data.qr)
    }

    return response.data
  } catch (error: any) {
    console.error("Error en login:", error.response?.data || error.message)
    throw error
  }
}

export const verificarTotp = async (codigo: string) => {
  try {
    const response = await api.post('/api/verificar-totp/', {
      codigo
    })

    authCache = true

    localStorage.removeItem('totp_qr')

    initSessionTimeout()

    return response.data
  } catch (error: any) {
    console.error("Error en verificar TOTP:", error.response?.data || error.message)
    throw error
  }
}

export const logout = async () => {
  try {
    await api.post('/api/logout/')
  } catch (error) {
    console.error("Error al cerrar sesión en el servidor:", error)
  } finally {
    authCache = null

    localStorage.removeItem('username')
    localStorage.removeItem('totp_step')
    localStorage.removeItem('totp_qr')
  }
}

export const checkSession = async () => {
  if (authCache !== null) return authCache

  try {
    const response = await api.get('/api/check-session/')
    authCache = response.data.authenticated
    return authCache
  } catch (error: any) {

    // 🔥 ignorar 401 normal
    if (error.response?.status !== 401) {
      console.error("Error checkSession:", error)
    }

    authCache = false
    return false
  }
}