import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 120

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!

const TABLE_SCHEMAS: Record<string, string> = {
  tax_brackets: "bracket_name, lower_limit (numeric), upper_limit (numeric or null), rate (numeric %), bracket_order (int), is_current (true)",
  social_security: "contribution_type, employer_rate (numeric %), employee_rate (numeric %), applies_above (numeric or null), applies_below (numeric or null), is_current (true)",
  employment_rules: "rule_type (minimum_wage/annual_leave/sick_leave/maternity_leave/paternity_leave/probation_period/notice_period/13th_month), value_numeric (numeric or null), value_text (text or null), value_unit (days/weeks/months/per_hour), is_current (true)",
  statutory_leave: "leave_type, minimum_days (int), maximum_days (int or null), is_paid (bool), payment_rate (numeric %)",
  public_holidays: "holiday_name, holiday_date (YYYY-MM-DD), is_mandatory (bool)",
  filing_calendar: "filing_type, frequency (Monthly/Quarterly/Annual), due_day (int), due_month (int or null)",
  payroll_compliance: "description, frequency, deadline_description",
  working_hours: "standard_hours_per_week (numeric), maximum_hours_per_week (numeric), overtime_rate_multiplier (numeric e.g. 1.5)",
  termination_rules: "notice_period_min_days (int), severance_mandatory (bool), probation_period_max_months (int)",
  pension_schemes: "scheme_name, employer_rate (numeric %), employee_rate (numeric %), is_mandatory (bool)",
}

export async function POST(req: NextRequest) {
  try {
    const { countryCode, countryName, currencyCode } = await req.json()
    if (!countryCode || !countryName) {
      return NextResponse.json({ error: "Missing countryCode or countryName" }, { status: 400 })
    }

    const tableList = Object.entries(TABLE_SCHEMAS)
      .map(([k, v], i) => String(i + 1) + ". " + k + " — country_code: " + countryCode + ". Fields: " + v)
      .join(String.fromCharCode(10))

    const prompt = [
      "You are an expert HR and payroll data researcher. Research and return ALL employment and payroll data for " + countryName + " (" + countryCode + ", currency: " + currencyCode + ").",
      "Search official government websites for every data point. Use web_search for each category.",
      "Return ONLY a valid JSON object with these top-level keys: tax_brackets, social_security, employment_rules, statutory_leave, public_holidays, filing_calendar, payroll_compliance, working_hours, termination_rules, pension_schemes, sources.",
      "The sources key must be an object with one entry per table key, each having authority_name and source_url.",
      "TABLE SCHEMAS (every record must include country_code: " + countryCode + "):",
      tableList,
      "RULES: numeric values are plain numbers only (no % no symbols). Dates: YYYY-MM-DD. List ALL public holidays. working_hours and termination_rules are single records. Return ONLY the JSON object with no markdown or code blocks.",
    ].join(String.fromCharCode(10) + String.fromCharCode(10))

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 16000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: prompt }],
      }),
    })

    const data = await response.json()

    const textContent = (data.content ?? [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("")

    if (!textContent) {
      return NextResponse.json({ error: "No text response from AI", raw: data }, { status: 500 })
    }

    let parsed: any
    try {
      const clean = textContent.replace(/^[\s\S]*?({)/, "$1").replace(/}[\s\S]*$/, "}").trim()
      parsed = JSON.parse(clean)
    } catch {
      try {
        parsed = JSON.parse(textContent.trim())
      } catch {
        return NextResponse.json({ error: "Failed to parse AI JSON", raw: textContent.slice(0, 500) }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, data: parsed })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Unknown error" }, { status: 500 })
  }
}
