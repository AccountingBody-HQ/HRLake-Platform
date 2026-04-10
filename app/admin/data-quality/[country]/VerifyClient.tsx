'use client'

import { useState } from 'react'
import { Sparkles, CheckCircle, XCircle, AlertCircle, Loader2, ThumbsUp, ThumbsDown, Check } from 'lucide-react'

interface Props {
  countryCode: string
  countryName: string
  brackets: any[]
  ss: any[]
  rules: any[]
  leave: any[]
  holidays: any[]
  filing: any[]
  compliance: any[]
  hours: any[]
  termination: any[]
  pension: any[]
  sourceMap: Record<string, any>
  currencyCode: string | null
}

interface Finding {
  table: string
  record_id: string
  field: string
  current_value: string
  found_value: string
  raw_value: Record<string, unknown>
  status: 'match' | 'mismatch' | 'unverified'
  source: string
  note: string
}

interface VerificationResult {
  summary: string
  findings: Finding[]
}

const TABLE_LABELS: Record<string, string> = {
  tax_brackets: 'Tax Brackets',
  social_security: 'Social Security',
  employment_rules: 'Employment Rules',
  statutory_leave: 'Statutory Leave',
  public_holidays: 'Public Holidays',
  filing_calendar: 'Filing Calendar',
  payroll_compliance: 'Payroll Compliance',
  working_hours: 'Working Hours',
  termination_rules: 'Termination Rules',
  pension_schemes: 'Pension Schemes',
}

const ALL_TABLES = Object.keys(TABLE_LABELS)

const TABLE_MAP: Record<string, string> = {
  tax_brackets: 'hrlake.tax_brackets',
  social_security: 'hrlake.social_security',
  employment_rules: 'hrlake.employment_rules',
  statutory_leave: 'hrlake.statutory_leave',
  public_holidays: 'hrlake.public_holidays',
  filing_calendar: 'hrlake.filing_calendar',
  payroll_compliance: 'hrlake.payroll_compliance',
  working_hours: 'hrlake.working_hours',
  termination_rules: 'hrlake.termination_rules',
  pension_schemes: 'hrlake.pension_schemes',
}

function buildPrompt(
  countryName: string, countryCode: string,
  brackets: any[], ss: any[], rules: any[], leave: any[],
  holidays: any[], filing: any[], compliance: any[],
  hours: any[], termination: any[], pension: any[],
  sourceMap: Record<string, any>
) {
  const src = (cat: string) => {
    const s = sourceMap[cat]
    return s ? `OFFICIAL SOURCE: ${s.source_url} (${s.authority_name})` : 'Search official government website'
  }

  const fmtRows = (rows: any[], fields: string[]) =>
    rows.length === 0
      ? '  (no records — skip this table)'
      : rows.map(r => `  - id:${r.id} | ${fields.map(f => `${f}=${JSON.stringify(r[f] ?? null)}`).join(', ')}`).join('\n')

  return `You are a payroll data verification expert. Verify the following data for ${countryName} (${countryCode}) for tax year 2025 using the official government sources listed.

INSTRUCTIONS:
1. Search EACH official source URL provided below — minimum 1 search per table section.
2. Verify every single record against the official source.
3. Return ONE JSON object with a "findings" array. No markdown, no code blocks.
4. Every record_id listed must appear in findings.
5. raw_value = exact numeric value (no %, no units) or plain string for text fields, null for unlimited.

=== TAX BRACKETS ===
${src('tax_brackets')}
${fmtRows(brackets, ['bracket_name','lower_limit','upper_limit','rate'])}

=== SOCIAL SECURITY ===
${src('social_security')}
${fmtRows(ss, ['contribution_type','employer_rate','employee_rate','applies_above','applies_below'])}

=== EMPLOYMENT RULES ===
${src('employment_rules')}
${fmtRows(rules, ['rule_type','value_text','value_numeric','value_unit'])}

=== STATUTORY LEAVE ===
${src('statutory_leave')}
${fmtRows(leave, ['leave_type','minimum_days','maximum_days','is_paid','payment_rate'])}

=== PUBLIC HOLIDAYS ===
${src('public_holidays')}
${fmtRows(holidays, ['holiday_name','holiday_date','is_mandatory'])}

=== FILING CALENDAR ===
${src('filing_calendar')}
${fmtRows(filing, ['filing_type','frequency','due_day','due_month'])}

=== PAYROLL COMPLIANCE ===
${src('payroll_compliance')}
${fmtRows(compliance, ['description','frequency','deadline_description'])}

=== WORKING HOURS ===
${src('working_hours')}
${fmtRows(hours, ['standard_hours_per_week','maximum_hours_per_week','overtime_rate_multiplier'])}

=== TERMINATION RULES ===
${src('termination_rules')}
${fmtRows(termination, ['notice_period_min_days','severance_mandatory','probation_period_max_months'])}

=== PENSION SCHEMES ===
${src('pension_schemes')}
${fmtRows(pension, ['scheme_name','employer_rate','employee_rate','is_mandatory'])}

Respond ONLY with raw JSON (no markdown, start with {, end with }):
{
  "summary": "What you searched and key findings",
  "findings": [
    {
      "table": "tax_brackets|social_security|employment_rules|statutory_leave|public_holidays|filing_calendar|payroll_compliance|working_hours|termination_rules|pension_schemes",
      "record_id": "exact uuid from above",
      "field": "exact_single_column_name",
      "current_value": "human readable current value",
      "found_value": "human readable value from official source",
      "raw_value": {"rate": 12.5},
      "status": "match|mismatch|unverified",
      "source": "official URL used",
      "note": "brief explanation"
    }
  ]
}`
}

