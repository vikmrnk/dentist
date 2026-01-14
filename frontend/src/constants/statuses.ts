// Appointment status codes matching backend fixtures
export const APPOINTMENT_STATUSES = {
  PLANNED: 1, // code: "planned"
  COMPLETED: 2, // code: "completed"
  CANCELLED: 3, // code: "cancelled"
} as const

export const STATUS_CODE_TO_NAME: Record<string, string> = {
  planned: 'Запланований',
  completed: 'Завершений',
  cancelled: 'Скасований',
}

