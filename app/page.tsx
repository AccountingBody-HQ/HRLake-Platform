import { getInsightArticles } from '@/lib/sanity'
export const dynamic = 'force-dynamic'
import { getAllCountries } from '@/lib/supabase-queries'
import Link from 'next/link'
import { getHomepageStructuredData, jsonLd } from '@/lib/structured-data'
import SearchBar from '@/components/SearchBar'
import EmailCapture from '@/components/EmailCapture'
import {
  Globe, Calculator, Building2, Shield, ArrowRight, ChevronRight,
  Lock, RefreshCw, Award, TrendingUp
} from 'lucide-react'

const FEATURED_COUNTRIES = [
  { code: 'gb', name: 'United Kingdom', income: '20–45%', ss_employer: '13.8%',  currency: 'GBP' },
  { code: 'us', name: 'United States',  income: '10–37%', ss_employer: '7.65%',  currency: 'USD' },
  { code: 'de', name: 'Germany',        income: '14–45%', ss_employer: '~20%',   currency: 'EUR' },
  { code: 'fr', name: 'France',         income: '0–45%',  ss_employer: '~30%',   currency: 'EUR' },
  { code: 'sg', name: 'Singapore',      income: '0–22%',  ss_employer: '17%',    currency: 'SGD' },
  { code: 'ae', name: 'UAE',            income: '0%',     ss_employer: '12.5%',  currency: 'AED' },
  { code: 'au', name: 'Australia',      income: '0–45%',  ss_employer: '11%',    currency: 'AUD' },
  { code: 'ch', name: 'Switzerland',    income: '0–11.5%',ss_employer: '~10%',   currency: 'CHF' },
  { code: 'ca', name: 'Canada',         income: '15–33%', ss_employer: '~7.5%',  currency: 'CAD' },
  { code: 'nl', name: 'Netherlands',    income: '9–49.5%',ss_employer: '~19%',   currency: 'EUR' },
  { code: 'jp', name: 'Japan',          income: '5–45%',  ss_employer: '~16%',   currency: 'JPY' },
]

const PREVIEW_COUNTRIES = [
  { code: 'gb', name: 'United Kingdom', tax: '20–45%', ss: '13.8%' },
  { code: 'de', name: 'Germany',        tax: '14–45%', ss: '~20%'  },
  { code: 'sg', name: 'Singapore',      tax: '0–22%',  ss: '17%'   },
  { code: 'us', name: 'United States',  tax: '10–37%', ss: '7.65%' },
  { code: 'ae', name: 'UAE',            tax: '0%',     ss: '12.5%' },
]

const REGION_MAP: Record<string, string> = {
  be: 'europe', dk: 'europe', fr: 'europe', de: 'europe', ie: 'europe',
  it: 'europe', nl: 'europe', no: 'europe', pl: 'europe', pt: 'europe',
  es: 'europe', se: 'europe', ch: 'europe', gb: 'europe',
  br: 'americas', ca: 'americas', co: 'americas', us: 'americas',
  au: 'asia-pacific', jp: 'asia-pacific', sg: 'asia-pacific',
  ae: 'middle-east',
  et: 'africa',
}

const REGION_LABELS = [
  { name: 'Europe',       slug: 'europe' },
  { name: 'Americas',     slug: 'americas' },
  { name: 'Asia Pacific', slug: 'asia-pacific' },
  { name: 'Middle East',  slug: 'middle-east' },
  { name: 'Africa',       slug: 'africa' },
]

const CAPABILITIES = [
  {
    icon: Globe,
    title: 'Country Employment Data',
    body: 'Income tax brackets, employer contributions, employment obligations, and statutory requirements — every jurisdiction, one authoritative source.',
    href: '/countries/',
    cta: 'Browse countries',
    accent: 'bg-blue-50 text-blue-700',
    border: 'hover:border-blue-300',
    top: 'bg-blue-600',
  },
  {
    icon: Calculator,
    title: 'Payroll Calculator',
    body: 'Net pay, employer on-costs, income tax, and social security — full line-by-line cost breakdowns for 20 countries and growing.',
    href: '/payroll-tools/',
    cta: 'Open calculator',
    accent: 'bg-indigo-50 text-indigo-700',
    border: 'hover:border-indigo-300',
    top: 'bg-indigo-600',
  },
  {
    icon: Building2,
    title: 'EOR Intelligence',
    body: 'Employer of Record cost modelling, total employment cost estimators, and hiring guides for entity-free international hiring.',
    href: '/eor/',
    cta: 'Explore EOR',
    accent: 'bg-teal-50 text-teal-700',
    border: 'hover:border-teal-300',
    top: 'bg-teal-600',
  },
  {
    icon: Shield,
    title: 'Employment Law',
    body: 'Minimum wage, statutory leave, notice periods, probation rules, overtime, and termination obligations — by country.',
    href: '/hr-compliance/',
    cta: 'View guides',
    accent: 'bg-sky-50 text-sky-700',
    border: 'hover:border-sky-300',
    top: 'bg-sky-600',
  },
]

