import { apiClient } from './client'

export interface Doctor {
  id: number
  first_name: string
  last_name: string
  middle_name?: string
  specialization: string
  phone?: string
  created_at?: string
  updated_at?: string
}

export interface DoctorListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Doctor[]
}

export const doctorsApi = {
  list: async (): Promise<DoctorListResponse> => {
    const response = await apiClient.get<DoctorListResponse>('/doctors/')
    return response.data
  },

  get: async (id: number): Promise<Doctor> => {
    const response = await apiClient.get<Doctor>(`/doctors/${id}/`)
    return response.data
  },

  create: async (data: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>): Promise<Doctor> => {
    const response = await apiClient.post<Doctor>('/doctors/', data)
    return response.data
  },

  update: async (id: number, data: Partial<Doctor>): Promise<Doctor> => {
    const response = await apiClient.patch<Doctor>(`/doctors/${id}/`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/doctors/${id}/`)
  },
}

