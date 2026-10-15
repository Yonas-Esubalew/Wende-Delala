import axios from 'axios'

const hostname = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1'
const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1'
const localApiUrl = isLocalHost ? `http://${hostname}:5000/api/v1` : '/api/v1'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || localApiUrl,
  withCredentials: true,
  timeout: 8000,
})
