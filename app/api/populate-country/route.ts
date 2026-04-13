import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 120

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!

export async function POST(req: NextRequest) {
  try {
    const { countryCode, countryName, currencyCode } = await req.json()
    if (!countryCode || !countryName) {
      return NextResponse.json({ error: "Missing countryCode or countryName" }, { status: 400 })
    }
    if (typeof countryCode !== 'string' || !/^[A-Za-z]{2,3}$/.test(countryCode)) {
      return NextResponse.json({ error: "Invalid countryCode format" }, { status: 400 })
    }
    if (currencyCode && (typeof currencyCode !== 'string' || !/^[A-Za-z]{3}$/.test(currencyCode))) {
      return NextResponse.json({ error: "Invalid currencyCode format" }, { status: 400 })
    }
    if (typeof countryName !== 'string' || countryName.length > 100) {
      return NextResponse.json({ error: "Invalid countryName" }, { status: 400 })
    }

    const prompt = `You are the world's most accurate HR, payroll and employment law data specialist. Your task is to return a complete, precise JSON dataset for ${countryName} (${countryCode}, currency: ${currencyCode}).

CRITICAL RULES - NEVER VIOLATE THESE:
1. Return ONLY a raw JSON object. No markdown. No code blocks. No explanation. No preamble. Start with { and end with }.
2. EVERY single array must contain real data. An empty array [] is a CRITICAL FAILURE. If you are unsure, use your best knowledge - never leave an array empty.
3. All numeric values must be plain numbers only. Never include %, currency symbols, or text in numeric fields.
4. Dates must be YYYY-MM-DD format.
5. Boolean fields must be true or false (not strings).

RETURN THIS EXACT JSON STRUCTURE:

{
  "tax_brackets": [
    // ALL income tax brackets for ${countryName} for the current tax year
    // MUST have at least 3-7 records covering the full income range
    // Fields: bracket_name (string), lower_limit (number), upper_limit (number or null for top bracket), rate (number, e.g. 20 for 20%), bracket_order (integer starting at 1)
  ],
  "social_security": [
    // ALL social security / national insurance contribution types
    // MUST include at minimum: employer contributions and employee contributions
    // Fields: contribution_type (string e.g. "Employer National Insurance"), employer_rate (number), employee_rate (number), applies_above (number or null), applies_below (number or null)
  ],
  "employment_rules": [
    // MUST include ALL of these rule_type values - one record each:
    // minimum_wage, annual_leave, sick_leave, maternity_leave, paternity_leave, probation_period_max, notice_period_min, overtime_rate, payroll_frequency
    // Fields: rule_type (string), value_numeric (number or null), value_text (string or null), value_unit (string: days/weeks/months/per_hour/multiplier)
    // For payroll_frequency: value_text = frequency (e.g. monthly, bi-weekly, weekly), value_numeric = null, value_unit = null
  ],
  "statutory_leave": [
    // MUST include ALL of these leave types - one record each:
    // annual_leave, sick_leave, maternity_leave, paternity_leave, parental_leave
    // Fields: leave_type (string), minimum_days (integer), maximum_days (integer or null), is_paid (boolean), payment_rate (number, e.g. 100 for full pay, 0 for unpaid)
  ],
  "public_holidays": [
    // ALL official public holidays in ${countryName} for 2025
    // MUST list every single public holiday - typically 8-15 holidays
    // Fields: holiday_name (string), holiday_date (YYYY-MM-DD), is_mandatory (boolean)
  ],
  "filing_calendar": [
    // ALL payroll and tax filing obligations for employers
    // MUST include at minimum: payroll tax filing, income tax filing, social security filing, annual employer return
    // Fields: filing_type (string), frequency (string: Monthly/Quarterly/Annual/Weekly), due_day (integer 1-31), due_month (integer 1-12 or null for monthly recurring)
  ],
  "payroll_compliance": [
    // ALL key employer payroll compliance obligations
    // MUST include at minimum: payslip requirements, payroll registration, year-end reporting, record keeping
    // Fields: description (string - full clear description), frequency (string), deadline_description (string)
  ],
  "working_hours": [
    // EXACTLY ONE record with standard working hours rules for ${countryName}
    // Fields: standard_hours_per_week (number), maximum_hours_per_week (number), overtime_rate_multiplier (number e.g. 1.5)
  ],
  "termination_rules": [
    // EXACTLY ONE record with termination rules for ${countryName}
    // Fields: notice_period_min_days (integer), severance_mandatory (boolean), probation_period_max_months (integer)
  ],
  "pension_schemes": [
    // ALL mandatory and major pension/retirement schemes in ${countryName}
    // MUST include at minimum 1 record for the main mandatory scheme
    // Fields: scheme_name (string), employer_rate (number), employee_rate (number), is_mandatory (boolean)
  ],
  "record_retention": [
    // ALL mandatory record retention requirements for employers in ${countryName}
    // MUST include at minimum: payroll records, employment contracts, and tax records
    // Include health/safety records and any country-specific records (e.g. right to work, I-9)
    // Fields:
    //   record_type (string): clear name e.g. "Payroll records", "Employment contracts"
    //   retention_years (integer): number of years records must be kept
    //   retention_basis (string): MUST be one of exactly: from_date_of_document | from_end_of_tax_year | from_termination
    //   secure_destruction_required (boolean): true if records must be securely destroyed after retention period
    //   digital_records_accepted (boolean): true if electronic records are legally valid
    //   regulator (string): name of the authority that enforces this requirement
    //   penalty_for_non_compliance (string): description of penalties for non-compliance
    //   official_url (string): official government or authority URL
    //   notes (string): clear explanation of the retention requirement and any notable conditions
  ],
  "payslip_requirements": {
    // EXACTLY ONE object (not an array) with payslip rules for ${countryName}
    // Fields:
    //   required_items (array of strings): list of all mandatory payslip line items under ${countryName} law
    //   format_requirements (string): MUST be one of exactly: paper | electronic | both
    //   delivery_deadline_days (integer): days after pay day employer must deliver payslip (0 = same day)
    //   retention_period_years (integer): years employer must retain payroll records
    //   employee_right_to_copy (boolean): true if employee has legal right to request a copy
    //   language_requirement (string): required language(s) for the payslip
    //   digital_signature_valid (boolean): true if electronic/digital payslips are legally valid
    //   official_url (string): official government or authority URL
    //   notes (string): clear explanation of key payslip obligations and any notable requirements
  },
  "health_insurance": [
    // ALL health insurance schemes in ${countryName} relevant to employers
    // MUST include the primary public health scheme AND any mandatory private schemes
    // Include optional private schemes if commonly provided by employers
    // Fields:
    //   scheme_name (string): official name e.g. "Medicare", "NHS", "GKV"
    //   scheme_type (string): MUST be one of exactly: public | private_mandatory | private_optional
    //   employer_rate_percentage (number or null): employer contribution as % of salary - null if flat or not applicable
    //   employee_rate_percentage (number or null): employee contribution as % of salary - null if flat or not applicable
    //   employer_flat_amount (number or null): fixed employer amount per period - null if percentage based
    //   employee_flat_amount (number or null): fixed employee amount per period - null if percentage based
    //   applies_above_employees (integer or null): minimum company size threshold - null if no threshold
    //   is_mandatory (boolean): true if legally required
    //   opt_out_conditions (string or null): conditions under which opting out is permitted - null if no opt-out
    //   government_scheme_url (string): official government or authority URL
    //   notes (string): clear explanation including rates, conditions, and coverage details
  ],
  "mandatory_benefits": [
    // ALL mandatory employer benefits in ${countryName}
    // MUST include at minimum: the primary social security / national insurance contribution, main pension scheme, and any mandatory insurance
    // Include every benefit that employers are legally required to provide or contribute to
    // Fields:
    //   benefit_name (string): clear name e.g. "Superannuation", "Employer National Insurance"
    //   benefit_type (string): MUST be one of exactly: cash | voucher | in_kind | leave
    //   calculation_method (string): MUST be one of exactly: fixed | percentage_of_salary | government_defined
    //   employer_cost_percentage (number or null): e.g. 11.5 for 11.5% - null if fixed amount or government_defined
    //   employer_cost_amount (number or null): fixed amount per period - null if percentage based
    //   frequency (string): MUST be one of exactly: monthly | quarterly | annual | one_off
    //   applies_to (string): e.g. "all_employees", "nationals", "expatriate_employees"
    //   tax_treatment (string): MUST be one of exactly: tax_exempt | taxable | partially_exempt
    //   notes (string): brief explanation including rate details and any conditions
    //   source_url (string): official government or authority URL
  ],
  "sources": {
    "tax_brackets": { "authority_name": "Official tax authority name", "source_url": "https://..." },
    "social_security": { "authority_name": "Official authority name", "source_url": "https://..." },
    "employment_rules": { "authority_name": "Official authority name", "source_url": "https://..." },
    "statutory_leave": { "authority_name": "Official authority name", "source_url": "https://..." },
    "public_holidays": { "authority_name": "Official authority name", "source_url": "https://..." },
    "filing_calendar": { "authority_name": "Official authority name", "source_url": "https://..." },
    "payroll_compliance": { "authority_name": "Official authority name", "source_url": "https://..." },
    "working_hours": { "authority_name": "Official authority name", "source_url": "https://..." },
    "termination_rules": { "authority_name": "Official authority name", "source_url": "https://..." },
    "pension_schemes": { "authority_name": "Official authority name", "source_url": "https://..." }
  }
}

ACCURACY REQUIREMENTS:
- Tax brackets: Use the exact current official rates from the tax authority of ${countryName}
- Social security: Use exact current official employer and employee contribution rates
- Minimum wage: Use the current official national minimum wage
- Leave entitlements: Use the statutory minimums from employment law
- Public holidays: List every official public holiday with exact 2025 dates
- Working hours: Use the legal maximum from the labour law
- Pension: Use the mandatory occupational/state pension contribution rates

Return the JSON now. Start immediately with {`

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
      let clean = textContent.trim()
      const fenceMatch = clean.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (fenceMatch) {
        clean = fenceMatch[1].trim()
      } else {
        const start = clean.indexOf("{")
        const end = clean.lastIndexOf("}")
        if (start !== -1 && end !== -1) clean = clean.slice(start, end + 1)
      }
      parsed = JSON.parse(clean)
    } catch {
      return NextResponse.json({ error: "Failed to parse AI JSON", raw: textContent.slice(0, 800) }, { status: 500 })
    }

    // Validate all required keys are present and non-empty
    const required = ["tax_brackets","social_security","employment_rules","statutory_leave","public_holidays","filing_calendar","payroll_compliance","working_hours","termination_rules","pension_schemes","mandatory_benefits","health_insurance","payslip_requirements","record_retention"]
    const empty = required.filter(k => !parsed[k] || parsed[k].length === 0)
    if (empty.length > 0) {
      return NextResponse.json({ error: "AI returned empty arrays for: " + empty.join(", "), raw: textContent.slice(0, 800) }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: parsed })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Unknown error" }, { status: 500 })
  }
}
