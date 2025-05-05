import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient<Database>({ req, res })

  // Refresh session if expired - important to do before checking session
  console.log('Middleware: Refreshing session...')
  await supabase.auth.refreshSession()

  // Get session AFTER potentially refreshing it
  console.log('Middleware: Getting session after refresh...')
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const currentPath = req.nextUrl.pathname
  console.log(`Middleware: Path: ${currentPath}, Session Found: ${!!session}`)

  // Define route types
  const isAuthRoute = currentPath.startsWith('/auth')
  const isOnboardingRoute = currentPath.startsWith('/onboarding')
  const isDashboardRoute = currentPath.startsWith('/dashboard')
  const isProtectedRoute = isDashboardRoute || isOnboardingRoute
  const isResetPasswordRoute = currentPath === '/auth/reset-password'

  // Special case: Always allow access to reset password page
  if (isResetPasswordRoute) {
    console.log('Middleware Allowing: Reset password page access granted.')
    return res
  }

  // --- Logic Flow ---

  // 1. User is logged OUT (no session)
  if (!session) {
    // If trying to access a protected route, redirect to login
    if (isProtectedRoute) {
      console.log('Middleware Redirecting: No session for protected route -> /auth/login')
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
    // Allow access to public or auth routes
    console.log('Middleware Allowing: No session, accessing public/auth route.')
    return res
  }

  // 2. User is logged IN (session exists)
  // Fetch user details (needed for verification/onboarding checks)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('Middleware Error: Session exists but failed to get user. Attempting sign out and redirecting to login.')
    await supabase.auth.signOut() // Attempt to clear potentially invalid session
    // Force redirect to login AFTER attempting sign out
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // 2a. Dashboard Access - Requires Email Confirmation and Onboarding
  if (isDashboardRoute) {
    // Proceed directly with onboarding check IF email is confirmed
    if (user.email_confirmed_at) {
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single()

      const onboardingCompleted = preferences?.onboarding_completed ?? false
      if (!onboardingCompleted) {
        console.log('Middleware Redirecting: Dashboard access requires onboarding -> /onboarding/step-1')
        return NextResponse.redirect(new URL('/onboarding/step-1', req.url))
      }
      // If onboarding IS complete, allow access
      console.log('Middleware Allowing: Access to dashboard granted.')
      return res
    } else {
      // Email not confirmed, handle redirect
      console.log('Middleware Redirecting: Email not confirmed for dashboard -> /auth/verify-otp')
      return NextResponse.redirect(new URL('/auth/verify-otp', req.url))
    }
  }

  // 2b. Email NOT Verified (for non-dashboard routes)
  if (!user.email_confirmed_at) {
    // Force to verify page, unless already there
    if (currentPath !== '/auth/verify-otp') {
      console.log('Middleware Redirecting: Email not verified -> /auth/verify-otp')
      return NextResponse.redirect(new URL('/auth/verify-otp', req.url))
    }
    console.log('Middleware Allowing: Email not verified, staying on /auth/verify-otp.')
    return res
  }

  // 2c. Handle redirects away from auth/onboarding if verified and onboarded
  if (user.email_confirmed_at) {
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .single()

    const onboardingCompleted = preferences?.onboarding_completed ?? false
    if (onboardingCompleted && (isAuthRoute || isOnboardingRoute)) {
      // Check if it's the reset page - allow it
      if (currentPath === '/auth/reset-password') {
        console.log('Middleware Allowing: Access to reset password page.')
        return res
      }
      console.log('Middleware Redirecting: Fully setup user away from auth/onboarding -> /dashboard')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // 2d. Onboarding NOT Completed (for non-dashboard routes)
  if (isOnboardingRoute) {
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .single()

    const onboardingCompleted = preferences?.onboarding_completed ?? false
    if (!onboardingCompleted && !isOnboardingRoute) {
      console.log('Middleware Redirecting: Onboarding incomplete -> /onboarding/step-1')
      return NextResponse.redirect(new URL('/onboarding/step-1', req.url))
    }
  }

  // If all checks pass, allow access
  console.log('Middleware Allowing: All checks pass.')
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.svg (allow logo access)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)',
  ],
} 