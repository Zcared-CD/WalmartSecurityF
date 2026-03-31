import { AxiosError } from 'axios'
import api from './api'

export interface Product {
  item_id: string
  product_name: string
  unit_price: number
  quantity_in_stock: number
}

export interface UserRol {
  username: string
  roles: string[]
  is_admin: boolean
  is_gerente: boolean
  is_empleado: boolean
}

export async function getMiRol(): Promise<UserRol> {
  try {
    const response = await api.get('/api/mi-rol/')
    return response.data
  } catch (error) {
    const err = error as AxiosError
    console.error('Error GET rol:', err.response?.data || err.message)
    throw err
  }
}

export async function getProducts() {
  try {
    const response = await api.get('/inventory/')
    return response.data.results
  } catch (error) {
    const err = error as AxiosError
    if (err.response?.status === 403) {
      throw new Error('SIN_PERMISO')
    }
    console.error('Error GET inventory:', err.response?.data || err.message)
    throw err
  }
}

export async function createProduct(product: Omit<Product, 'item_id'>) {
  try {
    const response = await api.post('/inventory/', product)
    return response.data
  } catch (error) {
    const err = error as AxiosError
    if (err.response?.status === 403) {
      throw new Error('SIN_PERMISO')
    }
    console.error('Error CREATE product:', err.response?.data || err.message)
    throw err
  }
}

export async function updateProduct(
  id: string,
  product: Partial<Product>,
  criticalToken?: string
) {
  try {
    const response = await api.patch(`/inventory/${id}/`, product, {
      headers: criticalToken
        ? { 'X-Critical-Token': criticalToken }
        : {}
    })
    return response.data
  } catch (error) {
    const err = error as AxiosError<any>

    if (
      err.response?.status === 403 &&
      err.response?.data?.error === "Requiere verificación crítica"
    ) {
      throw err
    }

    if (err.response?.status === 403) {
      throw new Error('SIN_PERMISO')
    }

    console.error('Error UPDATE product:', err.response?.data || err.message)
    throw err
  }
}

export async function deleteProduct(id: string, criticalToken: string) {
  try {
    const response = await api.delete(`/inventory/${id}/`, {
      headers: {
        'X-Critical-Token': criticalToken
      }
    })
    return response.data
  } catch (error) {
    const err = error as AxiosError

    if (err.response?.status === 403) {
      throw err
    }

    console.error('Error DELETE product:', err.response?.data || err.message)
    throw err
  }
}
