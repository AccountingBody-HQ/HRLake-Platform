import Link from 'next/link'
import { getHomepageStructuredData, jsonLd } from '@/lib/structured-data'
import SearchBar from '@/components/SearchBar'
import EmailCapture from '@/components/EmailCapture'
import { Globe, Calculator, Building2, Shield, ArrowRight, ChevronRight, Lock, RefreshCw, Award, TrendingUp, CheckCircle } from 'lucide-react'

const FEATURED_COUNTRIES = [
  { code: 'gb', name: 'United Kingdom', income: '20–45%', ss_employer: '13.8%', currency: 'GBP' },
  { code: 'us', name: 'United States',  income: '10–37%', ss_employer: '7.65%', currency: 'USD' },
  { code: 'de', name: 'Germany',         income: '14–45%', ss_employer: '~20%',  currency: 'EUR' },
  { code: 'fr', name: 'France',          income: '0–45%',  ss_employer: '~30%',  currency: 'EUR' },
  { code: 'sg', name: 'Singapore',       income: '0–22%',  ss_employer: '17%',   currency: 'SGD' },
  { code: 'ae', name: 'UAE',             income: '0%',     ss_employer: '12.5%', currency: 'AED' },
  { code: 'au', name: 'Australia',       income: '0–45%',  ss_employer: '11%',   currency: 'AUD' },
  { code: 'ch', name: 'Switzerland',     income: '0–11.5%',ss_employer: '~10%',  currency: 'CHF' },
  { code: 'ca', name: 'Canada',          income: '15–33%', ss_employer: '~7.5%', currency: 'CAD' },
  { code: 'nl', name: 'Netherlands',     income: '9–49.5%',ss_employer: '~19%',  currency: 'EUR' },
  { code: 'jp', name: 'Japan',           income: '5–45%',  ss_employer: '~16%',  currency: 'JPY' },
  { code: 'in', name: 'India',           income: '0–30%',  ss_employer: '12%',   currency: 'INR' },
]

const REGIONS = [
  { name: 'Europe',       slug: 'europe',       count: 44 },
  { name: 'Americas',     slug: 'americas',     count: 35 },
  { name: 'Asia Pacific', slug: 'asia-pacific', count: 42 },
  { name: 'Middle East',  slug: 'middle-east',  count: 18 },
  { name: 'Africa',       slug: 'africa',       count: 56 },
]

const CAPABILITIES = [
  {
    icon: Globe,
    title: 'Country Payroll Data',
    body: 'Income tax brackets, social security rates, payroll frequency, and employer obligations — every country, one authoritative source.',
    href: '/countries/',
    cta: 'Browse countries',
    accent: 'bg-blue-50 text-blue-700',
    border: 'hover:border-blue-300',
    top: 'bg-blue-600',
  },
  {
    icon: Calculator,
    title: 'Payroll Calculators',
    body: 'Net pay, employer on-costs, income tax, and social security — full line-by-line payroll breakdowns for 195 jurisdictions.',
    href: '/payroll-tools/',
    cta: 'Open calculator',
    accent: 'bg-indigo-50 text-indigo-700',
    border: 'hover:border-indigo-300',
    top: 'bg-indigo-600',
  },
  {
    icon: Building2,
    title: 'EOR Intelligence',
    body: 'Employer of Record cost modelling, total employment cost estimators, and hiring guides for entity-free international payroll.',
    href: '/eor/',
    cta: 'Explore EOR',
    accent: 'bg-sky-50 text-sky-700',
    border: 'hover:border-sky-300',
    top: 'bg-sky-600',
  },
  {
    icon: Shield,
    title: 'Employment Law',
    body: 'Minimum wage, statutory leave, notice periods, probation rules, overtime, and termination obligations — by country.',
    href: '/hr-compliance/',
    cta: 'View guides',
    accent: 'bg-teal-50 text-teal-700',
    border: 'hover:border-teal-300',
    top: 'bg-teal-600',
  },
]

const STANDARDS = [
  { icon: Award,      title: 'Government-sourced',     body: 'Every data point traced to an official tax authority or government publication.' },
  { icon: RefreshCw,  title: 'Updated monthly',        body: 'Payroll rates and thresholds reviewed on a rolling monthly cycle.' },
  { icon: Lock,       title: 'Expert verified',        body: 'Data reviewed by qualified payroll professionals before publication.' },
  { icon: TrendingUp, title: 'Continuously expanding', body: 'Coverage growing toward complete global depth across all 195 countries.' },
]

