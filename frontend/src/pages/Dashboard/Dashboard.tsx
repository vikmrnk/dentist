import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/header'
import { DataTable } from '@/components/ui/data-table'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { appointmentsApi, type Appointment } from '@/api/appointments'
import { patientsApi, type Patient } from '@/api/patients'
import { toast } from 'sonner'
import { Plus, Users, Calendar, Clock, Search } from 'lucide-react'

export function DashboardPage() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await appointmentsApi.list(today)
      setAppointments(response.results)
    } catch (error) {
      toast.error('Помилка завантаження даних')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
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

  const columns = [
    {
      key: 'time',
      header: 'Час',
      render: (item: Appointment) => `${item.time_start} - ${item.time_end}`,
    },
    { key: 'patient_name', header: 'Пацієнт' },
    { key: 'doctor_name', header: 'Лікар' },
    {
      key: 'status',
      header: 'Статус',
      render: (item: Appointment) => <StatusBadge status={item.status_code || 'planned'} />,
    },
  ]

  const plannedCount = appointments.filter((a) => a.status_code === 'planned').length
  const completedCount = appointments.filter((a) => a.status_code === 'completed').length

  const stats = [
    {
      title: 'Записів сьогодні',
      value: appointments.length,
      icon: Calendar,
      color: 'text-primary',
    },
    {
      title: 'Очікують',
      value: plannedCount,
      icon: Clock,
      color: 'text-blue-600',
    },
    {
      title: 'Завершено',
      value: completedCount,
      icon: Users,
      color: 'text-green-600',
    },
  ]

  return (
    <div className="flex flex-col">
      <Header
        title="Головна"
        subtitle={new Date().toLocaleDateString('uk-UA', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        actions={
          <Button onClick={() => navigate('/appointments')}>
            <Plus className="mr-2 h-4 w-4" />
            Новий запис
          </Button>
        }
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-lg bg-muted p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Швидкий пошук пацієнта</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ПІБ або телефон..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              {searchResults.length > 0 && (
                <div className="max-h-64 space-y-2 overflow-auto">
                  {searchResults.map((patient) => (
                    <button
                      key={patient.id}
                      className="w-full rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent"
                      onClick={() => navigate(`/patients`)}
                    >
                      <p className="font-medium">
                        {patient.last_name} {patient.first_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{patient.phone}</p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Записи на сьогодні</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/appointments')}>
                  Переглянути всі
                </Button>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={appointments.slice(0, 5)}
                  columns={columns}
                  isLoading={isLoading}
                  emptyMessage="Записів на сьогодні немає"
                  onRowClick={(item) => navigate(`/appointments`)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

