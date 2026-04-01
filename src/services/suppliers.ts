import { AxiosError } from 'axios'
import api from './api'

export interface Supplier {
  supplier_id: string
  name: string
}

export async function getSuppliers() {
  try {
    const response = await api.get('/suppliers/')
    return response.data.results ?? response.data
  } catch (error) {
    const err = error as AxiosError
    if (err.response?.status === 403) {
      throw new Error('SIN_PERMISO')
    }
    console.error('Error GET suppliers:', err.response?.data || err.message)
    throw err
  }
}

export async function createSupplier(name: string) {
  try {
    const response = await api.post('/suppliers/', { name })
    return response.data
  } catch (error) {
    const err = error as AxiosError
    if (err.response?.status === 403) {
      throw new Error('SIN_PERMISO')
    }
    console.error('Error CREATE supplier:', err.response?.data || err.message)
    throw err
  }
}

export async function updateSupplier(id: string, name: string) {
  try {
    const response = await api.patch(`/suppliers/${id}/`, { name })
    return response.data
  } catch (error) {
    const err = error as AxiosError
    if (err.response?.status === 403) {
      throw new Error('SIN_PERMISO')
    }
    console.error('Error UPDATE supplier:', err.response?.data || err.message)
    throw err
  }
}

export async function deleteSupplier(id: string) {
  try {
    const response = await api.delete(`/suppliers/${id}/`)
    return response.data
  } catch (error) {
    const err = error as AxiosError
    if (err.response?.status === 403) {
      throw new Error('SIN_PERMISO')
    }
    console.error('Error DELETE supplier:', err.response?.data || err.message)
    throw err
  }
}