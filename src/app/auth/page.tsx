'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SocialButton } from '@/components/ui/SocialButton'
import { useAuth } from '@/hooks/useAuth'

type AuthMode = 'signup' | 'login'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signup')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const { loading, error, signUp, signIn, signInWithEmail } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (loading) return // Prevent changes while loading
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    if (mode === 'signup') {
      // Validate passwords match
      if (form.password !== form.confirmPassword) {
        // TODO: Show error message
        return
      }
      await signUp(form.email, form.password, form.fullName)
    } else {
      await signInWithEmail(form.email, form.password)
    }
  }

  const toggleMode = () => {
    setMode(mode === 'signup' ? 'login' : 'signup')
    // Reset form
    setForm({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700">
        {/* Card Header */}
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.svg" alt="KoruSync Logo" width={40} height={40} className="mb-1" />
          <span className="text-xl font-bold text-cyan-600 dark:text-emerald-400 font-inter">KoruSync</span>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
          {mode === 'signup' ? 'Start your journey with KoruSync' : 'Log in to your account'}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
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
          )}
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
            placeholder={mode === 'signup' ? "Create a password" : "Enter your password"} 
            value={form.password} 
            onChange={handleChange} 
            error={error}
            required 
            disabled={loading}
          />
          {mode === 'signup' && (
            <Input 
              label="Confirm Password" 
              id="confirmPassword" 
              type="password" 
              placeholder="Confirm your password" 
              value={form.confirmPassword} 
              onChange={handleChange} 
              required 
              disabled={loading}
            />
          )}
          <Button type="submit" fullWidth isLoading={loading} disabled={loading}>
            {mode === 'signup' ? 'Create Account' : 'Log in'}
          </Button>
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
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={toggleMode}
            className="text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            {mode === 'signup' ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>
    </AuthLayout>
  )
} 