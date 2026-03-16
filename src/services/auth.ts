import api from './api'

export const login = async (username: string, password: string) => {
  const response = await api.post('/api/login/', { username, password })
  localStorage.setItem('username', username)
  localStorage.setItem('totp_step', response.data.step)

  if (response.data.step === 'setup') {
    localStorage.setItem('totp_qr', response.data.qr)
  }

  return response.data
}

export const verificarTotp = async (codigo: string) => {
  const username = localStorage.getItem('username')
  const response = await api.post('/api/verificar-totp/', { username, codigo })
  localStorage.setItem('access_token', response.data.access)
  localStorage.setItem('refresh_token', response.data.refresh)
  return response.data
}

export const logout = () => {
  localStorage.clear()
}
