"use client"

// ============================================
// INSIGHTS — CLIENT FILTER & SEARCH CONTROLS
// Premium design — uniform pills, polished search
// ============================================

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useCallback, useEffect } from "react"
import { Search, X, Globe, Calculator, Scale, Building2, Receipt, Users, ShieldCheck, FileText } from "lucide-react"
import { INSIGHT_TOPICS } from "@/lib/sanity"

const TOPIC_ICONS: Record<string, any> = {
  all: Globe,
  payroll: Calculator,
  "employment-law": Scale,
  eor: Building2,
  tax: Receipt,
  hr: Users,
  compliance: ShieldCheck,
  "country-report": FileText,
}

const TOPIC_COLORS: Record<string, { active: string; inactive: string }> = {
  all:              { active: "bg-blue-600 text-white border-blue-600 shadow-blue-600/25", inactive: "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-700" },
  payroll:          { active: "bg-blue-600 text-white border-blue-600 shadow-blue-600/25", inactive: "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-700" },
  "employment-law": { active: "bg-indigo-600 text-white border-indigo-600 shadow-indigo-600/25", inactive: "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-700" },
  eor:              { active: "bg-sky-600 text-white border-sky-600 shadow-sky-600/25", inactive: "bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:text-sky-700" },
  tax:              { active: "bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/25", inactive: "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:text-emerald-700" },
  hr:               { active: "bg-violet-600 text-white border-violet-600 shadow-violet-600/25", inactive: "bg-white text-slate-700 border-slate-200 hover:border-violet-300 hover:text-violet-700" },
  compliance:       { active: "bg-amber-600 text-white border-amber-600 shadow-amber-600/25", inactive: "bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:text-amber-700" },
  "country-report": { active: "bg-teal-600 text-white border-teal-600 shadow-teal-600/25", inactive: "bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:text-teal-700" },
}

export default function InsightsClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentTopic = searchParams.get("topic") || "all"
  const currentSearch = searchParams.get("q") || ""

  const [searchInput, setSearchInput] = useState(currentSearch)

  useEffect(() => {
    setSearchInput(currentSearch)
  }, [currentSearch])

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
    <div className="space-y-8">
      {/* TOPIC FILTER PILLS */}
      <div className="flex flex-wrap gap-2.5">
        {INSIGHT_TOPICS.map((topic) => {
          const isActive = currentTopic === topic.slug
          const Icon = TOPIC_ICONS[topic.slug] || Globe
          const colors = TOPIC_COLORS[topic.slug] || TOPIC_COLORS.all

          return (
            <button
              key={topic.slug}
              onClick={() => handleTopic(topic.slug)}
              className={
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 " +
                (isActive
                  ? colors.active + " shadow-lg"
                  : colors.inactive + " shadow-sm hover:shadow-md")
              }
            >
              <Icon size={15} className={isActive ? "opacity-90" : "opacity-50"} />
              {topic.label}
            </button>
          )
        })}
      </div>

      {/* SEARCH BAR */}
      <form onSubmit={handleSearch} className="relative max-w-lg">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center pointer-events-none">
          <Search size={14} className="text-slate-500" />
        </div>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search articles by title or topic…"
          className="w-full pl-14 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm hover:shadow-md transition-all"
        />
        {searchInput && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
          >
            <X size={12} />
          </button>
        )}
      </form>

      {/* Active search indicator */}
      {currentSearch && (
        <div className="inline-flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
          <span className="text-sm text-slate-600">
            Results for <span className="font-bold text-slate-900">&ldquo;{currentSearch}&rdquo;</span>
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
