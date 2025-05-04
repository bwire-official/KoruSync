'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SocialButton } from '@/components/ui/SocialButton'
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator'
import { ArrowLeft, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/hooks/useAuth'

export function SignupForm() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({ password: '', confirmPassword: '' })
  const [accepted, setAccepted] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { loading, error, signUp } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (loading) return // Prevent changes while loading
    setForm({ ...form, [e.target.id]: e.target.value })
    if (e.target.id === 'password') {
      setErrors({
        ...errors,
        password: e.target.value.length < 6 ? 'Password must be at least 6 characters' : '',
        confirmPassword: form.confirmPassword && e.target.value !== form.confirmPassword ? 'Passwords do not match' : ''
      })
    }
    if (e.target.id === 'confirmPassword') {
      setErrors({
        ...errors,
        confirmPassword: form.password !== e.target.value ? 'Passwords do not match' : ''
      })
    }
  }

  const isFormValid =
    form.fullName.trim() &&
    form.email.trim() &&
    form.password.length >= 6 &&
    form.password === form.confirmPassword &&
    !errors.password &&
    !errors.confirmPassword &&
    accepted

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid || loading) return
    await signUp(form.email, form.password, form.fullName)
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          </div>
        )}
        {/* Card Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col items-center">
            <Image src="/logo.svg" alt="KoruSync Logo" width={40} height={40} className="mb-1" />
            <span className="text-xl font-bold text-cyan-600 dark:text-emerald-400 font-inter">KoruSync</span>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-cyan-500" /> : <Moon className="w-5 h-5 text-emerald-500" />}
          </button>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Create your KoruSync Account</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Join us and start your journey</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Full Name" 
            id="fullName" 
            type="text" 
            placeholder="Enter your full name" 
            value={form.fullName} 
            onChange={handleChange} 
            required 
            disabled={loading}
          />
          <Input 
            label="Email" 
            id="email" 
            type="email" 
            placeholder="Enter your email" 
            value={form.email} 
            onChange={handleChange} 
            required 
            disabled={loading}
          />
          <Input 
            label="Password" 
            id="password" 
            type="password" 
            placeholder="Create a password" 
            value={form.password} 
            onChange={handleChange} 
            error={errors.password || error} 
            required 
            disabled={loading}
          />
          <PasswordStrengthIndicator password={form.password} />
          <Input 
            label="Confirm Password" 
            id="confirmPassword" 
            type="password" 
            placeholder="Confirm your password" 
            value={form.confirmPassword} 
            onChange={handleChange} 
            error={errors.confirmPassword} 
            required 
            disabled={loading}
          />
          <div className="flex items-center gap-2 pt-2">
            <input
              id="accept"
              type="checkbox"
              checked={accepted}
              onChange={e => !loading && setAccepted(e.target.checked)}
              className="accent-cyan-500 w-4 h-4 rounded border-gray-300 dark:border-gray-600 focus:ring-cyan-500"
              required
              disabled={loading}
            />
            <label htmlFor="accept" className="text-xs text-gray-600 dark:text-gray-400">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="underline text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300">Terms of Service</Link>{' '}and{' '}
              <Link href="/privacy" className="underline text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300">Privacy Policy</Link>.
            </label>
          </div>
          <Button type="submit" fullWidth isLoading={loading} disabled={!isFormValid || loading}>Sign Up</Button>
        </form>
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
          <span className="mx-3 text-xs text-gray-400">or sign up with</span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <SocialButton provider="google" disabled={loading}>Google</SocialButton>
          <SocialButton provider="twitter" disabled={loading}>X</SocialButton>
          <SocialButton provider="apple" disabled={loading}>Apple</SocialButton>
        </div>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-cyan-600 dark:text-cyan-400 hover:underline">Log In</Link>
        </p>
      </div>
    </AuthLayout>
  )
} 