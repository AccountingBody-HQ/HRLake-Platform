import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getEmploymentRules } from '@/lib/supabase-queries'
import { ChevronRight, Scale, ArrowRight, Clock, UserX } from 'lucide-react'
import { PortableText } from '@portabletext/react'
import { getCountryArticle } from '@/lib/sanity'
import { getBreadcrumbStructuredData, jsonLd as toJsonLd } from '@/lib/structured-data'
import type { Metadata } from 'next'
import CountrySubNav from '@/components/CountrySubNav'

interface PageProps {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params
  const supabase = await createSupabaseServerClient()
  const { data: country } = await supabase
    .from('countries')
    .select('name')
    .eq('iso2', code.toUpperCase())
    .single()
  if (!country) return { title: 'Employment Law — HRLake' }
  const title = `${country.name} Employment Law & HR Compliance ${new Date().getFullYear()}`
  const description = `${country.name} employment law guide. Minimum wage, annual leave, notice periods, maternity leave, and HR compliance obligations for employers and HR teams.`
  return {
    title,
    description,
    alternates: { canonical: `https://hrlake.com/countries/${code.toLowerCase()}/employmentlaw/` },
    openGraph: {
      title,
      description,
      url: `https://hrlake.com/countries/${code.toLowerCase()}/employmentlaw/`,
      siteName: 'HRLake',
      type: 'website',
    },
  }
}

export const dynamic = 'force-dynamic'

function fmt(value: number | null | undefined, unit: string): string {
  if (value === null || value === undefined) return '—'
  return `${value}${unit}`
}

function fmtCurrency(value: number | null | undefined, currency: string | null): string {
  if (value === null || value === undefined) return '—'
  return `${currency ?? ''} ${value.toLocaleString('en-GB')}`
}

function fmtFrequency(value: string | null | undefined): string {
  if (!value) return '—'
  const map: Record<string, string> = {
    monthly: 'per month',
    weekly: 'per week',
    bi_weekly: 'bi-weekly',
    per_hour: 'per hour',
    per_day: 'per day',
    annual: 'per year',
  }
  const clean = value.toLowerCase().replace(/^[a-z]+_/, '')
  return map[value.toLowerCase()] ?? map[clean] ?? value.replace(/_/g, ' ').toLowerCase()
}

