import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useCallback, useEffect, useState } from 'react'
import { Database } from '@/types/database'
import type { User } from '@supabase/supabase-js'
import { supabase, handleAuthError } from '@/lib/supabase'

// Create a single instance of the Supabase client
const supabaseClient = createClientComponentClient<Database>()

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabaseClient.auth])

  const signIn = useCallback(
    async (provider: 'google' | 'email', email?: string, password?: string) => {
      if (provider === 'email') {
        if (!email || !password) {
          throw new Error('Email and password are required')
        }
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        if (!data.user?.email_confirmed_at) {
          router.push('/auth/verify-email')
          return
        }
        router.push('/dashboard')
        return
      }

      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) throw error
    },
    [router, supabaseClient.auth]
  )

  const signInWithEmail = useCallback(async (identifier: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      let emailToLogin: string | null = null

      // Basic check if input looks like an email
      if (identifier.includes('@')) {
        emailToLogin = identifier
      } else {
        // Assume it's a username, call the RPC function
        console.log(`Attempting to find email for username: ${identifier}`)
        const { data: rpcData, error: rpcError } = await supabaseClient.rpc(
          'get_email_by_username',
          { p_username: identifier }
        )

        if (rpcError) {
          console.error('RPC Error fetching email:', rpcError)
          setError('Invalid login credentials.')
          setLoading(false)
          return
        }

        if (rpcData) {
          console.log(`Found email: ${rpcData}`)
          emailToLogin = rpcData
        } else {
          console.log(`Username not found: ${identifier}`)
          setError('Invalid login credentials.')
          setLoading(false)
          return
        }
      }

      // If we couldn't determine an email, something went wrong
      if (!emailToLogin) {
        setError('Invalid login credentials.')
        setLoading(false)
        return
      }

      const { data, error: signInError } = await supabaseClient.auth.signInWithPassword({
        email: emailToLogin,
        password
      })

      if (signInError) {
        if (signInError.message.includes('Email not confirmed')) {
          // Store email for verification
          localStorage.setItem('verificationEmail', emailToLogin)
          router.push('/auth/verify-otp')
          return
        }
        throw signInError
      }

      if (data.user) {
        // If email is not verified, redirect to verification
        if (!data.user.email_confirmed_at) {
          localStorage.setItem('verificationEmail', emailToLogin)
          router.push('/auth/verify-otp')
        } else {
          // Email is verified, proceed to dashboard
          router.push('/dashboard')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }, [router])

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true)
      setError(null)

      // Store email for verification
      localStorage.setItem('verificationEmail', email)

      // Use standard Supabase auth signup
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        throw error
      }

      // Redirect to verification page
      router.push('/auth/verify-otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during signup')
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = useCallback(async (otp: string) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const email = localStorage.getItem('verificationEmail')
      if (!email) {
        throw new Error('No email found for verification. Please try signing up again.')
      }

      // Use standard Supabase auth for OTP verification
      const { data, error: supabaseError } = await supabaseClient.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      })

      if (supabaseError) {
        // Handle specific Supabase auth errors
        if (supabaseError.message.includes('Invalid OTP')) {
          throw new Error('Invalid verification code. Please try again.')
        } else if (supabaseError.message.includes('expired')) {
          throw new Error('This code has expired. Please request a new one.')
        } else if (supabaseError.message.includes('rate limit')) {
          throw new Error('Too many attempts. Please wait a moment before trying again.')
        } else {
          throw new Error(supabaseError.message)
        }
      }

      // Clear stored email after successful verification
      localStorage.removeItem('verificationEmail')

      // Show success message
      setSuccess('🎉 Email verified successfully! Redirecting to onboarding...')

      // Redirect to onboarding after a short delay
      setTimeout(() => {
        router.push('/onboarding')
      }, 1500)

    } catch (err) {
      // Handle different types of errors
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          setError('Could not connect to server. Please check your connection and try again.')
        } else {
          setError(err.message)
        }
      } else {
        setError('An unexpected error occurred during verification')
      }
      console.error('Verification error:', err)
    } finally {
      setLoading(false)
    }
  }, [router])

  const resendOTP = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const email = localStorage.getItem('verificationEmail')
      if (!email) {
        throw new Error('No email found for verification. Please try signing up again.')
      }

      // Use standard Supabase auth for resending verification
      const { error: resendError } = await supabaseClient.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (resendError) {
        // Handle specific Supabase auth errors
        if (resendError.message.includes('rate limit')) {
          throw new Error('Too many attempts. Please wait a moment before trying again.')
        } else {
          throw new Error(resendError.message || 'Failed to resend verification code.')
        }
      }

      // Show success message
      setSuccess('New verification code sent! Please check your email.')
    } catch (err) {
      // Handle different types of errors
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          setError('Could not connect to server. Please check your connection and try again.')
        } else {
          setError(err.message)
        }
      } else {
        setError('An unexpected error occurred while resending the code')
      }
      console.error('Resend error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      const { error } = await supabaseClient.auth.signOut()
      if (error) throw error
      router.push('/auth/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign out')
    } finally {
      setLoading(false)
    }
  }, [router])

  return {
    user,
    loading,
    error,
    success,
    signIn,
    signInWithEmail,
    signUp,
    signOut,
    verifyOTP,
    resendOTP,
  }
} 