import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { ShieldCheck, ArrowRight, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

const ALL_TABLES = [
  { key: 'tax_brackets',                short: 'Tax',        group: 'core'    },
  { key: 'social_security',             short: 'SS',         group: 'core'    },
  { key: 'employment_rules',            short: 'Rules',      group: 'core'    },
  { key: 'statutory_leave',             short: 'Leave',      group: 'core'    },
  { key: 'public_holidays',             short: 'Hols',       group: 'core'    },
  { key: 'filing_calendar',             short: 'Filing',     group: 'core'    },
  { key: 'payroll_compliance',          short: 'Comp',       group: 'core'    },
  { key: 'working_hours',               short: 'Hours',      group: 'core'    },
  { key: 'termination_rules',           short: 'Term',       group: 'core'    },
  { key: 'pension_schemes',             short: 'Pension',    group: 'core'    },
  { key: 'mandatory_benefits',          short: 'Benefits',   group: 'premium' },
  { key: 'health_insurance',            short: 'Health',     group: 'premium' },
  { key: 'payslip_requirements',        short: 'Payslip',    group: 'premium' },
  { key: 'record_retention',            short: 'Records',    group: 'premium' },
  { key: 'remote_work_rules',           short: 'Remote',     group: 'premium' },
  { key: 'expense_rules',               short: 'Expenses',   group: 'premium' },
  { key: 'contractor_rules',            short: 'Contractor', group: 'premium' },
  { key: 'work_permits',                short: 'Permits',    group: 'premium' },
  { key: 'entity_setup',                short: 'Entity',     group: 'premium' },
  { key: 'tax_credits',                 short: 'Credits',    group: 'premium' },
  { key: 'regional_tax_rates',          short: 'Regional',   group: 'premium' },
  { key: 'salary_benchmarks',           short: 'Salary',     group: 'premium' },
  { key: 'government_benefit_payments', short: 'GovPay',     group: 'premium' },
]

const CORE_COUNT    = 10
const PREMIUM_COUNT = 13
const TOTAL_COUNT   = 23

async function getDataQualitySummary() {
  const timeout = new Promise<any[]>(res => setTimeout(() => res([]), 10000))
  return Promise.race([fetchDataQualitySummary(), timeout])
}

async function fetchDataQualitySummary() {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: countries } = await sb
      .from('countries')
      .select('iso2, name, hrlake_coverage_level, last_data_update')
      .eq('is_active', true)
      .order('name')

    const tableFetches = await Promise.all(
      ALL_TABLES.map(async t => {
        const { data } = await sb.schema('hrlake').from(t.key).select('country_code')
        return { key: t.key, codes: new Set((data ?? []).map((r: any) => r.country_code)) }
      })
    )
    const presenceMap = Object.fromEntries(tableFetches.map(t => [t.key, t.codes]))

    return (countries ?? []).map((c: any) => {
      const coverage     = ALL_TABLES.map(t => presenceMap[t.key]?.has(c.iso2) ?? false)
      const coreCount    = coverage.slice(0, CORE_COUNT).filter(Boolean).length
      const premiumCount = coverage.slice(CORE_COUNT).filter(Boolean).length
      const filled       = coreCount + premiumCount
      return { ...c, coverage, coreCount, premiumCount, filled, complete: filled === TOTAL_COUNT }
    })
  } catch (e) {
    console.error('getDataQualitySummary error:', e)
    return []
  }
}

function StatusBadge({ level, filled }: { level: string; filled: number }) {
  if (level === 'full') return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
      <CheckCircle size={10} /> Verified
    </span>
  )
  if (filled > 0) return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
      <AlertCircle size={10} /> Partial
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
      style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
      <XCircle size={10} /> Empty
    </span>
  )
}

function MiniProgress({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 rounded-full h-1" style={{ background: '#1e293b' }}>
        <div className="h-1 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color }}>{value}/{max}</span>
    </div>
  )
}

