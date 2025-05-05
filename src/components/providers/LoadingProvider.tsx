'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { PageLoader } from '../ui/Loader'
import { usePathname, useSearchParams } from 'next/navigation'

interface LoadingContextType {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

// Minimum time to show loader (in milliseconds)
const MIN_LOADING_TIME = 800

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true) // Start with loading true
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const startLoading = () => {
    setLoadingStartTime(Date.now())
    setIsLoading(true)
  }

  const stopLoading = () => {
    const currentTime = Date.now()
    const elapsedTime = currentTime - (loadingStartTime || currentTime)
    const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime)

    if (remainingTime > 0) {
      setTimeout(() => {
        setIsLoading(false)
        setLoadingStartTime(null)
      }, remainingTime)
    } else {
      setIsLoading(false)
      setLoadingStartTime(null)
    }
  }

  // Show loader on initial page load
  useEffect(() => {
    startLoading()
    const timer = setTimeout(() => {
      stopLoading()
    }, MIN_LOADING_TIME)

    return () => clearTimeout(timer)
  }, [])

  // Show loader on route changes
  useEffect(() => {
    startLoading()
    const timer = setTimeout(() => {
      stopLoading()
    }, MIN_LOADING_TIME)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {isLoading && <PageLoader />}
      <div className={isLoading ? 'hidden' : ''}>
        {children}
      </div>
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
} 