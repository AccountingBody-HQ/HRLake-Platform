// ============================================
// GLOBALPAYROLLEXPERT — NAVIGATION COMPONENT
// ============================================

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Countries', href: '/countries/' },
  { label: 'EOR', href: '/eor/' },
  { label: 'HR Compliance', href: '/hr-compliance/' },
  { label: 'Payroll Tools', href: '/payroll-tools/' },
  { label: 'Compare', href: '/compare/' },
  { label: 'Insights', href: '/insights/' },
]

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3 group">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#1e40af"/>
                    <stop offset="100%" stopColor="#0f172a"/>
                  </linearGradient>
                </defs>
                <circle cx="15" cy="15" r="14" fill="url(#g1)"/>
                <circle cx="15" cy="15" r="14" stroke="#3b82f6" strokeWidth="0.75" fill="none"/>
                <ellipse cx="15" cy="15" rx="14" ry="5.2" stroke="#60a5fa" strokeWidth="0.8" fill="none" strokeOpacity="0.6"/>
                <ellipse cx="15" cy="15" rx="5.2" ry="14" stroke="#60a5fa" strokeWidth="0.8" fill="none" strokeOpacity="0.6"/>
                <ellipse cx="15" cy="15" rx="10.5" ry="14" stroke="#3b82f6" strokeWidth="0.6" fill="none" strokeOpacity="0.35"/>
                <ellipse cx="15" cy="9.2" rx="10" ry="3.2" stroke="#93c5fd" strokeWidth="0.6" fill="none" strokeOpacity="0.4"/>
                <ellipse cx="15" cy="20.8" rx="10" ry="3.2" stroke="#93c5fd" strokeWidth="0.6" fill="none" strokeOpacity="0.4"/>
                <circle cx="11" cy="11" r="2.5" fill="white" fillOpacity="0.07"/>
              </svg>
              <span className="text-base font-bold text-slate-900 tracking-tight group-hover:text-blue-700 transition-colors">
                Global Payroll Expert
              </span>
            </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-slate-600 rounded-md hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* DESKTOP CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Go Pro
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pb-4 pt-2">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-slate-600 rounded-md hover:text-slate-900 hover:bg-slate-100 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4">
            <Link
              href="/sign-in"
              className="px-3 py-2 text-sm font-medium text-slate-600 rounded-md hover:text-slate-900 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Go Pro
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}