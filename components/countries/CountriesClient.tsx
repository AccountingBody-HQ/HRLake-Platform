import { getFlag } from '@/lib/flag'
'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import CountryCard from '@/components/CountryCard'

type CoverageLevel = 'full' | 'partial' | 'basic' | 'none'

interface Country {
  id: string
  iso2: string
  iso3: string | null
  name: string
  flag_emoji: string | null
  currency_code: string | null
  region: string | null
  hrlake_coverage_level: CoverageLevel | null
  payroll_complexity_score: number | null
}

type SortOption = 'az' | 'region' | 'complexity'

// These values must exactly match what is stored in the database
const REGION_TABS = [
  { label: 'All',       value: 'all' },
  { label: 'Europe',    value: 'Europe' },
  { label: 'Americas',  value: 'Americas' },
  { label: 'Asia',      value: 'Asia' },
  { label: 'Oceania',   value: 'Oceania' },
]

// Map URL slugs (from homepage links) to exact database region values
const SLUG_TO_REGION: Record<string, string> = {
  'europe':       'Europe',
  'americas':     'Americas',
  'asia':         'Asia',
  'asia-pacific': 'Asia',
  'oceania':      'Oceania',
  'middle-east':  'Middle East',
  'africa':       'Africa',
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'A-Z',        value: 'az' },
  { label: 'Region',     value: 'region' },

]

interface CountriesClientProps {
  countries: Country[]
}

export default function CountriesClient({ countries }: CountriesClientProps) {
  const searchParams = useSearchParams()
  const regionParam = searchParams.get('region') ?? ''
  const initialRegion = SLUG_TO_REGION[regionParam.toLowerCase()] ?? 'all'

  const [search, setSearch] = useState('')
  const [region, setRegion] = useState(initialRegion)
  const [sort, setSort]     = useState<SortOption>('az')

  useEffect(() => {
    const mapped = SLUG_TO_REGION[regionParam.toLowerCase()] ?? 'all'
    setRegion(mapped)
  }, [regionParam])

  const filtered = useMemo(() => {
    let result = [...countries]

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.iso2.toLowerCase().includes(q) ||
        (c.currency_code?.toLowerCase().includes(q) ?? false)
      )
    }

    if (region !== 'all') {
      result = result.filter(c => c.region === region)
    }

    if (sort === 'az') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sort === 'region') {
      result.sort((a, b) => {
        const ra = a.region ?? 'ZZZ'
        const rb = b.region ?? 'ZZZ'
        return ra.localeCompare(rb) || a.name.localeCompare(b.name)
      })
    } else if (sort === 'complexity') {
      result.sort((a, b) => {
        const sa = a.payroll_complexity_score ?? 0
        const sb = b.payroll_complexity_score ?? 0
        return sb - sa
      })
    }

    return result
  }, [countries, search, region, sort])

  return (
    <div>
      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search countries, currencies..."
            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:block">Sort</span>
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  sort === opt.value
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Region tabs */}
      <div className="flex gap-1 flex-wrap mb-8">
        {REGION_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setRegion(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              region === tab.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500">
          {filtered.length === 0
            ? 'No countries found'
            : `Showing ${filtered.length} ${filtered.length === 1 ? 'country' : 'countries'}`}
        </p>
        {(search || region !== 'all') && (
          <button
            onClick={() => { setSearch(''); setRegion('all') }}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Country grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(country => (
            <CountryCard
              key={country.iso2}
              iso2={country.iso2}
              name={country.name}
              flag_emoji={getFlag(country.iso2)}
              currency={country.currency_code}
              region={country.region}
              hrlake_coverage_level={country.hrlake_coverage_level}
              payroll_complexity_score={country.payroll_complexity_score}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-slate-400">
          <p className="text-5xl mb-4">🌍</p>
          <p className="font-semibold text-slate-600 text-lg">No countries match your search</p>
          <p className="text-sm mt-2">Try a different name, currency code, or region</p>
        </div>
      )}
    </div>
  )
}
