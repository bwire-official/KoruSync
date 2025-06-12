'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/contexts/ThemeContext'
import { UserProfileMenu } from '@/components/dashboard/UserProfileMenu'
import {
  LayoutDashboard,
  ListTodo,
  Layers,
  Target,
  BarChart3,
  PenLine,
  Sun,
  Moon,
  Settings
} from 'lucide-react'

interface MainNavProps {
  className?: string
}

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: ListTodo },
  { name: 'Pillars', href: '/dashboard/pillars', icon: Layers },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Journal', href: '/dashboard/journal', icon: PenLine },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function MainNav({ className }: MainNavProps) {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 hidden md:block",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <Image 
                src="/logo.svg" 
                alt="KoruSync Logo" 
                width={32} 
                height={32} 
                className="flex-shrink-0"
              />
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                KoruSync
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center space-x-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* User Profile Menu */}
            <UserProfileMenu />
          </div>
        </div>
      </div>
    </nav>
  )
} 