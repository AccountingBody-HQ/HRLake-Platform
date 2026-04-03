// ============================================
// HRLAKE — SANITY CLIENT
// Connects to shared Sanity CMS project
// Filters all content to hrlake only
// ============================================

import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

// --- SANITY CLIENT ---
// Same Sanity project as AccountingBody — filtered by showOnSites
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

// --- IMAGE BUILDER ---
const builder = imageUrlBuilder(sanityClient)
export function urlFor(source: any) {
  return builder.image(source)
}

// --- TYPES ---
export interface SanityArticle {
  _id: string
  title: string
  slug: { current: string }
  publishedAt: string
  excerpt: string | null
  body: any[] // Portable Text blocks
  category: string | null
  categorySlug: string | null
  countries: string[]
  mainImage: any | null
  canonicalOwner: string | null
  author: {
    name: string
    image: any | null
  } | null
}

export interface SanityArticleCard {
  _id: string
  title: string
  slug: { current: string }
  publishedAt: string
  excerpt: string | null
  category: string | null
  categorySlug: string | null
}

// --- TOPIC FILTER CATEGORIES ---
export const INSIGHT_TOPICS = [
  { label: 'All',              slug: 'all' },
  { label: 'Payroll',          slug: 'payroll' },
  { label: 'Employment Law',   slug: 'employment-law' },
  { label: 'EOR',              slug: 'eor' },
  { label: 'Tax',              slug: 'tax' },
  { label: 'HR',               slug: 'hr' },
  { label: 'Compliance',       slug: 'compliance' },
  { label: 'Country Report',   slug: 'country-report' },
] as const

// =============================================
// QUERY FUNCTIONS
// =============================================

// --- GET ALL ARTICLES (listing page) ---
export async function getInsightArticles(options?: {
  topic?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<SanityArticleCard[]> {
  const { topic, search, limit = 24, offset = 0 } = options || {}

  const filters: string[] = [
    '_type == "article"',
    '"hrlake" in showOnSites',
  ]

  if (topic && topic !== 'all') {
    filters.push('references(*[_type == "category" && slug.current == $topic]._id)')
  }

  if (search) {
    filters.push('(title match $search || excerpt match $search)')
  }

  const filterString = filters.join(' && ')
  const rangeStart = offset
  const rangeEnd = offset + limit

  const query = `*[${filterString}] | order(publishedAt desc) [${rangeStart}...${rangeEnd}] {
    _id, title, slug, publishedAt, excerpt,
    "category": categories[0]->title,
    "categorySlug": categories[0]->slug.current
  }`

  try {
    const params: Record<string, string> = {}
    if (topic && topic !== 'all') params.topic = topic
    if (search) params.search = search + '*'

    return await sanityClient.fetch(query, params)
  } catch (error) {
    console.error('Failed to fetch insights:', error)
    return []
  }
}

// --- GET SINGLE ARTICLE (article page) ---
export async function getInsightBySlug(slug: string): Promise<SanityArticle | null> {
  const query = `*[_type == "article" && slug.current == $slug && "hrlake" in showOnSites][0] {
    _id, title, slug, publishedAt, excerpt, body,
    "category": categories[0]->title,
    "categorySlug": categories[0]->slug.current,
    "countries": coalesce(countries, []),
    canonicalOwner,
    mainImage,
    "author": author->{name, image}
  }`

  try {
    return await sanityClient.fetch(query, { slug })
  } catch (error) {
    console.error('Failed to fetch article:', error)
    return null
  }
}

// --- GET RELATED ARTICLES ---
export async function getRelatedArticles(options: {
  currentSlug: string
  category?: string | null
  countries?: string[]
  limit?: number
}): Promise<SanityArticleCard[]> {
  const { currentSlug, category, limit = 3 } = options

  let categoryFilter = ''
  if (category) {
    categoryFilter = ' && references(*[_type == "category" && title == $category]._id)'
  }

  const query = `*[_type == "article" && "hrlake" in showOnSites && slug.current != $currentSlug${categoryFilter}] | order(publishedAt desc) [0...${limit}] {
    _id, title, slug, publishedAt, excerpt,
    "category": categories[0]->title,
    "categorySlug": categories[0]->slug.current
  }`

  try {
    const params: Record<string, string> = { currentSlug }
    if (category) params.category = category

    const articles = await sanityClient.fetch(query, params)

    if (articles.length < limit) {
      const fallbackQuery = `*[_type == "article" && "hrlake" in showOnSites && slug.current != $currentSlug] | order(publishedAt desc) [0...${limit}] {
        _id, title, slug, publishedAt, excerpt,
        "category": categories[0]->title,
        "categorySlug": categories[0]->slug.current
      }`
      return await sanityClient.fetch(fallbackQuery, { currentSlug })
    }

    return articles
  } catch (error) {
    console.error('Failed to fetch related articles:', error)
    return []
  }
}

// --- GET TOTAL ARTICLE COUNT ---
export async function getInsightCount(options?: {
  topic?: string
  search?: string
}): Promise<number> {
  const { topic, search } = options || {}

  const filters: string[] = [
    '_type == "article"',
    '"hrlake" in showOnSites',
  ]

  if (topic && topic !== 'all') {
    filters.push('references(*[_type == "category" && slug.current == $topic]._id)')
  }

  if (search) {
    filters.push('(title match $search || excerpt match $search)')
  }

  const query = `count(*[${filters.join(' && ')}])`

  try {
    const params: Record<string, string> = {}
    if (topic && topic !== 'all') params.topic = topic
    if (search) params.search = search + '*'

    return await sanityClient.fetch(query, params)
  } catch (error) {
    console.error('Failed to fetch article count:', error)
    return 0
  }
}

// --- GET ALL CATEGORIES ---
export async function getInsightCategories(): Promise<{ title: string; slug: string }[]> {
  const query = `*[_type == "category" && count(*[_type == "article" && "hrlake" in showOnSites && references(^._id)]) > 0] | order(title asc) {
    title, "slug": slug.current
  }`

  try {
    return await sanityClient.fetch(query)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return []
  }
}
