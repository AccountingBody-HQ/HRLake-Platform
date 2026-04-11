import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { getCountryArticle } from '@/lib/sanity'
import { getBreadcrumbStructuredData, jsonLd as toJsonLd } from '@/lib/structured-data'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, AlertCircle, Building2, ChevronRight } from 'lucide-react'
import EORCostEstimator from '@/components/EORCostEstimator'
import CountrySubNav from '@/components/CountrySubNav'

// Updated for uniform template
export const dynamic = 'force-dynamic'

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
  const { data } = await supabase.schema('hrlake')
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

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params
  const countryData = await getCountry(country)
  if (!countryData) return { title: 'EOR Guide | HRLake' }
  return {
    title: `${countryData.name} EOR Guide — Employer of Record ${new Date().getFullYear()}`,
    description: `Employer of Record guide for ${countryData.name}. EOR availability, provider fees, compliance risks, and EOR vs direct employment comparison.`,
    alternates: { canonical: `https://hrlake.com/eor/${country.toLowerCase()}/` },
    openGraph: {
      title: `${countryData.name} EOR Guide — Employer of Record ${new Date().getFullYear()}`,
      description: `Employer of Record guide for ${countryData.name}. EOR availability, provider fees, compliance risks, and EOR vs direct employment comparison.`,
      url: `https://hrlake.com/eor/${country.toLowerCase()}/`,
      siteName: 'HRLake',
      type: 'website',
    },
  }
}

