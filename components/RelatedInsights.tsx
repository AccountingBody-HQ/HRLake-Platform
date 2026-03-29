import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { sanityClient, type SanityArticleCard } from '@/lib/sanity'

interface Props {
  countryCode: string
  countryName: string
}

async function getRelatedArticles(countryCode: string): Promise<SanityArticleCard[]> {
  try {
    const articles = await sanityClient.fetch(
      `*[_type == "article" && "globalpayrollexpert" in showOnSites && $code in countries] | order(publishedAt desc)[0...3] {
        _id, title, slug, excerpt, publishedAt,
        "category": categories[0]->title,
        "categorySlug": categories[0]->slug.current
      }`,
      { code: countryCode.toUpperCase() }
    )
    return articles || []
  } catch {
    return []
  }
}

export default async function RelatedInsights({ countryCode, countryName }: Props) {
  const articles = await getRelatedArticles(countryCode)

  if (articles.length === 0) return null

  return (
    <section className="border-t border-slate-200 pt-12 mt-12">
      <div className="mb-8">
        <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-2">
          Intelligence
        </p>
        <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
          Latest analysis for {countryName}
        </h2>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Link
            key={article.slug?.current}
            href={`/insights/${article.slug?.current}/`}
            className="group bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg rounded-2xl overflow-hidden transition-all duration-200"
          >
            <div className="h-1.5 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="p-6">
              {article.category && (
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                  {article.category}
                </span>
              )}
              <h3 className="font-bold text-slate-900 text-base mt-2 mb-3 leading-snug group-hover:text-blue-700 transition-colors">
                {article.title}
              </h3>
              {article.excerpt && (
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                  {article.excerpt}
                </p>
              )}
              <div className="mt-4 flex items-center gap-1.5 text-blue-600 text-sm font-semibold group-hover:gap-2.5 transition-all">
                Read article <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <Link
          href="/insights/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
        >
          All articles <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  )
}
