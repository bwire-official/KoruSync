'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Sun, Moon, Lock, Eye, EyeOff, Check, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import AuthLayout from '../layout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'

interface PasswordRequirement {
  text: string
  regex: RegExp
  met: boolean
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [form, setForm] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    { text: 'At least 8 characters', regex: /.{8,}/, met: false },
    { text: 'At least one uppercase letter', regex: /[A-Z]/, met: false },
    { text: 'At least one lowercase letter', regex: /[a-z]/, met: false },
    { text: 'At least one number', regex: /[0-9]/, met: false },
    { text: 'At least one special character', regex: /[!@#$%^&*(),.?":{}|<>]/, met: false }
  ])
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    if (!token) {
      setError('Invalid or expired reset link. Please request a new one.')
    }
  }, [token])

  useEffect(() => {
    setPasswordRequirements(prev => 
      prev.map(req => ({
        ...req,
        met: req.regex.test(form.password)
      }))
    )
  }, [form.password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || !token) return

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!passwordRequirements.every(req => req.met)) {
      setError('Please meet all password requirements')
      return
    }

    setLoading(true)
    setError('')

    try {
      // TODO: Implement reset password logic with token
      // await resetPassword(token, form.password)
      setSuccess(true)
    } catch (err) {
      setError('Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout>
        <div className="w-full max-w-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300 ease-in-out">
          <div className="text-center space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-red-600 dark:text-red-400">
                Invalid or expired reset link
              </p>
            </div>
            <Link 
              href="/auth/forgot-password" 
              className="inline-block text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/auth/forgot-password" 
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

        <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-1">Reset Password</h2>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
          Create a new password for your account
        </p>
        
        {success ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <p className="text-emerald-600 dark:text-emerald-400">
                Password reset successful! You can now log in with your new password.
              </p>
            </div>
            <Link 
              href="/auth/login" 
              className="inline-block text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              Go to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors duration-200 group-focus-within:text-cyan-500 dark:group-focus-within:text-emerald-500" />
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"}
                placeholder="New Password" 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
                error={error}
                required 
                disabled={loading}
                className="pl-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Requirements */}
            <div className="space-y-2 text-sm">
              {passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center text-gray-500 dark:text-gray-400">
                  {req.met ? (
                    <Check className="w-4 h-4 text-emerald-500 mr-2" />
                  ) : (
                    <X className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  {req.text}
                </div>
              ))}
            </div>

            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors duration-200 group-focus-within:text-cyan-500 dark:group-focus-within:text-emerald-500" />
              <Input 
                id="confirmPassword" 
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password" 
                value={form.confirmPassword} 
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} 
                required 
                disabled={loading}
                className="pl-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button 
              type="submit" 
              fullWidth 
              isLoading={loading} 
              disabled={loading || !passwordRequirements.every(req => req.met)} 
              className="mt-6"
            >
              Reset Password
            </Button>
          </form>
        )}
      </div>
    </AuthLayout>
  )
} 