import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Use relative path for middleware import
import type { Database } from '@/types/database';

export async function middleware(req: NextRequest) {
  // Create response object to potentially modify headers/cookies
  const res = NextResponse.next();
  // Create a Supabase client specialized for middleware
  const supabase = createMiddlewareClient<Database>({ req, res });

  // --- Refresh session ---
  // Ensures the session cookie is refreshed/validated before checks
  console.log('Middleware: Refreshing session...');
  await supabase.auth.refreshSession();

  // --- Get current session ---
  console.log('Middleware: Getting session after refresh...');
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // --- Get request path ---
  const currentPath = req.nextUrl.pathname;
  console.log(`Middleware: Path: ${currentPath}, Session Found: ${!!session}`);

  // --- Define Route Categories ---
  const isAuthRoute = currentPath.startsWith('/auth');
  const isOnboardingRoute = currentPath.startsWith('/onboarding');
  const isDashboardRoute = currentPath.startsWith('/dashboard');
  // Define which routes require authentication at a minimum
  const isProtectedRoute = isDashboardRoute || isOnboardingRoute;
  // Define specific auth routes for easier checking
  const isResetPasswordRoute = currentPath === '/auth/reset-password';
  const isVerifyOtpRoute = currentPath === '/auth/verify-otp';

  // --- Early Exit: Always allow access to reset password page ---
  // This handles the initial landing from the email link
  if (isResetPasswordRoute) {
    console.log('Middleware Allowing: Reset password page access granted.');
    return res;
  }

  // --- Main Logic Flow ---

  // 1. User is Logged OUT (No Session)
  if (!session) {
    // If trying to access a protected route (dashboard/onboarding), redirect to login
    if (isProtectedRoute) {
      console.log('Middleware Redirecting: No session for protected route -> /auth/login');
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    // Allow access to public pages or other auth routes (like login, signup, forgot password)
    console.log('Middleware Allowing: No session, accessing public/auth route.');
    return res;
  }

  // 2. User is Logged IN (Session Exists)
  console.log('Middleware: Session found, attempting supabase.auth.getUser()...');
  const { data: { user } } = await supabase.auth.getUser();

  // Handle edge case where session exists but user fetch fails
  if (!user) {
    console.error('Middleware Error: Session exists but failed to get user. Attempting sign out and redirecting to login.');
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
  console.log(`Middleware: User found (Email Confirmed: ${!!user.email_confirmed_at})`);


  // 2a. Email NOT Verified
  if (!user.email_confirmed_at) {
    // Force user to the OTP verification page, unless they are already there
    if (!isVerifyOtpRoute) {
      console.log('Middleware Redirecting: Email not verified -> /auth/verify-otp');
      return NextResponse.redirect(new URL('/auth/verify-otp', req.url));
    }
    // Allow user to stay on the verify page
    console.log('Middleware Allowing: Email not verified, staying on /auth/verify-otp.');
    return res;
  }

  // --- At this point, user is Logged In AND Email is Verified ---

  // 2b. Check Onboarding Status
  console.log('Middleware: Email confirmed, checking onboarding status...');
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .single();
  // Default to false if preferences record doesn't exist yet (shouldn't happen with trigger, but safe)
  const onboardingCompleted = preferences?.onboarding_completed ?? false;
  console.log(`Middleware: Onboarding completed: ${onboardingCompleted}`);


  // 2c. Onboarding NOT Completed
  if (!onboardingCompleted) {
    // User's email is verified, but onboarding isn't done.
    // Force them to the onboarding flow, unless they are already there.
    if (!isOnboardingRoute) {
      console.log('Middleware Redirecting: Onboarding incomplete -> /onboarding/step-1');
      return NextResponse.redirect(new URL('/onboarding/step-1', req.url));
    }
    // Allow staying on onboarding pages if not complete
    console.log('Middleware Allowing: Onboarding incomplete, staying on /onboarding.');
    return res;
  }

  // --- At this point, user is Logged In, Email Verified, AND Onboarding is Complete ---

  // 2d. Redirect away from Auth/Onboarding pages if fully set up
  // If the user is fully set up and tries to access any auth route (EXCEPT reset password)
  // OR any onboarding route, redirect them to the dashboard.
  if (isAuthRoute || isOnboardingRoute) {
      console.log('Middleware Redirecting: Fully setup user away from auth/onboarding -> /dashboard');
      return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // --- Final Allow ---
  // If none of the above conditions triggered a redirect, the user is likely
  // logged in, verified, onboarded, and accessing a valid page (like /dashboard).
  console.log('Middleware Allowing: All checks passed, allowing access to requested route.');
  return res;
}

// Configuration for the middleware matcher (adjust if needed)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.svg (allow logo access)
     * - manifest.json (allow PWA manifest)
     * - sw.js (allow service worker)
     * - workbox-*.js (allow workbox files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.svg|manifest.json|sw.js|workbox-.*\\.js).*)',
  ],
};
