'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Globe } from 'lucide-react'
import SearchBar from '@/components/SearchBar'

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
    <header className="sticky top-0 z-50 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-6">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Globe className="h-5 w-5 text-blue-500" />
            <span className="text-base font-bold text-white tracking-tight hidden sm:block">
              GlobalPayrollExpert
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm font-medium text-slate-400 rounded-lg hover:text-white hover:bg-white/5 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* SEARCH — desktop */}
          <div className="hidden md:block flex-1 lg:flex-none lg:w-56 xl:w-64">
            <SearchBar variant="nav" />
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto lg:ml-0">
            <Link href="/sign-in"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link href="/pricing"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors"
            >
              Go Pro
            </Link>
          </div>

          {/* MOBILE BUTTON */}
          <button
            className="md:hidden ml-auto p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-950 border-t border-slate-800/80">
          <div className="px-4 py-3">
            <SearchBar variant="nav" placeholder="Search countries…" />
          </div>
          <nav className="px-2 pb-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="px-4 py-3 border-t border-slate-800/80 flex gap-2">
            <Link href="/sign-in"
              className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-all"
              onClick={() => setMobileOpen(false)}
            >
              Sign in
            </Link>
            <Link href="/pricing"
              className="flex-1 text-center px-4 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all"
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
