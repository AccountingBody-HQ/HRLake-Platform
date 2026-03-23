'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Calculator, ArrowRight } from 'lucide-react'

interface TaxBracket {
  min_income: number
  max_income: number | null
  rate_percent: number
  bracket_label: string | null
}

interface SocialSecurityRow {
  contribution_type: string
  rate_percent: number
  cap_amount: number | null
  description: string | null
}

interface MiniCalculatorProps {
  countryCode: string
  countryName: string
  currency: string | null
  taxBrackets: TaxBracket[]
  socialSecurity: SocialSecurityRow[]
  minimumWage: number | null
  payrollFrequency: string | null
}

function formatCurrency(amount: number, currency: string | null): string {
  const code = currency ?? 'USD'
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency', currency: code, maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return code + ' ' + amount.toLocaleString()
  }
}

function calcIncomeTax(annualGross: number, brackets: TaxBracket[]): number {
  if (!brackets.length) return 0
  let tax = 0
  for (const bracket of brackets) {
    const min = bracket.min_income ?? 0
    const max = bracket.max_income ?? Infinity
    const rate = (bracket.rate_percent ?? 0) / 100
    if (annualGross <= min) continue
    const taxableInBracket = Math.min(annualGross, max) - min
    tax += taxableInBracket * rate
  }
  return Math.max(0, tax)
}

function calcSS(annualGross: number, rows: SocialSecurityRow[], type: 'employee' | 'employer'): number {
  const matched = rows.filter(r => r.contribution_type?.toLowerCase().includes(type))
  let total = 0
  for (const row of matched) {
    const rate = (row.rate_percent ?? 0) / 100
    const base = row.cap_amount ? Math.min(annualGross, row.cap_amount) : annualGross
    total += base * rate
  }
  return Math.max(0, total)
}

export default function MiniCalculator({
  countryCode,
  countryName,
  currency,
  taxBrackets,
  socialSecurity,
  minimumWage,
}: MiniCalculatorProps) {
  const [grossInput, setGrossInput] = useState('50000')
  const [period, setPeriod] = useState<'annual' | 'monthly'>('annual')

  const gross = parseFloat(grossInput.replace(/,/g, '')) || 0
  const annualGross = period === 'monthly' ? gross * 12 : gross

  const incomeTax = calcIncomeTax(annualGross, taxBrackets)
  const employeeSS = calcSS(annualGross, socialSecurity, 'employee')
  const employerSS = calcSS(annualGross, socialSecurity, 'employer')
  const netPay = annualGross - incomeTax - employeeSS
  const totalEmployerCost = annualGross + employerSS
  const effectiveRate = annualGross > 0 ? ((incomeTax + employeeSS) / annualGross) * 100 : 0

  const display = useCallback((amount: number) => {
    const val = period === 'monthly' ? amount / 12 : amount
    return formatCurrency(val, currency)
  }, [period, currency])

  const hasData = taxBrackets.length > 0 || socialSecurity.length > 0

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white w-9 h-9 rounded-xl flex items-center justify-center">
            <Calculator size={18} />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Quick Payroll Calculator</p>
            <p className="text-slate-400 text-xs">{countryName} - Estimates only</p>
          </div>
        </div>
        <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
          {(['annual', 'monthly'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={'px-3 py-1.5 rounded-md text-xs font-semibold transition-all ' + (period === p ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white')}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Gross salary ({period})
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
              {currency ?? '$'}
            </span>
            <input
              type="number"
              value={grossInput}
              onChange={e => setGrossInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl text-slate-900 font-bold text-lg outline-none transition-all"
              placeholder="50000"
              min={0}
            />
          </div>
          {minimumWage && (
            <p className="text-xs text-slate-400 mt-1.5">
              Minimum wage: {formatCurrency(minimumWage, currency)} / year
            </p>
          )}
        </div>

        {!hasData && (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">Calculator data not yet available for this country.</p>
          </div>
        )}

        {hasData && (
          <div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-slate-500 font-medium">Gross salary</span>
                <span className="font-bold text-slate-900">{display(annualGross)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-500">Income tax</span>
                <span className="font-semibold text-red-600">- {display(incomeTax)}</span>
              </div>
              {employeeSS > 0 && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-500">Employee social security</span>
                  <span className="font-semibold text-red-600">- {display(employeeSS)}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-3 border-t-2 border-slate-900 mt-1">
                <span className="text-sm font-bold text-slate-900">Net take-home pay</span>
                <span className="font-black text-lg text-emerald-600">{display(netPay)}</span>
              </div>
              <div className="flex items-center justify-between py-2 bg-slate-50 rounded-xl px-4">
                <span className="text-xs text-slate-500 font-medium">Effective deduction rate</span>
                <span className="text-sm font-bold text-slate-700">{effectiveRate.toFixed(1)}%</span>
              </div>
              {employerSS > 0 && (
                <div className="flex items-center justify-between py-2 bg-blue-50 rounded-xl px-4">
                  <span className="text-xs text-blue-700 font-medium">Total employer cost</span>
                  <span className="text-sm font-bold text-blue-800">{display(totalEmployerCost)}</span>
                </div>
              )}
            </div>
            <Link
              href={'/countries/' + countryCode.toLowerCase() + '/payrollcalculator/'}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
            >
              Full breakdown calculator <ArrowRight size={15} />
            </Link>
            <p className="text-center text-xs text-slate-400 mt-3">
              Estimates only - Not professional tax advice
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
