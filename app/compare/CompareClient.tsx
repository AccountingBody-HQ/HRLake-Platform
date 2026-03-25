'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'


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
  applies_above: number | null
  applies_below: number | null
  employer_cap_annual: number | null
  employee_cap_annual: number | null
}

interface TaxBracketRow {
  rate: number
}

interface CountryData {
  country: Country
  rules: RuleRow[]
  ss: SSRow[]
  taxBrackets: TaxBracketRow[]
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

function calcSS(ss: SSRow[], type: 'employer' | 'employee', gross: number): number {
  let total = 0
  for (const s of ss) {
    const rate = type === 'employer' ? Number(s.employer_rate) : Number(s.employee_rate)
    const floor = s.applies_above !== null ? Number(s.applies_above) : 0
    const ceiling = s.applies_below !== null ? Number(s.applies_below) : Infinity
    const cap = type === 'employer' ? s.employer_cap_annual : s.employee_cap_annual
    const taxable = Math.max(0, Math.min(gross, ceiling) - floor)
    const base = cap !== null ? Math.min(taxable, Number(cap)) : taxable
    total += base * (rate / 100)
  }
  return total
}

function getSSRate(ss: SSRow[], type: string): number {
  // Display rate — max rate across all bands for informational display only
  const rates = ss.map(s =>
    type === 'employer' ? Number(s.employer_rate) : Number(s.employee_rate)
  )
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
  const [rates, setRates] = useState<Record<string, number>>({})
  const [ratesLoaded, setRatesLoaded] = useState(false)
  const [showConverted, setShowConverted] = useState(false)
  const [convertTo, setConvertTo] = useState('USD')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function fetchCountryData(code: string, countryList: Country[]): Promise<CountryData | null> {
    const country = countryList.find(c => c.iso2 === code)
    if (!country) return null

    const [rulesRes, ssRes, bracketsRes] = await Promise.all([
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
        .select('contribution_type, employer_rate, employee_rate, applies_above, applies_below, employer_cap_annual, employee_cap_annual')
        .eq('country_code', code)
        .eq('is_current', true),
      supabase
        .schema('gpe')
        .from('tax_brackets')
        .select('rate')
        .eq('country_code', code)
        .eq('is_current', true)
        .eq('tier', 'free'),
    ])

    return {
      country,
      rules: rulesRes.data ?? [],
      ss: ssRes.data ?? [],
      taxBrackets: bracketsRes.data ?? [],
    }
  }

  async function handleCompare() {
    setLoading(true)
    const [a, b, ratesRes] = await Promise.all([
      fetchCountryData(codeA, countries),
      fetchCountryData(codeB, countries),
      fetch('https://open.er-api.com/v6/latest/USD').then(r => r.json()).catch(() => null),
    ])
    setDataA(a)
    setDataB(b)
    if (ratesRes?.rates) {
      setRates(ratesRes.rates)
      setRatesLoaded(true)
      // Default convert-to currency is Country A's currency
      if (a) setConvertTo(a.country.currency_code)
    }
    setLoading(false)
    setCompared(true)
  }

  // Derive income tax range from brackets
  function getTaxRange(brackets: TaxBracketRow[]): string {
    const nonZero = brackets.map(b => Number(b.rate)).filter(r => r > 0)
    if (nonZero.length === 0) return '—'
    const min = Math.min(...nonZero)
    const max = Math.max(...nonZero)
    return min === max ? `${min}%` : `${min}–${max}%`
  }

  // Convert amount from one currency to another via USD base
  function convertCurrency(amount: number, from: string, to: string): number {
    if (!rates[from] || !rates[to] || from === to) return amount
    return (amount / rates[from]) * rates[to]
  }

  const CURRENCY_SYMBOLS: Record<string, string> = {
    GBP: '£', USD: '$', EUR: '€', AUD: 'A$', CAD: 'C$', JPY: '¥',
    SGD: 'S$', AED: 'د.إ', SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', CHF: 'Fr', INR: '₹',
  }
  function fmtCurrency(amount: number, currency: string): string {
    const sym = CURRENCY_SYMBOLS[currency] ?? currency + ' '
    return sym + Math.round(amount).toLocaleString('en-GB')
  }

  // Calculate estimated employer cost at given salary using proper threshold logic
  function employerCost(data: CountryData, grossSalary: number): number {
    const employerSS = calcSS(data.ss, 'employer', grossSalary)
    return grossSalary + employerSS
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

            {/* Income tax range from brackets */}
            <div className="grid grid-cols-[2fr_1fr_1fr] px-6 py-4 items-center">
              <span className="text-sm font-medium text-slate-600">Income Tax Range</span>
              <span className="font-mono text-sm font-semibold text-slate-800">
                {getTaxRange(dataA.taxBrackets)}
              </span>
              <span className="font-mono text-sm font-semibold text-slate-800">
                {getTaxRange(dataB.taxBrackets)}
              </span>
            </div>

            {COMPARISON_ROWS.map((row, i) => (
              <div key={row.label}
                className={`grid grid-cols-[2fr_1fr_1fr] px-6 py-4 items-center border-t border-slate-100`}>
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

          {/* Cost breakdown cards — one per country in own currency */}
          {(grossA > 0 || grossB > 0) && (
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { data: dataA, gross: grossA, color: 'blue', accent: 'border-blue-200 bg-blue-50', badge: 'bg-blue-600', bar: 'bg-blue-500' },
                { data: dataB, gross: grossB, color: 'violet', accent: 'border-violet-200 bg-violet-50', badge: 'bg-violet-600', bar: 'bg-violet-500' },
              ].map(({ data: d, gross, color, accent, badge, bar }) => {
                if (!d || gross <= 0) return null
                const empSS = Math.round(calcSS(d.ss, 'employer', gross))
                const totalCost = Math.round(employerCost(d, gross))
                const currency = d.country.currency_code
                const sym = ({ GBP: '£', USD: '$', EUR: '€', AUD: 'A$', CAD: 'C$', JPY: '¥', SGD: 'S$', AED: 'د.إ', SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', CHF: 'Fr', INR: '₹' } as Record<string,string>)[currency] ?? currency + ' '
                const f = (n: number) => sym + Math.round(n).toLocaleString('en-GB')
                const ssRate = gross > 0 ? (empSS / gross) * 100 : 0
                const netRate = ssRate > 0 ? (empSS / totalCost) * 100 : 0
                const grossRate = (gross / totalCost) * 100

                return (
                  <div key={d.country.iso2} className={`rounded-2xl border-2 ${accent} overflow-hidden`}>
                    {/* Card header */}
                    <div className="px-6 py-4 flex items-center gap-3">
                      <img src={`https://flagcdn.com/28x21/${d.country.iso2.toLowerCase()}.png`} width={28} height={21} alt={d.country.name} className="rounded-sm shadow-sm" />
                      <div>
                        <div className="font-bold text-slate-900">{d.country.name}</div>
                        <div className="text-xs text-slate-500">{currency} · Annual gross {f(gross)}</div>
                      </div>
                    </div>

                    {/* Cost rows */}
                    <div className="bg-white mx-4 mb-4 rounded-xl overflow-hidden border border-slate-100">
                      {[
                        { label: 'Gross Salary', value: f(gross), sub: null },
                        { label: 'Employer SS', value: f(empSS), sub: `${ssRate.toFixed(1)}% of gross` },
                        { label: 'Total Employer Cost', value: f(totalCost), sub: null, highlight: true },
                      ].map((row, i) => (
                        <div key={row.label} className={`flex items-center justify-between px-5 py-3.5 ${i > 0 ? 'border-t border-slate-100' : ''} ${row.highlight ? 'bg-slate-50' : ''}`}>
                          <div>
                            <div className={`text-sm ${row.highlight ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{row.label}</div>
                            {row.sub && <div className="text-xs text-slate-400 mt-0.5">{row.sub}</div>}
                          </div>
                          <div className={`font-mono text-sm ${row.highlight ? 'font-black text-slate-900 text-base' : 'font-semibold text-slate-700'}`}>{row.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Visual bar */}
                    <div className="px-4 pb-4">
                      <div className="text-xs text-slate-500 mb-2">Cost composition</div>
                      <div className="flex rounded-full overflow-hidden h-3 bg-slate-200">
                        <div className={`${bar} opacity-60 h-full transition-all`} style={{ width: `${grossRate}%` }} title={`Gross: ${grossRate.toFixed(0)}%`} />
                        <div className={`${bar} h-full transition-all`} style={{ width: `${netRate}%` }} title={`Employer SS: ${netRate.toFixed(0)}%`} />
                      </div>
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <div className={`w-2.5 h-2.5 rounded-sm ${bar} opacity-60`} /> Gross salary
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <div className={`w-2.5 h-2.5 rounded-sm ${bar}`} /> Employer SS
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Currency conversion section */}
          {ratesLoaded && dataA && dataB && (grossA > 0 || grossB > 0) && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-slate-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-white font-semibold">Compare costs in the same currency</h3>
                  <p className="text-slate-400 text-xs mt-1">Convert both employer costs to a common currency for a fair comparison</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-slate-400 text-xs font-medium shrink-0">Convert to</label>
                  <select
                    value={convertTo}
                    onChange={e => setConvertTo(e.target.value)}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400"
                  >
                    {['USD','GBP','EUR','AUD','CAD','JPY','SGD','CHF','SEK','NOK','DKK','PLN','AED','INR'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { data: dataA, gross: grossA, color: 'blue' },
                    { data: dataB, gross: grossB, color: 'violet' },
                  ].map(({ data: d, gross, color }) => {
                    if (!d || gross <= 0) return null
                    const totalLocal = employerCost(d, gross)
                    const totalConverted = convertCurrency(totalLocal, d.country.currency_code, convertTo)
                    const grossConverted = convertCurrency(gross, d.country.currency_code, convertTo)
                    const ssConverted = totalConverted - grossConverted
                    const isSame = d.country.currency_code === convertTo
                    return (
                      <div key={d.country.iso2}
                        className={`rounded-xl border-2 p-5 ${color === 'blue' ? 'border-blue-100 bg-blue-50' : 'border-violet-100 bg-violet-50'}`}>
                        <div className="flex items-center gap-2 mb-4">
                          <img src={`https://flagcdn.com/20x15/${d.country.iso2.toLowerCase()}.png`} width={20} height={15} alt={d.country.name} className="rounded-sm" />
                          <span className="font-semibold text-slate-800 text-sm">{d.country.name}</span>
                          {isSame && <span className="text-xs text-slate-400">(no conversion needed)</span>}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Gross salary</span>
                            <span className="font-mono font-semibold text-slate-700">{fmtCurrency(grossConverted, convertTo)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Employer SS</span>
                            <span className="font-mono font-semibold text-slate-700">{fmtCurrency(ssConverted, convertTo)}</span>
                          </div>
                          <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                            <span className="font-bold text-slate-900">Total employer cost</span>
                            <span className={`font-mono font-black text-lg ${color === 'blue' ? 'text-blue-700' : 'text-violet-700'}`}>
                              {fmtCurrency(totalConverted, convertTo)}
                            </span>
                          </div>
                          {!isSame && (
                            <p className="text-xs text-slate-400 pt-1">
                              1 {d.country.currency_code} = {rates[convertTo] && rates[d.country.currency_code]
                                ? (rates[convertTo] / rates[d.country.currency_code]).toFixed(4)
                                : '—'} {convertTo}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Winner callout */}
                {dataA && dataB && grossA > 0 && grossB > 0 && (() => {
                  const costA = convertCurrency(employerCost(dataA, grossA), dataA.country.currency_code, convertTo)
                  const costB = convertCurrency(employerCost(dataB, grossB), dataB.country.currency_code, convertTo)
                  const diff = Math.abs(costA - costB)
                  const cheaper = costA < costB ? dataA.country.name : dataB.country.name
                  const sym = CURRENCY_SYMBOLS[convertTo] ?? convertTo + ' '
                  return (
                    <div className="mt-4 bg-slate-900 rounded-xl px-5 py-4 flex items-center gap-3">
                      <span className="text-2xl">💡</span>
                      <p className="text-slate-300 text-sm">
                        <span className="text-white font-bold">{cheaper}</span> is the lower-cost employer at this salary —
                        saving approximately <span className="text-green-400 font-bold">{sym}{Math.round(diff).toLocaleString('en-GB')} {convertTo}</span> per year compared to {costA < costB ? dataB.country.name : dataA.country.name}.
                      </p>
                    </div>
                  )
                })()}
              </div>
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
