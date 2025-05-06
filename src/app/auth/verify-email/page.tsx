'use client'

import { useState, useEffect, FormEvent, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; // Keep if logo is used
import { ArrowLeft, Sun, Moon, Loader2, AlertCircle, MailCheck } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import AuthLayout from '@/components/layouts/AuthLayout'; // Verify this path
import { Button } from '@/components/ui/Button'; // Verify this path
import { Input } from '@/components/ui/Input'; // Verify this path
// OR use a dedicated OTP input component if you have one:
// import { OtpInput } from '@/components/ui/OtpInput';
import { useTheme } from '@/contexts/ThemeContext'; // Assuming this context exists
import { Alert, AlertDescription } from "@/components/ui/alert"; // Verify this path
// *** VERIFY THIS IMPORT PATH FOR CARD COMPONENTS ***
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Define the component
export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // General loading state
  const [isVerifying, setIsVerifying] = useState(false); // Specific state for verification action
  const [isResending, setIsResending] = useState(false); // Specific state for resend action
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(60); // Cooldown timer in seconds
  const [canResend, setCanResend] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const supabase = createClientComponentClient<Database>();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get email from localStorage on mount and start cooldown timer
  useEffect(() => {
    const storedEmail = localStorage.getItem('verificationEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setError('Verification email not found. Please sign up or log in again.');
      // Optional: Redirect to login after a delay if email is missing
      // setTimeout(() => router.push('/auth/login'), 3000);
    }

    // Start cooldown timer
    setCanResend(false);
    setResendCooldown(60); // Reset to 60 seconds
    timerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup interval timer on component unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle OTP verification
  const handleVerifySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    setIsVerifying(true);
    setLoading(true); // Use general loading state as well
    setError(null);
    setSuccessMessage(null);

    try {
      console.log(`Verifying OTP ${otp} for email ${email}`);
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email' // Use 'email' for initial signup verification OTP
      });

      if (verifyError) {
        // Handle specific errors from Supabase
        if (verifyError.message.includes('Invalid OTP') || verifyError.message.includes('invalid')) {
             throw new Error('Invalid verification code. Please try again.');
           } else if (verifyError.message.includes('expired')) {
             throw new Error('This code has expired. Please request a new one.');
           } else if (verifyError.message.includes('rate limit')) {
             throw new Error('Too many attempts. Please wait a moment before trying again.');
           } else {
             throw new Error(verifyError.message || 'Verification failed.');
           }
      }

      // Success!
      console.log('OTP Verification Successful');
      localStorage.removeItem('verificationEmail'); // Clean up stored email
      setSuccessMessage('Email verified successfully! Redirecting...');

      // Redirect to onboarding after a short delay
      setTimeout(() => {
        router.push('/onboarding'); // Or '/dashboard' if onboarding is somehow skipped/done
      }, 2000);

    } catch (err) {
       const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
       setError(message.includes('Failed to fetch') ? 'Network error. Please try again.' : message);
       console.error('Verification error:', err);
    } finally {
      setIsVerifying(false);
      setLoading(false);
    }
  };

  // Handle Resend OTP Code
  const handleResend = async () => {
     if (!email || !canResend) return;

     setIsResending(true);
     setLoading(true);
     setError(null);
     setSuccessMessage(null);
     setCanResend(false); // Disable button immediately

     try {
        console.log(`Resending OTP for email ${email}`);
        const { error: resendError } = await supabase.auth.resend({
           type: 'signup', // Use 'signup' type for resending the initial verification OTP
           email: email
         });

         if (resendError) {
            if (resendError.message.includes('rate limit')) {
               throw new Error('Too many attempts. Please wait a minute before trying again.');
             } else {
               throw new Error(resendError.message || 'Failed to resend code.');
             }
         }

         setSuccessMessage('New verification code sent! Please check your email.');
         // Restart cooldown timer
         setResendCooldown(60);
         timerRef.current = setInterval(() => {
           setResendCooldown((prev) => {
             if (prev <= 1) {
               clearInterval(timerRef.current!);
               setCanResend(true);
               return 0;
             }
             return prev - 1;
           });
         }, 1000);

     } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(message.includes('Failed to fetch') ? 'Network error. Please try again.' : message);
        console.error('Resend error:', err);
        setCanResend(true); // Re-enable button on error
     } finally {
        setIsResending(false);
        setLoading(false);
     }
  };


  return (
    // Use AuthLayout or a similar centered layout component
    <AuthLayout title="Verify Email">
        {/* Use Card component for consistent styling */}
        <Card className="w-full max-w-sm relative">
             {/* Loading Overlay */}
            {(loading) && ( // Show overlay if verifying or resending
              <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            )}
            <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                    <MailCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle>Check Your Email</CardTitle>
                <CardDescription>
                   {email ? `Enter the 6-digit code sent to ${email}` : 'Loading email...'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Display Success Message */}
                {successMessage && (
                    <Alert variant="default" className="bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-500/30">
                        {/* Added key */}
                        <AlertDescription key="success-desc" className="text-emerald-700 dark:text-emerald-300">{successMessage}</AlertDescription>
                    </Alert>
                )}
                {/* Display Error Message */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" key="error-icon"/>
                        {/* Added key, convert null to undefined */}
                        <AlertDescription key="error-desc">{error || undefined}</AlertDescription>
                    </Alert>
                )}

                {/* Only show form if email is loaded and no success message */}
                {email && !successMessage && (
                    <form onSubmit={handleVerifySubmit} className="space-y-6">
                        <div>
                            {/* Using standard input, style for OTP */}
                            {/* Or replace with your dedicated OtpInput component */}
                            <Input
                                id="otp"
                                type="text" // Use text to allow easier input, validation handles digits
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} // Allow only digits, max 6
                                placeholder="------"
                                required
                                maxLength={6}
                                minLength={6} // Add minLength for basic validation
                                disabled={loading}
                                className="text-center text-2xl tracking-[0.5em] font-mono" // Styling for OTP look
                                // Pass error state correctly - only trigger style if error exists
                                error={error ? " " : undefined} // Pass dummy string if error exists to trigger style, actual message is above
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={isVerifying} // Show loading only for verify action
                            disabled={loading || otp.length !== 6} // Disable if loading or OTP length wrong
                        >
                            Verify Code
                        </Button>
                    </form>
                )}

                {/* Resend Button Area */}
                <div className="text-center text-sm">
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={!canResend || loading || !email}
                        className={`font-medium transition-colors ${
                            canResend && email
                            ? 'text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300'
                            : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {isResending ? <Loader2 className="inline h-4 w-4 mr-1 animate-spin" /> : null}
                        {canResend ? 'Resend Code' : `Resend code in ${resendCooldown}s`}
                    </button>
                </div>

                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                    <Link href="/auth/login" className="hover:underline">Back to Login</Link>
                </div>
            </CardContent>
        </Card>
    </AuthLayout>
  );
}
