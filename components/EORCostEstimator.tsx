'use client'
import { getFlag } from '@/lib/flag'

import { useState, useMemo, useEffect } from 'react'
import { Calculator, ChevronDown, Users, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

type Country = {
  country_code: string
  ss_employer_rate: number
  provider_fee_low: number
  provider_fee_high: number
  risk_level: string
  countries: { name: string; flag_emoji: string; currency_code: string; currency_symbol: string } | null
}

const complexityColour: Record<string, string> = {
  Low:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High:   'bg-red-50 text-red-700 border-red-200',
}

function fmt(n: number, symbol: string) {
  return `${symbol}${Math.round(n).toLocaleString()}`
}

export default function EORCostEstimator({ defaultCountryCode = "GB" }: { defaultCountryCode?: string }) {
  const [countries, setCountries]     = useState<Country[]>([])
  const [loading, setLoading]         = useState(true)
  const [countryCode, setCountryCode] = useState(defaultCountryCode.toUpperCase())
  const [headcount, setHeadcount]     = useState(1)
  const [salary, setSalary]           = useState(60000)

  useEffect(() => {
    async function fetchCountries() {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: guides } = await supabase
          .schema('hrlake').from('eor_guides')
          .select('country_code, ss_employer_rate, provider_fee_low, provider_fee_high, risk_level')
          .eq('is_current', true)
          .order('country_code')

        const { data: countryRows } = await supabase
          .from('countries')
          .select('iso2, name, flag_emoji, currency_code, currency_symbol')

        const countryMap = Object.fromEntries((countryRows ?? []).map(c => [c.iso2, c]))

        const merged = (guides ?? []).map(g => ({
          ...g,
          countries: countryMap[g.country_code] ?? null,
        }))
        setCountries(merged as unknown as Country[])
      } catch (e) {
        console.error('Failed to fetch EOR countries', e)
      } finally {
        setLoading(false)
      }
    }
    fetchCountries()
  }, [])

  const selected = countries.find(c => c.country_code === countryCode) ?? countries[0]
  const countryInfo = selected
    ? (Array.isArray(selected.countries) ? selected.countries[0] : selected.countries)
    : null

  const symbol = countryInfo?.currency_symbol ?? '£'

  const result = useMemo(() => {
    if (!selected) return null
    const totalSalary      = salary * headcount
    const ssCost           = totalSalary * ((selected.ss_employer_rate ?? 0) / 100)
    const baseEmployerCost = totalSalary + ssCost
    const eorLow           = baseEmployerCost * (1 + selected.provider_fee_low  / 100)
    const eorHigh          = baseEmployerCost * (1 + selected.provider_fee_high / 100)
    const eorFeeOnlyLow    = eorLow  - baseEmployerCost
    const eorFeeOnlyHigh   = eorHigh - baseEmployerCost
    return { totalSalary, ssCost, baseEmployerCost, eorLow, eorHigh, eorFeeOnlyLow, eorFeeOnlyHigh }
  }, [selected, headcount, salary])

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading country data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 px-8 py-6 flex items-center gap-4">
        <div className="bg-blue-600 p-2.5 rounded-xl">
          <Calculator size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">EOR Cost Estimator</h3>
          <p className="text-slate-400 text-sm">Estimate total employment cost via an Employer of Record</p>
        </div>
      </div>

      <div className="p-8">
        {/* Inputs */}
        <div className="grid sm:grid-cols-3 gap-5 mb-8">

          {/* Country selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Country</label>
            <div className="relative">
              <select
                value={countryCode}
                onChange={e => setCountryCode(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-slate-800 font-semibold text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              >
                {countries.map(c => {
                  const info = Array.isArray(c.countries) ? c.countries[0] : c.countries
                  return (
                    <option key={c.country_code} value={c.country_code}>
                      {getFlag(c.country_code)} {info?.name}
                    </option>
                  )
                })}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Headcount */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Headcount</label>
            <div className="relative">
              <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number" min={1} max={500} value={headcount}
                onChange={e => setHeadcount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-slate-800 font-semibold text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Salary */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Avg Annual Salary ({countryInfo?.currency_code ?? '—'})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">{symbol}</span>
              <input
                type="number" min={10000} step={1000} value={salary}
                onChange={e => setSalary(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-slate-800 font-semibold text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {result && selected && (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden mb-6">
            <div className="bg-blue-600 px-6 py-5 grid sm:grid-cols-2 gap-4 items-center">
              <div>
                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Estimated Total EOR Cost</p>
                <p className="text-white text-3xl font-black tracking-tight">
                  {fmt(result.eorLow, symbol)} – {fmt(result.eorHigh, symbol)}
                </p>
                <p className="text-blue-300 text-xs mt-1">per year · {headcount > 1 ? `${headcount} employees` : '1 employee'}</p>
              </div>
              <div className="text-right hidden sm:block">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${complexityColour[selected.risk_level]} bg-white/90`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {selected.risk_level} complexity
                </span>
              </div>
            </div>
            <div className="divide-y divide-slate-200">
              {[
                { label: 'Total gross salary',         value: fmt(result.totalSalary, symbol),      sub: `${headcount} × ${fmt(salary, symbol)}` },
                { label: `Employer SS (~${selected.ss_employer_rate}%)`, value: fmt(result.ssCost, symbol), sub: 'Social security & payroll taxes' },
                { label: 'Base employer cost',          value: fmt(result.baseEmployerCost, symbol), sub: 'Before EOR provider fee', bold: true },
                { label: `EOR provider fee (${selected.provider_fee_low}–${selected.provider_fee_high}%)`, value: `${fmt(result.eorFeeOnlyLow, symbol)} – ${fmt(result.eorFeeOnlyHigh, symbol)}`, sub: 'EOR markup on total employer cost' },
              ].map(row => (
                <div key={row.label} className={`flex items-center justify-between px-6 py-4 ${row.bold ? 'bg-white' : ''}`}>
                  <div>
                    <p className={`text-sm ${row.bold ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{row.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{row.sub}</p>
                  </div>
                  <p className={`font-mono ${row.bold ? 'font-bold text-slate-900 text-base' : 'font-semibold text-slate-700 text-sm'}`}>{row.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer + CTA */}
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex gap-2.5 flex-1 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-800 text-xs leading-relaxed">
              Estimates only. Actual EOR costs vary by provider, employee benefits, and country-specific rules.
              Always confirm with a qualified provider before making hiring decisions.
            </p>
          </div>
          {selected && (
            <Link href={`/eor/${countryCode.toLowerCase()}/`}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors whitespace-nowrap shrink-0">
              Full {countryInfo?.name} EOR guide <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
