import { apiClient } from './client'

export async function fetchListings({ queryKey }) {
  const [, filters] = queryKey
  const response = await apiClient.get('/listings', { params: filters })
  return response.data
}

export async function fetchListingCategoryCounts() {
  const response = await apiClient.get('/listings/counts')
  return response.data
}
