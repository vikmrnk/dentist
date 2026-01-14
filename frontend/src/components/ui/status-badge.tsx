import { cn } from "@/lib/utils"

type Status = "planned" | "scheduled" | "completed" | "cancelled" | "no_show" | "active" | "inactive"

const statusConfig: Record<Status, { label: string; className: string }> = {
  planned: {
    label: "Запланований",
    className: "bg-blue-100 text-blue-700",
  },
  scheduled: {
    label: "Заплановано",
    className: "bg-blue-100 text-blue-700",
  },
  completed: {
    label: "Завершений",
    className: "bg-green-100 text-green-700",
  },
  cancelled: {
    label: "Скасований",
    className: "bg-red-100 text-red-700",
  },
  no_show: {
    label: "Не з'явився",
    className: "bg-orange-100 text-orange-700",
  },
  active: {
    label: "Активний",
    className: "bg-green-100 text-green-700",
  },
  inactive: {
    label: "Неактивний",
    className: "bg-gray-100 text-gray-700",
  },
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  if (!config) {
    console.warn(`Unknown status: ${status}`)
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          "bg-gray-100 text-gray-700",
          className,
        )}
      >
        {status || 'Невідомо'}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
