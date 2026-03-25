'use client'

import { useState, useMemo } from 'react'
import { Calculator, ChevronDown, TrendingUp, DollarSign, Users, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const COUNTRIES = [
  { code: 'gb', name: 'United Kingdom',  currency: 'GBP', symbol: '£',  eorMarkupLow: 8,  eorMarkupHigh: 15, ssRate: 13.8, complexity: 'Low' },
  { code: 'us', name: 'United States',   currency: 'USD', symbol: '$',  eorMarkupLow: 10, eorMarkupHigh: 18, ssRate: 7.65, complexity: 'Low' },
  { code: 'de', name: 'Germany',         currency: 'EUR', symbol: '€',  eorMarkupLow: 10, eorMarkupHigh: 18, ssRate: 20.0, complexity: 'Medium' },
  { code: 'fr', name: 'France',          currency: 'EUR', symbol: '€',  eorMarkupLow: 12, eorMarkupHigh: 20, ssRate: 30.0, complexity: 'High' },
  { code: 'nl', name: 'Netherlands',     currency: 'EUR', symbol: '€',  eorMarkupLow: 10, eorMarkupHigh: 17, ssRate: 19.0, complexity: 'Medium' },
  { code: 'es', name: 'Spain',           currency: 'EUR', symbol: '€',  eorMarkupLow: 11, eorMarkupHigh: 18, ssRate: 30.0, complexity: 'Medium' },
  { code: 'it', name: 'Italy',           currency: 'EUR', symbol: '€',  eorMarkupLow: 12, eorMarkupHigh: 20, ssRate: 33.0, complexity: 'High' },
  { code: 'se', name: 'Sweden',          currency: 'SEK', symbol: 'kr', eorMarkupLow: 10, eorMarkupHigh: 17, ssRate: 31.4, complexity: 'Medium' },
  { code: 'dk', name: 'Denmark',         currency: 'DKK', symbol: 'kr', eorMarkupLow: 10, eorMarkupHigh: 16, ssRate: 8.0,  complexity: 'Low' },
  { code: 'no', name: 'Norway',          currency: 'NOK', symbol: 'kr', eorMarkupLow: 10, eorMarkupHigh: 16, ssRate: 14.1, complexity: 'Low' },
  { code: 'ch', name: 'Switzerland',     currency: 'CHF', symbol: 'Fr', eorMarkupLow: 10, eorMarkupHigh: 16, ssRate: 10.0, complexity: 'Medium' },
  { code: 'be', name: 'Belgium',         currency: 'EUR', symbol: '€',  eorMarkupLow: 12, eorMarkupHigh: 20, ssRate: 27.0, complexity: 'High' },
  { code: 'ie', name: 'Ireland',         currency: 'EUR', symbol: '€',  eorMarkupLow: 9,  eorMarkupHigh: 15, ssRate: 11.1, complexity: 'Low' },
  { code: 'pl', name: 'Poland',          currency: 'PLN', symbol: 'zł', eorMarkupLow: 12, eorMarkupHigh: 20, ssRate: 20.8, complexity: 'Medium' },
  { code: 'pt', name: 'Portugal',        currency: 'EUR', symbol: '€',  eorMarkupLow: 11, eorMarkupHigh: 18, ssRate: 23.8, complexity: 'Medium' },
  { code: 'au', name: 'Australia',       currency: 'AUD', symbol: 'A$', eorMarkupLow: 9,  eorMarkupHigh: 15, ssRate: 11.0, complexity: 'Low' },
  { code: 'ca', name: 'Canada',          currency: 'CAD', symbol: 'C$', eorMarkupLow: 9,  eorMarkupHigh: 15, ssRate: 7.5,  complexity: 'Low' },
  { code: 'sg', name: 'Singapore',       currency: 'SGD', symbol: 'S$', eorMarkupLow: 9,  eorMarkupHigh: 14, ssRate: 17.0, complexity: 'Low' },
  { code: 'ae', name: 'UAE',             currency: 'AED', symbol: 'د.إ',eorMarkupLow: 10, eorMarkupHigh: 16, ssRate: 12.5, complexity: 'Low' },
  { code: 'jp', name: 'Japan',           currency: 'JPY', symbol: '¥',  eorMarkupLow: 12, eorMarkupHigh: 20, ssRate: 16.0, complexity: 'High' },
  { code: 'in', name: 'India',           currency: 'INR', symbol: '₹',  eorMarkupLow: 12, eorMarkupHigh: 22, ssRate: 12.0, complexity: 'High' },
]

const complexityColour: Record<string, string> = {
  Low:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High:   'bg-red-50 text-red-700 border-red-200',
}

function fmt(n: number, symbol: string) {
  return `${symbol}${Math.round(n).toLocaleString()}`
}

export default function EORCostEstimator() {
  const [countryCode, setCountryCode] = useState('gb')
  const [headcount, setHeadcount]     = useState(1)
  const [salary, setSalary]           = useState(60000)
  const [open, setOpen]               = useState(false)

  const country = COUNTRIES.find(c => c.code === countryCode) ?? COUNTRIES[0]

  const result = useMemo(() => {
    const totalSalary      = salary * headcount
    const ssCost           = totalSalary * (country.ssRate / 100)
    const baseEmployerCost = totalSalary + ssCost
    const eorLow           = baseEmployerCost * (1 + country.eorMarkupLow  / 100)
    const eorHigh          = baseEmployerCost * (1 + country.eorMarkupHigh / 100)
    const eorFeeOnlyLow    = eorLow  - baseEmployerCost
    const eorFeeOnlyHigh   = eorHigh - baseEmployerCost
    return { totalSalary, ssCost, baseEmployerCost, eorLow, eorHigh, eorFeeOnlyLow, eorFeeOnlyHigh }
  }, [countryCode, headcount, salary, country])

  const s = country.symbol

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
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
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
                type="number"
                min={1}
                max={500}
                value={headcount}
                onChange={e => setHeadcount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-slate-800 font-semibold text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Salary */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Avg Annual Salary ({country.currency})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">{s}</span>
              <input
                type="number"
                min={10000}
                step={1000}
                value={salary}
                onChange={e => setSalary(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-slate-800 font-semibold text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden mb-6">
          {/* Total cost headline */}
          <div className="bg-blue-600 px-6 py-5 grid sm:grid-cols-2 gap-4 items-center">
            <div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Estimated Total EOR Cost</p>
              <p className="text-white text-3xl font-black tracking-tight">
                {fmt(result.eorLow, s)} – {fmt(result.eorHigh, s)}
              </p>
              <p className="text-blue-300 text-xs mt-1">per year · {headcount > 1 ? `${headcount} employees` : '1 employee'}</p>
            </div>
            <div className="text-right hidden sm:block">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${complexityColour[country.complexity]} bg-white/90`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {country.complexity} complexity
              </span>
            </div>
          </div>

          {/* Breakdown */}
          <div className="divide-y divide-slate-200">
            {[
              { label: 'Total gross salary',         value: fmt(result.totalSalary, s),      sub: `${headcount} × ${fmt(salary, s)}` },
              { label: `Employer SS (~${country.ssRate}%)`, value: fmt(result.ssCost, s),    sub: 'Social security & payroll taxes' },
              { label: 'Base employer cost',          value: fmt(result.baseEmployerCost, s), sub: 'Before EOR provider fee', bold: true },
              { label: `EOR provider fee (${country.eorMarkupLow}–${country.eorMarkupHigh}%)`, value: `${fmt(result.eorFeeOnlyLow, s)} – ${fmt(result.eorFeeOnlyHigh, s)}`, sub: 'EOR markup on total employer cost' },
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

        {/* Disclaimer + CTA */}
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex gap-2.5 flex-1 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-800 text-xs leading-relaxed">
              Estimates only. Actual EOR costs vary by provider, employee benefits, and country-specific rules.
              Always confirm with a qualified provider before making hiring decisions.
            </p>
          </div>
          <Link href={`/eor/${countryCode}/`}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors whitespace-nowrap shrink-0">
            Full {country.name} EOR guide <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
