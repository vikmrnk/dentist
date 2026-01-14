

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/layout/header"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { doctorsApi, type Doctor } from '@/api/doctors'
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { DoctorModal } from './DoctorModal'

export function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)

  const loadDoctors = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await doctorsApi.list()
      setDoctors(response.results)
    } catch (error) {
      toast.error("Помилка завантаження лікарів")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDoctors()
  }, [loadDoctors])

  const handleSave = async (data: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingDoctor) {
        await doctorsApi.update(editingDoctor.id, data)
        toast.success('Лікаря оновлено')
      } else {
        await doctorsApi.create(data)
        toast.success('Лікаря додано')
      }
      setIsModalOpen(false)
      setEditingDoctor(null)
      loadDoctors()
    } catch (error) {
      toast.error('Помилка збереження')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Ви впевнені, що хочете видалити лікаря?')) return
    try {
      await doctorsApi.delete(id)
      toast.success('Лікаря видалено')
      loadDoctors()
    } catch (error) {
      toast.error('Помилка видалення')
    }
  }

  const columns = [
    {
      key: "name",
      header: "ПІБ",
      render: (item: Doctor) => (
        <span className="font-medium">
          {item.last_name} {item.first_name}
        </span>
      ),
    },
    { key: "specialization", header: "Спеціалізація" },
    { key: "phone", header: "Телефон" },
    {
      key: "specialization",
      header: "Спеціалізація",
    },
    {
      key: "actions",
      header: "",
      className: "w-32",
      render: (item: Doctor) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setEditingDoctor(item)
              setIsModalOpen(true)
            }}
          >
            Редагувати
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(item.id)
            }}
          >
            Видалити
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col">
      <Header
        title="Лікарі"
        subtitle={`Всього: ${doctors.length}`}
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Додати лікаря
          </Button>
        }
      />

      <div className="flex-1 p-6">
        <DataTable data={doctors} columns={columns} isLoading={isLoading} emptyMessage="Лікарів не знайдено" />
      </div>

      <DoctorModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open)
          if (!open) setEditingDoctor(null)
        }}
        doctor={editingDoctor}
        onSave={handleSave}
      />
    </div>
  )
}
