// ============================================
// GLOBALPAYROLLEXPERT — COUNTRY HUB PAGE
// Route: /countries/[code]/
// Server Component — all data fetched server-side
// ============================================

import type { Metadata } from 'next'
import Link from 'next/link'
import { getCountryStructuredData, jsonLd } from '@/lib/structured-data'
import { notFound } from 'next/navigation'
import {
  ChevronRight, Calculator, BookOpen, Scale, Briefcase,
  CheckCircle, ExternalLink, Globe, Building2, Shield,
  TrendingUp, Clock, Calendar, AlertCircle
} from 'lucide-react'
import {
  getAllCountryCodes,
  getCountryByCode,
  getTaxBrackets,
  getTaxYears,
  getSocialSecurity,
  getEmploymentRules,
  getPayrollCompliance,
  getRelatedCountries,
} from '@/lib/supabase-queries'
import CountryCard from '@/components/CountryCard'
import MiniCalculator from '@/components/countries/MiniCalculator'

// ── Revalidate every 24 hours ──────────────────────────────────────────────
export const dynamic = "force-dynamic"

// ── generateMetadata ───────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ code: string }> }
): Promise<Metadata> {
  const { code } = await params
  const country = await getCountryByCode(code)
  if (!country) return { title: 'Country Not Found | GlobalPayrollExpert' }

  const title = `${country.name} Payroll Guide ${new Date().getFullYear()}: Tax, Social Security & Employment Rules`
  const description = `Complete ${country.name} payroll data: income tax brackets, social security rates, employer costs, employment law, and payroll compliance obligations. Updated monthly from official sources.`

  return {
    title,
    description,
    alternates: {
      canonical: `https://globalpayrollexpert.com/countries/${code.toLowerCase()}/`,
    },
    openGraph: {
      title,
      description,
      url: `https://globalpayrollexpert.com/countries/${code.toLowerCase()}/`,
      siteName: 'GlobalPayrollExpert',
      type: 'website',
      images: [
        {
          url: `https://globalpayrollexpert.com/og/country?code=${code.toLowerCase()}&name=${encodeURIComponent(country.name)}&type=payroll`,
          width: 1200,
          height: 630,
          alt: `${country.name} Payroll Guide`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [
        `https://globalpayrollexpert.com/og/country?code=${code.toLowerCase()}&name=${encodeURIComponent(country.name)}&type=payroll`,
      ],
    },
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────
function fmt(value: any, suffix = ''): string {
  if (value === null || value === undefined || value === '') return '—'
  return `${value}${suffix}`
}

function fmtCurrency(amount: number | null, currency: string | null): string {
  if (amount === null || amount === undefined) return '—'
  const code = currency ?? 'USD'
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency', currency: code, maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${code} ${amount.toLocaleString()}`
  }
}

function fmtRate(rate: number | null): string {
  if (rate === null || rate === undefined) return '—'
  return `${rate}%`
}

// ── Page ───────────────────────────────────────────────────────────────────
export default async function CountryPage(
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const iso2 = code.toUpperCase()

  // Fetch all data in parallel
  const [country, taxYears, socialSecurity, employmentRules, compliance] =
    await Promise.all([
      getCountryByCode(iso2),
      getTaxYears(iso2),
      getSocialSecurity(iso2),
      getEmploymentRules(iso2),
      getPayrollCompliance(iso2),
    ])

  if (!country) notFound()

  // Fetch tax brackets for most recent year + related countries
  const latestYear = taxYears[0] ?? null
  const [taxBrackets, relatedCountries] = await Promise.all([
    getTaxBrackets(iso2, latestYear ?? undefined),
    getRelatedCountries(iso2, country.region ?? ''),
  ])

  // Social security split
  const employeeSS = socialSecurity.filter(r =>
    r.employee_rate > 0
  )
  const employerSS = socialSecurity.filter(r =>
    r.employer_rate > 0
  )

  // Key figures for stat cards
  const incomeTaxRange = taxBrackets.length
    ? `${taxBrackets[0]?.rate ?? 0}%–${taxBrackets[taxBrackets.length - 1]?.rate ?? 0}%`
    : null
  const employerSSRate = employerSS.length
    ? employerSS.map(r => `${r.employer_rate}%`).join(' + ')
    : null
  const employeeSSRate = employeeSS.length
    ? employeeSS.map(r => `${r.employee_rate}%`).join(' + ')
    : null

  // Sanity insights
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
      `*[_type == "post" && "globalpayrollexpert" in showOnSites && $country in countries] | order(publishedAt desc)[0...3] {
        title, slug, publishedAt, excerpt,
        "category": categories[0]->title
      }`,
      { country: iso2 }
    )
  } catch { insights = [] }

  const flagUrl = `https://flagcdn.com/64x48/${code.toLowerCase()}.png`

  return (
    <main className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(getCountryStructuredData({
          name: country.name,
          code: code,
          currency_code: country.currency_code ?? undefined,
          region: country.region ?? undefined,
          last_verified: country.last_data_update ?? undefined,
          official_source_url: country.official_source_url ?? undefined,
        })) }}
      />

      {/* ══════ SECTION 1 — HERO ══════ */}
      <section className="relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%)'
        }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-14">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/countries/" className="hover:text-slate-300 transition-colors">All Countries</Link>
            <ChevronRight size={12} />
            <span className="text-slate-400">{country.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              {/* Flag + name */}
              <div className="flex items-center gap-5 mb-6">
                <img
                  src={flagUrl}
                  alt={`${country.name} flag`}
                  width={64}
                  height={48}
                  className="rounded-md shadow-lg border border-white/10"
                />
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="font-serif text-3xl lg:text-5xl font-bold text-white tracking-tight">
                      {country.name}
                    </h1>
                    {country.gpe_coverage_level === 'full' && (
                      <span className="hidden sm:flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full">
                        <CheckCircle size={11} /> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                    {country.region && (
                      <span className="flex items-center gap-1.5">
                        <Globe size={13} className="text-slate-500" />
                        {country.region}
                      </span>
                    )}
                    {country.currency_code && (
                      <span className="font-mono bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs font-bold text-slate-300">
                        {country.currency_code}
                      </span>
                    )}
                    {country.last_verified && (
                      <span className="flex items-center gap-1.5 text-xs">
                        <Clock size={12} className="text-slate-500" />
                        Updated {new Date(country.last_verified).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick-link buttons */}
              <div className="flex flex-wrap gap-3">
                {[
                  { href: `/countries/${code}/payrollcalculator/`, icon: Calculator, label: 'Payroll Calculator' },
                  { href: `/countries/${code}/tax-guide/`,          icon: BookOpen,   label: 'Tax Guide' },
                  { href: `/countries/${code}/employmentlaw/`,       icon: Scale,      label: 'Employment Law' },
                  { href: `/countries/${code}/hiring-guide/`,        icon: Briefcase,  label: 'Hiring Guide' },
                ].map(btn => (
                  <Link
                    key={btn.href}
                    href={btn.href}
                    className="flex items-center gap-2 bg-white/10 hover:bg-blue-600 border border-white/10 hover:border-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                  >
                    <btn.icon size={15} className="text-blue-400" />
                    {btn.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Complexity badge */}
            {country.payroll_complexity_score && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shrink-0 w-full lg:w-52">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Payroll Complexity</p>
                <div className="text-4xl font-black text-white mb-2">
                  {country.payroll_complexity_score}<span className="text-slate-500 text-xl font-bold">/10</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                    style={{ width: `${(country.payroll_complexity_score / 10) * 100}%` }}
                  />
                </div>
                <p className="text-slate-500 text-xs mt-2">
                  {country.payroll_complexity_score >= 8 ? 'High complexity' :
                   country.payroll_complexity_score >= 5 ? 'Moderate complexity' : 'Low complexity'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════ SECTION 2 — KEY PAYROLL FIGURES ══════ */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-6">Key Figures</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Income Tax Range',
                value: incomeTaxRange ?? '—',
                sub: latestYear ? `Tax year ${latestYear}` : 'See brackets below',
                icon: TrendingUp,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                label: 'Employer SS Rate',
                value: employerSSRate ?? '—',
                sub: 'On gross salary',
                icon: Building2,
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
              },
              {
                label: 'Employee SS Rate',
                value: employeeSSRate ?? '—',
                sub: 'Deducted from gross',
                icon: Shield,
                color: 'text-sky-600',
                bg: 'bg-sky-50',
              },
              {
                label: 'Minimum Wage',
                value: employmentRules?.minimum_wage
                  ? fmtCurrency(employmentRules.minimum_wage, country.currency_code)
                  : '—',
                sub: employmentRules?.payroll_frequency ?? 'Per annum',
                icon: Scale,
                color: 'text-teal-600',
                bg: 'bg-teal-50',
              },
            ].map(stat => (
              <div key={stat.label} className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <div className={`inline-flex p-2.5 rounded-xl ${stat.bg} ${stat.color} mb-4`}>
                  <stat.icon size={18} />
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 leading-none mb-1">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ MAIN CONTENT GRID ══════ */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN — 2/3 width */}
          <div className="lg:col-span-2 space-y-8">

            {/* ══════ SECTION 3 — INCOME TAX BRACKETS ══════ */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Income Tax Brackets</h2>
                  {latestYear && (
                    <p className="text-slate-400 text-xs mt-0.5">Tax year {latestYear}</p>
                  )}
                </div>
                <Link
                  href={`/countries/${code}/tax-guide/`}
                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-xs font-bold transition-colors"
                >
                  Full tax guide <ChevronRight size={13} />
                </Link>
              </div>

              {taxBrackets.length === 0 ? (
                <div className="px-6 py-10 text-center text-slate-400">
                  <AlertCircle size={28} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">Tax bracket data not yet available for {country.name}.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Bracket</th>
                        <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Income Range</th>
                        <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {taxBrackets.map((bracket, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-slate-700">
                            {bracket.bracket_name ?? `Band ${i + 1}`}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-slate-600">
                            {fmtCurrency(bracket.lower_limit, country.currency_code)}
                            {' — '}
                            {bracket.upper_limit
                              ? fmtCurrency(bracket.upper_limit, country.currency_code)
                              : 'and above'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center bg-blue-50 text-blue-700 font-bold text-sm px-3 py-1 rounded-full">
                              {bracket.rate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ══════ SECTION 4 — SOCIAL SECURITY ══════ */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 text-lg">Social Security Contributions</h2>
                <p className="text-slate-400 text-xs mt-0.5">Employee and employer contribution rates</p>
              </div>

              {socialSecurity.length === 0 ? (
                <div className="px-6 py-10 text-center text-slate-400">
                  <AlertCircle size={28} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">Social security data not yet available for {country.name}.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {/* Employee */}
                  {employeeSS.length > 0 && (
                    <div className="px-6 py-5">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Employee Contributions</p>
                      <div className="space-y-3">
                        {employeeSS.map((row, i) => (
                          <div key={i} className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                {row.contribution_type}
                              </p>
                              {(row.employee_cap_annual ?? row.employer_cap_annual) && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                  Capped at {fmtCurrency(row.employee_cap_annual ?? row.employer_cap_annual, country.currency_code)}
                                </p>
                              )}
                            </div>
                            <span className="shrink-0 bg-sky-50 text-sky-700 font-bold text-sm px-3 py-1 rounded-full border border-sky-100">
                              {row.employee_rate !== 0 ? row.employee_rate : row.employer_rate}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Employer */}
                  {employerSS.length > 0 && (
                    <div className="px-6 py-5">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Employer Contributions</p>
                      <div className="space-y-3">
                        {employerSS.map((row, i) => (
                          <div key={i} className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                {row.contribution_type}
                              </p>
                              {(row.employee_cap_annual ?? row.employer_cap_annual) && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                  Capped at {fmtCurrency(row.employee_cap_annual ?? row.employer_cap_annual, country.currency_code)}
                                </p>
                              )}
                            </div>
                            <span className="shrink-0 bg-indigo-50 text-indigo-700 font-bold text-sm px-3 py-1 rounded-full border border-indigo-100">
                              {row.employee_rate !== 0 ? row.employee_rate : row.employer_rate}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ══════ SECTION 5 — EMPLOYMENT RULES ══════ */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Employment Rules Summary</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Key obligations for employers in {country.name}</p>
                </div>
                <Link
                  href={`/countries/${code}/employmentlaw/`}
                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-xs font-bold transition-colors"
                >
                  Full law detail <ChevronRight size={13} />
                </Link>
              </div>

              {!employmentRules ? (
                <div className="px-6 py-10 text-center text-slate-400">
                  <AlertCircle size={28} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">Employment rules data not yet available for {country.name}.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                  {[
                    { label: 'Minimum Wage',       value: fmtCurrency(employmentRules.minimum_wage, country.currency_code),         icon: '💰' },
                    { label: 'Annual Leave',        value: fmt(employmentRules.annual_leave_days, ' days'),                      icon: '🏖️' },
                    { label: 'Sick Leave',          value: fmt(employmentRules.sick_leave_days, ' days'),                        icon: '🏥' },
                    { label: 'Notice Period',       value: fmt(employmentRules.notice_period_days, ' days'),                     icon: '📋' },
                    { label: 'Probation Period',    value: fmt(employmentRules.probation_period_days, ' days'),                  icon: '⏱️' },
                    { label: 'Maternity Leave',     value: fmt(employmentRules.maternity_leave_weeks, ' weeks'),                 icon: '👶' },
                    { label: 'Paternity Leave',     value: fmt(employmentRules.paternity_leave_weeks, ' weeks'),                 icon: '👨‍👧' },
                    { label: 'Overtime Rate',       value: fmt(employmentRules.overtime_rate, '× standard rate'),               icon: '⚡' },
                    { label: 'Payroll Frequency',   value: fmt(employmentRules.payroll_frequency),                               icon: '📅' },
                    { label: '13th Month Pay',      value: employmentRules.thirteenth_month_pay ? 'Required' : 'Not required',  icon: '🎁' },
                  ].map(item => (
                    <div key={item.label} className="px-6 py-4 flex items-center gap-3">
                      <span className="text-xl shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ══════ SECTION 7 — OFFICIAL SOURCES ══════ */}
            {compliance.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                  <h2 className="font-bold text-slate-900 text-lg">Payroll Compliance Obligations</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Key employer obligations in {country.name}</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {compliance.map((item, i) => (
                    <div key={i} className="px-6 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                            {item.obligation_type}
                          </p>
                          <p className="text-sm text-slate-700">{item.description}</p>
                          {item.deadline && (
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                              <Calendar size={11} /> Deadline: {item.deadline}
                            </p>
                          )}
                        </div>
                        {item.authority_url && (
                          <a
                            href={item.authority_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            {item.authority_name ?? 'Official source'}
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══════ SECTION 7B — OFFICIAL SOURCES (static) ══════ */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 text-lg">Official Sources</h2>
                <p className="text-slate-400 text-xs mt-0.5">Government authorities for {country.name} payroll and tax</p>
              </div>
              <div className="px-6 py-5 space-y-3">
                {country.official_source_url ? (
                  <a
                    href={country.official_source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                        <Globe size={15} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                          Official Tax Authority
                        </p>
                        <p className="text-xs text-slate-400 truncate max-w-xs">{country.official_source_url}</p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-500 shrink-0" />
                  </a>
                ) : (
                  <p className="text-sm text-slate-400 py-4 text-center">
                    Official source links will be added when full data is verified.
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN — 1/3 width */}
          <div className="space-y-6">

            {/* ══════ SECTION 6 — MINI CALCULATOR ══════ */}
            <MiniCalculator
              countryCode={code}
              countryName={country.name}
              currency={country.currency_code}
              taxBrackets={taxBrackets}
              socialSecurity={socialSecurity}
              minimumWage={employmentRules?.minimum_wage ?? null}
              payrollFrequency={employmentRules?.payroll_frequency ?? null}
            />

            {/* Quick links card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Explore {country.name}</p>
              <div className="space-y-2">
                {[
                  { href: `/countries/${code}/payrollcalculator/`, icon: Calculator, label: 'Full Payroll Calculator',  sub: 'Complete line-by-line breakdown' },
                  { href: `/countries/${code}/tax-guide/`,          icon: BookOpen,   label: 'Tax Guide',               sub: 'All rates and allowances' },
                  { href: `/countries/${code}/employmentlaw/`,       icon: Scale,      label: 'Employment Law',          sub: 'Leave, notice, probation' },
                  { href: `/countries/${code}/hiring-guide/`,        icon: Briefcase,  label: 'Hiring Guide',            sub: 'How to hire in ${country.name}' },
                  { href: `/compare/?a=${code}`,                     icon: Globe,      label: 'Compare Countries',       sub: 'Side-by-side cost comparison' },
                ].map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
                  >
                    <div className="bg-blue-50 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                      <link.icon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{link.label}</p>
                      <p className="text-xs text-slate-400 truncate">{link.sub}</p>
                    </div>
                    <ChevronRight size={13} className="text-slate-300 group-hover:text-blue-400 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800 mb-1">Data Disclaimer</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    All data is sourced from official government publications and updated monthly.
                    This is for reference only and does not constitute professional tax or legal advice.
                    Always verify with a qualified local advisor.
                  </p>
                  <Link href="/disclaimer/" className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline mt-2 inline-block">
                    Read full disclaimer
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ══════ SECTION 8 — RELATED COUNTRIES ══════ */}
      {relatedCountries.length > 0 && (
        <section className="bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-2">Same Region</p>
                <h2 className="font-serif text-2xl font-bold text-slate-900">Related Countries</h2>
              </div>
              <Link
                href={`/countries/?region=${country.region?.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
              >
                All {country.region} <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedCountries.map(c => (
                <CountryCard
                  key={c.iso2}
                  iso2={c.iso2}
                  name={c.name}
                  flag_emoji={c.flag_emoji}
                  currency={c.currency_code}
                  region={c.region}
                  gpe_coverage_level={c.gpe_coverage_level}
                  payroll_complexity_score={c.payroll_complexity_score}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════ SECTION 9 — RELATED INSIGHTS ══════ */}
      {insights.length > 0 && (
        <section className="bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-2">Intelligence</p>
                <h2 className="font-serif text-2xl font-bold text-slate-900">Related Insights</h2>
              </div>
              <Link
                href="/insights/"
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
              >
                All articles <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {insights.map((article: any) => (
                <Link
                  key={article.slug?.current}
                  href={`/insights/${article.slug?.current}/`}
                  className="group bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg rounded-2xl overflow-hidden transition-all duration-200"
                >
                  <div className="h-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="p-6">
                    {article.category && (
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{article.category}</span>
                    )}
                    <h3 className="font-bold text-slate-900 text-base mt-2 mb-3 leading-snug group-hover:text-blue-700 transition-colors">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{article.excerpt}</p>
                    )}
                    <div className="mt-4 flex items-center gap-1.5 text-blue-600 text-sm font-semibold group-hover:gap-2.5 transition-all">
                      Read article <ChevronRight size={13} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  )
}
