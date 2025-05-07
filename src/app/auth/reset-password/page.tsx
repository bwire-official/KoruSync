'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Sun, Moon, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/contexts/ThemeContext'
import AuthLayout from '../layout'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const { theme, toggleTheme } = useTheme()
  
  // Initialize Supabase client
  const supabase = createClientComponentClient()

  // Listen for auth state changes and check initial session
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setSessionInfo(session)
        setIsReady(true)
        setVerificationError(null)
      } else {
        setIsReady(false)
        setVerificationError('Invalid or expired recovery link. Please request a new one.')
      }
    })

    // Check immediately on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && window.location.hash.includes('type=recovery')) {
        setSessionInfo(session)
        setIsReady(true)
        setVerificationError(null)
      } else {
        setVerificationError('Invalid or expired recovery link. Please request a new one.')
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Validate password length
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })

      if (error) {
        setErrorMessage(error.message || 'Failed to update password')
        setIsLoading(false)
        return
      }

      setSuccessMessage('Password updated successfully! Please log in.')

      try {
        await supabase.auth.signOut()
        await new Promise(resolve => setTimeout(resolve, 1000))
        router.push('/auth/login')
      } catch (signOutError) {
        router.push('/auth/login')
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/auth/login" 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 ease-in-out"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 ease-in-out"
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
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-10 h-10 mb-3">
            <Image 
              src="/logo.svg" 
              alt="KoruSync Logo" 
              fill 
              className="object-contain transition-transform duration-300 hover:scale-110" 
            />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
            KoruSync
          </span>
        </div>

        {verificationError ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {verificationError}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Link 
                href="/auth/forgot-password"
                className="text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                Request a new password reset link
              </Link>
              <Link 
                href="/auth/login"
                className="text-gray-600 dark:text-gray-400 hover:underline"
              >
                Return to login
              </Link>
            </div>
          </div>
        ) : successMessage ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <p className="text-emerald-600 dark:text-emerald-400">
                {successMessage}
              </p>
            </div>
            <Link 
              href="/auth/login" 
              className="inline-block text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Reset your password</h2>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
              Enter your new password below
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-red-600 dark:text-red-400">
                    {errorMessage}
                  </p>
                </div>
              )}

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors duration-200 group-focus-within:text-cyan-500 dark:group-focus-within:text-emerald-500" />
                <Input 
                  id="newPassword" 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={errorMessage || undefined}
                  required 
                  disabled={isLoading}
                  className="pl-11"
                  inputSize="lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors duration-200 group-focus-within:text-cyan-500 dark:group-focus-within:text-emerald-500" />
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errorMessage || undefined}
                  required 
                  disabled={isLoading}
                  className="pl-11"
                  inputSize="lg"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <Button 
                type="submit" 
                fullWidth 
                isLoading={isLoading} 
                loadingText='Updating Password...'
                disabled={isLoading} 
                size="lg"
                className="mt-6"
              >
                Update Password
              </Button>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  )
} 