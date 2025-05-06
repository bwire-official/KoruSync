'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Sun, Moon, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SocialButton } from '@/components/ui/SocialButton'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons'

export default function LoginPage() {
  const [form, setForm] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const { loading, error, signIn, signInWithEmail } = useAuth()
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

  return (
    <div className="w-full max-w-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href="/" 
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

      <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-1">Welcome back</h2>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">Log in to your account</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors duration-200 group-focus-within:text-cyan-500 dark:group-focus-within:text-emerald-500" />
          <Input  
            id="email" 
            type="text" 
            placeholder="Email or Username" 
            value={form.email} 
            onChange={handleChange} 
            required 
            disabled={loading}
            className="pl-10"
          />
        </div>

        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors duration-200 group-focus-within:text-cyan-500 dark:group-focus-within:text-emerald-500" />
          <Input 
            // label="Password" 
            id="password" 
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password" 
            value={form.password} 
            onChange={handleChange} 
            error={error || undefined }
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

        <div className="flex justify-end">
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

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <SocialLoginButtons />
      </div>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
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