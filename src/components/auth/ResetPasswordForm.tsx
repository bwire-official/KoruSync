'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PasswordStrengthIndicator } from '@/components/ui/PasswordStrengthIndicator'

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: ''
  })

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long'
    }
    return ''
  }

  const validateConfirmPassword = (password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      return 'Passwords do not match'
    }
    return ''
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setFormData({ ...formData, password: newPassword })
    setErrors({
      ...errors,
      password: validatePassword(newPassword),
      confirmPassword: validateConfirmPassword(newPassword, formData.confirmPassword)
    })
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value
    setFormData({ ...formData, confirmPassword: newConfirmPassword })
    setErrors({
      ...errors,
      confirmPassword: validateConfirmPassword(formData.password, newConfirmPassword)
    })
  }

  const isFormValid = () => {
    return (
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword &&
      !errors.password &&
      !errors.confirmPassword
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid()) return

    setIsLoading(true)
    // TODO: Implement reset password logic
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Set a New Password
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            id="password"
            placeholder="Enter your new password"
            value={formData.password}
            onChange={handlePasswordChange}
            error={errors.password}
            required
          />

          <PasswordStrengthIndicator password={formData.password} />

          <Input
            label="Confirm New Password"
            type="password"
            id="confirmPassword"
            placeholder="Confirm your new password"
            value={formData.confirmPassword}
            onChange={handleConfirmPasswordChange}
            error={errors.confirmPassword}
            required
          />

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={!isFormValid()}
          >
            Set New Password
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Remember your password?{' '}
          <Link
            href="/auth/login"
            className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300"
          >
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
} 