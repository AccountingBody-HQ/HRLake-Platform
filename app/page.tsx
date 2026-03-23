import Link from 'next/link'
import CountrySearch from '@/components/homepage/CountrySearch'
import { Globe, Calculator, Building2, Shield, ArrowRight, CheckCircle, TrendingUp, Users, Database, RefreshCw } from 'lucide-react'

const FEATURED_COUNTRIES = [
  { code: 'gb', name: 'United Kingdom', stat: 'Corp Tax: 25%', currency: 'GBP' },
  { code: 'us', name: 'United States', stat: 'Fed Tax: up to 37%', currency: 'USD' },
  { code: 'de', name: 'Germany', stat: 'Corp Tax: 15%', currency: 'EUR' },
  { code: 'fr', name: 'France', stat: 'Corp Tax: 25%', currency: 'EUR' },
  { code: 'nl', name: 'Netherlands', stat: 'Corp Tax: 25.8%', currency: 'EUR' },
  { code: 'sg', name: 'Singapore', stat: 'Corp Tax: 17%', currency: 'SGD' },
  { code: 'ae', name: 'UAE', stat: 'Corp Tax: 9%', currency: 'AED' },
  { code: 'au', name: 'Australia', stat: 'Corp Tax: 30%', currency: 'AUD' },
  { code: 'ca', name: 'Canada', stat: 'Fed Tax: 15%', currency: 'CAD' },
  { code: 'jp', name: 'Japan', stat: 'Corp Tax: 23.2%', currency: 'JPY' },
  { code: 'in', name: 'India', stat: 'Corp Tax: 22%', currency: 'INR' },
  { code: 'ch', name: 'Switzerland', stat: 'Corp Tax: 8.5%', currency: 'CHF' },
]

const REGIONS = [
  { name: 'Europe', slug: 'europe', count: 44 },
  { name: 'Americas', slug: 'americas', count: 35 },
  { name: 'Asia Pacific', slug: 'asia-pacific', count: 42 },
  { name: 'Middle East', slug: 'middle-east', count: 18 },
  { name: 'Africa', slug: 'africa', count: 56 },
]

const PLATFORM_CARDS = [
  {
    icon: Globe,
    title: 'Country Data',
    description: 'Income tax brackets, social security rates, employment rules, and payroll compliance obligations for every country.',
    href: '/countries/',
    cta: 'Browse all countries',
    accent: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Calculator,
    title: 'Payroll Calculators',
    description: 'Calculate net pay, employer costs, tax, and social security contributions — with a full line-by-line breakdown.',
    href: '/payroll-tools/',
    cta: 'Open calculators',
    accent: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: Building2,
    title: 'EOR Intelligence',
    description: 'Employer of Record cost estimators, provider comparisons, and guides for hiring without a local entity.',
    href: '/eor/',
    cta: 'Explore EOR',
    accent: 'bg-sky-50 text-sky-600',
  },
  {
    icon: Shield,
    title: 'HR Compliance',
    description: 'Global employment law by topic — minimum wage, leave entitlements, notice periods, probation rules, and more.',
    href: '/hr-compliance/',
    cta: 'View compliance guides',
    accent: 'bg-teal-50 text-teal-600',
  },
]

