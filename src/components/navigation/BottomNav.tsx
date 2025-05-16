'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ListTodo,
  Target,
  Settings,
  Plus
} from 'lucide-react'

interface BottomNavProps {
  className?: string
}

// Only show the most important navigation items in the bottom bar
const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: ListTodo },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings }
]

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname()

  // Handler for Add Task (to be implemented globally)
  const handleAddTask = () => {
    // TODO: Open global Add Task modal
    // For now, just log or alert
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('openAddTaskModal'));
    }
  }

  return (
    <>
      {/* Floating Add Task Button (Mobile/Tablet only, always above nav) */}
      <button
        className="fixed bottom-24 right-6 z-50 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-colors duration-200 lg:hidden"
        aria-label="Add Task"
        onClick={handleAddTask}
      >
        <Plus className="w-6 h-6" />
      </button>
      <nav className={cn(
        "bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden",
        "fixed bottom-0 left-0 right-0 z-40",
        "safe-area-bottom", // For devices with home indicators
        className
      )}>
        <div className="flex h-16 items-center justify-around px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 min-w-0 h-full px-2",
                  isActive
                    ? "text-cyan-600 dark:text-cyan-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full",
                  isActive && "bg-cyan-50 dark:bg-cyan-900/20"
                )}>
                  <item.icon className={cn(
                    "h-6 w-6",
                    isActive && "text-cyan-600 dark:text-cyan-400"
                  )} />
                </div>
                <span className="mt-1 text-xs font-medium">
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
} 