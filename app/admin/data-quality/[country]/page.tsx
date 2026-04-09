import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import VerifyClient from './VerifyClient'

async function getCountryData(iso2: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: country } = await supabase
    .from('countries')
    .select('*')
    .eq('iso2', iso2.toUpperCase())
    .single()

  if (!country) return null

  const code = iso2.toUpperCase()

  const [
    { data: brackets },
    { data: ss },
    { data: rules },
    { data: leave },
    { data: holidays },
    { data: filing },
    { data: compliance },
    { data: hours },
    { data: termination },
    { data: pension },
    { data: sources },
  ] = await Promise.all([
    supabase.schema('hrlake').from('tax_brackets').select('*').eq('country_code', code).eq('is_current', true).order('bracket_order'),
    supabase.schema('hrlake').from('social_security').select('*').eq('country_code', code).eq('is_current', true),
    supabase.schema('hrlake').from('employment_rules').select('*').eq('country_code', code).eq('is_current', true),
    supabase.schema('hrlake').from('statutory_leave').select('*').eq('country_code', code),
    supabase.schema('hrlake').from('public_holidays').select('*').eq('country_code', code).order('holiday_date'),
    supabase.schema('hrlake').from('filing_calendar').select('*').eq('country_code', code),
    supabase.schema('hrlake').from('payroll_compliance').select('*').eq('country_code', code),
    supabase.schema('hrlake').from('working_hours').select('*').eq('country_code', code),
    supabase.schema('hrlake').from('termination_rules').select('*').eq('country_code', code),
    supabase.schema('hrlake').from('pension_schemes').select('*').eq('country_code', code),
    supabase.schema('hrlake').from('official_sources').select('*').eq('country_code', code),
  ])

  return {
    country,
    brackets: brackets ?? [],
    ss: ss ?? [],
    rules: rules ?? [],
    leave: leave ?? [],
    holidays: holidays ?? [],
    filing: filing ?? [],
    compliance: compliance ?? [],
    hours: hours ?? [],
    termination: termination ?? [],
    pension: pension ?? [],
    sources: sources ?? [],
  }
}

