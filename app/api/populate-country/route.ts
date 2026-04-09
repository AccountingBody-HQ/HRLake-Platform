import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 120

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!

const TABLE_SCHEMAS: Record<string, string> = {
  tax_brackets: "bracket_name (text), lower_limit (numeric), upper_limit (numeric or null if unlimited), rate (numeric percentage e.g. 20), bracket_order (int starting 1), is_current (true)",
  social_security: "contribution_type (text e.g. Employee or Employer), employer_rate (numeric %), employee_rate (numeric %), applies_above (numeric or null), applies_below (numeric or null), is_current (true)",
  employment_rules: "rule_type (text e.g. minimum_wage / annual_leave / sick_leave / maternity_leave / paternity_leave / probation_period / notice_period / 13th_month), value_numeric (numeric or null), value_text (text or null), value_unit (text e.g. days / weeks / months / per_hour), is_current (true)",
  statutory_leave: "leave_type (text), minimum_days (int), maximum_days (int or null), is_paid (bool), payment_rate (numeric % of salary e.g. 100)",
  public_holidays: "holiday_name (text), holiday_date (YYYY-MM-DD), is_mandatory (bool)",
  filing_calendar: "filing_type (text), frequency (text e.g. Monthly / Quarterly / Annual), due_day (int), due_month (int or null)",
  payroll_compliance: "description (text), frequency (text), deadline_description (text)",
  working_hours: "standard_hours_per_week (numeric), maximum_hours_per_week (numeric), overtime_rate_multiplier (numeric e.g. 1.5)",
  termination_rules: "notice_period_min_days (int), severance_mandatory (bool), probation_period_max_months (int)",
  pension_schemes: "scheme_name (text), employer_rate (numeric %), employee_rate (numeric %), is_mandatory (bool)",
}

export async function POST(req: NextRequest) {
  try {
    const { countryCode, countryName, currencyCode } = await req.json()
      return NextResponse.json({ error: "Missing countryCode or countryName" }, { status: 400 })
    }

    const tableList = Object.entries(TABLE_SCHEMAS)
      .map(([k, v], i) => `${i + 1}. ${k} — include country_code:"${countryCode}" in every record. Fields: ${v}`)
      .join("\n")

    const prompt = `You are an expert HR and payroll data researcher. Research and return ALL employment and payroll data for ${countryName} (${countryCode}, currency: ${currencyCode}).

Search official government websites for every data point. Use web_search for each category.

Return ONLY a valid JSON object — no markdown, no code blocks, no explanation:

{
  "tax_brackets": [...],
  "social_security": [...],
  "employment_rules": [...],
  "statutory_leave": [...],
  "public_holidays": [...],
  "filing_calendar": [...],
  "payroll_compliance": [...],
  "working_hours": [...],
  "termination_rules": [...],
  "pension_schemes": [...],
  "sources": {
    "tax_brackets": { "authority_name": "...", "source_url": "..." },
    "social_security": { "authority_name": "...", "source_url": "..." },
    "employment_rules": { "authority_name": "...", "source_url": "..." },
    "statutory_leave": { "authority_name": "...", "source_url": "..." },
    "public_holidays": { "authority_name": "...", "source_url": "..." },
    "filing_calendar": { "authority_name": "...", "source_url": "..." },
    "payroll_compliance": { "authority_name": "...", "source_url": "..." },
    "working_hours": { "authority_name": "...", "source_url": "..." },
    "termination_rules": { "authority_name": "...", "source_url": "..." },
    "pension_schemes": { "authority_name": "...", "source_url": "..." }
  }
}

TABLE SCHEMAS (every record must include country_code: "${countryCode}"):
${tableList}

RULES:
- All numeric values: plain numbers only (no % no currency symbols)
- Dates: YYYY-MM-DD
- public_holidays: current year, list ALL public holidays
- working_hours and termination_rules: single record each
- Return ONLY the JSON object`

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

      return NextResponse.json({ error: "No text response from AI", raw: data }, { status: 500 })
    }

    let parsed: any
    try {
      const clean = textContent.replace(/```json
?/g, "").replace(/```
?/g, "").trim()
      parsed = JSON.parse(clean)
    } catch {
      return NextResponse.json({ error: "Failed to parse AI JSON", raw: textContent.slice(0, 1000) }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: parsed })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Unknown error" }, { status: 500 })
  }
}
