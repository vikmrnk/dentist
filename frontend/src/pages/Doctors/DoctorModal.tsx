

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Doctor } from '@/api/doctors'

interface DoctorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  doctor: Doctor | null
  onSave: (data: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
}

export function DoctorModal({ open, onOpenChange, doctor, onSave }: DoctorModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Omit<Doctor, 'id' | 'created_at' | 'updated_at'>>()

  useEffect(() => {
    if (doctor) {
      reset({
        first_name: doctor.first_name,
        last_name: doctor.last_name,
        middle_name: doctor.middle_name || '',
        specialization: doctor.specialization,
        phone: doctor.phone || '',
      })
    } else {
      reset({
        first_name: '',
        last_name: '',
        middle_name: '',
        specialization: '',
        phone: '',
      })
    }
  }, [doctor, reset])

  const onSubmit = async (data: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>) => {
    await onSave(data)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{doctor ? "Редагувати лікаря" : "Новий лікар"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="last_name">Прізвище *</Label>
              <Input id="last_name" {...register('last_name', { required: "Прізвище обов'язкове" })} />
              {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="first_name">{"Ім'я *"}</Label>
              <Input id="first_name" {...register('first_name', { required: "Ім'я обов'язкове" })} />
              {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="middle_name">По батькові</Label>
            <Input id="middle_name" {...register('middle_name')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">Спеціалізація *</Label>
            <Input
              id="specialization"
              placeholder="Терапевт, Хірург, Ортодонт..."
              {...register('specialization', { required: "Спеціалізація обов'язкова" })}
            />
            {errors.specialization && <p className="text-sm text-destructive">{errors.specialization.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input id="phone" {...register('phone')} />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Скасувати
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Збереження..." : "Зберегти"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
