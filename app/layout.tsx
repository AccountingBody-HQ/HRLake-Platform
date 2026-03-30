// ============================================
// GLOBALPAYROLLEXPERT — ROOT LAYOUT
// GTM, Clerk, Fonts, Metadata, Nav, Footer
// ============================================

import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
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
    process.env.NEXT_PUBLIC_SITE_URL || 'https://globalpayrollexpert.com'
  ),
  title: {
    default: 'GlobalPayrollExpert — World-Class Global Payroll Intelligence',
    template: '%s | GlobalPayrollExpert',
  },
  description:
    'World-class global payroll and HR intelligence. Employer costs, tax brackets, employment law, and compliance data for every country.',
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
  authors: [{ name: 'GlobalPayrollExpert' }],
  creator: 'GlobalPayrollExpert',
  publisher: 'GlobalPayrollExpert',
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
    url: 'https://globalpayrollexpert.com',
    siteName: 'GlobalPayrollExpert',
    title: 'GlobalPayrollExpert — World-Class Global Payroll Intelligence',
    description:
      'Employer costs, tax brackets, employment law, and compliance data for every country.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'GlobalPayrollExpert',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GlobalPayrollExpert — World-Class Global Payroll Intelligence',
    description:
      'Employer costs, tax brackets, employment law, and compliance data for every country.',
    images: ['/og-default.png'],
  },
  verification: {
    google: "Ke1xcsC2rYKaBT_PbROsCHNgOJ8s3IjRNyzQuI6JBt4",
  },
  alternates: {
    canonical: 'https://globalpayrollexpert.com',
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
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
        <head>
          <GoogleTagManagerHead />
        </head>
        <body className="min-h-screen bg-white font-sans antialiased">
          <GoogleTagManagerBody />
          <Navigation />
          <div className="flex flex-col flex-1">{children}</div>
          <Footer />
          <Analytics />
          <SpeedInsights />
          <CookieConsent />
        </body>
      </html>
    </ClerkProvider>
  )
}