'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Globe, FileText, Wrench, ArrowRight, Loader2, X, ChevronRight } from 'lucide-react'

interface Country {
  iso2: string
  name: string
  flag_emoji: string
  region: string
  currency_code: string
  hrlake_coverage_level: string
}

interface Article {
  title: string
  slug: string
  publishedAt: string
  excerpt: string
  category: string
}

type FilterType = 'all' | 'countries' | 'articles'

const TOOLS = [
  { name: 'Global Payroll Calculator', href: '/payroll-tools/global-calculator/', desc: 'Full breakdown for any country' },
  { name: 'Country Comparison Tool', href: '/compare/', desc: 'Side-by-side employer cost comparison' },
  { name: 'Payroll Tools Hub', href: '/payroll-tools/', desc: 'All calculators and tools' },
  { name: 'EOR Intelligence', href: '/eor/', desc: 'Employer of Record cost modelling' },
  { name: 'HR Compliance Hub', href: '/hr-compliance/', desc: 'Global employment law by topic' },
]

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return '' }
}

function coverageBadge(level: string) {
  const map: Record<string, { label: string; classes: string }> = {
    full:    { label: 'Full data',    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    partial: { label: 'Partial data', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
    basic:   { label: 'Basic data',   classes: 'bg-slate-100 text-slate-600 border-slate-200' },
    none:    { label: 'Coming soon',  classes: 'bg-slate-100 text-slate-400 border-slate-200' },
  }
  const b = map[level] ?? map.basic
  return (
    <span className={'inline-flex items-center text-[10px] font-bold uppercase tracking-wider border rounded-full px-2 py-0.5 ' + b.classes}>
      {b.label}
    </span>
  )
}

function CountryCard({ country }: { country: Country }) {
  return (
    <Link
      href={'/countries/' + country.iso2.toLowerCase() + '/'}
      className="group flex items-center gap-4 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-2xl px-5 py-4 transition-all duration-200"
    >
      <img src={'https://flagcdn.com/28x21/' + country.iso2.toLowerCase() + '.png'} alt={country.name} width={28} height={21} className="rounded-sm shadow-sm shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{country.name}</span>
          {coverageBadge(country.hrlake_coverage_level)}
        </div>
        <div className="text-xs text-slate-400">
          {country.region} · {country.currency_code}

        </div>
      </div>
      <div className="shrink-0 flex items-center gap-1 text-blue-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
        View <ChevronRight size={13} />
      </div>
    </Link>
  )
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={'/insights/' + article.slug + '/'}
      className="group bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md rounded-2xl p-6 transition-all duration-200 block"
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 bg-indigo-50 text-indigo-500 rounded-xl p-2.5 group-hover:bg-indigo-100 transition-colors">
          <FileText size={18} />
        </div>
        <div className="min-w-0 flex-1">
          {article.category && (
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{article.category}</span>
          )}
          <h3 className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors mt-1 mb-2 leading-snug">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{article.excerpt}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            {article.publishedAt && (
              <span className="text-[11px] text-slate-400">{formatDate(article.publishedAt)}</span>
            )}
            <span className="flex items-center gap-1 text-indigo-600 text-xs font-semibold group-hover:gap-1.5 transition-all">
              Read article <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function ToolCard({ tool }: { tool: typeof TOOLS[0] }) {
  return (
    <Link
      href={tool.href}
      className="group flex items-center gap-4 bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md rounded-2xl px-5 py-4 transition-all duration-200"
    >
      <div className="shrink-0 bg-sky-50 text-sky-600 rounded-xl p-2.5 group-hover:bg-sky-100 transition-colors">
        <Wrench size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors text-sm">{tool.name}</div>
        <div className="text-xs text-slate-400 mt-0.5">{tool.desc}</div>
      </div>
      <ChevronRight size={15} className="shrink-0 text-slate-300 group-hover:text-blue-400 transition-colors" />
    </Link>
  )
}

function FilterTabs({
  active,
  onChange,
  counts,
}: {
  active: FilterType
  onChange: (f: FilterType) => void
  counts: { all: number; countries: number; articles: number }
}) {
  const tabs: { key: FilterType; label: string; icon: React.ElementType; count: number }[] = [
    { key: 'all',       label: 'All results', icon: Search,   count: counts.all },
    { key: 'countries', label: 'Countries',   icon: Globe,    count: counts.countries },
    { key: 'articles',  label: 'Articles',    icon: FileText, count: counts.articles },
  ]
  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ' + (active === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
        >
          <tab.icon size={14} />
          {tab.label}
          {tab.count > 0 && (
            <span className={'text-[11px] font-bold px-1.5 py-0.5 rounded-full ' + (active === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500')}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') ?? ''

  const [inputValue, setInputValue] = useState(initialQuery)
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<{ countries: Country[]; articles: Article[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    if (!query || query.length < 2) { setResults(null); return }
    let cancelled = false
    setLoading(true)
    fetch('/api/search?q=' + encodeURIComponent(query))
      .then(r => r.json())
      .then((data) => { if (!cancelled) { setResults(data); setLoading(false) } })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed) return
    setQuery(trimmed)
    router.replace('/search/?q=' + encodeURIComponent(trimmed), { scroll: false })
    setFilter('all')
  }

  const matchedTools = query.length >= 2
    ? TOOLS.filter(t =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.desc.toLowerCase().includes(query.toLowerCase())
      )
    : []

  const counts = {
    countries: results?.countries.length ?? 0,
    articles:  results?.articles.length ?? 0,
    all: (results?.countries.length ?? 0) + (results?.articles.length ?? 0) + matchedTools.length,
  }

  const showCountries = filter === 'all' || filter === 'countries'
  const showArticles  = filter === 'all' || filter === 'articles'
  const hasAnyResults = counts.all > 0

  return (
    <main className="bg-slate-50 flex-1">
      <div className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <a href="/" className="hover:text-slate-200 transition-colors">Home</a>
            <span>›</span>
            <span className="text-slate-300">Search</span>
          </nav>
          <h1 className="font-serif text-3xl lg:text-4xl font-bold text-white mb-8 tracking-tight">
            {query ? <>Results for <span className="text-blue-400">"{query}"</span></> : 'Search HRLake'}
          </h1>
          <form onSubmit={handleSubmit} className="max-w-2xl">
            <div className="flex items-center bg-white rounded-2xl shadow-xl shadow-black/20 overflow-hidden border-2 border-transparent focus-within:border-blue-400 transition-all duration-200">
              <div className="flex items-center justify-center w-12 shrink-0">
                <Search size={16} className="text-slate-400" />
              </div>
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Search countries, employment law, EOR, payroll guides…"
                className="flex-1 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-transparent outline-none min-w-0"
                autoFocus
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={() => { setInputValue(''); setQuery(''); setResults(null) }}
                  className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              )}
              <div className="p-2 shrink-0">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl transition-all px-2 py-2.5 sm:px-5"
                >
                  <ArrowRight size={16} className="shrink-0" />
                  <span className="hidden sm:inline text-sm pr-1">Search</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-10">
        {loading && (
          <div className="flex items-center gap-3 text-slate-500 py-8">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm font-medium">Searching…</span>
          </div>
        )}

        {!loading && !query && (
          <div className="py-12 text-center">
            <Search size={40} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">Enter a country name, topic, or keyword to search.</p>
          </div>
        )}

        {!loading && results && (
          <>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
              <FilterTabs active={filter} onChange={setFilter} counts={counts} />
              {hasAnyResults && (
                <p className="text-sm text-slate-400">
                  <span className="font-semibold text-slate-700">{counts.all}</span> results
                </p>
              )}
            </div>

            {!hasAnyResults && (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-slate-400" />
                </div>
                <h2 className="font-bold text-slate-800 text-lg mb-2">No results found</h2>
                <p className="text-slate-500 text-sm mb-6">
                  No countries or articles matched <span className="font-semibold text-slate-700">"{query}"</span>.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['United Kingdom', 'Germany', 'Singapore', 'United States'].map(s => (
                    <button
                      key={s}
                      onClick={() => { setInputValue(s); setQuery(s); router.replace('/search/?q=' + encodeURIComponent(s)) }}
                      className="text-xs font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-full px-3 py-1.5 transition-colors"
                    >
                      Try "{s}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showCountries && results.countries.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Globe size={15} className="text-blue-500" />
                  <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Countries</h2>
                  <span className="text-xs text-slate-400">({results.countries.length})</span>
                </div>
                <div className="grid gap-3">
                  {results.countries.map(c => <CountryCard key={c.iso2} country={c} />)}
                </div>
                <div className="mt-4 text-center">
                  <Link href="/countries/" className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                    Browse all 195 countries →
                  </Link>
                </div>
              </section>
            )}

            {showArticles && results.articles.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={15} className="text-indigo-500" />
                  <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Articles</h2>
                  <span className="text-xs text-slate-400">({results.articles.length})</span>
                </div>
                <div className="grid gap-4">
                  {results.articles.map(a => <ArticleCard key={a.slug} article={a} />)}
                </div>
              </section>
            )}

            {filter === 'all' && matchedTools.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Wrench size={15} className="text-sky-500" />
                  <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Tools</h2>
                  <span className="text-xs text-slate-400">({matchedTools.length})</span>
                </div>
                <div className="grid gap-3">
                  {matchedTools.map(t => <ToolCard key={t.href} tool={t} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="bg-slate-50 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
