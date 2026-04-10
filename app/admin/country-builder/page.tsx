'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Hammer, RefreshCw, Plus, ExternalLink, AlertCircle, Loader2, Database, Check, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const TABS = ['Countries', 'Source Registry', 'Add Country', 'AI Populate'] as const
type Tab = typeof TABS[number]
const CORE_TABLES = [
  { key: 'tax_brackets',       short: 'Tax',     label: 'Tax Brackets'       },
  { key: 'social_security',    short: 'SS',       label: 'Social Security'    },
  { key: 'employment_rules',   short: 'Rules',    label: 'Employment Rules'   },
  { key: 'filing_calendar',    short: 'Cal',      label: 'Filing Calendar'    },
  { key: 'public_holidays',    short: 'Hols',     label: 'Public Holidays'    },
  { key: 'statutory_leave',    short: 'Leave',    label: 'Statutory Leave'    },
  { key: 'working_hours',      short: 'Hours',    label: 'Working Hours'      },
  { key: 'termination_rules',  short: 'End',      label: 'Termination Rules'  },
  { key: 'pension_schemes',    short: 'Pension',  label: 'Pension Schemes'    },
  { key: 'payroll_compliance', short: 'Pay',      label: 'Payroll Compliance' },
]
type Country = { iso2: string; name: string; currency_code: string; is_active: boolean; last_data_update: string | null }
type Counts = Record<string, Record<string, number>>
type Source = { id: string; country_code: string; data_category: string; authority_name: string; source_url: string; last_checked: string | null }