export default async function HomePage() {
  let insights: any[] = []
  try {
    const { createClient } = await import('@sanity/client')
    const sanity = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      apiVersion: '2024-01-01',
      useCdn: true,
    })
    insights = await sanity.fetch(
      `*[_type == "post" && "globalpayrollexpert" in showOnSites] | order(publishedAt desc)[0...3] {
        title, slug, publishedAt, excerpt,
        "category": categories[0]->title
      }`
    )
  } catch (_) { insights = [] }

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(getHomepageStructuredData()) }}
      />

      {/* ══════ HERO ══════ */}
      <section className="relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0"
          style={{background: 'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 0% 100%, rgba(14,30,80,0.4) 0%, transparent 50%)'}} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20">

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-blue-300 text-xs font-semibold tracking-wide">Global Payroll Intelligence Platform</span>
            </div>

            <h1 className="font-serif text-4xl lg:text-6xl font-bold text-white leading-[1.08] mb-8" style={{letterSpacing: '-0.025em'}}>
              Your complete<br /><span className="text-blue-400">global payroll</span><br />intelligence platform.
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mb-10">
              Payroll data, calculators, and employment compliance guides for 195 countries.
              The reference platform for EOR firms, HR directors, lawyers, and global finance teams.
            </p>

            <div className="max-w-xl mb-8">
              <SearchBar variant="hero" placeholder="Search any country, payroll guide, or topic…" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Quick capability links */}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mb-8">
              <Link href="/countries/"
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 rounded-xl px-4 py-3.5 transition-all group">
                <Globe size={16} className="text-blue-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors leading-tight">Country Data</span>
              </Link>
              <Link href="/payroll-tools/"
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 rounded-xl px-4 py-3.5 transition-all group">
                <Calculator size={16} className="text-blue-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors leading-tight">Payroll Calculator</span>
              </Link>
              <Link href="/eor/"
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 rounded-xl px-4 py-3.5 transition-all group">
                <Building2 size={16} className="text-blue-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors leading-tight">EOR Intelligence</span>
              </Link>
              <Link href="/hr-compliance/"
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 rounded-xl px-4 py-3.5 transition-all group">
                <Shield size={16} className="text-blue-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors leading-tight">Employment Law</span>
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mr-1">Browse:</span>
              {REGIONS.map(r => (
                <Link key={r.slug} href={`/countries/?region=${r.slug}`}
                  className="text-xs font-medium text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-full px-3 py-1.5 transition-all">
                  {r.name} <span className="text-slate-300 ml-1">{r.count}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Stat strip */}
          <div className="mt-16 pt-10 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: '195', label: 'Countries', sub: 'Full global coverage' },
              { value: '10,000+', label: 'Data Points', sub: 'Per country record' },
              { value: 'Monthly', label: 'Updates', sub: 'Always current' },
              { value: 'Free', label: 'Core Access', sub: 'No account required' },
            ].map((s, i) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black text-white tracking-tight">{s.value}</div>
                <div className="text-sm font-bold text-slate-300 mt-1">{s.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ CAPABILITIES ══════ */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="mb-14">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">The Platform</p>
            <div className="flex items-end justify-between gap-6">
              <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                Everything you need<br />for global payroll.
              </h2>
              <p className="hidden lg:block text-slate-500 max-w-md leading-relaxed">
                One authoritative source for country payroll data, calculations, EOR intelligence,
                and employment law — verified, current, and free to access.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CAPABILITIES.map(cap => (
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

      {/* ══════ COUNTRY TABLE ══════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Payroll Data</p>
              <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                Featured jurisdictions.
              </h2>
            </div>
            <Link href="/countries/"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors">
              All 195 countries <ArrowRight size={15} />
            </Link>
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_140px] bg-slate-900 px-6 py-4">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Country</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Income Tax</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Employer SS</span>
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
                <span className="flex items-center gap-1 text-blue-600 text-xs font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
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
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Employer SS</div>
                    <div className="font-mono font-semibold text-slate-800 text-sm">{c.ss_employer}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ DATA STANDARDS ══════ */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">Our Standards</p>
              <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
                Data held to<br />the highest standard.
              </h2>
              <p className="text-slate-500 leading-relaxed text-lg mb-8">
                Every data point on GlobalPayrollExpert is sourced directly from official government 
                and tax authority publications, verified by qualified payroll professionals, 
                and updated monthly.
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

      {/* ══════ INSIGHTS ══════ */}
      {insights.length > 0 && (
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
      )}

      {/* ══════ EMAIL CAPTURE ══════ */}
      <section className="relative overflow-hidden" style={{backgroundColor: '#0d1f3c'}}>
        <div className="absolute inset-0"
          style={{background: 'radial-gradient(ellipse at 80% 50%, rgba(30,111,255,0.12) 0%, transparent 60%)'}} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#a0522d] text-xs font-bold uppercase tracking-widest mb-4">Stay Informed</p>
              <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-6">
                Monthly payroll updates.<br />
                <span className="text-slate-500">Free. No noise.</span>
              </h2>
              <p className="text-slate-400 leading-relaxed text-lg max-w-md">
                Payroll rate changes, new country data, employment law updates, 
                and compliance alerts — once a month, direct to your inbox.
              </p>
            </div>
            <div>
              <EmailCapture
                source="homepage"
                variant="dark"
                title="Subscribe to updates"
                subtitle="Join thousands of payroll professionals."
              />
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
