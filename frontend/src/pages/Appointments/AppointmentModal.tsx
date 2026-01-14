

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { appointmentsApi, type Appointment } from '@/api/appointments'
import { doctorsApi, type Doctor } from '@/api/doctors'
import { patientsApi, type Patient } from '@/api/patients'
import { APPOINTMENT_STATUSES } from '@/constants/statuses'
import { Search } from 'lucide-react'

interface AppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: Appointment | null
  doctors: Doctor[]
  defaultDate: string
  onSave: (data: Omit<Appointment, 'id' | 'created_at' | 'patient_name' | 'doctor_name' | 'status_code' | 'status_name'>) => Promise<void>
}

interface FormData {
  patient: number
  doctor: number
  date: string
  time_start: string
  time_end: string
  status: number
  note?: string
}

export function AppointmentModal({
  open,
  onOpenChange,
  appointment,
  doctors,
  defaultDate,
  onSave,
}: AppointmentModalProps) {
  const [patientSearch, setPatientSearch] = useState("")
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()

  const doctorValue = watch("doctor")
  const statusValue = watch("status")

  useEffect(() => {
    if (appointment) {
      setValue('patient', appointment.patient)
      setValue('doctor', appointment.doctor)
      setValue('date', appointment.date)
      setValue('time_start', appointment.time_start)
      setValue('time_end', appointment.time_end)
      setValue('status', appointment.status)
      setValue('note', appointment.note || '')
      // Fetch patient data for display
      patientsApi.get(appointment.patient).then((p) => {
        setSelectedPatient(p)
      }).catch(() => {})
    } else {
      reset({
        date: defaultDate,
        time_start: '09:00',
        time_end: '09:30',
        status: APPOINTMENT_STATUSES.PLANNED,
        note: '',
      })
      setSelectedPatient(null)
      setPatientSearch('')
    }
  }, [appointment, defaultDate, reset, setValue])

  const handlePatientSearch = async (query: string) => {
    setPatientSearch(query)
    if (query.length >= 2) {
      try {
        const response = await patientsApi.list(query)
        setSearchResults(response.results)
      } catch {
        setSearchResults([])
      }
    } else {
      setSearchResults([])
    }
  }

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setValue('patient', patient.id)
    setPatientSearch('')
    setSearchResults([])
  }

  const calculateTimeEnd = (timeStart: string, durationMinutes: number = 30) => {
    const [hours, minutes] = timeStart.split(':').map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)
    startDate.setMinutes(startDate.getMinutes() + durationMinutes)
    return `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`
  }

  const handleDurationChange = (duration: number) => {
    const timeStart = watch('time_start') || '09:00'
    const timeEnd = calculateTimeEnd(timeStart, duration)
    setValue('time_end', timeEnd)
  }

  const handleTimeStartChange = (timeStart: string) => {
    setValue('time_start', timeStart)
    // Auto-calculate time_end (default 30 min)
    const timeEnd = calculateTimeEnd(timeStart, 30)
    setValue('time_end', timeEnd)
  }

  const onSubmit = async (data: FormData) => {
    await onSave(data)
    reset()
    setSelectedPatient(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{appointment ? "Редагувати запис" : "Новий запис"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Patient Search */}
          <div className="space-y-2">
            <Label>Пацієнт *</Label>
            {selectedPatient ? (
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="font-medium">
                  {appointment?.patient_name || `${selectedPatient.last_name} ${selectedPatient.first_name}`}
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedPatient(null)}>
                  Змінити
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Пошук за ПІБ або телефоном..."
                  className="pl-9"
                  value={patientSearch}
                  onChange={(e) => handlePatientSearch(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border bg-popover shadow-lg">
                    {searchResults.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        className="w-full p-3 text-left hover:bg-accent"
                        onClick={() => selectPatient(patient)}
                      >
                        <p className="font-medium">
                          {patient.last_name} {patient.first_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{patient.phone}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {errors.patient && <p className="text-sm text-destructive">Оберіть пацієнта</p>}
          </div>

          {/* Doctor */}
          <div className="space-y-2">
            <Label>Лікар *</Label>
            <Select
              value={doctorValue?.toString() || ""}
              onValueChange={(value) => setValue("doctor", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Оберіть лікаря" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id.toString()}>
                    {doctor.last_name} {doctor.first_name} — {doctor.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.doctor && <p className="text-sm text-destructive">Оберіть лікаря</p>}
          </div>

          {/* Date & Time */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Дата *</Label>
              <Input id="date" type="date" {...register('date', { required: true })} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="time_start">Час початку *</Label>
              <Input
                id="time_start"
                type="time"
                {...register('time_start', {
                  required: true,
                  onChange: (e) => handleTimeStartChange(e.target.value),
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_end">Час закінчення *</Label>
              <Input id="time_end" type="time" {...register('time_end', { required: true })} />
            </div>
          </div>

          {/* Duration helper */}
          <div className="space-y-2">
            <Label>Швидкий вибір тривалості</Label>
            <div className="flex gap-2">
              {[15, 30, 45, 60, 90, 120].map((duration) => (
                <Button
                  key={duration}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDurationChange(duration)}
                >
                  {duration} хв
                </Button>
              ))}
            </div>
          </div>

          {/* Status (for editing) */}
          {appointment && (
            <div className="space-y-2">
              <Label>Статус</Label>
              <Select
                value={statusValue?.toString() || APPOINTMENT_STATUSES.PLANNED.toString()}
                onValueChange={(value) => setValue('status', Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={APPOINTMENT_STATUSES.PLANNED.toString()}>Запланований</SelectItem>
                  <SelectItem value={APPOINTMENT_STATUSES.COMPLETED.toString()}>Завершений</SelectItem>
                  <SelectItem value={APPOINTMENT_STATUSES.CANCELLED.toString()}>Скасований</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="note">Примітки</Label>
            <Textarea id="note" rows={2} {...register('note')} />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Скасувати
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedPatient}>
              {isSubmitting ? "Збереження..." : "Зберегти"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
