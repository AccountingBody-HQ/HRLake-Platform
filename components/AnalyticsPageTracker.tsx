// ============================================
// HRLAKE — SPA PAGE TRACKER
// Fires GA4 pageview on every App Router navigation
// ============================================
'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function AnalyticsPageTracker() {
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip the very first render — GTM already fires on hard load
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Push virtual pageview to dataLayer on every client-side navigation
    if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: 'virtual_pageview',
        page_path: pathname,
        page_location: window.location.href,
        page_title: document.title,
      })
    }
  }, [pathname])

  return null
}