export default async function EORCountryPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params
  const [guide, countryData] = await Promise.all([
    getEORGuide(country),
    getCountry(country),
  ])

  const sanityArticle = guide && countryData
    ? await getCountryArticle(countryData.iso2, 'eor-guide').catch(() => null)
    : null

  if (!countryData) notFound()

  // Prepare guide data with fallbacks for consistent rendering
  const eorPros: string[] = guide?.eor_pros ?? [
    'Hire legally without incorporating a local company',
    'Fast time to hire — days rather than months',
    'All local tax, payroll, and HR obligations handled',
    'Employment liability sits with the EOR'
  ]
  const eorCons: string[] = guide?.eor_cons ?? [
    'Higher per-employee cost than direct employment',
    'Less control over local employment policies',
    'Dependency on third-party provider'
  ]
  const directPros: string[] = guide?.direct_pros ?? [
    'Full control over employment terms',
    'No provider markup costs at scale',
    'Direct relationship with employee'
  ]
  const directCons: string[] = guide?.direct_cons ?? [
    'Requires local legal entity',
    'Payroll bureau and HR overhead',
    'Liable for all compliance failures'
  ]
  const risks: { risk: string; detail: string; severity: string }[] = guide?.compliance_risks ?? []
  const keyFacts: { label: string; value: string }[] = guide?.key_facts ?? []

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(getBreadcrumbStructuredData([
          { name: 'Home', href: '/' },
          { name: 'EOR Hub', href: '/eor/' },
          { name: countryData.name + ' EOR Guide', href: '/eor/' + country.toLowerCase() + '/' },
        ])) }}
      />
      <main className="bg-white flex-1">
        <CountrySubNav code={countryData.iso2} countryName={countryData.name} />

        {/* ══════ HERO ══════ */}
        <section className="relative bg-slate-950 overflow-hidden">
          <div className="absolute inset-0" style={{background: 'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 0% 100%, rgba(14,30,80,0.4) 0%, transparent 50%)'}} />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-16">
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
              <Link href="/countries" className="hover:text-slate-300 transition-colors">Countries</Link>
              <ChevronRight size={13} className="text-slate-700" />
              <Link href="/eor/" className="hover:text-slate-300 transition-colors">EOR</Link>
              <ChevronRight size={13} className="text-slate-700" />
              <span className="text-slate-400">{countryData.name}</span>
            </nav>
            <div className="flex items-start gap-8">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={`https://flagcdn.com/40x30/${countryData.iso2.toLowerCase()}.png`}
                    alt={countryData.name}
                    width={40}
                    height={30}
                    className="rounded-sm shadow-sm"
                  />
                  <div>
                    <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white tracking-tight">{countryData.name}</h1>
                    <p className="text-slate-400 mt-1">Employer of Record Guide</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {guide ? (
                    <>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${riskColour[guide.risk_level]}`}>
                        {guide.risk_level} compliance risk
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border bg-blue-600/10 text-blue-300 border-blue-500/20">
                        {guide.eor_maturity} EOR market
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border bg-white/5 text-slate-300 border-white/10">
                        Hire speed: {guide.hire_speed}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border bg-amber-500/10 text-amber-300 border-amber-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Detailed EOR guide in preparation
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border bg-white/5 text-slate-300 border-white/10">
                        Hiring supported via EOR
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════ KEY FACTS ══════ */}
        <section className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            {guide && keyFacts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {keyFacts.map((f: { label: string; value: string }) => (
                  <div key={f.label} className="bg-white border border-slate-200 rounded-xl p-4">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{f.label}</p>
                    <p className="text-slate-900 font-bold text-sm leading-snug">{f.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-amber-700 text-sm font-semibold">Key facts will be available when the detailed guide is published</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ══════ RECOMMENDATION OR EOR EXPLAINER ══════ */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                {guide ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">What is an EOR?</p>
                    <div className="bg-blue-600 rounded-2xl p-8 text-white mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Building2 size={22} />
                        <h2 className="font-serif text-2xl font-bold">Hire in {countryData.name} without a local entity</h2>
                      </div>
                      <p className="text-blue-100 leading-relaxed">An Employer of Record (EOR) is a third-party organisation that legally employs workers on your behalf in {countryData.name}. The EOR handles all local compliance — contracts, payroll, social security, tax filings, and HR obligations — while you retain full day-to-day management of the employee.</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                      <p className="text-amber-700 text-xs font-bold uppercase tracking-widest mb-2">Guide in preparation</p>
                      <p className="text-amber-800 text-sm leading-relaxed">Our detailed {countryData.name} EOR guide — including provider fees, compliance risks, hire speed, and our recommendation — is being prepared and will be published shortly.</p>
                    </div>
                  </>
                )}
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
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                    <p className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                      <CheckCircle size={17} className="text-emerald-600" /> Direct employment advantages
                    </p>
                    <ul className="space-y-2.5">
                      {directPros.map((p: string) => (
                        <li key={p} className="flex gap-2.5 text-sm text-emerald-800">
                          <CheckCircle size={15} className="text-emerald-500 shrink-0 mt-0.5" />{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                    <p className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <AlertCircle size={17} className="text-amber-500" /> Direct employment limitations
                    </p>
                    <ul className="space-y-2.5">
                      {directCons.map((c: string) => (
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
              {guide ? 'Discuss each of these with your chosen provider before signing.' : 'Detailed compliance risks will be available when our guide is published.'}
            </p>
            {guide && risks.length > 0 ? (
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
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-amber-700 text-sm font-semibold">Compliance risk analysis coming soon</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ══════ COST ESTIMATOR ══════ */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">Cost Estimator</p>
            <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight mb-8">
              Estimate your {countryData.name} EOR cost.
            </h2>
            <EORCostEstimator defaultCountryCode={countryData.iso2} />
          </div>
        </section>

        {/* ══════ SANITY ARTICLE ══════ */}
        {guide && sanityArticle?.body && (
          <section className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
              <div className="max-w-3xl">
                <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">Full Guide</p>
                <h2 className="font-serif text-3xl font-bold text-slate-900 mb-8">
                  {countryData.name} EOR Guide — Deep Dive
                </h2>
                <div className="prose max-w-none">
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <PortableText value={sanityArticle.body} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══════ FOOTER CTA ══════ */}
        <section className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 mb-1">Need full payroll data for {countryData.name}?</p>
                <p className="text-slate-500 text-sm">Income tax brackets, social security rates, employment law, and payroll calculator.</p>
              </div>
              <div className="flex gap-3 shrink-0 flex-wrap">
                <Link href={`/countries/${country}/`}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-3 rounded-xl transition-colors text-sm">
                  {countryData.name} country page <ArrowRight size={14} />
                </Link>
                <Link href={`/countries/${country}/payroll-calculator/`}
                  className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-200 hover:text-blue-600 text-slate-700 font-semibold px-5 py-3 rounded-xl transition-colors text-sm">
                  Payroll Calculator <ArrowRight size={14} />
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
    </>
  )
}