export default async function EmploymentLawPage({ params }: PageProps) {
  const { code } = await params
  const upperCode = code.toUpperCase()
  const supabase = await createSupabaseServerClient()

  const { data: country } = await supabase
    .from('countries')
    .select('iso2, name, currency_code, flag_emoji')
    .eq('iso2', upperCode)
    .single()

  if (!country) notFound()

  const employmentRules = await getEmploymentRules(upperCode)
  const sanityArticle = await getCountryArticle(upperCode, 'employment-law')

  const { data: workingHoursRows } = await supabase
    .schema('hrlake')
    .from('working_hours')
    .select('*')
    .eq('country_code', upperCode)
    .eq('is_current', true)
    .limit(1)
  const workingHours = workingHoursRows?.[0] ?? null

  const { data: terminationRows } = await supabase
    .schema('hrlake')
    .from('termination_rules')
    .select('*')
    .eq('country_code', upperCode)
    .eq('is_current', true)
    .limit(1)
  const termination = terminationRows?.[0] ?? null

  const ruleCards = [
    { icon: '💰', label: 'Minimum Wage',     value: employmentRules?.minimum_wage ? `${fmtCurrency(employmentRules.minimum_wage, country.currency_code)} ${fmtFrequency(employmentRules.payroll_frequency)}` : '—' },
    { icon: '🏖️', label: 'Annual Leave',     value: employmentRules?.annual_leave_days ? `${employmentRules.annual_leave_days} ${employmentRules.annual_leave_days === 1 ? 'day' : 'days'}` : '—' },
    { icon: '🏥', label: 'Sick Leave',        value: fmt(employmentRules?.sick_leave_days, ' days') },
    { icon: '📋', label: 'Notice Period',     value: employmentRules?.notice_period_days ? `${employmentRules.notice_period_days} ${employmentRules.notice_period_days === 1 ? 'day' : 'days'}` : '—' },
    { icon: '⏱️', label: 'Probation Period',  value: fmt(employmentRules?.probation_period_days, ' days') },
    { icon: '👶', label: 'Maternity Leave',   value: fmt(employmentRules?.maternity_leave_weeks, ' weeks') },
    { icon: '👨‍👧', label: 'Paternity Leave', value: fmt(employmentRules?.paternity_leave_weeks, ' weeks') },
    { icon: '⚡', label: 'Overtime Rate',     value: employmentRules?.overtime_rate ? `${employmentRules.overtime_rate}x standard rate` : '—' },
    { icon: '�', label: 'Max Working Hours', value: fmt(employmentRules?.working_hours_max, ' hrs/week') },
    { icon: '🎁', label: '13th Month Pay',    value: employmentRules ? (employmentRules.thirteenth_month_pay ? 'Required' : 'Not required') : '—' },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(getBreadcrumbStructuredData([
          { name: 'Home', href: '/' },
          { name: 'All Countries', href: '/countries/' },
          { name: country.name, href: '/countries/' + code.toLowerCase() + '/' },
          { name: country.name + ' Employment Law', href: '/countries/' + code.toLowerCase() + '/employmentlaw/' },
        ])) }}
      />
      <main className="bg-white flex-1">
        <CountrySubNav code={code} countryName={country.name} />

        {/* HERO */}
        <section className="relative bg-slate-950 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 0% 100%, rgba(14,30,80,0.4) 0%, transparent 50%)' }}
          />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-14">
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
              <Link href="/countries" className="hover:text-slate-300 transition-colors">Countries</Link>
              <ChevronRight size={13} className="text-slate-700" />
              <Link href={`/countries/${code.toLowerCase()}/`} className="hover:text-slate-300 transition-colors">
                {country.flag_emoji} {country.name}
              </Link>
              <ChevronRight size={13} className="text-slate-700" />
              <span className="text-slate-400">Employment Law</span>
            </nav>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-5">
                  <Scale size={12} className="text-blue-400" />
                  <span className="text-blue-300 text-xs font-semibold tracking-wide">Employment Law & HR Compliance</span>
                </div>
                <h1 className="font-serif text-3xl lg:text-5xl font-bold text-white leading-tight mb-4" style={{ letterSpacing: '-0.025em' }}>
                  {country.flag_emoji} {country.name}<br />
                  <span className="text-blue-400">Employment Law</span>
                </h1>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Key employment obligations for {country.name} — leave entitlements, notice periods, working hours, termination rules, and HR compliance for employers hiring in-country.
                </p>
              </div>
              <Link
                href={`/countries/${code.toLowerCase()}/`}
                className="shrink-0 flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/40 text-slate-300 hover:text-white rounded-xl px-5 py-3 text-sm font-medium transition-all"
              >
                &larr; {country.name} Overview
              </Link>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <section className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
            <div className="grid gap-10 lg:grid-cols-3">

              {/* Main 2/3 */}
              <div className="lg:col-span-2 space-y-8">

                {!employmentRules && !workingHours && !termination ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-800">
                    <strong>Data coming soon.</strong> Employment law data for {country.name} is being prepared. Check back shortly or view the country overview for available data.
                  </div>
                ) : (
                  <>
                    {/* Rule cards */}
                    {employmentRules && (
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">Employment Rules at a Glance</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {ruleCards.map((card) => (
                            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-start gap-4">
                              <div className="text-2xl shrink-0">{card.icon}</div>
                              <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{card.label}</p>
                                <p className="text-lg font-bold text-slate-900">{card.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Working Hours */}
                    {workingHours && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                            <Clock size={18} className="text-blue-600" />
                          </div>
                          <h2 className="font-serif text-2xl font-bold text-slate-900">Working Hours</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                          {workingHours.standard_hours_per_week != null && (
                            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Standard Hours</p>
                              <p className="text-xl font-bold text-slate-900">{workingHours.standard_hours_per_week}<span className="text-sm font-medium text-slate-500 ml-1">hrs/week</span></p>
                            </div>
                          )}
                          {workingHours.maximum_hours_per_week != null && (
                            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Maximum Hours</p>
                              <p className="text-xl font-bold text-slate-900">{workingHours.maximum_hours_per_week}<span className="text-sm font-medium text-slate-500 ml-1">hrs/week</span></p>
                            </div>
                          )}
                          {workingHours.overtime_rate_multiplier != null && (
                            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Overtime Rate</p>
                              <p className="text-xl font-bold text-slate-900">{workingHours.overtime_rate_multiplier}<span className="text-sm font-medium text-slate-500 ml-1">x rate</span></p>
                            </div>
                          )}
                          {workingHours.overtime_threshold_daily != null && (
                            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Daily OT Threshold</p>
                              <p className="text-xl font-bold text-slate-900">{workingHours.overtime_threshold_daily}<span className="text-sm font-medium text-slate-500 ml-1">hrs/day</span></p>
                            </div>
                          )}
                          {workingHours.overtime_threshold_weekly != null && (
                            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Weekly OT Threshold</p>
                              <p className="text-xl font-bold text-slate-900">{workingHours.overtime_threshold_weekly}<span className="text-sm font-medium text-slate-500 ml-1">hrs/week</span></p>
                            </div>
                          )}
                        </div>
                        {workingHours.notes && (
                          <p className="text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">{workingHours.notes}</p>
                        )}
                        {workingHours.source_url && (
                          <a href={workingHours.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 mt-3 transition-colors">
                            Official source &nearr;
                          </a>
                        )}
                      </div>
                    )}

                    {/* Termination Rules */}
                    {termination && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                            <UserX size={18} className="text-red-500" />
                          </div>
                          <h2 className="font-serif text-2xl font-bold text-slate-900">Termination & Redundancy</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                          {termination.notice_period_min_days != null && (
                            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Min Notice Period</p>
                              <p className="text-xl font-bold text-slate-900">{termination.notice_period_min_days}<span className="text-sm font-medium text-slate-500 ml-1">{termination.notice_period_min_days === 1 ? 'day' : 'days'}</span></p>
                            </div>
                          )}
                          {termination.probation_period_max_months != null && ()
                            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Max Probation</p>
                              <p className="text-xl font-bold text-slate-900">{termination.probation_period_max_months}<span className="text-sm font-medium text-slate-500 ml-1">{termination.probation_period_max_months === 1 ? 'month' : 'months'}</span></p>
                            </div>
                          )}
                          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Severance</p>
                            <p className="text-xl font-bold" style={{ color: termination.severance_mandatory ? '#10b981' : '#64748b' }}>
                              {termination.severance_mandatory ? 'Mandatory' : 'Not required'}
                            </p>
                          </div>
                          {termination.garden_leave_allowed != null && (
                            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Garden Leave</p>
                              <p className="text-xl font-bold" style={{ color: termination.garden_leave_allowed ? '#10b981' : '#64748b' }}>
                                {termination.garden_leave_allowed ? 'Permitted' : 'Not permitted'}
                              </p>
                            </div>
                          )}
                          {termination.unfair_dismissal_threshold_months != null && (
                            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Unfair Dismissal From</p>
                              <p className="text-xl font-bold text-slate-900">{termination.unfair_dismissal_threshold_months}<span className="text-sm font-medium text-slate-500 ml-1">months</span></p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-4 border-t border-slate-100 pt-5">
                          {termination.notice_period_formula && (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Notice Period Formula</p>
                              <p className="text-sm text-slate-700 leading-relaxed">{termination.notice_period_formula}</p>
                            </div>
                          )}
                          {termination.severance_formula && (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Severance Calculation</p>
                              <p className="text-sm text-slate-700 leading-relaxed">{termination.severance_formula}</p>
                            </div>
                          )}
                          {termination.redundancy_rules && (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Redundancy Rules</p>
                              <p className="text-sm text-slate-700 leading-relaxed">{termination.redundancy_rules}</p>
                            </div>
                          )}
                          {termination.notes && (
                            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                              <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">Important Notes</p>
                              <p className="text-sm text-amber-800 leading-relaxed">{termination.notes}</p>
                            </div>
                          )}
                        </div>
                        {termination.source_url && (
                          <a href={termination.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 mt-4 transition-colors">
                            Official source &nearr;
                          </a>
                        )}
                      </div>
                    )}

                    {/* Sanity article */}
                    {sanityArticle?.body && (
                      <div className="prose max-w-none">
                        <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">
                          {country.name} Employment Law — Full Guide
                        </h2>
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                          <PortableText value={sanityArticle.body} />
                        </div>
                      </div>
                    )}

                    {/* EOR CTA */}
                    <div className="rounded-2xl border border-teal-100 bg-teal-50 p-6 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-teal-600 text-xs font-bold uppercase tracking-widest mb-1">EOR Intelligence</p>
                        <p className="font-semibold text-slate-900">Outsource employment law compliance in {country.name}.</p>
                        <p className="text-sm text-slate-500 mt-1">An Employer of Record handles all local obligations — contracts, leave, termination, and more.</p>
                      </div>
                      <Link href={`/eor/${code.toLowerCase()}/`} className="shrink-0 inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors">
                        Explore EOR <ArrowRight size={14} />
                      </Link>
                    </div>

                    {/* Calculator CTA */}
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-1">Payroll Calculator</p>
                        <p className="font-semibold text-slate-900">Calculate the real cost of employment in {country.name}.</p>
                        <p className="text-sm text-slate-500 mt-1">Net salary, income tax, employer social security, and total cost of hire.</p>
                      </div>
                      <Link href={`/countries/${code.toLowerCase()}/payroll-calculator/`} className="shrink-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors">
                        Open Calculator <ArrowRight size={14} />
                      </Link>
                    </div>

                    <p className="text-xs text-slate-400">
                      Employment law data is sourced from official government publications and updated monthly. This information is for guidance only and does not constitute legal advice. Always consult a qualified employment lawyer for {country.name}-specific obligations.
                    </p>
                  </>
                )}
              </div>

              {/* Sidebar 1/3 */}
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">About This Data</p>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">✓</span> Sourced from official government publications</li>
                    <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">✓</span> Updated monthly — always current rules</li>
                    <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">✓</span> For guidance only — not legal advice</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">More for {country.name}</p>
                  <ul className="space-y-1">
                    {[
                      { label: 'Country Overview', href: `/countries/${code.toLowerCase()}/` },
                      { label: 'Payroll Calculator', href: `/countries/${code.toLowerCase()}/payroll-calculator/` },
                      { label: 'Tax Guide', href: `/countries/${code.toLowerCase()}/tax-guide/` },
                      { label: 'Payroll Guide', href: `/countries/${code.toLowerCase()}/payroll-guide/` },
                      { label: 'Hiring Guide', href: `/countries/${code.toLowerCase()}/hiring-guide/` },
                      { label: 'HR Compliance', href: `/countries/${code.toLowerCase()}/hr-compliance/` },
                      { label: 'Leave & Benefits', href: `/countries/${code.toLowerCase()}/leave-benefits/` },
                      { label: 'Compliance Calendar', href: `/countries/${code.toLowerCase()}/compliance-calendar/` },
                      { label: 'EOR Guide', href: `/eor/${code.toLowerCase()}/` },
                    ].map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors group"
                        >
                          {link.label}
                          <ArrowRight size={13} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl p-6 overflow-hidden relative" style={{ backgroundColor: '#0d1f3c' }}>
                  <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(20,184,166,0.15) 0%, transparent 60%)' }} />
                  <div className="relative">
                    <p className="text-teal-300 text-xs font-bold uppercase tracking-widest mb-3">EOR Intelligence</p>
                    <h3 className="font-serif text-lg font-bold text-white mb-2 leading-snug">Hiring in {country.name} without a local entity?</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-5">An Employer of Record handles local employment law compliance on your behalf.</p>
                    <Link href={`/eor/${code.toLowerCase()}/`} className="block rounded-xl bg-teal-600 hover:bg-teal-500 px-4 py-3 text-center text-sm font-bold text-white transition-colors">
                      Explore EOR for {country.name}
                    </Link>
                  </div>
                </div>

                <div className="rounded-2xl p-6 overflow-hidden relative" style={{ backgroundColor: '#0d1f3c' }}>
                  <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(30,111,255,0.2) 0%, transparent 60%)' }} />
                  <div className="relative">
                    <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-3">Free Tool</p>
                    <h3 className="font-serif text-lg font-bold text-white mb-2 leading-snug">Compare employment law across countries.</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-5">Side-by-side employment rule analysis — leave, notice periods, and obligations across all active countries.</p>
                    <Link href="/compare/" className="block rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-3 text-center text-sm font-bold text-white transition-colors">
                      Compare countries
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
    </>
  )
}
