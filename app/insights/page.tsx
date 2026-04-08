import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BookOpen, Layers } from "lucide-react"
import { getInsightArticles, getInsightCount } from "@/lib/sanity"
import { getBreadcrumbStructuredData, jsonLd } from "@/lib/structured-data"
import InsightsClient from "./InsightsClient"
import EmailCapture from "@/components/EmailCapture"

export const metadata: Metadata = {
  title: "Insights — Global HR, EOR & Payroll Intelligence",
  description:
    "Expert analysis on global payroll, employment law, EOR strategy, tax compliance, and HR policy. In-depth articles for payroll professionals and global employers.",
  alternates: { canonical: "https://hrlake.com/insights/" },
  openGraph: {
    title: "Insights — Global HR, EOR & Payroll Intelligence",
    description: "Expert analysis on global payroll, employment law, EOR strategy, tax compliance, and HR policy.",
    url: "https://hrlake.com/insights/",
    type: "website",
  },
}

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
    <div className="flex-1 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbData) }}
      />

      {/* HEADER */}
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
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-blue-300 text-xs font-semibold tracking-wide">
                Intelligence &amp; Analysis
              </span>
            </div>
            <h1
              className="font-serif text-4xl lg:text-6xl font-bold text-white leading-[1.08] mb-6"
              style={{ letterSpacing: "-0.025em" }}
            >
              Global HR &amp; payroll<br />
              <span className="text-blue-400">insights.</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
              Expert analysis on payroll regulations, employment law changes, EOR
              strategy, tax compliance, and HR policy across 20 live countries and growing.
            </p>
          </div>
          <div className="mt-16 pt-10 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: "20",  label: "Countries Covered" },
              { value: "Expert",  label: "Verified Content"  },
              { value: "Monthly", label: "New Analysis"      },
              { value: "Free",    label: "Full Access"       },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black text-white tracking-tight">{s.value}</div>
                <div className="text-xs font-semibold text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <InsightsClient />
        </div>
      </section>

      {/* ARTICLE GRID */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">

          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
              <Layers size={14} className="text-white" />
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
                  ? "matching “" + search + "”"
                  : topic !== "all"
                  ? "in " + topic.replace("-", " ")
                  : "across all topics"}
              </p>
            </div>
          </div>

          {articles.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link
                  key={article._id}
                  href={"/insights/" + article.slug?.current + "/"}
                  className="group bg-white border border-slate-200 hover:border-blue-300 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col"
                >
                  <div className="h-1.5 bg-blue-600" />
                  <div className="p-7 flex flex-col flex-1">
                    {article.category && (
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
                        {article.category}
                      </span>
                    )}
                    <h2 className="font-bold text-slate-900 text-lg leading-snug mb-3 group-hover:text-blue-700 transition-colors">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">{article.excerpt}</p>
                    )}
                    <div className="mt-auto flex items-center gap-1.5 text-blue-600 text-sm font-semibold group-hover:gap-2.5 transition-all">
                      Read article <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
                <BookOpen size={24} className="text-slate-400" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-2">No articles found</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                {search
                  ? "Try a different search term or clear the filters to browse all articles."
                  : "Articles will appear here once published. Check back soon."}
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-1.5">
              {page > 1 && (
                <PaginationLink page={page - 1} topic={topic} search={search} label="Prev" variant="text" />
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
                <PaginationLink page={page + 1} topic={topic} search={search} label="Next" variant="text" />
              )}
            </div>
          )}
        </div>
      </section>


    </div>
  )
}

function PaginationLink({
  page, topic, search, label, isActive, variant,
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
      <Link href={href} className="px-4 py-2.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
        {label}
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={
        "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all " +
        (isActive
          ? "bg-slate-900 text-white shadow-md"
          : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400 hover:bg-slate-50")
      }
    >
      {label}
    </Link>
  )
}
