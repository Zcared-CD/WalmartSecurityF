import { initSessionTimeout } from "@/services/sessionTimeout"
import api from './api'

let authCache: boolean | null = null

export const login = async (username: string, password: string, turnstileToken: string) => {
  try {
    const response = await api.post('/api/login/', {
      username: username.trim(),
      password: password,
      cf_turnstile_response: turnstileToken,
    })

    sessionStorage.setItem('username', username.trim())
    sessionStorage.setItem('totp_step', response.data.step)

    if (response.data.step === 'setup') {
      sessionStorage.setItem('totp_qr', response.data.qr)
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
    sessionStorage.removeItem('totp_qr')
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
    console.error("Error al cerrar sesión:", error)
  } finally {
    authCache = null

    sessionStorage.clear()

    window.location.href = '/login'
  }
}

export const checkSession = async () => {
  if (window.location.pathname === '/token') {
    return false
  }

  if (authCache === true) return true // 🔥 CLAVE

  try {
    const response = await api.get('/api/check-session/')
    authCache = response.data.authenticated
    return authCache
  } catch (error: any) {
    authCache = false
    return false
  }
}

export const verifyCritical = async (codigo: string) => {
  const response = await api.post('/api/verify-critical/', {
    codigo
  })

  return response.data.critical_token
}
