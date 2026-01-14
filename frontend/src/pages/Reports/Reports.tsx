

import { useState, useCallback, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { doctorsApi, type Doctor } from '@/api/doctors'
import { reportsApi, type DailyReport, type DoctorDailyReport, type CancelledReport } from '@/api/reports'
import { toast } from 'sonner'
import { FileDown, Calendar, CheckCircle, XCircle } from 'lucide-react'

export function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null)
  const [doctorReport, setDoctorReport] = useState<DoctorDailyReport | null>(null)
  const [cancelledReport, setCancelledReport] = useState<CancelledReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [reportType, setReportType] = useState<'daily' | 'doctor' | 'cancelled'>('daily')

  useEffect(() => {
    doctorsApi
      .list()
      .then((response) => setDoctors(response.results))
      .catch(() => {})
  }, [])

  const loadReport = useCallback(async () => {
    setIsLoading(true)
    try {
      if (reportType === 'daily') {
        const data = await reportsApi.daily(selectedDate)
        setDailyReport(data)
      } else if (reportType === 'doctor' && selectedDoctor !== 'all') {
        const data = await reportsApi.doctorDaily(selectedDate, Number.parseInt(selectedDoctor))
        setDoctorReport(data)
      } else if (reportType === 'cancelled') {
        const data = await reportsApi.cancelled(selectedDate)
        setCancelledReport(data)
      }
    } catch (error) {
      toast.error('Помилка завантаження звіту')
    } finally {
      setIsLoading(false)
    }
  }, [selectedDate, selectedDoctor, reportType])

  const getStatusCount = (totals: Array<{ status__code: string; count: number }>, code: string) => {
    const item = totals.find((t) => t.status__code === code)
    return item?.count || 0
  }

  const stats = dailyReport
    ? [
        {
          title: 'Всього записів',
          value: dailyReport.items.length,
          icon: Calendar,
          color: 'text-primary',
        },
        {
          title: 'Заплановані',
          value: getStatusCount(dailyReport.totals, 'planned'),
          icon: Calendar,
          color: 'text-blue-600',
        },
        {
          title: 'Завершено',
          value: getStatusCount(dailyReport.totals, 'completed'),
          icon: CheckCircle,
          color: 'text-green-600',
        },
        {
          title: 'Скасовано',
          value: getStatusCount(dailyReport.totals, 'cancelled'),
          icon: XCircle,
          color: 'text-red-600',
        },
      ]
    : []

  return (
    <div className="flex flex-col">
      <Header title="Звіти" subtitle="Аналітика та статистика" />

      <div className="flex-1 space-y-6 p-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Фільтри</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <Label>Тип звіту</Label>
                <Select value={reportType} onValueChange={(value) => setReportType(value as typeof reportType)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Записи за день</SelectItem>
                    <SelectItem value="doctor">По лікарю за день</SelectItem>
                    <SelectItem value="cancelled">Скасовані за день</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Дата</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-40"
                />
              </div>

              {reportType === 'doctor' && (
                <div className="space-y-2">
                  <Label>Лікар</Label>
                  <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Оберіть лікаря" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.last_name} {doctor.first_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button onClick={loadReport} disabled={isLoading || (reportType === 'doctor' && selectedDoctor === 'all')}>
                {isLoading ? 'Завантаження...' : 'Сформувати звіт'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {dailyReport && reportType === 'daily' && (
          <>
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Записи за {new Date(selectedDate).toLocaleDateString('uk-UA')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Всього записів: {dailyReport.items.length}
                </p>
                <div className="space-y-2">
                  <p>Заплановані: {getStatusCount(dailyReport.totals, 'planned')}</p>
                  <p>Завершені: {getStatusCount(dailyReport.totals, 'completed')}</p>
                  <p>Скасовані: {getStatusCount(dailyReport.totals, 'cancelled')}</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {doctorReport && reportType === 'doctor' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Записи лікаря за {new Date(selectedDate).toLocaleDateString('uk-UA')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Всього записів: {doctorReport.items.length}
              </p>
              <div className="space-y-2">
                <p>Заплановані: {getStatusCount(doctorReport.totals, 'planned')}</p>
                <p>Завершені: {getStatusCount(doctorReport.totals, 'completed')}</p>
                <p>Скасовані: {getStatusCount(doctorReport.totals, 'cancelled')}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {cancelledReport && reportType === 'cancelled' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Скасовані записи за {new Date(selectedDate).toLocaleDateString('uk-UA')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Всього скасовано: {cancelledReport.count}
              </p>
              {cancelledReport.items.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Пацієнт</TableHead>
                      <TableHead>Лікар</TableHead>
                      <TableHead>Час</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cancelledReport.items.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>{app.patient_name || '—'}</TableCell>
                        <TableCell>{app.doctor_name || '—'}</TableCell>
                        <TableCell>
                          {app.time_start} - {app.time_end}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
