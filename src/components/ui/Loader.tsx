'use client'

import { Loader2 } from 'lucide-react'

interface LoaderProps {
  className?: string
}

// For buttons and small loading states
export const ButtonLoader = ({ className = '' }: LoaderProps) => {
  return (
    <Loader2
      className={`h-5 w-5 animate-spin ${className}`}
      aria-hidden="true"
    />
  )
}

// For inline loading states (next to text, inputs, etc)
export const InlineSpinner = ({ className = '' }: LoaderProps) => {
  return (
    <Loader2
      className={`h-4 w-4 animate-spin ${className}`}
      aria-hidden="true"
    />
  )
}

// For full page loading states
export const PageLoader = ({ className = '' }: LoaderProps) => {
  return (
    <div className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-4xl font-bold text-emerald-500 animate-pulse">
          KoruSync
        </h1>
        <div className="flex items-center space-x-2">
          <span className="text-lg text-gray-600 dark:text-gray-300">
            Loading
          </span>
          <div className="flex space-x-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  )
} 