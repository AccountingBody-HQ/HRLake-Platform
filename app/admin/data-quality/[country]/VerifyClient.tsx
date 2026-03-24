'use client'

import { useState } from 'react'
import { Sparkles, CheckCircle, XCircle, AlertCircle, Loader2, ThumbsUp, ThumbsDown, Check } from 'lucide-react'

interface Props {
  countryCode: string
  countryName: string
  brackets: any[]
  ss: any[]
  rules: any[]
  currencyCode: string | null
}

interface Finding {
  table: string
  field: string
  current_value: string
  found_value: string
  status: 'match' | 'mismatch' | 'unverified'
  source: string
  note: string
}

interface VerificationResult {
  summary: string
  findings: Finding[]
}

export default function VerifyClient({ countryCode, countryName, brackets, ss, rules, currencyCode }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [error, setError] = useState('')
  const [decisions, setDecisions] = useState<Record<number, 'approved' | 'rejected'>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function runVerification() {
    setLoading(true)
    setError('')
    setResult(null)
    setDecisions({})
    setSaved(false)

    const prompt = `You are a payroll data verification expert. Use web search to verify the following data for ${countryName} (${countryCode}) against official government sources for tax year 2025.

Search for the latest official rates from government websites before responding.

CURRENT DATABASE VALUES:

TAX BRACKETS:
${brackets.map(b => `- ${b.bracket_name}: ${b.lower_limit} to ${b.upper_limit ?? 'unlimited'} at ${b.rate}% (source: ${b.source_url})`).join('\n')}

SOCIAL SECURITY:
${ss.map(r => `- ${r.contribution_type}: employer ${r.employer_rate}%, employee ${r.employee_rate}% (source: ${r.source_url})`).join('\n')}

EMPLOYMENT RULES:
${rules.map(r => `- ${r.rule_type}: ${r.value_text ?? r.value_numeric + ' ' + (r.value_unit ?? '')} (source: ${r.source_url})`).join('\n')}

After searching official sources, verify each data point.

Respond ONLY with a JSON object in this exact format, no markdown, no code blocks, just raw JSON:
{
  "summary": "Brief overall assessment mentioning what you searched and found",
  "findings": [
    {
      "table": "tax_brackets|social_security|employment_rules",
      "field": "name of the field or bracket",
      "current_value": "what is in our database",
      "found_value": "what official source says",
      "status": "match|mismatch|unverified",
      "source": "official government URL you found",
      "note": "brief explanation of finding"
    }
  ]
}`

    try {
      const response = await fetch('/api/verify-country', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()
      if (data.error) throw new Error('API error: ' + data.error)
      if (!data.content || !data.content[0]) throw new Error('Empty response from API')

      const text = data.content[0].text ?? ''
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
      const start = cleaned.indexOf('{')
      const end = cleaned.lastIndexOf('}')
      if (start === -1 || end === -1) throw new Error('No JSON in: ' + cleaned.slice(0, 200))
      const parsed = JSON.parse(cleaned.slice(start, end + 1))
      setResult(parsed)
    } catch (e: any) {
      setError('Verification failed: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  function decide(index: number, decision: 'approved' | 'rejected') {
    setDecisions(prev => ({ ...prev, [index]: decision }))
  }

  async function saveDecisions() {
    setSaving(true)
    try {
      // Mark country as verified
      await fetch('/api/admin-update-country', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode,
          action: 'approve_all',
        }),
      })
      setSaved(true)
    } catch (e: any) {
      setError('Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const matches    = result?.findings.filter(f => f.status === 'match').length ?? 0
  const mismatches = result?.findings.filter(f => f.status === 'mismatch').length ?? 0
  const unverified = result?.findings.filter(f => f.status === 'unverified').length ?? 0
  const totalDecisions = Object.keys(decisions).length
  const totalFindings = result?.findings.length ?? 0
  const allDecided = totalFindings > 0 && totalDecisions === totalFindings

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold">AI Verification</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Claude searches official government sources to verify {countryName} data
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
          <p className="text-white font-semibold mb-1">Searching official sources for {countryName}...</p>
          <p className="text-slate-400 text-sm">Claude is browsing government websites and verifying each data point</p>
        </div>
      )}

      {result && !loading && (
        <div className="p-6">

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-emerald-400">{matches}</p>
              <p className="text-emerald-400 text-xs font-bold mt-1">Confirmed Correct</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-red-400">{mismatches}</p>
              <p className="text-red-400 text-xs font-bold mt-1">Possible Issues</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-black text-amber-400">{unverified}</p>
              <p className="text-amber-400 text-xs font-bold mt-1">Needs Manual Check</p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-800 rounded-xl p-4 mb-6">
            <p className="text-slate-300 text-sm leading-relaxed">{result.summary}</p>
          </div>

          {/* Findings */}
          <div className="space-y-3 mb-6">
            {result.findings.map((f, i) => (
              <div
                key={i}
                className={`border rounded-xl p-4 transition-all ${
                  decisions[i] === 'approved'
                    ? 'bg-emerald-500/5 border-emerald-500/40'
                    : decisions[i] === 'rejected'
                    ? 'bg-slate-800 border-slate-600 opacity-60'
                    : f.status === 'match'
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : f.status === 'mismatch'
                    ? 'bg-red-500/5 border-red-500/20'
                    : 'bg-amber-500/5 border-amber-500/20'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {decisions[i] === 'approved'
                      ? <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      : decisions[i] === 'rejected'
                      ? <XCircle size={16} className="text-slate-500 shrink-0 mt-0.5" />
                      : f.status === 'match'
                      ? <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      : f.status === 'mismatch'
                      ? <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                      : <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    }
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{f.table}</span>
                        <span className="text-white font-semibold text-sm">{f.field}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5">Current in DB</p>
                          <p className="text-sm font-mono text-slate-300">{f.current_value}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5">AI Found</p>
                          <p className={`text-sm font-mono font-bold ${
                            decisions[i] === 'approved' ? 'text-emerald-400' :
                            f.status === 'match' ? 'text-emerald-400' :
                            f.status === 'mismatch' ? 'text-red-400' : 'text-amber-400'
                          }`}>{f.found_value}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mb-1">{f.note}</p>
                      {f.source && (
                        <a href={f.source} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 truncate max-w-xs inline-block">{f.source}</a>
                      )}
                    </div>
                  </div>

                  {/* Approve / Reject buttons */}
                  {!decisions[i] && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => decide(i, 'approved')}
                        className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-600/30 hover:border-emerald-500 text-emerald-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                      >
                        <ThumbsUp size={12} /> Approve
                      </button>
                      <button
                        onClick={() => decide(i, 'rejected')}
                        className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600 border border-red-600/30 hover:border-red-500 text-red-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                      >
                        <ThumbsDown size={12} /> Reject
                      </button>
                    </div>
                  )}

                  {decisions[i] && (
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 ${
                      decisions[i] === 'approved'
                        ? 'bg-emerald-600/20 text-emerald-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {decisions[i] === 'approved' ? '✓ Approved' : '✗ Rejected'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Save button */}
          {allDecided && !saved && (
            <button
              onClick={saveDecisions}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              {saving
                ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
                : <><Check size={15} /> Mark {countryName} as Verified</>
              }
            </button>
          )}

          {saved && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
              <CheckCircle size={20} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-400 font-bold text-sm">{countryName} marked as verified today</p>
              <p className="text-slate-400 text-xs mt-1">Last updated date has been updated in the database</p>
            </div>
          )}

          {!allDecided && totalDecisions > 0 && (
            <p className="text-slate-500 text-xs text-center">
              {totalFindings - totalDecisions} findings remaining — approve or reject each one to save
            </p>
          )}

          <p className="text-slate-500 text-xs mt-4 text-center">
            AI verification uses live web search. Always confirm mismatches against official sources before accepting changes.
          </p>
        </div>
      )}

      {!result && !loading && !error && (
        <div className="px-6 py-12 text-center">
          <Sparkles size={32} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Click Run AI Verification to check all {countryName} data points against live government sources</p>
        </div>
      )}
    </div>
  )
}
