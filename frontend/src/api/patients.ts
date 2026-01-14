import { apiClient } from './client'

export interface Patient {
  id: number
  first_name: string
  last_name: string
  middle_name?: string
  phone: string
  email?: string
  birth_date?: string
  created_at?: string
  updated_at?: string
}

export interface PatientListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Patient[]
}

export const patientsApi = {
  list: async (search?: string, page?: number): Promise<PatientListResponse> => {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (page) params.append('page', page.toString())
    const queryString = params.toString()
    const url = queryString ? `/patients/?${queryString}` : '/patients/'
    const response = await apiClient.get<PatientListResponse>(url)
    return response.data
  },

  get: async (id: number): Promise<Patient> => {
    const response = await apiClient.get<Patient>(`/patients/${id}/`)
    return response.data
  },

  create: async (data: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> => {
    const response = await apiClient.post<Patient>('/patients/', data)
    return response.data
  },

  update: async (id: number, data: Partial<Patient>): Promise<Patient> => {
    const response = await apiClient.patch<Patient>(`/patients/${id}/`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/patients/${id}/`)
  },
}

