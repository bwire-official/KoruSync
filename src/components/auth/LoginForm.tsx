'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import  AuthLayout  from '@/components/layouts/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SocialButton } from '@/components/ui/SocialButton'
import { ArrowLeft, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/hooks/useAuth'

export function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' })
  const { theme, toggleTheme } = useTheme()
  const { loading, error, signInWithEmail, signIn } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (loading) return // Prevent changes while loading
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    await signInWithEmail(form.email, form.password)
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
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Log in to KoruSync</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Welcome back! Please enter your details.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            //label="Email or Username" 
            id="email" 
            type="text" 
            placeholder="you@example.com or your_username" 
            value={form.email} 
            onChange={handleChange} 
            required 
            disabled={loading}
          />
          <Input 
            //label="Password" 
            id="password" 
            type="password" 
            placeholder="Enter your password" 
            value={form.password} 
            onChange={handleChange} 
            error={error || undefined}
            required 
            disabled={loading}
          />
          <div className="flex justify-end">
            <Link 
              href="/auth/forgot-password" 
              className={`text-sm text-cyan-600 dark:text-cyan-400 hover:underline ${loading ? 'pointer-events-none opacity-50' : ''}`}
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" fullWidth isLoading={loading} disabled={loading}>Log in</Button>
        </form>
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
          <span className="mx-3 text-xs text-gray-400">or continue with</span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <SocialButton provider="google" disabled={loading} onClick={() => signIn('google')}>Google</SocialButton>
          <SocialButton provider="twitter" disabled={loading} onClick={() => signIn('twitter')}>X</SocialButton>
          <SocialButton provider="apple" disabled={loading} onClick={() => signIn('apple')}>Apple</SocialButton>
        </div>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-cyan-600 dark:text-cyan-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
} 