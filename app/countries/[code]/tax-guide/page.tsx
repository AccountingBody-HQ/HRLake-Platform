import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase'
import { ChevronRight, BookOpen, ArrowRight } from 'lucide-react'
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
  if (!country) return { title: 'Tax Guide — HRLake' }
  const title = `${country.name} Income Tax Guide ${new Date().getFullYear()} — Brackets & Rates`
  const description = `${country.name} income tax brackets, rates, and employer payroll tax obligations for ${new Date().getFullYear()}. Full tax band breakdown for HR, payroll, and finance teams.`
  return {
    title,
    description,
    alternates: { canonical: `https://hrlake.com/countries/${code.toLowerCase()}/tax-guide/` },
    openGraph: {
      title,
      description,
      url: `https://hrlake.com/countries/${code.toLowerCase()}/tax-guide/`,
      siteName: 'HRLake',
      type: 'website',
    },
  }
}

export const dynamic = 'force-dynamic'

function fmtRate(rate: number | null): string {
  if (rate === null || rate === undefined) return '—'
  return `${rate}%`
}

function fmtLimit(value: number | null, currency: string): string {
  if (value === null || value === undefined) return 'No limit'
  return `${currency} ${value.toLocaleString('en-GB')}`
}

export default async function TaxGuidePage({ params }: PageProps) {
  const { code } = await params
  const upperCode = code.toUpperCase()
  const supabase = await createSupabaseServerClient()

  const { data: country } = await supabase
    .from('countries')
    .select('iso2, name, currency_code, flag_emoji')
    .eq('iso2', upperCode)
    .single()

  if (!country) notFound()

  const { data: rawBrackets } = await supabase
    .schema('hrlake')
    .from('tax_brackets')
    .select('bracket_order, lower_limit, upper_limit, rate, bracket_name')
    .eq('country_code', upperCode)
    .eq('is_current', true)
    .eq('tier', 'free')
    .order('bracket_order', { ascending: true })

  const { data: rawSS } = await supabase
    .schema('hrlake')
    .from('social_security')
    .select('contribution_type, employer_rate, employee_rate, employer_cap_annual, employee_cap_annual, applies_above, applies_below')
    .eq('country_code', upperCode)
    .eq('is_current', true)

  const taxBrackets = rawBrackets ?? []
  const ssRates = rawSS ?? []
  const taxYear = new Date().getFullYear()

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
            <span className="text-slate-400">Tax Guide</span>
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-5">
                <BookOpen size={12} className="text-blue-400" />
                <span className="text-blue-300 text-xs font-semibold tracking-wide">
                  Income Tax & Payroll Rates · Tax Year {taxYear}
                </span>
              </div>
              <h1
                className="font-serif text-3xl lg:text-5xl font-bold text-white leading-tight mb-4"
                style={{ letterSpacing: '-0.025em' }}
              >
                {country.flag_emoji} {country.name}<br />
                <span className="text-blue-400">Tax Guide</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed">
                Income tax brackets, social security rates, and employer payroll obligations for {country.name} — the data HR and finance teams need for accurate workforce cost planning.
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

              {/* Income Tax Brackets */}
              <div>
                <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">
                  Income Tax Brackets — {taxYear}
                </h2>
                {taxBrackets.length === 0 ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-800">
                    <strong>Data coming soon.</strong> Income tax bracket data for {country.name} is being prepared.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          <th className="px-6 py-3">Band</th>
                          <th className="px-6 py-3">Rate</th>
                          <th className="px-6 py-3">From</th>
                          <th className="px-6 py-3">To</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {taxBrackets.map((b, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-slate-700">{b.bracket_name}</td>
                            <td className="px-6 py-4 text-sm font-bold text-amber-600">{fmtRate(Number(b.rate))}</td>
                            <td className="px-6 py-4 text-sm text-slate-700">{fmtLimit(Number(b.lower_limit), country.currency_code)}</td>
                            <td className="px-6 py-4 text-sm text-slate-700">{b.upper_limit !== null ? fmtLimit(Number(b.upper_limit), country.currency_code) : 'No upper limit'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Social Security */}
              <div>
                <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">
                  Social Security Contributions
                </h2>
                {ssRates.length === 0 ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-800">
                    <strong>Data coming soon.</strong> Social security data for {country.name} is being prepared.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          <th className="px-6 py-3">Type</th>
                          <th className="px-6 py-3">Employee Rate</th>
                          <th className="px-6 py-3">Employer Rate</th>
                          <th className="px-6 py-3">Annual Cap</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ssRates.map((s, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-slate-700 capitalize">{s.contribution_type?.replace(/_/g, ' ') ?? '—'}</td>
                            <td className="px-6 py-4 text-sm font-bold text-blue-600">{fmtRate(Number(s.employee_rate))}</td>
                            <td className="px-6 py-4 text-sm font-bold text-purple-600">{fmtRate(Number(s.employer_rate))}</td>
                            <td className="px-6 py-4 text-sm text-slate-700">{fmtLimit(s.employee_cap_annual ? Number(s.employee_cap_annual) : null, country.currency_code)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* CTA to calculator */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-1">Payroll Calculator</p>
                  <p className="font-semibold text-slate-900">Calculate net salary and employer cost for {country.name}.</p>
                  <p className="text-sm text-slate-500 mt-1">Full bracket-by-bracket breakdown, monthly and annually.</p>
                </div>
                <Link
                  href={`/countries/${code.toLowerCase()}/payroll-calculator/`}
                  className="shrink-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors"
                >
                  Open Calculator <ArrowRight size={14} />
                </Link>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-slate-400">
                Tax data is sourced from official government publications and updated monthly. Rates are for the {taxYear} tax year. This information is for guidance only and does not constitute tax or legal advice. Always consult a qualified tax adviser for {country.name}-specific obligations.
              </p>

            </div>

            {/* Sidebar — 1/3 */}
            <div className="space-y-5">

              {/* About this data */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">About This Data</p>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">✓</span> Sourced from official government publications</li>
                  <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">✓</span> Updated monthly — always current rates</li>
                  <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">✓</span> For guidance only — not tax advice</li>
                </ul>
              </div>

              {/* More for this country */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">More for {country.name}</p>
                <ul className="space-y-1">
                  {[
                    { label: 'Country Overview', href: `/countries/${code.toLowerCase()}/` },
                    { label: 'Payroll Calculator', href: `/countries/${code.toLowerCase()}/payroll-calculator/` },
                    { label: 'Payroll Guide', href: `/countries/${code.toLowerCase()}/payroll-guide/` },
                    { label: 'Employment Law', href: `/countries/${code.toLowerCase()}/employmentlaw/` },
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
                    An Employer of Record handles local tax and employment compliance on your behalf.
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