const STANDARDS = [
  { icon: Award,      title: 'Government-sourced',     body: 'Every data point traced to an official tax authority or government publication.' },
  { icon: RefreshCw,  title: 'Updated monthly',        body: 'Employment rates and statutory thresholds reviewed on a rolling monthly cycle.' },
  { icon: Lock,       title: 'Expert verified',        body: 'Data reviewed by qualified HR and employment law professionals before publication.' },
  { icon: TrendingUp, title: 'Continuously expanding', body: 'Coverage growing continuously toward our target of 57 countries.' },
]

const UPDATE_ITEMS = [
  'Monthly employment rate changes by country',
  'New country data as it is published',
  'HR compliance alerts and law changes',
  'EOR market intelligence and cost updates',
]

export default async function HomePage() {
  const insights = await getInsightArticles({ limit: 3 })
  const countries = await getAllCountries()
  const regionCounts = countries.reduce((acc: Record<string, number>, c: any) => {
    const region = REGION_MAP[(c.iso2 ?? '').toLowerCase()]
    if (region) acc[region] = (acc[region] || 0) + 1
    return acc
  }, {})
  const REGIONS = REGION_LABELS
    .map(r => ({ ...r, count: regionCounts[r.slug] || 0 }))
    .filter(r => r.count > 0)
  const dynamicCapabilities = CAPABILITIES.map(cap =>
    cap.title === 'Payroll Calculator'
      ? { ...cap, body: `Net pay, employer on-costs, income tax, and social security — full line-by-line cost breakdowns for ${countries.length} countries and growing.` }
      : cap
  )

  return (
    <main className="bg-white flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(getHomepageStructuredData()) }}
      />

      {/* HERO */}
      <section className="relative bg-slate-950 overflow-hidden">

        {/* Background depth layers */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 65% 0%, rgba(30,111,255,0.13) 0%, transparent 55%), radial-gradient(ellipse at 0% 100%, rgba(14,30,80,0.5) 0%, transparent 50%)' }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(rgba(148,187,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(148,187,255,0.8) 1px, transparent 1px)', backgroundSize: '72px 72px' }} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20">
          <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-16 items-center">

            {/* Left — copy */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-blue-300 text-xs font-semibold tracking-wide">
                  Where HR, EOR and payroll knowledge dives deep
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-serif text-4xl lg:text-6xl font-bold text-white leading-[1.08] mb-6"
                style={{ letterSpacing: '-0.025em' }}>
                The deep source for<br />
                <span className="text-blue-400">global HR</span><br />
                intelligence.
              </h1>

              {/* Subheading */}
              <p className="text-lg text-slate-400 leading-relaxed max-w-xl mb-8">
                <span className="sm:hidden">Employment data, payroll calculations, and EOR intelligence for {countries.length} countries — free to access.</span>
                <span className="hidden sm:inline">Country employment data, payroll calculations, and EOR intelligence
                for {countries.length} countries and growing — the reference platform for HR directors,
                global law firms, EOR providers, and finance teams worldwide.</span>
              </p>

              {/* Trust strip */}
              <div className="mb-10">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-widest block mb-3">Trusted by</span>
                <div className="flex flex-wrap items-center gap-2">
                {['EOR Providers', 'Global Law Firms', 'HR Directors', 'Finance Teams', 'Payroll Consultants'].map(label => (
                  <span key={label}
                    className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-white/10 border border-white/15 rounded-full px-2.5 py-1">
                    <span className="w-1 h-1 rounded-full bg-blue-400/70 shrink-0" />
                    {label}
                  </span>
                ))}
                </div>
              </div>

              {/* Search */}
              <div className="max-w-xl mb-8">
                <SearchBar variant="hero" placeholder="Search any country, employment guide, or topic…" />
              </div>

              {/* Quick nav */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mb-10">
                <Link href="/countries/"
                  className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 rounded-xl px-4 py-3.5 transition-all group">
                  <Globe size={16} className="text-blue-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors whitespace-nowrap">Country Data</span>
                </Link>
                <Link href="/payroll-tools/"
                  className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 rounded-xl px-4 py-3.5 transition-all group">
                  <Calculator size={16} className="text-blue-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors whitespace-nowrap">Payroll Calculator</span>
                </Link>
                <Link href="/eor/"
                  className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 rounded-xl px-4 py-3.5 transition-all group">
                  <Building2 size={16} className="text-blue-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors whitespace-nowrap">EOR Intelligence</span>
                </Link>
                <Link href="/hr-compliance/"
                  className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 rounded-xl px-4 py-3.5 transition-all group">
                  <Shield size={16} className="text-blue-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors whitespace-nowrap">Employment Law</span>
                </Link>
              </div>

              {/* Region pills */}
              <div className="pt-2">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-3">Browse by region:</span>
                <div className="flex flex-wrap items-center gap-2">
                {REGIONS.filter(r => r.count > 0).map(r => (
                  <Link key={r.slug} href={`/countries/?region=${r.slug}`}
                    className="shrink-0 text-xs font-medium text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-full px-3 py-1.5 transition-all">
                    {r.name} <span className="text-slate-500 ml-1">{r.count}</span>
                  </Link>
                ))}
                </div>
              </div>
            </div>

            {/* Right — live data preview card */}
            <div className="hidden lg:block pt-6">
              <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.03] backdrop-blur-sm">
                <div className="bg-white/5 border-b border-white/10 px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Data</span>
                  </div>
                  <span className="text-xs text-slate-600">{countries.length} countries</span>
                </div>
                <div className="grid grid-cols-[1fr_70px_60px] px-5 py-2 border-b border-white/5">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Country</span>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tax</span>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">SS</span>
                </div>
                {PREVIEW_COUNTRIES.map((c, i) => (
                  <Link key={c.code} href={`/countries/${c.code}/`}
                    className={`grid grid-cols-[1fr_70px_60px] px-5 py-3.5 items-center hover:bg-white/5 transition-colors group ${i > 0 ? 'border-t border-white/[0.06]' : ''}`}>
                    <div className="flex items-center gap-2.5">
                      <img src={`https://flagcdn.com/20x15/${c.code}.png`} alt={c.name} width={20} height={15} className="rounded-sm opacity-90" />
                      <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors truncate">{c.name}</span>
                    </div>
                    <span className="font-mono text-xs text-blue-300">{c.tax}</span>
                    <span className="font-mono text-xs text-slate-400">{c.ss}</span>
                  </Link>
                ))}
                <div className="border-t border-white/10 bg-blue-600/10 px-5 py-3.5">
                  <Link href="/countries/"
                    className="flex items-center justify-between text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors group">
                    <span>View all countries</span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
              <p className="text-xs text-slate-600 text-center mt-4 leading-relaxed">
                Government-sourced · Verified monthly<br />Free to access — no account required
              </p>
            </div>

          </div>

          {/* Stat strip */}
          <div className="mt-16 pt-10 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: countries.length.toString(), label: 'Countries', sub: 'Countries live and growing' },
              { value: '50,000+', label: 'Data Points', sub: 'Per country record' },
              { value: 'Monthly', label: 'Updates',     sub: 'Always current' },
              { value: 'Free',    label: 'Core Access', sub: 'No account required' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black text-white tracking-tight">{s.value}</div>
                <div className="text-sm font-bold text-blue-400 mt-1">{s.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="mb-14">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">The Platform</p>
            <div className="flex items-end justify-between gap-6">
              <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                Everything you need for<br />global HR and workforce compliance.
              </h2>
              <p className="hidden lg:block text-slate-500 max-w-md leading-relaxed">
                One authoritative source for country employment data, payroll calculations,
                EOR intelligence, and employment law — verified, current, and free to access.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {dynamicCapabilities.map(cap => (
              <Link key={cap.title} href={cap.href}
                className={`group bg-white border border-slate-200 ${cap.border} rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col`}>
                <div className={`h-1.5 ${cap.top}`} />
                <div className="p-7 flex flex-col flex-1">
                  <div className={`inline-flex p-3 rounded-xl ${cap.accent} w-fit mb-5`}>
                    <cap.icon size={22} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-3 leading-tight">{cap.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed flex-1">{cap.body}</p>
                  <div className="mt-6 flex items-center gap-1.5 text-blue-600 text-sm font-semibold group-hover:gap-2.5 transition-all">
                    {cap.cta} <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COUNTRY TABLE */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Country Data</p>
              <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                Featured jurisdictions.
              </h2>
            </div>
            <Link href="/countries/"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors">
              All {countries.length} countries <ArrowRight size={15} />
            </Link>
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_140px] bg-slate-900 px-6 py-4">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Country</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Income Tax</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Employer Contribution</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Currency</span>
              <span />
            </div>
            {FEATURED_COUNTRIES.map((c, i) => (
              <Link key={c.code} href={`/countries/${c.code}/`}
                className={`grid grid-cols-[2.5fr_1fr_1fr_1fr_140px] px-6 py-4 items-center hover:bg-blue-50 transition-colors group ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                <div className="flex items-center gap-4">
                  <img src={`https://flagcdn.com/28x21/${c.code}.png`} alt={c.name} width={28} height={21} className="rounded-sm shadow-sm" />
                  <span className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{c.name}</span>
                </div>
                <span className="font-mono text-slate-700 font-medium">{c.income}</span>
                <span className="font-mono text-slate-700 font-medium">{c.ss_employer}</span>
                <span className="text-slate-500 font-medium">{c.currency}</span>
                <span className="flex items-center gap-1 text-blue-600 text-xs font-bold uppercase tracking-wide opacity-40 group-hover:opacity-100 transition-all">
                  View data <ChevronRight size={11} />
                </span>
              </Link>
            ))}
          </div>

          {/* Mobile grid */}
          <div className="lg:hidden grid sm:grid-cols-2 gap-4">
            {FEATURED_COUNTRIES.map(c => (
              <Link key={c.code} href={`/countries/${c.code}/`}
                className="group bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-xl p-5 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <img src={`https://flagcdn.com/28x21/${c.code}.png`} alt={c.name} width={28} height={21} className="rounded-sm" />
                  <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{c.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Income Tax</div>
                    <div className="font-mono font-semibold text-slate-800 text-sm">{c.income}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Employer Contribution</div>
                    <div className="font-mono font-semibold text-slate-800 text-sm">{c.ss_employer}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DATA STANDARDS */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">Our Standards</p>
              <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
                Data held to<br />the highest standard.
              </h2>
              <p className="text-slate-500 leading-relaxed text-lg mb-8">
                Every data point on HRLake is sourced directly from official government
                and tax authority publications, verified by qualified HR and employment
                law professionals, and updated monthly.
              </p>
              <Link href="/about/"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors">
                About our methodology <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {STANDARDS.map(s => (
                <div key={s.title}
                  className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="bg-blue-600 text-white w-11 h-11 rounded-xl flex items-center justify-center mb-4">
                    <s.icon size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* INSIGHTS */}
      {insights.length > 0 ? (
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Intelligence</p>
                <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight">Latest analysis.</h2>
              </div>
              <Link href="/insights/"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm">
                All articles <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {insights.map((article: any) => (
                <Link key={article.slug?.current} href={`/insights/${article.slug?.current}/`}
                  className="group bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg rounded-2xl overflow-hidden transition-all duration-200">
                  <div className="h-1.5 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="p-7">
                    {article.category && (
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{article.category}</span>
                    )}
                    <h3 className="font-bold text-slate-900 text-lg mt-2 mb-3 leading-snug group-hover:text-blue-700 transition-colors">{article.title}</h3>
                    {article.excerpt && (
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">{article.excerpt}</p>
                    )}
                    <div className="mt-5 flex items-center gap-1.5 text-blue-600 text-sm font-semibold group-hover:gap-2.5 transition-all">
                      Read article <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Intelligence</p>
                <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight">Latest analysis.</h2>
              </div>
              <Link href="/insights/"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm">
                All articles <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[1,2,3].map(n => (
                <div key={n} className="bg-slate-50 border border-slate-200 rounded-2xl p-7 animate-pulse">
                  <div className="h-3 bg-slate-200 rounded w-1/3 mb-4" />
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-5 bg-slate-200 rounded w-1/2 mb-6" />
                  <div className="h-3 bg-slate-200 rounded w-full mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-5/6" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EMAIL CAPTURE */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(30,111,255,0.10) 0%, transparent 60%)' }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">Stay Informed</p>
              <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-6">
                Monthly HR and<br />employment updates.<br />
                <span className="text-slate-500">Free. No noise.</span>
              </h2>
              <p className="text-slate-400 leading-relaxed text-lg mb-8 max-w-md">
                Once a month, direct to your inbox — everything that matters
                across HR compliance, payroll, and EOR.
              </p>
              <ul className="space-y-3">
                {UPDATE_ITEMS.map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 mt-2" />
                    <span className="text-slate-400 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <EmailCapture
                source="homepage"
                variant="dark"
                title="Subscribe to updates"
                subtitle="Join thousands of HR and payroll professionals."
              />
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}