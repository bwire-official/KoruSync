'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import  AuthLayout  from '@/components/layouts/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SocialButton } from '@/components/ui/SocialButton'
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator'
import { ArrowLeft, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/hooks/useAuth'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ButtonLoader } from '@/components/ui/Loader'
import { PasswordRequirements } from './PasswordRequirements'

const signUpSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type SignUpFormData = z.infer<typeof signUpSchema>

export function SignupForm() {
  const [loading, setLoading] = useState(false)
  const { signUp, signIn } = useAuth()
  const { register, handleSubmit, formState: { errors }, watch } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema)
  })
  const { theme, toggleTheme } = useTheme()
  const password = watch('password')

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setLoading(true)
      await signUp(data.email, data.password, data.fullName)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Full Name
            </label>
            <div className="mt-1 relative">
              <input
                {...register('fullName')}
                type="text"
                id="fullName"
                className="w-full px-4 py-3 text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                placeholder="   John Doe"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Email
            </label>
            <div className="mt-1 relative">
              <input
                {...register('email')}
                type="email"
                id="email"
                className="w-full px-4 py-3 text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                placeholder="   john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Password
            </label>
            <div className="mt-1 relative">
              <input
                {...register('password')}
                type="password"
                id="password"
                className="w-full px-4 py-3 text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                placeholder="   ••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Confirm Password
            </label>
            <div className="mt-1 relative">
              <input
                {...register('confirmPassword')}
                type="password"
                id="confirmPassword"
                className="w-full px-4 py-3 text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                placeholder="   ••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <PasswordRequirements password={password} />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <ButtonLoader /> : 'Create Account'}
          </button>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => signIn('google')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-medium">Continue with Google</span>
              </button>
            </div>
          </div>
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