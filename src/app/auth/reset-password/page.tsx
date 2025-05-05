'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Sun, Moon, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/contexts/ThemeContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const { theme, toggleTheme } = useTheme()
  
  // Initialize Supabase client
  const supabase = createClientComponentClient()

  // Listen for auth state changes and check initial session
  useEffect(() => {
    console.log('ResetPasswordPage: Setting up listener.')
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`ResetPasswordPage: Event: ${event}`)
      // If we get a session on this page, assume it's the recovery one
      if (session) {
        console.log('ResetPasswordPage: Recovery session detected via listener. Enabling form.')
        setSessionInfo(session)
        setIsReady(true)
        setVerificationError(null)
      } else {
        // Handle cases where session might become null
        setIsReady(false)
        setVerificationError('Invalid or expired recovery link. Please request a new one.')
      }
    })

    // Also check immediately on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && window.location.hash.includes('type=recovery')) {
        console.log('ResetPasswordPage: Recovery session detected on initial load.')
        setSessionInfo(session)
        setIsReady(true)
        setVerificationError(null)
      } else {
        setVerificationError('Invalid or expired recovery link. Please request a new one.')
      }
    })

    return () => {
      console.log('ResetPasswordPage: Cleaning up auth listener.')
      authListener?.subscription.unsubscribe()
    }
  }, [supabase])

  // Password validation criteria
  const passwordCriteria = {
    minLength: 8,
    hasUpperCase: /[A-Z]/.test(newPassword),
    hasLowerCase: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  }

  // Calculate password strength (0-100)
  const calculatePasswordStrength = () => {
    let strength = 0
    if (newPassword.length >= passwordCriteria.minLength) strength += 20
    if (passwordCriteria.hasUpperCase) strength += 20
    if (passwordCriteria.hasLowerCase) strength += 20
    if (passwordCriteria.hasNumber) strength += 20
    if (passwordCriteria.hasSpecialChar) strength += 20
    return strength
  }

  const passwordStrength = calculatePasswordStrength()

  // Client-side validation
  useEffect(() => {
    if (newPassword && confirmPassword) {
      if (newPassword.length < passwordCriteria.minLength) {
        setPasswordError(`Password must be at least ${passwordCriteria.minLength} characters long`)
      } else if (newPassword !== confirmPassword) {
        setPasswordError('Passwords do not match')
      } else if (passwordStrength < 60) {
        setPasswordError('Password is too weak. Please meet all requirements.')
      } else {
        setPasswordError(null)
      }
    } else {
      setPasswordError(null)
    }
  }, [newPassword, confirmPassword, passwordStrength])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Validate password length
    if (newPassword.length < passwordCriteria.minLength) {
      setErrorMessage(`Password must be at least ${passwordCriteria.minLength} characters long`)
      setIsLoading(false)
      return
    }

    try {
      console.log('ResetPasswordPage: Attempting to update password...')
      const { error } = await supabase.auth.updateUser({ password: newPassword })

      if (error) {
        console.error('ResetPasswordPage: Password update error:', error)
        setErrorMessage(error.message || 'Failed to update password')
        setIsLoading(false)
        return
      }

      // --- SUCCESS PATH ---
      console.log('ResetPasswordPage: Password update successful')
      setSuccessMessage('Password updated successfully! Please log in.')

      try {
        // Explicitly sign out to clear the recovery session
        console.log('ResetPasswordPage: Signing out recovery session...')
        await supabase.auth.signOut()
        console.log('ResetPasswordPage: Successfully signed out recovery session')

        // Add a small delay to ensure signOut propagates
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Redirect to login page
        console.log('ResetPasswordPage: Redirecting to login page...')
        router.push('/auth/login')
      } catch (signOutError) {
        console.error('ResetPasswordPage: Error signing out after password reset:', signOutError)
        // Even if signout fails, try redirecting to login anyway
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('ResetPasswordPage: Unexpected error during password reset:', error)
      setErrorMessage('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 relative">
      {isLoading ? (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
        </div>
      ) : null}
      
      {/* Card Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/auth/login" className="text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
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

      {!isReady ? (
        <div className="text-center space-y-4">
          {verificationError ? (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  {verificationError}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Link 
                  href="/auth/forgot-password"
                  className="text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  Request a new password reset link
                </Link>
                <Link 
                  href="/auth/login"
                  className="text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Return to login
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
              <p className="text-cyan-600 dark:text-cyan-400 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying recovery session...
              </p>
            </div>
          )}
        </div>
      ) : successMessage ? (
        <div className="text-center space-y-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <p className="text-emerald-600 dark:text-emerald-400">
              {successMessage}
            </p>
          </div>
        </div>
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-400">Password must contain:</p>
                <ul className="space-y-1">
                  <li className={`flex items-center gap-2 ${newPassword.length >= passwordCriteria.minLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <span>{newPassword.length >= passwordCriteria.minLength ? '✓' : '○'}</span>
                    At least {passwordCriteria.minLength} characters
                  </li>
                  <li className={`flex items-center gap-2 ${passwordCriteria.hasUpperCase ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <span>{passwordCriteria.hasUpperCase ? '✓' : '○'}</span>
                    One uppercase letter
                  </li>
                  <li className={`flex items-center gap-2 ${passwordCriteria.hasLowerCase ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <span>{passwordCriteria.hasLowerCase ? '✓' : '○'}</span>
                    One lowercase letter
                  </li>
                  <li className={`flex items-center gap-2 ${passwordCriteria.hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <span>{passwordCriteria.hasNumber ? '✓' : '○'}</span>
                    One number
                  </li>
                  <li className={`flex items-center gap-2 ${passwordCriteria.hasSpecialChar ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <span>{passwordCriteria.hasSpecialChar ? '✓' : '○'}</span>
                    One special character (!@#$%^&*(),.?":{}|&lt;&gt;)
                  </li>
                </ul>
              </div>

              {/* Password Strength Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Password Strength:</span>
                  <span className={`
                    ${passwordStrength >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 
                      passwordStrength >= 60 ? 'text-cyan-600 dark:text-cyan-400' : 
                      passwordStrength >= 40 ? 'text-yellow-600 dark:text-yellow-400' : 
                      'text-red-600 dark:text-red-400'}
                  `}>
                    {passwordStrength >= 80 ? 'Strong' : 
                     passwordStrength >= 60 ? 'Good' : 
                     passwordStrength >= 40 ? 'Fair' : 
                     'Weak'}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      passwordStrength >= 80 ? 'bg-emerald-500' : 
                      passwordStrength >= 60 ? 'bg-cyan-500' : 
                      passwordStrength >= 40 ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || passwordStrength < 60 || !confirmPassword}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 