export default function CountryBuilderPage() {
  const [tab, setTab]               = useState<Tab>('Countries')
  const [countries, setCountries]   = useState<Country[]>([])
  const [counts, setCounts]         = useState<Counts>({})
  const [sources, setSources]       = useState<Source[]>([])
  const [filterCode, setFilterCode] = useState('')
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [newC, setNewC]             = useState({ iso2: '', name: '', currency_code: '', flag_emoji: '', region: '' })
  const [popForm, setPopForm]       = useState({ iso2: '', name: '', currency_code: '' })
  const [popStatus, setPopStatus]   = useState<'idle'|'loading'|'done'|'error'>('idle')
  const [popData, setPopData]       = useState<any>(null)
  const [popMsg, setPopMsg]         = useState('')
  const [inserting, setInserting]   = useState(false)
  const [insertDone, setInsertDone] = useState(false)
  const [expanded, setExpanded]     = useState<Record<string,boolean>>({})
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

  const loadData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const { data: cs, error: ce } = await sb.from('countries')
        .select('iso2,name,currency_code,is_active,last_data_update').order('name')
      if (ce) throw ce
      setCountries(cs ?? [])
      const allCounts: Counts = {}
      for (const t of CORE_TABLES) {
        const { data: rows } = await sb.schema('hrlake').from(t.key).select('country_code')
        for (const row of (rows ?? []) as any[]) {
          const cc = row.country_code
          if (!allCounts[cc]) allCounts[cc] = {}
          allCounts[cc][t.key] = (allCounts[cc][t.key] ?? 0) + 1
        }
      }
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
      setSaved(true)
      setNewC({ iso2: '', name: '', currency_code: '', flag_emoji: '', region: '' })
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
  async function handleDelete(iso2: string) {
    if (!window.confirm('DELETE ' + iso2 + '? This will remove the country and ALL its data permanently. This cannot be undone.')) return
    try {
      const res = await fetch('/api/admin-add-country', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iso2 })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Delete failed')
      await loadData()
    } catch (e: any) { setError(e.message ?? 'Delete failed') }
  }
  async function handlePopulate() {
    setPopStatus('loading'); setPopMsg(''); setPopData(null); setInsertDone(false)
    try {
      const res = await fetch('/api/populate-country', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: popForm.iso2.toUpperCase(),
          countryName: popForm.name,
          currencyCode: popForm.currency_code.toUpperCase(),
        }),
      })
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
    setInserting(true); setPopMsg('')
    try {
      const res = await fetch('/api/insert-country-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: popData, countryCode: popForm.iso2.toUpperCase() }),
      })
      const json = await res.json()
      setInsertDone(true)
      await loadData()
    } catch (e: any) {
      setPopMsg(e.message ?? 'Insert failed')
    } finally {
      setInserting(false)
    }
  }

  function getScore(iso2: string) {
    const c = counts[iso2] ?? {}
    const filled = CORE_TABLES.filter(t => (c[t.key] ?? 0) > 0).length
    return Math.round((filled / CORE_TABLES.length) * 100)
  }
  function scoreColor(n: number) {
    if (n === 100) return 'text-emerald-400'
    if (n >= 70)   return 'text-amber-400'
    return 'text-red-400'
  }

  const card     = 'bg-slate-900 border border-slate-800 rounded-2xl'
  const inputCls = 'w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors'
  const btnBlue  = 'bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm'

  const active   = countries.filter(c => c.is_active)
  const inactive = countries.filter(c => !c.is_active)
  const full     = active.filter(c => getScore(c.iso2) === 100).length

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
            <Hammer size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Country Builder</h1>
            <p className="text-slate-400 text-sm">Intelligence Engine — manage country data, sources and coverage</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Countries', value: active.length,      color: 'text-blue-400',    bg: 'bg-blue-600/10 border-blue-600/20'      },
          { label: 'Fully Loaded',     value: full,               color: 'text-emerald-400', bg: 'bg-emerald-600/10 border-emerald-600/20' },
          { label: 'Inactive',         value: inactive.length,    color: 'text-slate-400',   bg: 'bg-slate-700/20 border-slate-700/30'     },
          { label: 'Data Tables',      value: CORE_TABLES.length, color: 'text-amber-400',   bg: 'bg-amber-600/10 border-amber-600/20'     },
        ].map(s => (
          <div key={s.label} className={`border rounded-2xl p-5 ${s.bg}`}>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === t ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}>
            {t === 'AI Populate' ? '✨ ' + t : t}
          </button>
        ))}
      </div>

      {tab === 'Countries' && (
        loading ? (
          <div className="flex items-center gap-3 py-12 justify-center text-slate-500">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading countries…</span>
          </div>
        ) : (
          <div className={`${card} overflow-hidden`}>
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-white font-bold">Country Data Coverage</h2>
              <button onClick={loadData}
                className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold transition-colors">
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Country</th>
                    {CORE_TABLES.map(t => (
                      <th key={t.key} title={t.label}
                        className="text-center px-2 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {t.short}
                      </th>
                    ))}
                    <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Score</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {countries.map(c => {
                    const score = getScore(c.iso2)
                    const cc    = counts[c.iso2] ?? {}
                    return (
                      <tr key={c.iso2} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <img src={`https://flagcdn.com/20x15/${c.iso2.toLowerCase()}.png`}
                              alt={c.name} width={20} height={15} className="rounded-sm shrink-0" />
                            <div>
                              <p className="text-white font-semibold text-sm">{c.name}</p>
                              <p className="text-slate-500 text-xs">{c.iso2} · {c.currency_code}</p>
                            </div>
                          </div>
                        </td>
                        {CORE_TABLES.map(t => (
                          <td key={t.key} className="px-2 py-3 text-center">
                            {(cc[t.key] ?? 0) > 0
                              ? <span className="text-emerald-400 text-xs font-bold">{cc[t.key]}</span>
                              : <span className="text-slate-700 text-xs">—</span>}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold text-sm ${scoreColor(score)}`}>{score}%</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                            !c.is_active
                              ? 'bg-slate-700/30 text-slate-500 border-slate-700/50'
                              : score === 100
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}>
                            {!c.is_active ? 'Inactive' : score === 100 ? 'Complete' : 'Partial'}
                          </span>
                          {!c.is_active && (
                            <button
                              onClick={() => handleActivate(c.iso2, true)}
                              className="ml-2 text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/40 transition-colors"
                            >Activate</button>
                          )}
                          {c.is_active && (
                            <button
                              onClick={() => handleActivate(c.iso2, false)}
                              className="ml-2 text-xs font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/40 transition-colors"
                            >Deactivate</button>
                          )}
                          {!c.is_active && (
                            <button
                              onClick={() => handleDelete(c.iso2)}
                              className="ml-2 text-xs font-bold px-2 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-700/50 hover:bg-red-900/70 transition-colors"
                            >Delete</button>
                          )}
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

      {tab === 'Source Registry' && (
        <div className="space-y-6">
          <div className={`${card} p-6`}>
            <h2 className="text-white font-bold mb-1">Filter by Country</h2>
            <p className="text-slate-500 text-xs mb-4">Select a country to view its official source registry</p>
            <select value={filterCode} onChange={e => setFilterCode(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors w-72">
              <option value="">All Countries</option>
              {countries.map(c => (
                <option key={c.iso2} value={c.iso2}>{c.name} ({c.iso2})</option>
              ))}
            </select>
          </div>
          <div className={`${card} overflow-hidden`}>
            <div className="px-6 py-4 border-b border-slate-800">
              <h2 className="text-white font-bold">Official Sources</h2>
              <p className="text-slate-500 text-xs mt-0.5">
                {sources.length} source{sources.length !== 1 ? 's' : ''} {filterCode ? `for ${filterCode}` : 'across all countries'}
              </p>
            </div>
            {sources.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Database size={32} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No sources found</p>
                <p className="text-slate-600 text-xs mt-1">The official_sources table may be empty for this selection</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Country</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Authority</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Source URL</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Checked</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {sources.map(s => (
                      <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <img src={`https://flagcdn.com/20x15/${s.country_code.toLowerCase()}.png`}
                              alt={s.country_code} width={20} height={15} className="rounded-sm" />
                            <span className="text-white text-xs font-bold">{s.country_code}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className="bg-slate-800 text-slate-300 text-xs font-semibold px-2.5 py-1 rounded-lg">
                            {s.data_category}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-slate-300 text-xs">{s.authority_name}</td>
                        <td className="px-6 py-3">
                          <a href={s.source_url.startsWith('http') ? s.source_url : `https://${s.source_url}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs transition-colors">
                            <ExternalLink size={11} className="shrink-0" />
                            <span className="truncate max-w-xs">{s.source_url}</span>
                          </a>
                        </td>
                        <td className="px-6 py-3 text-slate-500 text-xs">
                          {s.last_checked
                            ? new Date(s.last_checked).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
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

      {tab === 'Add Country' && (
        <div className="max-w-2xl space-y-6">
          <div className={`${card} p-6`}>
            <div className="flex items-center gap-2 mb-1">
              <Plus size={16} className="text-blue-400" />
              <h2 className="text-white font-bold">Add New Country</h2>
            </div>
            <p className="text-slate-500 text-xs mb-6">
              Country is added as inactive. Load all Supabase data and publish all 8 articles before activating.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">ISO2 Code *</label>
                  <input value={newC.iso2}
                    onChange={e => setNewC(p => ({ ...p, iso2: e.target.value.toUpperCase().slice(0,2) }))}
                    placeholder="e.g. JP" maxLength={2} className={inputCls} />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Country Name *</label>
                  <input value={newC.name}
                    onChange={e => setNewC(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Japan" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Currency Code *</label>
                  <input value={newC.currency_code}
                    onChange={e => setNewC(p => ({ ...p, currency_code: e.target.value.toUpperCase().slice(0,3) }))}
                    placeholder="e.g. JPY" maxLength={3} className={inputCls} />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Flag Emoji</label>
                  <input value={newC.flag_emoji}
                    onChange={e => setNewC(p => ({ ...p, flag_emoji: e.target.value }))}
                    placeholder="e.g. 🇯🇵" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Region</label>
                <select value={newC.region}
                  onChange={e => setNewC(p => ({ ...p, region: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors">
                  <option value="">Select region…</option>
                  {['Europe','Americas','Asia Pacific','Middle East','Africa'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            {saved && (
              <div className="mt-4 bg-emerald-600/10 border border-emerald-600/30 rounded-xl p-3 flex items-center gap-2">
                <Check size={15} className="text-emerald-400" />
                <p className="text-emerald-400 text-sm font-semibold">Country added — marked inactive until data is loaded.</p>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button onClick={handleAdd}
                disabled={saving || !newC.iso2 || !newC.name || !newC.currency_code}
                className={btnBlue}>
                {saving
                  ? <><Loader2 size={15} className="animate-spin" /> Adding…</>
                  : <><Plus size={15} /> Add Country</>}
              </button>
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
            <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">After adding — required steps before activating</p>
            <ol className="text-slate-400 text-xs space-y-2 list-decimal list-inside">
              <li>Populate hrlake.official_sources for all data categories</li>
              <li>Load all 13 Supabase tables via the Intelligence Engine</li>
              <li>Run Content Factory — generate all 8 article types</li>
              <li>Verify the Payroll Calculator produces correct results</li>
              <li>Set is_active = true in Supabase to make the country live</li>
            </ol>
          </div>
        </div>
      )}

      {tab === 'AI Populate' && (
        <div className="space-y-6 max-w-4xl">
          <div className={`${card} p-6`}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-blue-400" />
              <h2 className="text-white font-bold">AI Population Engine</h2>
            </div>
            <p className="text-slate-500 text-xs mb-6">
              Enter a country and Claude will research all 10 data tables from official government sources in one click.
              Review the proposed data, then insert directly into Supabase.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">ISO2 Code *</label>
                <input value={popForm.iso2}
                  onChange={e => setPopForm(p => ({ ...p, iso2: e.target.value.toUpperCase().slice(0,2) }))}
                  placeholder="e.g. SG" maxLength={2} className={inputCls}
                  disabled={popStatus === 'loading'} />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Country Name *</label>
                <input value={popForm.name}
                  onChange={e => setPopForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Singapore" className={inputCls}
                  disabled={popStatus === 'loading'} />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-2">Currency Code *</label>
                <input value={popForm.currency_code}
                  onChange={e => setPopForm(p => ({ ...p, currency_code: e.target.value.toUpperCase().slice(0,3) }))}
                  placeholder="e.g. SGD" maxLength={3} className={inputCls}
                  disabled={popStatus === 'loading'} />
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <button onClick={handlePopulate}
                disabled={popStatus === 'loading' || !popForm.iso2 || !popForm.name || !popForm.currency_code}
                className={btnBlue}>
                {popStatus === 'loading'
                  ? <><Loader2 size={15} className="animate-spin" /> Researching — up to 60 seconds…</>
                  : <><Sparkles size={15} /> AI Populate</>}
              </button>
              {popStatus === 'done' && !insertDone && (
                <button onClick={handleInsert} disabled={inserting}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm">
                  {inserting
                    ? <><Loader2 size={15} className="animate-spin" /> Inserting…</>
                    : <><Database size={15} /> Insert All Data into Supabase</>}
                </button>
              )}
            </div>
            {popStatus === 'loading' && (
              <div className="mt-5 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-blue-400 text-sm font-semibold">Claude is researching {popForm.name} from official government sources…</p>
                <p className="text-slate-500 text-xs mt-1">Searching all 10 data categories. This takes 30–60 seconds.</p>
              </div>
            )}
            {popStatus === 'error' && (
              <div className="mt-5 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{popMsg}</p>
              </div>
            )}
            {insertDone && (
              <div className="mt-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                <Check size={16} className="text-emerald-400 shrink-0" />
                <div>
                  <p className="text-emerald-400 text-sm font-semibold">All data inserted into Supabase successfully!</p>
                  <p className="text-slate-500 text-xs mt-0.5">Go to Data Quality to verify. Set is_active = true in Supabase when ready to go live.</p>
                </div>
              </div>
            )}
            {popMsg && !insertDone && popStatus !== 'error' && (
              <div className="mt-5 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{popMsg}</p>
              </div>
            )}
          </div>

          {popStatus === 'done' && popData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">
                  Proposed Data — {popForm.name} ({popForm.iso2.toUpperCase()})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => { const e: Record<string,boolean> = {}; CORE_TABLES.forEach(t => { e[t.key] = true }); setExpanded(e) }}
                    className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 transition-colors">
                    Expand All
                  </button>
                  <button onClick={() => setExpanded({})}
                    className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 transition-colors">
                    Collapse All
                  </button>
                </div>
              </div>
              {CORE_TABLES.map(t => {
                const rows  = popData[t.key] ?? []
                const src   = popData.sources?.[t.key]
                const isOpen = expanded[t.key]
                return (
                  <div key={t.key} className={card}>
                    <button
                      onClick={() => setExpanded(p => ({ ...p, [t.key]: !p[t.key] }))}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors rounded-2xl">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-white font-bold">{t.label}</span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          rows.length > 0
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {rows.length} record{rows.length !== 1 ? 's' : ''}
                        </span>
                        {src && (
                          <a href={src.source_url} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs transition-colors">
                            <ExternalLink size={10} />
                            <span>{src.authority_name}</span>
                          </a>
                        )}
                      </div>
                      {isOpen
                        ? <ChevronUp size={16} className="text-slate-500 shrink-0" />
                        : <ChevronDown size={16} className="text-slate-500 shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 border-t border-slate-800">
                        {rows.length === 0 || !rows[0] ? (
                          <p className="text-slate-600 text-xs pt-4">No data returned for this table.</p>
                        ) : (
                          <div className="overflow-x-auto mt-3">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-slate-800">
                                  {Object.keys(rows[0]).filter((k: string) => k !== 'country_code').map((k: string) => (
                                    <th key={k} className="text-left px-3 py-2 text-slate-500 font-bold uppercase tracking-wider whitespace-nowrap">{k}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/50">
                                {rows.map((row: any, i: number) => (
                                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                                    {Object.entries(row).filter(([k]: [string, any]) => k !== 'country_code').map(([k, v]: [string, any]) => (
                                      <td key={k} className="px-3 py-2 text-slate-300 whitespace-nowrap">
                                        {v === null
                                          ? <span className="text-slate-600">null</span>
                                          : v === true
                                            ? <span className="text-emerald-400">true</span>
                                            : v === false
                                              ? <span className="text-red-400">false</span>
                                              : String(v)}
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
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold px-8 py-3 rounded-xl transition-all flex items-center gap-2 text-sm">
                    {inserting
                      ? <><Loader2 size={15} className="animate-spin" /> Inserting all data…</>
                      : <><Database size={15} /> Insert All Data into Supabase</>}
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
