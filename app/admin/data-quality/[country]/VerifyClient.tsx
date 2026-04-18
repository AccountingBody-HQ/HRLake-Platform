'use client'

import { useState } from 'react'
import {
  Sparkles, CheckCircle, XCircle, AlertCircle, Loader2,
  ThumbsUp, ThumbsDown, Check, RefreshCw,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  countryCode: string
  countryName: string
  brackets: any[]; ss: any[]; rules: any[]; leave: any[]
  holidays: any[]; filing: any[]; compliance: any[]; hours: any[]
  termination: any[]; pension: any[]
  mandatoryBenefits: any[]; healthInsurance: any[]; payslipRequirements: any[]
  recordRetention: any[]; remoteWorkRules: any[]; expenseRules: any[]
  contractorRules: any[]; workPermits: any[]; entitySetup: any[]
  taxCredits: any[]; regionalTaxRates: any[]; salaryBenchmarks: any[]
  govBenefits: any[]
  sourceMap: Record<string, any>
  currencyCode: string | null
}

interface Finding {
  table: string; record_id: string; field: string
  current_value: string; found_value: string
  raw_value: Record<string, unknown>
  status: 'match' | 'mismatch' | 'unverified'
  source: string; note: string
}

type TableStatus = 'idle' | 'running' | 'done' | 'error'
interface TableResult { status: TableStatus; findings: Finding[]; error?: string }

// ─── Tables ───────────────────────────────────────────────────────────────────

