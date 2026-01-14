import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Stethoscope, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/auth/authContext'
import { toast } from 'sonner'

interface LoginForm {
  username: string
  password: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      console.log('Attempting login with:', { username: data.username, passwordLength: data.password.length })
      await login(data.username, data.password)
      toast.success('Успішний вхід')
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Помилка входу. Перевірте логін та пароль.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Stethoscope className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Реєстратура стоматології</CardTitle>
          <CardDescription>Введіть свої облікові дані для входу</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Логін</Label>
              <Input
                id="username"
                placeholder="Введіть логін"
                {...register('username', { required: "Логін обов'язковий" })}
              />
              {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Введіть пароль"
                {...register('password', { required: "Пароль обов'язковий" })}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Увійти
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

