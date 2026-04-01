import { getInsightArticles } from '@/lib/sanity'
import Link from 'next/link'
import { getHomepageStructuredData, jsonLd } from '@/lib/structured-data'
import SearchBar from '@/components/SearchBar'
import EmailCapture from '@/components/EmailCapture'
import {
  Globe, Calculator, Building2, Shield, ArrowRight,
  ChevronRight, Lock, RefreshCw, Award, TrendingUp, Droplets,
  Waves, Fish, Anchor
} from 'lucide-react'

const FEATURED_COUNTRIES = [
  { code: 'gb', name: 'United Kingdom', income: '20–45%', ss_employer: '13.8%', currency: 'GBP' },
  { code: 'us', name: 'United States',  income: '10–37%', ss_employer: '7.65%', currency: 'USD' },
  { code: 'de', name: 'Germany',        income: '14–45%', ss_employer: '~20%',  currency: 'EUR' },
  { code: 'fr', name: 'France',         income: '0–45%',  ss_employer: '~30%',  currency: 'EUR' },
  { code: 'sg', name: 'Singapore',      income: '0–22%',  ss_employer: '17%',   currency: 'SGD' },
  { code: 'ae', name: 'UAE',            income: '0%',     ss_employer: '12.5%', currency: 'AED' },
  { code: 'au', name: 'Australia',      income: '0–45%',  ss_employer: '11%',   currency: 'AUD' },
  { code: 'ch', name: 'Switzerland',    income: '0–11.5%',ss_employer: '~10%',  currency: 'CHF' },
  { code: 'ca', name: 'Canada',         income: '15–33%', ss_employer: '~7.5%', currency: 'CAD' },
  { code: 'nl', name: 'Netherlands',    income: '9–49.5%',ss_employer: '~19%',  currency: 'EUR' },
  { code: 'jp', name: 'Japan',          income: '5–45%',  ss_employer: '~16%',  currency: 'JPY' },
  { code: 'in', name: 'India',          income: '0–30%',  ss_employer: '12%',   currency: 'INR' },
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
    body: 'Income tax brackets, social security rates, payroll frequency, and employer obligations for every country — one authoritative source.',
    href: '/countries/',
    cta: 'Browse countries',
    iconBg: 'rgba(3,105,161,0.12)',
    iconColor: '#0ea5e9',
    accent: '#0369a1',
    hover: 'rgba(3,105,161,0.06)',
  },
  {
    icon: Calculator,
    title: 'Payroll Calculators',
    body: 'Net pay, employer on-costs, income tax, and social security — full line-by-line breakdowns for 195 jurisdictions.',
    href: '/payroll-tools/',
    cta: 'Open calculator',
    iconBg: 'rgba(13,148,136,0.12)',
    iconColor: '#0d9488',
    accent: '#0d9488',
    hover: 'rgba(13,148,136,0.06)',
  },
  {
    icon: Building2,
    title: 'EOR Intelligence',
    body: 'Employer of Record cost modelling, total employment cost estimators, and hiring guides for entity-free international payroll.',
    href: '/eor/',
    cta: 'Explore EOR',
    iconBg: 'rgba(13,148,136,0.12)',
    iconColor: '#2dd4bf',
    accent: '#2dd4bf',
    hover: 'rgba(13,148,136,0.06)',
  },
  {
    icon: Shield,
    title: 'Employment Law',
    body: 'Minimum wage, statutory leave, notice periods, probation rules, overtime, and termination obligations — by country.',
    href: '/hr-compliance/',
    cta: 'View guides',
    iconBg: 'rgba(3,105,161,0.12)',
    iconColor: '#38bdf8',
    accent: '#38bdf8',
    hover: 'rgba(3,105,161,0.06)',
  },
]

const STANDARDS = [
  { icon: Award,      title: 'Government-sourced',     body: 'Every data point traced to an official tax authority or government publication.' },
  { icon: RefreshCw,  title: 'Updated monthly',        body: 'Payroll rates and thresholds reviewed on a rolling monthly cycle.' },
  { icon: Lock,       title: 'Expert verified',        body: 'Data reviewed by qualified payroll professionals before publication.' },
  { icon: TrendingUp, title: 'Continuously expanding', body: 'Coverage growing toward complete global depth across all 195 countries.' },
]

