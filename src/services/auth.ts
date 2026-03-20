import api from './api'


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
  const username = localStorage.getItem('username')

  try {
    const response = await api.post('/api/verificar-totp/', {
      username,
      codigo
    })

    localStorage.removeItem('totp_qr')

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
    localStorage.clear()
  }
}