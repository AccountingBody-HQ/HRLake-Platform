import { createClient } from '@supabase/supabase-js'
import { getComparisonStructuredData, jsonLd } from '@/lib/structured-data'
import CompareClient from './CompareClient'

export const metadata = {
  title: 'Country Comparison Tool — Employer Cost Side-by-Side | GlobalPayrollExpert',
  description: 'Compare employer costs, tax rates, and employment law side-by-side for any two countries. Free payroll comparison tool.',
}

export const dynamic = 'force-dynamic'

export default async function ComparePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: countries } = await supabase
    .from('countries')
    .select('iso2, name, currency_code, flag_emoji')
    .order('name', { ascending: true })

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(getComparisonStructuredData([
          { name: 'United Kingdom', code: 'gb' },
          { name: 'United States', code: 'us' },
        ])) }}
      />

      {/* Hero */}
      <section className="relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%)' }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-blue-300 text-xs font-semibold tracking-wide">Country Comparison Tool</span>
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white leading-tight mb-5" style={{ letterSpacing: '-0.025em' }}>
              Compare employer costs<br />across <span className="text-blue-400">two countries</span>.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
              Select two countries and a salary to see a full side-by-side breakdown — income tax, social security, employment law, and total employer cost.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison tool */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <CompareClient countries={countries ?? []} />
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-amber-800 text-sm leading-relaxed">
              <span className="font-bold">Disclaimer:</span> All figures are for indicative purposes only and are sourced from official government publications. Tax rules are complex and vary by individual circumstances. Always consult a qualified payroll professional before making hiring decisions.
            </p>
          </div>
        </div>
      </section>

    </main>
  )
}
