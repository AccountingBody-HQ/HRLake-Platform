'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import CalculatorWithSave from '@/components/CalculatorWithSave'
import type { TaxBracket, SocialSecurityRate } from '@/lib/calculator'
import { useUser } from '@clerk/nextjs'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Country {
  iso2: string
  name: string
  currency_code: string
  flag_emoji: string
}

interface Props {
  countries: Country[]
}

export default function GlobalCalculatorClient({ countries }: Props) {
  const [selectedCode, setSelectedCode] = useState<string>('GB')
  const [taxBrackets, setTaxBrackets] = useState<TaxBracket[]>([])
  const [ssRates, setSsRates] = useState<SocialSecurityRate[]>([])
  const [loading, setLoading] = useState(false)

  const selected = countries.find(c => c.iso2 === selectedCode)
  const { isSignedIn } = useUser()

  useEffect(() => {
    if (!selectedCode) return
    setLoading(true)
    setTaxBrackets([])
    setSsRates([])

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function fetchData() {
      const [bracketsRes, ssRes] = await Promise.all([
        supabase
          .schema('gpe')
          .from('tax_brackets')
          .select('bracket_order, lower_limit, upper_limit, rate, bracket_name')
          .eq('country_code', selectedCode)
          .eq('is_current', true)
          .eq('tier', 'free')
          .order('bracket_order', { ascending: true }),
        supabase
          .schema('gpe')
          .from('social_security')
          .select('contribution_type, employer_rate, employee_rate, employer_cap_annual, employee_cap_annual, applies_above, applies_below')
          .eq('country_code', selectedCode)
          .eq('is_current', true),
      ])

      setTaxBrackets(
        (bracketsRes.data ?? []).map(b => ({
          bracket_order: b.bracket_order,
          lower_limit: Number(b.lower_limit),
          upper_limit: b.upper_limit !== null ? Number(b.upper_limit) : null,
          rate: Number(b.rate),
          bracket_name: b.bracket_name,
        }))
      )
      setSsRates(
        (ssRes.data ?? []).flatMap(s => [
          {
            contribution_type: 'employer',
            rate_percent: Number(s.employer_rate),
            cap_amount: s.employer_cap_annual !== null ? Number(s.employer_cap_annual) : null,
            applies_above: s.applies_above !== null ? Number(s.applies_above) : null,
            applies_below: s.applies_below !== null ? Number(s.applies_below) : null,
            description: s.contribution_type,
          },
          {
            contribution_type: 'employee',
            rate_percent: Number(s.employee_rate),
            cap_amount: s.employee_cap_annual !== null ? Number(s.employee_cap_annual) : null,
            applies_above: s.applies_above !== null ? Number(s.applies_above) : null,
            applies_below: s.applies_below !== null ? Number(s.applies_below) : null,
            description: s.contribution_type,
          },
        ])
      )
      setLoading(false)
    }

    fetchData()
  }, [selectedCode])

  return (
    <div className="grid gap-10 lg:grid-cols-3">

      {/* Left — selector + calculator */}
      <div className="lg:col-span-2 space-y-6">

        {/* Country selector */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Select Country
          </label>
          <select
            value={selectedCode}
            onChange={e => setSelectedCode(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-500 text-sm"
          >
            {countries.map(c => (
              <option key={c.iso2} value={c.iso2}>
                {c.name} ({c.currency_code})
              </option>
            ))}
          </select>
          {selected && (
            <p className="text-xs text-slate-400 mt-2">
              Showing {selected.name} · {selected.currency_code} · Switch country above to recalculate
            </p>
          )}
        </div>

        {/* Calculator */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="text-slate-400 text-sm">Loading {selected?.name} tax data…</div>
          </div>
        ) : selected ? (
          <CalculatorWithSave
            countryCode={selectedCode}
            countryName={selected.name}
            currencyCode={selected.currency_code}
            taxBrackets={taxBrackets}
            ssRates={ssRates}
            taxYear={new Date().getFullYear()}
            isAuthenticated={!!isSignedIn}
          />
        ) : null}
      </div>

      {/* Right — sidebar */}
      <div className="space-y-5">

        {/* About */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">About This Tool</p>
          <ul className="space-y-3 text-sm text-slate-600">
            {[
              'Switch between any country instantly',
              'Full income tax bracket breakdown',
              'Employer and employee social security',
              'Monthly and annual view',
              'Download results as PDF',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Per-country link */}
        {selected && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">
              {selected.name} Detail
            </p>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              View the full {selected.name} country profile — employment law, tax guide, EOR intelligence, and hiring guide.
            </p>
            <Link
              href={`/countries/${selectedCode.toLowerCase()}/`}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              View {selected.name} profile <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* Compare CTA */}
        <div className="bg-slate-900 rounded-2xl p-6">
          <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-3">Compare Tool</p>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            Compare employer costs side-by-side for two countries at the same salary.
          </p>
          <Link
            href="/compare/"
            className="flex items-center gap-2 text-sm font-semibold text-white hover:text-blue-300 transition-colors"
          >
            Open comparison tool <ArrowRight size={13} />
          </Link>
        </div>

      </div>
    </div>
  )
}
