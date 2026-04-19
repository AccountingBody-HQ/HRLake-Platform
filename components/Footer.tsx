'use client'

import Link from 'next/link'
import { Globe } from 'lucide-react'
import { usePathname } from 'next/navigation'
import EmailCapture from '@/components/EmailCapture'
import CookieSettingsButton from '@/components/CookieSettingsButton'

const footerLinks = {
  'Country Intelligence': [
    { label: 'All Countries',       href: '/countries/' },
    { label: 'United Kingdom',      href: '/countries/gb/' },
    { label: 'United States',       href: '/countries/us/' },
    { label: 'Germany',             href: '/countries/de/' },
    { label: 'France',              href: '/countries/fr/' },
    { label: 'Compare Countries',   href: '/compare/' },
  ],
  'Payroll & EOR': [
    { label: 'EOR Intelligence',    href: '/eor/' },
    { label: 'Payroll Tools',       href: '/payroll-tools/' },
    { label: 'Global Calculator',   href: '/payroll-tools/global-calculator/' },
    { label: 'Currency Converter',  href: '/payroll-tools/currency-converter/' },
    { label: 'HR Compliance',       href: '/hr-compliance/' },
  ],
  'Resources': [
    { label: 'Insights',            href: '/insights/' },
    { label: 'AI Assistant',        href: '/ai-assistant/' },
    { label: 'Pricing',             href: '/pricing/' },
  ],
  'Company': [
    { label: 'About',               href: '/about/' },
    { label: 'Contact',             href: '/contact/' },
    { label: 'Privacy Policy',      href: '/privacy-policy/' },
    { label: 'Terms',               href: '/terms/' },
    { label: 'Disclaimer',          href: '/disclaimer/' },
    { label: 'Cookie Policy',       href: '/cookie-policy/' },
  ],
}

export default function Footer({ countryCount = 23 }: { countryCount?: number }) {
  const currentYear = new Date().getFullYear()
  const pathname = usePathname()
  const isHomepage = pathname === '/'

  return (
    <footer className="bg-slate-950 border-t border-slate-800 mt-auto">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* TOP SECTION */}
        <div className="py-16 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">

          {/* BRAND */}
          <div className="col-span-2 lg:col-span-2 pr-8">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <Globe className="h-5 w-5 text-blue-400 shrink-0" />
              <span className="text-base font-bold text-white tracking-tight">HRLake</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 mb-6">
              Where HR, EOR and payroll knowledge dives deep.
              Employment data, compliance guides, and workforce
              cost tools for {countryCount} countries — and growing.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-500">Data updated monthly from official sources</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <a href="/contact/" 
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 border border-slate-700 hover:border-blue-600 flex items-center justify-center transition-all group"
                aria-label="HRLake on LinkedIn"
              >
                <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="/contact/" 
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 border border-slate-700 hover:border-blue-600 flex items-center justify-center transition-all group"
                aria-label="HRLake on Facebook"
              >
                <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="/contact/" 
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 flex items-center justify-center transition-all group"
                aria-label="HRLake on X"
              >
                <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* LINK COLUMNS */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading} className="col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-4">
                {heading}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* EMAIL CAPTURE STRIP */}
        {!isHomepage && (
          <div className="border-t border-slate-800 py-12">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">Stay Informed</p>
                <h2 className="font-serif text-3xl font-bold text-white leading-tight tracking-tight mb-4">
                  Monthly HR and<br />employment updates.<br />
                  <span className="text-slate-500">Free. No noise.</span>
                </h2>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Once a month, direct to your inbox — everything that matters across HR compliance, payroll, and EOR.
                </p>
                <ul className="space-y-3">
                  {[
                    "Monthly employment rate changes by country",
                    "New country data as it is published",
                    "HR compliance alerts and law changes",
                    "EOR market intelligence and cost updates",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 mt-2" />
                      <span className="text-slate-400 text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <EmailCapture
                  source="footer"
                  variant="dark"
                  title="Subscribe to updates"
                  subtitle="Trusted by HR and payroll professionals worldwide."
                />
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM SECTION */}
        <div className="border-t border-slate-800 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <p className="text-xs text-slate-600">
              © {currentYear} HRLake.com — All rights reserved.
            </p>
            <CookieSettingsButton />
          </div>
          <p className="text-xs text-slate-600 text-left sm:text-right max-w-lg leading-relaxed">
            Data is provided for reference purposes only and does not constitute
            professional legal, tax, or payroll advice. Always verify with a
            qualified local adviser.{" "}
            <Link href="/disclaimer/"
              className="text-slate-500 underline underline-offset-2 hover:text-slate-300 transition-colors">
              Read our disclaimer.
            </Link>
          </p>
        </div>

      </div>
    </footer>
  )
}
