import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { ShieldCheck, ArrowRight, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

const ALL_TABLES = [
  { key: 'tax_brackets',       short: 'Tax'    },
  { key: 'social_security',    short: 'SS'     },
  { key: 'employment_rules',   short: 'Rules'  },
  { key: 'statutory_leave',    short: 'Leave'  },
  { key: 'public_holidays',    short: 'Hols'   },
  { key: 'filing_calendar',    short: 'Filing' },
  { key: 'payroll_compliance', short: 'Comp'   },
  { key: 'working_hours',      short: 'Hours'  },
  { key: 'termination_rules',  short: 'Term'   },
  { key: 'pension_schemes',    short: 'Pension'},
]

async function getDataQualitySummary() {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
      const coverage = ALL_TABLES.map(t => presenceMap[t.key]?.has(c.iso2) ?? false)
      const filled   = coverage.filter(Boolean).length
      return { ...c, coverage, filled, complete: filled === ALL_TABLES.length }
    })
  } catch (e) {
    console.error('getDataQualitySummary error:', e)
    return []
  }
}

function CoverageCell({ has }: { has: boolean }) {
  return has ? (
    <div className="w-5 h-5 rounded-md flex items-center justify-center mx-auto"
      style={{ background: 'rgba(16,185,129,0.15)' }}>
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981' }} />
    </div>
  ) : (
    <div className="w-5 h-5 rounded-md flex items-center justify-center mx-auto"
      style={{ background: 'rgba(239,68,68,0.1)' }}>
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#374151' }} />
    </div>
  )
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

export default async function DataQualityPage() {
  const countries = await getDataQualitySummary()
  const total    = countries.length
  const complete = countries.filter((c: any) => c.complete).length
  const partial  = countries.filter((c: any) => c.filled > 0 && !c.complete).length
  const empty    = countries.filter((c: any) => c.filled === 0).length

  const SUMMARY = [
    { label: 'Countries',      value: total,    color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',   border: 'rgba(59,130,246,0.2)'   },
    { label: 'Fully Complete', value: complete, color: '#10b981', bg: 'rgba(16,185,129,0.08)',   border: 'rgba(16,185,129,0.2)'   },
    { label: 'Partial',        value: partial,  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',   border: 'rgba(245,158,11,0.2)'   },
    { label: 'Empty',          value: empty,    color: '#ef4444', bg: 'rgba(239,68,68,0.08)',    border: 'rgba(239,68,68,0.2)'    },
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
            10-table coverage across {total} active countries — click Verify to run AI verification
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

      {/* Table */}
      {total > 0 && (
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: '#0d1424', borderColor: '#1a2238' }}>

          {/* Table header */}
          <div className="px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor: '#1a2238' }}>
            <h2 className="text-white font-bold text-sm">Country Coverage — All 10 Tables</h2>
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
                  {ALL_TABLES.map(t => (
                    <th key={t.key} className="text-center px-2 py-3 text-xs font-bold uppercase tracking-wider"
                      style={{ color: '#334155' }}>{t.short}</th>
                  ))}
                  <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider"
                    style={{ color: '#334155' }}>Score</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider"
                    style={{ color: '#334155' }}>Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider"
                    style={{ color: '#334155' }}>Verified</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {countries.map((c: any, i: number) => (
                  <tr key={c.iso2}
                    style={{ borderBottom: i < countries.length - 1 ? '1px solid #111827' : 'none' }}
                    className="group transition-colors"
                    onMouseEnter={undefined}>
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
                    {c.coverage.map((has: boolean, idx: number) => (
                      <td key={idx} className="px-2 py-3.5 text-center">
                        <CoverageCell has={has} />
                      </td>
                    ))}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-14 rounded-full h-1.5" style={{ background: '#1e293b' }}>
                          <div className="h-1.5 rounded-full transition-all"
                            style={{
                              width: `${(c.filled / ALL_TABLES.length) * 100}%`,
                              background: c.complete ? '#10b981' : c.filled > 5 ? '#f59e0b' : '#ef4444'
                            }} />
                        </div>
                        <span className="text-xs font-bold tabular-nums"
                          style={{ color: c.complete ? '#10b981' : c.filled > 5 ? '#f59e0b' : '#ef4444' }}>
                          {c.filled}/{ALL_TABLES.length}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
