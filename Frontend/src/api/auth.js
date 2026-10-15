import { apiClient } from './client'

export async function registerUser(payload) { const response = await apiClient.post('/auth/register', payload); return response.data.data.user }
export async function loginUser(payload) { const response = await apiClient.post('/auth/login', payload); return response.data.data.user }
export async function logoutUser() { await apiClient.post('/auth/logout') }
