import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getEmploymentRules } from '@/lib/supabase-queries'
import { ChevronRight, Calendar, ArrowRight } from 'lucide-react'
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
  if (!country) return { title: 'Leave and Benefits — HRLake' }
  const title = `${country.name} Leave and Benefits Guide — Employer Obligations ${new Date().getFullYear()}`
  const description = `Statutory leave and benefits in ${country.name}. Annual leave, public holidays, sick leave, maternity, paternity, parental leave and mandatory employer benefits.`
  return {
    title,
    description,
    alternates: { canonical: `https://hrlake.com/countries/${code.toLowerCase()}/leave-benefits/` },
    openGraph: {
      title,
      description,
      url: `https://hrlake.com/countries/${code.toLowerCase()}/leave-benefits/`,
      siteName: 'HRLake',
      type: 'website',
    },
  }
}

export const dynamic = 'force-dynamic'

export default async function LeaveBenefitsPage({ params }: PageProps) {
  const { code } = await params
  const upperCode = code.toUpperCase()
  const supabase = await createSupabaseServerClient()

  const { data: country } = await supabase
    .from('countries')
    .select('iso2, name, currency_code, flag_emoji')
    .eq('iso2', upperCode)
    .single()

  if (!country) notFound()

  const [sanityArticle, employmentRules, statutoryLeaveRows, publicHolidays] = await Promise.all([
    getCountryArticle(upperCode, 'leave-and-benefits'),
    getEmploymentRules(upperCode),
    supabase.from('statutory_leave').select('*').eq('country_code', upperCode),
    supabase.from('public_holidays').select('*').eq('country_code', upperCode).order('date', { ascending: true }),
  ])

  const statutoryLeave = statutoryLeaveRows.data ?? []
  const holidays = publicHolidays.data ?? []

  const leaveFacts = employmentRules ? [
    { label: 'Annual Leave', value: employmentRules.annual_leave_days ? `${employmentRules.annual_leave_days} days` : '—' },
    { label: 'Sick Leave', value: employmentRules.sick_leave_days ? `${employmentRules.sick_leave_days} days` : '—' },
    { label: 'Maternity Leave', value: employmentRules.maternity_leave_weeks ? `${employmentRules.maternity_leave_weeks} weeks` : '—' },
    { label: 'Paternity Leave', value: employmentRules.paternity_leave_weeks ? `${employmentRules.paternity_leave_weeks} days` : '—' },
    { label: 'Public Holidays', value: holidays.length > 0 ? `${holidays.length} days` : '—' },
    { label: '13th Month Pay', value: employmentRules.thirteenth_month_pay ? 'Required' : 'Not required' },
  ] : []

  return (
    <main className="bg-white flex-1">
      <CountrySubNav code={code} countryName={country.name} />
      <section className="relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 0% 100%, rgba(14,30,80,0.4) 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-14">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link href="/countries" className="hover:text-slate-300 transition-colors">Countries</Link>
            <ChevronRight size={13} className="text-slate-700" />
            <Link href={`/countries/${code.toLowerCase()}/`} className="hover:text-slate-300 transition-colors">
              {country.flag_emoji} {country.name}
            </Link>
            <ChevronRight size={13} className="text-slate-700" />
            <span className="text-slate-400">Leave and Benefits</span>
          </nav>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-5">
                <Calendar size={12} className="text-blue-400" />
                <span className="text-blue-300 text-xs font-semibold tracking-wide">Leave and Benefits Guide · {country.name}</span>
              </div>
              <h1 className="font-serif text-3xl lg:text-5xl font-bold text-white leading-tight mb-4" style={{ letterSpacing: '-0.025em' }}>
                {country.flag_emoji} Leave and Benefits in<br /><span className="text-blue-400">{country.name}</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed">
                Statutory leave entitlements and mandatory benefits for employers in {country.name} — annual leave, sick leave, maternity, paternity and public holidays.
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

              {leaveFacts.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">Leave Entitlements at a Glance — {country.name}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {leaveFacts.map((fact) => (
                      <div key={fact.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{fact.label}</p>
                        <p className="text-lg font-bold text-slate-900">{fact.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {statutoryLeave.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">Statutory Leave Types</h2>
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          <th className="px-6 py-3">Leave Type</th>
                          <th className="px-6 py-3">Entitlement</th>
                          <th className="px-6 py-3">Paid</th>
                          <th className="px-6 py-3">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {statutoryLeave.map((l: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900 capitalize">{l.leave_type?.replace(/_/g, " ") ?? "—"}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{l.days ? `${l.days} days` : l.weeks ? `${l.weeks} weeks` : "—"}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{l.is_paid === true ? "Yes" : l.is_paid === false ? "No" : "—"}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{l.notes ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {holidays.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">Public Holidays — {country.name}</h2>
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          <th className="px-6 py-3">Holiday</th>
                          <th className="px-6 py-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {holidays.map((h: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{h.name ?? "—"}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{h.date ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}


              {sanityArticle?.body && (
                <div className="prose max-w-none">
                  <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">
                    {country.name} Leave and Benefits — Full Guide
                  </h2>
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <PortableText value={sanityArticle.body} />
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-teal-100 bg-teal-50 p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-teal-600 text-xs font-bold uppercase tracking-widest mb-1">EOR Intelligence</p>
                  <p className="font-semibold text-slate-900">Manage leave compliance in {country.name} via EOR.</p>
                  <p className="text-sm text-slate-500 mt-1">An Employer of Record administers all statutory leave and benefits on your behalf.</p>
                </div>
                <Link href={`/eor/${code.toLowerCase()}/`} className="shrink-0 inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors">
                  Explore EOR <ArrowRight size={14} />
                </Link>
              </div>

              <p className="text-xs text-slate-400">
                This guide is for informational purposes only and does not constitute legal advice. Leave entitlements in {country.name} are subject to change. Always consult a qualified local employment lawyer.
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
                    { label: 'HR Compliance', href: `/countries/${code.toLowerCase()}/hr-compliance/` },
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
                  <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-3">Pro Plan</p>
                  <h3 className="font-serif text-lg font-bold text-white mb-2 leading-snug">Compare leave entitlements across countries.</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">Side-by-side leave and benefits analysis across all active countries.</p>
                  <Link href="/pricing/" className="block rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-3 text-center text-sm font-bold text-white transition-colors">
                    View Pro Features
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
