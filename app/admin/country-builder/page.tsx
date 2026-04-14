'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import {
  Layers, RefreshCw, Plus, ExternalLink, AlertCircle, Loader2,
  Database, Check, Sparkles, ChevronDown, ChevronUp, ArrowRight,
  CheckCircle, XCircle, Power, Trash2, AlertTriangle
} from 'lucide-react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

const TABS = ['Countries', 'Source Registry', 'Add Country', 'AI Populate'] as const
type Tab = typeof TABS[number]

const CORE_TABLES = [
  { key: 'tax_brackets',       short: 'Tax',     label: 'Tax Brackets'       },
  { key: 'social_security',    short: 'SS',       label: 'Social Security'    },
  { key: 'employment_rules',   short: 'Rules',    label: 'Employment Rules'   },
  { key: 'filing_calendar',    short: 'Filing',   label: 'Filing Calendar'    },
  { key: 'public_holidays',    short: 'Hols',     label: 'Public Holidays'    },
  { key: 'statutory_leave',    short: 'Leave',    label: 'Statutory Leave'    },
  { key: 'working_hours',      short: 'Hours',    label: 'Working Hours'      },
  { key: 'termination_rules',  short: 'Term',     label: 'Termination Rules'  },
  { key: 'pension_schemes',    short: 'Pension',  label: 'Pension Schemes'    },
  { key: 'payroll_compliance', short: 'Comp',     label: 'Payroll Compliance' },
]

const PREMIUM_TABLES = [
  { key: 'mandatory_benefits',          label: 'Mandatory Benefits'        },
  { key: 'health_insurance',            label: 'Health Insurance'          },
  { key: 'payslip_requirements',        label: 'Payslip Requirements'      },
  { key: 'record_retention',            label: 'Record Retention'          },
  { key: 'remote_work_rules',           label: 'Remote Work Rules'         },
  { key: 'expense_rules',               label: 'Expense Rules'             },
  { key: 'contractor_rules',            label: 'Contractor Rules'          },
  { key: 'work_permits',                label: 'Work Permits'              },
  { key: 'entity_setup',               label: 'Entity Setup'              },
  { key: 'tax_credits',                 label: 'Tax Credits'               },
  { key: 'regional_tax_rates',          label: 'Regional Tax Rates'        },
  { key: 'salary_benchmarks',           label: 'Salary Benchmarks'         },
  { key: 'government_benefit_payments', label: 'Gov. Benefit Payments'     },
]

const ALL_TABLES    = [...CORE_TABLES, ...PREMIUM_TABLES]
const CORE_COUNT    = CORE_TABLES.length
const PREMIUM_COUNT = PREMIUM_TABLES.length
const TOTAL_COUNT   = ALL_TABLES.length

type Country = { iso2: string; name: string; currency_code: string; is_active: boolean; last_data_update: string | null }
type Counts   = Record<string, Record<string, number>>
type Source   = { id: string; country_code: string; data_category: string; authority_name: string; source_url: string; last_checked: string | null }

const S = {
  card:  { background: '#0d1424', border: '1px solid #1a2238', borderRadius: 16 },
  input: 'w-full rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none transition-colors',
}

