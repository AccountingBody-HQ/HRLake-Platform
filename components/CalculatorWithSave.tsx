'use client'

import { useState, useEffect } from 'react'
import Calculator from '@/components/Calculator'
import type { TaxBracket, SocialSecurityRate, CalculationResult } from '@/lib/calculator'

interface Props {
  countryCode: string
  countryName: string
  currencyCode: string
  taxBrackets: TaxBracket[]
  ssRates: SocialSecurityRate[]
  taxYear: number
  isAuthenticated: boolean
  initialSalary?: string
  initialPeriod?: 'monthly' | 'annual'
}

export default function CalculatorWithSave({
  countryCode,
  countryName,
  currencyCode,
  taxBrackets,
  ssRates,
  taxYear,
  isAuthenticated,
  initialSalary,
  initialPeriod,
}: Props) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const handleSaveRequest = async (result: CalculationResult, gross: number, period: 'monthly' | 'annual') => {
    setSaveStatus('saving')
    try {
      const res = await fetch('/api/save-calculation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country_code: countryCode,
          gross_salary: gross,
          period,
          label: `${countryName} — ${gross.toLocaleString()} ${currencyCode}`,
          calculation_result: result,
        }),
      })
      if (res.ok) {
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  return (
    <div>
      {saveStatus === 'saved' && (
        <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-5 py-3 text-sm font-medium text-green-800 flex items-center gap-2">
          ✓ Calculation saved — view it in your <a href="/dashboard/saved/" className="underline font-semibold">dashboard</a>
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-5 py-3 text-sm font-medium text-red-800">
          Failed to save. Please try again.
        </div>
      )}
      <Calculator
        countryCode={countryCode}
        countryName={countryName}
        currencyCode={currencyCode}
        taxBrackets={taxBrackets}
        ssRates={ssRates}
        taxYear={taxYear}
        isAuthenticated={isAuthenticated}
        onSaveRequest={handleSaveRequest}
        initialSalary={initialSalary}
        initialPeriod={initialPeriod}
      />
    </div>
  )
}
