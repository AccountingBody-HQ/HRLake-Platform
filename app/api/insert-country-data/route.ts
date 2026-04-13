import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const HRLAKE_TABLES = [
  "tax_brackets", "social_security", "employment_rules", "statutory_leave",
  "public_holidays", "filing_calendar", "payroll_compliance", "working_hours",
  "termination_rules", "pension_schemes",
  "mandatory_benefits", "health_insurance", "record_retention",
  "expense_rules", "work_permits", "tax_credits",
  "regional_tax_rates", "salary_benchmarks", "government_benefit_payments",
  "entity_setup",
]
// Premium tables where AI returns a single object — wrap in array before insert
const PREMIUM_OBJECT_TABLES = new Set(["payslip_requirements", "remote_work_rules", "contractor_rules"])

const LEAVE_TYPE_MAP: Record<string, string> = {
  annual_leave: "annual", annual: "annual",
  sick_leave: "sick", sick: "sick",
  maternity_leave: "maternity", maternity: "maternity",
  paternity_leave: "paternity", paternity: "paternity",
  parental_leave: "parental", parental: "parental",
  bereavement_leave: "bereavement", bereavement: "bereavement",
}

const FREQUENCY_MAP: Record<string, string> = {
  Monthly: "monthly", monthly: "monthly",
  Quarterly: "quarterly", quarterly: "quarterly",
  Annual: "annual", annual: "annual", Annually: "annual",
  Weekly: "monthly", weekly: "monthly",
}

function applyDefaults(table: string, row: any, countryCode: string) {
  const base = {
    tax_year: 2025,
    valid_from: "2025-01-01",
    is_current: true,
    tier: "free",
    ...row,
    country_code: countryCode.toUpperCase(),
  }
  if (table === "tax_brackets") return { currency_code: "USD", ...base }
  if (table === "social_security") return { currency_code: "USD", ...base }
  if (table === "statutory_leave") return { ...base, leave_type: LEAVE_TYPE_MAP[row.leave_type] ?? row.leave_type }
  if (table === "filing_calendar") return { ...base, frequency: FREQUENCY_MAP[row.frequency] ?? row.frequency.toLowerCase() }
  if (table === "payroll_compliance") return { compliance_type: "payroll", ...base }
  if (table === "public_holidays") return { year: 2025, tier: "free", is_mandatory: true, ...row, country_code: countryCode.toUpperCase() }
  if (table === "salary_benchmarks") {
    const r = { ...base, benchmark_year: 2025 }
    delete (r as any).tax_year
    return r
  }
  if (table === "entity_setup") {
    const r = { ...base }
    delete (r as any).tax_year
    return r
  }
  return base
}

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
      // Delete existing rows for this country first
      const { error: delError } = await sb.schema("hrlake").from(table).delete().eq("country_code", countryCode.toUpperCase())
      if (delError) errors.push(table + " (delete): " + delError.message)
      const rowsWithDefaults = rows.map((r: any) => applyDefaults(table, r, countryCode))
      const { error } = await sb.schema("hrlake").from(table).insert(rowsWithDefaults)
      if (error) errors.push(table + ": " + error.message)
    }
    // Premium object tables — AI returns a single object, wrap in array before insert
    for (const table of PREMIUM_OBJECT_TABLES) {
      const raw = data[table]
      if (!raw) continue
      const rows = Array.isArray(raw) ? raw : [raw]
      const { error: delError } = await sb.schema("hrlake").from(table).delete().eq("country_code", countryCode.toUpperCase())
      if (delError) errors.push(table + " (delete): " + delError.message)
      const rowsWithDefaults = rows.map((r: any) => applyDefaults(table, r, countryCode))
      const { error } = await sb.schema("hrlake").from(table).insert(rowsWithDefaults)
      if (error) errors.push(table + ": " + error.message)
    }

    if (data.sources) {
      const sourceRows = Object.entries(data.sources).map(([cat, s]: [string, any]) => ({
        country_code: countryCode.toUpperCase(),
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
