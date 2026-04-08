import Link from 'next/link'
import { getBreadcrumbStructuredData, jsonLd as toJsonLd } from '@/lib/structured-data'
import { createClient } from '@supabase/supabase-js'
import EORCostEstimator from '@/components/EORCostEstimator'
import { ArrowRight, Building2, Globe, Shield, Zap, Clock, DollarSign, ChevronRight } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const EOR_VS_TABLE = [
  { factor: 'Speed to hire',        eor: 'Days to weeks',         direct: 'Months (entity setup)', peo: 'Weeks' },
  { factor: 'Local entity needed',  eor: 'No',                    direct: 'Yes',                   peo: 'You need one' },
  { factor: 'Compliance burden',    eor: 'On the EOR provider',   direct: 'On your team',          peo: 'Shared' },
  { factor: 'Cost',                 eor: '8–20% markup on cost',  direct: 'Full overhead',         peo: 'Fixed fee + admin' },
  { factor: 'Control',              eor: 'Limited',               direct: 'Full',                  peo: 'Moderate' },
  { factor: 'Best for',             eor: '1–20 employees',        direct: '20+ long-term',         peo: 'US only typically' },
  { factor: 'Risk',                 eor: 'Low (provider liable)',  direct: 'High (you liable)',     peo: 'Moderate' },
  { factor: 'Exit flexibility',     eor: 'High',                  direct: 'Low',                   peo: 'Moderate' },
]

const WHEN_TO_USE = [
  { icon: Zap,       title: 'Hiring fast in a new country',      body: 'EOR lets you place an employee in days, not the months it takes to set up a legal entity.' },
  { icon: Globe,     title: 'Testing a new market',              body: 'Before committing to a permanent entity and the costs that come with it, EOR is the low-risk entry point.' },
  { icon: Shield,    title: 'Avoiding compliance risk',          body: 'Labour law, payroll taxes, and termination rules vary enormously. Your EOR provider carries that liability.' },
  { icon: Clock,     title: 'Short-term or project-based roles', body: 'When you need someone for 6–24 months, EOR is almost always more cost-effective than entity setup.' },
  { icon: Building2, title: 'Small headcount per country',       body: 'Running a legal entity for one or two employees rarely makes financial sense. EOR solves this cleanly.' },
  { icon: DollarSign,title: 'Controlling upfront cost',         body: 'No setup fees, no accountants, no registered agents. EOR converts fixed overhead into variable cost.' },
]

const riskColour: Record<string, string> = {
  Low:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High:   'bg-red-50 text-red-700 border-red-200',
}
const speedColour: Record<string, string> = {
  Fast:   'text-emerald-600',
  Medium: 'text-amber-600',
  Slow:   'text-red-600',
}

export const metadata = {
  title: 'EOR Intelligence — Employer of Record Guides | HRLake',
  description: 'Employer of Record guides, cost estimators, compliance risk ratings, and hiring intelligence for 20 countries. The deepest EOR intelligence resource on the web.',
  alternates: { canonical: 'https://hrlake.com/eor/' },
}

async function getEORCountries() {
  const { data: guides } = await supabase.schema('hrlake')
    .from('eor_guides')
    .select('country_code, risk_level, hire_speed, recommendation_title')
    .eq('is_current', true)
    .order('country_code')

  const { data: countries } = await supabase
    .from('countries')
    .select('iso2, name, flag_emoji')

  const countryMap = Object.fromEntries((countries ?? []).map(c => [c.iso2, c]))

  return (guides ?? []).map(g => ({
    ...g,
    countryName: countryMap[g.country_code]?.name ?? g.country_code,
    flagEmoji: countryMap[g.country_code]?.flag_emoji ?? '',
  }))
}

