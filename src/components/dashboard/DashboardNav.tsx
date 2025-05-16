'use client'

import { Home, Target, BarChart2, PenLine } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { UserProfileMenu } from './UserProfileMenu'
import { FloatingActionMenu } from './FloatingActionMenu'

const navItems = [
  {
    icon: <Home className="w-5 h-5" />,
    label: 'Dashboard',
    href: '/dashboard'
  },
  {
    icon: <Target className="w-5 h-5" />,
    label: 'Tasks',
    href: '/tasks'
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    label: 'Goals',
    href: '/goals'
  },
  {
    icon: <PenLine className="w-5 h-5" />,
    label: 'Journal',
    href: '/journal'
  }
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex flex-col h-screen sticky top-0 w-64 border-r border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">KoruSync</span>
          </Link>
        </div>

        <div className="flex-1 px-3 py-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <UserProfileMenu />
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800 z-40">
        <div className="flex items-center justify-around px-4 py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors",
                pathname === item.href
                  ? "text-primary"
                  : "text-gray-600 dark:text-gray-400"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          <div className="flex flex-col items-center gap-1">
            <UserProfileMenu />
          </div>
        </div>
      </nav>

      {/* Floating Action Menu (Mobile) */}
      <div className="md:hidden">
        <FloatingActionMenu />
      </div>
    </>
  )
} 