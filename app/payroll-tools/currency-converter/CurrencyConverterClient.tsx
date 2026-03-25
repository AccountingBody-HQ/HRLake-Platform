'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
]

const PERIODS = [
  { label: 'Annual', multiplier: 1 },
  { label: 'Monthly', multiplier: 12 },
  { label: 'Weekly', multiplier: 52 },
  { label: 'Daily', multiplier: 260 },
]

export default function CurrencyConverterClient() {
  const [amount, setAmount] = useState('60000')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('GBP')
  const [period, setPeriod] = useState('Annual')
  const [rates, setRates] = useState<Record<string, number>>({})
  const [ratesLoading, setRatesLoading] = useState(true)
  const [ratesError, setRatesError] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD')
        const data = await res.json()
        if (data.rates) {
          setRates(data.rates)
          setLastUpdated(new Date(data.time_last_update_utc).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
          }))
        } else {
          setRatesError(true)
        }
      } catch {
        setRatesError(true)
      } finally {
        setRatesLoading(false)
      }
    }
    fetchRates()
  }, [])

  function swapCurrencies() {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const amountNum = parseFloat(amount.replace(/,/g, '')) || 0
  const periodObj = PERIODS.find(p => p.label === period)!

  // Convert: amount (annual) → from currency annual → to currency annual
  // All rates are relative to USD
  function convert(annualAmount: number, from: string, to: string): number {
    if (!rates[from] || !rates[to]) return 0
    const inUSD = annualAmount / rates[from]
    return inUSD * rates[to]
  }

  // Get annual equivalent of entered amount
  const annualAmount = amountNum * (period === 'Annual' ? 1 : period === 'Monthly' ? 12 : period === 'Weekly' ? 52 : 260)
  const convertedAnnual = convert(annualAmount, fromCurrency, toCurrency)

  const fromSym = CURRENCIES.find(c => c.code === fromCurrency)?.symbol ?? fromCurrency
  const toSym = CURRENCIES.find(c => c.code === toCurrency)?.symbol ?? toCurrency

  function fmtAmount(n: number, sym: string) {
    if (n === 0) return '—'
    return sym + Math.round(n).toLocaleString('en-GB')
  }

  return (
    <div className="space-y-6">

      {/* Rate status */}
      {ratesLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 text-blue-700 text-sm flex items-center gap-2">
          <RefreshCw size={14} className="animate-spin" /> Loading live exchange rates…
        </div>
      )}
      {ratesError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-amber-700 text-sm">
          Could not load live rates. Please refresh and try again.
        </div>
      )}
      {!ratesLoading && !ratesError && lastUpdated && (
        <div className="text-xs text-slate-400 text-right">
          Rates updated: {lastUpdated} · Source: open.er-api.com
        </div>
      )}

      {/* Input panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">

        {/* Amount + period */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Salary Amount</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 60000"
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 font-semibold text-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Period</label>
            <div className="flex rounded-xl border border-slate-300 overflow-hidden">
              {PERIODS.map(p => (
                <button
                  key={p.label}
                  onClick={() => setPeriod(p.label)}
                  className={`flex-1 py-3 text-xs font-semibold transition-colors ${
                    period === p.label ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Currency selectors */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">From</label>
            <select
              value={fromCurrency}
              onChange={e => setFromCurrency(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-500 text-sm"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={swapCurrencies}
            className="mb-0.5 p-3 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all"
            title="Swap currencies"
          >
            <RefreshCw size={16} className="text-slate-500" />
          </button>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">To</label>
            <select
              value={toCurrency}
              onChange={e => setToCurrency(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-500 text-sm"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {amountNum > 0 && !ratesLoading && !ratesError && Object.keys(rates).length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-900 px-6 py-4">
            <h3 className="text-white font-semibold">Conversion Result</h3>
          </div>

          <div className="p-6 space-y-4">
            {/* Main result */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <div className="text-sm text-blue-600 font-medium mb-1">{period} salary in {toCurrency}</div>
              <div className="text-4xl font-black text-blue-700 tracking-tight">
                {fmtAmount(convertedAnnual / (period === 'Annual' ? 1 : period === 'Monthly' ? 12 : period === 'Weekly' ? 52 : 260), toSym)}
              </div>
              <div className="text-xs text-blue-500 mt-1">
                = {fmtAmount(convertedAnnual, toSym)} annually
              </div>
            </div>

            {/* All periods */}
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_1fr] bg-slate-50 px-4 py-3">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Period</span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{fromCurrency}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{toCurrency}</span>
              </div>
              {PERIODS.map((p, i) => {
                const divisor = p.label === 'Annual' ? 1 : p.label === 'Monthly' ? 12 : p.label === 'Weekly' ? 52 : 260
                const fromAmt = annualAmount / divisor
                const toAmt = convertedAnnual / divisor
                return (
                  <div key={p.label}
                    className={`grid grid-cols-[1fr_1fr_1fr] px-4 py-3 items-center ${i > 0 ? 'border-t border-slate-100' : ''} ${p.label === period ? 'bg-blue-50' : ''}`}>
                    <span className={`text-sm font-medium ${p.label === period ? 'text-blue-700 font-bold' : 'text-slate-600'}`}>{p.label}</span>
                    <span className="font-mono text-sm text-slate-700">{fmtAmount(fromAmt, fromSym)}</span>
                    <span className="font-mono text-sm font-semibold text-slate-900">{fmtAmount(toAmt, toSym)}</span>
                  </div>
                )
              })}
            </div>

            {/* Exchange rate */}
            <p className="text-xs text-slate-400 text-center">
              1 {fromCurrency} = {rates[toCurrency] && rates[fromCurrency]
                ? (rates[toCurrency] / rates[fromCurrency]).toFixed(4)
                : '—'} {toCurrency} · Rates updated {lastUpdated}
            </p>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-slate-900 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-white font-semibold mb-1">Want the full payroll picture?</p>
          <p className="text-slate-400 text-sm">Use the global calculator to see net pay, tax, and employer costs for any country.</p>
        </div>
        <Link href="/payroll-tools/global-calculator/"
          className="shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-3 rounded-xl transition-colors text-sm">
          Open calculator <ArrowRight size={14} />
        </Link>
      </div>

    </div>
  )
}
