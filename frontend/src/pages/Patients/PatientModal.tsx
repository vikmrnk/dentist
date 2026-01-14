import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Patient } from '@/api/patients'

interface PatientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient | null
  onSave: (data: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
}

export function PatientModal({ open, onOpenChange, patient, onSave }: PatientModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Omit<Patient, 'id' | 'created_at' | 'updated_at'>>()

  useEffect(() => {
    if (patient) {
      reset({
        first_name: patient.first_name,
        last_name: patient.last_name,
        phone: patient.phone,
        email: patient.email || "",
        birth_date: patient.birth_date || "",
        middle_name: patient.middle_name || "",
      })
    } else {
      reset({
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        birth_date: "",
        middle_name: "",
      })
    }
  }, [patient, reset])

  const onSubmit = async (data: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    await onSave(data)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{patient ? "Редагувати пацієнта" : "Новий пацієнт"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="last_name">Прізвище *</Label>
              <Input id="last_name" {...register("last_name", { required: "Прізвище обов'язкове" })} />
              {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="first_name">{"Ім'я *"}</Label>
              <Input id="first_name" {...register("first_name", { required: "Ім'я обов'язкове" })} />
              {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Телефон *</Label>
            <Input
              id="phone"
              {...register("phone", {
                required: "Телефон обов'язковий",
                pattern: {
                  value: /^[+]?[\d\s()-]+$/,
                  message: "Невірний формат телефону",
                },
              })}
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Невірний формат email",
                },
              })}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date">Дата народження</Label>
            <Input id="birth_date" type="date" {...register("birth_date")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="middle_name">По батькові</Label>
            <Input id="middle_name" {...register("middle_name")} />
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
