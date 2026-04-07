import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getEmploymentRules } from '@/lib/supabase-queries'
import { ChevronRight, Scale, ArrowRight } from 'lucide-react'
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

  const ruleCards = [
    { icon: '💰', label: 'Minimum Wage',      value: employmentRules?.minimum_wage ? `${fmtCurrency(employmentRules.minimum_wage, country.currency_code)} ${fmtFrequency(employmentRules.payroll_frequency)}` : '—' },
    { icon: '🏖️', label: 'Annual Leave',      value: employmentRules?.annual_leave_days ? `${employmentRules.annual_leave_days} ${employmentRules.annual_leave_days === 1 ? 'day' : 'days'}` : '—' },
    { icon: '🏥', label: 'Sick Leave',         value: fmt(employmentRules?.sick_leave_days, ' days') },
    { icon: '📋', label: 'Notice Period',      value: employmentRules?.notice_period_days ? `${employmentRules.notice_period_days} ${employmentRules.notice_period_days === 1 ? 'day' : 'days'}` : '—' },
    { icon: '⏱️', label: 'Probation Period',   value: fmt(employmentRules?.probation_period_days, ' days') },
    { icon: '👶', label: 'Maternity Leave',    value: fmt(employmentRules?.maternity_leave_weeks, ' weeks') },
    { icon: '👨‍👧', label: 'Paternity Leave',  value: fmt(employmentRules?.paternity_leave_weeks, ' weeks') },
    { icon: '⚡', label: 'Overtime Rate',      value: employmentRules?.overtime_rate ? `${employmentRules.overtime_rate}× standard rate` : '—' },
    { icon: '🕐', label: 'Max Working Hours',  value: fmt(employmentRules?.working_hours_max, ' hrs/week') },
    { icon: '🎁', label: '13th Month Pay',     value: employmentRules ? (employmentRules.thirteenth_month_pay ? 'Required' : 'Not required') : '—' },
  ]

  return (
    <main className="bg-white flex-1">
      <CountrySubNav code={code} countryName={country.name} />

      {/* ══════ HERO ══════ */}
      <section className="relative bg-slate-950 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 0% 100%, rgba(14,30,80,0.4) 0%, transparent 50%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-14">

          {/* Breadcrumb */}
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
                <span className="text-blue-300 text-xs font-semibold tracking-wide">
                  Employment Law & HR Compliance
                </span>
              </div>
              <h1
                className="font-serif text-3xl lg:text-5xl font-bold text-white leading-tight mb-4"
                style={{ letterSpacing: '-0.025em' }}
              >
                {country.flag_emoji} {country.name}<br />
                <span className="text-blue-400">Employment Law</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed">
                Key employment obligations for {country.name} — leave entitlements, notice periods, minimum wage, and HR compliance rules for employers hiring in-country.
              </p>
            </div>
            <Link
              href={`/countries/${code.toLowerCase()}/`}
              className="shrink-0 flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/40 text-slate-300 hover:text-white rounded-xl px-5 py-3 text-sm font-medium transition-all"
            >
              ← {country.name} Overview
            </Link>
          </div>
        </div>
      </section>

      {/* ══════ MAIN CONTENT ══════ */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid gap-10 lg:grid-cols-3">

            {/* Main — 2/3 */}
            <div className="lg:col-span-2 space-y-8">

              {!employmentRules ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-800">
                  <strong>Data coming soon.</strong> Employment law data for {country.name} is being prepared. Check back shortly or view the country overview for available data.
                </div>
              ) : (
                <>
                  {/* Rule cards grid */}
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">
                      Employment Rules at a Glance
                    </h2>
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

                  {/* Disclaimer */}
                  <p className="text-xs text-slate-400">
                    Employment law data is sourced from official government publications and updated monthly. This information is for guidance only and does not constitute legal advice. Always consult a qualified employment lawyer for {country.name}-specific obligations.
                  </p>
                </>
              )}
            </div>

            {/* Sidebar — 1/3 */}
            <div className="space-y-5">

              {/* About this data */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">About This Data</p>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">✓</span> Sourced from official government publications</li>
                  <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">✓</span> Updated monthly — always current rules</li>
                  <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">✓</span> For guidance only — not legal advice</li>
                </ul>
              </div>

              {/* More for this country */}
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

              {/* EOR upsell */}
              <div
                className="rounded-2xl p-6 overflow-hidden relative"
                style={{ backgroundColor: '#0d1f3c' }}
              >
                <div
                  className="absolute inset-0"
                  style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(20,184,166,0.15) 0%, transparent 60%)' }}
                />
                <div className="relative">
                  <p className="text-teal-300 text-xs font-bold uppercase tracking-widest mb-3">EOR Intelligence</p>
                  <h3 className="font-serif text-lg font-bold text-white mb-2 leading-snug">
                    Hiring in {country.name} without a local entity?
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">
                    An Employer of Record handles local employment law compliance on your behalf. Explore EOR options for {country.name}.
                  </p>
                  <Link
                    href={`/eor/${code.toLowerCase()}/`}
                    className="block rounded-xl bg-teal-600 hover:bg-teal-500 px-4 py-3 text-center text-sm font-bold text-white transition-colors"
                  >
                    Explore EOR for {country.name}
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
