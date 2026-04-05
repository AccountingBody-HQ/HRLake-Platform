'use client'
import { useState } from 'react'
import {
  Sparkles, ChevronRight, Globe, Edit3,
  Check, Loader2, AlertCircle, Send
} from 'lucide-react'

const SITES = ['HRLake', 'AccountingBody', 'EthioTax']
const CONTENT_TYPES = ['Country Report', 'Explainer', 'HR Management', 'EOR Guide', 'Tax Guide', 'Course', 'Article']
const TONES = [
  { label: 'Authoritative', desc: 'Expert, confident, definitive' },
  { label: 'Educational',   desc: 'Clear, accessible, structured' },
  { label: 'Technical',     desc: 'Precise, detailed, professional' },
]
const LENGTHS = [
  { label: 'Short',     desc: '~500 words',   value: 'short' },
  { label: 'Standard',  desc: '~1,000 words', value: 'standard' },
  { label: 'Deep Dive', desc: '2,000+ words', value: 'deep' },
]
const STEPS = ['Select', 'Configure', 'Generate', 'Review', 'Publish']

type Config = {
  site: string; contentType: string; country: string; topic: string
  tone: string; length: string; aiSummary: string; keyTerms: string
}

const EMPTY: Config = {
  site: '', contentType: '', country: '', topic: '',
  tone: 'Authoritative', length: 'standard', aiSummary: '', keyTerms: '',
}

