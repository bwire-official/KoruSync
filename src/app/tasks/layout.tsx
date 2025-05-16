import { ReactNode } from 'react'
import { MainNav } from '@/components/navigation/MainNav'
import { BottomNav } from '@/components/navigation/BottomNav'

interface TasksLayoutProps {
  children: ReactNode
}

export default function TasksLayout({ children }: TasksLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Navigation (Desktop only, lg and up) */}
      <div className="hidden lg:block">
        <MainNav />
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Bottom Navigation (Mobile and Tablets, <lg) */}
      <div className="block lg:hidden">
        <BottomNav />
      </div>
    </div>
  )
} 