import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/auth/authContext'
import { LayoutDashboard, Users, UserCog, Calendar, BarChart3, LogOut, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Головна', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'registrar'] },
  { name: 'Пацієнти', href: '/patients', icon: Users, roles: ['admin', 'registrar'] },
  { name: 'Лікарі', href: '/doctors', icon: UserCog, roles: ['admin'] },
  { name: 'Розклад', href: '/appointments', icon: Calendar, roles: ['admin', 'registrar'] },
  { name: 'Звіти', href: '/reports', icon: BarChart3, roles: ['admin', 'registrar'] },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const filteredNavigation = navigation.filter(
    (item) => user && item.roles.some((role) => user.roles.includes(role))
  )

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Stethoscope className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-sidebar-foreground">Стоматологія</h1>
          <p className="text-xs text-muted-foreground">Реєстратура</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent">
            <span className="text-sm font-medium text-sidebar-accent-foreground">
              {user?.first_name?.[0] || user?.username?.[0] || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.roles.includes('admin') ? 'Адміністратор' : 'Реєстратор'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Вийти
        </Button>
      </div>
    </aside>
  )
}