export default function ContentFactoryPage() {
  const [step, setStep]               = useState(0)
  const [config, setConfig]           = useState<Config>(EMPTY)
  const [generated, setGenerated]     = useState('')
  const [edited, setEdited]           = useState('')
  const [generating, setGenerating]   = useState(false)
  const [publishing, setPublishing]   = useState(false)
  const [published, setPublished]     = useState(false)
  const [error, setError]             = useState('')
  const [showOnSites, setShowOnSites] = useState<string[]>([])
  const [canonical, setCanonical]     = useState('')

  const wordCount = (edited || generated).split(/\s+/).filter(Boolean).length

  function seoScore() {
    let s = 0
    if (wordCount >= 300) s += 25
    if (wordCount >= 800) s += 25
    if (config.topic.length >= 20) s += 25
    if (config.aiSummary.length >= 50) s += 25
    return s
  }

  function step1Valid() { return !!(config.site && config.contentType && config.topic.trim()) }

  async function handleGenerate() {
    setGenerating(true); setError('')
    try {
      const res  = await fetch('/api/content-factory/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setGenerated(data.content)
      setEdited(data.content)
      if (data.aiSummary) setConfig(c => ({ ...c, aiSummary: data.aiSummary }))
      if (data.keyTerms)  setConfig(c => ({ ...c, keyTerms: data.keyTerms }))
      setShowOnSites([config.site])
      setCanonical(config.site)
      setStep(3)
    } catch (e: any) { setError(e.message) }
    finally { setGenerating(false) }
  }

  async function handlePublish() {
    setPublishing(true); setError('')
    try {
      const res  = await fetch('/api/content-factory/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, content: edited || generated, showOnSites, canonicalOwner: canonical }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Publish failed')
      setPublished(true)
    } catch (e: any) { setError(e.message) }
    finally { setPublishing(false) }
  }

  function reset() {
    setStep(0); setConfig(EMPTY); setGenerated(''); setEdited('')
    setPublished(false); setError(''); setShowOnSites([]); setCanonical('')
  }

  const btnPrimary   = 'bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold px-8 py-3 rounded-xl transition-all flex items-center gap-2'
  const btnSecondary = 'border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white font-bold px-8 py-3 rounded-xl transition-all'
  const card         = 'bg-slate-900 border border-slate-800 rounded-2xl p-6'

  function SelectCard({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
      <button onClick={onClick}
        className={`border rounded-xl p-4 text-left transition-all w-full ${
          active ? 'border-blue-500 bg-blue-600/10 text-white' : 'border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-300'
        }`}>
        {children}
      </button>
    )
  }

  return (
    <div className="p-8 max-w-5xl">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Content Factory</h1>
            <p className="text-slate-400 text-sm">Generate, review and publish to all three platforms via Sanity</p>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-10 flex-wrap gap-y-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
              i === step ? 'bg-blue-600 text-white' :
              i < step  ? 'bg-emerald-600/20 text-emerald-400' :
                          'bg-slate-800 text-slate-500'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                i < step  ? 'bg-emerald-500 text-white' :
                i === step ? 'bg-white/20 text-white' :
                             'bg-slate-700 text-slate-400'
              }`}>
                {i < step ? '✓' : i + 1}
              </span>
              <span className="text-sm font-semibold">{s}</span>
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={14} className="text-slate-700 mx-1" />}
          </div>
        ))}
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* ── STEP 1 SELECT ── */}
      {step === 0 && (
        <div className="space-y-6">
          <div className={card}>
            <h2 className="text-white font-bold mb-1">Target Site</h2>
            <p className="text-slate-500 text-xs mb-4">Which platform is this content primarily for?</p>
            <div className="grid grid-cols-3 gap-3">
              {SITES.map(site => (
                <SelectCard key={site} active={config.site === site} onClick={() => setConfig(c => ({ ...c, site }))}>
                  <Globe size={15} className="mb-2 opacity-70" />
                  <p className="font-semibold text-sm">{site}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {site === 'HRLake' ? 'hrlake.com' : site === 'AccountingBody' ? 'accountingbody.com' : 'ethiotax.com'}
                  </p>
                </SelectCard>
              ))}
            </div>
          </div>

          <div className={card}>
            <h2 className="text-white font-bold mb-1">Content Type</h2>
            <p className="text-slate-500 text-xs mb-4">What type of content do you need?</p>
            <div className="grid grid-cols-4 gap-3">
              {CONTENT_TYPES.map(type => (
                <SelectCard key={type} active={config.contentType === type} onClick={() => setConfig(c => ({ ...c, contentType: type }))}>
                  <p className="font-semibold text-xs">{type}</p>
                </SelectCard>
              ))}
            </div>
          </div>

          <div className={card}>
            <h2 className="text-white font-bold mb-1">Country <span className="text-slate-500 font-normal text-sm">(optional)</span></h2>
            <p className="text-slate-500 text-xs mb-4">Required for Country Reports, Tax Guides and EOR Guides</p>
            <input
              type="text" value={config.country}
              onChange={e => setConfig(c => ({ ...c, country: e.target.value }))}
              placeholder="e.g. United Kingdom, Germany, Ethiopia…"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className={card}>
            <h2 className="text-white font-bold mb-1">Topic</h2>
            <p className="text-slate-500 text-xs mb-4">Be specific — the more detail you give, the better the output</p>
            <textarea
              value={config.topic} rows={3}
              onChange={e => setConfig(c => ({ ...c, topic: e.target.value }))}
              placeholder="e.g. Employer payroll obligations for remote workers in the UK including PAYE, National Insurance and employer contributions…"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button onClick={() => setStep(1)} disabled={!step1Valid()} className={btnPrimary}>
              Continue <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2 CONFIGURE ── */}
      {step === 1 && (
        <div className="space-y-6">
          <div className={card}>
            <h2 className="text-white font-bold mb-1">Tone</h2>
            <p className="text-slate-500 text-xs mb-4">How should the content feel to the reader?</p>
            <div className="grid grid-cols-3 gap-3">
              {TONES.map(t => (
                <SelectCard key={t.label} active={config.tone === t.label} onClick={() => setConfig(c => ({ ...c, tone: t.label }))}>
                  <p className="font-semibold text-sm">{t.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{t.desc}</p>
                </SelectCard>
              ))}
            </div>
          </div>

          <div className={card}>
            <h2 className="text-white font-bold mb-1">Length</h2>
            <p className="text-slate-500 text-xs mb-4">How comprehensive should this article be?</p>
            <div className="grid grid-cols-3 gap-3">
              {LENGTHS.map(l => (
                <SelectCard key={l.value} active={config.length === l.value} onClick={() => setConfig(c => ({ ...c, length: l.value }))}>
                  <p className="font-semibold text-sm">{l.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{l.desc}</p>
                </SelectCard>
              ))}
            </div>
          </div>

          <div className={card}>
            <h2 className="text-white font-bold mb-1">AI Summary <span className="text-slate-500 font-normal text-sm">(for RAG knowledge base)</span></h2>
            <p className="text-slate-500 text-xs mb-4">Leave blank to auto-generate after content is created</p>
            <textarea
              value={config.aiSummary} rows={2}
              onChange={e => setConfig(c => ({ ...c, aiSummary: e.target.value }))}
              placeholder="Optional — will be auto-generated if left blank…"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <div className={card}>
            <h2 className="text-white font-bold mb-1">Key Terms <span className="text-slate-500 font-normal text-sm">(for vector indexing)</span></h2>
            <p className="text-slate-500 text-xs mb-4">Comma-separated. Leave blank to auto-generate.</p>
            <input
              type="text" value={config.keyTerms}
              onChange={e => setConfig(c => ({ ...c, keyTerms: e.target.value }))}
              placeholder="e.g. payroll, PAYE, National Insurance, employer contributions…"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(0)} className={btnSecondary}>Back</button>
            <button onClick={() => setStep(2)} className={btnPrimary}>Continue <ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* ── STEP 3 GENERATE ── */}
      {step === 2 && (
        <div className="space-y-6">
          <div className={card}>
            <h2 className="text-white font-bold mb-4">Ready to Generate</h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {[
                { label: 'Target Site',   value: config.site },
                { label: 'Content Type',  value: config.contentType },
                { label: 'Country',       value: config.country || '—' },
                { label: 'Tone',          value: config.tone },
                { label: 'Length',        value: LENGTHS.find(l => l.value === config.length)?.label ?? config.length },
              ].map(item => (
                <div key={item.label} className="bg-slate-800 rounded-xl p-3">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-white text-sm font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-slate-800 rounded-xl p-3">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Topic</p>
              <p className="text-white text-sm">{config.topic}</p>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className={btnSecondary}>Back</button>
            <button onClick={handleGenerate} disabled={generating} className={btnPrimary}>
              {generating
                ? <><Loader2 size={16} className="animate-spin" /> Generating…</>
                : <><Sparkles size={16} /> Generate Content</>}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4 REVIEW ── */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'SEO Score',   value: `${seoScore()}%`,        color: seoScore() >= 75 ? 'text-emerald-400' : seoScore() >= 50 ? 'text-amber-400' : 'text-red-400' },
              { label: 'Word Count',  value: wordCount,               color: 'text-blue-400' },
              { label: 'Topic Chars', value: config.topic.length,     color: 'text-slate-300' },
              { label: 'Status',      value: 'Ready to Review',       color: 'text-emerald-400' },
            ].map(c => (
              <div key={c.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{c.label}</p>
                <p className={`text-xl font-black ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className={card}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold flex items-center gap-2">
                <Edit3 size={15} className="text-blue-400" /> Edit Content
              </h2>
              <button onClick={() => setEdited(generated)} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                Reset to original
              </button>
            </div>
            <textarea
              value={edited} rows={22}
              onChange={e => setEdited(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-300 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none font-mono leading-relaxed"
            />
          </div>

          <div className={card}>
            <h2 className="text-white font-bold mb-1">AI Summary</h2>
            <p className="text-slate-500 text-xs mb-3">Used for RAG knowledge base indexing</p>
            <textarea
              value={config.aiSummary} rows={3}
              onChange={e => setConfig(c => ({ ...c, aiSummary: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <div className={card}>
            <h2 className="text-white font-bold mb-1">Key Terms</h2>
            <p className="text-slate-500 text-xs mb-3">Comma-separated terms for vector indexing</p>
            <input
              type="text" value={config.keyTerms}
              onChange={e => setConfig(c => ({ ...c, keyTerms: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className={btnSecondary}>Regenerate</button>
            <button onClick={() => setStep(4)} className={btnPrimary}>
              Continue to Publish <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 5 PUBLISH ── */}
      {step === 4 && !published && (
        <div className="space-y-6">
          <div className={card}>
            <h2 className="text-white font-bold mb-1">Show On Sites</h2>
            <p className="text-slate-500 text-xs mb-4">Which platforms should display this article?</p>
            <div className="grid grid-cols-3 gap-3">
              {SITES.map(site => (
                <button key={site}
                  onClick={() => setShowOnSites(prev =>
                    prev.includes(site) ? prev.filter(s => s !== site) : [...prev, site]
                  )}
                  className={`border rounded-xl p-4 text-left transition-all ${
                    showOnSites.includes(site)
                      ? 'border-blue-500 bg-blue-600/10 text-white'
                      : 'border-slate-700 hover:border-slate-600 text-slate-400'
                  }`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm">{site}</p>
                    {showOnSites.includes(site) && <Check size={14} className="text-blue-400" />}
                  </div>
                  <p className="text-xs text-slate-500">Display on {site}</p>
                </button>
              ))}
            </div>
          </div>

          <div className={card}>
            <h2 className="text-white font-bold mb-1">Canonical Owner</h2>
            <p className="text-slate-500 text-xs mb-4">Which site owns the Google SEO ranking for this article?</p>
            <div className="grid grid-cols-3 gap-3">
              {SITES.map(site => (
                <button key={site} onClick={() => setCanonical(site)}
                  className={`border rounded-xl p-4 text-left transition-all ${
                    canonical === site
                      ? 'border-emerald-500 bg-emerald-600/10 text-white'
                      : 'border-slate-700 hover:border-slate-600 text-slate-400'
                  }`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm">{site}</p>
                    {canonical === site && <Check size={14} className="text-emerald-400" />}
                  </div>
                  <p className="text-xs text-slate-500">SEO owner</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(3)} className={btnSecondary}>Back</button>
            <button onClick={handlePublish}
              disabled={publishing || showOnSites.length === 0 || !canonical}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold px-8 py-3 rounded-xl transition-all flex items-center gap-2">
              {publishing
                ? <><Loader2 size={16} className="animate-spin" /> Publishing…</>
                : <><Send size={16} /> Publish to Sanity</>}
            </button>
          </div>
        </div>
      )}

      {/* ── SUCCESS ── */}
      {published && (
        <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-2xl p-12 text-center">
          <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Published Successfully</h2>
          <p className="text-slate-400 mb-2">Your article is now live in Sanity and will appear on all selected platforms within 60 seconds.</p>
          <p className="text-slate-500 text-sm mb-8">Canonical owner: <span className="text-white font-semibold">{canonical}</span></p>
          <button onClick={reset}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-all inline-flex items-center gap-2">
            <Sparkles size={16} /> Create Another Article
          </button>
        </div>
      )}

    </div>
  )
}
