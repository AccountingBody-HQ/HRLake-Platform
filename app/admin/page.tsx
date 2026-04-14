import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import {
  Globe, ShieldCheck, Sparkles, BarChart3,
  Layers, ArrowRight, AlertTriangle, CheckCircle,
  Clock, TrendingUp, FileText, Zap
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const ALL_TABLES = [
  'tax_brackets','social_security','employment_rules','statutory_leave',
  'public_holidays','filing_calendar','payroll_compliance',
  'working_hours','termination_rules','pension_schemes',
]

async function getDashboardData() {
  const timeout = new Promise<null>(res => setTimeout(() => res(null), 10000))
  const result  = fetchDashboardData()
  return Promise.race([result, timeout])
}

async function fetchDashboardData() {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: countries } = await sb
      .from('countries')
      .select('iso2, name, is_active, hrlake_coverage_level, last_data_update')
      .order('name')

    const all      = countries ?? []
    const active   = all.filter((c: any) => c.is_active)
    const inactive = all.filter((c: any) => !c.is_active)
    const verified = active.filter((c: any) => c.hrlake_coverage_level === 'full')
    const partial  = active.filter((c: any) => c.hrlake_coverage_level === 'partial')

    const tableFetches = await Promise.all(
      ALL_TABLES.map(async t => {
        const { data } = await sb.schema('hrlake').from(t).select('country_code')
        return { key: t, codes: new Set((data ?? []).map((r: any) => r.country_code)) }
      })
    )
    const presenceMap = Object.fromEntries(tableFetches.map(t => [t.key, t.codes]))

    const countryScores = active.map((c: any) => {
      const filled = ALL_TABLES.filter(t => presenceMap[t]?.has(c.iso2)).length
      return { ...c, filled, score: Math.round((filled / ALL_TABLES.length) * 100) }
    })

    const needsAttention = countryScores
      .filter((c: any) => c.score < 100)
      .sort((a: any, b: any) => a.score - b.score)
      .slice(0, 5)

    const recentlyVerified = active
      .filter((c: any) => c.last_data_update)
      .sort((a: any, b: any) => new Date(b.last_data_update).getTime() - new Date(a.last_data_update).getTime())
      .slice(0, 4)

    const avgScore = countryScores.length > 0
      ? Math.round(countryScores.reduce((s: number, c: any) => s + c.score, 0) / countryScores.length)
      : 0

    const totalRecords = tableFetches.reduce((s, t) => s + t.codes.size, 0)

    return {
      totalCountries: all.length,
      activeCountries: active.length,
      inactiveCountries: inactive.length,
      verifiedCountries: verified.length,
      partialCountries: partial.length,
      avgScore,
      totalRecords,
      needsAttention,
      recentlyVerified,
    }
  } catch (e) {
    console.error('getDashboardData error:', e)
    return null
  }
}

