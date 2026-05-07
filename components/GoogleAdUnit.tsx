'use client'

import { useEffect, useRef } from 'react'

interface GoogleAdUnitProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'vertical'
}

export default function GoogleAdUnit({ slot, format = 'auto' }: GoogleAdUnitProps) {
  const adRef = useRef<HTMLModElement>(null)
  const initialised = useRef(false)

  useEffect(() => {
    // Only render if marketing consent has been granted
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) return

    try {
      const parsed = JSON.parse(consent)
      if (!parsed?.marketing) return
    } catch {
      return
    }

    if (initialised.current) return
    initialised.current = true

    try {
      // @ts-expect-error adsbygoogle is injected by the AdSense script
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (e) {
      console.error('AdSense error:', e)
    }
  }, [])

  return (
    <div className="w-full my-8 flex justify-center">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-9708322474624496"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
