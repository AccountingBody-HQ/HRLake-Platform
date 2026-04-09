import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const HRLAKE_TABLES = [
  "tax_brackets",
  "social_security",
  "employment_rules",
  "statutory_leave",
  "public_holidays",
  "filing_calendar",
  "payroll_compliance",
  "working_hours",
  "termination_rules",
  "pension_schemes",
]

export async function POST(req: NextRequest) {
  try {
    const { data, countryCode } = await req.json()
    if (!data || !countryCode) {
      return NextResponse.json({ error: "Missing data or countryCode" }, { status: 400 })
    }

    const errors: string[] = []

    for (const table of HRLAKE_TABLES) {
      const rows = data[table]
      if (!rows || rows.length === 0) continue
      const rowsWithCode = rows.map((r: any) => ({ ...r, country_code: countryCode.toUpperCase() }))
      const { error } = await sb.schema("hrlake").from(table).insert(rowsWithCode)
      if (error) errors.push(table + ": " + error.message)
    }

    if (data.sources) {
      const sourceRows = Object.entries(data.sources).map(([cat, s]: [string, any]) => ({
        country_code: countryCode,
        data_category: cat,
        authority_name: s.authority_name,
        source_url: s.source_url,
        language: "en",
      }))
      const { error } = await sb.schema("hrlake").from("official_sources").upsert(sourceRows, { onConflict: "country_code,data_category" })
      if (error) errors.push("official_sources: " + error.message)
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: "Some inserts failed", details: errors }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Unknown error" }, { status: 500 })
  }
}
