import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useCallback, useEffect, useState } from 'react'
import { Database } from '@/types/database'
import type { User } from '@supabase/auth-helpers-nextjs'
import { supabase, handleAuthError } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const signIn = useCallback(async (provider: 'google' | 'twitter' | 'apple') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }, [supabase.auth])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) throw signInError

      if (data.user) {
        // If email is not verified, redirect to verification
        if (!data.user.email_confirmed_at) {
          sessionStorage.setItem('verificationEmail', email)
          router.push('/auth/verify-otp')
        } else {
          // Email is verified, proceed to dashboard
          router.push('/dashboard')
        }
      }
    } catch (err) {
      setError(handleAuthError(err).message)
    } finally {
      setLoading(false)
    }
  }, [supabase.auth, router])

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true)
      setError(null)

      // Store email for verification before signup
      sessionStorage.setItem('verificationEmail', email)

      // First, sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (signUpError) {
        // Clear stored email if signup fails
        sessionStorage.removeItem('verificationEmail')
        throw signUpError
      }

      if (data.user) {
        // Wait for the user record to be created by the trigger
        await new Promise(resolve => setTimeout(resolve, 1000))

        try {
          // Initialize user preferences
          const { error: initError } = await supabase
            .from('user_preferences')
            .insert({
              user_id: data.user.id,
              onboarding_completed: false,
              theme: 'system',
              notifications_enabled: true
            })

          if (initError) {
            // If initialization fails, try to check if preferences already exist
            const { data: existingPrefs, error: checkError } = await supabase
              .from('user_preferences')
              .select('*')
              .eq('user_id', data.user.id)
              .single()

            if (checkError || !existingPrefs) {
              console.error('Failed to initialize user preferences:', initError)
              // Continue with signup even if preferences initialization fails
              // The trigger should handle this, but we log it for debugging
            }
          }
        } catch (err) {
          console.error('Error in user preferences initialization:', err)
          // Continue with signup even if preferences initialization fails
        }

        // Redirect to verification
        router.push('/auth/verify-otp')
      }
    } catch (err) {
      setError(handleAuthError(err).message)
    } finally {
      setLoading(false)
    }
  }, [supabase.auth, router])

  const verifyOTP = useCallback(async (otp: string) => {
    let localLoading = false;
    try {
      localLoading = true;
      setError(null)
      setSuccess(null)

      const email = sessionStorage.getItem('verificationEmail')
      if (!email) {
        console.error('Verification Error: No email found in session storage')
        throw new Error('No email found for verification. Please try signing up again.')
      }

      // Step 1: Verify the OTP with detailed logging
      console.log('Starting OTP verification for email:', email)
      const { data, error: supabaseError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      })

      // Log raw response immediately
      console.log('Supabase verifyOtp RAW RESPONSE:', {
        data,
        error: supabaseError,
        user: data?.user,
        session: data?.session
      })

      if (supabaseError) {
        // Supabase reported an error
        console.error('Supabase verifyOtp returned an error:', supabaseError)
        
        if (supabaseError.message.includes('Invalid OTP')) {
          throw new Error('The verification code is incorrect. Please try again.')
        }
        if (supabaseError.message.includes('expired')) {
          throw new Error('This code has expired. Please request a new one.')
        }
        if (supabaseError.message.includes('rate limit')) {
          throw new Error('Too many attempts. Please wait a moment before trying again.')
        }
        throw new Error('Email verification failed. Please try again.')
      }

      // **** SUCCESS PATH ****
      // Supabase reported NO error, so verification WORKED
      console.log('Verification successful according to Supabase response')

      // Step 2: Clear the stored email
      sessionStorage.removeItem('verificationEmail')

      // Step 3: Update internal state with the verified data
      if (data.user) {
        console.log('Updating internal state with verified user:', {
          email: data.user.email,
          confirmed_at: data.user.email_confirmed_at,
          user_id: data.user.id
        })
        setUser(data.user)
      }

      // Step 4: Refresh the session
      console.log('Refreshing session...')
      await supabase.auth.refreshSession()

      // Step 5: Wait for database triggers to complete
      console.log('Waiting for database triggers to complete...')
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Step 6: Check onboarding status
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('onboarding_completed')
        .eq('user_id', data.user.id)
        .single()

      if (preferencesError) {
        console.error('Onboarding Check Error:', {
          code: preferencesError.code,
          message: preferencesError.message,
          details: preferencesError.details,
          hint: preferencesError.hint
        })
        
        // If there's an RLS error, try to create the preferences
        if (preferencesError.code === '42501') {
          // Wait a bit longer for the trigger to complete
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // Try to get the preferences again
          const { data: retryData, error: retryError } = await supabase
            .from('user_preferences')
            .select('onboarding_completed')
            .eq('user_id', data.user.id)
            .single()

          if (retryError) {
            console.error('Retry Onboarding Check Error:', {
              code: retryError.code,
              message: retryError.message,
              details: retryError.details,
              hint: retryError.hint
            })
            // Continue with onboarding even if preferences check fails
            setSuccess('🎉 Email verified successfully! Please wait while we prepare your onboarding experience...')
            await new Promise(resolve => setTimeout(resolve, 1500))
            router.push('/onboarding')
            return true
          }

          // Use the retry data if successful
          if (!retryData?.onboarding_completed) {
            setSuccess('🎉 Email verified successfully! Please wait while we prepare your onboarding experience...')
            await new Promise(resolve => setTimeout(resolve, 1500))
            router.push('/onboarding')
          } else {
            setSuccess('🎉 Email verified successfully! Redirecting to your dashboard...')
            await new Promise(resolve => setTimeout(resolve, 1500))
            router.push('/dashboard')
          }
          return true
        } else {
          // For other errors, assume not completed
          setSuccess('🎉 Email verified successfully! Please wait while we prepare your onboarding experience...')
          await new Promise(resolve => setTimeout(resolve, 1500))
          router.push('/onboarding')
          return true
        }
      }

      // Step 7: Redirect based on onboarding status
      if (!preferencesData?.onboarding_completed) {
        console.log('Onboarding Status:', {
          user_id: data.user.id,
          onboarding_completed: false
        })
        setSuccess('🎉 Email verified successfully! Please wait while we prepare your onboarding experience...')
        await new Promise(resolve => setTimeout(resolve, 1500))
        router.push('/onboarding')
      } else {
        console.log('Onboarding Status:', {
          user_id: data.user.id,
          onboarding_completed: true
        })
        setSuccess('🎉 Email verified successfully! Redirecting to your dashboard...')
        await new Promise(resolve => setTimeout(resolve, 1500))
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Verification Process Error:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      })
      setError(handleAuthError(err).message)
      // Don't redirect on error
      return false
    } finally {
      localLoading = false;
    }
    return localLoading;
  }, [supabase.auth, router])

  const resendOTP = useCallback(async () => {
    let localLoading = false;
    try {
      localLoading = true;
      setError(null)

      const email = sessionStorage.getItem('verificationEmail')
      if (!email) {
        throw new Error('No email found for verification. Please try signing up again.')
      }

      // Send new verification email
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (resendError) {
        if (resendError.message.includes('rate limit')) {
          throw new Error('Please wait a moment before requesting another code.')
        }
        throw resendError
      }

      // Show success message
      setError('New verification code sent! Please check your email.')
    } catch (err) {
      setError(handleAuthError(err).message)
    } finally {
      localLoading = false;
    }
    return localLoading;
  }, [supabase.auth])

  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/auth/login')
    } catch (err) {
      setError(handleAuthError(err).message)
    } finally {
      setLoading(false)
    }
  }, [supabase.auth, router])

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