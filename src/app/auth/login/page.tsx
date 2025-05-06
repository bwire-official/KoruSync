'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sun, Moon, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const { loading, error, signInWithEmail } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (loading) return
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    await signInWithEmail(form.email, form.password)
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="w-full max-w-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 ease-in-out"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
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

      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Welcome back</h2>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">Log in to your account</p>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <div className="flex items-center w-full px-4 py-3">
            <Mail className="w-4 h-4 text-gray-400 transition-colors duration-200 group-focus-within:text-cyan-500 dark:group-focus-within:text-emerald-500 flex-shrink-0" />
            <Input 
              id="email" 
              type="text" 
              placeholder="   Email or Username" 
              value={form.email} 
              onChange={handleChange} 
              required 
              disabled={loading}
              className="border-0 bg-transparent focus:ring-0 px-3 flex-1"
              inputSize="lg"
            />
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center w-full px-4 py-3">
            <Lock className="w-4 h-4 text-gray-400 transition-colors duration-200 group-focus-within:text-cyan-500 dark:group-focus-within:text-emerald-500 flex-shrink-0" />
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"}
              placeholder="   Enter your password" 
              value={form.password} 
              onChange={handleChange} 
              error={error || undefined}
              required 
              disabled={loading}
              className="border-0 bg-transparent focus:ring-0 px-3 flex-1"
              inputSize="lg"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 flex-shrink-0"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500 dark:border-gray-600 dark:focus:ring-emerald-500"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-500 dark:text-gray-400">
              Remember me
            </label>
          </div>
          <Link 
            href="/auth/forgot-password" 
            className={`text-sm text-cyan-600 dark:text-cyan-400 hover:underline transition-colors duration-200 ${loading ? 'pointer-events-none opacity-50' : ''}`}
          >
            Forgot password?
          </Link>
        </div>

        <Button 
          type="submit" 
          fullWidth 
          isLoading={loading} 
          disabled={loading} 
          size="lg"
          className="mt-6"
        >
          Sign In
        </Button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-cyan-600 dark:text-cyan-400 hover:underline">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-cyan-600 dark:text-cyan-400 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </form>

      <div className="space-y-5 mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>
        <SocialLoginButtons />
      </div>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8">
        Don't have an account?{' '}
        <Link 
          href="/auth/signup" 
          className="text-cyan-600 dark:text-cyan-400 hover:underline transition-colors duration-200"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
} 