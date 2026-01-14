import { apiClient } from './client'

export interface LoginResponse {
  access: string
  refresh: string
}

export interface User {
  id: number
  username: string
  email?: string
  first_name: string
  last_name: string
  roles: string[]
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login/', {
      username,
      password,
    })
    localStorage.setItem('access_token', response.data.access)
    localStorage.setItem('refresh_token', response.data.refresh)
    return response.data
  },

  refresh: async (refresh: string): Promise<{ access: string }> => {
    const response = await apiClient.post<{ access: string }>('/auth/refresh/', {
      refresh,
    })
    localStorage.setItem('access_token', response.data.access)
    return response.data
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me/')
    localStorage.setItem('user', JSON.stringify(response.data))
    return response.data
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  },
}

