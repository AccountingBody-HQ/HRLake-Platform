import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFlag } from '@/lib/flag'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getEmploymentRules, getPayrollCompliance } from '@/lib/supabase-queries'
import { ChevronRight, ShieldCheck, ArrowRight } from 'lucide-react'
import { getBreadcrumbStructuredData, jsonLd as toJsonLd } from '@/lib/structured-data'
import { PortableText } from '@portabletext/react'
import { getCountryArticle } from '@/lib/sanity'
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
  if (!country) return { title: 'HR Compliance Guide — HRLake' }
  const title = `${country.name} HR Compliance Guide — Employer Obligations ${new Date().getFullYear()}`
  const description = `HR compliance requirements for employers in ${country.name}. Employment contracts, working time rules, data protection, discrimination law and health and safety obligations.`
  return {
    title,
    description,
    alternates: { canonical: `https://hrlake.com/countries/${code.toLowerCase()}/hr-compliance/` },
    openGraph: {
      title,
      description,
      url: `https://hrlake.com/countries/${code.toLowerCase()}/hr-compliance/`,
      siteName: 'HRLake',
      type: 'website',
    },
  }
}

export const dynamic = 'force-dynamic'

export default async function HRCompliancePage({ params }: PageProps) {
  const { code } = await params
  const upperCode = code.toUpperCase()
  const supabase = await createSupabaseServerClient()

  const { data: country } = await supabase
    .from('countries')
    .select('iso2, name, currency_code, flag_emoji')
    .eq('iso2', upperCode)
    .single()

  if (!country) notFound()

  const { data: workingHours } = await supabase
    .schema('hrlake')
    .from('working_hours')
    .select('*')
    .eq('country_code', upperCode)
    .eq('is_current', true)
    .limit(1)
    .then(r => ({ data: r.data?.[0] ?? null }))

  const [sanityArticle, employmentRules, compliance, healthInsuranceRows, recordRetentionRows] = await Promise.all([
    getCountryArticle(upperCode, 'hr-compliance-guide'),
    getEmploymentRules(upperCode),
    getPayrollCompliance(upperCode),
    supabase.schema('hrlake').from('health_insurance').select('*').eq('country_code', upperCode).eq('is_current', true).order('is_mandatory', { ascending: false }),
    supabase.schema('hrlake').from('record_retention').select('*').eq('country_code', upperCode).eq('is_current', true).order('retention_years', { ascending: false }),
  ])

  const healthInsurance = healthInsuranceRows.data ?? []
  const recordRetention = recordRetentionRows.data ?? []

  const { data: remoteWorkData } = await supabase
    .schema('hrlake')
    .from('remote_work_rules')
    .select('*')
    .eq('country_code', upperCode)
    .eq('is_current', true)
    .limit(1)
  const remoteWork = remoteWorkData?.[0] ?? null

  const complianceAreas = [
    {
      step: '01',
      title: 'Employment contracts',
      body: `All employees in ${country.name} must have a written employment contract issued before or on the first day of work. It must cover role, salary, working hours, notice period, and leave entitlements.`,
    },
    {
      step: '02',
      title: 'Working time regulations',
      body: `${country.name} law governs maximum working hours, mandatory rest breaks, and overtime rules. Employers must keep accurate records of hours worked. Violations can result in significant fines.`,
    },
    {
      step: '03',
      title: 'Anti-discrimination obligations',
      body: `Employers in ${country.name} are prohibited from discriminating on grounds including age, gender, race, religion, disability, and sexual orientation. This applies to recruitment, pay, promotion, and termination.`,
    },
    {
      step: '04',
      title: 'Data protection and employee privacy',
      body: `Employee personal data must be handled in accordance with ${country.name} data protection law. This includes payroll data, health records, and performance data. Employees have the right to access their personal data.`,
    },
    {
      step: '05',
      title: 'Health and safety',
      body: `Employers in ${country.name} have a statutory duty of care to provide a safe working environment. Risk assessments must be conducted and documented. Employees must be trained in relevant health and safety procedures.`,
    },
    {
      step: '06',
      title: 'Record keeping',
      body: `${country.name} law requires employers to retain employment records for a minimum statutory period including contracts, payslips, absence records, and disciplinary records.`,
    },
  ]

  const workingHoursFacts = workingHours ? [
    { label: 'Standard Weekly Hours', value: workingHours.standard_hours_per_week ? `${workingHours.standard_hours_per_week} hrs` : '—' },
    { label: 'Max Weekly Hours', value: workingHours.maximum_hours_per_week ? `${workingHours.maximum_hours_per_week} hrs` : '—' },
    { label: 'Overtime Rate', value: workingHours.overtime_rate_multiplier ? `${workingHours.overtime_rate_multiplier}× standard rate` : '—' },
  ] : []

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(getBreadcrumbStructuredData([
          { name: 'Home', href: '/' },
          { name: 'All Countries', href: '/countries/' },
          { name: country.name, href: '/countries/' + code.toLowerCase() + '/' },
          { name: country.name + ' HR Compliance', href: '/countries/' + code.toLowerCase() + '/hr-compliance/' },
        ])) }}
      />
      <main className="bg-white flex-1">
      <CountrySubNav code={code} countryName={country.name} />
      <section className="relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 0% 100%, rgba(14,30,80,0.4) 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-14">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/countries" className="hover:text-slate-300 transition-colors">Countries</Link>
            <ChevronRight size={13} className="text-slate-700" />
            <Link href={`/countries/${code.toLowerCase()}/`} className="hover:text-slate-300 transition-colors">
              {getFlag(country.iso2)} {country.name}
            </Link>
            <ChevronRight size={13} className="text-slate-700" />
            <span className="text-slate-400">HR Compliance</span>
          </nav>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-5">
                <ShieldCheck size={12} className="text-blue-400" />
                <span className="text-blue-300 text-xs font-semibold tracking-wide">HR Compliance Guide · {country.name}</span>
              </div>
              <h1 className="font-serif text-3xl lg:text-5xl font-bold text-white leading-tight mb-4" style={{ letterSpacing: '-0.025em' }}>
                {getFlag(country.iso2)} HR Compliance in<br /><span className="text-blue-400">{country.name}</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed">
                Employment contract requirements, working time rules, data protection, discrimination law and health and safety obligations for employers in {country.name}.
              </p>
            </div>
            <Link href={`/countries/${code.toLowerCase()}/`} className="shrink-0 flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/40 text-slate-300 hover:text-white rounded-xl px-5 py-3 text-sm font-medium transition-all">
              ← {country.name} Overview
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-10">

              {workingHoursFacts.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">Working Time Rules — {country.name}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {workingHoursFacts.map((fact) => (
                      <div key={fact.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{fact.label}</p>
                        <p className="text-lg font-bold text-slate-900">{fact.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">HR Compliance Areas — {country.name}</h2>
                <div className="space-y-4">
                  {complianceAreas.map((s) => (
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

              {(compliance ?? []).length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">Compliance Obligations</h2>
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
                            <td className="px-6 py-4 text-sm font-medium text-slate-900 capitalize">{c.obligation_type?.replace(/_/g, " ") ?? "—"}</td>
                            <td className="px-6 py-4 text-sm text-slate-600 capitalize">{c.frequency?.replace(/_/g, " ") ?? "—"}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{c.notes ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}


              {healthInsurance.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900 mb-2">Health Insurance Schemes — {country.name}</h2>
                  <p className="text-sm text-slate-500 mb-6">Public and private health insurance schemes applicable to employers and employees in {country.name}.</p>
                  <div className="space-y-4">
                    {healthInsurance.map((h: any, i: number) => {
                      const typeColour: Record<string, string> = {
                        public: 'bg-blue-50 text-blue-700',
                        private_mandatory: 'bg-red-50 text-red-700',
                        private_optional: 'bg-slate-100 text-slate-600',
                      }
                      const typeLabel: Record<string, string> = {
                        public: 'Public',
                        private_mandatory: 'Private — Mandatory',
                        private_optional: 'Private — Optional',
                      }
                      const empCost = h.employer_rate_percentage
                        ? `${h.employer_rate_percentage}% of salary`
                        : h.employer_flat_amount
                        ? `${country.currency_code} ${h.employer_flat_amount}`
                        : 'Varies / See notes'
                      const eeCost = h.employee_rate_percentage
                        ? `${h.employee_rate_percentage}% of salary`
                        : h.employee_flat_amount
                        ? `${country.currency_code} ${h.employee_flat_amount}`
                        : 'Varies / See notes'
                      return (
                        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-slate-900">{h.scheme_name}</h3>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColour[h.scheme_type] ?? 'bg-slate-100 text-slate-600'}`}>
                                {typeLabel[h.scheme_type] ?? h.scheme_type}
                              </span>
                              {h.is_mandatory && (
                                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">Mandatory</span>
                              )}
                            </div>
                            {h.government_scheme_url && (
                              <a href={h.government_scheme_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline shrink-0">Official source ↗</a>
                            )}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-3">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Employer Cost</p>
                              <p className="text-sm font-semibold text-slate-900">{empCost}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Employee Cost</p>
                              <p className="text-sm font-semibold text-slate-900">{eeCost}</p>
                            </div>
                            {h.applies_above_employees && (
                              <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">Applies Above</p>
                                <p className="text-sm font-semibold text-slate-900">{h.applies_above_employees}+ employees</p>
                              </div>
                            )}
                          </div>
                          {h.notes && <p className="text-sm text-slate-500 leading-relaxed">{h.notes}</p>}
                          {h.opt_out_conditions && (
                            <p className="text-xs text-slate-400 mt-2 italic">Opt-out: {h.opt_out_conditions}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {recordRetention.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900 mb-2">Record Retention Requirements — {country.name}</h2>
                  <p className="text-sm text-slate-500 mb-6">Mandatory record keeping periods for employers in {country.name}.</p>
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          <th className="px-6 py-3">Record Type</th>
                          <th className="px-6 py-3">Retention</th>
                          <th className="px-6 py-3">Basis</th>
                          <th className="px-6 py-3">Digital OK</th>
                          <th className="px-6 py-3">Regulator</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recordRetention.map((r: any, i: number) => {
                          const basisLabel: Record<string, string> = {
                            from_date_of_document: 'From document date',
                            from_end_of_tax_year: 'From end of tax year',
                            from_termination: 'From termination',
                          }
                          return (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4">
                                <p className="text-sm font-medium text-slate-900">{r.record_type}</p>
                                {r.penalty_for_non_compliance && (
                                  <p className="text-xs text-red-500 mt-0.5">{r.penalty_for_non_compliance}</p>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                                  {r.retention_years} years
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-500">{basisLabel[r.retention_basis] ?? r.retention_basis}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${r.digital_records_accepted ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                  {r.digital_records_accepted ? 'Yes' : 'No'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs text-slate-500">
                                {r.official_url ? (
                                  <a href={r.official_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{r.regulator ?? 'Official source'} ↗</a>
                                ) : (r.regulator ?? '—')}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {remoteWork && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900 mb-2">Remote Work Rules — {country.name}</h2>
                  <p className="text-sm text-slate-500 mb-6">Permanent establishment risk, tax thresholds, and digital nomad visa information for {country.name}.</p>
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
                      {[
                        { label: 'PE Risk Threshold', value: remoteWork.pe_risk_threshold_days ? `${remoteWork.pe_risk_threshold_days} days` : 'No income tax' },
                        { label: 'Tax Liability After', value: remoteWork.tax_liability_threshold_days ? `${remoteWork.tax_liability_threshold_days} days` : 'No income tax' },
                        { label: 'Work Permit After', value: remoteWork.work_permit_required_after_days ? `${remoteWork.work_permit_required_after_days} days` : 'From day 1' },
                        { label: 'Digital Nomad Visa', value: remoteWork.digital_nomad_visa_available ? `Yes — ${remoteWork.digital_nomad_visa_duration_months} months` : 'Not available' },
                      ].map((stat) => (
                        <div key={stat.label} className="px-5 py-4">
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                          <p className="text-sm font-bold text-slate-900">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                    {remoteWork.social_security_implications && (
                      <div className="px-6 py-4 border-b border-slate-100">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Social Security Implications</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{remoteWork.social_security_implications}</p>
                      </div>
                    )}
                    {remoteWork.digital_nomad_visa_available && remoteWork.digital_nomad_visa_requirements && (
                      <div className="px-6 py-4 border-b border-slate-100 bg-green-50">
                        <p className="text-xs font-bold uppercase tracking-widest text-green-700 mb-2">Digital Nomad Visa Requirements</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{remoteWork.digital_nomad_visa_requirements}</p>
                      </div>
                    )}
                    {remoteWork.bilateral_agreements && remoteWork.bilateral_agreements.length > 0 && (
                      <div className="px-6 py-4 border-b border-slate-100">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Bilateral Agreements</p>
                        <div className="flex flex-wrap gap-2">
                          {remoteWork.bilateral_agreements.map((country: string, i: number) => (
                            <span key={i} className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">{country}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {remoteWork.notes && (
                      <div className="px-6 py-4 bg-slate-50">
                        <p className="text-xs text-slate-500 leading-relaxed">{remoteWork.notes}</p>
                      </div>
                    )}
                    {remoteWork.source_url && (
                      <div className="px-6 py-3 border-t border-slate-100">
                        <a href={remoteWork.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Official source ↗</a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {sanityArticle?.body && (
                <div className="prose max-w-none">
                  <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">
                    {country.name} HR Compliance — Full Guide
                  </h2>
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <PortableText value={sanityArticle.body} />
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-teal-100 bg-teal-50 p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-teal-600 text-xs font-bold uppercase tracking-widest mb-1">EOR Intelligence</p>
                  <p className="font-semibold text-slate-900">Stay compliant in {country.name} without the complexity.</p>
                  <p className="text-sm text-slate-500 mt-1">An Employer of Record manages all HR compliance obligations on your behalf.</p>
                </div>
                <Link href={`/eor/${code.toLowerCase()}/`} className="shrink-0 inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors">
                  Explore EOR <ArrowRight size={14} />
                </Link>
              </div>

              <p className="text-xs text-slate-400">
                This guide is for informational purposes only and does not constitute legal advice. Employment law in {country.name} is subject to change. Always consult a qualified local employment lawyer.
              </p>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">About This Guide</p>
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
                    { label: 'Employment Law', href: `/countries/${code.toLowerCase()}/employmentlaw/` },
                    { label: 'Hiring Guide', href: `/countries/${code.toLowerCase()}/hiring-guide/` },
                    { label: 'Leave & Benefits', href: `/countries/${code.toLowerCase()}/leave-benefits/` },
                    { label: 'Compliance Calendar', href: `/countries/${code.toLowerCase()}/compliance-calendar/` },
                    { label: 'EOR Guide', href: `/eor/${code.toLowerCase()}/` },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors group">
                        {link.label}
                        <ArrowRight size={13} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl p-6 overflow-hidden relative" style={{ backgroundColor: '#0d1f3c' }}>
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(30,111,255,0.2) 0%, transparent 60%)' }} />
                <div className="relative">
                  <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-3">Free Tool</p>
                  <h3 className="font-serif text-lg font-bold text-white mb-2 leading-snug">Full compliance coverage across every country.</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">Detailed compliance checklists, filing calendars, and expert guidance.</p>
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