export default function VerifyClient({
  countryCode, countryName, brackets, ss, rules, leave,
  holidays, filing, compliance, hours, termination, pension,
  sourceMap, currencyCode
}: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState('')
  const [decisions, setDecisions] = useState<Record<number, 'approved' | 'rejected' | 'saving' | 'saved'>>({})
  const [allSaved, setAllSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTable, setActiveTable] = useState<string>('all')

  async function runVerification() {
    setLoading(true)
    setError('')
    setResult(null)
    setDecisions({})
    setAllSaved(false)

    const prompt = buildPrompt(
      countryName, countryCode,
      brackets, ss, rules, leave,
      holidays, filing, compliance,
      hours, termination, pension,
      sourceMap
    )

    try {
      const controller = new AbortController()
      const tid = setTimeout(() => controller.abort(), 130000)
      const response = await fetch('/api/verify-country', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      })
      clearTimeout(tid)
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      const text = data.content?.[0]?.text ?? ''
      const start = text.indexOf('{')
      const end = text.lastIndexOf('}')
      if (start === -1 || end === -1) throw new Error('No JSON in response')
      const parsed = JSON.parse(text.slice(start, end + 1))
      if (!parsed.findings) throw new Error('Missing findings array')
      setResult(parsed)
    } catch (e: any) {
      setError('Verification failed: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  async function approve(index: number, finding: Finding) {
    // matches and unverified findings are acknowledged locally — no DB write needed
    if (finding.status === 'match' || finding.status === 'unverified') {
      setDecisions(prev => ({ ...prev, [index]: 'approved' }))
      return
    }
    // Only mismatch with a valid raw_value object should write to DB
    if (!finding.raw_value || typeof finding.raw_value !== 'object' || Array.isArray(finding.raw_value)) {
      setDecisions(prev => ({ ...prev, [index]: 'approved' }))
      return
    }
    setDecisions(prev => ({ ...prev, [index]: 'saving' }))
    try {
      const res = await fetch('/api/admin-update-country', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode,
          action: 'update_value',
          finding: { table: finding.table, field: finding.field, raw_value: finding.raw_value, record_id: finding.record_id },
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setDecisions(prev => ({ ...prev, [index]: 'saved' }))
    } catch (e: any) {
      setError('Update failed: ' + e.message)
      setDecisions(prev => { const n = { ...prev }; delete n[index]; return n })
    }
  }

  function reject(index: number) {
    setDecisions(prev => ({ ...prev, [index]: 'rejected' }))
  }

  async function markVerified() {
    setSaving(true)
    try {
      await fetch('/api/admin-update-country', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode, action: 'approve_all' }),
      })
      setAllSaved(true)
    } catch (e: any) {
      setError('Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const allFindings = result?.findings ?? []
  const visibleFindings = activeTable === 'all'
    ? allFindings
    : allFindings.filter(f => f.table === activeTable)

  const matches    = allFindings.filter(f => f.status === 'match').length
  const mismatches = allFindings.filter(f => f.status === 'mismatch').length
  const unverified = allFindings.filter(f => f.status === 'unverified').length
  const totalFindings = allFindings.length
  const totalDecided = Object.keys(decisions).length
  const allDecided = totalFindings > 0 && totalDecided === totalFindings

  // Table pill counts
  const countByTable = allFindings.reduce((acc, f) => {
    acc[f.table] = (acc[f.table] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sourcesWithUrls = Object.keys(sourceMap).length

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1424', border: '1px solid #1a2238' }}>
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid #1a2238' }}>
        <div>
          <h2 className="text-white font-bold">AI Verification — All 10 Tables</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            {sourcesWithUrls} official source URLs loaded · Claude searches each against live government data
          </p>
        </div>
        <button
          onClick={runVerification}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          {loading
            ? <><Loader2 size={15} className="animate-spin" /> Verifying...</>
            : <><Sparkles size={15} /> Run AI Verification</>
          }
        </button>
      </div>

      {error && (
        <div className="px-6 py-4 bg-red-500/10 border-b border-red-500/20">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="px-6 py-12 text-center">
          <Loader2 size={32} className="animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-white font-semibold mb-1">Verifying all 10 data tables for {countryName}...</p>
          <p className="text-slate-400 text-sm">Claude is browsing official government sources — this takes 30–60 seconds</p>
        </div>
      )}

      {result && !loading && (
        <div className="p-6">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="rounded-xl p-3 text-center" style={{ background: '#111827', border: '1px solid #1a2238' }}>
              <p className="text-2xl font-black text-white">{totalFindings}</p>
              <p className="text-slate-400 text-xs font-bold mt-1">Total Checked</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-emerald-400">{matches}</p>
              <p className="text-emerald-400 text-xs font-bold mt-1">Confirmed ✓</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-red-400">{mismatches}</p>
              <p className="text-red-400 text-xs font-bold mt-1">Issues Found</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-amber-400">{unverified}</p>
              <p className="text-amber-400 text-xs font-bold mt-1">Unverified</p>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-xl p-4 mb-5" style={{ background: '#111827' }}>
            <p className="text-slate-300 text-sm leading-relaxed">{result.summary}</p>
          </div>

          {/* Table filter pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            <button
              onClick={() => setActiveTable('all')}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${activeTable === 'all' ? 'bg-blue-600 border-blue-500 text-white' : 'hover:text-white'}`}
              style={{ borderColor: '#1a2238' }}>
              All ({totalFindings})
            </button>
            {ALL_TABLES.filter(t => countByTable[t]).map(t => (
              <button
                key={t}
                onClick={() => setActiveTable(t)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${activeTable === t ? 'bg-blue-600 border-blue-500 text-white' : 'hover:text-white'}`}
                style={{ borderColor: '#1a2238' }}>
                {TABLE_LABELS[t]} ({countByTable[t]})
              </button>
            ))}
          </div>

          {/* Findings list */}
          <div className="space-y-3 mb-6">
            {visibleFindings.map((f, visIdx) => {
              const globalIdx = allFindings.indexOf(f)
              return (
                <div
                  key={globalIdx}
                  className={`border rounded-xl p-4 transition-all ${
                    decisions[globalIdx] === 'saved' || decisions[globalIdx] === 'approved'
                      ? 'bg-emerald-500/5 border-emerald-500/40'
                      : decisions[globalIdx] === 'rejected'
                      ? 'bg-slate-800 border-slate-600 opacity-40'
                      : f.status === 'match'
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : f.status === 'mismatch'
                      ? 'bg-red-500/5 border-red-500/20'
                      : 'bg-amber-500/5 border-amber-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {decisions[globalIdx] === 'saved' || decisions[globalIdx] === 'approved'
                        ? <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                        : decisions[globalIdx] === 'rejected'
                        ? <XCircle size={16} className="text-slate-500 shrink-0 mt-0.5" />
                        : decisions[globalIdx] === 'saving'
                        ? <Loader2 size={16} className="text-blue-400 shrink-0 mt-0.5 animate-spin" />
                        : f.status === 'match'
                        ? <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                        : f.status === 'mismatch'
                        ? <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                        : <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      }
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded">{TABLE_LABELS[f.table] ?? f.table}</span>
                          <span className="text-white font-semibold text-sm">{f.field}</span>
                          {f.status === 'mismatch' && !decisions[globalIdx] && (
                            <span className="text-xs bg-blue-600/20 text-blue-400 border border-blue-600/30 px-2 py-0.5 rounded-full">Approve = auto-update DB</span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">Current in DB</p>
                            <p className="text-sm font-mono text-slate-300">{f.current_value}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">AI Found</p>
                            <p className={`text-sm font-mono font-bold ${
                              decisions[globalIdx] === 'saved' || decisions[globalIdx] === 'approved' ? 'text-emerald-400' :
                              f.status === 'match' ? 'text-emerald-400' :
                              f.status === 'mismatch' ? 'text-red-400' : 'text-amber-400'
                            }`}>{f.found_value}</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mb-1">{f.note}</p>
                        {f.source && (
                          <a href={f.source} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 truncate max-w-sm inline-block">{f.source}</a>
                        )}
                        {decisions[globalIdx] === 'saved' && (
                          <p className="text-xs text-emerald-400 mt-1 font-semibold">✓ Database updated</p>
                        )}
                      </div>
                    </div>

                    {!decisions[globalIdx] && (
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => approve(globalIdx, f)} className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-600/30 hover:border-emerald-500 text-emerald-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all">
                          <ThumbsUp size={12} /> Approve
                        </button>
                        <button onClick={() => reject(globalIdx)} className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600 border border-red-600/30 hover:border-red-500 text-red-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all">
                          <ThumbsDown size={12} /> Reject
                        </button>
                      </div>
                    )}
                    {decisions[globalIdx] === 'saving' && <span className="text-xs text-blue-400 font-bold px-3 py-1.5 shrink-0">Updating...</span>}
                    {(decisions[globalIdx] === 'saved' || decisions[globalIdx] === 'approved') && (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 bg-emerald-600/20 text-emerald-400">✓ Approved</span>
                    )}
                    {decisions[globalIdx] === 'rejected' && (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 bg-slate-700 text-slate-400">✗ Rejected</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {allDecided && !allSaved && (
            <button onClick={markVerified} disabled={saving} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors">
              {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Check size={15} /> Mark {countryName} as Fully Verified Today</>}
            </button>
          )}

          {allSaved && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
              <CheckCircle size={20} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-400 font-bold text-sm">{countryName} fully verified and saved</p>
            </div>
          )}

          {!allDecided && totalDecided > 0 && (
            <p className="text-slate-500 text-xs text-center mt-4">{totalFindings - totalDecided} findings remaining</p>
          )}
        </div>
      )}

      {!result && !loading && !error && (
        <div className="px-6 py-12 text-center">
          <Sparkles size={32} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Click Run AI Verification to check all 10 data tables for {countryName} against live official government sources</p>
          {sourcesWithUrls > 0 && (
            <p className="text-slate-500 text-xs mt-2">{sourcesWithUrls} official source URLs pre-loaded for this country</p>
          )}
        </div>
      )}
    </div>
  )
}
