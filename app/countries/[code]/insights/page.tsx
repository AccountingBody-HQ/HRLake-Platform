import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCountryByCode } from '@/lib/supabase-queries'
import { ArrowRight, BookOpen, Layers } from 'lucide-react'
import { createClient } from '@sanity/client'
import CountrySubNav from '@/components/CountrySubNav'

export async function generateMetadata(
  { params }: { params: Promise<{ code: string }> }
): Promise<Metadata> {
  const { code } = await params
  const country = await getCountryByCode(code)
  if (!country) return { title: 'Not Found | HRLake' }
  return {
    title: `${country.name} HR & Payroll Insights | HRLake`,
    description: `Expert analysis on HR, payroll, EOR, and employment law in ${country.name}.`,
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
        _id, title, slug, publishedAt, excerpt,
        "category": categories[0]->title
      }`,
      { country: iso2 }
    )
  } catch { articles = [] }

  return (
    <main className="bg-slate-50 flex-1">
      <CountrySubNav code={code} countryName={country.name} />

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
            <Layers size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              {articles.length === 0
                ? "No articles yet"
                : articles.length === 1
                ? "1 article"
                : articles.length + " articles"}
            </p>
            <p className="text-xs text-slate-500">{country.name} intelligence</p>
          </div>
        </div>

        {articles.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: any) => (
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
                  {article.publishedAt && (
                    <p className="text-xs text-slate-400 mb-2">
                      {new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
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
            <h3 className="font-bold text-xl text-slate-900 mb-2">No articles yet for {country.name}</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
              Articles will appear here as they are published. Check back soon.
            </p>
            <Link
              href="/insights/"
              className="inline-flex items-center gap-2 mt-6 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
            >
              Browse all insights <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
