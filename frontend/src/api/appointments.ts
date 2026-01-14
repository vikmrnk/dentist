import { apiClient } from './client'

export interface AppointmentStatus {
  id: number
  code: string
  name: string
}

export interface Appointment {
  id: number
  patient: number
  patient_name?: string
  doctor: number
  doctor_name?: string
  date: string
  time_start: string
  time_end: string
  status: number // FK to AppointmentStatus
  status_code?: string
  status_name?: string
  note?: string
  created_at?: string
}

export interface AppointmentListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Appointment[]
}

export interface ScheduleParams {
  date?: string
  doctor_id?: number
}

export const appointmentsApi = {
  list: async (date?: string, page?: number): Promise<AppointmentListResponse> => {
    const params = new URLSearchParams()
    if (date) params.append('date', date)
    if (page) params.append('page', page.toString())
    const response = await apiClient.get<AppointmentListResponse>(`/appointments/?${params.toString()}`)
    return response.data
  },

  get: async (id: number): Promise<Appointment> => {
    const response = await apiClient.get<Appointment>(`/appointments/${id}/`)
    return response.data
  },

  create: async (data: Omit<Appointment, 'id' | 'created_at'>): Promise<Appointment> => {
    const response = await apiClient.post<Appointment>('/appointments/', data)
    return response.data
  },

  update: async (id: number, data: Partial<Appointment>): Promise<Appointment> => {
    const response = await apiClient.patch<Appointment>(`/appointments/${id}/`, data)
    return response.data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/appointments/${id}/`)
  },

  getSchedule: async (params: ScheduleParams): Promise<Appointment[]> => {
    const searchParams = new URLSearchParams()
    if (params.date) searchParams.append('date', params.date)
    if (params.doctor_id) searchParams.append('doctor_id', params.doctor_id.toString())
    const response = await apiClient.get<Appointment[]>(`/schedule/?${searchParams.toString()}`)
    return response.data
  },
}

