import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { BarChart3, CheckCircle, AlertCircle, XCircle, ArrowRight } from 'lucide-react'

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

async function getCoverageData() {
  const timeout = new Promise<any[]>(res => setTimeout(() => res([]), 10000))
  return Promise.race([fetchCoverageData(), timeout])
}

async function fetchCoverageData() {
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
      const tableCoverage = ALL_TABLES.map(t => presenceMap[t.key]?.has(c.iso2) ?? false)
      const filled = tableCoverage.filter(Boolean).length
      const pct    = Math.round((filled / ALL_TABLES.length) * 100)
      const status = filled === ALL_TABLES.length ? 'full' : filled > 0 ? 'partial' : 'none'
      return { ...c, filled, pct, status, tableCoverage }
    })
  } catch (e) {
    console.error('getCoverageData error:', e)
    return []
  }
}

export default async function CoverageMapPage() {
  const countries = await getCoverageData()
  const total   = countries.length
  const full    = countries.filter((c: any) => c.status === 'full')
  const partial = countries.filter((c: any) => c.status === 'partial')
  const none    = countries.filter((c: any) => c.status === 'none')

  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0
  const avgScore = total > 0
    ? Math.round(countries.reduce((s: number, c: any) => s + c.pct, 0) / total)
    : 0

  const SUMMARY = [
    { label: 'Total Countries',  value: total,          color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',   border: 'rgba(59,130,246,0.2)'   },
    { label: 'Full Coverage',    value: full.length,    color: '#10b981', bg: 'rgba(16,185,129,0.08)',   border: 'rgba(16,185,129,0.2)'   },
    { label: 'Partial Coverage', value: partial.length, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',   border: 'rgba(245,158,11,0.2)'   },
    { label: 'No Data',          value: none.length,    color: '#ef4444', bg: 'rgba(239,68,68,0.08)',    border: 'rgba(239,68,68,0.2)'    },
  ]

  const SECTIONS = [
    { title: 'Full Coverage',    icon: CheckCircle,  color: '#10b981', items: full,    empty: 'No countries with full coverage yet' },
    { title: 'Partial Coverage', icon: AlertCircle,  color: '#f59e0b', items: partial, empty: 'No partial countries' },
    { title: 'No Data',          icon: XCircle,      color: '#ef4444', items: none,    empty: 'All countries have some data' },
  ]

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(167,139,250,0.12)' }}>
          <BarChart3 size={20} style={{ color: '#a78bfa' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Coverage Map</h1>
          <p className="text-sm" style={{ color: '#475569' }}>
            Data coverage across {total} active countries — all 10 tables · avg score {avgScore}%
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {SUMMARY.map(s => (
          <div key={s.label} className="rounded-2xl p-5 border"
            style={{ background: s.bg, borderColor: s.border }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: s.color }}>{s.label}</p>
            <p className="text-3xl font-black text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Progress bars */}
      <div className="rounded-2xl border p-6 mb-6"
        style={{ background: '#0d1424', borderColor: '#1a2238' }}>
        <h2 className="text-white font-bold text-sm mb-5">Coverage Breakdown — All 10 Tables</h2>
        <div className="space-y-4">
          {[
            { label: 'Full coverage (10/10)',   count: full.length,    pct: pct(full.length),    color: '#10b981' },
            { label: 'Partial coverage (1–9)',  count: partial.length, pct: pct(partial.length), color: '#f59e0b' },
            { label: 'No data (0/10)',          count: none.length,    pct: pct(none.length),    color: '#ef4444' },
          ].map(row => (
            <div key={row.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: '#94a3b8' }}>{row.label}</span>
                <span className="text-xs font-bold" style={{ color: '#475569' }}>
                  {row.count} {row.count === 1 ? 'country' : 'countries'} · {row.pct}%
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${row.pct}%`, background: row.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Country sections */}
      {SECTIONS.map(section => (
        <div key={section.title} className="rounded-2xl border overflow-hidden mb-5"
          style={{ background: '#0d1424', borderColor: '#1a2238' }}>
          <div className="px-6 py-4 border-b flex items-center gap-3"
            style={{ borderColor: '#1a2238' }}>
            <section.icon size={15} style={{ color: section.color }} />
            <h2 className="text-white font-bold text-sm">{section.title}</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${section.color}15`, color: section.color, border: `1px solid ${section.color}30` }}>
              {section.items.length}
            </span>
          </div>

          {section.items.length === 0 ? (
            <p className="px-6 py-5 text-sm" style={{ color: '#334155' }}>{section.empty}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a2238' }}>
                    <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#334155' }}>Country</th>
                    {ALL_TABLES.map(t => (
                      <th key={t.key} className="text-center px-2 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#334155' }}>{t.short}</th>
                    ))}
                    <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#334155' }}>Score</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#334155' }}>Last Updated</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((c: any, i: number) => (
                    <tr key={c.iso2}
                      style={{ borderBottom: i < section.items.length - 1 ? '1px solid #111827' : 'none' }}>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={`https://flagcdn.com/20x15/${c.iso2.toLowerCase()}.png`}
                            alt={c.name} width={20} height={15} className="rounded-sm shrink-0" />
                          <div>
                            <p className="text-white font-semibold text-sm">{c.name}</p>
                            <p className="text-xs" style={{ color: '#334155' }}>{c.iso2}</p>
                          </div>
                        </div>
                      </td>
                      {ALL_TABLES.map((t, idx) => {
                        const has = c.tableCoverage?.[idx] ?? false
                        return (
                          <td key={t.key} className="px-2 py-3.5 text-center">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center mx-auto"
                              style={{ background: has ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)' }}>
                              <div className="w-1.5 h-1.5 rounded-full"
                                style={{ background: has ? '#10b981' : '#374151' }} />
                            </div>
                          </td>
                        )
                      })}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-14 rounded-full h-1.5" style={{ background: '#1e293b' }}>
                            <div className="h-1.5 rounded-full"
                              style={{
                                width: `${c.pct}%`,
                                background: c.pct === 100 ? '#10b981' : c.pct >= 70 ? '#f59e0b' : '#ef4444'
                              }} />
                          </div>
                          <span className="text-xs font-bold tabular-nums"
                            style={{ color: c.pct === 100 ? '#10b981' : c.pct >= 70 ? '#f59e0b' : '#ef4444' }}>
                            {c.filled}/{ALL_TABLES.length}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs" style={{ color: '#475569' }}>
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
          )}
        </div>
      ))}
    </div>
  )
}