export default async function EORHubPage() {
  const countries = await getEORCountries()

  return (
    <main className="bg-white flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(getBreadcrumbStructuredData([
          { name: 'Home', href: '/' },
          { name: 'EOR Intelligence', href: '/eor/' },
        ])) }}
      />

      {/* ══════ HERO ══════ */}
      <section className="relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0" style={{background: 'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 0% 100%, rgba(14,30,80,0.4) 0%, transparent 50%)'}} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
              <Building2 size={13} className="text-blue-400" />
              <span className="text-blue-300 text-xs font-semibold tracking-wide">The world's most comprehensive EOR intelligence</span>
            </div>
            <h1 className="font-serif text-4xl lg:text-6xl font-bold text-white leading-[1.08] mb-8" style={{letterSpacing: '-0.025em'}}>
              The deep source for<br /><span className="text-blue-400">EOR intelligence</span><br />worldwide.
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mb-10">
              The most comprehensive Employer of Record intelligence platform on the web. Cost modelling, compliance risk ratings, hiring guides, and country-by-country EOR data — everything EOR firms and global employers need in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#estimator" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-sm">
                Open cost estimator <ArrowRight size={15} />
              </a>
              <a href="#countries" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm">
                Browse countries
              </a>
            </div>
          </div>
          <div className="mt-16 pt-10 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: '20',    label: 'Countries',      sub: 'Full EOR guides live' },
              { value: '8–20%', label: 'Typical markup', sub: 'On employer cost' },
              { value: 'Days',  label: 'To hire via EOR', sub: 'vs months direct' },
              { value: 'Free',  label: 'EOR intelligence', sub: 'No account needed' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black text-white tracking-tight">{s.value}</div>
                <div className="text-sm font-bold text-slate-300 mt-1">{s.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ WHAT IS EOR ══════ */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">Explained</p>
              <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
                What is an Employer of Record?
              </h2>
              <div className="space-y-5 text-slate-600 leading-relaxed">
                <p>An <strong className="text-slate-900">Employer of Record (EOR)</strong> is a third-party company that legally employs workers on your behalf in a country where you have no legal entity. You direct the work. The EOR handles the employment contract, payroll, taxes, benefits, and compliance.</p>
                <p>The EOR becomes the legal employer on paper. Your company retains full operational control — you set the job scope, working hours, and performance expectations. The EOR takes on the compliance liability.</p>
                <p>EOR is not the same as a staffing agency. The workers are dedicated entirely to your organisation. They are not shared or placed on short contracts by default. EOR is a permanent hiring solution for companies that have not yet set up a local entity.</p>
              </div>
              <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-blue-900 font-semibold text-sm mb-2">The key distinction</p>
                <p className="text-blue-700 text-sm leading-relaxed">With direct employment, your company is legally responsible for every payroll error, missed filing, and wrongful termination claim. With EOR, that liability transfers to the provider — who specialises in exactly this.</p>
              </div>
            </div>
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">When to use EOR</p>
              <div className="grid gap-4">
                {WHEN_TO_USE.map(item => (
                  <div key={item.title} className="flex gap-4 p-5 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                    <div className="bg-blue-600 text-white w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
                      <item.icon size={17} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm mb-1">{item.title}</p>
                      <p className="text-slate-500 text-sm leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ COMPARISON TABLE ══════ */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="mb-12">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Comparison</p>
            <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight leading-tight">EOR vs Direct Employment vs PEO.</h2>
            <p className="text-slate-500 mt-4 max-w-2xl leading-relaxed">Three models for employing people internationally. Each has its place — the right choice depends on headcount, timeline, and how long you plan to operate in the market.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="hidden lg:grid grid-cols-[2fr_1.5fr_1.5fr_1.5fr] bg-slate-900 px-6 py-4">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Factor</span>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">EOR</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Direct Employment</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">PEO</span>
            </div>
            {EOR_VS_TABLE.map((row, i) => (
              <div key={row.factor} className={`grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1.5fr_1.5fr] gap-2 lg:gap-0 px-6 py-4 ${i > 0 ? 'border-t border-slate-100' : ''} hover:bg-blue-50/40 transition-colors`}>
                <span className="font-bold text-slate-900 text-sm lg:flex lg:items-center">{row.factor}</span>
                <span className="text-sm text-blue-700 font-semibold lg:flex lg:items-center"><span className="lg:hidden text-xs text-slate-400 font-normal mr-1">EOR: </span>{row.eor}</span>
                <span className="text-sm text-slate-600 lg:flex lg:items-center"><span className="lg:hidden text-xs text-slate-400 font-normal mr-1">Direct: </span>{row.direct}</span>
                <span className="text-sm text-slate-600 lg:flex lg:items-center"><span className="lg:hidden text-xs text-slate-400 font-normal mr-1">PEO: </span>{row.peo}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-400 text-xs mt-4">PEO (Professional Employer Organisation) is a co-employment model, primarily used in the US. EOR is the global equivalent and does not require a local entity.</p>
        </div>
      </section>

      {/* ══════ EOR COST ESTIMATOR ══════ */}
      <section id="estimator" className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="mb-12">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Cost Estimator</p>
            <div className="flex items-end justify-between gap-6">
              <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight leading-tight">Estimate your EOR cost<br />before you commit.</h2>
              <p className="hidden lg:block text-slate-500 max-w-md leading-relaxed">Select a country, enter your headcount and average salary. We calculate the estimated total employer cost including social security, taxes, and the EOR provider markup.</p>
            </div>
          </div>
          <EORCostEstimator />
        </div>
      </section>

      {/* ══════ COUNTRY GRID — live from Supabase ══════ */}
      <section id="countries" className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="mb-12">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">By Country</p>
            <div className="flex items-end justify-between">
              <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight leading-tight">Browse EOR guides by country.</h2>
              <Link href="/countries/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm">All countries <ArrowRight size={15} /></Link>
            </div>
            <p className="text-slate-500 mt-4 max-w-2xl leading-relaxed">Compliance risk levels, typical hire speed, and EOR recommendations for all 20 active countries.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {countries.map((c: any) => (
                <Link key={c.country_code} href={`/eor/${c.country_code.toLowerCase()}/`}
                  className="group bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg rounded-2xl p-6 transition-all duration-200 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.flagEmoji}</span>
                      <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{c.countryName}</span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${riskColour[c.risk_level]}`}>{c.risk_level} risk</span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed flex-1">{c.recommendation_title}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Speed: <span className={`font-bold ${speedColour[c.hire_speed]}`}>{c.hire_speed}</span></span>
                    <span className="flex items-center gap-1 text-blue-600 text-xs font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">Full guide <ChevronRight size={11} /></span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* ══════ CTA ══════ */}
      <section className="relative overflow-hidden" style={{backgroundColor: '#0d1f3c'}}>
        <div className="absolute inset-0" style={{background: 'radial-gradient(ellipse at 80% 50%, rgba(30,111,255,0.12) 0%, transparent 60%)'}} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 text-center">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">Go deeper</p>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6">Need the full payroll picture?</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">Every country page includes full income tax brackets, social security rates, employment law, and a detailed payroll calculator.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/countries/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-4 rounded-xl transition-colors">Browse all countries <ArrowRight size={15} /></Link>
            <Link href="/payroll-tools/" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-7 py-4 rounded-xl transition-colors">Payroll calculators</Link>
          </div>
        </div>
      </section>

    </main>
  )
}
