'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, Download, Search } from 'lucide-react'

export interface ComplianceRow {
  country_code: string
  country_name: string
  flag_emoji: string
  value_display: string
  value_numeric: number | null
  value_unit: string | null
  applies_to: string | null
  notes: string | null
}

interface Props {
  rows: ComplianceRow[]
  valueLabel: string
}

type SortDir = 'asc' | 'desc' | null
type SortCol = 'country' | 'value'

export default function ComplianceComparisonTable({ rows, valueLabel }: Props) {
  const [search, setSearch] = useState('')
  const [sortCol, setSortCol] = useState<SortCol>('country')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function handleSort(col: SortCol) {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc')
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    let result = rows.filter(r =>
      r.country_name.toLowerCase().includes(search.toLowerCase()) ||
      r.country_code.toLowerCase().includes(search.toLowerCase())
    )
    if (sortDir === null) return result
    return result.sort((a, b) => {
      if (sortCol === 'country') {
        return sortDir === 'asc'
          ? a.country_name.localeCompare(b.country_name)
          : b.country_name.localeCompare(a.country_name)
      }
      // Sort by numeric value — push nulls to bottom
      const av = a.value_numeric ?? -Infinity
      const bv = b.value_numeric ?? -Infinity
      return sortDir === 'asc' ? av - bv : bv - av
    })
  }, [rows, search, sortCol, sortDir])

  function exportCSV() {
    const header = ['Country', 'Code', valueLabel, 'Applies To']
    const csvRows = filtered.map(r => [
      r.country_name,
      r.country_code,
      r.value_display,
      r.applies_to ?? ''
    ])
    const csv = [header, ...csvRows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${valueLabel.toLowerCase().replace(/\s+/g, '-')}-by-country.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function SortIcon({ col }: { col: SortCol }) {
    if (sortCol !== col || sortDir === null) return <ArrowUpDown size={13} className="opacity-40" />
    return sortDir === 'asc' ? <ArrowUp size={13} className="text-blue-400" /> : <ArrowDown size={13} className="text-blue-400" />
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by country..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 w-64"
          />
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-blue-300 rounded-xl text-sm font-semibold text-slate-600 hover:text-blue-600 transition-all"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Table — desktop */}
      <div className="hidden lg:block rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr] bg-slate-900 px-6 py-4">
          <button
            onClick={() => handleSort('country')}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors text-left"
          >
            Country <SortIcon col="country" />
          </button>
          <button
            onClick={() => handleSort('value')}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors text-left"
          >
            {valueLabel} <SortIcon col="value" />
          </button>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Applies To</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400 text-sm">No countries match your filter.</div>
        ) : (
          filtered.map((row, i) => (
            <div
              key={row.country_code}
              className={`grid grid-cols-[2.5fr_1.5fr_1.5fr] px-6 py-4 items-center ${i > 0 ? 'border-t border-slate-100' : ''} hover:bg-blue-50 transition-colors group`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={`https://flagcdn.com/28x21/${row.country_code.toLowerCase()}.png`}
                  alt={row.country_name}
                  width={28} height={21}
                  className="rounded-sm shadow-sm shrink-0"
                />
                <div>
                  <div className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{row.country_name}</div>
                  <div className="text-xs text-slate-400">{row.country_code}</div>
                </div>
              </div>
              <div className="font-mono font-semibold text-slate-800">{row.value_display}</div>
              <div className="text-sm text-slate-500 capitalize">{row.applies_to?.replace(/_/g, ' ') ?? '—'}</div>
            </div>
          ))
        )}
      </div>

      {/* Cards — mobile */}
      <div className="lg:hidden grid sm:grid-cols-2 gap-4">
        {filtered.map(row => (
          <div key={row.country_code} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={`https://flagcdn.com/28x21/${row.country_code.toLowerCase()}.png`}
                alt={row.country_name}
                width={28} height={21}
                className="rounded-sm shadow-sm"
              />
              <span className="font-bold text-slate-800">{row.country_name}</span>
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{valueLabel}</div>
            <div className="font-mono font-semibold text-slate-800 text-lg">{row.value_display}</div>
            {row.applies_to && (
              <div className="text-xs text-slate-500 mt-2 capitalize">{row.applies_to.replace(/_/g, ' ')}</div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 text-right">{filtered.length} of {rows.length} countries shown</p>
    </div>
  )
}
