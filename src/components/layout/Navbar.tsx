'use client'

import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Sun, Moon, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function Navbar() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const handleLogout = () => {
    // Add logout logic here
    router.push('/auth/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a className="flex items-center space-x-3" href="/dashboard">
              <img alt="KoruSync Logo" loading="lazy" width="32" height="32" decoding="async" data-nimg="1" className="flex-shrink-0" style={{ color: 'transparent' }} src="/logo.svg" />
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">KoruSync</span>
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <a className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50" href="/dashboard">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-dashboard h-5 w-5 mr-2" aria-hidden="true"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>Overview
            </a>
            <a className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50" href="/tasks">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list-todo h-5 w-5 mr-2" aria-hidden="true"><rect x="3" y="5" width="6" height="6" rx="1"></rect><path d="m3 17 2 2 4-4"></path><path d="M13 6h8"></path><path d="M13 12h8"></path><path d="M13 18h8"></path></svg>Tasks
            </a>
            <a className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50" href="/dashboard/pillars">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layers h-5 w-5 mr-2" aria-hidden="true"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 4.91a2 2 0 0 0 1.66 0l8.58-4.9a1 1 0 0 0 0-1.83Z"></path><path d="m22 17.65-9.17 5.16a2 2 0 0 1-1.66 0L2 17.65"></path><path d="m22 12.65-9.17 5.16a2 2 0 0 1-1.66 0L2 12.65"></path></svg>Pillars
            </a>
            <a className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50" href="/dashboard/goals">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-target h-5 w-5 mr-2" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>Goals
            </a>
            <a className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50" href="/dashboard/reports">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart h-5 w-5 mr-2" aria-hidden="true"><line x1="12" x2="12" y1="20" y2="10"></line><line x1="18" x2="18" y1="20" y2="4"></line><line x1="6" x2="6" y1="20" y2="16"></line></svg>Reports
            </a>
            <a className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50" href="/dashboard/journal">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book h-5 w-5 mr-2" aria-hidden="true"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>Journal
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-9 h-9"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
} 