export default async function DataQualityPage() {
  const countries = await getDataQualitySummary()
  const total    = countries.length
  const complete = countries.filter((c: any) => c.complete).length
  const partial  = countries.filter((c: any) => c.filled > 0 && !c.complete).length
  const empty    = countries.filter((c: any) => c.filled === 0).length

  const SUMMARY = [
    { label: 'Countries',      value: total,    color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)'  },
    { label: 'Fully Complete', value: complete, color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)'  },
    { label: 'Partial',        value: partial,  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
    { label: 'Empty',          value: empty,    color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'   },
  ]

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(16,185,129,0.12)' }}>
          <ShieldCheck size={20} style={{ color: '#10b981' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Data Quality</h1>
          <p className="text-sm" style={{ color: '#475569' }}>
            23-table coverage across {total} active countries — click Verify to run AI verification
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {SUMMARY.map(s => (
          <div key={s.label} className="rounded-2xl p-5 border"
            style={{ background: s.bg, borderColor: s.border }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: s.color }}>{s.label}</p>
            <p className="text-3xl font-black text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Coverage table */}
      {total > 0 && (
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: '#0d1424', borderColor: '#1a2238' }}>

          <div className="px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor: '#1a2238' }}>
            <div>
              <h2 className="text-white font-bold text-sm">Country Coverage — All 23 Tables</h2>
              <p className="text-xs mt-0.5" style={{ color: '#334155' }}>
                Core (10 tables) + Premium (13 tables)
              </p>
            </div>
            <p className="text-xs" style={{ color: '#334155' }}>
              {complete} of {total} fully verified
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #1a2238' }}>
                  <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider"
                    style={{ color: '#334155' }}>Country</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider"
                    style={{ color: '#475569' }}>Core 10</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider"
                    style={{ color: '#a78bfa' }}>Premium 13</th>
                  <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider"
                    style={{ color: '#334155' }}>Total / 23</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider"
                    style={{ color: '#334155' }}>Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider"
                    style={{ color: '#334155' }}>Verified</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {countries.map((c: any, i: number) => {
                  const coreColor    = c.coreCount    === CORE_COUNT    ? '#10b981' : c.coreCount    > 5  ? '#f59e0b' : '#ef4444'
                  const premiumColor = c.premiumCount === PREMIUM_COUNT ? '#10b981' : c.premiumCount > 6  ? '#f59e0b' : '#ef4444'
                  const totalColor   = c.complete                       ? '#10b981' : c.filled        > 11 ? '#f59e0b' : '#ef4444'
                  return (
                    <tr key={c.iso2}
                      style={{ borderBottom: i < countries.length - 1 ? '1px solid #111827' : 'none' }}
                      className="group transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={`https://flagcdn.com/20x15/${c.iso2.toLowerCase()}.png`}
                            alt={c.name} width={20} height={15} className="rounded-sm shrink-0" />
                          <div>
                            <p className="text-white font-semibold text-sm whitespace-nowrap">{c.name}</p>
                            <p className="text-xs" style={{ color: '#334155' }}>{c.iso2}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <MiniProgress value={c.coreCount} max={CORE_COUNT} color={coreColor} />
                      </td>
                      <td className="px-4 py-3.5">
                        <MiniProgress value={c.premiumCount} max={PREMIUM_COUNT} color={premiumColor} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 rounded-full h-1.5" style={{ background: '#1e293b' }}>
                            <div className="h-1.5 rounded-full transition-all"
                              style={{ width: `${(c.filled / TOTAL_COUNT) * 100}%`, background: totalColor }} />
                          </div>
                          <span className="text-xs font-bold tabular-nums" style={{ color: totalColor }}>
                            {c.filled}/{TOTAL_COUNT}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge level={c.hrlake_coverage_level} filled={c.filled} />
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs whitespace-nowrap" style={{ color: '#475569' }}>
                          {c.last_data_update
                            ? new Date(c.last_data_update).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link href={`/admin/data-quality/${c.iso2.toLowerCase()}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}>
                          Verify <ArrowRight size={10} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
