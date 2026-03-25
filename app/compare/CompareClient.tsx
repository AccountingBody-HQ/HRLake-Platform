'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Country {
  iso2: string
  name: string
  currency_code: string
  flag_emoji: string
}

interface RuleRow {
  rule_type: string
  value_text: string | null
  value_numeric: number | null
  value_unit: string | null
}

interface SSRow {
  contribution_type: string
  employer_rate: number
  employee_rate: number
}

interface CountryData {
  country: Country
  rules: RuleRow[]
  ss: SSRow[]
}

interface Props {
  countries: Country[]
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: '£', USD: '$', EUR: '€', JPY: '¥', AUD: 'A$',
  CAD: 'C$', CHF: 'Fr', SEK: 'kr', NOK: 'kr', DKK: 'kr',
  SGD: 'S$', AED: 'د.إ', PLN: 'zł', INR: '₹',
}

function fmt(amount: number, currency: string) {
  const sym = CURRENCY_SYMBOLS[currency] ?? currency + ' '
  return sym + Math.round(amount).toLocaleString('en-GB')
}

function getRuleDisplay(rules: RuleRow[], type: string): string {
  const r = rules.find(x => x.rule_type === type)
  if (!r) return '—'
  if (r.value_text) return r.value_text
  if (r.value_numeric !== null && r.value_unit) {
    const unit = r.value_unit.replace(/_/g, ' ')
    // For minimum wage show currency
    if (type === 'minimum_wage') {
      return `${r.value_numeric} ${unit}`
    }
    return `${r.value_numeric} ${unit}`
  }
  return '—'
}

function getSSRate(ss: SSRow[], type: string): number {
  // Use the highest single rate rather than summing bands
  // Multiple rows often represent the same contribution split across salary bands
  // not additive separate contributions
  const rates = ss.map(s => {
    if (type === 'employer') return Number(s.employer_rate)
    if (type === 'employee') return Number(s.employee_rate)
    return 0
  })
  if (rates.length === 0) return 0
  return Math.max(...rates)
}

