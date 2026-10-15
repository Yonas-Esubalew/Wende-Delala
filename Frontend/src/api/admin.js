import { apiClient } from './client'

export async function createAdminListing(payload) {
  const response = await apiClient.post('/admin/listings', payload)
  return response.data
}

export async function uploadAdminImages(files) {
  const formData = new FormData()
  files.forEach((file) => formData.append('images', file))
  const response = await apiClient.post('/admin/uploads', formData, { timeout: 90_000 })
  const apiUrl = new URL(apiClient.defaults.baseURL, window.location.origin)
  return response.data.data.images.map((image) => new URL(image, `${apiUrl.origin}/`).toString())
}

export async function fetchAdminListings() { const response = await apiClient.get('/admin/listings'); return response.data.data }
export async function updateAdminListing(id, payload) { const response = await apiClient.put(`/admin/listings/${id}`, payload); return response.data }
export async function setAdminListingStatus(id, status) { const response = await apiClient.patch(`/admin/listings/${id}/status`, { status }); return response.data }
export async function deleteAdminListing(id) { const response = await apiClient.delete(`/admin/listings/${id}`); return response.data }
