'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Sun, Moon, Mail } from 'lucide-react'
import AuthLayout from '../layout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // TODO: Implement forgot password logic with email link
      // await sendPasswordResetLink(email)
      setSuccess(true)
    } catch (err) {
      setError('Failed to send reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/auth/login" 
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

        <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-1">Forgot Password</h2>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          Enter your email address and we'll send you a password reset link
        </p>
        
        {success ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <p className="text-emerald-600 dark:text-emerald-400">
                Reset link sent! Please check your email.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Click the link in the email to reset your password.
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors duration-200 group-focus-within:text-cyan-500 dark:group-focus-within:text-emerald-500" />
              <Input 
                id="email" 
                type="email" 
                placeholder="Email Address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                error={error}
                required 
                disabled={loading}
                className="pl-10"
              />
            </div>

            <Button 
              type="submit" 
              fullWidth 
              isLoading={loading} 
              disabled={loading} 
              className="mt-6"
            >
              Send Reset Link
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Remember your password?{' '}
          <Link 
            href="/auth/login" 
            className="text-cyan-600 dark:text-cyan-400 hover:underline transition-colors duration-200"
          >
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
} 