export default async function VerifyCountryPage({
  params,
}: {
  params: Promise<{ country: string }>
}) {
  const { country: code } = await params
  const data = await getCountryData(code)
  if (!data) notFound()

  const { country, brackets, ss, rules, leave, holidays, filing, compliance, hours, termination, pension, sources } = data

  const sourceMap = Object.fromEntries(sources.map((s: any) => [s.data_category, s]))

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/data-quality" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="flex items-center gap-3">
          <img src={`https://flagcdn.com/32x24/${code.toLowerCase()}.png`} alt={country.name} width={32} height={24} className="rounded-sm" />
          <div>
            <h1 className="text-2xl font-bold text-white">{country.name} — Data Verification</h1>
            <p className="text-slate-400 text-sm">{code.toUpperCase()} · {country.currency_code} · Last verified: {country.last_data_update ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* AI Verification Panel */}
      <VerifyClient
        countryCode={code.toUpperCase()}
        countryName={country.name}
        brackets={brackets}
        ss={ss}
        rules={rules}
        leave={leave}
        holidays={holidays}
        filing={filing}
        compliance={compliance}
        hours={hours}
        termination={termination}
        pension={pension}
        sourceMap={sourceMap}
        currencyCode={country.currency_code}
      />

      {/* Current Data Grid - All 10 Tables */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">

        {/* Tax Brackets */}
        <DataCard title="Tax Brackets" count={brackets.length}>
          {brackets.map((b: any, i: number) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-white text-xs font-semibold">{b.bracket_name}</p>
                <p className="text-slate-500 text-xs">{b.lower_limit?.toLocaleString()} — {b.upper_limit?.toLocaleString() ?? '∞'}</p>
              </div>
              <span className="text-blue-400 font-bold text-sm">{b.rate}%</span>
            </div>
          ))}
        </DataCard>

        {/* Social Security */}
        <DataCard title="Social Security" count={ss.length}>
          {ss.map((r: any, i: number) => (
            <div key={i} className="px-5 py-3">
              <p className="text-white text-xs font-semibold mb-1">{r.contribution_type}</p>
              <div className="flex gap-4">
                <span className="text-slate-400 text-xs">ER: <span className="text-emerald-400 font-bold">{r.employer_rate}%</span></span>
                <span className="text-slate-400 text-xs">EE: <span className="text-sky-400 font-bold">{r.employee_rate}%</span></span>
              </div>
            </div>
          ))}
        </DataCard>

        {/* Employment Rules */}
        <DataCard title="Employment Rules" count={rules.length}>
         {rules.map((r: any, i: number) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{r.rule_type?.replace(/_/g, ' ')}</p>
                <p className="text-white text-xs font-semibold mt-0.5">{r.value_text ?? `${r.value_numeric} ${r.value_unit ?? ''}`}</p>
              </div>
              {r.source_url && <a href={r.source_url} target="_blank" rel="noopener noreferrer"><ExternalLink size={12} className="text-slate-500 hover:text-blue-400" /></a>}
            </div>
          ))}
        </DataCard>

        {/* Statutory Leave */}
        <DataCard title="Statutory Leave" count={leave.length}>
         {leave.map((r: any, i: number) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{r.leave_type?.replace(/_/g, ' ')}</p>
                <p className="text-white text-xs font-semibold mt-0.5">{r.minimum_days}{r.maximum_days && r.maximum_days !== r.minimum_days ? `‑${r.maximum_days}` : ''} days {r.is_paid ? '· Paid' : '· Unpaid'}</p>
              </div>
            </div>
          ))}
        </DataCard>

        {/* Public Holidays */}
        <DataCard title="Public Holidays" count={holidays.length}>
          {holidays.slice(0, 8).map((r: any, i: number) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between">
              <p className="text-white text-xs font-semibold">{r.holiday_name}</p>
              <span className="text-slate-400 text-xs">{r.holiday_date}</span>
            </div>
          ))}
          {holidays.length > 8 && <p className="px-5 py-2 text-slate-500 text-xs">+{holidays.length - 8} more</p>}
        </DataCard>

        {/* Working Hours */}
        <DataCard title="Working Hours" count={hours.length}>
         {hours.map((r: any, i: number) => (
            <div key={i} className="px-5 py-3">
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">Standard</span>
                <span className="text-white text-xs font-bold">{r.standard_hours_per_week}h/week</span>
              </div>
              {r.maximum_hours_per_week && (
                <div className="flex justify-between mt-1">
                  <span className="text-slate-400 text-xs">Maximum</span>
                  <span className="text-white text-xs font-bold">{r.maximum_hours_per_week}h/week</span>
                </div>
              )}
              {r.overtime_rate_multiplier && (
                <div className="flex justify-between mt-1">
                  <span className="text-slate-400 text-xs">OT Rate</span>
                  <span className="text-amber-400 text-xs font-bold">{r.overtime_rate_multiplier}x</span>
                </div>
              )}
            </div>
          ))}
        </DataCard>

        {/* Termination Rules */}
        <DataCard title="Termination Rules" count={termination.length}>
         {termination.map((r: any, i: number) => (
            <div key={i} className="px-5 py-3">
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">Notice period</span>
                <span className="text-white text-xs font-bold">{r.notice_period_min_days} days min</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-slate-400 text-xs">Severance mandatory</span>
                <span className={`text-xs font-bold ${r.severance_mandatory ? 'text-red-400' : 'text-emerald-400"}`}>{r.severance_mandatory ? "Yes" : "No"}</span>
              </div>
              {r.probation_period_max_months && (
                <div className="flex justify-between mt-1">
                  <span className="text-slate-400 text-xs">Probation max</span>
                  <span className="text-white text-xs font-bold">{r.probation_period_max_months} months</span>
                </div>
              )}
            </div>
          ))}
        </DataCard>

        {/* Pension Schemes */}
        <DataCard title="Pension Schemes" count={pension.length}>
         {pension.map((r: any, i: number) => (
            <div key={i} className="px-5 py-3">
              <p className="text-white text-xs font-semibold mb-1">{r.scheme_name}</p>
              <div className="flex gap-4">
                <span className="text-slate-400 text-xs">ER: <span className="text-emerald-400 font-bold">{r.employer_rate}%</span></span>
                <span className="text-slate-400 text-xs">EE: <span className="text-sky-400 font-bold">{r.employee_rate}%</span></span>
                {r.is_mandatory && <span className="text-xs text-amber-400 font-bold">Mandatory</span>}
              </div>
            </div>
          ))}
        </DataCard>

        {/* Filing Calendar */}
        <DataCard title="Filing Calendar" count={filing.length}>
          {filing.map((r: any, i: number) => (
            <div key={i} className="px-5 py-3">
              <p className="text-white text-xs font-semibold">{r.filing_type?.replace(/_/g, ' ')}</p>
              <p className="text-slate-400 text-xs mt-0.5">{r.frequency} · Due: day {r.due_day}{r.due_month ? ` of month ${r.due_month}` : ''}</p>
            </div>
          ))}
        </DataCard>

        {/* Payroll Compliance */}
        <DataCard title="Payroll Compliance" count={compliance.length}>
         {compliance.map((r: any, i: number) => (
            <div key={i} className="px-5 py-3">
              <p className="text-white text-xs font-semibold">{r.description}</p>
              {r.frequency && <p className="text-slate-400 text-xs mt-0.5">{r.frequency}</p>}
            </div>
          ))}
        </DataCard>

      </div>
    </div>
  )
}

function DataCard({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-white font-bold text-sm">{title}</h2>
        <span className="text-slate-500 text-xs">{count} records</span>
      </div>
      <div className="divide-y divide-slate-800 max-h-64 overflow-y-auto">
        {count === 0
          ? <p className="px-5 py-4 text-slate-500 text-xs">No data</p>
          : children
        }
      </div>
    </div>
  )
}
