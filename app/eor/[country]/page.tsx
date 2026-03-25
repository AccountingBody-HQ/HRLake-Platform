import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, AlertCircle, Building2, ChevronRight } from 'lucide-react'
import EORCostEstimator from '@/components/EORCostEstimator'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const riskColour: Record<string, string> = {
  Low:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High:   'bg-red-50 text-red-700 border-red-200',
}
const severityColour: Record<string, string> = {
  High:   'border-l-red-500 bg-red-50',
  Medium: 'border-l-amber-500 bg-amber-50',
  Low:    'border-l-blue-400 bg-blue-50',
}
const severityBadge: Record<string, string> = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low:    'bg-blue-100 text-blue-700',
}

async function getEORGuide(countryCode: string) {
  const { data } = await supabase.schema('gpe')
    .from('eor_guides')
    .select('*')
    .eq('country_code', countryCode.toUpperCase())
    .eq('is_current', true)
    .maybeSingle()
  return data ?? null
}

async function getCountry(countryCode: string) {
  const { data } = await supabase
    .from('countries')
    .select('name, flag_emoji, iso2')
    .eq('iso2', countryCode.toUpperCase())
    .maybeSingle()
  return data ?? null
}

export async function generateStaticParams() {
  const { data } = await supabase.schema('gpe')
    .from('eor_guides')
    .select('country_code')
    .eq('is_current', true)
  return (data ?? []).map(row => ({ country: row.country_code.toLowerCase() }))
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params
  const countryData = await getCountry(country)
  if (!countryData) return { title: 'EOR Guide | GlobalPayrollExpert' }
  return {
    title: `EOR Guide: ${countryData.name} | GlobalPayrollExpert`,
    description: `Employer of Record guide for ${countryData.name}. EOR availability, provider fees, compliance risks, and EOR vs direct employment comparison.`,
  }
}

export default async function EORCountryPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params
  const [guide, countryData] = await Promise.all([
    getEORGuide(country),
    getCountry(country),
  ])

  if (!guide || !countryData) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <p className="text-5xl mb-6">🌍</p>
          <h1 className="font-serif text-3xl font-bold text-slate-900 mb-4">EOR guide coming soon</h1>
          <p className="text-slate-500 mb-8">We are building detailed EOR guides for all 195 countries. This one is in progress.</p>
          <Link href="/eor/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
            <ArrowLeft size={15} /> Back to EOR hub
          </Link>
        </div>
      </main>
    )
  }

  const eorPros: string[]    = guide.eor_pros ?? []
  const eorCons: string[]    = guide.eor_cons ?? []
  const directPros: string[] = guide.direct_pros ?? []
  const directCons: string[] = guide.direct_cons ?? []
  const risks: { risk: string; detail: string; severity: string }[] = guide.compliance_risks ?? []
  const keyFacts: { label: string; value: string }[] = guide.key_facts ?? []

  return (
    <main className="min-h-screen bg-white">

      {/* ══════ HERO ══════ */}
      <section className="relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0" style={{background: 'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%)'}} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16">
          <Link href="/eor/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium mb-8 transition-colors">
            <ArrowLeft size={15} /> EOR Intelligence
          </Link>
          <div className="flex items-start gap-8">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">{countryData.flag_emoji}</span>
                <div>
                  <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white tracking-tight">{countryData.name}</h1>
                  <p className="text-slate-400 mt-1">Employer of Record Guide</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${riskColour[guide.risk_level]}`}>
                  {guide.risk_level} compliance risk
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border bg-blue-600/10 text-blue-300 border-blue-500/20">
                  {guide.eor_maturity} EOR market
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border bg-white/5 text-slate-300 border-white/10">
                  Hire speed: {guide.hire_speed}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ BREADCRUMB ══════ */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/eor/" className="hover:text-slate-300 transition-colors">EOR</Link>
          <ChevronRight size={12} />
          <span className="text-slate-400">{countryData.name}</span>
        </div>
      </div>

      {/* ══════ KEY FACTS ══════ */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {keyFacts.map((f: { label: string; value: string }) => (
              <div key={f.label} className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{f.label}</p>
                <p className="text-slate-900 font-bold text-sm leading-snug">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ RECOMMENDATION ══════ */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">Our Recommendation</p>
              <div className="bg-blue-600 rounded-2xl p-8 text-white mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 size={22} />
                  <h2 className="font-serif text-2xl font-bold">{guide.recommendation_title}</h2>
                </div>
                <p className="text-blue-100 leading-relaxed">{guide.recommendation_detail}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <p className="text-slate-700 text-sm font-bold mb-4">EOR provider fee range for {countryData.name}</p>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-black text-slate-900">{guide.provider_fee_low}–{guide.provider_fee_high}%</span>
                  <span className="text-slate-500 text-sm pb-1">on top of total employer cost</span>
                </div>
                <p className="text-slate-400 text-xs mt-3">
                  Rates vary by provider, headcount, and benefits scope. Always request itemised quotes from at least three providers.
                </p>
              </div>
            </div>
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">EOR vs Direct Employment</p>
              <div className="grid gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <p className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <CheckCircle size={17} className="text-blue-600" /> EOR advantages in {countryData.name}
                  </p>
                  <ul className="space-y-2.5">
                    {eorPros.map((p: string) => (
                      <li key={p} className="flex gap-2.5 text-sm text-blue-800">
                        <CheckCircle size={15} className="text-blue-500 shrink-0 mt-0.5" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <p className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <AlertCircle size={17} className="text-amber-500" /> EOR limitations in {countryData.name}
                  </p>
                  <ul className="space-y-2.5">
                    {eorCons.map((c: string) => (
                      <li key={c} className="flex gap-2.5 text-sm text-slate-600">
                        <XCircle size={15} className="text-slate-400 shrink-0 mt-0.5" />{c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ COMPLIANCE RISKS ══════ */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">Compliance Risks</p>
          <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Key EOR compliance risks in {countryData.name}.
          </h2>
          <p className="text-slate-500 mb-10 max-w-2xl">
            Discuss each of these with your chosen provider before signing.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {risks.map((r: { risk: string; detail: string; severity: string }) => (
              <div key={r.risk} className={`border-l-4 rounded-r-2xl p-6 ${severityColour[r.severity]}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="font-bold text-slate-900 text-sm">{r.risk}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${severityBadge[r.severity]}`}>
                    {r.severity}
                  </span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{r.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ COST ESTIMATOR ══════ */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">Cost Estimator</p>
          <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight mb-8">
            Estimate your {countryData.name} EOR cost.
          </h2>
          <EORCostEstimator />
        </div>
      </section>

      {/* ══════ FOOTER CTA ══════ */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 mb-1">Need full payroll data for {countryData.name}?</p>
              <p className="text-slate-500 text-sm">Income tax brackets, social security rates, employment law, and payroll calculator.</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href={`/countries/${country}/`}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-3 rounded-xl transition-colors text-sm">
                {countryData.name} country page <ArrowRight size={14} />
              </Link>
              <Link href="/eor/"
                className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-5 py-3 rounded-xl transition-colors text-sm">
                <ArrowLeft size={14} /> All EOR guides
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
