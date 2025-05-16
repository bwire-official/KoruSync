'use client'

import { useState, useEffect, FormEvent, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Sun, Moon, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database' 
import { Input } from '@/components/ui/Input' 
import { Button } from '@/components/ui/Button' 
import { useTheme } from '@/contexts/ThemeContext' 
import AuthLayout from '@/components/layouts/AuthLayout' 
import { Alert, AlertDescription } from "@/components/ui/alert" 
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Define the component
export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // For form submission
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidationError, setPasswordValidationError] = useState<string | null>(null);

  // isReady indicates if the Supabase client has processed the recovery token
  // and established the temporary session needed to update the password.
  const [isReady, setIsReady] = useState(false);
  const [pageError, setPageError] = useState<string | null>("Verifying recovery session..."); // Initial message

  const { theme, toggleTheme } = useTheme();
  const supabase = createClientComponentClient<Database>();

  // Listen for auth state changes to detect the PASSWORD_RECOVERY or SIGNED_IN event
  useEffect(() => {
    console.log('ResetPasswordPage: Setting up onAuthStateChange listener.');
    // Show loading/verifying message initially
    setIsReady(false);
    setPageError("Verifying recovery session..."); // Set initial loading/verifying message

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`ResetPasswordPage: Auth event: ${event}`, session);

      // When the recovery link is processed, Supabase typically fires 'SIGNED_IN' or 'PASSWORD_RECOVERY'
      // The key is that a session exists and the URL fragment for recovery was present.
      if ((event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY' || event === 'INITIAL_SESSION') && session) {
         // Check if the URL fragment still indicates recovery, just to be sure
         // This helps confirm the session is indeed related to the recovery flow
         if (window.location.hash.includes('type=recovery')) {
            console.log('ResetPasswordPage: Recovery session established. Enabling form.');
            setIsReady(true);
            setPageError(null); // Clear loading/error message
         } else if (isReady) {
            // If we were ready and suddenly the hash doesn't match, something is odd.
            // But generally, if SIGNED_IN fires, we trust the client has handled the recovery token.
            console.log('ResetPasswordPage: SIGNED_IN event, but recovery hash missing. Assuming client handled it.');
            setIsReady(true);
            setPageError(null);
         }
      } else if (event === 'SIGNED_OUT') {
        // If we get signed out explicitly on this page, the link was likely invalid or expired
        console.warn('ResetPasswordPage: SIGNED_OUT event received.');
        setIsReady(false);
        setPageError('Invalid or expired recovery link. Please request a new one.');
      }
    });

    // A timeout to handle cases where no relevant auth event fires quickly
    // This might happen if the URL fragment is missing entirely or invalid from the start
    const recoveryTimeout = setTimeout(() => {
        if (!isReady) { // If still not ready after a few seconds
            console.warn('ResetPasswordPage: Timeout waiting for recovery session. Checking hash again.');
            if (!window.location.hash.includes('type=recovery')) {
                setPageError('Invalid recovery link. No recovery token found in URL. Please request a new one.');
            } else {
                setPageError('Could not establish recovery session. Link may be invalid or expired.');
            }
            setIsReady(false); // Ensure form stays disabled
        }
    }, 3000); // 3-second timeout

    return () => {
      console.log('ResetPasswordPage: Cleaning up auth listener.');
      authListener?.subscription.unsubscribe();
      clearTimeout(recoveryTimeout);
    };
  // Run only on mount, supabase.auth should be stable
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Password validation criteria
  const passwordCriteria = {
    minLength: 8, // Example min length
    hasUpperCase: /[A-Z]/.test(newPassword),
    hasLowerCase: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  };

  // Calculate password strength (0-100)
  const calculatePasswordStrength = () => {
    let strength = 0;
    if (newPassword.length === 0) return 0; // No password, no strength
    if (newPassword.length >= passwordCriteria.minLength) strength += 20;
    if (passwordCriteria.hasUpperCase) strength += 20;
    if (passwordCriteria.hasLowerCase) strength += 20;
    if (passwordCriteria.hasNumber) strength += 20;
    if (passwordCriteria.hasSpecialChar) strength += 20;
    return Math.min(100, strength); // Cap at 100
  };

  const passwordStrength = calculatePasswordStrength();

  // Client-side validation for password fields
  useEffect(() => {
    if (!newPassword && !confirmPassword) { // If both fields are empty, no error
        setPasswordValidationError(null);
        return;
    }
    if (newPassword && newPassword.length < passwordCriteria.minLength) {
      setPasswordValidationError(`Password must be at least ${passwordCriteria.minLength} characters.`);
    } else if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      setPasswordValidationError('Passwords do not match.');
    } else if (newPassword && passwordStrength < 60) { // Example threshold for "too weak"
      setPasswordValidationError('Password is too weak. Please include uppercase, lowercase, numbers, and special characters.');
    }
     else {
      setPasswordValidationError(null);
    }
  }, [newPassword, confirmPassword, passwordCriteria.minLength, passwordStrength]);

  /**
   * Handles form submission to update the password.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isReady) {
        setErrorMessage("Session not ready for password update. Please ensure you used a valid link.");
        return;
    }
    if (passwordValidationError) {
      setErrorMessage(passwordValidationError);
      return;
    }
    // Re-check length one last time (should be covered by passwordValidationError)
    if (newPassword.length < passwordCriteria.minLength) {
        setErrorMessage(`Password must be at least ${passwordCriteria.minLength} characters long`);
        return;
    }
    if (newPassword !== confirmPassword) {
        setErrorMessage('Passwords do not match');
        return;
    }


    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      console.log('ResetPasswordPage: Attempting to update password...');
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        console.error('ResetPasswordPage: Password update error:', error);
        setErrorMessage(error.message || 'Failed to update password. The link may have expired.');
        setIsLoading(false);
        return;
      }

      // --- SUCCESS PATH ---
      console.log('ResetPasswordPage: Password update successful');
      setSuccessMessage('Password updated successfully! Redirecting to login...');

      try {
        console.log('ResetPasswordPage: Signing out recovery session...');
        await supabase.auth.signOut();
        console.log('ResetPasswordPage: Successfully signed out recovery session.');
      } catch (signOutError) {
        console.error('ResetPasswordPage: Error signing out after password reset:', signOutError);
        // Proceed to redirect even if signOut has an issue
      } finally {
        // Redirect to login page after a short delay to show message
        setTimeout(() => {
            console.log('ResetPasswordPage: Redirecting to login page...');
            router.push('/auth/login');
        }, 2000);
      }
    } catch (error) {
      console.error('ResetPasswordPage: Unexpected error during password reset:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setIsLoading(false); // Ensure loading is stopped
    }
    // No finally here for setIsLoading(false) because of the setTimeout in success path
  };

  // Main JSX for the ResetPasswordPage
  return (
    <AuthLayout title="Reset Password" showBackButton={!isReady && !successMessage}> {/* Show back button if stuck or error */}
      <div className="w-full max-w-sm bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100 dark:border-gray-700 transition-all duration-300 ease-in-out relative">
        {/* Loading Overlay for form submission */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="w-9 h-9"> {/* Placeholder for back button alignment */}
            {(!isReady && !successMessage) && ( // Show back button only if not ready or showing success
               <Link
                 href="/auth/login"
                 className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                 aria-label="Back to Login"
               >
                 <ArrowLeft className="w-5 h-5" />
               </Link>
            )}
          </div>
          <div className="flex flex-col items-center">
            <Image src="/logo.svg" alt="KoruSync Logo" width={32} height={32} className="mb-1" priority />
            <span className="text-lg font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
              KoruSync
            </span>
          </div>
          <div className="w-9 h-9 flex items-center justify-center">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700" />}
            </button>
          </div>
        </div>

        {/* Conditional Content: Loading/Error or Form or Success */}
        {!isReady ? (
          // Show loading/verifying message or specific verification error
          <div className="text-center space-y-4 py-8">
            {pageError ? (
              <>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 flex items-center justify-center gap-2">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>{pageError}</span>
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2 text-sm">
                  <Link href="/auth/forgot-password" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                    Request a new link
                  </Link>
                  <Link href="/auth/login" className="text-gray-600 dark:text-gray-400 hover:underline">
                    Return to Login
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                <p className="text-cyan-600 dark:text-cyan-400 flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Verifying recovery session...</span>
                </p>
              </div>
            )}
          </div>
        ) : successMessage ? (
          // Show success message after password update
          <div className="text-center space-y-4 py-8">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <p className="text-emerald-600 dark:text-emerald-400 text-center">
                {successMessage}
              </p>
            </div>
            <Link href="/auth/login" className="inline-block text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
              Proceed to Login
            </Link>
          </div>
        ) : (
          // Show the password reset form
          <>
            <CardHeader className="text-center p-0 mb-4">
              <CardTitle className="text-2xl">Set a New Password</CardTitle>
              <CardDescription>
                Please enter and confirm your new password below.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {errorMessage && ( // Error from form submission
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password Input */}
                <div className="space-y-1">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      className="pr-10" // Padding for eye icon
                      error={passwordValidationError ? " " : undefined} // Show red border if error
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements & Strength */}
                {newPassword && ( // Only show if newPassword has a value
                    <div className="space-y-2 text-xs">
                        <p className="text-gray-500 dark:text-gray-400">Password must include:</p>
                        <ul className="space-y-0.5">
                            <li className={`flex items-center gap-1.5 ${newPassword.length >= passwordCriteria.minLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {newPassword.length >= passwordCriteria.minLength ? <CheckCircle className="h-3 w-3"/> : <span className="inline-block w-3 text-center">○</span>}
                                At least {passwordCriteria.minLength} characters
                            </li>
                            <li className={`flex items-center gap-1.5 ${passwordCriteria.hasUpperCase ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {passwordCriteria.hasUpperCase ? <CheckCircle className="h-3 w-3"/> : <span className="inline-block w-3 text-center">○</span>} One uppercase letter
                            </li>
                            <li className={`flex items-center gap-1.5 ${passwordCriteria.hasLowerCase ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {passwordCriteria.hasLowerCase ? <CheckCircle className="h-3 w-3"/> : <span className="inline-block w-3 text-center">○</span>} One lowercase letter
                            </li>
                            <li className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {passwordCriteria.hasNumber ? <CheckCircle className="h-3 w-3"/> : <span className="inline-block w-3 text-center">○</span>} One number
                            </li>
                            <li className={`flex items-center gap-1.5 ${passwordCriteria.hasSpecialChar ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {passwordCriteria.hasSpecialChar ? <CheckCircle className="h-3 w-3"/> : <span className="inline-block w-3 text-center">○</span>} One special character
                            </li>
                        </ul>
                        <div className="mt-1">
                            <div className="flex justify-between text-xs mb-0.5">
                                <span className="text-gray-500 dark:text-gray-400">Strength:</span>
                                <span className={`${passwordStrength >= 80 ? 'text-emerald-600 dark:text-emerald-400' : passwordStrength >= 60 ? 'text-cyan-600 dark:text-cyan-400' : passwordStrength >= 40 ? 'text-yellow-500 dark:text-yellow-400' : 'text-red-500 dark:text-red-400'}`}>
                                {passwordStrength >= 80 ? 'Strong' : passwordStrength >= 60 ? 'Good' : passwordStrength >= 40 ? 'Fair' : 'Weak'}
                                </span>
                            </div>
                            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-300 rounded-full ${passwordStrength >= 80 ? 'bg-emerald-500' : passwordStrength >= 60 ? 'bg-cyan-500' : passwordStrength >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.max(5, passwordStrength)}%` }} /> {/* Ensure bar is slightly visible even at 0% */}
                            </div>
                        </div>
                        {passwordValidationError && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{passwordValidationError}</p>}
                    </div>
                )}


                {/* Confirm New Password Input */}
                <div className="space-y-1">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      className="pr-10"
                      error={passwordValidationError && newPassword !== confirmPassword ? " " : undefined}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6" // Added margin-top
                  isLoading={isLoading}
                  loadingText='Updating Password...'
                  disabled={isLoading || !!passwordValidationError || !newPassword || !confirmPassword || passwordStrength < 60}
                  variant="primary"
                >
                  Update Password
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
