import axios from 'axios'

const hostname = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1'
const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1'
const localApiUrl = isLocalHost ? `http://${hostname}:5000/api/v1` : '/api/v1'
const apiBaseURL = import.meta.env.PROD
  ? '/api/v1'
  : import.meta.env.VITE_API_URL || localApiUrl

export const apiClient = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  // Render's free instance may need time to wake; image processing also takes longer.
  timeout: 60_000,
})
