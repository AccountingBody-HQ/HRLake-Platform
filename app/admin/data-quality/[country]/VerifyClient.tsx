'use client'

import { useState } from 'react'
import {
  Sparkles, CheckCircle, XCircle, AlertCircle, Loader2,
  ThumbsUp, ThumbsDown, Check,
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

type GroupStatus = 'idle' | 'running' | 'done' | 'error'
interface GroupResult { status: GroupStatus; findings: Finding[]; error?: string }

// ─── Groups ───────────────────────────────────────────────────────────────────

const GROUPS = [
  { key: 'tax',        label: 'Tax & Social Security', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',   border: 'rgba(59,130,246,0.25)',  tables: ['tax_brackets','social_security','tax_credits','regional_tax_rates'] },
  { key: 'employment', label: 'Employment & Leave',     color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)',  tables: ['employment_rules','statutory_leave','public_holidays','working_hours','termination_rules'] },
  { key: 'payroll',    label: 'Payroll & Filing',       color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  tables: ['payroll_compliance','filing_calendar','payslip_requirements'] },
  { key: 'benefits',   label: 'Benefits & Insurance',   color: '#ec4899', bg: 'rgba(236,72,153,0.1)',  border: 'rgba(236,72,153,0.25)',  tables: ['mandatory_benefits','health_insurance','government_benefit_payments'] },
  { key: 'remote',     label: 'Remote & Contractors',   color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)', tables: ['remote_work_rules','expense_rules','contractor_rules','work_permits'] },
  { key: 'entity',     label: 'Entity & Pension',       color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.25)',   tables: ['entity_setup','pension_schemes'] },
  { key: 'salary',     label: 'Salary & Records',       color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.25)',  tables: ['salary_benchmarks','record_retention'] },
]

const TABLE_LABELS: Record<string, string> = {
  tax_brackets:'Tax Brackets', social_security:'Social Security',
  employment_rules:'Employment Rules', statutory_leave:'Statutory Leave',
  public_holidays:'Public Holidays', filing_calendar:'Filing Calendar',
  payroll_compliance:'Payroll Compliance', working_hours:'Working Hours',
  termination_rules:'Termination Rules', pension_schemes:'Pension Schemes',
  mandatory_benefits:'Mandatory Benefits', health_insurance:'Health Insurance',
  payslip_requirements:'Payslip Requirements', record_retention:'Record Retention',
  remote_work_rules:'Remote Work Rules', expense_rules:'Expense Rules',
  contractor_rules:'Contractor Rules', work_permits:'Work Permits',
  entity_setup:'Entity Setup', tax_credits:'Tax Credits',
  regional_tax_rates:'Regional Tax Rates', salary_benchmarks:'Salary Benchmarks',
  government_benefit_payments:'Gov. Benefit Payments',
}

const TABLE_FIELDS: Record<string, string[]> = {
  tax_brackets:                ['bracket_name','lower_limit','upper_limit','rate'],
  social_security:             ['contribution_type','employer_rate','employee_rate','applies_above','applies_below'],
  employment_rules:            ['rule_type','value_text','value_numeric','value_unit'],
  statutory_leave:             ['leave_type','minimum_days','maximum_days','is_paid','payment_rate'],
  public_holidays:             ['holiday_name','holiday_date','is_mandatory'],
  filing_calendar:             ['filing_type','frequency','due_day','due_month'],
  payroll_compliance:          ['description','frequency','deadline_description'],
  working_hours:               ['standard_hours_per_week','maximum_hours_per_week','overtime_rate_multiplier'],
  termination_rules:           ['notice_period_min_days','severance_mandatory','probation_period_max_months'],
  pension_schemes:             ['scheme_name','employer_rate','employee_rate','is_mandatory'],
  mandatory_benefits:          ['benefit_name','benefit_type','employer_cost_percentage','frequency'],
  health_insurance:            ['scheme_name','scheme_type','employer_rate_percentage','is_mandatory'],
  payslip_requirements:        ['format_requirements','delivery_deadline_days','retention_period_years'],
  record_retention:            ['record_type','retention_years','retention_basis'],
  remote_work_rules:           ['pe_risk_threshold_days','tax_liability_threshold_days','digital_nomad_visa_available'],
  expense_rules:               ['expense_type','tax_treatment','exempt_amount','mileage_rate_per_km'],
  contractor_rules:            ['classification_test','misclassification_penalty'],
  work_permits:                ['permit_type','processing_days_min','processing_days_max','validity_months'],
  entity_setup:                ['entity_type','corporate_tax_rate','withholding_tax_rate','vat_rate'],
  tax_credits:                 ['credit_name','credit_type','amount','rate_percentage'],
  regional_tax_rates:          ['region_name','tax_type','rate','applies_above'],
  salary_benchmarks:           ['job_family','job_level','percentile_50','currency_code'],
  government_benefit_payments: ['benefit_type','paid_by','government_rate_percentage','maximum_duration_weeks'],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function fmtRows(rows: any[], fields: string[]): string {
  if (rows.length === 0) return '  (no records — skip this table)'
  return rows.map(r =>
    `  - id:${r.id} | ${fields.map(f => `${f}=${JSON.stringify(r[f] ?? null)}`).join(', ')}`
  ).join('\n')
}

function buildGroupPrompt(
  group: typeof GROUPS[0],
  countryName: string,
  countryCode: string,
  p: Props,
): string {
  const src = (cat: string) => {
    const s = p.sourceMap[cat]
    return s ? `OFFICIAL SOURCE: ${s.source_url} (${s.authority_name})` : 'Search official government website'
  }
  const sections = group.tables.map(t =>
    `=== ${(TABLE_LABELS[t] ?? t).toUpperCase()} ===\n${src(t)}\n${fmtRows(getTableData(t, p), TABLE_FIELDS[t] ?? [])}`
  ).join('\n\n')
  const tableEnum = group.tables.join('|')
  return `You are a payroll data verification expert. Verify the following ${group.label} data for ${countryName} (${countryCode}) for tax year 2025.

INSTRUCTIONS:
1. Search EACH official source URL provided — minimum 1 search per section.
2. Verify EVERY SINGLE RECORD listed. Do not skip any record.
3. Return ONE JSON object with a "findings" array. No markdown, no code blocks.
4. Every record_id listed MUST appear in findings.
5. raw_value = exact numeric or string value only. No % or units.

${sections}

Respond ONLY with raw JSON:
{
  "summary": "What you searched and verified",
  "findings": [
    {
      "table": "${tableEnum}",
      "record_id": "exact id from above",
      "field": "exact_column_name",
      "current_value": "current readable value",
      "found_value": "value from official source",
      "raw_value": {"field": value},
      "status": "match|mismatch|unverified",
      "source": "official URL",
      "note": "brief explanation"
    }
  ]
}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VerifyClient(props: Props) {
  const { countryCode, countryName } = props

  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set(GROUPS.map(g => g.key)))
  const [isRunning,       setIsRunning]      = useState(false)
  const [currentGroupKey, setCurrentGroupKey]= useState<string | null>(null)
  const [groupResults,    setGroupResults]   = useState<Record<string, GroupResult>>({})
  const [decisions,       setDecisions]      = useState<Record<number, 'approved'|'rejected'|'saving'|'saved'>>({})
  const [allSaved,        setAllSaved]       = useState(false)
  const [saving,          setSaving]         = useState(false)
  const [activeFilter,    setActiveFilter]   = useState<string>('all')
  const [globalError,     setGlobalError]    = useState('')

  // ── Derived ──────────────────────────────────────────────────────────────────
  const groupsToRun    = GROUPS.filter(g => selectedGroups.has(g.key))
  const allFindings    = GROUPS.flatMap(g => groupResults[g.key]?.findings ?? [])
  const hasResults     = allFindings.length > 0
  const matches        = allFindings.filter(f => f.status === 'match').length
  const mismatches     = allFindings.filter(f => f.status === 'mismatch').length
  const unverified     = allFindings.filter(f => f.status === 'unverified').length
  const totalDecided   = Object.keys(decisions).length
  const allDecided     = hasResults && totalDecided === allFindings.length
  const pendingMatches    = allFindings.filter((f, i) => f.status === 'match'      && !decisions[i]).length
  const pendingUnverified = allFindings.filter((f, i) => f.status === 'unverified' && !decisions[i]).length
  const allGroupsDone  = groupsToRun.length > 0 && groupsToRun.every(g =>
    groupResults[g.key]?.status === 'done' || groupResults[g.key]?.status === 'error'
  )
  const sourcesWithUrls = Object.keys(props.sourceMap).length
  const countByTable    = allFindings.reduce((acc, f) => { acc[f.table] = (acc[f.table] ?? 0) + 1; return acc }, {} as Record<string,number>)
  const visibleFindings = activeFilter === 'all' ? allFindings : allFindings.filter(f => f.table === activeFilter)

  // ── Group toggle ──────────────────────────────────────────────────────────────
  function toggleGroup(key: string) {
    if (isRunning) return
    setSelectedGroups(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  // ── Batch actions ──────────────────────────────────────────────────────────────
  function approveAllMatches() {
    const u: Record<number,'approved'> = {}
    allFindings.forEach((f, i) => { if (f.status === 'match' && !decisions[i]) u[i] = 'approved' })
    setDecisions(p => ({ ...p, ...u }))
  }
  function approveAllUnverified() {
    const u: Record<number,'approved'> = {}
    allFindings.forEach((f, i) => { if (f.status === 'unverified' && !decisions[i]) u[i] = 'approved' })
    setDecisions(p => ({ ...p, ...u }))
  }

  // ── Individual approve / reject ────────────────────────────────────────────────
  async function approve(index: number, finding: Finding) {
    if (finding.status !== 'mismatch' || !finding.raw_value || typeof finding.raw_value !== 'object' || Array.isArray(finding.raw_value)) {
      setDecisions(p => ({ ...p, [index]: 'approved' })); return
    }
    setDecisions(p => ({ ...p, [index]: 'saving' }))
    try {
      const res = await fetch('/api/admin-update-country', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode, action: 'update_value',
          finding: { table: finding.table, field: finding.field, raw_value: finding.raw_value, record_id: finding.record_id } }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setDecisions(p => ({ ...p, [index]: 'saved' }))
    } catch (e: any) {
      setGlobalError('Update failed: ' + e.message)
      setDecisions(p => { const n = { ...p }; delete n[index]; return n })
    }
  }

  function reject(index: number) { setDecisions(p => ({ ...p, [index]: 'rejected' })) }

  // ── Mark verified ──────────────────────────────────────────────────────────────
  async function markVerified() {
    setSaving(true)
    try {
      await fetch('/api/admin-update-country', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode, action: 'approve_all' }),
      })
      setAllSaved(true)
    } catch (e: any) { setGlobalError('Save failed: ' + e.message) }
    finally { setSaving(false) }
  }

  // ── Run verification ───────────────────────────────────────────────────────────
  async function runVerification() {
    if (selectedGroups.size === 0) return
    setIsRunning(true); setGroupResults({}); setDecisions({})
    setAllSaved(false); setGlobalError(''); setActiveFilter('all')
    for (const group of groupsToRun) {
      setCurrentGroupKey(group.key)
      setGroupResults(p => ({ ...p, [group.key]: { status: 'running', findings: [] } }))
      try {
        const prompt = buildGroupPrompt(group, countryName, countryCode, props)
        const controller = new AbortController()
        const tid = setTimeout(() => controller.abort(), 130000)
        const response = await fetch('/api/verify-country', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }), signal: controller.signal,
        })
        clearTimeout(tid)
        const data = await response.json()
        if (data.error) throw new Error(data.error)
        const text  = data.content?.[0]?.text ?? ''
        const start = text.indexOf('{')
        const end   = text.lastIndexOf('}')
        if (start === -1 || end === -1) throw new Error('No JSON in response')
        const parsed = JSON.parse(text.slice(start, end + 1))
        if (!parsed.findings) throw new Error('Missing findings array')
        setGroupResults(p => ({ ...p, [group.key]: { status: 'done', findings: parsed.findings } }))
      } catch (e: any) {
        setGroupResults(p => ({ ...p, [group.key]: { status: 'error', findings: [], error: e.message } }))
      }
      // 65s pause between groups — Anthropic TPM rate limit window is 60s
      await new Promise(r => setTimeout(r, 65000))
    }
    setCurrentGroupKey(null); setIsRunning(false)
  }

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1424', border: '1px solid #1a2238' }}>

      {/* Header */}
      <div className="px-6 py-5 border-b" style={{ borderColor: '#1a2238' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-white font-bold">AI Verification — 7 Focused Groups</h2>
            <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
              {sourcesWithUrls} official source URLs loaded · Each group runs a separate focused AI call for complete coverage
            </p>
          </div>
          <button onClick={runVerification} disabled={isRunning || selectedGroups.size === 0}
            className="flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#2563eb' }}>
            {isRunning ? <><Loader2 size={15} className="animate-spin" /> Verifying...</> : <><Sparkles size={15} /> Run Verification</>}
          </button>
        </div>
      </div>

      {/* Group selector */}
      <div className="px-6 py-4 border-b" style={{ borderColor: '#1a2238' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#334155' }}>Select groups to verify</p>
          <div className="flex gap-2">
            <button onClick={() => !isRunning && setSelectedGroups(new Set(GROUPS.map(g => g.key)))} disabled={isRunning}
              className="text-xs px-2.5 py-1 rounded-lg border disabled:opacity-40"
              style={{ borderColor: '#1a2238', color: '#475569' }}>All</button>
            <button onClick={() => !isRunning && setSelectedGroups(new Set())} disabled={isRunning}
              className="text-xs px-2.5 py-1 rounded-lg border disabled:opacity-40"
              style={{ borderColor: '#1a2238', color: '#475569' }}>None</button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {GROUPS.map(group => {
            const selected = selectedGroups.has(group.key)
            const result   = groupResults[group.key]
            return (
              <button key={group.key} onClick={() => toggleGroup(group.key)} disabled={isRunning}
                className="text-left px-3 py-2.5 rounded-xl border transition-all disabled:cursor-default"
                style={{ background: selected ? group.bg : 'rgba(255,255,255,0.02)', borderColor: selected ? group.border : '#1a2238' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: selected ? group.color : '#334155' }}>{group.label}</span>
                  {result?.status === 'running' && <Loader2 size={11} className="animate-spin" style={{ color: group.color }} />}
                  {result?.status === 'done'    && <CheckCircle size={11} style={{ color: '#10b981' }} />}
                  {result?.status === 'error'   && <XCircle size={11} style={{ color: '#ef4444' }} />}
                  {!result && selected          && <div className="w-1.5 h-1.5 rounded-full" style={{ background: group.color }} />}
                </div>
                <p className="text-xs" style={{ color: '#334155' }}>
                  {result?.status === 'done'    ? `${result.findings.length} findings`
                  : result?.status === 'error'  ? (result.error?.slice(0, 55) ?? 'Error — retry')
                  : result?.status === 'running'? 'Verifying...'
                  : `${group.tables.length} tables`}
                </p>
              </button>
            )
          })}
          <div />
        </div>
      </div>

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
              { label: 'Total Checked', value: allFindings.length, color: '#ffffff',  bg: '#111827',                       border: '#1a2238'                       },
              { label: 'Confirmed ✓',   value: matches,            color: '#10b981',  bg: 'rgba(16,185,129,0.08)',          border: 'rgba(16,185,129,0.2)'          },
              { label: 'Issues Found',  value: mismatches,         color: '#ef4444',  bg: 'rgba(239,68,68,0.08)',           border: 'rgba(239,68,68,0.2)'           },
              { label: 'Unverified',    value: unverified,         color: '#f59e0b',  bg: 'rgba(245,158,11,0.08)',          border: 'rgba(245,158,11,0.2)'          },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3 text-center border" style={{ background: s.bg, borderColor: s.border }}>
                <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs font-bold mt-1" style={{ color: s.color === '#ffffff' ? '#475569' : s.color }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Running indicator */}
          {isRunning && currentGroupKey && (() => {
            const g = GROUPS.find(x => x.key === currentGroupKey)!
            const idx = groupsToRun.findIndex(x => x.key === currentGroupKey)
            return (
              <div className="rounded-xl px-4 py-3 mb-4 flex items-center gap-3 border"
                style={{ background: 'rgba(37,99,235,0.08)', borderColor: 'rgba(37,99,235,0.2)' }}>
                <Loader2 size={14} className="animate-spin" style={{ color: '#3b82f6' }} />
                <p className="text-sm" style={{ color: '#3b82f6' }}>
                  Verifying {g.label}
                  <span className="ml-2" style={{ color: '#334155' }}>({idx + 1} of {groupsToRun.length})</span>
                </p>
              </div>
            )
          })()}

          {/* Batch actions */}
          {(pendingMatches > 0 || pendingUnverified > 0) && (
            <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-xl border"
              style={{ background: '#111827', borderColor: '#1a2238' }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#334155' }}>Bulk</p>
              {pendingMatches > 0 && (
                <button onClick={approveAllMatches}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', borderColor: 'rgba(16,185,129,0.25)' }}>
                  <CheckCircle size={11} /> Approve all matches ({pendingMatches})
                </button>
              )}
              {pendingUnverified > 0 && (
                <button onClick={approveAllUnverified}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all"
                  style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.25)' }}>
                  <AlertCircle size={11} /> Acknowledge unverified ({pendingUnverified})
                </button>
              )}
              {totalDecided < allFindings.length && (
                <p className="ml-auto text-xs" style={{ color: '#334155' }}>
                  {allFindings.length - totalDecided} decisions remaining
                </p>
              )}
            </div>
          )}

          {/* Filter pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[['all', `All (${allFindings.length})`], ...Object.keys(TABLE_LABELS).filter(t => countByTable[t]).map(t => [t, `${TABLE_LABELS[t]} (${countByTable[t]})`])].map(([key, label]) => (
              <button key={key} onClick={() => setActiveFilter(key)}
                className="text-xs font-bold px-3 py-1.5 rounded-full border transition-all"
                style={{ background: activeFilter === key ? '#2563eb' : 'transparent', borderColor: activeFilter === key ? '#2563eb' : '#1a2238', color: activeFilter === key ? '#ffffff' : '#475569' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Findings */}
          <div className="space-y-2 mb-6">
            {visibleFindings.map(f => {
              const idx = allFindings.indexOf(f)
              const dec = decisions[idx]
              const statusColor = f.status === 'match' ? '#10b981' : f.status === 'mismatch' ? '#ef4444' : '#f59e0b'
              return (
                <div key={idx} className="border rounded-xl p-4 transition-all"
                  style={{
                    background: dec === 'saved' || dec === 'approved' ? 'rgba(16,185,129,0.04)' : dec === 'rejected' ? 'rgba(255,255,255,0.01)' : f.status === 'match' ? 'rgba(16,185,129,0.04)' : f.status === 'mismatch' ? 'rgba(239,68,68,0.04)' : 'rgba(245,158,11,0.04)',
                    borderColor: dec === 'saved' || dec === 'approved' ? 'rgba(16,185,129,0.3)' : dec === 'rejected' ? '#1f2937' : f.status === 'match' ? 'rgba(16,185,129,0.2)' : f.status === 'mismatch' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                    opacity: dec === 'rejected' ? 0.35 : 1,
                  }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {dec === 'saved' || dec === 'approved' ? <Check size={15} style={{ color: '#10b981' }} className="shrink-0 mt-0.5" />
                        : dec === 'rejected'  ? <XCircle size={15} style={{ color: '#475569' }} className="shrink-0 mt-0.5" />
                        : dec === 'saving'    ? <Loader2 size={15} style={{ color: '#3b82f6' }} className="shrink-0 mt-0.5 animate-spin" />
                        : f.status === 'match'? <CheckCircle size={15} style={{ color: '#10b981' }} className="shrink-0 mt-0.5" />
                        : f.status === 'mismatch' ? <XCircle size={15} style={{ color: '#ef4444' }} className="shrink-0 mt-0.5" />
                        : <AlertCircle size={15} style={{ color: '#f59e0b' }} className="shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: '#111827', color: '#475569' }}>
                            {TABLE_LABELS[f.table] ?? f.table}
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
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all"
                            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', borderColor: 'rgba(16,185,129,0.25)' }}>
                            <ThumbsUp size={11} /> Approve
                          </button>
                          <button onClick={() => reject(idx)}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all"
                            style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                            <ThumbsDown size={11} /> Reject
                          </button>
                        </div>
                      )}
                      {dec === 'saving' && <span className="text-xs font-bold px-3 py-1.5" style={{ color: '#3b82f6' }}>Updating...</span>}
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

          {/* Mark Verified */}
          {allDecided && !allSaved && allGroupsDone && (
            <button onClick={markVerified} disabled={saving}
              className="w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60"
              style={{ background: '#10b981' }}>
              {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Check size={15} /> Mark {countryName} as Fully Verified Today</>}
            </button>
          )}

          {allSaved && (
            <div className="rounded-xl p-4 text-center border" style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}>
              <CheckCircle size={20} className="mx-auto mb-2" style={{ color: '#10b981' }} />
              <p className="font-bold text-sm" style={{ color: '#10b981' }}>{countryName} fully verified and saved</p>
            </div>
          )}

        </div>
      )}

      {/* Empty state */}
      {!hasResults && !isRunning && (
        <div className="px-6 py-12 text-center">
          <Sparkles size={32} className="mx-auto mb-3" style={{ color: '#1e293b' }} />
          <p className="text-sm mb-1" style={{ color: '#475569' }}>Select groups above and click Run Verification</p>
          <p className="text-xs" style={{ color: '#334155' }}>
            Each group runs a separate focused AI call — significantly more thorough than a single pass
          </p>
          {sourcesWithUrls > 0 && (
            <p className="text-xs mt-2" style={{ color: '#1e293b' }}>{sourcesWithUrls} official source URLs pre-loaded</p>
          )}
        </div>
      )}

    </div>
  )
}
