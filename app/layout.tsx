// ============================================
// HRLAKE — ROOT LAYOUT
// GTM, Clerk, Fonts, Metadata, Nav, Footer
// ============================================

import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { createClient } from '@supabase/supabase-js'
import './globals.css'
import CookieConsent from '@/components/CookieConsent'

// --- FONT ---
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '600', '700', '800', '900'],
})

// --- DEFAULT METADATA ---
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://hrlake.com'
  ),
  title: {
    default: 'HRLake — The Deep Source for Global HR Intelligence',
    template: '%s | HRLake',
  },
  description:
    'The deep source for global HR intelligence. Employer costs, tax brackets, employment law, and payroll compliance data — updated from official government sources.',
  keywords: [
    'global payroll',
    'employer of record',
    'EOR',
    'payroll calculator',
    'employment law',
    'HR compliance',
    'international payroll',
    'employer costs',
  ],
  authors: [{ name: 'HRLake' }],
  creator: 'HRLake',
  publisher: 'HRLake',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://hrlake.com',
    siteName: 'HRLake',
    title: 'HRLake — The Deep Source for Global HR Intelligence',
    description:
      'Employer costs, tax brackets, employment law, and compliance data for every country.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'HRLake',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HRLake — The Deep Source for Global HR Intelligence',
    description:
      'Employer costs, tax brackets, employment law, and compliance data for every country.',
    images: ['/og-default.png'],
  },
  verification: {
    google: "Ke1xcsC2rYKaBT_PbROsCHNgOJ8s3IjRNyzQuI6JBt4",
  },
  alternates: {
    canonical: 'https://hrlake.com',
  },
}

// --- GTM SNIPPET HELPERS ---
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

function GoogleTagManagerHead() {
  if (!GTM_ID) return null
  return (
    <>
      {/* Google Consent Mode v2 — must run BEFORE GTM loads */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});
`,
        }}
      />
      {/* GTM loader */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
        }}
      />
    </>
  )
}

function GoogleTagManagerBody() {
  if (!GTM_ID) return null
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}

// --- ROOT LAYOUT ---
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch active country count once — passed to Nav and Footer
  let countryCount = 23
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { count } = await supabase
      .from('countries')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    if (count !== null) countryCount = count
  } catch {
    // fallback to default
  }

  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
        <head>
          <GoogleTagManagerHead />
        </head>
        <body className="bg-white font-sans antialiased">
          <GoogleTagManagerBody />
          <Navigation countryCount={countryCount} />
          {children}
          <Footer countryCount={countryCount} />
          <Analytics />
          <SpeedInsights />
          <CookieConsent />
        </body>
      </html>
    </ClerkProvider>
  )
}