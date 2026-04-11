import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCountryByCode } from '@/lib/supabase-queries'
import { ChevronRight, ArrowRight } from 'lucide-react'
import { createClient } from '@sanity/client'

export async function generateMetadata(
  { params }: { params: Promise<{ code: string }> }
): Promise<Metadata> {
  const { code } = await params
  const country = await getCountryByCode(code)
  if (!country) return { title: 'Not Found | HRLake' }
  return {
    title: `${country.name} HR & Payroll Insights | HRLake`,
    description: `Expert analysis, guides, and intelligence on HR, payroll, and employment law in ${country.name}. Updated regularly from official sources.`,
    alternates: { canonical: `https://hrlake.com/countries/${code.toLowerCase()}/insights/` },
  }
}

export default async function CountryInsightsPage(
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const iso2 = code.toUpperCase()
  const country = await getCountryByCode(iso2)
  if (!country) notFound()

  let articles: any[] = []
  try {
    const sanity = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      apiVersion: '2024-01-01',
      useCdn: true,
    })
    articles = await sanity.fetch(
      `*[_type == "article" && "hrlake" in showOnSites && $country in countries] | order(publishedAt desc) {
        title, slug, publishedAt, excerpt,
        "category": categories[0]->title
      }`,
      { country: iso2 }
    )
  } catch { articles = [] }

  return (
    <main className="bg-slate-50 flex-1">
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <Link href="/" className="hover:text-slate-700">Home</Link>
            <ChevronRight size={12} />
            <Link href="/countries/" className="hover:text-slate-700">Countries</Link>
            <ChevronRight size={12} />
            <Link href={`/countries/${code.toLowerCase()}/`} className="hover:text-slate-700">{country.name}</Link>
            <ChevronRight size={12} />
            <span className="text-slate-400">Insights</span>
          </nav>
          <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Intelligence</p>
          <h1 className="font-serif text-4xl font-bold text-slate-900 tracking-tight mb-2">
            {country.name} Insights
          </h1>
          <p className="text-slate-500 text-lg">
            Expert analysis on HR, payroll, EOR, and employment law in {country.name}.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        {articles.length === 0 ? (
          <div className="grid sm:grid-cols-3 gap-6">
            {[1,2,3].map(n => (
              <div key={n} className="bg-white border border-slate-200 rounded-2xl p-7 animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-1/3 mb-4" />
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-5 bg-slate-200 rounded w-1/2 mb-6" />
                <div className="h-3 bg-slate-200 rounded w-full mb-2" />
                <div className="h-3 bg-slate-200 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-6">
            {articles.map((article: any) => (
              <Link
                key={article.slug?.current}
                href={`/insights/${article.slug?.current}/`}
                className="group bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg rounded-2xl overflow-hidden transition-all duration-200"
              >
                <div className="h-1.5 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-7">
                  {article.category && (
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{article.category}</span>
                  )}
                  <h3 className="font-bold text-slate-900 text-lg mt-2 mb-3 leading-snug group-hover:text-blue-700 transition-colors">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">{article.excerpt}</p>
                  )}
                  {article.publishedAt && (
                    <p className="text-xs text-slate-400 mt-3">
                      {new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                  <div className="mt-5 flex items-center gap-1.5 text-blue-600 text-sm font-semibold group-hover:gap-2.5 transition-all">
                    Read article <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
