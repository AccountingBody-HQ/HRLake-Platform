import type { Metadata } from 'next'
import { getBreadcrumbStructuredData, jsonLd as toJsonLd } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: 'Search — Countries, Calculators and Payroll Guides',
  description: 'Search HRLake for any country, payroll guide, employment law topic, or compliance requirement. Coverage across 195 countries.',
  alternates: {
    canonical: 'https://hrlake.com/search/',
  },
  robots: {
    index: false,
  },
}

const breadcrumb = getBreadcrumbStructuredData([
  { name: 'Home', href: 'https://hrlake.com' },
  { name: 'Search', href: 'https://hrlake.com/search/' },
])

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumb) }} />
      {children}
    </>
  )
}
