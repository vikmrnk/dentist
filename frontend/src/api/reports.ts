import { apiClient } from './client'

export interface DailyReport {
  items: Array<{
    id: number
    patient: number
    patient_name?: string
    doctor: number
    doctor_name?: string
    date: string
    time_start: string
    time_end: string
    status: number
    status_code?: string
    status_name?: string
    note?: string
  }>
  totals: Array<{
    status__code: string
    count: number
  }>
}

export interface DoctorDailyReport {
  items: Array<{
    id: number
    patient: number
    patient_name?: string
    doctor: number
    doctor_name?: string
    date: string
    time_start: string
    time_end: string
    status: number
    status_code?: string
    status_name?: string
    note?: string
  }>
  totals: Array<{
    status__code: string
    count: number
  }>
}

export interface CancelledReport {
  items: Array<{
    id: number
    patient: number
    patient_name?: string
    doctor: number
    doctor_name?: string
    date: string
    time_start: string
    time_end: string
    status: number
    status_code?: string
    status_name?: string
    note?: string
  }>
  count: number
}

export const reportsApi = {
  daily: async (date: string): Promise<DailyReport> => {
    const response = await apiClient.get<DailyReport>(`/reports/daily/?date=${date}`)
    return response.data
  },

  doctorDaily: async (date: string, doctorId: number): Promise<DoctorDailyReport> => {
    const response = await apiClient.get<DoctorDailyReport>(
      `/reports/doctor-daily/?date=${date}&doctor_id=${doctorId}`
    )
    return response.data
  },

  cancelled: async (date: string): Promise<CancelledReport> => {
    const response = await apiClient.get<CancelledReport>(`/reports/cancelled/?date=${date}`)
    return response.data
  },
}

