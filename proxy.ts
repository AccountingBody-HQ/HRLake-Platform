import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const ADMIN_SECRET = 'gpe-admin-2025-secure'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, request) => {
  const path = request.nextUrl.pathname

  // Protect /admin routes with password cookie
    const token = request.cookies.get('admin_token')?.value
    if (token !== ADMIN_SECRET) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
  }

  // Protect /dashboard routes with Clerk auth
  if (isProtectedRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
