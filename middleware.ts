import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/countries(.*)',
  '/eor(.*)',
  '/hr-compliance(.*)',
  '/payroll-tools(.*)',
  '/compare(.*)',
  '/insights(.*)',
  '/search(.*)',
  '/pricing(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/privacy-policy(.*)',
  '/terms(.*)',
  '/disclaimer(.*)',
  '/cookie-policy(.*)',
  '/unsubscribe(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/admin(.*)',
  '/admin-login(.*)',
  '/api(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
