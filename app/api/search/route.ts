import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient as createSanityClient } from "@sanity/client"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim() ?? ""

  if (!q || q.length < 2) {
    return NextResponse.json({ countries: [], articles: [] })
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: countries, error: countriesError } = await supabase
    .from("countries")
    .select("iso2, name, flag_emoji, region, currency_code, coverage_level, payroll_complexity_score")
    .or(`name.ilike.%${q}%,iso2.ilike.%${q}%,iso3.ilike.%${q}%`)
    .order("name", { ascending: true })
    .limit(10)

  if (countriesError) {
    console.error("Supabase search error:", countriesError)
  }

  let articles: any[] = []
  try {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    if (projectId) {
      const sanity = createSanityClient({
        projectId,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
        apiVersion: "2024-01-01",
        useCdn: true,
      })
      articles = await sanity.fetch(
        `*[_type == "post"
          && "globalpayrollexpert" in showOnSites
          && (
            title match $query
            || pt::text(body) match $query
            || excerpt match $query
          )
        ] | order(publishedAt desc) [0...8] {
          title,
          "slug": slug.current,
          publishedAt,
          excerpt,
          "category": categories[0]->title
        }`,
        { query: `*${q}*` } as Record<string, unknown>
      )
    }
  } catch (err) {
    console.error("Sanity search error:", err)
    articles = []
  }

  return NextResponse.json({
    countries: countries ?? [],
    articles,
  })
}
