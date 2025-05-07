'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { PageLoader } from '@/components/loaders'

interface LoadingContextType {
  isLoading: boolean
  message: string | null
  startLoading: (message?: string) => void
  stopLoading: () => void
}

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  message: null,
  startLoading: () => {},
  stopLoading: () => {}
})

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<string | null>('Loading...')
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Handle route changes
  useEffect(() => {
    setIsLoading(true)
    setMessage('Loading...')

    const timer = setTimeout(() => {
      setIsLoading(false)
      setMessage(null)
    }, 800)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  const startLoading = (newMessage?: string) => {
    setIsLoading(true)
    setMessage(newMessage || 'Loading...')
  }

  const stopLoading = () => {
    setIsLoading(false)
    setMessage(null)
  }

  return (
    <LoadingContext.Provider value={{ isLoading, message, startLoading, stopLoading }}>
      {isLoading ? (
        <PageLoader message={message || undefined} />
      ) : (
        <div className="animate-fade-in">
          {children}
        </div>
      )}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
} 