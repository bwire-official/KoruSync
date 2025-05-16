'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  ListTodo,
  Layers,
  Target,
  Plus,
  Settings
} from 'lucide-react'

interface DashboardBottomNavProps {
  className?: string
}

const navigation = [
  { name: 'Tasks', href: '/dashboard/tasks', icon: ListTodo },
  { name: 'Pillars', href: '/dashboard/pillars', icon: Layers },
  { name: 'Add', href: '/dashboard/tasks/new', icon: Plus },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function DashboardBottomNav({ className }: DashboardBottomNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn(
      "bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700",
      "safe-area-bottom", // For devices with home indicators
      className
    )}>
      <div className="flex h-16 items-center justify-around px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const isAddButton = item.name === 'Add'
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 min-w-0 h-full px-2",
                isActive
                  ? "text-cyan-600 dark:text-cyan-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300",
                isAddButton && "relative -mt-6" // Lift the Add button up slightly
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full",
                isAddButton && "bg-cyan-600 dark:bg-cyan-500 text-white shadow-lg",
                !isAddButton && isActive && "bg-cyan-50 dark:bg-cyan-900/20"
              )}>
                <item.icon className={cn(
                  "h-6 w-6",
                  isAddButton && "text-white",
                  !isAddButton && isActive && "text-cyan-600 dark:text-cyan-400"
                )} />
              </div>
              <span className={cn(
                "mt-1 text-xs font-medium",
                isAddButton && "sr-only" // Hide text for Add button
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
} 