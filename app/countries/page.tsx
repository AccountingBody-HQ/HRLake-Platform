// ============================================
// GLOBALPAYROLLEXPERT — ALL COUNTRIES PAGE
// Route: /countries/
// Server Component — fetches data from Supabase
// Passes data to CountriesClient for interactivity
// ============================================

import type { Metadata } from 'next'
import Link from 'next/link'
import { Globe, ChevronRight } from 'lucide-react'
import { getAllCountries, getCountryCount } from '@/lib/supabase-queries'
import CountriesClient from '@/components/countries/CountriesClient'

export const metadata: Metadata = {
  title: 'All Countries — Global Payroll Data | GlobalPayrollExpert',
  description:
    'Payroll data, tax rates, social security, and employment law for every country in the world. Browse 195 jurisdictions.',
  alternates: {
    canonical: 'https://globalpayrollexpert.com/countries/',
  },
}

// Revalidate this page every 24 hours
// Country data does not change minute to minute
export const revalidate = 86400

export default async function CountriesPage() {
  // Both queries run on the server — no loading state needed
  const [countries, count] = await Promise.all([
    getAllCountries(),
    getCountryCount(),
  ])

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ── Page header ── */}
      <section className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-slate-400">All Countries</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                  <Globe size={20} />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                  All Countries
                </h1>
                {/* Count badge */}
                <span className="bg-blue-600/20 text-blue-300 border border-blue-500/30 text-sm font-bold px-3 py-1 rounded-full">
                  {count > 0 ? count : countries.length}
                </span>
              </div>
              <p className="text-slate-400 text-base max-w-2xl leading-relaxed">
                Payroll data, tax rates, social security, and employment law — every country,
                one authoritative source. Updated monthly from official government sources.
              </p>
            </div>

            {/* Quick links */}
            <div className="flex gap-3 shrink-0">
              <Link
                href="/payroll-tools/global-calculator/"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                Global Calculator
              </Link>
              <Link
                href="/compare/"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold px-4 py-2.5 rounded-xl border border-white/10 transition-colors"
              >
                Compare Countries
              </Link>
            </div>
          </div>

          {/* Coverage legend */}
          <div className="flex flex-wrap items-center gap-4 mt-8 pt-8 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Coverage</span>
            {[
              { label: 'Verified',     className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
              { label: 'Partial',      className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
              { label: 'Basic',        className: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' },
              { label: 'Coming Soon',  className: 'bg-slate-100 text-slate-400 ring-1 ring-slate-200' },
            ].map(b => (
              <span key={b.label} className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${b.className}`}>
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive section ── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {countries.length === 0 ? (
          // Shown when Supabase has no countries yet — database is still being populated
          <div className="text-center py-32">
            <p className="text-5xl mb-4">🌍</p>
            <h2 className="text-xl font-bold text-slate-700 mb-2">Country data is being loaded</h2>
            <p className="text-slate-500 text-sm">
              The database is being populated. Check back shortly.
            </p>
          </div>
        ) : (
          <CountriesClient countries={countries} />
        )}
      </section>

    </main>
  )
}
