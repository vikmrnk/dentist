import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/layout/header'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { patientsApi, type Patient } from '@/api/patients'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { PatientModal } from './PatientModal'

export function PatientsPage() {
  console.log('🔵 PatientsPage component rendered')
  const navigate = useNavigate()
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)

  const loadPatients = useCallback(async (search?: string) => {
    setIsLoading(true)
    try {
      console.log('Loading patients, search:', search)
      const response = await patientsApi.list(search)
      console.log('Patients response:', response)
      setPatients(response.results || [])
    } catch (error: any) {
      console.error('Error loading patients:', error)
      console.error('Error response:', error.response)
      toast.error(error.response?.data?.detail || 'Помилка завантаження пацієнтів')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    console.log('🟢 useEffect called, calling loadPatients')
    loadPatients()
  }, [loadPatients])

  const handleSearch = useCallback(
    (query: string) => {
      if (query.length === 0 || query.length >= 2) {
        loadPatients(query)
      }
    },
    [loadPatients]
  )

  const handleSave = async (data: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingPatient) {
        await patientsApi.update(editingPatient.id, data)
        toast.success('Пацієнта оновлено')
      } else {
        await patientsApi.create(data)
        toast.success('Пацієнта додано')
      }
      setIsModalOpen(false)
      setEditingPatient(null)
      loadPatients()
    } catch (error) {
      toast.error('Помилка збереження')
    }
  }

  const columns = [
    {
      key: "name",
      header: "ПІБ",
      render: (item: Patient) => (
        <span className="font-medium">
          {item.last_name} {item.first_name}
        </span>
      ),
    },
    { key: "phone", header: "Телефон" },
    { key: "email", header: "Email" },
    {
      key: "birth_date",
      header: "Дата народження",
      render: (item: Patient) => (item.birth_date ? new Date(item.birth_date).toLocaleDateString("uk-UA") : "—"),
    },
    {
      key: "actions",
      header: "",
      className: "w-20",
      render: (item: Patient) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            setEditingPatient(item)
            setIsModalOpen(true)
          }}
        >
          Редагувати
        </Button>
      ),
    },
  ]

  console.log('PatientsPage render:', { patientsCount: patients.length, isLoading, isModalOpen })

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Пацієнти"
        subtitle={`Всього: ${patients.length}`}
        onSearch={handleSearch}
        searchPlaceholder="Пошук за ПІБ або телефоном..."
        actions={
          <Button onClick={() => {
            console.log('Add patient button clicked')
            setIsModalOpen(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Додати пацієнта
          </Button>
        }
      />

      <div className="flex-1 p-6">
        <DataTable
          data={patients}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Пацієнтів не знайдено"
          onRowClick={(item) => navigate(`/patients`)}
        />
      </div>

      <PatientModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open)
          if (!open) setEditingPatient(null)
        }}
        patient={editingPatient}
        onSave={handleSave}
      />
    </div>
  )
}
