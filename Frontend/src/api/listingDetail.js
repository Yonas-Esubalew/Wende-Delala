import { apiClient } from './client'

export async function fetchListingById({ queryKey }) {
  const [, id] = queryKey
  const response = await apiClient.get(`/listings/${id}`)
  return response.data.data
}