export default async function AdminCommandCentre() {
  const d = await getDashboardData()
  if (!d) {
    return (
      <div className="p-8">
        <p className="text-red-400 text-sm">Failed to load dashboard data.</p>
      </div>
    )
  }

  const STAT_CARDS = [
    {
      label: 'Active Countries',
      value: d.activeCountries,
      sub: `${d.inactiveCountries} inactive`,
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.08)',
      border: 'rgba(59,130,246,0.2)',
      icon: Globe,
      href: '/admin/country-builder',
    },
    {
      label: 'Fully Verified',
      value: d.verifiedCountries,
      sub: `${d.partialCountries} partial`,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.2)',
      icon: ShieldCheck,
      href: '/admin/data-quality',
    },
    {
      label: 'Avg Data Score',
      value: `${d.avgScore}%`,
      sub: 'across all active countries',
      color: d.avgScore >= 90 ? '#10b981' : d.avgScore >= 70 ? '#f59e0b' : '#ef4444',
      bg: d.avgScore >= 90 ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
      border: d.avgScore >= 90 ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
      icon: TrendingUp,
      href: '/admin/coverage',
    },
    {
      label: 'DB Records',
      value: d.totalRecords.toLocaleString(),
      sub: 'across 23 hrlake tables',
      color: '#a78bfa',
      bg: 'rgba(167,139,250,0.08)',
      border: 'rgba(167,139,250,0.2)',
      icon: Zap,
      href: '/admin/data-quality',
    },
  ]

  const QUICK_ACTIONS = [
    { label: 'Add New Country',      sub: 'Register + populate via AI',  href: '/admin/country-builder', icon: Layers,      color: '#3b82f6' },
    { label: 'Run Data Quality',     sub: 'Verify country data tables',   href: '/admin/data-quality',    icon: ShieldCheck, color: '#10b981' },
    { label: 'Generate Content',     sub: 'AI article generation',        href: '/admin/content-factory', icon: Sparkles,    color: '#f59e0b' },
    { label: 'View Coverage Map',    sub: 'Platform coverage status',     href: '/admin/coverage',        icon: BarChart3,   color: '#a78bfa' },
  ]

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Command Centre</h1>
        <p className="text-sm" style={{ color: '#475569' }}>
          Platform overview — {d.activeCountries} countries live · {d.verifiedCountries} fully verified · avg data score {d.avgScore}%
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(card => (
          <Link key={card.label} href={card.href}
            className="rounded-2xl p-5 border transition-all hover:scale-[1.02] group"
            style={{ background: card.bg, borderColor: card.border }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${card.color}20` }}>
                <card.icon size={17} style={{ color: card.color }} />
              </div>
              <ArrowRight size={14} style={{ color: card.color }} className="opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
            </div>
            <p className="text-3xl font-black text-white mb-1">{card.value}</p>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: card.color }}>{card.label}</p>
            <p className="text-xs" style={{ color: '#334155' }}>{card.sub}</p>
          </Link>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-6 mb-6">

        {/* Needs Attention — spans 2 cols */}
        <div className="col-span-2 rounded-2xl border overflow-hidden"
          style={{ background: '#0d1424', borderColor: '#1a2238' }}>
          <div className="px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor: '#1a2238' }}>
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} style={{ color: '#f59e0b' }} />
              <h2 className="text-white font-bold text-sm">Needs Attention</h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                {d.needsAttention.length} countries
              </span>
            </div>
            <Link href="/admin/data-quality"
              className="text-xs font-semibold flex items-center gap-1 transition-colors"
              style={{ color: '#475569' }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: '#1a2238' }}>
            {d.needsAttention.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <CheckCircle size={24} className="mx-auto mb-2" style={{ color: '#10b981' }} />
                <p className="text-sm font-semibold text-white">All countries fully loaded</p>
              </div>
            ) : (
              d.needsAttention.map((c: any) => (
                <div key={c.iso2} className="px-6 py-3.5 flex items-center justify-between"
                  style={{ borderColor: '#1a2238' }}>
                  <div className="flex items-center gap-3">
                    <img src={`https://flagcdn.com/20x15/${c.iso2.toLowerCase()}.png`}
                      alt={c.name} width={20} height={15} className="rounded-sm shrink-0" />
                    <div>
                      <p className="text-white text-sm font-semibold">{c.name}</p>
                      <p className="text-xs" style={{ color: '#334155' }}>{c.iso2} · {c.filled}/23 tables</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 rounded-full h-1.5" style={{ background: '#1e293b' }}>
                        <div className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${c.score}%`,
                            background: c.score >= 90 ? '#10b981' : c.score >= 70 ? '#f59e0b' : '#ef4444'
                          }} />
                      </div>
                      <span className="text-xs font-bold w-8"
                        style={{ color: c.score >= 90 ? '#10b981' : c.score >= 70 ? '#f59e0b' : '#ef4444' }}>
                        {c.score}%
                      </span>
                    </div>
                    <Link href={`/admin/data-quality/${c.iso2.toLowerCase()}`}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}>
                      Verify
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recently Verified */}
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: '#0d1424', borderColor: '#1a2238' }}>
          <div className="px-5 py-4 border-b flex items-center gap-2"
            style={{ borderColor: '#1a2238' }}>
            <Clock size={14} style={{ color: '#10b981' }} />
            <h2 className="text-white font-bold text-sm">Recently Verified</h2>
          </div>
          <div className="divide-y" style={{ borderColor: '#1a2238' }}>
            {d.recentlyVerified.length === 0 ? (
              <div className="px-5 py-6 text-center">
                <p className="text-xs" style={{ color: '#334155' }}>No verified countries yet</p>
              </div>
            ) : (
              d.recentlyVerified.map((c: any) => (
                <div key={c.iso2} className="px-5 py-3 flex items-center gap-3"
                  style={{ borderColor: '#1a2238' }}>
                  <img src={`https://flagcdn.com/20x15/${c.iso2.toLowerCase()}.png`}
                    alt={c.name} width={20} height={15} className="rounded-sm shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{c.name}</p>
                    <p className="text-xs" style={{ color: '#334155' }}>
                      {new Date(c.last_data_update).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: c.hrlake_coverage_level === 'full' ? '#10b981' : '#f59e0b' }} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ background: '#0d1424', borderColor: '#1a2238' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: '#1a2238' }}>
          <h2 className="text-white font-bold text-sm">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-4 divide-x" >
          {QUICK_ACTIONS.map(action => (
            <Link key={action.label} href={action.href}
              className="px-6 py-5 flex flex-col gap-3 transition-all group hover:bg-white/[0.02] cursor-pointer"
              style={{ background: 'transparent' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ background: `${action.color}15` }}>
                <action.icon size={17} style={{ color: action.color }} />
              </div>
              <div>
                <p className="text-white text-sm font-semibold mb-0.5 group-hover:text-white transition-colors">{action.label}</p>
                <p className="text-xs" style={{ color: '#334155' }}>{action.sub}</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold mt-auto"
                style={{ color: action.color }}>
                Open <ArrowRight size={11} />
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