const ALL_VERIFY_TABLES = [
  { key: 'tax_brackets',                label: 'Tax Brackets',           color: '#3b82f6', bg: 'rgba(59,130,246,0.08)'   },
  { key: 'social_security',             label: 'Social Security',         color: '#3b82f6', bg: 'rgba(59,130,246,0.08)'   },
  { key: 'tax_credits',                 label: 'Tax Credits',             color: '#3b82f6', bg: 'rgba(59,130,246,0.08)'   },
  { key: 'regional_tax_rates',          label: 'Regional Tax Rates',      color: '#3b82f6', bg: 'rgba(59,130,246,0.08)'   },
  { key: 'employment_rules',            label: 'Employment Rules',        color: '#10b981', bg: 'rgba(16,185,129,0.08)'   },
  { key: 'statutory_leave',             label: 'Statutory Leave',         color: '#10b981', bg: 'rgba(16,185,129,0.08)'   },
  { key: 'public_holidays',             label: 'Public Holidays',         color: '#10b981', bg: 'rgba(16,185,129,0.08)'   },
  { key: 'working_hours',               label: 'Working Hours',           color: '#10b981', bg: 'rgba(16,185,129,0.08)'   },
  { key: 'termination_rules',           label: 'Termination Rules',       color: '#10b981', bg: 'rgba(16,185,129,0.08)'   },
  { key: 'payroll_compliance',          label: 'Payroll Compliance',      color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'   },
  { key: 'filing_calendar',             label: 'Filing Calendar',         color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'   },
  { key: 'payslip_requirements',        label: 'Payslip Requirements',    color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'   },
  { key: 'mandatory_benefits',          label: 'Mandatory Benefits',      color: '#ec4899', bg: 'rgba(236,72,153,0.08)'   },
  { key: 'health_insurance',            label: 'Health Insurance',        color: '#ec4899', bg: 'rgba(236,72,153,0.08)'   },
  { key: 'government_benefit_payments', label: 'Gov. Benefit Payments',   color: '#ec4899', bg: 'rgba(236,72,153,0.08)'   },
  { key: 'remote_work_rules',           label: 'Remote Work Rules',       color: '#a78bfa', bg: 'rgba(167,139,250,0.08)'  },
  { key: 'expense_rules',               label: 'Expense Rules',           color: '#a78bfa', bg: 'rgba(167,139,250,0.08)'  },
  { key: 'contractor_rules',            label: 'Contractor Rules',        color: '#a78bfa', bg: 'rgba(167,139,250,0.08)'  },
  { key: 'work_permits',                label: 'Work Permits',            color: '#a78bfa', bg: 'rgba(167,139,250,0.08)'  },
  { key: 'entity_setup',                label: 'Entity Setup',            color: '#06b6d4', bg: 'rgba(6,182,212,0.08)'    },
  { key: 'pension_schemes',             label: 'Pension Schemes',         color: '#06b6d4', bg: 'rgba(6,182,212,0.08)'    },
  { key: 'salary_benchmarks',           label: 'Salary Benchmarks',       color: '#f97316', bg: 'rgba(249,115,22,0.08)'   },
  { key: 'record_retention',            label: 'Record Retention',        color: '#f97316', bg: 'rgba(249,115,22,0.08)'   },
]

// ─── Helper ───────────────────────────────────────────────────────────────────

function getTableData(tableKey: string, p: Props): any[] {
  const map: Record<string, any[]> = {
    tax_brackets: p.brackets, social_security: p.ss,
    employment_rules: p.rules, statutory_leave: p.leave,
    public_holidays: p.holidays, filing_calendar: p.filing,
    payroll_compliance: p.compliance, working_hours: p.hours,
    termination_rules: p.termination, pension_schemes: p.pension,
    mandatory_benefits: p.mandatoryBenefits, health_insurance: p.healthInsurance,
    payslip_requirements: p.payslipRequirements, record_retention: p.recordRetention,
    remote_work_rules: p.remoteWorkRules, expense_rules: p.expenseRules,
    contractor_rules: p.contractorRules, work_permits: p.workPermits,
    entity_setup: p.entitySetup, tax_credits: p.taxCredits,
    regional_tax_rates: p.regionalTaxRates, salary_benchmarks: p.salaryBenchmarks,
    government_benefit_payments: p.govBenefits,
  }
  return map[tableKey] ?? []
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VerifyClient(props: Props) {
  const { countryCode, countryName } = props

  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set(ALL_VERIFY_TABLES.map(t => t.key)))
  const [isRunning,       setIsRunning]      = useState(false)
  const [currentTable,    setCurrentTable]   = useState<string | null>(null)
  const [tableResults,    setTableResults]   = useState<Record<string, TableResult>>({})
  const [decisions,       setDecisions]      = useState<Record<string, 'approved'|'rejected'|'saving'|'saved'>>({})
  const [allSaved,        setAllSaved]       = useState(false)
  const [saving,          setSaving]         = useState(false)
  const [statusFilter,    setStatusFilter]   = useState<string>('all')
  const [tableFilter,     setTableFilter]    = useState<string>('all')
  const [globalError,     setGlobalError]    = useState('')
  const [countdown,       setCountdown]      = useState<number | null>(null)

  // ── Derived ───────────────────────────────────────────────────────────────────
  const tablesToRun   = ALL_VERIFY_TABLES.filter(t => selectedTables.has(t.key))
  const allFindings   = ALL_VERIFY_TABLES.flatMap(t => tableResults[t.key]?.findings ?? [])
  const hasResults    = allFindings.length > 0
  const matches       = allFindings.filter(f => f.status === 'match').length
  const mismatches    = allFindings.filter(f => f.status === 'mismatch').length
  const unverified    = allFindings.filter(f => f.status === 'unverified').length
  const doneCount     = ALL_VERIFY_TABLES.filter(t => tableResults[t.key]?.status === 'done').length
  const errorCount    = ALL_VERIFY_TABLES.filter(t => tableResults[t.key]?.status === 'error').length
  const allTablesDone = tablesToRun.length > 0 && tablesToRun.every(t =>
    tableResults[t.key]?.status === 'done' || tableResults[t.key]?.status === 'error'
  )
  const pendingMatches    = allFindings.filter((f, i) => f.status === 'match'      && !decisions[`${i}`]).length
  const pendingUnverified = allFindings.filter((f, i) => f.status === 'unverified' && !decisions[`${i}`]).length
  const sourcesWithUrls   = Object.keys(props.sourceMap).length
  const pct               = tablesToRun.length > 0 ? Math.round((doneCount / tablesToRun.length) * 100) : 0

  const statusFiltered  = statusFilter === 'all' ? allFindings : allFindings.filter(f => f.status === statusFilter)
  const visibleFindings = tableFilter  === 'all' ? statusFiltered : statusFiltered.filter(f => f.table === tableFilter)

  // ── Countdown ─────────────────────────────────────────────────────────────────
  async function waitWithCountdown(ms: number) {
    const steps = Math.ceil(ms / 1000)
    for (let i = steps; i > 0; i--) {
      setCountdown(i)
      await new Promise(r => setTimeout(r, 1000))
    }
    setCountdown(null)
  }

  // ── Toggle table selection ────────────────────────────────────────────────────
  function toggleTable(key: string) {
    if (isRunning) return
    setSelectedTables(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  // ── Verify single table ───────────────────────────────────────────────────────
  async function verifyTable(tableKey: string): Promise<boolean> {
    const MAX_ATTEMPTS = 3
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      setCurrentTable(tableKey)
      setTableResults(p => ({
        ...p,
        [tableKey]: {
          status: 'running',
          findings: [],
          error: attempt > 1 ? `Attempt ${attempt - 1} failed — retrying…` : undefined,
        },
      }))
      try {
        const tableData = getTableData(tableKey, props)
        const source    = props.sourceMap[tableKey]
        const controller = new AbortController()
        const tid = setTimeout(() => controller.abort(), 58000)
        const res = await fetch('/api/verify-table', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tableKey,
            tableData,
            sourceUrl:     source?.source_url     ?? null,
            authorityName: source?.authority_name ?? null,
            countryCode,
            countryName,
          }),
          signal: controller.signal,
        })
        clearTimeout(tid)
        const data = await res.json()
        if (!res.ok || !data.success) throw new Error(data.error ?? 'Verification failed')
        setTableResults(p => ({ ...p, [tableKey]: { status: 'done', findings: data.findings } }))
        return true
      } catch (e: any) {
        if (attempt === MAX_ATTEMPTS) {
          setTableResults(p => ({ ...p, [tableKey]: { status: 'error', findings: [], error: e.message } }))
          return false
        }
        setTableResults(p => ({ ...p, [tableKey]: { status: 'running', findings: [], error: `Attempt ${attempt} failed — waiting before retry…` } }))
        await waitWithCountdown(90000)
      }
    }
    return false
  }

  // ── Run all selected tables ───────────────────────────────────────────────────
  async function runVerification() {
    if (selectedTables.size === 0) return
    setIsRunning(true); setDecisions({})
    setAllSaved(false); setGlobalError('')
    setStatusFilter('all'); setTableFilter('all')
    setCountdown(null)
    setTableResults(prev => {
      const next = { ...prev }
      tablesToRun.forEach(t => { delete next[t.key] })
      return next
    })
    for (let i = 0; i < tablesToRun.length; i++) {
      await verifyTable(tablesToRun[i].key)
      const isLast = i === tablesToRun.length - 1
      if (!isLast) await waitWithCountdown(30000)
    }
    setCurrentTable(null); setIsRunning(false)
  }

  // ── Retry single table ────────────────────────────────────────────────────────
  async function retryTable(tableKey: string) {
    if (isRunning) return
    setIsRunning(true)
    await verifyTable(tableKey)
    setCurrentTable(null); setIsRunning(false)
  }

  // ── Batch approve ─────────────────────────────────────────────────────────────
  function approveAllMatches() {
    const u: Record<string,'approved'> = {}
    allFindings.forEach((f, i) => { if (f.status === 'match' && !decisions[`${i}`]) u[`${i}`] = 'approved' })
    setDecisions(p => ({ ...p, ...u }))
  }
  function approveAllUnverified() {
    const u: Record<string,'approved'> = {}
    allFindings.forEach((f, i) => { if (f.status === 'unverified' && !decisions[`${i}`]) u[`${i}`] = 'approved' })
    setDecisions(p => ({ ...p, ...u }))
  }

  // ── Approve / reject individual finding ───────────────────────────────────────
  async function approve(index: number, finding: Finding) {
    if (finding.status !== 'mismatch' || !finding.raw_value || typeof finding.raw_value !== 'object' || Array.isArray(finding.raw_value)) {
      setDecisions(p => ({ ...p, [`${index}`]: 'approved' })); return
    }
    setDecisions(p => ({ ...p, [`${index}`]: 'saving' }))
    try {
      const res = await fetch('/api/admin-update-country', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode, action: 'update_value',
          finding: { table: finding.table, field: finding.field, raw_value: finding.raw_value, record_id: finding.record_id } }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setDecisions(p => ({ ...p, [`${index}`]: 'saved' }))
    } catch (e: any) {
      setGlobalError('Update failed: ' + e.message)
      setDecisions(p => { const n = { ...p }; delete n[`${index}`]; return n })
    }
  }

  function reject(index: number) { setDecisions(p => ({ ...p, [`${index}`]: 'rejected' })) }

  // ── Mark verified ─────────────────────────────────────────────────────────────
  async function markVerified() {
    const unreviewedMismatches = allFindings.filter((f, i) => f.status === 'mismatch' && !decisions[`${i}`]).length
    if (unreviewedMismatches > 0) {
      setGlobalError(`Cannot mark verified — ${unreviewedMismatches} mismatch${unreviewedMismatches > 1 ? 'es' : ''} still need a decision.`)
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin-update-country', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode, action: 'approve_all' }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? 'Failed to mark verified')
      setAllSaved(true)
    } catch (e: any) { setGlobalError('Save failed: ' + e.message) }
    finally { setSaving(false) }
  }

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1424', border: '1px solid #1a2238' }}>

      {/* Header */}
      <div className="px-6 py-5 border-b" style={{ borderColor: '#1a2238' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-white font-bold">AI Verification — 23 Individual Tables</h2>
            <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
              {sourcesWithUrls} official source URLs loaded · Each table runs a separate focused AI call with web search
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {!allSaved && hasResults && allTablesDone && (
              <button onClick={markVerified} disabled={saving}
                className="flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl text-sm disabled:opacity-60"
                style={{ background: '#10b981' }}>
                {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Check size={15} /> Mark {countryName} Verified</>}
              </button>
            )}
            {allSaved && (
              <span className="text-xs font-bold px-4 py-2.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                ✓ Verified & Saved
              </span>
            )}
            <button onClick={runVerification} disabled={isRunning || selectedTables.size === 0}
              className="flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl text-sm disabled:opacity-50"
              style={{ background: '#2563eb' }}>
              {isRunning ? <><Loader2 size={15} className="animate-spin" /> Verifying…</> : <><Sparkles size={15} /> Run Verification</>}
            </button>
          </div>
        </div>
      </div>

      {/* Table selector */}
      <div className="px-6 py-4 border-b" style={{ borderColor: '#1a2238' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#334155' }}>
            Select tables to verify ({selectedTables.size} of {ALL_VERIFY_TABLES.length} selected)
          </p>
          <div className="flex gap-2">
            <button onClick={() => !isRunning && setSelectedTables(new Set(ALL_VERIFY_TABLES.map(t => t.key)))} disabled={isRunning}
              className="text-xs px-2.5 py-1 rounded-lg border disabled:opacity-40"
              style={{ borderColor: '#1a2238', color: '#475569' }}>All</button>
            <button onClick={() => !isRunning && setSelectedTables(new Set())} disabled={isRunning}
              className="text-xs px-2.5 py-1 rounded-lg border disabled:opacity-40"
              style={{ borderColor: '#1a2238', color: '#475569' }}>None</button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {ALL_VERIFY_TABLES.map(t => {
            const selected = selectedTables.has(t.key)
            const result   = tableResults[t.key]
            const isActive = currentTable === t.key
            return (
              <button key={t.key} onClick={() => toggleTable(t.key)} disabled={isRunning}
                className="text-left px-3 py-2 rounded-xl border transition-all disabled:cursor-default"
                style={{
                  background: selected ? t.bg : 'rgba(255,255,255,0.02)',
                  borderColor: selected ? t.color + '40' : '#1a2238',
                }}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold truncate" style={{ color: selected ? t.color : '#334155' }}>{t.label}</span>
                  {isActive                       && <Loader2 size={10} className="animate-spin shrink-0" style={{ color: t.color }} />}
                  {!isActive && result?.status === 'done'  && <CheckCircle size={10} className="shrink-0" style={{ color: '#10b981' }} />}
                  {!isActive && result?.status === 'error' && <XCircle size={10} className="shrink-0" style={{ color: '#ef4444' }} />}
                  {!isActive && !result && selected && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: t.color }} />}
                </div>
                <p className="text-xs truncate" style={{ color: '#334155' }}>
                  {result?.status === 'done'    ? `${result.findings.length} findings`
                  : result?.status === 'error'  ? 'Error — retry'
                  : isActive                    ? 'Verifying…'
                  : `${getTableData(t.key, props).length} records`}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Progress bar — shown once running starts */}
      {Object.keys(tableResults).length > 0 && (
        <div className="px-6 py-3 border-b" style={{ borderColor: '#1a2238' }}>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-bold" style={{ color: '#475569' }}>
              {doneCount}/{tablesToRun.length} tables verified
              {errorCount > 0 && <span className="ml-2" style={{ color: '#ef4444' }}>{errorCount} failed</span>}
            </p>
            <p className="text-xs font-bold tabular-nums" style={{ color: pct === 100 ? '#10b981' : '#f59e0b' }}>{pct}%</p>
          </div>
          <div className="w-full h-1.5 rounded-full" style={{ background: '#1a2238' }}>
            <div className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: errorCount > 0 ? '#f59e0b' : '#10b981' }} />
          </div>
        </div>
      )}

      {/* Countdown banner */}
      {isRunning && countdown !== null && (
        <div className="px-6 py-3 border-b flex items-center gap-3"
          style={{ background: 'rgba(245,158,11,0.08)', borderColor: '#1a2238' }}>
          <Loader2 size={13} className="animate-spin" style={{ color: '#f59e0b' }} />
          <p className="text-sm" style={{ color: '#f59e0b' }}>
            Waiting <span className="font-black tabular-nums">{countdown}s</span>
            <span className="ml-2 text-xs" style={{ color: '#64748b' }}>— rate limit pause before next table</span>
          </p>
        </div>
      )}

      {/* Global error */}
      {globalError && (
        <div className="px-6 py-3 border-b" style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' }}>
          <p className="text-sm" style={{ color: '#ef4444' }}>{globalError}</p>
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <div className="p-6">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Total Checked', value: allFindings.length, color: '#ffffff', bg: '#111827',               border: '#1a2238',               filter: 'all'        },
              { label: 'Confirmed ✓',   value: matches,            color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', filter: 'match'      },
              { label: 'Issues Found',  value: mismatches,         color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',  filter: 'mismatch'   },
              { label: 'Unverified',    value: unverified,         color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', filter: 'unverified' },
            ].map(s => (
              <button key={s.label} onClick={() => setStatusFilter(s.filter)}
                className="rounded-xl p-3 text-center border transition-all hover:opacity-90"
                style={{ background: s.bg, borderColor: statusFilter === s.filter ? s.color : s.border,
                  outline: statusFilter === s.filter ? `2px solid ${s.color}` : 'none', outlineOffset: '2px' }}>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs font-bold mt-1" style={{ color: s.color === '#ffffff' ? '#475569' : s.color }}>{s.label}</p>
              </button>
            ))}
          </div>

          {/* Failed tables retry list */}
          {errorCount > 0 && !isRunning && (
            <div className="rounded-xl p-4 mb-4 border" style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#ef4444' }}>Failed — retry individually</p>
              <div className="flex flex-wrap gap-2">
                {ALL_VERIFY_TABLES.filter(t => tableResults[t.key]?.status === 'error').map(t => (
                  <button key={t.key} onClick={() => retryTable(t.key)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all"
                    style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                    <RefreshCw size={10} /> Retry {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Batch actions */}
          {(pendingMatches > 0 || pendingUnverified > 0) && (
            <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-xl border"
              style={{ background: '#111827', borderColor: '#1a2238' }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#334155' }}>Bulk</p>
              {pendingMatches > 0 && (
                <button onClick={approveAllMatches}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', borderColor: 'rgba(16,185,129,0.25)' }}>
                  <CheckCircle size={11} /> Approve all matches ({pendingMatches})
                </button>
              )}
              {pendingUnverified > 0 && (
                <button onClick={approveAllUnverified}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border"
                  style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.25)' }}>
                  <AlertCircle size={11} /> Acknowledge unverified ({pendingUnverified})
                </button>
              )}
              <p className="ml-auto text-xs" style={{ color: '#334155' }}>
                {allFindings.length - Object.keys(decisions).length} decisions remaining
              </p>
            </div>
          )}

          {/* Table filter pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => setTableFilter('all')}
              className="text-xs font-bold px-3 py-1.5 rounded-full border transition-all"
              style={{ background: tableFilter === 'all' ? '#2563eb' : 'transparent', borderColor: tableFilter === 'all' ? '#2563eb' : '#1a2238', color: tableFilter === 'all' ? '#ffffff' : '#475569' }}>
              All ({allFindings.length})
            </button>
            {ALL_VERIFY_TABLES.filter(t => tableResults[t.key]?.findings?.length).map(t => (
              <button key={t.key} onClick={() => setTableFilter(t.key)}
                className="text-xs font-bold px-3 py-1.5 rounded-full border transition-all"
                style={{ background: tableFilter === t.key ? '#2563eb' : 'transparent', borderColor: tableFilter === t.key ? '#2563eb' : '#1a2238', color: tableFilter === t.key ? '#ffffff' : '#475569' }}>
                {t.label} ({tableResults[t.key]?.findings?.length})
              </button>
            ))}
          </div>

          {/* Findings list */}
          <div className="space-y-2 mb-6">
            {visibleFindings.map((f, vi) => {
              const idx = allFindings.indexOf(f)
              const dec = decisions[`${idx}`]
              const statusColor = f.status === 'match' ? '#10b981' : f.status === 'mismatch' ? '#ef4444' : '#f59e0b'
              return (
                <div key={`${f.table}-${f.record_id}-${f.field}-${vi}`} className="border rounded-xl p-4 transition-all"
                  style={{
                    background: dec === 'saved' || dec === 'approved' ? 'rgba(16,185,129,0.04)' : dec === 'rejected' ? 'rgba(255,255,255,0.01)' : f.status === 'match' ? 'rgba(16,185,129,0.04)' : f.status === 'mismatch' ? 'rgba(239,68,68,0.04)' : 'rgba(245,158,11,0.04)',
                    borderColor: dec === 'saved' || dec === 'approved' ? 'rgba(16,185,129,0.3)' : dec === 'rejected' ? '#1f2937' : f.status === 'match' ? 'rgba(16,185,129,0.2)' : f.status === 'mismatch' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                    opacity: dec === 'rejected' ? 0.35 : 1,
                  }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {dec === 'saved' || dec === 'approved' ? <Check size={15} style={{ color: '#10b981' }} className="shrink-0 mt-0.5" />
                        : dec === 'rejected' ? <XCircle size={15} style={{ color: '#475569' }} className="shrink-0 mt-0.5" />
                        : dec === 'saving'   ? <Loader2 size={15} style={{ color: '#3b82f6' }} className="shrink-0 mt-0.5 animate-spin" />
                        : f.status === 'match'     ? <CheckCircle size={15} style={{ color: '#10b981' }} className="shrink-0 mt-0.5" />
                        : f.status === 'mismatch'  ? <XCircle size={15} style={{ color: '#ef4444' }} className="shrink-0 mt-0.5" />
                        : <AlertCircle size={15} style={{ color: '#f59e0b' }} className="shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: '#111827', color: '#475569' }}>
                            {ALL_VERIFY_TABLES.find(t => t.key === f.table)?.label ?? f.table}
                          </span>
                          <span className="text-white font-semibold text-sm">{f.field}</span>
                          {f.status === 'mismatch' && !dec && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                              style={{ background: 'rgba(37,99,235,0.12)', color: '#3b82f6', border: '1px solid rgba(37,99,235,0.3)' }}>
                              Approve = update DB
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-2">
                          <div>
                            <p className="text-xs mb-0.5" style={{ color: '#334155' }}>Current in DB</p>
                            <p className="text-sm font-mono" style={{ color: '#64748b' }}>{f.current_value}</p>
                          </div>
                          <div>
                            <p className="text-xs mb-0.5" style={{ color: '#334155' }}>AI Found</p>
                            <p className="text-sm font-mono font-bold" style={{ color: dec === 'saved' || dec === 'approved' ? '#10b981' : statusColor }}>
                              {f.found_value}
                            </p>
                          </div>
                        </div>
                        {f.note && <p className="text-xs mb-1" style={{ color: '#475569' }}>{f.note}</p>}
                        {f.source && (
                          <a href={f.source} target="_blank" rel="noopener noreferrer"
                            className="text-xs hover:underline truncate max-w-md inline-block" style={{ color: '#2563eb' }}>
                            {f.source}
                          </a>
                        )}
                        {dec === 'saved' && <p className="text-xs font-bold mt-1" style={{ color: '#10b981' }}>✓ Database updated</p>}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {!dec && (
                        <div className="flex gap-2">
                          <button onClick={() => approve(idx, f)}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border"
                            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', borderColor: 'rgba(16,185,129,0.25)' }}>
                            <ThumbsUp size={11} /> Approve
                          </button>
                          <button onClick={() => reject(idx)}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border"
                            style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                            <ThumbsDown size={11} /> Reject
                          </button>
                        </div>
                      )}
                      {dec === 'saving' && <span className="text-xs font-bold px-3 py-1.5" style={{ color: '#3b82f6' }}>Updating…</span>}
                      {(dec === 'saved' || dec === 'approved') && (
                        <span className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>✓ Approved</span>
                      )}
                      {dec === 'rejected' && (
                        <span className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', color: '#475569' }}>✗ Rejected</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasResults && !isRunning && (
        <div className="px-6 py-12 text-center">
          <Sparkles size={32} className="mx-auto mb-3" style={{ color: '#1e293b' }} />
          <p className="text-sm mb-1" style={{ color: '#475569' }}>Select tables above and click Run Verification</p>
          <p className="text-xs" style={{ color: '#334155' }}>
            Each table runs a separate focused AI call with web search — maximum accuracy per table
          </p>
          {sourcesWithUrls > 0 && (
            <p className="text-xs mt-2" style={{ color: '#1e293b' }}>{sourcesWithUrls} official source URLs pre-loaded</p>
          )}
        </div>
      )}

    </div>
  )
}