const DEPTH_FEATURES = [
  { icon: Waves,  title: 'Surface clarity',  body: 'Clean, fast answers for quick country lookups and rate checks.' },
  { icon: Fish,   title: 'Mid-water detail', body: 'Full tax brackets, SS tables, employment law rules, and compliance calendars.' },
  { icon: Anchor, title: 'Deep anchoring',   body: 'EOR intelligence, DTTs, contractor rules, and entity setup data for complex global hiring.' },
]

export default async function HomePage() {
  const insights = await getInsightArticles({ limit: 3 })

  return (
    <main className="bg-white flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(getHomepageStructuredData()) }}
      />

      {/* ══════════════════════════════════════════════
          HERO — The deep
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{backgroundColor: '#010a14'}}>

        {/* Lake light caustics — abstract depth suggestion */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(13,148,136,0.22) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 85% 30%, rgba(3,105,161,0.16) 0%, transparent 55%),
            radial-gradient(ellipse 60% 50% at 15% 70%, rgba(2,12,24,0.9) 0%, transparent 50%)
          `
        }} />

        {/* Horizontal depth layers — like light through water */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `
            linear-gradient(180deg,
              transparent 0%,
              rgba(1,10,20,0.0) 30%,
              rgba(1,10,20,0.3) 70%,
              rgba(1,10,20,0.7) 100%
            )
          `
        }} />

        {/* Subtle grid — like ripples on still water */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)
          `,
          backgroundSize: '48px 48px',
        }} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-24">
          <div className="max-w-4xl">

            {/* Badge */}
            <div className="lake-badge mb-10 w-fit">
              <Droplets size={12} />
              Where global HR knowledge dives deep
            </div>

            {/* Headline */}
            <h1 className="font-serif text-white mb-8" style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
            }}>
              The deep source<br />
              for{' '}
              <span style={{
                background: 'linear-gradient(135deg, #2dd4bf 0%, #0ea5e9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                global payroll
              </span>
              <br />
              intelligence.
            </h1>

            {/* Sub */}
            <p style={{color: 'rgba(148,163,184,0.9)', fontSize: '1.2rem', lineHeight: 1.75, maxWidth: '560px', marginBottom: '2.5rem'}}>
              Payroll data, calculators, and compliance guides for 195 countries.
              Built for EOR firms, HR directors, lawyers, and global finance teams
              who need answers they can trust.
            </p>

            {/* Search */}
            <div className="max-w-2xl mb-10">
              <SearchBar variant="hero" placeholder="Search any country, payroll guide, or topic…" />
            </div>

            {/* Quick nav cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mb-10">
              {[
                { href: '/countries/',    icon: Globe,      label: 'Country Data' },
                { href: '/payroll-tools/', icon: Calculator, label: 'Calculator' },
                { href: '/eor/',          icon: Building2,  label: 'EOR Guide' },
                { href: '/hr-compliance/', icon: Shield,     label: 'Employment Law' },
              ].map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href}
                  className="group flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all hover:bg-teal-900/20"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}

                >
                  <Icon size={15} style={{color: '#2dd4bf', flexShrink: 0}} />
                  <span style={{fontSize: '0.8rem', fontWeight: 600, color: 'rgba(203,213,225,0.9)', lineHeight: 1.3}}>{label}</span>
                </Link>
              ))}
            </div>

            {/* Region pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span style={{color: 'rgba(100,116,139,0.8)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: '0.25rem'}}>Browse:</span>
              {REGIONS.map(r => (
                <Link key={r.slug} href={`/countries/?region=${r.slug}`}
                  className="transition-all"
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'rgba(100,116,139,0.9)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '9999px',
                    padding: '0.35rem 0.875rem',
                  }}
                >
                  {r.name} <span style={{color: 'rgba(148,163,184,0.6)', marginLeft: '0.2rem'}}>{r.count}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Stat strip ── */}
          <div className="mt-20 pt-10 grid grid-cols-2 sm:grid-cols-4 gap-8" style={{borderTop: '1px solid rgba(13,148,136,0.15)'}}>
            {[
              { value: '195',     label: 'Countries',   sub: 'Full global coverage' },
              { value: '10,000+', label: 'Data Points', sub: 'Per country record' },
              { value: 'Monthly', label: 'Updates',     sub: 'Always current' },
              { value: 'Free',    label: 'Core Access', sub: 'No account required' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div style={{fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1}}>{s.value}</div>
                <div style={{fontSize: '0.8rem', fontWeight: 700, color: '#2dd4bf', marginTop: '0.4rem', letterSpacing: '0.02em'}}>{s.label}</div>
                <div style={{fontSize: '0.7rem', color: 'rgba(100,116,139,0.7)', marginTop: '0.2rem'}}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          DEPTH PROPOSITION — What HRLake means
      ══════════════════════════════════════════════ */}
      <section style={{backgroundColor: '#020c18'}}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-3 gap-6">
            {DEPTH_FEATURES.map((f, i) => (
              <div key={f.title} className="depth-card p-8 rounded-2xl">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{background: 'linear-gradient(135deg, #0369a1 0%, #0d9488 100%)'}}>
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 style={{fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem'}}>{f.title}</h3>
                <p style={{fontSize: '0.9rem', color: 'rgba(148,163,184,0.8)', lineHeight: 1.7}}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CAPABILITIES
      ══════════════════════════════════════════════ */}
      <section className="bg-white" style={{borderTop: '1px solid #f0f2f7', borderBottom: '1px solid #f0f2f7'}}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-28">
          <div className="mb-16">
            <div className="lake-badge mb-5 w-fit" style={{background: 'rgba(13,148,136,0.08)', borderColor: 'rgba(13,148,136,0.18)', color: '#0d9488'}}>
              <Droplets size={11} />
              The Platform
            </div>
            <div className="flex items-end justify-between gap-8">
              <h2 className="font-serif" style={{fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#0a1128', letterSpacing: '-0.03em', lineHeight: 1.1}}>
                Everything you need<br />for global payroll.
              </h2>
              <p className="hidden lg:block" style={{color: '#64748b', maxWidth: '360px', lineHeight: 1.75, fontSize: '0.95rem'}}>
                One authoritative source for country payroll data, calculations, EOR intelligence,
                and employment law — verified, current, and free to access.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CAPABILITIES.map(cap => (
              <Link key={cap.title} href={cap.href}
                className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e6ef',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                {/* Top colour bar */}
                <div style={{height: '3px', background: `linear-gradient(90deg, ${cap.accent}, ${cap.iconColor})`}} />
                <div className="p-7 flex flex-col flex-1">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all"
                    style={{background: cap.iconBg}}>
                    <cap.icon size={20} style={{color: cap.iconColor}} />
                  </div>
                  <h3 style={{fontSize: '1rem', fontWeight: 700, color: '#0a1128', marginBottom: '0.75rem', lineHeight: 1.3}}>{cap.title}</h3>
                  <p style={{fontSize: '0.875rem', color: '#64748b', lineHeight: 1.75, flex: 1}}>{cap.body}</p>
                  <div className="mt-6 flex items-center gap-2 transition-all group-hover:gap-3"
                    style={{fontSize: '0.8rem', fontWeight: 700, color: cap.accent, letterSpacing: '0.01em'}}>
                    {cap.cta} <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          COUNTRY TABLE
      ══════════════════════════════════════════════ */}
      <section style={{backgroundColor: '#f8f9fc'}}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-28">
          <div className="flex items-end justify-between mb-14">
            <div>
              <div className="lake-badge mb-5 w-fit" style={{background: 'rgba(13,148,136,0.08)', borderColor: 'rgba(13,148,136,0.18)', color: '#0d9488'}}>
                <Droplets size={11} />
                Payroll Data
              </div>
              <h2 className="font-serif" style={{fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#0a1128', letterSpacing: '-0.03em', lineHeight: 1.1}}>
                Featured jurisdictions.
              </h2>
            </div>
            <Link href="/countries/"
              className="flex items-center gap-2 font-semibold transition-colors"
              style={{fontSize: '0.875rem', color: '#0d9488'}}>
              All 195 countries <ArrowRight size={14} />
            </Link>
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block rounded-2xl overflow-hidden" style={{border: '1px solid #e2e6ef', boxShadow: 'var(--shadow-md)'}}>
            <div className="grid px-6 py-4" style={{
              gridTemplateColumns: '2.5fr 1fr 1fr 1fr 140px',
              backgroundColor: '#010a14',
              borderBottom: '1px solid rgba(13,148,136,0.15)'
            }}>
              {['Country','Income Tax','Employer SS','Currency',''].map(h => (
                <span key={h} style={{fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.7)'}}>{h}</span>
              ))}
            </div>
            {FEATURED_COUNTRIES.map((c, i) => (
              <Link key={c.code} href={`/countries/${c.code}/`}
                className="grid items-center px-6 py-4 group transition-all"
                style={{
                  gridTemplateColumns: '2.5fr 1fr 1fr 1fr 140px',
                  borderTop: i > 0 ? '1px solid #f0f2f7' : 'none',
                  backgroundColor: 'transparent',
                }}>
                <div className="flex items-center gap-4">
                  <img src={`https://flagcdn.com/28x21/${c.code}.png`} alt={c.name} width={28} height={21} className="rounded-sm" style={{boxShadow: '0 1px 4px rgba(0,0,0,0.12)'}} />
                  <span style={{fontWeight: 600, color: '#1e293b', fontSize: '0.9rem'}}>{c.name}</span>
                </div>
                <span style={{fontFamily: 'IBM Plex Mono, monospace', color: '#334155', fontWeight: 500, fontSize: '0.875rem'}}>{c.income}</span>
                <span style={{fontFamily: 'IBM Plex Mono, monospace', color: '#334155', fontWeight: 500, fontSize: '0.875rem'}}>{c.ss_employer}</span>
                <span style={{color: '#64748b', fontSize: '0.875rem', fontWeight: 500}}>{c.currency}</span>
                <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{fontSize: '0.7rem', fontWeight: 700, color: '#0d9488', letterSpacing: '0.06em', textTransform: 'uppercase'}}>
                  View data <ChevronRight size={11} />
                </span>
              </Link>
            ))}
          </div>

          {/* Mobile */}
          <div className="lg:hidden grid sm:grid-cols-2 gap-4">
            {FEATURED_COUNTRIES.map(c => (
              <Link key={c.code} href={`/countries/${c.code}/`}
                className="group bg-white rounded-xl p-5 transition-all"
                style={{border: '1px solid #e2e6ef', boxShadow: 'var(--shadow-sm)'}}>
                <div className="flex items-center gap-3 mb-4">
                  <img src={`https://flagcdn.com/28x21/${c.code}.png`} alt={c.name} width={28} height={21} className="rounded-sm" />
                  <span style={{fontWeight: 700, color: '#1e293b', fontSize: '0.9rem'}}>{c.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div style={{fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.2rem'}}>Income Tax</div>
                    <div style={{fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600, color: '#1e293b', fontSize: '0.875rem'}}>{c.income}</div>
                  </div>
                  <div>
                    <div style={{fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.2rem'}}>Employer SS</div>
                    <div style={{fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600, color: '#1e293b', fontSize: '0.875rem'}}>{c.ss_employer}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          DATA STANDARDS
      ══════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-28">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="lake-badge mb-6 w-fit" style={{background: 'rgba(13,148,136,0.08)', borderColor: 'rgba(13,148,136,0.18)', color: '#0d9488'}}>
                <Droplets size={11} />
                Our Standards
              </div>
              <h2 className="font-serif mb-6" style={{fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#0a1128', letterSpacing: '-0.03em', lineHeight: 1.1}}>
                Data held to<br />the highest standard.
              </h2>
              <p style={{fontSize: '1.1rem', color: '#64748b', lineHeight: 1.8, marginBottom: '1.5rem'}}>
                Every data point on HRLake is sourced directly from official government
                and tax authority publications, verified by qualified payroll professionals,
                and updated monthly.
              </p>
              {/* Tagline pull quote */}
              <div className="depth-accent my-8" style={{borderColor: '#2dd4bf'}}>
                <p style={{fontSize: '1.15rem', fontStyle: 'italic', color: '#0a1128', fontWeight: 600, lineHeight: 1.6}}>
                  &ldquo;HRLake is where global HR knowledge dives deep.&rdquo;
                </p>
              </div>
              <Link href="/about/"
                className="inline-flex items-center gap-2 font-semibold transition-colors"
                style={{fontSize: '0.875rem', color: '#0d9488'}}>
                About our methodology <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {STANDARDS.map(s => (
                <div key={s.title} className="card-base p-7 rounded-2xl">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                    style={{background: 'linear-gradient(135deg, #0369a1 0%, #0d9488 100%)'}}>
                    <s.icon size={20} className="text-white" />
                  </div>
                  <h3 style={{fontSize: '0.95rem', fontWeight: 700, color: '#0a1128', marginBottom: '0.5rem'}}>{s.title}</h3>
                  <p style={{fontSize: '0.85rem', color: '#64748b', lineHeight: 1.7}}>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          INSIGHTS
      ══════════════════════════════════════════════ */}
      {insights.length > 0 && (
        <section style={{backgroundColor: '#f8f9fc', borderTop: '1px solid #f0f2f7', borderBottom: '1px solid #f0f2f7'}}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-28">
            <div className="flex items-end justify-between mb-14">
              <div>
                <div className="lake-badge mb-5 w-fit" style={{background: 'rgba(13,148,136,0.08)', borderColor: 'rgba(13,148,136,0.18)', color: '#0d9488'}}>
                  <Droplets size={11} />
                  Intelligence
                </div>
                <h2 className="font-serif" style={{fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#0a1128', letterSpacing: '-0.03em', lineHeight: 1.1}}>
                  Latest analysis.
                </h2>
              </div>
              <Link href="/insights/"
                className="flex items-center gap-2 font-semibold transition-colors"
                style={{fontSize: '0.875rem', color: '#0d9488'}}>
                All articles <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {insights.map((article: any) => (
                <Link key={article.slug?.current} href={`/insights/${article.slug?.current}/`}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                  style={{border: '1px solid #e2e6ef', boxShadow: 'var(--shadow-sm)'}}>
                  <div style={{height: '3px', background: 'linear-gradient(90deg, #0369a1, #2dd4bf)', opacity: 0}} className="group-hover:opacity-100 transition-opacity" />
                  <div className="p-7 flex flex-col flex-1">
                    {article.category && (
                      <span style={{fontSize: '0.65rem', fontWeight: 700, color: '#0d9488', letterSpacing: '0.1em', textTransform: 'uppercase'}}>{article.category}</span>
                    )}
                    <h3 style={{fontSize: '1rem', fontWeight: 700, color: '#0a1128', marginTop: '0.5rem', marginBottom: '0.75rem', lineHeight: 1.4}}
                      className="group-hover:text-teal-700 transition-colors">{article.title}</h3>
                    {article.excerpt && (
                      <p style={{fontSize: '0.875rem', color: '#64748b', lineHeight: 1.75, flex: 1}} className="line-clamp-3">{article.excerpt}</p>
                    )}
                    <div className="mt-6 flex items-center gap-2 transition-all group-hover:gap-3"
                      style={{fontSize: '0.8rem', fontWeight: 700, color: '#0d9488'}}>
                      Read article <ArrowRight size={13} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════
          EMAIL CAPTURE — The depths
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{backgroundColor: '#010a14'}}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `
            radial-gradient(ellipse 70% 60% at 90% 50%, rgba(13,148,136,0.1) 0%, transparent 60%),
            radial-gradient(ellipse 60% 60% at 10% 50%, rgba(3,105,161,0.08) 0%, transparent 55%)
          `
        }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
          backgroundSize: '48px 48px',
        }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-28">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="lake-badge mb-8 w-fit">
                <Droplets size={12} />
                Stay Informed
              </div>
              <h2 className="font-serif text-white mb-6" style={{
                fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
              }}>
                Monthly payroll<br />updates.{' '}
                <span style={{color: 'rgba(100,116,139,0.6)'}}>Free.<br />No noise.</span>
              </h2>
              <p style={{fontSize: '1.1rem', color: 'rgba(148,163,184,0.8)', lineHeight: 1.8, maxWidth: '400px'}}>
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
