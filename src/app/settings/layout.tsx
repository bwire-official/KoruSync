'use client'

import { ReactNode } from 'react'
import { MainNav } from '@/components/navigation/MainNav'
import { BottomNav } from '@/components/navigation/BottomNav'

interface SettingsLayoutProps {
  children: ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Navigation (Desktop only, lg and up) */}
      <div className="hidden lg:block">
        <MainNav />
      </div>

      {/* Main Content */}
      <main className="mx-auto w-full sm:w-[98%] md:w-[96%] lg:w-[94%] xl:w-[92%] px-[0.25px] sm:px-2 md:px-3 lg:px-4 py-[0.25px] sm:py-2 md:py-3 lg:py-4 pb-14 md:pb-8 lg:pt-20">
        {children}
      </main>

      {/* Bottom Navigation (Mobile and Tablets, <lg) */}
      <div className="block lg:hidden">
        <BottomNav />
      </div>
    </div>
  )
} 