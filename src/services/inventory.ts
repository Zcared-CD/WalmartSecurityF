import { AxiosError } from 'axios'
import api from './api'

export interface Product {
  item_id: string
  product_name: string
  unit_price: number
  quantity_in_stock: number
}

export async function getProducts() {
  try {
    const response = await api.get('/inventory/')
    return response.data.results
  } catch (error) {
    const err = error as AxiosError
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
    console.error('Error CREATE product:', err.response?.data || err.message)
    throw err
  }
}

export async function updateProduct(id: string, product: Partial<Product>) {
  try {
    const response = await api.patch(`/inventory/${id}/`, product)
    return response.data
  } catch (error) {
    const err = error as AxiosError
    console.error('Error UPDATE product:', err.response?.data || err.message)
    throw err
  }
}

export async function deleteProduct(id: string) {
  try {
    const response = await api.delete(`/inventory/${id}/`)
    return response.data
  } catch (error) {
    const err = error as AxiosError
    console.error('Error DELETE product:', err.response?.data || err.message)
    throw err
  }
}
