import { AxiosError } from 'axios'
import api from './api'

export interface Review {
  review_id: string
  item: string
  product_name: string
  rating: number
  comment: string
  reviewed_at: string
}

export async function getReviews() {
  try {
    const response = await api.get('/reviews/')
    return response.data.results ?? response.data
  } catch (error) {
    const err = error as AxiosError
    if (err.response?.status === 403) {
      throw new Error('SIN_PERMISO')
    }
    console.error('Error GET reviews:', err.response?.data || err.message)
    throw err
  }
}

export async function createReview(data: { item: string; rating: number; comment: string }) {
  try {
    const response = await api.post('/reviews/', data)
    return response.data
  } catch (error) {
    const err = error as AxiosError
    if (err.response?.status === 403) {
      throw new Error('SIN_PERMISO')
    }
    console.error('Error CREATE review:', err.response?.data || err.message)
    throw err
  }
}

export async function updateReview(id: string, data: { rating?: number; comment?: string }) {
  try {
    const response = await api.patch(`/reviews/${id}/`, data)
    return response.data
  } catch (error) {
    const err = error as AxiosError
    if (err.response?.status === 403) {
      throw new Error('SIN_PERMISO')
    }
    console.error('Error UPDATE review:', err.response?.data || err.message)
    throw err
  }
}

export async function deleteReview(id: string, criticalToken: string) {
  try {
    const response = await api.delete(`/reviews/${id}/`, {
      headers: {
        'X-Critical-Token': criticalToken
      }
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

    console.error('Error DELETE review:', err.response?.data || err.message)
    throw err
  }
}