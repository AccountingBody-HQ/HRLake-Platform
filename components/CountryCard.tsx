import Link from 'next/link'
import { getFlag } from '@/lib/flag'
import { ChevronRight, Calculator, BookOpen, Scale } from 'lucide-react'

type CoverageLevel = 'full' | 'partial' | 'basic' | 'none'

interface CountryCardProps {
  iso2: string
  name: string
  flag_emoji: string | null
  currency: string | null
  region: string | null
  hrlake_coverage_level: CoverageLevel | null
  payroll_complexity_score?: number | null
  topTaxRate?: number | null
  employerRate?: number | null
}

const COVERAGE_CONFIG: Record<CoverageLevel, { label: string; className: string }> = {
  full:    { label: 'Verified',    className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  partial: { label: 'Partial',     className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  basic:   { label: 'Basic',       className: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' },
  none:    { label: 'Coming Soon', className: 'bg-slate-100 text-slate-400 ring-1 ring-slate-200' },
}
const DEFAULT_COVERAGE = { label: 'Coming Soon', className: 'bg-slate-100 text-slate-400 ring-1 ring-slate-200' }

export default function CountryCard({
  iso2, name, flag_emoji, currency, region, hrlake_coverage_level,
  topTaxRate, employerRate,
}: CountryCardProps) {
  const code = iso2.toLowerCase()
  const coverage = hrlake_coverage_level
    ? COVERAGE_CONFIG[hrlake_coverage_level] ?? DEFAULT_COVERAGE
    : DEFAULT_COVERAGE
  const isAvailable = hrlake_coverage_level && hrlake_coverage_level !== 'none'

  return (
    <div className="group relative bg-white border border-slate-200 hover:border-l-4 hover:border-l-blue-500 hover:border-blue-200 rounded-xl overflow-hidden transition-all duration-200 flex flex-col">

      {/* Main link area */}
      <Link href={`/countries/${code}/`} className="flex flex-col gap-3 p-5 flex-1">

        {/* Top row: flag + name */}
        <div className="flex items-center gap-3">
          <img
            src={`https://flagcdn.com/32x24/${code}.png`}
            alt={name}
            width={32}
            height={24}
            className="rounded-sm shadow-sm shrink-0 object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate text-sm leading-tight">
              {name}
            </p>
            {region && (
              <p className="text-xs text-slate-400 mt-0.5 truncate">{region}</p>
            )}
          </div>
          <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-400 shrink-0 transition-colors" />
        </div>

        {/* Currency + coverage */}
        <div className="flex items-center justify-between gap-2">
          {currency ? (
            <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded px-2 py-0.5">
              {currency}
            </span>
          ) : <span />}
          <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${coverage.className}`}>
            {coverage.label}
          </span>
        </div>
      </Link>

      {/* Quick sub-page links — only for available countries */}
      {isAvailable && (
        <div className="border-t border-slate-100 px-5 py-2.5 flex items-center gap-1">
          <Link href={`/countries/${code}/payroll-calculator/`}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
            title="Payroll Calculator"
          >
            <Calculator size={12} /> Calc
          </Link>
          <Link href={`/countries/${code}/tax-guide/`}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
            title="Tax Guide"
          >
            <BookOpen size={12} /> Tax
          </Link>
          <Link href={`/countries/${code}/employmentlaw/`}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
            title="Employment Law"
          >
            <Scale size={12} /> Law
          </Link>
          <Link href={`/eor/${code}/`}
            className="ml-auto text-xs text-slate-400 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
            title="EOR Guide"
          >
            EOR
          </Link>
        </div>
      )}
    </div>
  )
}
