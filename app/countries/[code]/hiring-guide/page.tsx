import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFlag } from '@/lib/flag'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getEmploymentRules, getPayrollCompliance } from '@/lib/supabase-queries'
import { ChevronRight, Briefcase, ArrowRight } from 'lucide-react'
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
  if (!country) return { title: 'Hiring Guide — HRLake' }
  const title = `Hiring in ${country.name} — Employer Guide ${new Date().getFullYear()}`
  const description = `Complete guide to hiring in ${country.name}. Employment contracts, onboarding obligations, payroll setup, and HR compliance requirements for employers and EOR teams.`
  return {
    title,
    description,
    alternates: { canonical: `https://hrlake.com/countries/${code.toLowerCase()}/hiring-guide/` },
    openGraph: {
      title,
      description,
      url: `https://hrlake.com/countries/${code.toLowerCase()}/hiring-guide/`,
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

export default async function HiringGuidePage({ params }: PageProps) {
  const { code } = await params
  const upperCode = code.toUpperCase()
  const supabase = await createSupabaseServerClient()

  const { data: country } = await supabase
    .from('countries')
    .select('iso2, name, currency_code, currency_symbol, flag_emoji')
    .eq('iso2', upperCode)
    .single()

  if (!country) notFound()

  const [sanityArticle, employmentRules, compliance, contractorRow, workPermitsRows] = await Promise.all([
    getCountryArticle(upperCode, 'hiring-guide'),
    getEmploymentRules(upperCode),
    getPayrollCompliance(upperCode),
    supabase.schema('hrlake').from('contractor_rules').select('*').eq('country_code', upperCode).eq('is_current', true).limit(1).then(r => ({ data: r.data?.[0] ?? null })),
    supabase.schema('hrlake').from('work_permits').select('*').eq('country_code', upperCode).eq('is_current', true).order('processing_days_min', { ascending: true }),
  ])
  const contractorRules = contractorRow.data
  const workPermits = workPermitsRows.data ?? []

  const hiringSteps = [
    {
      step: '01',
      title: 'Verify your hiring structure',
      body: `Decide whether to hire via a local legal entity, a Professional Employer Organisation (PEO), or an Employer of Record (EOR). An EOR lets you hire in ${country.name} without setting up a local company.`,
    },
    {
      step: '02',
      title: 'Issue a compliant employment contract',
      body: `All employees in ${country.name} must receive a written employment contract. It must cover job title, salary, working hours, notice period, and leave entitlements before or on the first day of employment.`,
    },
    {
      step: '03',
      title: 'Register for payroll and tax',
      body: `You must register with the relevant ${country.name} tax authority before making any salary payments. Payroll must be run in local currency and employer contributions must be filed on time.`,
    },
    {
      step: '04',
      title: 'Enrol in social security',
      body: `Employers in ${country.name} are required to enrol employees in the national social security scheme from day one. Both employer and employee contributions are mandatory.`,
    },
    {
      step: '05',
      title: 'Run compliant payroll',
      body: `Pay must meet the statutory minimum wage, be paid on the agreed frequency, and include all mandatory deductions. Keep payslip records for the legally required retention period.`,
    },
    {
      step: '06',
      title: 'Understand termination rules',
      body: `Notice periods, severance, and redundancy rules in ${country.name} are governed by employment law. Always seek local legal advice before terminating an employment contract.`,
    },
  ]

  const keyFacts = [
    { label: 'Minimum Wage', value: employmentRules?.minimum_wage ? fmtCurrency(employmentRules.minimum_wage, country.currency_symbol ?? country.currency_code) : '—' },
    { label: 'Annual Leave', value: employmentRules?.annual_leave_days ? `${employmentRules.annual_leave_days} ${employmentRules.annual_leave_days === 1 ? 'day' : 'days'}` : '—' },
    { label: 'Notice Period (min)', value: employmentRules?.notice_period_days ? `${employmentRules.notice_period_days} ${employmentRules.notice_period_days === 1 ? 'day' : 'days'}` : '—' },
    { label: 'Probation Period (max)', value: fmt(employmentRules?.probation_period_days, ' days') },
    { label: 'Maternity Leave', value: fmt(employmentRules?.maternity_leave_weeks, ' weeks') },
    { label: '13th Month Pay', value: employmentRules ? (employmentRules.thirteenth_month_pay ? 'Required' : 'Not required') : '—' },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(getBreadcrumbStructuredData([
          { name: 'Home', href: '/' },
          { name: 'All Countries', href: '/countries/' },
          { name: country.name, href: '/countries/' + code.toLowerCase() + '/' },
          { name: 'Hiring in ' + country.name, href: '/countries/' + code.toLowerCase() + '/hiring-guide/' },
        ])) }}
      />
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
              {getFlag(country.iso2)} {country.name}
            </Link>
            <ChevronRight size={13} className="text-slate-700" />
            <span className="text-slate-400">Hiring Guide</span>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-5">
                <Briefcase size={12} className="text-blue-400" />
                <span className="text-blue-300 text-xs font-semibold tracking-wide">
                  Employer Hiring Guide · {country.name}
                </span>
              </div>
              <h1
                className="font-serif text-3xl lg:text-5xl font-bold text-white leading-tight mb-4"
                style={{ letterSpacing: '-0.025em' }}
              >
                {getFlag(country.iso2)} Hiring in<br />
                <span className="text-blue-400">{country.name}</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed">
                What every employer needs to know before hiring in {country.name} — contracts, payroll setup, social security, and HR compliance obligations.
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
            <div className="lg:col-span-2 space-y-10">

              {/* Key facts */}
              <div>
                <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">
                  Key Employment Facts — {country.name}
                </h2>
                {!employmentRules ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-800">
                    <strong>Data coming soon.</strong> Employment data for {country.name} is being prepared.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {keyFacts.map((fact) => (
                      <div key={fact.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{fact.label}</p>
                        <p className="text-lg font-bold text-slate-900">{fact.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step by step */}
              <div>
                <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">
                  How to Hire in {country.name} — Step by Step
                </h2>
                <div className="space-y-4">
                  {hiringSteps.map((s) => (
                    <div key={s.step} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex gap-5">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-black tracking-wider">
                        {s.step}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">{s.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{s.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payroll compliance */}
              {compliance.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">
                    Payroll Compliance Obligations
                  </h2>
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          <th className="px-6 py-3">Obligation</th>
                          <th className="px-6 py-3">Frequency</th>
                          <th className="px-6 py-3">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {compliance.map((c: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900 capitalize">{c.obligation_type?.replace(/_/g, ' ') ?? '—'}</td>
                            <td className="px-6 py-4 text-sm text-slate-600 capitalize">{c.frequency?.replace(/_/g, ' ') ?? '—'}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{c.notes ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Contractor rules */}
              {contractorRules && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900 mb-2">Contractor Classification Rules — {country.name}</h2>
                  <p className="text-sm text-slate-500 mb-6">How {country.name} distinguishes employees from independent contractors, and the risks of misclassification.</p>
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Classification Test</p>
                      <p className="text-sm font-semibold text-slate-900">{contractorRules.classification_test}</p>
                    </div>
                    {contractorRules.key_factors && contractorRules.key_factors.length > 0 && (
                      <div className="px-6 py-5 border-b border-slate-100">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Key Classification Factors</p>
                        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                          {contractorRules.key_factors.map((factor: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                              <span className="text-blue-400 mt-0.5 shrink-0">✓</span>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {contractorRules.misclassification_penalty && (
                      <div className="px-6 py-4 border-b border-slate-100 bg-red-50">
                        <p className="text-xs font-bold uppercase tracking-widest text-red-600 mb-1">Misclassification Penalties</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{contractorRules.misclassification_penalty}</p>
                      </div>
                    )}
                    {contractorRules.ir35_equivalent && (
                      <div className="px-6 py-4 border-b border-slate-100 bg-amber-50">
                        <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-1">Off-Payroll / IR35 Equivalent</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{contractorRules.ir35_equivalent}</p>
                      </div>
                    )}
                    {contractorRules.platform_worker_law && (
                      <div className="px-6 py-4 border-b border-slate-100">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Platform Worker Law</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{contractorRules.platform_worker_law}</p>
                      </div>
                    )}
                    {contractorRules.safe_harbour_criteria && (
                      <div className="px-6 py-4 border-b border-slate-100">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Safe Harbour Criteria</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{contractorRules.safe_harbour_criteria}</p>
                      </div>
                    )}
                    {contractorRules.notes && (
                      <div className="px-6 py-4 bg-slate-50">
                        <p className="text-xs text-slate-500 leading-relaxed">{contractorRules.notes}</p>
                      </div>
                    )}
                    {contractorRules.official_url && (
                      <div className="px-6 py-3 border-t border-slate-100">
                        <a href={contractorRules.official_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Official source ↗</a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Work permits */}
              {workPermits.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900 mb-2">Work Permits — {country.name}</h2>
                  <p className="text-sm text-slate-500 mb-6">Main visa and work permit routes for hiring foreign nationals in {country.name}.</p>
                  <div className="space-y-4">
                    {workPermits.map((p: any, i: number) => (
                      <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                          <h3 className="font-semibold text-slate-900">{p.permit_type}</h3>
                          <div className="flex flex-wrap gap-2">
                            {p.requires_employer_sponsor && (
                              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">Employer Sponsored</span>
                            )}
                            {p.quota_system && (
                              <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">Quota System</span>
                            )}
                            {p.renewable && (
                              <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">Renewable</span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Processing</p>
                            <p className="text-sm font-semibold text-slate-900">
                              {p.processing_days_min && p.processing_days_max
                                ? `${p.processing_days_min}–${p.processing_days_max} days`
                                : p.processing_days_min
                                ? `${p.processing_days_min}+ days`
                                : '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Validity</p>
                            <p className="text-sm font-semibold text-slate-900">
                              {p.validity_months ? `${p.validity_months} months` : 'Permanent'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Cost</p>
                            <p className="text-sm font-semibold text-slate-900">
                              {p.cost_local_currency
                                ? `${p.currency_code ?? ''} ${p.cost_local_currency.toLocaleString()}`.trim()
                                : 'Varies'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Sponsor Needed</p>
                            <p className="text-sm font-semibold text-slate-900">{p.requires_employer_sponsor ? 'Yes' : 'No'}</p>
                          </div>
                        </div>
                        {p.notes && <p className="text-sm text-slate-500 leading-relaxed">{p.notes}</p>}
                        {p.official_url && (
                          <a href={p.official_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-xs text-blue-600 hover:underline">Official source ↗</a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sanity article */}
              {sanityArticle?.body && (
                <div className="prose max-w-none">
                  <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">
                    Hiring in {country.name} — Full Guide
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
                  <p className="font-semibold text-slate-900">Skip the entity setup — hire via EOR in {country.name}.</p>
                  <p className="text-sm text-slate-500 mt-1">An Employer of Record handles all local compliance on your behalf.</p>
                </div>
                <Link
                  href={`/eor/${code.toLowerCase()}/`}
                  className="shrink-0 inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors"
                >
                  Explore EOR <ArrowRight size={14} />
                </Link>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-slate-400">
                This guide is for informational purposes only and does not constitute legal or HR advice. Employment law in {country.name} is subject to change. Always consult a qualified local employment lawyer before hiring.
              </p>

            </div>

            {/* Sidebar — 1/3 */}
            <div className="space-y-5">

              {/* About this data */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">About This Guide</p>
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
                    { label: 'Employment Law', href: `/countries/${code.toLowerCase()}/employmentlaw/` },
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

              {/* Pro upsell */}
              <div
                className="rounded-2xl p-6 overflow-hidden relative"
                style={{ backgroundColor: '#0d1f3c' }}
              >
                <div
                  className="absolute inset-0"
                  style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(30,111,255,0.2) 0%, transparent 60%)' }}
                />
                <div className="relative">
                  <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-3">Free Tool</p>
                  <h3 className="font-serif text-lg font-bold text-white mb-2 leading-snug">
                    Compare hiring costs across countries.
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">
                    Side-by-side employer cost analysis, saved calculations, and PDF reports.
                  </p>
                  <Link
                    href="/compare/"
                    className="block rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-3 text-center text-sm font-bold text-white transition-colors"
                  >
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