export default function CountryBuilderPage() {
  const searchParams = useSearchParams()
  const [tab, setTab]               = useState<Tab>(() => {
    const t = searchParams.get('tab')
    return (TABS.includes(t as Tab) ? t : 'Countries') as Tab
  })
  const [countries, setCountries]   = useState<Country[]>([])
  const [counts, setCounts]         = useState<Counts>({})
  const [sources, setSources]       = useState<Source[]>([])
  const [filterCode, setFilterCode] = useState('')
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [newC, setNewC]             = useState({ iso2: '', iso3: '', name: '', currency_code: '', flag_emoji: '', region: '' })
  const [popForm, setPopForm]       = useState({ iso2: searchParams.get('iso2') ?? '', name: '', currency_code: '' })
  const [popStatus, setPopStatus]   = useState<'idle'|'loading'|'done'|'error'>('idle')
  const [popData, setPopData]       = useState<any>(null)
  const [popMsg, setPopMsg]         = useState('')
  const [inserting, setInserting]   = useState(false)
  const [insertDone, setInsertDone] = useState(false)
  const [expanded, setExpanded]     = useState<Record<string,boolean>>({})
  const [deleteTarget, setDeleteTarget] = useState<{ iso2: string; name: string } | null>(null)
  const [deleting, setDeleting]         = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data: cs, error: ce } = await sb.from('countries')
        .select('iso2,name,currency_code,is_active,last_data_update').order('name')
      if (ce) throw ce
      setCountries(cs ?? [])
      const allCounts: Counts = {}
      await Promise.all(ALL_TABLES.map(async t => {
        const { data: rows } = await sb.schema('hrlake').from(t.key).select('country_code')
        for (const row of (rows ?? []) as any[]) {
          const cc = row.country_code
          if (!allCounts[cc]) allCounts[cc] = {}
          allCounts[cc][t.key] = (allCounts[cc][t.key] ?? 0) + 1
        }
      }))
      setCounts(allCounts)
    } catch (e: any) { setError(e.message ?? 'Load failed') }
    finally { setLoading(false) }
  }, [])

  const loadSources = useCallback(async (code: string) => {
    try {
      let q = sb.schema('hrlake').from('official_sources').select('*').order('data_category')
      if (code) q = q.eq('country_code', code)
      const { data } = await q
      setSources(data ?? [])
    } catch {}
  }, [])

  useEffect(() => { loadData() }, [loadData])
  useEffect(() => {
    if (tab === 'Source Registry') loadSources(filterCode)
  }, [tab, filterCode, loadSources])

  async function handleAdd() {
    setSaving(true); setError(''); setSaved(false)
    try {
      const res = await fetch('/api/admin-add-country', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newC })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Add failed')
      setSaved(true)
      setNewC({ iso2: '', iso3: '', name: '', currency_code: '', flag_emoji: '', region: '' })
      await loadData()
      setTimeout(() => setSaved(false), 4000)
    } catch (e: any) { setError(e.message ?? 'Add failed') }
    finally { setSaving(false) }
  }

  async function handleActivate(iso2: string, activate: boolean) {
    try {
      const res = await fetch('/api/admin-add-country', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iso2, is_active: activate })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Update failed')
      await loadData()
    } catch (e: any) { setError(e.message ?? 'Update failed') }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch('/api/admin-add-country', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iso2: deleteTarget.iso2 })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Delete failed')
      setDeleteTarget(null)
      await loadData()
    } catch (e: any) { setError(e.message ?? 'Delete failed') }
    finally { setDeleting(false) }
  }

  async function handlePopulate() {
    setPopStatus('loading'); setPopMsg(''); setPopData(null); setInsertDone(false)
    try {
      const controller = new AbortController()
      const tid = setTimeout(() => controller.abort(), 130000)
      const res = await fetch('/api/populate-country', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: popForm.iso2.toUpperCase(),
          countryName: popForm.name,
          currencyCode: popForm.currency_code.toUpperCase(),
        }),
        signal: controller.signal,
      })
      clearTimeout(tid)
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error ?? 'AI populate failed')
      setPopData(json.data)
      setPopStatus('done')
      const exp: Record<string,boolean> = {}
      CORE_TABLES.forEach(t => { exp[t.key] = true })
      setExpanded(exp)
    } catch (e: any) {
      setPopMsg(e.message ?? 'Error')
      setPopStatus('error')
    }
  }

  async function handleInsert() {
    if (inserting) return
    setInserting(true); setPopMsg('')
    try {
      const res = await fetch('/api/insert-country-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: popData, countryCode: popForm.iso2.toUpperCase() }),
      })
      const json = await res.json()
      if (!res.ok) {
        setPopMsg('Insert errors: ' + (json.details ? json.details.join(' | ') : json.error))
      } else {
        setInsertDone(true)
      }
      await loadData()
    } catch (e: any) {
      setPopMsg(e.message ?? 'Insert failed')
    } finally {
      setInserting(false)
    }
  }

  function getScore(iso2: string) {
    const c = counts[iso2] ?? {}
    const coreCount    = CORE_TABLES.filter(t => (c[t.key] ?? 0) > 0).length
    const premiumCount = PREMIUM_TABLES.filter(t => (c[t.key] ?? 0) > 0).length
    const filled = coreCount + premiumCount
    return { filled, coreCount, premiumCount, pct: Math.round((filled / TOTAL_COUNT) * 100) }
  }

  const active   = countries.filter(c => c.is_active)
  const inactive = countries.filter(c => !c.is_active)
  const full     = active.filter(c => getScore(c.iso2).pct === 100).length

  const inputStyle = {
    background: '#111827',
    border: '1px solid #1f2937',
  }

  return (
    <div className="p-8">

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl border p-8 w-full max-w-md mx-4 shadow-2xl"
            style={{ background: '#0d1424', borderColor: '#1a2238' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(239,68,68,0.12)' }}>
                <AlertTriangle size={20} style={{ color: '#ef4444' }} />
              </div>
              <div>
                <p className="text-white font-bold text-base">Delete country?</p>
                <p className="text-xs mt-0.5" style={{ color: '#475569' }}>This action cannot be undone</p>
              </div>
            </div>
            <div className="rounded-xl p-4 mb-6"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <p className="text-sm font-bold text-white mb-1">
                {deleteTarget.name} ({deleteTarget.iso2})
              </p>
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                Permanently removes this country and all associated hrlake data from Supabase. Any published Sanity articles will remain but the country will no longer appear on the platform.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid #1a2238' }}>
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: '#ef4444', color: '#ffffff' }}>
                {deleting
                  ? <><Loader2 size={14} className="animate-spin" /> Deleting…</>
                  : <><Trash2 size={14} /> Delete {deleteTarget.iso2}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(59,130,246,0.12)' }}>
          <Layers size={20} style={{ color: '#3b82f6' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Country Manager</h1>
          <p className="text-sm" style={{ color: '#475569' }}>
            Intelligence Engine \u2014 manage country data, sources and AI population
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Countries', value: active.length,      color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',   border: 'rgba(59,130,246,0.2)'   },
          { label: 'Fully Loaded',     value: full,               color: '#10b981', bg: 'rgba(16,185,129,0.08)',   border: 'rgba(16,185,129,0.2)'   },
          { label: 'Inactive',         value: inactive.length,    color: '#475569', bg: 'rgba(71,85,105,0.08)',    border: 'rgba(71,85,105,0.2)'    },
          { label: 'Data Tables',      value: TOTAL_COUNT,        color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',   border: 'rgba(245,158,11,0.2)'   },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5 border"
            style={{ background: s.bg, borderColor: s.border }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: s.color }}>{s.label}</p>
            <p className="text-3xl font-black text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl p-4 mb-6 flex items-center gap-3"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertCircle size={16} style={{ color: '#ef4444' }} className="shrink-0" />
          <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: tab === t ? '#2563eb' : 'rgba(255,255,255,0.04)',
              color: tab === t ? '#ffffff' : '#64748b',
              border: tab === t ? '1px solid #2563eb' : '1px solid transparent',
            }}>
            {t === 'AI Populate' ? '\u2736 ' + t : t}
          </button>
        ))}
      </div>

      {/* ── COUNTRIES TAB ── */}
      {tab === 'Countries' && (
        loading ? (
          <div className="flex items-center justify-center gap-3 py-16" style={{ color: '#334155' }}>
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading countries\u2026</span>
          </div>
        ) : (
          <div className="rounded-2xl border overflow-hidden" style={S.card}>
            <div className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: '#1a2238' }}>
              <h2 className="text-white font-bold text-sm">Country Data Coverage</h2>
              <button onClick={loadData}
                className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                style={{ color: '#334155' }}>
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a2238' }}>
                    <th className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#334155' }}>Country</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#475569' }}>Core 10</th>
                    <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#a78bfa' }}>Premium 13</th>
                    <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#334155' }}>Total/23</th>
                    <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#334155' }}>Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {countries.map((c, i) => {
                    const { filled, coreCount, premiumCount, pct } = getScore(c.iso2)
                    const scoreColor = pct === 100 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#ef4444'
                    return (
                      <tr key={c.iso2} style={{ borderBottom: i < countries.length - 1 ? '1px solid #111827' : 'none' }}>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <img src={`https://flagcdn.com/20x15/${c.iso2.toLowerCase()}.png`}
                              alt={c.name} width={20} height={15} className="rounded-sm shrink-0" />
                            <div>
                              <p className="text-white font-semibold text-sm">{c.name}</p>
                              <p className="text-xs" style={{ color: '#334155' }}>{c.iso2} \u00b7 {c.currency_code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-10 rounded-full h-1" style={{ background: '#1e293b' }}>
                              <div className="h-1 rounded-full" style={{ width: `${(coreCount/CORE_COUNT)*100}%`, background: coreCount===CORE_COUNT?'#10b981':coreCount>5?'#f59e0b':'#ef4444' }} />
                            </div>
                            <span className="text-xs font-bold tabular-nums" style={{ color: coreCount===CORE_COUNT?'#10b981':coreCount>5?'#f59e0b':'#ef4444' }}>{coreCount}/10</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-10 rounded-full h-1" style={{ background: '#1e293b' }}>
                              <div className="h-1 rounded-full" style={{ width: `${(premiumCount/PREMIUM_COUNT)*100}%`, background: premiumCount===PREMIUM_COUNT?'#10b981':premiumCount>6?'#f59e0b':'#ef4444' }} />
                            </div>
                            <span className="text-xs font-bold tabular-nums" style={{ color: premiumCount===PREMIUM_COUNT?'#10b981':premiumCount>6?'#f59e0b':'#ef4444' }}>{premiumCount}/13</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-12 rounded-full h-1.5" style={{ background: '#1e293b' }}>
                              <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: scoreColor }} />
                            </div>
                            <span className="text-xs font-bold tabular-nums" style={{ color: scoreColor }}>{pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                            style={!c.is_active
                              ? { background: 'rgba(71,85,105,0.15)', color: '#64748b', border: '1px solid rgba(71,85,105,0.3)' }
                              : pct === 100
                                ? { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }
                                : { background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }
                            }>
                            {!c.is_active ? 'Inactive' : pct === 100 ? 'Complete' : 'Partial'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2 justify-end">
                            {!c.is_active && (
                              <button onClick={() => handleActivate(c.iso2, true)}
                                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all"
                                style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                                <Power size={11} /> Activate
                              </button>
                            )}
                            {c.is_active && (
                              <button onClick={() => handleActivate(c.iso2, false)}
                                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all"
                                style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                                <Power size={11} /> Deactivate
                              </button>
                            )}
                            {!c.is_active && (
                              <button onClick={() => setDeleteTarget({ iso2: c.iso2, name: c.name })}
                                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all"
                                style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* ── SOURCE REGISTRY TAB ── */}
      {tab === 'Source Registry' && (
        <div className="space-y-5">
          <div className="rounded-2xl border p-5" style={S.card}>
            <p className="text-white font-semibold text-sm mb-3">Filter by Country</p>
            <select value={filterCode} onChange={e => setFilterCode(e.target.value)}
              className="rounded-xl px-4 py-3 text-white text-sm focus:outline-none w-72"
              style={{ ...inputStyle }}>
              <option value="">All Countries</option>
              {countries.map(c => (
                <option key={c.iso2} value={c.iso2}>{c.name} ({c.iso2})</option>
              ))}
            </select>
          </div>
          <div className="rounded-2xl border overflow-hidden" style={S.card}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#1a2238' }}>
              <h2 className="text-white font-bold text-sm">Official Sources</h2>
              <span className="text-xs" style={{ color: '#334155' }}>
                {sources.length} source{sources.length !== 1 ? 's' : ''} {filterCode ? `for ${filterCode}` : 'across all countries'}
              </span>
            </div>
            {sources.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Database size={28} className="mx-auto mb-3" style={{ color: '#1f2937' }} />
                <p className="text-sm" style={{ color: '#334155' }}>No sources found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1a2238' }}>
                      {['Country','Category','Authority','Source URL','Last Checked'].map(h => (
                        <th key={h} className="text-left px-6 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: '#334155' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((s, i) => (
                      <tr key={s.id} style={{ borderBottom: i < sources.length - 1 ? '1px solid #111827' : 'none' }}>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <img src={`https://flagcdn.com/20x15/${s.country_code.toLowerCase()}.png`}
                              alt={s.country_code} width={20} height={15} className="rounded-sm" />
                            <span className="text-white text-xs font-bold">{s.country_code}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                            style={{ background: '#111827', color: '#64748b' }}>{s.data_category}</span>
                        </td>
                        <td className="px-6 py-3 text-xs" style={{ color: '#94a3b8' }}>{s.authority_name}</td>
                        <td className="px-6 py-3">
                          <a href={s.source_url.startsWith('http') ? s.source_url : `https://${s.source_url}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs transition-colors"
                            style={{ color: '#3b82f6' }}>
                            <ExternalLink size={10} className="shrink-0" />
                            <span className="truncate max-w-xs">{s.source_url}</span>
                          </a>
                        </td>
                        <td className="px-6 py-3 text-xs" style={{ color: '#475569' }}>
                          {s.last_checked
                            ? new Date(s.last_checked).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '\u2014'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ADD COUNTRY TAB ── */}
      {tab === 'Add Country' && (
        <div className="max-w-2xl space-y-5">
          <div className="rounded-2xl border p-6" style={S.card}>
            <div className="flex items-center gap-2 mb-1">
              <Plus size={15} style={{ color: '#3b82f6' }} />
              <h2 className="text-white font-bold text-sm">Add New Country</h2>
            </div>
            <p className="text-xs mb-6" style={{ color: '#334155' }}>
              Country is added as inactive. Populate data and publish all 8 articles before activating.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: '#475569' }}>ISO2 *</label>
                  <input value={newC.iso2}
                    onChange={e => setNewC(p => ({ ...p, iso2: e.target.value.toUpperCase().slice(0,2) }))}
                    placeholder="e.g. JP" maxLength={2}
                    className={S.input} style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: '#475569' }}>ISO3</label>
                  <input value={newC.iso3}
                    onChange={e => setNewC(p => ({ ...p, iso3: e.target.value.toUpperCase().slice(0,3) }))}
                    placeholder="e.g. JPN" maxLength={3}
                    className={S.input} style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: '#475569' }}>Currency *</label>
                  <input value={newC.currency_code}
                    onChange={e => setNewC(p => ({ ...p, currency_code: e.target.value.toUpperCase().slice(0,3) }))}
                    placeholder="e.g. JPY" maxLength={3}
                    className={S.input} style={inputStyle} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: '#475569' }}>Country Name *</label>
                  <input value={newC.name}
                    onChange={e => setNewC(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Japan"
                    className={S.input} style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: '#475569' }}>Flag Emoji</label>
                  <input value={newC.flag_emoji}
                    onChange={e => setNewC(p => ({ ...p, flag_emoji: e.target.value }))}
                    placeholder="e.g. \ud83c\uddef\ud83c\uddf5"
                    className={S.input} style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: '#475569' }}>Region</label>
                <select value={newC.region}
                  onChange={e => setNewC(p => ({ ...p, region: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                  style={inputStyle}>
                  <option value="">Select region\u2026</option>
                  {['Europe','Americas','Asia Pacific','Middle East','Africa','Asia'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {saved && (
              <div className="mt-4 rounded-xl p-3 flex items-center gap-2"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <CheckCircle size={14} style={{ color: '#10b981' }} />
                <p className="text-sm font-semibold" style={{ color: '#10b981' }}>Country added \u2014 marked inactive until data is loaded.</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button onClick={handleAdd}
                disabled={saving || !newC.iso2 || !newC.name || !newC.currency_code}
                className="flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl transition-all disabled:opacity-40"
                style={{ background: '#2563eb', color: '#ffffff' }}>
                {saving
                  ? <><Loader2 size={14} className="animate-spin" /> Adding\u2026</>
                  : <><Plus size={14} /> Add Country</>}
              </button>
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#f59e0b' }}>Required steps before activating</p>
            <ol className="text-xs space-y-1.5 list-decimal list-inside" style={{ color: '#64748b' }}>
              <li>Populate all hrlake data tables via AI Populate tab</li>
              <li>Run AI verification in Data Quality</li>
              <li>Generate all 8 Sanity articles in Content Factory</li>
              <li>Verify Payroll Calculator produces correct results</li>
              <li>Activate country \u2014 it will go live immediately</li>
            </ol>
          </div>
        </div>
      )}

      {/* ── AI POPULATE TAB ── */}
      {tab === 'AI Populate' && (
        <div className="space-y-5 max-w-4xl">
          <div className="rounded-2xl border p-6" style={S.card}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={15} style={{ color: '#3b82f6' }} />
              <h2 className="text-white font-bold text-sm">AI Population Engine</h2>
            </div>
            <p className="text-xs mb-6" style={{ color: '#334155' }}>
              Enter a country and Claude will research all 10 data tables. Review the data, then insert directly into Supabase.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'ISO2 Code *', key: 'iso2', placeholder: 'e.g. SG', max: 2 },
                { label: 'Country Name *', key: 'name', placeholder: 'e.g. Singapore', max: undefined },
                { label: 'Currency Code *', key: 'currency_code', placeholder: 'e.g. SGD', max: 3 },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: '#475569' }}>{field.label}</label>
                  <input
                    value={(popForm as any)[field.key]}
                    onChange={e => {
                      const val = field.max ? e.target.value.toUpperCase().slice(0, field.max) : e.target.value
                      setPopForm(p => ({ ...p, [field.key]: val }))
                    }}
                    placeholder={field.placeholder}
                    maxLength={field.max}
                    disabled={popStatus === 'loading'}
                    className={S.input} style={inputStyle} />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={handlePopulate}
                disabled={popStatus === 'loading' || !popForm.iso2 || !popForm.name || !popForm.currency_code}
                className="flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl transition-all disabled:opacity-40"
                style={{ background: '#2563eb', color: '#ffffff' }}>
                {popStatus === 'loading'
                  ? <><Loader2 size={14} className="animate-spin" /> Researching \u2014 up to 60s\u2026</>
                  : <><Sparkles size={14} /> AI Populate</>}
              </button>
              {popStatus === 'done' && !insertDone && (
                <button onClick={handleInsert} disabled={inserting}
                  className="flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl transition-all disabled:opacity-40"
                  style={{ background: '#059669', color: '#ffffff' }}>
                  {inserting
                    ? <><Loader2 size={14} className="animate-spin" /> Inserting\u2026</>
                    : <><Database size={14} /> Insert All Data</>}
                </button>
              )}
            </div>

            {popStatus === 'loading' && (
              <div className="mt-5 rounded-xl p-4" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <p className="text-sm font-semibold" style={{ color: '#3b82f6' }}>Claude is researching {popForm.name} from official government sources\u2026</p>
                <p className="text-xs mt-1" style={{ color: '#334155' }}>Searching all 10 data categories. This takes 30\u201360 seconds.</p>
              </div>
            )}
            {popStatus === 'error' && (
              <div className="mt-5 rounded-xl p-4 flex items-center gap-3"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <AlertCircle size={15} style={{ color: '#ef4444' }} className="shrink-0" />
                <p className="text-sm" style={{ color: '#ef4444' }}>{popMsg}</p>
              </div>
            )}
            {insertDone && (
              <div className="mt-5 rounded-xl p-4 flex items-center gap-3"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <CheckCircle size={15} style={{ color: '#10b981' }} className="shrink-0" />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#10b981' }}>All data inserted successfully!</p>
                  <p className="text-xs mt-0.5" style={{ color: '#334155' }}>Go to Data Quality to verify. Activate the country when ready.</p>
                </div>
              </div>
            )}
            {popMsg && !insertDone && popStatus !== 'error' && (
              <div className="mt-5 rounded-xl p-4 flex items-center gap-3"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <AlertCircle size={15} style={{ color: '#ef4444' }} className="shrink-0" />
                <p className="text-sm" style={{ color: '#ef4444' }}>{popMsg}</p>
              </div>
            )}
          </div>

          {popStatus === 'done' && popData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold">
                  Proposed Data \u2014 {popForm.name} ({popForm.iso2.toUpperCase()})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => { const e: Record<string,boolean> = {}; CORE_TABLES.forEach(t => { e[t.key] = true }); setExpanded(e) }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b' }}>
                    Expand All
                  </button>
                  <button onClick={() => setExpanded({})}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b' }}>
                    Collapse All
                  </button>
                </div>
              </div>
              {ALL_TABLES.map(t => {
                const rows   = popData[t.key] ?? []
                const src    = popData.sources?.[t.key]
                const isOpen = expanded[t.key]
                return (
                  <div key={t.key} className="rounded-2xl border overflow-hidden" style={S.card}>
                    <button
                      onClick={() => setExpanded(p => ({ ...p, [t.key]: !p[t.key] }))}
                      className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors"
                      style={{ background: 'transparent' }}>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-white font-bold text-sm">{t.label}</span>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={rows.length > 0
                            ? { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }
                            : { background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                          {rows.length} record{rows.length !== 1 ? 's' : ''}
                        </span>
                        {src && (
                          <a href={src.source_url} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs transition-colors"
                            style={{ color: '#3b82f6' }}>
                            <ExternalLink size={10} />
                            <span>{src.authority_name}</span>
                          </a>
                        )}
                      </div>
                      {isOpen
                        ? <ChevronUp size={15} style={{ color: '#334155' }} className="shrink-0" />
                        : <ChevronDown size={15} style={{ color: '#334155' }} className="shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 border-t" style={{ borderColor: '#1a2238' }}>
                        {rows.length === 0 || !rows[0] ? (
                          <p className="text-xs pt-4" style={{ color: '#1f2937' }}>No data returned for this table.</p>
                        ) : (
                          <div className="overflow-x-auto mt-3">
                            <table className="w-full text-xs">
                              <thead>
                                <tr style={{ borderBottom: '1px solid #1a2238' }}>
                                  {Object.keys(rows[0]).filter((k: string) => k !== 'country_code').map((k: string) => (
                                    <th key={k} className="text-left px-3 py-2 font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: '#334155' }}>{k}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {rows.map((row: any, i: number) => (
                                  <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid #0d1117' : 'none' }}>
                                    {Object.entries(row).filter(([k]: [string, any]) => k !== 'country_code').map(([k, v]: [string, any]) => (
                                      <td key={k} className="px-3 py-2 whitespace-nowrap"
                                        style={{ color: v === null ? '#1f2937' : v === true ? '#10b981' : v === false ? '#ef4444' : '#94a3b8' }}>
                                        {v === null ? 'null' : v === true ? 'true' : v === false ? 'false' : String(v)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              {!insertDone && (
                <div className="pt-2 flex justify-end">
                  <button onClick={handleInsert} disabled={inserting}
                    className="flex items-center gap-2 text-sm font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-40"
                    style={{ background: '#059669', color: '#ffffff' }}>
                    {inserting
                      ? <><Loader2 size={14} className="animate-spin" /> Inserting all data\u2026</>
                      : <><Database size={14} /> Insert All Data into Supabase</>}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