export default function CompareClient({ countries }: Props) {
  const [codeA, setCodeA] = useState('GB')
  const [codeB, setCodeB] = useState('US')
  const [salaryA, setSalaryA] = useState('60000')
  const [salaryB, setSalaryB] = useState('60000')
  const [dataA, setDataA] = useState<CountryData | null>(null)
  const [dataB, setDataB] = useState<CountryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [compared, setCompared] = useState(false)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function fetchCountryData(code: string, countryList: Country[]): Promise<CountryData | null> {
    const country = countryList.find(c => c.iso2 === code)
    if (!country) return null

    const [rulesRes, ssRes] = await Promise.all([
      supabase
        .schema('gpe')
        .from('employment_rules')
        .select('rule_type, value_text, value_numeric, value_unit')
        .eq('country_code', code)
        .eq('is_current', true)
        .eq('tier', 'free'),
      supabase
        .schema('gpe')
        .from('social_security')
        .select('contribution_type, employer_rate, employee_rate')
        .eq('country_code', code)
        .eq('is_current', true),
    ])

    return {
      country,
      rules: rulesRes.data ?? [],
      ss: ssRes.data ?? [],
    }
  }

  async function handleCompare() {
    setLoading(true)
    const [a, b] = await Promise.all([
      fetchCountryData(codeA, countries),
      fetchCountryData(codeB, countries),
    ])
    setDataA(a)
    setDataB(b)
    setLoading(false)
    setCompared(true)
  }

  // Calculate estimated employer cost at given salary
  function employerCost(data: CountryData, grossSalary: number): number {
    const employerSS = getSSRate(data.ss, 'employer')
    return grossSalary * (1 + employerSS / 100)
  }

  const grossA = parseFloat(salaryA.replace(/,/g, '')) || 0
  const grossB = parseFloat(salaryB.replace(/,/g, '')) || 0

  const chartData = compared && dataA && dataB ? [
    {
      name: 'Gross Salary',
      [dataA.country.name]: grossA,
      [dataB.country.name]: grossB,
    },
    {
      name: 'Employer SS',
      [dataA.country.name]: Math.round(grossA * getSSRate(dataA.ss, 'employer') / 100),
      [dataB.country.name]: Math.round(grossB * getSSRate(dataB.ss, 'employer') / 100),
    },
    {
      name: 'Total Cost',
      [dataA.country.name]: Math.round(employerCost(dataA, grossA)),
      [dataB.country.name]: Math.round(employerCost(dataB, grossB)),
    },
  ] : []

  const COMPARISON_ROWS = [
    { label: 'Income Tax Range',  keyA: 'income_tax_range',    type: 'rule' },
    { label: 'Minimum Wage',      keyA: 'minimum_wage',        type: 'rule' },
    { label: 'Annual Leave',      keyA: 'annual_leave',        type: 'rule' },
    { label: 'Notice Period',     keyA: 'notice_period_min',   type: 'rule' },
    { label: 'Probation Period',  keyA: 'probation_period_max',type: 'rule' },
    { label: 'Maternity Leave',   keyA: 'maternity_leave',     type: 'rule' },
  ]

  return (
    <div className="space-y-8">

      {/* Selector panel */}
      <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">

        {/* Header */}
        <div className="bg-slate-900 px-8 py-6">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">Comparison Tool</p>
          <h2 className="text-white font-serif text-2xl font-bold">Select two countries to compare</h2>
        </div>

        <div className="bg-white p-8 space-y-8">

          {/* Country selectors */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Country A */}
            <div className="relative">
              <div className="absolute -top-3 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                Country A
              </div>
              <div className="border-2 border-blue-200 hover:border-blue-400 rounded-2xl p-4 pt-5 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={`https://flagcdn.com/28x21/${codeA.toLowerCase()}.png`}
                    width={28} height={21}
                    alt={countries.find(c => c.iso2 === codeA)?.name ?? ''}
                    className="rounded-sm shadow-sm shrink-0"
                  />
                  <span className="font-semibold text-slate-800 text-sm">
                    {countries.find(c => c.iso2 === codeA)?.name ?? ''}
                  </span>
                </div>
                <select
                  value={codeA}
                  onChange={e => setCodeA(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-blue-400 text-sm"
                >
                  {countries.map(c => (
                    <option key={c.iso2} value={c.iso2}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* VS divider — hidden on mobile */}
            <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 rounded-full items-center justify-center pointer-events-none z-20">
              <span className="text-white text-xs font-black">VS</span>
            </div>

            {/* Country B */}
            <div className="relative">
              <div className="absolute -top-3 left-4 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                Country B
              </div>
              <div className="border-2 border-violet-200 hover:border-violet-400 rounded-2xl p-4 pt-5 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={`https://flagcdn.com/28x21/${codeB.toLowerCase()}.png`}
                    width={28} height={21}
                    alt={countries.find(c => c.iso2 === codeB)?.name ?? ''}
                    className="rounded-sm shadow-sm shrink-0"
                  />
                  <span className="font-semibold text-slate-800 text-sm">
                    {countries.find(c => c.iso2 === codeB)?.name ?? ''}
                  </span>
                </div>
                <select
                  value={codeB}
                  onChange={e => setCodeB(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:border-violet-400 text-sm"
                >
                  {countries.map(c => (
                    <option key={c.iso2} value={c.iso2}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Salary inputs */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-5">Annual Gross Salary — enter in each country's local currency</p>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
                  {countries.find(c => c.iso2 === codeA)?.name ?? 'Country A'} salary
                  <span className="text-slate-400 font-normal text-xs">({countries.find(c => c.iso2 === codeA)?.currency_code})</span>
                </label>
                <input
                  type="number"
                  value={salaryA}
                  onChange={e => setSalaryA(e.target.value)}
                  placeholder="e.g. 60000"
                  className="w-full px-4 py-3 bg-white border-2 border-blue-200 focus:border-blue-500 rounded-xl text-slate-800 font-semibold text-lg focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <span className="w-3 h-3 rounded-full bg-violet-600 shrink-0" />
                  {countries.find(c => c.iso2 === codeB)?.name ?? 'Country B'} salary
                  <span className="text-slate-400 font-normal text-xs">({countries.find(c => c.iso2 === codeB)?.currency_code})</span>
                </label>
                <input
                  type="number"
                  value={salaryB}
                  onChange={e => setSalaryB(e.target.value)}
                  placeholder="e.g. 60000"
                  className="w-full px-4 py-3 bg-white border-2 border-violet-200 focus:border-violet-500 rounded-xl text-slate-800 font-semibold text-lg focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleCompare}
              disabled={loading || codeA === codeB}
              className="flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-sm shadow-lg"
            >
              {loading ? 'Loading data…' : '⚖️ Compare Countries'}
            </button>
            {codeA === codeB && (
              <p className="text-xs text-red-500">Please select two different countries.</p>
            )}
          </div>

        </div>
      </div>

      {/* Results */}
      {compared && dataA && dataB && (
        <>
          {/* Employment law comparison table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="grid grid-cols-[2fr_1fr_1fr] bg-slate-900 px-6 py-4">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Category</span>
              <div className="flex items-center gap-2">
                <img src={`https://flagcdn.com/20x15/${codeA.toLowerCase()}.png`} width={20} height={15} alt={dataA.country.name} className="rounded-sm" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-200">{dataA.country.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <img src={`https://flagcdn.com/20x15/${codeB.toLowerCase()}.png`} width={20} height={15} alt={dataB.country.name} className="rounded-sm" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-200">{dataB.country.name}</span>
              </div>
            </div>

            {COMPARISON_ROWS.map((row, i) => (
              <div key={row.label}
                className={`grid grid-cols-[2fr_1fr_1fr] px-6 py-4 items-center ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                <span className="text-sm font-medium text-slate-600">{row.label}</span>
                <span className="font-mono text-sm font-semibold text-slate-800">
                  {getRuleDisplay(dataA.rules, row.keyA)}
                </span>
                <span className="font-mono text-sm font-semibold text-slate-800">
                  {getRuleDisplay(dataB.rules, row.keyA)}
                </span>
              </div>
            ))}

            {/* SS rows */}
            <div className="grid grid-cols-[2fr_1fr_1fr] px-6 py-4 items-center border-t border-slate-100">
              <span className="text-sm font-medium text-slate-600">Employer SS Rate</span>
              <span className="font-mono text-sm font-semibold text-slate-800">
                {getSSRate(dataA.ss, 'employer').toFixed(1)}%
              </span>
              <span className="font-mono text-sm font-semibold text-slate-800">
                {getSSRate(dataB.ss, 'employer').toFixed(1)}%
              </span>
            </div>

            <div className="grid grid-cols-[2fr_1fr_1fr] px-6 py-4 items-center border-t border-slate-100">
              <span className="text-sm font-medium text-slate-600">Employee SS Rate</span>
              <span className="font-mono text-sm font-semibold text-slate-800">
                {getSSRate(dataA.ss, 'employee').toFixed(1)}%
              </span>
              <span className="font-mono text-sm font-semibold text-slate-800">
                {getSSRate(dataB.ss, 'employee').toFixed(1)}%
              </span>
            </div>

            {(grossA > 0 || grossB > 0) && (
              <div className="grid grid-cols-[2fr_1fr_1fr] px-6 py-4 items-center border-t border-slate-200 bg-blue-50">
                <span className="text-sm font-bold text-slate-800">Est. Total Employer Cost</span>
                <span className="font-mono text-sm font-bold text-blue-700">
                  {grossA > 0 ? fmt(employerCost(dataA, grossA), dataA.country.currency_code) : '—'}
                </span>
                <span className="font-mono text-sm font-bold text-blue-700">
                  {grossB > 0 ? fmt(employerCost(dataB, grossB), dataB.country.currency_code) : '—'}
                </span>
              </div>
            )}
          </div>

          {/* Chart */}
          {(grossA > 0 || grossB > 0) && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-6">Employer Cost Breakdown</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ left: 16, right: 16, top: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => '$' + (v / 1000).toFixed(0) + 'k'} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => typeof v === "number" ? v.toLocaleString() : ""} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 13 }} />
                  <Legend />
                  <Bar dataKey={dataA.country.name} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={dataB.country.name} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* CTAs to full country pages */}
          <div className="grid sm:grid-cols-2 gap-4">
            {[dataA, dataB].map(d => (
              <Link key={d.country.iso2}
                href={`/countries/${d.country.iso2.toLowerCase()}/`}
                className="group flex items-center justify-between bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-xl px-6 py-4 transition-all">
                <div className="flex items-center gap-3">
                  <img src={`https://flagcdn.com/28x21/${d.country.iso2.toLowerCase()}.png`} width={28} height={21} alt={d.country.name} className="rounded-sm" />
                  <div>
                    <div className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{d.country.name}</div>
                    <div className="text-xs text-slate-400">Full country profile</div>
                  </div>
                </div>
                <ArrowRight size={15} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
