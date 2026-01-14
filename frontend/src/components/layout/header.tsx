import type React from 'react'
import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  title: string
  subtitle?: string
  onSearch?: (query: string) => void
  searchPlaceholder?: string
  actions?: React.ReactNode
}

export function Header({ title, subtitle, onSearch, searchPlaceholder, actions }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div>
        <h1 className="text-xl font-semibold text-card-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {onSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder || 'Пошук...'}
              className="w-64 pl-9"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}

        {actions}

        {/* Notifications temporarily disabled - no API endpoint yet */}
        {/* <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            3
          </span>
        </Button> */}
      </div>
    </header>
  )
}
