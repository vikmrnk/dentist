

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/layout/header"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { appointmentsApi, type Appointment } from '@/api/appointments'
import { doctorsApi, type Doctor } from '@/api/doctors'
import { toast } from "sonner"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { AppointmentModal } from './AppointmentModal'

export function AppointmentsPage() {
  const router = useNavigate()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [appointmentsResponse, doctorsResponse] = await Promise.all([
        appointmentsApi.getSchedule({ date: selectedDate, doctor_id: selectedDoctor !== "all" ? Number.parseInt(selectedDoctor) : undefined }),
        doctorsApi.list(),
      ])
      setAppointments(appointmentsResponse)
      setDoctors(doctorsResponse.results)
    } catch (error) {
      toast.error("Помилка завантаження даних")
    } finally {
      setIsLoading(false)
    }
  }, [selectedDate, selectedDoctor])

  useEffect(() => {
    loadData()
  }, [loadData])

  const changeDate = (days: number) => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + days)
    setSelectedDate(date.toISOString().split("T")[0])
  }

  // Appointments are already filtered by date and doctor from API
  const filteredAppointments = appointments

  const handleSave = async (data: Omit<Appointment, 'id' | 'created_at' | 'patient_name' | 'doctor_name' | 'status_code' | 'status_name'>) => {
    try {
      if (editingAppointment) {
        await appointmentsApi.update(editingAppointment.id, data)
        toast.success('Запис оновлено')
      } else {
        await appointmentsApi.create(data)
        toast.success('Запис створено')
      }
      setIsModalOpen(false)
      setEditingAppointment(null)
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Помилка збереження')
    }
  }

  const handleCancelClick = (id: number) => {
    setAppointmentToCancel(id)
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!appointmentToCancel) return
    try {
      // Use cancelled status ID (3 from fixtures)
      await appointmentsApi.update(appointmentToCancel, { status: 3 }) // cancelled status ID
      toast.success('Запис скасовано')
      setCancelDialogOpen(false)
      setAppointmentToCancel(null)
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Помилка скасування')
    }
  }

  const columns = [
    {
      key: 'time',
      header: 'Час',
      className: 'w-24',
      render: (item: Appointment) => `${item.time_start} - ${item.time_end}`,
    },
    {
      key: 'patient_name',
      header: 'Пацієнт',
      render: (item: Appointment) => <span className="font-medium">{item.patient_name || '—'}</span>,
    },
    { key: 'doctor_name', header: 'Лікар' },
    {
      key: 'status',
      header: 'Статус',
      render: (item: Appointment) => <StatusBadge status={item.status_code || 'planned'} />,
    },
    {
      key: "actions",
      header: "",
      className: "w-40",
      render: (item: Appointment) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setEditingAppointment(item)
              setIsModalOpen(true)
            }}
          >
            Редагувати
          </Button>
          {item.status_code === 'planned' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                handleCancelClick(item.id)
              }}
            >
              Скасувати
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col">
      <Header
        title="Розклад"
        subtitle={new Date(selectedDate).toLocaleDateString("uk-UA", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Новий запис
          </Button>
        }
      />

      <div className="flex-1 p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => changeDate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
            <Button variant="outline" size="icon" onClick={() => changeDate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}>
              Сьогодні
            </Button>
          </div>

          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Всі лікарі" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі лікарі</SelectItem>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id.toString()}>
                  {doctor.last_name} {doctor.first_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DataTable
          data={filteredAppointments}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Записів на цю дату немає"
        />
      </div>

      <AppointmentModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open)
          if (!open) setEditingAppointment(null)
        }}
        appointment={editingAppointment}
        doctors={doctors}
        defaultDate={selectedDate}
        onSave={handleSave}
      />

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Скасувати запис?</AlertDialogTitle>
            <AlertDialogDescription>
              Ви впевнені, що хочете скасувати цей запис? Цю дію можна буде відмінити пізніше.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAppointmentToCancel(null)}>
              Ні
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Так, скасувати
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
