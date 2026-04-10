import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? 'Wolega@888'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, request) => {
  const path = request.nextUrl.pathname

  // Admin pages — redirect to login if no valid token
  if (path.startsWith('/admin') && !path.startsWith('/admin-login')) {
    const token = request.cookies.get('admin_token')?.value
    if (token !== ADMIN_SECRET) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
  }

  // Admin API routes — return 401 if no valid token
  // excludes /api/admin-auth and /api/admin-logout (must stay public)
  if (
    path.startsWith('/api/admin-') &&
    !path.startsWith('/api/admin-auth') &&
    !path.startsWith('/api/admin-logout')
  ) {
    const token = request.cookies.get('admin_token')?.value
    if (token !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

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
