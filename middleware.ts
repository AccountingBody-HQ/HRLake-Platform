import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const ADMIN_USER_ID = 'user_3BEB6ktIKuXbZEqamZxWJ55eLVv'

export default clerkMiddleware((auth, request) => {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
    if (userId !== ADMIN_USER_ID) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  return NextResponse.next()
})

export const config = {
  matcher: ['/(admin)(.*)'],
}
