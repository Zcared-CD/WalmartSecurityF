import api from './api'

export interface Product {
  item_id: string
  product_name: string
  unit_price: number
  quantity_in_stock: number
}

export async function getProducts() {
  const response = await api.get('/inventory/')
  return response.data
}

export async function createProduct(product: Omit<Product, 'item_id'>) {
  const response = await api.post('/inventory/', product)
  return response.data
}

export async function updateProduct(id: string, product: Partial<Product>) {
  const response = await api.put(`/inventory/${id}/`, product)
  return response.data
}

export async function deleteProduct(id: string) {
  const response = await api.delete(`/inventory/${id}/`)
  return response.data
}
