import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCalculatorStructuredData, getBreadcrumbStructuredData, jsonLd as toJsonLd } from '@/lib/structured-data'
import { createSupabaseServerClient } from '@/lib/supabase'
import CalculatorWithSave from '@/components/CalculatorWithSave'
import type { TaxBracket, SocialSecurityRate } from '@/lib/calculator'
import type { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import { Calculator as CalcIcon, ChevronRight, Shield, RefreshCw, Award, ArrowRight } from 'lucide-react'
import CalculatorModalWrapper from '@/components/CalculatorModalWrapper'
import CountrySubNav from '@/components/CountrySubNav'


// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ code: string }>
  searchParams: Promise<{ salary?: string; period?: string }>
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params
  const supabase = await createSupabaseServerClient()
  const { data: country } = await supabase
    .from('countries')
    .select('name, currency_code')
    .eq('iso2', code.toUpperCase())
    .single()

  if (!country) return { title: 'Payroll Calculator — HRLake' }

  const name = country.name
  const title = `${name} Payroll Calculator ${new Date().getFullYear()}`
  const description = `Calculate net salary, income tax, and total employer costs in ${name}. Full bracket breakdown, social security, and employment cost analysis for HR and workforce planning.`
  const ogImage = `https://hrlake.com/og/country?code=${code.toLowerCase()}&name=${encodeURIComponent(name)}&type=calculator`
  return {
    title,
    description,
    alternates: {
      canonical: `https://hrlake.com/countries/${code.toLowerCase()}/payroll-calculator/`,
    },
    openGraph: {
      title,
      description,
      url: `https://hrlake.com/countries/${code.toLowerCase()}/payroll-calculator/`,
      siteName: 'HRLake',
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${name} Payroll Calculator` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic'

export default async function PayrollCalculatorPage({ params, searchParams }: PageProps) {
  const { code } = await params
  const upperCode = code.toUpperCase()
  const supabase = await createSupabaseServerClient()

  // ── Load country ──────────────────────────────────────────────────────────
  const { data: country } = await supabase
    .from('countries')
    .select('iso2, name, currency_code, flag_emoji')
    .eq('iso2', upperCode)
    .single()

  if (!country) notFound()

  // ── Load tax brackets (hrlake schema) ────────────────────────────────────────
  const { data: rawBrackets } = await supabase
    .schema('hrlake')
    .from('tax_brackets')
    .select('bracket_order, lower_limit, upper_limit, rate, bracket_name')
    .eq('country_code', upperCode)
    .eq('is_current', true)
    .eq('tier', 'free')
    .order('bracket_order', { ascending: true })

  // ── Load social security rates (hrlake schema) ───────────────────────────────
  const { data: rawSS } = await supabase
    .schema('hrlake')
    .from('social_security')
    .select('contribution_type, employer_rate, employee_rate, employer_cap_annual, employee_cap_annual, applies_above, applies_below')
    .eq('country_code', upperCode)
    .eq('is_current', true)

  const taxBrackets: TaxBracket[] = (rawBrackets ?? []).map((b) => ({
    bracket_order: b.bracket_order,
    lower_limit: Number(b.lower_limit),
    upper_limit: b.upper_limit !== null ? Number(b.upper_limit) : null,
    rate: Number(b.rate),
    bracket_name: b.bracket_name,
  }))

  const ssRates: SocialSecurityRate[] = (rawSS ?? []).flatMap((s) => [
    {
      contribution_type: 'employer',
      rate_percent: Number(s.employer_rate),
      cap_amount: s.employer_cap_annual !== null ? Number(s.employer_cap_annual) : null,
      applies_above: s.applies_above !== null ? Number(s.applies_above) : null,
      applies_below: s.applies_below !== null ? Number(s.applies_below) : null,
      description: s.contribution_type,
    },
    {
      contribution_type: 'employee',
      rate_percent: Number(s.employee_rate),
      cap_amount: s.employee_cap_annual !== null ? Number(s.employee_cap_annual) : null,
      applies_above: s.applies_above !== null ? Number(s.applies_above) : null,
      applies_below: s.applies_below !== null ? Number(s.applies_below) : null,
      description: s.contribution_type,
    },
  ])

  const taxYear = new Date().getFullYear()
  const { userId } = await auth()
  const isAuthenticated = !!userId
  const { salary: initialSalary, period: initialPeriod } = await searchParams



  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(getCalculatorStructuredData({ name: country.name, code: code })) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(getBreadcrumbStructuredData([
          { name: 'Home', href: '/' },
          { name: 'All Countries', href: '/countries/' },
          { name: country.name, href: '/countries/' + code.toLowerCase() + '/' },
          { name: country.name + ' Payroll Calculator', href: '/countries/' + code.toLowerCase() + '/payroll-calculator/' },
        ])) }}
      />

      <main className="bg-white flex-1">
      <CountrySubNav code={code} countryName={country.name} />

        {/* ══════ HERO HEADER ══════ */}
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
              <span className="text-slate-400">Payroll Calculator</span>
            </nav>

            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-5">
                  <CalcIcon size={12} className="text-blue-400" />
                  <span className="text-blue-300 text-xs font-semibold tracking-wide">
                    Payroll Calculator · Tax Year {taxYear}
                  </span>
                </div>

                <h1
                  className="font-serif text-3xl lg:text-5xl font-bold text-white leading-tight mb-4"
                  style={{ letterSpacing: '-0.025em' }}
                >
                  {country.flag_emoji} {country.name}<br />
                  <span className="text-blue-400">Payroll Calculator</span>
                </h1>

                <p className="text-slate-400 text-lg leading-relaxed">
                  Calculate net salary, income tax, and total employer cost for {country.name}.{' '}
                  Full bracket-by-bracket breakdown — the employment cost data HR and finance teams rely on.
                </p>
              </div>

              <Link
                href={`/countries/${code.toLowerCase()}/`}
                className="shrink-0 flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/40 text-slate-300 hover:text-white rounded-xl px-5 py-3 text-sm font-medium transition-all"
              >
                ← {country.name} Overview
              </Link>
            </div>

            {/* Stat strip */}
            <div className="mt-12 pt-8 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { value: 'Free', label: 'No account needed', sub: 'Core calculator' },
                { value: 'Live', label: 'Tax year ' + taxYear, sub: 'Current rates' },
                { value: 'Full', label: 'Bracket detail', sub: 'Line-by-line' },
                { value: 'PDF', label: 'Export ready', sub: 'Download results' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-black text-white tracking-tight">{s.value}</div>
                  <div className="text-sm font-bold text-slate-300 mt-1">{s.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══════ CALCULATOR + SIDEBAR ══════ */}
        <section className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
            <div className="grid gap-10 lg:grid-cols-3">

              {/* Calculator — 2/3 width */}
              <div className="lg:col-span-2">
                <CalculatorWithSave
                  countryCode={upperCode}
                  countryName={country.name}
                  currencyCode={country.currency_code}
                  taxBrackets={taxBrackets}
                  ssRates={ssRates}
                  taxYear={taxYear}
                  isAuthenticated={isAuthenticated}
                  initialSalary={initialSalary}
                  initialPeriod={initialPeriod as 'monthly' | 'annual' | undefined}
                />
              </div>

              {/* Sidebar — 1/3 width */}
              <div className="space-y-5">

                {/* Data standards card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">About This Data</p>
                  <ul className="space-y-3">
                    {[
                    { label: 'Country Overview', href: `/countries/${code.toLowerCase()}/` },
                    { label: 'Tax Guide', href: `/countries/${code.toLowerCase()}/tax-guide/` },
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

                {/* Compare link */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Compare</p>
                  <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                    Side-by-side employer cost comparison across two countries.
                  </p>
                  <Link
                    href="/compare/"
                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Open comparison tool <ArrowRight size={14} />
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </section>

      </main>
      <CalculatorModalWrapper />
    </>
  )
}
