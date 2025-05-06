'use client'

import { useState } from 'react'
import Link from 'next/link'
import  AuthLayout  from '@/components/layouts/AuthLayout'
import { Button } from '@/components/ui/Button'

export function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false)
  const [isResent, setIsResent] = useState(false)

  const handleResend = async () => {
    setIsResending(true)
    // TODO: Implement resend verification email logic
    setTimeout(() => {
      setIsResending(false)
      setIsResent(true)
    }, 1000)
  }

  return (
    <AuthLayout showBackButton={false}>
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Verify your email
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            We've sent you a verification link to your email address.
            Please check your inbox and click the link to verify your account.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleResend}
            isLoading={isResending}
            disabled={isResent}
          >
            {isResent ? 'Email resent' : 'Resend verification email'}
          </Button>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isResent
              ? 'A new verification email has been sent.'
              : "Didn't receive the email? Check your spam folder or try resending."}
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/auth/login"
            className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300"
          >
            Back to login
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
} 