'use client'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 p-4">
      {children}
    </div>
  )
} 