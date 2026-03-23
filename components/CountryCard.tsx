// ============================================
// GLOBALPAYROLLEXPERT — COUNTRY CARD
// Reusable card for the countries index grid
// Used in: app/countries/page.tsx
// ============================================

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

// Coverage level comes from public.countries.coverage_level
// Values: full | partial | basic | none
type CoverageLevel = 'full' | 'partial' | 'basic' | 'none'

interface CountryCardProps {
  iso2: string
  name: string
  flag_emoji: string | null
  currency: string | null
  region: string | null
  coverage_level: CoverageLevel | null
  payroll_complexity_score: number | null
}

// Badge colour and label per coverage level
const COVERAGE_CONFIG: Record<CoverageLevel, { label: string; className: string }> = {
  full:    { label: 'Verified',  className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  partial: { label: 'Partial',   className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  basic:   { label: 'Basic',     className: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' },
  none:    { label: 'Coming Soon', className: 'bg-slate-100 text-slate-400 ring-1 ring-slate-200' },
}

const DEFAULT_COVERAGE = { label: 'Coming Soon', className: 'bg-slate-100 text-slate-400 ring-1 ring-slate-200' }

export default function CountryCard({
  iso2,
  name,
  flag_emoji,
  currency,
  region,
  coverage_level,
  payroll_complexity_score,
}: CountryCardProps) {
  const code = iso2.toLowerCase()
  const coverage = coverage_level ? COVERAGE_CONFIG[coverage_level] ?? DEFAULT_COVERAGE : DEFAULT_COVERAGE
  const isAvailable = coverage_level && coverage_level !== 'none'

  return (
    <Link
      href={`/countries/${code}/`}
      className="group relative bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-xl p-5 transition-all duration-200 flex flex-col gap-3"
    >
      {/* Top row: flag + name */}
      <div className="flex items-center gap-3">
        <span className="text-2xl leading-none" role="img" aria-label={name}>
          {flag_emoji ?? '🌐'}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate text-sm leading-tight">
            {name}
          </p>
          {region && (
            <p className="text-xs text-slate-400 mt-0.5 truncate">{region}</p>
          )}
        </div>
      </div>

      {/* Middle row: currency + coverage badge */}
      <div className="flex items-center justify-between gap-2">
        {currency ? (
          <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded px-2 py-0.5">
            {currency}
          </span>
        ) : (
          <span />
        )}
        <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${coverage.className}`}>
          {coverage.label}
        </span>
      </div>

      {/* Complexity bar — only shown when data exists */}
      {payroll_complexity_score !== null && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 font-medium">Payroll complexity</span>
            <span className="text-xs font-bold text-slate-600">{payroll_complexity_score}/10</span>
          </div>
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all"
              style={{ width: `${(payroll_complexity_score / 10) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Arrow — appears on hover */}
      <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight size={14} className="text-blue-500" />
      </div>
    </Link>
  )
}
