import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type CookieToSet = {
  name: string
  value: string
  options: CookieOptions
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This will refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if user is accessing admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to debug page and setup endpoints without admin check
    if (request.nextUrl.pathname === '/admin/debug' ||
        request.nextUrl.pathname.startsWith('/api/admin/check-status') ||
        request.nextUrl.pathname.startsWith('/api/admin/setup')) {
      return supabaseResponse
    }

    if (!user) {
      // Redirect to login if not authenticated
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // For now, allow edison@agriprohub.com to access admin routes
    // This is temporary until the database is properly set up
    if (user.email === 'edison@agriprohub.com') {
      return supabaseResponse
    }

    // For other users, check if they are admin
    const isAdmin = await checkIfUserIsAdmin(user.email!)
    if (!isAdmin) {
      // Redirect to unauthorized page
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return NextResponse.redirect(url)
    }
  }

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabaseResponse creation above.

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Only run middleware on routes that need auth:
     * - /admin (protected routes)
     * - /connect (profile, dashboard, onboarding)
     * - /feed (social feed)
     * - /messages
     * - /notifications
     * - /greenmarket/vendor-dashboard
     * - /api (API routes that may need session refresh)
     *
     * Explicitly excluded (no middleware needed):
     * - _next/static, _next/image, favicon, images
     * - Public marketing pages (/, /about, /knowledgehub, /greenmarket marketplace, etc.)
     */
    '/admin/:path*',
    '/connect/:path*',
    '/feed/:path*',
    '/messages/:path*',
    '/notifications/:path*',
    '/greenmarket/vendor-dashboard/:path*',
    '/greenmarket/become-vendor/:path*',
    '/api/:path*',
  ],
}

async function checkIfUserIsAdmin(email: string): Promise<boolean> {
  try {
    // Use createClient from supabase-js directly for middleware
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error) {
      // If table doesn't exist or no admin user found, return false
      console.log('Admin check failed:', error.message)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error checking admin status in middleware:', error)
    return false
  }
}