const TRUST_ITEMS = [
  { icon: Database, label: 'Government sources', sub: 'Official tax authority data' },
  { icon: CheckCircle, label: 'Expert verified', sub: 'Reviewed by payroll professionals' },
  { icon: RefreshCw, label: 'Updated monthly', sub: 'Current rates and thresholds' },
  { icon: Users, label: 'Built for professionals', sub: 'EOR firms, HR teams, lawyers' },
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
  } catch (_) {
    insights = []
  }

  return (
    <main className="min-h-screen bg-white">

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #1d4ed8 0%, transparent 50%)" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-1.5 text-blue-300 text-sm font-medium mb-8">
              <TrendingUp size={14} />
              Trusted by payroll professionals worldwide
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
              The World's Most Comprehensive<br />
              <span className="text-blue-400">Global Payroll Intelligence</span> Platform
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Payroll data, calculators, and compliance guides for every country.
              Built for EOR firms, HR directors, lawyers, and global employers.
            </p>
            <div className="mb-10">
              <CountrySearch />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/countries/"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base">
                Explore Countries <ArrowRight size={18} />
              </Link>
              <Link href="/payroll-tools/global-calculator/"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base">
                Try the Calculator
              </Link>
            </div>
          </div>

          {/* STAT BAR */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: '195', label: 'Countries' },
              { value: '10,000+', label: 'Data Points' },
              { value: 'Monthly', label: 'Updates' },
              { value: 'Free', label: 'to Use' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-slate-400 text-sm mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REGION QUICK-LINKS */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-slate-500 text-sm font-medium mr-2">Browse by region:</span>
            {REGIONS.map(r => (
              <Link key={r.slug}
                href={`/countries/?region=${r.slug}`}
                className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-700 text-sm font-medium px-4 py-2 rounded-full transition-colors">
                {r.name}
                <span className="text-slate-400 text-xs">({r.count})</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COUNTRIES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Featured Countries</h2>
            <p className="text-slate-500 mt-2">The most-referenced jurisdictions on the platform</p>
          </div>
          <Link href="/countries/" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
            All 195 countries <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {FEATURED_COUNTRIES.map(c => (
            <Link key={c.code} href={`/countries/${c.code}/`}
              className="group bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-xl p-5 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <img src={`https://flagcdn.com/32x24/${c.code}.png`} alt={c.name}
                  width={32} height={24} className="rounded-sm" />
                <span className="font-semibold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">{c.name}</span>
              </div>
              <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-1.5">{c.stat}</div>
              <div className="mt-3 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                View data <ArrowRight size={11} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* PLATFORM SECTIONS */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Everything You Need for Global Payroll</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">One platform for country data, payroll calculations, EOR intelligence, and employment law compliance.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLATFORM_CARDS.map(card => (
              <Link key={card.title} href={card.href}
                className="group bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg rounded-2xl p-6 transition-all flex flex-col">
                <div className={`inline-flex p-3 rounded-xl ${card.accent} w-fit mb-4`}>
                  <card.icon size={22} />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{card.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed flex-1">{card.description}</p>
                <div className="mt-5 text-blue-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  {card.cta} <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Data You Can Trust</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_ITEMS.map(item => (
            <div key={item.label} className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-xl mb-4">
                <item.icon size={22} />
              </div>
              <div className="font-semibold text-slate-800 mb-1">{item.label}</div>
              <div className="text-slate-500 text-sm">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LATEST INSIGHTS */}
      {insights.length > 0 && (
        <section className="bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold">Latest Insights</h2>
                <p className="text-slate-400 mt-2">Global payroll news and analysis</p>
              </div>
              <Link href="/insights/" className="text-blue-400 hover:text-blue-300 font-medium text-sm flex items-center gap-1">
                All articles <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {insights.map((article: any) => (
                <Link key={article.slug?.current} href={`/insights/${article.slug?.current}/`}
                  className="group bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl p-6 transition-all">
                  {article.category && (
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">{article.category}</span>
                  )}
                  <h3 className="font-semibold text-white mt-2 mb-3 leading-snug group-hover:text-blue-300 transition-colors">{article.title}</h3>
                  {article.excerpt && <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">{article.excerpt}</p>}
                  <div className="mt-4 text-blue-400 text-sm font-medium flex items-center gap-1">
                    Read article <ArrowRight size={13} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EMAIL CAPTURE */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Get Monthly Global Payroll Updates</h2>
          <p className="text-blue-100 mb-10 text-lg">Rate changes, new country data, compliance alerts, and payroll news — delivered once a month. Free.</p>
          <form action="/api/subscribe" method="POST"
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              name="email"
              required
              placeholder="your@email.com"
              className="flex-1 px-5 py-3.5 rounded-xl text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-white/50 bg-white"
            />
            <button type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors whitespace-nowrap">
              Subscribe free
            </button>
          </form>
          <p className="text-blue-200 text-xs mt-4">No spam. Unsubscribe any time.</p>
        </div>
      </section>

    </main>
  )
}
