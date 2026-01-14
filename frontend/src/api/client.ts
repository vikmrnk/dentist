import axios, { AxiosError, AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

console.log('🔧 API_BASE_URL:', API_BASE_URL)
console.log('🔧 VITE_API_BASE_URL env:', import.meta.env.VITE_API_BASE_URL)

class ApiClient {
  private client: AxiosInstance

  constructor() {
    console.log('🔧 ApiClient constructor, baseURL:', API_BASE_URL)
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor - add token
    this.client.interceptors.request.use(
      (config) => {
        console.log('🌐 API Request:', config.method?.toUpperCase(), config.url)
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          console.log('✅ Token found, added to headers')
        } else {
          console.warn('⚠️ No token found in localStorage')
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor - handle 401 and refresh token
    this.client.interceptors.response.use(
      (response) => {
        console.log('✅ API Response:', response.config.method?.toUpperCase(), response.config.url, response.status)
        return response
      },
      async (error: AxiosError) => {
        console.error('❌ API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status)
        const originalRequest = error.config as any

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = localStorage.getItem('refresh_token')
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                refresh: refreshToken,
              })
              const { access } = response.data
              localStorage.setItem('access_token', access)
              originalRequest.headers.Authorization = `Bearer ${access}`
              return this.client(originalRequest)
            }
          } catch (refreshError) {
            // Refresh failed, logout
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  get instance() {
    return this.client
  }
}

export const apiClient = new ApiClient().instance

