import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Get the current path
  const path = request.nextUrl.pathname

  // Handle auth routes
  if (path.startsWith('/auth')) {
    if (session) {
      // Check if email is verified
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email_confirmed_at) {
        return NextResponse.redirect(new URL('/auth/verify-otp', request.url))
      }

      // Check if onboarding is completed
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single()

      if (!preferences?.onboarding_completed) {
        return NextResponse.redirect(new URL('/onboarding/username', request.url))
      }

      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return res
  }

  // Handle dashboard routes
  if (path.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Check if email is verified
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email_confirmed_at) {
      return NextResponse.redirect(new URL('/auth/verify-otp', request.url))
    }

    // Check if onboarding is completed
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .single()

    if (!preferences?.onboarding_completed) {
      return NextResponse.redirect(new URL('/onboarding/username', request.url))
    }

    return res
  }

  // Handle onboarding routes
  if (path.startsWith('/onboarding')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Check if email is verified
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email_confirmed_at) {
      return NextResponse.redirect(new URL('/auth/verify-otp', request.url))
    }

    // Check if onboarding is completed
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .single()

    // Allow access to onboarding pages if not completed
    if (!preferences?.onboarding_completed) {
      return res
    }

    // If onboarding is completed and not on the final step, redirect to dashboard
    if (preferences.onboarding_completed && !path.endsWith('/pillars')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return res
  }

  return res
}

export const config = {
  matcher: [
    '/auth/:path*',
    '/dashboard/:path*',
    '/onboarding/:path*'
  ]
} 