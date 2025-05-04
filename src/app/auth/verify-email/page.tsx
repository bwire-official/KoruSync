'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Sun, Moon, Mail } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import AuthLayout from '../layout'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid or expired verification link')
      return
    }

    const verifyEmail = async () => {
      setLoading(true)
      try {
        // TODO: Implement verify email logic with token
        // await verifyEmailWithToken(token)
        // If successful, redirect to onboarding
        window.location.href = '/auth/onboarding'
      } catch (err) {
        setError('Failed to verify email. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [token, email])

  return (
    <AuthLayout>
      <div className="w-full max-w-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/auth/signup" 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 ease-in-out"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 ease-in-out"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-cyan-500" />
            ) : (
              <Moon className="w-5 h-5 text-emerald-500" />
            )}
          </button>
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-8 h-8 mb-2">
            <Image 
              src="/logo.svg" 
              alt="KoruSync Logo" 
              fill 
              className="object-contain transition-transform duration-300 hover:scale-110" 
            />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
            KoruSync
          </span>
        </div>

        <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-1">Verify Your Email</h2>
        
        {loading ? (
          <div className="text-center space-y-4">
            <div className="animate-pulse">
              <p className="text-gray-600 dark:text-gray-400">
                Verifying your email...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
            <Link 
              href="/auth/signup" 
              className="inline-block text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Back to signup
            </Link>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <p className="text-emerald-600 dark:text-emerald-400">
                Email verified successfully!
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Redirecting to onboarding...
              </p>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  )
} 