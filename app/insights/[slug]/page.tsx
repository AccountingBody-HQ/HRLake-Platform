import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PortableText } from "@portabletext/react"
import { ArrowLeft, ArrowRight, Calendar, Clock, Globe, Tag, User } from "lucide-react"
import { getInsightBySlug, getRelatedArticles, urlFor } from "@/lib/sanity"
import { getArticleStructuredData, getBreadcrumbStructuredData, jsonLd } from "@/lib/structured-data"
import EmailCapture from "@/components/EmailCapture"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getInsightBySlug(slug)
  if (!article) return { title: "Article Not Found" }

  return {
    title: article.title,
    description: article.excerpt || undefined,
    alternates: {
      canonical: (() => {
        const owner = article.canonicalOwner
        if (owner === 'AccountingBody') return "https://accountingbody.com/blog/" + slug + "/"
        if (owner === 'EthioTax') return "https://ethiotax.com/articles/" + slug + "/"
        return "https://hrlake.com/insights/" + slug + "/"
      })(),
    },
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      url: "https://hrlake.com/insights/" + slug + "/",
      type: "article",
      ...(article.publishedAt && { publishedTime: article.publishedAt }),
      ...(article.category && { section: article.category }),
      ...(article.mainImage && {
        images: [
          {
            url: urlFor(article.mainImage).width(1200).height(630).url(),
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt || undefined,
    },
  }
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return ""
  }
}

function estimateReadTime(body: any[]): number {
  if (!body) return 3
  const text = body
    .map((block: any) =>
      block._type === "block" && block.children
        ? block.children.map((c: any) => c.text || "").join(" ")
        : ""
    )
    .join(" ")
  const wordCount = text.split(" ").filter((w: string) => w.length > 0).length
  return Math.max(1, Math.ceil(wordCount / 220))
}



const portableTextComponents = {
  block: {
    h2: ({ children }: any) => (
      <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight mt-12 mb-4 leading-snug">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="font-serif text-xl font-bold text-slate-900 tracking-tight mt-10 mb-3 leading-snug">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="font-bold text-slate-900 mt-8 mb-2">{children}</h4>
    ),
    normal: ({ children }: any) => (
      <p className="text-slate-600 leading-[1.85] mb-5 text-[17px]">{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-600 pl-6 my-8 text-slate-700 italic leading-relaxed bg-blue-50/50 py-4 pr-4 rounded-r-xl">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc list-outside pl-6 mb-6 space-y-2 text-slate-600 leading-relaxed text-[17px]">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal list-outside pl-6 mb-6 space-y-2 text-slate-600 leading-relaxed text-[17px]">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => <li>{children}</li>,
    number: ({ children }: any) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-semibold text-slate-800">{children}</strong>
    ),
    em: ({ children }: any) => <em>{children}</em>,
    link: ({ value, children }: any) => {
      const href = value?.href || "#"
      if (href.startsWith("http")) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors">
            {children}
          </a>
        )
      }
      return (
        <a href={href} className="text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors">
          {children}
        </a>
      )
    },
    code: ({ children }: any) => (
      <code className="bg-slate-100 text-slate-800 text-sm px-1.5 py-0.5 rounded font-mono">
        {children}
      </code>
    ),
  },
  types: {
    image: ({ value }: any) => {
      if (!value?.asset) return null
      return (
        <figure className="my-10">
          <img
            src={urlFor(value).width(800).quality(90).url()}
            alt={value.alt || ""}
            className="w-full rounded-2xl shadow-sm"
            loading="lazy"
          />
          {value.caption && (
            <figcaption className="text-center text-sm text-slate-400 mt-3 italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
}

const COUNTRY_MAP: Record<string, { name: string; code: string }> = {
  GB: { name: "United Kingdom", code: "gb" },
  US: { name: "United States",  code: "us" },
  DE: { name: "Germany",        code: "de" },
  FR: { name: "France",         code: "fr" },
  NL: { name: "Netherlands",    code: "nl" },
  IE: { name: "Ireland",        code: "ie" },
  AU: { name: "Australia",      code: "au" },
  CA: { name: "Canada",         code: "ca" },
  SG: { name: "Singapore",      code: "sg" },
  AE: { name: "UAE",            code: "ae" },
  JP: { name: "Japan",          code: "jp" },
  SE: { name: "Sweden",         code: "se" },
  DK: { name: "Denmark",        code: "dk" },
  NO: { name: "Norway",         code: "no" },
  CH: { name: "Switzerland",    code: "ch" },
  BE: { name: "Belgium",        code: "be" },
  ES: { name: "Spain",          code: "es" },
  IT: { name: "Italy",          code: "it" },
  PT: { name: "Portugal",       code: "pt" },
  PL: { name: "Poland",         code: "pl" },
  IN: { name: "India",          code: "in" },
  BR: { name: "Brazil",         code: "br" },
  MX: { name: "Mexico",         code: "mx" },
  KR: { name: "South Korea",    code: "kr" },
  ZA: { name: "South Africa",   code: "za" },
  NG: { name: "Nigeria",        code: "ng" },
  KE: { name: "Kenya",          code: "ke" },
  EG: { name: "Egypt",          code: "eg" },
  SA: { name: "Saudi Arabia",   code: "sa" },
  IL: { name: "Israel",         code: "il" },
  ET: { name: "Ethiopia",       code: "et" },
  CN: { name: "China",          code: "cn" },
  HK: { name: "Hong Kong",      code: "hk" },
  NZ: { name: "New Zealand",    code: "nz" },
  AT: { name: "Austria",        code: "at" },
  FI: { name: "Finland",        code: "fi" },
}

export default async function InsightArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getInsightBySlug(slug)
  if (!article) notFound()

  const relatedArticles = await getRelatedArticles({
    currentSlug: slug,
    category: article.category,
    countries: article.countries,
  })

  const relatedCountries = (article.countries || [])
    .map((code: string) => COUNTRY_MAP[code.toUpperCase()])
    .filter(Boolean)

  const readTime = estimateReadTime(article.body || [])

  const articleStructuredData = getArticleStructuredData({
    title: article.title,
    slug,
    excerpt: article.excerpt || undefined,
    publishedAt: article.publishedAt || undefined,
    category: article.category || undefined,
    authorName: article.author?.name || undefined,
  })

  const breadcrumbData = getBreadcrumbStructuredData([
    { name: "Home",     href: "/"          },
    { name: "Insights", href: "/insights/" },
    { name: article.title, href: "/insights/" + slug + "/" },
  ])

  return (
    <div className="bg-white flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(articleStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbData) }}
      />

      {/* ══════ ARTICLE HEADER ══════ */}
      <section className="relative bg-slate-950 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 0% 100%, rgba(14,30,80,0.4) 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-20">
          <Link
            href="/insights/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors mb-10"
          >
            <ArrowLeft size={14} />
            All articles
          </Link>

          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {article.category && (
                <span className="inline-flex items-center gap-1.5 bg-blue-600/10 border border-blue-500/20 rounded-full px-3 py-1 text-xs font-bold text-blue-300 uppercase tracking-widest">
                  <Tag size={10} />
                  {article.category}
                </span>
              )}

            </div>

            <h1
              className="font-serif text-3xl lg:text-5xl font-bold text-white leading-tight mb-6"
              style={{ letterSpacing: "-0.025em" }}
            >
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
                {article.excerpt}
              </p>
            )}

            {article.author?.name && (
              <div className="flex items-center gap-3 mt-10 pt-8 border-t border-slate-800">
                {article.author.image ? (
                  <img
                    src={urlFor(article.author.image).width(44).height(44).url()}
                    alt={article.author.name}
                    className="w-11 h-11 rounded-full"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <User size={18} className="text-white" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{article.author.name}</p>
                  <p className="text-xs text-slate-500">HRLake Editorial</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════ ARTICLE BODY ══════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-[1fr_300px] gap-16">

            <article>
              {article.mainImage && (
                <figure className="mb-12">
                  <img
                    src={urlFor(article.mainImage).width(900).quality(90).url()}
                    alt={article.title}
                    className="w-full rounded-2xl shadow-sm"
                  />
                </figure>
              )}

              {article.body && (
                <PortableText
                  value={article.body}
                  components={portableTextComponents}
                />
              )}

              <div className="mt-16 pt-8 border-t border-slate-100">
                <Link
                  href="/insights/"
                  className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm font-semibold transition-colors"
                >
                  <ArrowLeft size={14} />
                  All articles
                </Link>
              </div>
            </article>

            {/* ══════ SIDEBAR ══════ */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">

                {relatedCountries.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Globe size={13} className="text-blue-600" />
                      Related Countries
                    </h3>
                    <div className="space-y-1">
                      {relatedCountries.map((country: any) => (
                        <Link
                          key={country.code}
                          href={"/countries/" + country.code + "/"}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all group"
                        >
                          <img
                            src={"https://flagcdn.com/20x15/" + country.code + ".png"}
                            alt={country.name}
                            width={20}
                            height={15}
                            className="rounded-sm"
                          />
                          <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700 transition-colors">
                            {country.name}
                          </span>
                          <ArrowRight size={12} className="ml-auto text-slate-300 group-hover:text-blue-500 transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">
                    Explore
                  </h3>
                  <div className="space-y-1">
                    {[
                      { label: "All Countries",       href: "/countries/"     },
                      { label: "Payroll Calculators", href: "/payroll-tools/" },
                      { label: "Compare Countries",   href: "/compare/"       },
                      { label: "EOR Intelligence",    href: "/eor/"           },
                      { label: "Employment Law",      href: "/hr-compliance/" },
                    ].map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all group"
                      >
                        <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700 transition-colors">
                          {link.label}
                        </span>
                        <ArrowRight size={12} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <span className="font-bold">Data disclaimer:</span> This article is for
                    informational purposes only. Always verify rates and obligations with
                    official sources or a qualified professional.
                  </p>
                </div>

              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ══════ RELATED ARTICLES ══════ */}
      {relatedArticles.length > 0 && (
        <section className="bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">
                  Keep reading
                </p>
                <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">
                  Related articles.
                </h2>
              </div>
              <Link
                href="/insights/"
                className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
              >
                All articles <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link
                  key={related._id}
                  href={"/insights/" + related.slug?.current + "/"}
                  className="group bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg rounded-2xl overflow-hidden transition-all duration-200 flex flex-col"
                >
                  <div className="h-1.5 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="p-7 flex flex-col flex-1">
                    {related.category && (
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                        {related.category}
                      </span>
                    )}
                    <h3 className="font-bold text-slate-900 text-lg mb-3 leading-snug group-hover:text-blue-700 transition-colors flex-1">
                      {related.title}
                    </h3>
                    {related.excerpt && (
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">
                        {related.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-blue-600 text-sm font-semibold group-hover:gap-2.5 transition-all">
                      Read article <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}


    </div>
  )
}
