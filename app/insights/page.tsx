// ============================================
// GLOBALPAYROLLEXPERT — INSIGHTS LISTING PAGE
// /insights/ — Premium design, no dates, 9 per page
// ============================================

import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BookOpen, Layers } from "lucide-react"
import { getInsightArticles, getInsightCount } from "@/lib/sanity"
import { getBreadcrumbStructuredData, jsonLd } from "@/lib/structured-data"
import InsightsClient from "./InsightsClient"
import EmailCapture from "@/components/EmailCapture"

// --- METADATA ---
export const metadata: Metadata = {
  title: "Insights — Global Payroll Analysis & Intelligence",
  description:
    "Expert analysis on global payroll, employment law, EOR strategy, tax compliance, and HR policy. In-depth articles for payroll professionals and global employers.",
  alternates: {
    canonical: "https://globalpayrollexpert.com/insights/",
  },
  openGraph: {
    title: "Insights — Global Payroll Analysis & Intelligence",
    description:
      "Expert analysis on global payroll, employment law, EOR strategy, tax compliance, and HR policy.",
    url: "https://globalpayrollexpert.com/insights/",
    type: "website",
  },
}

// --- CATEGORY ACCENT COLOURS ---
const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  payroll:          { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500" },
  "employment law": { bg: "bg-indigo-50",  text: "text-indigo-700",  dot: "bg-indigo-500" },
  "employment-law": { bg: "bg-indigo-50",  text: "text-indigo-700",  dot: "bg-indigo-500" },
  eor:              { bg: "bg-sky-50",     text: "text-sky-700",     dot: "bg-sky-500" },
  tax:              { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  hr:               { bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-500" },
  compliance:       { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500" },
  "country report": { bg: "bg-teal-50",   text: "text-teal-700",    dot: "bg-teal-500" },
  "country-report": { bg: "bg-teal-50",   text: "text-teal-700",    dot: "bg-teal-500" },
}

function getCategoryStyle(category: string | null) {
  if (!category) return { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" }
  return CATEGORY_STYLES[category.toLowerCase()] || { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" }
}

// --- PAGE ---
export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; q?: string; page?: string }>
}) {
  const params = await searchParams
  const topic = params.topic || "all"
  const search = params.q || ""
  const page = parseInt(params.page || "1", 10)
  const perPage = 9
  const offset = (page - 1) * perPage

  const [articles, totalCount] = await Promise.all([
    getInsightArticles({ topic, search, limit: perPage, offset }),
    getInsightCount({ topic, search }),
  ])

  const totalPages = Math.ceil(totalCount / perPage)

  const breadcrumbData = getBreadcrumbStructuredData([
    { name: "Home", href: "/" },
    { name: "Insights", href: "/insights/" },
  ])

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbData) }}
      />

      {/* ══════ HEADER ══════ */}
      <section className="relative bg-slate-950 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 0% 100%, rgba(14,30,80,0.4) 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
              <BookOpen size={13} className="text-blue-400" />
              <span className="text-blue-300 text-xs font-semibold tracking-wide">
                Intelligence &amp; Analysis
              </span>
            </div>
            <h1
              className="font-serif text-4xl lg:text-6xl font-bold text-white leading-[1.08] mb-6"
              style={{ letterSpacing: "-0.025em" }}
            >
              Global payroll<br />
              <span className="text-blue-400">insights.</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
              Expert analysis on payroll regulations, employment law changes, EOR
              strategy, tax compliance, and HR policy across 195 jurisdictions.
            </p>
          </div>

          {/* Stat strip */}
          <div className="mt-16 pt-10 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: "195", label: "Countries Covered" },
              { value: "Expert", label: "Verified Content" },
              { value: "Monthly", label: "New Analysis" },
              { value: "Free", label: "Full Access" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black text-white tracking-tight">{s.value}</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FILTERS + ARTICLES ══════ */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
          <InsightsClient />
        </div>
      </section>

      {/* ══════ ARTICLE GRID ══════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          {/* Article count */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
                <Layers size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {totalCount === 0
                    ? "No articles found"
                    : totalCount === 1
                    ? "1 article"
                    : totalCount + " articles"}
                </p>
                <p className="text-xs text-slate-500">
                  {search
                    ? `matching "${search}"`
                    : topic !== "all"
                    ? `in ${topic.replace("-", " ")}`
                    : "across all topics"}
                </p>
              </div>
            </div>
          </div>

          {/* Article grid */}
          {articles.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {articles.map((article, index) => {
                const catStyle = getCategoryStyle(article.category)
                return (
                  <Link
                    key={article._id}
                    href={"/insights/" + article.slug?.current + "/"}
                    className="group relative bg-white border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
                  >
                    {/* Coloured top accent */}
                    <div className={"h-1 " + catStyle.dot} />

                    <div className="p-7 flex flex-col flex-1">
                      {/* Category badge */}
                      {article.category && (
                        <div className="mb-5">
                          <span
                            className={
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest " +
                              catStyle.bg +
                              " " +
                              catStyle.text
                            }
                          >
                            <span className={"w-1.5 h-1.5 rounded-full " + catStyle.dot} />
                            {article.category}
                          </span>
                        </div>
                      )}

                      {/* Title */}
                      <h2 className="font-serif text-xl font-bold text-slate-900 leading-snug mb-4 group-hover:text-blue-700 transition-colors" style={{ letterSpacing: "-0.015em" }}>
                        {article.title}
                      </h2>

                      {/* Excerpt */}
                      {article.excerpt && (
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 flex-1">
                          {article.excerpt}
                        </p>
                      )}

                      {/* Read more */}
                      <div className="mt-7 pt-5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-blue-600 text-sm font-bold group-hover:text-blue-700 transition-colors">
                          Read article
                        </span>
                        <div className="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-600 flex items-center justify-center transition-all duration-300">
                          <ArrowRight
                            size={14}
                            className="text-blue-600 group-hover:text-white transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
                <BookOpen size={28} className="text-slate-400" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-slate-900 mb-3">
                No articles found
              </h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                {search
                  ? "Try a different search term or clear the filters to browse all articles."
                  : "Articles will appear here once published. Check back soon for expert payroll analysis."}
              </p>
            </div>
          )}

          {/* ══════ PAGINATION ══════ */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-1.5">
              {page > 1 && (
                <PaginationLink
                  page={page - 1}
                  topic={topic}
                  search={search}
                  label="Prev"
                  variant="text"
                />
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationLink
                  key={p}
                  page={p}
                  topic={topic}
                  search={search}
                  label={String(p)}
                  isActive={p === page}
                />
              ))}
              {page < totalPages && (
                <PaginationLink
                  page={page + 1}
                  topic={topic}
                  search={search}
                  label="Next"
                  variant="text"
                />
              )}
            </div>
          )}
        </div>
      </section>

      {/* ══════ EMAIL CAPTURE ══════ */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "#0d1f3c" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 80% 50%, rgba(30,111,255,0.12) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
                Stay Informed
              </p>
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight mb-6">
                Get the latest payroll
                <br />
                intelligence delivered.
              </h2>
              <p className="text-slate-400 leading-relaxed text-lg max-w-md">
                Rate changes, employment law updates, and compliance alerts — once
                a month, direct to your inbox.
              </p>
            </div>
            <div>
              <EmailCapture
                source="insights"
                variant="dark"
                title="Subscribe to updates"
                subtitle="Join thousands of payroll professionals."
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// --- PAGINATION LINK COMPONENT ---
function PaginationLink({
  page,
  topic,
  search,
  label,
  isActive,
  variant,
}: {
  page: number
  topic: string
  search: string
  label: string
  isActive?: boolean
  variant?: "text"
}) {
  const params = new URLSearchParams()
  if (topic && topic !== "all") params.set("topic", topic)
  if (search) params.set("q", search)
  if (page > 1) params.set("page", String(page))
  const qs = params.toString()
  const href = "/insights/" + (qs ? "?" + qs : "")

  if (variant === "text") {
    return (
      <Link
        href={href}
        className="px-4 py-2.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
      >
        {label}
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={
        "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all " +
        (isActive
          ? "bg-slate-900 text-white shadow-lg"
          : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50")
      }
    >
      {label}
    </Link>
  )
}
