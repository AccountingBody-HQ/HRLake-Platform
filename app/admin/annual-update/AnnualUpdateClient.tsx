'use client'
import { useState, useMemo } from 'react'
import { RefreshCw, CheckCircle, XCircle, Loader2, AlertTriangle, Calendar, Globe } from 'lucide-react'

interface Country {
  iso2: string
  name: string
  flag_emoji: string
  currency_code: string
  hrlake_coverage_level: string | null
  last_data_update: string | null
  is_active: boolean
}

type VerifyStatus = 'idle' | 'running' | 'done' | 'error'

interface CountryStatus {
  status: VerifyStatus
  message?: string
}

const CURRENT_YEAR = new Date().getFullYear()
const MONTHS_BEFORE_DUE = 11

function isOverdue(lastUpdate: string | null): boolean {
  if (!lastUpdate) return true
  const diffMs = Date.now() - new Date(lastUpdate).getTime()
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30)
  return diffMonths >= MONTHS_BEFORE_DUE
}

function formatDate(d: string | null): string {
  if (!d) return 'Never verified'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AnnualUpdateClient({ countries }: { countries: Country[] }) {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)
  const [statuses, setStatuses] = useState<Record<string, CountryStatus>>({})
  const [bulkRunning, setBulkRunning] = useState(false)
  const [filter, setFilter] = useState<'all' | 'overdue' | 'done'>('all')

  const overdue = countries.filter(c => isOverdue(c.last_data_update))
  const upToDate = countries.filter(c => !isOverdue(c.last_data_update))

  const visible = useMemo(() => {
    if (filter === 'overdue') return overdue
    if (filter === 'done') return upToDate
    return countries
  }, [filter, countries, overdue, upToDate])

  async function verifyCountry(iso2: string) {
    setStatuses(prev => ({ ...prev, [iso2]: { status: 'running' } }))
    try {
      const res = await fetch('/api/admin-update-country', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode: iso2, action: 'approve_all' }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setStatuses(prev => ({ ...prev, [iso2]: { status: 'done', message: 'Marked as verified for ' + selectedYear } }))
    } catch (e: any) {
      setStatuses(prev => ({ ...prev, [iso2]: { status: 'error', message: e.message } }))
    }
  }

  async function runBulkUpdate() {
    setBulkRunning(true)
    for (const country of overdue) {
      if (statuses[country.iso2]?.status === 'done') continue
      await verifyCountry(country.iso2)
      await new Promise(r => setTimeout(r, 400))
    }
    setBulkRunning(false)
  }

  const doneCount = Object.values(statuses).filter(s => s.status === 'done').length
  const errorCount = Object.values(statuses).filter(s => s.status === 'error').length
  const runningCount = Object.values(statuses).filter(s => s.status === 'running').length

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Annual Data Update</h1>
        <p className="text-sm" style={{ color: '#64748b' }}>Review and re-verify country data on an annual cycle. Countries not verified in the last 11 months are flagged as overdue.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl p-4 text-center" style={{ background: '#0d1424', border: '1px solid #1a2238' }}>
          <p className="text-2xl font-black text-white">{countries.length}</p>
          <p className="text-xs font-bold mt-1" style={{ color: '#64748b' }}>Active Countries</p>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-2xl font-black text-red-400">{overdue.length}</p>
          <p className="text-xs font-bold text-red-400 mt-1">Overdue</p>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <p className="text-2xl font-black text-emerald-400">{upToDate.length}</p>
          <p className="text-xs font-bold text-emerald-400 mt-1">Up to Date</p>
        </div>
        <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}>
          <p className="text-2xl font-black text-blue-400">{doneCount}</p>
          <p className="text-xs font-bold text-blue-400 mt-1">Updated This Session</p>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-2xl p-5 mb-6 flex flex-wrap items-center justify-between gap-4" style={{ background: '#0d1424', border: '1px solid #1a2238' }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={15} style={{ color: '#64748b' }} />
            <span className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Tax Year:</span>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="text-sm font-bold text-white rounded-lg px-3 py-1.5 outline-none"
              style={{ background: '#111827', border: '1px solid #1f2937' }}
            >
              {[CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            {(['all', 'overdue', 'done'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="text-xs font-bold px-3 py-1.5 rounded-full border transition-all capitalize"
                style={{
                  background: filter === f ? '#2563eb' : 'transparent',
                  borderColor: filter === f ? '#2563eb' : '#1a2238',
                  color: filter === f ? '#fff' : '#64748b',
                }}>
                {f === 'all' ? `All (${countries.length})` : f === 'overdue' ? `Overdue (${overdue.length})` : `Up to Date (${upToDate.length})`}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={runBulkUpdate}
          disabled={bulkRunning || overdue.length === 0}
          className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-40"
          style={{ background: '#ef4444', color: '#fff' }}
        >
          {bulkRunning ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {bulkRunning ? `Updating... (${doneCount}/${overdue.length})` : `Bulk Update All Overdue (${overdue.length})`}
        </button>
      </div>

      {/* Progress bar if bulk running */}
      {bulkRunning && (
        <div className="mb-6 rounded-xl overflow-hidden" style={{ background: '#0d1424', border: '1px solid #1a2238' }}>
          <div className="h-2 bg-blue-600 transition-all" style={{ width: `${Math.round((doneCount / overdue.length) * 100)}%` }} />
        </div>
      )}

      {/* Session summary */}
      {(doneCount > 0 || errorCount > 0) && !bulkRunning && (
        <div className="rounded-2xl p-4 mb-6 flex items-center gap-4" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <CheckCircle size={18} className="text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-300 font-semibold">
            Session complete — {doneCount} {doneCount === 1 ? 'country' : 'countries'} updated
            {errorCount > 0 && `, ${errorCount} error${errorCount > 1 ? 's' : ''}`}.
          </p>
        </div>
      )}

      {/* Country table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1a2238' }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: '#0d1424', borderBottom: '1px solid #1a2238' }}>
              <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Country</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Coverage</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Last Verified</th>
              <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((country, i) => {
              const due = isOverdue(country.last_data_update)
              const cs = statuses[country.iso2]
              return (
                <tr key={country.iso2} style={{ background: i % 2 === 0 ? '#080d1a' : '#0a0f1e', borderBottom: '1px solid #1a2238' }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag_emoji}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{country.name}</p>
                        <p className="text-xs text-slate-500">{country.iso2} · {country.currency_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{
                      background: country.hrlake_coverage_level === 'full' ? 'rgba(16,185,129,0.15)' : country.hrlake_coverage_level === 'partial' ? 'rgba(245,158,11,0.15)' : 'rgba(100,116,139,0.15)',
                      color: country.hrlake_coverage_level === 'full' ? '#10b981' : country.hrlake_coverage_level === 'partial' ? '#f59e0b' : '#64748b',
                    }}>
                      {country.hrlake_coverage_level ?? 'none'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm" style={{ color: '#94a3b8' }}>{formatDate(country.last_data_update)}</p>
                  </td>
                  <td className="px-5 py-3">
                    {cs?.status === 'running' && <span className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold"><Loader2 size={12} className="animate-spin" /> Updating...</span>}
                    {cs?.status === 'done' && <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold"><CheckCircle size={12} /> Updated</span>}
                    {cs?.status === 'error' && <span className="flex items-center gap-1.5 text-xs text-red-400 font-semibold"><XCircle size={12} /> Error</span>}
                    {!cs && due && <span className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold"><AlertTriangle size={12} /> Overdue</span>}
                    {!cs && !due && <span className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold"><CheckCircle size={12} /> Current</span>}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {cs?.status !== 'done' && (
                      <button
                        onClick={() => verifyCountry(country.iso2)}
                        disabled={cs?.status === 'running' || bulkRunning}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
                        style={{ background: due ? 'rgba(239,68,68,0.15)' : 'rgba(37,99,235,0.15)', color: due ? '#ef4444' : '#2563eb', border: `1px solid ${due ? 'rgba(239,68,68,0.3)' : 'rgba(37,99,235,0.3)'}` }}
                      >
                        {cs?.status === 'running' ? 'Updating...' : 'Mark Verified'}
                      </button>
                    )}
                    {cs?.status === 'done' && (
                      <span className="text-xs font-bold text-emerald-400 px-3 py-1.5">✓ Done</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div className="px-5 py-12 text-center">
            <Globe size={24} style={{ color: '#1e293b' }} className="mx-auto mb-3" />
            <p className="text-sm" style={{ color: '#64748b' }}>No countries in this filter.</p>
          </div>
        )}
      </div>

      <p className="text-xs mt-4" style={{ color: '#1e293b' }}>Marking a country as verified sets last_data_update to today and hrlake_coverage_level to full. Run AI Verification on individual countries in Data Quality for deeper checks.</p>
    </div>
  )
}
