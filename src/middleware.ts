import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Ensure the path to your generated types is correct relative to the middleware file
import type { Database } from '@/types/database';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient<Database>({ req, res });

  // Refresh session if expired - important to do before checking session
  console.log('Middleware: Refreshing session...');
  await supabase.auth.refreshSession();

  // Get session AFTER potentially refreshing it
  console.log('Middleware: Getting session after refresh...');
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const currentPath = req.nextUrl.pathname;
  console.log(`Middleware: Path: ${currentPath}, Session Found: ${!!session}`);

  // Define route types
  const isAuthRoute = currentPath.startsWith('/auth');
  const isOnboardingRoute = currentPath.startsWith('/onboarding');
  const isDashboardRoute = currentPath.startsWith('/dashboard');
  const isProtectedRoute = isDashboardRoute || isOnboardingRoute; // Onboarding is also protected
  const isResetPasswordRoute = currentPath === '/auth/reset-password';
  const isVerifyOtpRoute = currentPath === '/auth/verify-otp';
  const isLoginPage = currentPath === '/auth/login';

  // --- Early Exits ---

  // Always allow access to reset password page to handle the link click
  // This needs to happen before session checks might redirect away
  if (isResetPasswordRoute) {
    console.log('Middleware Allowing: Reset password page access granted.');
    return res;
  }

  // --- Logic Flow ---

  // 1. User is logged OUT (no session)
  if (!session) {
    // If trying to access a protected route, redirect to login
    if (isProtectedRoute) {
      console.log('Middleware Redirecting: No session for protected route -> /auth/login');
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    // Allow access to public or auth routes (like login, signup, forgot password)
    console.log('Middleware Allowing: No session, accessing public/auth route.');
    return res;
  }

  // 2. User is logged IN (session exists)
  // Fetch user details
  console.log('Middleware: Session found, attempting supabase.auth.getUser()...');
  const { data: { user } } = await supabase.auth.getUser();

  // Handle case where session exists but user fetch fails (e.g., corrupted/invalid session)
  if (!user) {
    console.error('Middleware Error: Session exists but failed to get user. Attempting sign out and redirecting to login.');
    await supabase.auth.signOut(); // Attempt to clear potentially invalid session
    // Force redirect to login AFTER attempting sign out
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
   console.log(`Middleware: User found (Confirmed: ${user.email_confirmed_at})`);


  // 2a. Email NOT Verified
  if (!user.email_confirmed_at) {
    // Force to verify page, unless already there
    if (!isVerifyOtpRoute) {
      console.log('Middleware Redirecting: Email not verified -> /auth/verify-otp');
      return NextResponse.redirect(new URL('/auth/verify-otp', req.url));
    }
    console.log('Middleware Allowing: Email not verified, staying on /auth/verify-otp.');
    return res; // Allow staying on verify page
  }

  // 2b. Email IS Verified - Check Onboarding Status
  console.log('Middleware: Email confirmed, checking onboarding status...');
   const { data: preferences } = await supabase
     .from('user_preferences')
     .select('onboarding_completed')
     .eq('user_id', user.id)
     .single(); // Error handling for fetch omitted for brevity, add if needed
   const onboardingCompleted = preferences?.onboarding_completed ?? false;
   console.log(`Middleware: Onboarding completed: ${onboardingCompleted}`);


  // 2c. Onboarding NOT Completed
  if (!onboardingCompleted) {
    // Force user to onboarding, unless they are already on an onboarding route
    if (!isOnboardingRoute) {
      console.log('Middleware Redirecting: Onboarding incomplete -> /onboarding/step-1');
      return NextResponse.redirect(new URL('/onboarding/step-1', req.url));
    }
    // Allow staying on onboarding pages if not complete
    console.log('Middleware Allowing: Onboarding incomplete, staying on /onboarding.');
    return res;
  }

  // 2d. Onboarding IS Completed
  // If user is fully set up (verified, onboarded), redirect them
  // away from ONLY ONBOARDING pages to the dashboard.
  // We will NOT redirect away from AUTH pages here anymore - let client-side handle that.
  if (isOnboardingRoute) { // Only check if they are on an onboarding route
    console.log('Middleware Redirecting: Onboarding complete, redirecting away from /onboarding -> /dashboard');
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // --- Final Allow ---
  // If we reach here, the user is logged in, email verified, onboarding complete,
  // and not on an onboarding route they shouldn't be on.
  // Allow access to the requested route (e.g., /dashboard, /auth/login, etc.)
  console.log('Middleware Allowing: All checks passed or handled.');
  return res;
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
};
