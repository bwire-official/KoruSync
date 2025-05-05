'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Sun, Moon, Mail, Lock, Loader2 } from 'lucide-react'
import AuthLayout from '../layout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState('')
  const [resendCooldown, setResendCooldown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { loading, error, verifyOTP, resendOTP, success } = useAuth()

  // Get email from session storage
  const [email, setEmail] = useState('')
  useEffect(() => {
    const storedEmail = localStorage.getItem('verificationEmail')
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      // If no email found, redirect to signup
      window.location.href = '/auth/signup'
    }
  }, [])

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else {
      setCanResend(true)
    }
  }, [resendCooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || !otp || isVerifying) return
    
    setIsVerifying(true)
    
    try {
      await verifyOTP(otp)
    } catch (error) {
      console.error('Verification error:', error)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (!canResend || loading) return
    await resendOTP()
    setResendCooldown(60)
    setCanResend(false)
  }

  // Get a more user-friendly error message
  const getErrorMessage = () => {
    if (!error) return null
    if (error.includes('Invalid OTP')) return 'The code you entered is incorrect. Please try again.'
    if (error.includes('expired')) return 'This code has expired. Please request a new one.'
    if (error.includes('rate limit')) return 'Too many attempts. Please wait a moment before trying again.'
    return error
  }

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

        <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-1">Verify your email</h2>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          Enter the 6-digit code sent to {email}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
              {success}
            </div>
          )}
          
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors duration-200 group-focus-within:text-cyan-500 dark:group-focus-within:text-emerald-500" />
            <Input 
              id="otp" 
              type="text" 
              placeholder="Enter 6-digit code" 
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              error={getErrorMessage()}
              required 
              disabled={loading || isVerifying}
              className="pl-10 text-center tracking-widest"
            />
            {isVerifying && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500 dark:text-emerald-500 animate-spin" />
            )}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend || loading || isVerifying}
              className={`text-sm ${
                canResend 
                  ? 'text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300' 
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {canResend ? 'Resend code' : `Resend in ${resendCooldown}s`}
            </button>
          </div>

          <Button 
            type="submit" 
            fullWidth 
            isLoading={loading || isVerifying}
            disabled={loading || isVerifying || otp.length !== 6}
            className="mt-6"
          >
            {isVerifying ? 'Verifying...' : 'Verify Email'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
} 