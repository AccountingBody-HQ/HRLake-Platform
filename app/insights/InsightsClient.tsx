"use client"

// ============================================
// INSIGHTS — CLIENT FILTER & SEARCH CONTROLS
// ============================================

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useCallback, useEffect } from "react"
import { Search, X, Globe, Calculator, Scale, Building2, Receipt, Users, ShieldCheck, FileText } from "lucide-react"
import { INSIGHT_TOPICS } from "@/lib/sanity"

const TOPIC_ICONS: Record<string, any> = {
  all:              Globe,
  payroll:          Calculator,
  "employment-law": Scale,
  eor:              Building2,
  tax:              Receipt,
  hr:               Users,
  compliance:       ShieldCheck,
  "country-report": FileText,
}

export default function InsightsClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentTopic = searchParams.get("topic") || "all"
  const currentSearch = searchParams.get("q") || ""
  const [searchInput, setSearchInput] = useState(currentSearch)

  useEffect(() => { setSearchInput(currentSearch) }, [currentSearch])

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      params.delete("page")
      const qs = params.toString()
      router.push("/insights/" + (qs ? "?" + qs : ""), { scroll: false })
    },
    [router, searchParams]
  )

  const handleTopic = (slug: string) => {
    updateParams({ topic: slug === "all" ? null : slug })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({ q: searchInput.trim() || null })
  }

  const clearSearch = () => {
    setSearchInput("")
    updateParams({ q: null })
  }

  return (
    <div className="space-y-7">

      {/* TOPIC FILTER PILLS */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          Filter by topic
        </p>
        <div className="flex flex-wrap gap-2.5">
          {INSIGHT_TOPICS.map((topic) => {
            const isActive = currentTopic === topic.slug
            const Icon = TOPIC_ICONS[topic.slug] || Globe
            return (
              <button
                key={topic.slug}
                onClick={() => handleTopic(topic.slug)}
                className={
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-150 " +
                  (isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-white text-slate-600 border-slate-300 hover:border-slate-900 hover:text-slate-900 hover:shadow-sm")
                }
              >
                <Icon
                  size={13}
                  className={isActive ? "text-blue-400" : "text-slate-400"}
                />
                {topic.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* SEARCH BAR */}
      <form onSubmit={handleSearch} className="relative max-w-lg">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search size={14} className="text-slate-400" />
        </div>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search articles by title or topic…"
          className="w-full pl-11 pr-12 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        {searchInput && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
          >
            <X size={12} />
          </button>
        )}
      </form>

      {/* Active search indicator */}
      {currentSearch && (
        <div className="inline-flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <span className="text-sm text-slate-600">
            Results for{" "}
            <span className="font-bold text-slate-900">&ldquo;{currentSearch}&rdquo;</span>
          </span>
          <button
            onClick={clearSearch}
            className="text-blue-600 hover:text-blue-700 text-sm font-bold transition-colors"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}
