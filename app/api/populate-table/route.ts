import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 60

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!

const OBJECT_TABLES = new Set(["payslip_requirements","remote_work_rules","contractor_rules"])
const OPTIONAL_EMPTY = new Set(["regional_tax_rates"])

export const ALL_TABLE_KEYS = [
  "tax_brackets","social_security","employment_rules","statutory_leave",
  "public_holidays","filing_calendar","payroll_compliance","working_hours",
  "termination_rules","pension_schemes","mandatory_benefits","health_insurance",
  "payslip_requirements","record_retention","remote_work_rules","expense_rules",
  "contractor_rules","work_permits","entity_setup","tax_credits",
  "regional_tax_rates","salary_benchmarks","government_benefit_payments",
]

function buildPrompt(tableKey: string, countryName: string, countryCode: string, currencyCode: string): string {
  const year = new Date().getFullYear()
  const ctx = `You are the world's most accurate HR, payroll and employment law data specialist.
Task: Return ONLY the ${tableKey} data for ${countryName} (${countryCode}), currency: ${currencyCode}, year: ${year}.
CRITICAL: Return ONLY raw JSON. No markdown. No code blocks. No preamble. Start { end }.
Numbers: plain digits only — no %, no currency symbols. Dates: YYYY-MM-DD. Booleans: true/false not strings.
NEVER return an empty array for required tables — every table must have real, accurate data.

`
  const specs: Record<string, string> = {
    tax_brackets: `Return ALL income tax brackets for ${countryName} ${year}. Cover the full income range (typically 3-7 records). bracket_order starts at 1.
{"tax_brackets":[{"bracket_name":"Basic Rate","lower_limit":0,"upper_limit":50270,"rate":20,"bracket_order":1}],"sources":{"tax_brackets":{"authority_name":"Official tax authority","source_url":"https://..."}}}`,

    social_security: `Return ALL social security/national insurance contribution types for ${countryName} ${year}. Must include employer and employee contributions. Include caps where applicable.
{"social_security":[{"contribution_type":"Employer NI","employer_rate":13.8,"employee_rate":8,"applies_above":12570,"applies_below":null,"employer_cap_annual":null,"employee_cap_annual":null}],"sources":{"social_security":{"authority_name":"Official authority","source_url":"https://..."}}}`,

    employment_rules: `Return ALL of these rule_type values for ${countryName} — one record each: minimum_wage, annual_leave, sick_leave, maternity_leave, paternity_leave, probation_period_max, notice_period_min, overtime_rate, payroll_frequency.
For payroll_frequency: value_text=frequency word (monthly/bi-weekly/weekly), value_numeric=null, value_unit=null.
{"employment_rules":[{"rule_type":"minimum_wage","value_numeric":11.44,"value_text":null,"value_unit":"per_hour","is_current":true,"source_url":"https://..."}],"sources":{"employment_rules":{"authority_name":"Official authority","source_url":"https://..."}}}`,

    statutory_leave: `Return ALL of these leave types for ${countryName}: annual_leave, sick_leave, maternity_leave, paternity_leave, parental_leave. payment_rate: 100=full pay, 0=unpaid.
{"statutory_leave":[{"leave_type":"annual_leave","minimum_days":28,"maximum_days":28,"is_paid":true,"payment_rate":100,"is_current":true}],"sources":{"statutory_leave":{"authority_name":"Official authority","source_url":"https://..."}}}`,

    public_holidays: `Return ALL official public holidays in ${countryName} for ${year}. List every single holiday (typically 8-15). Include the year field on every record.
{"public_holidays":[{"holiday_name":"New Year Day","holiday_date":"${year}-01-01","is_mandatory":true,"year":${year}}],"sources":{"public_holidays":{"authority_name":"Official government","source_url":"https://..."}}}`,

    filing_calendar: `Return ALL employer payroll/tax filing obligations for ${countryName}. Include: payroll tax, income tax, social security, annual employer return. frequency must be: Monthly|Quarterly|Annual|Weekly.
{"filing_calendar":[{"filing_type":"Monthly PAYE Return","frequency":"Monthly","due_day":19,"due_month":null,"tax_year":${year}}],"sources":{"filing_calendar":{"authority_name":"Official tax authority","source_url":"https://..."}}}`,

    payroll_compliance: `Return ALL key employer payroll compliance obligations for ${countryName}. Include: payslip requirements, payroll registration, year-end reporting, record keeping.
{"payroll_compliance":[{"description":"Full description of the obligation","frequency":"Monthly","deadline_description":"By 19th of the following month","tax_year":${year},"is_current":true}],"sources":{"payroll_compliance":{"authority_name":"Official authority","source_url":"https://..."}}}`,

    working_hours: `Return EXACTLY ONE record with working hours rules for ${countryName}.
{"working_hours":[{"standard_hours_per_week":37.5,"maximum_hours_per_week":48,"overtime_rate_multiplier":1.5,"is_current":true}],"sources":{"working_hours":{"authority_name":"Official authority","source_url":"https://..."}}}`,

    termination_rules: `Return EXACTLY ONE record with termination/dismissal rules for ${countryName}. severance_cap_months: max months capped by law — null if no statutory cap.
{"termination_rules":[{"notice_period_min_days":7,"severance_mandatory":false,"probation_period_max_months":6,"severance_cap_months":null,"is_current":true}],"sources":{"termination_rules":{"authority_name":"Official authority","source_url":"https://..."}}}`,

    pension_schemes: `Return ALL mandatory and major pension/retirement schemes in ${countryName}. At minimum 1 record for the main mandatory scheme.
{"pension_schemes":[{"scheme_name":"Workplace Pension","employer_rate":3,"employee_rate":5,"is_mandatory":true,"opt_out_allowed":true,"is_current":true}],"sources":{"pension_schemes":{"authority_name":"Official authority","source_url":"https://..."}}}`,

    mandatory_benefits: `Return ALL mandatory employer benefits in ${countryName}. benefit_type: cash|voucher|in_kind|leave. calculation_method: fixed|percentage_of_salary|government_defined. frequency: monthly|quarterly|annual|one_off. tax_treatment: tax_exempt|taxable|partially_exempt.
{"mandatory_benefits":[{"benefit_name":"Employer National Insurance","benefit_type":"cash","calculation_method":"percentage_of_salary","employer_cost_percentage":13.8,"employer_cost_amount":null,"frequency":"monthly","applies_to":"all_employees","tax_treatment":"taxable","notes":"string","source_url":"https://...","is_current":true}],"sources":{"mandatory_benefits":{"authority_name":"Official authority","source_url":"https://..."}}}`,

    health_insurance: `Return ALL health insurance schemes relevant to employers in ${countryName}. scheme_type must be exactly: public|private_mandatory|private_optional.
{"health_insurance":[{"scheme_name":"NHS","scheme_type":"public","employer_rate_percentage":null,"employee_rate_percentage":null,"employer_flat_amount":null,"employee_flat_amount":null,"applies_above_employees":null,"is_mandatory":true,"opt_out_conditions":null,"government_scheme_url":"https://...","notes":"string","is_current":true}],"sources":{"health_insurance":{"authority_name":"Official authority","source_url":"https://..."}}}`,

    payslip_requirements: `Return EXACTLY ONE object (not an array) with payslip rules for ${countryName}. format_requirements must be exactly: paper|electronic|both.
{"payslip_requirements":{"required_items":["Gross pay","Tax deducted","Net pay"],"format_requirements":"electronic","delivery_deadline_days":0,"retention_period_years":3,"employee_right_to_copy":true,"language_requirement":"English","digital_signature_valid":true,"official_url":"https://...","notes":"string","is_current":true},"sources":{"payslip_requirements":{"authority_name":"Official authority","source_url":"https://..."}}}`,

    record_retention: `Return ALL mandatory record retention requirements for employers in ${countryName}. Include: payroll records, employment contracts, tax records, health and safety records. retention_basis MUST be exactly one of: from_date_of_document|from_end_of_tax_year|from_termination.
{"record_retention":[{"record_type":"Payroll records","retention_years":3,"retention_basis":"from_end_of_tax_year","secure_destruction_required":true,"digital_records_accepted":true,"regulator":"HMRC","penalty_for_non_compliance":"Fine up to 3000","official_url":"https://...","notes":"string","is_current":true}],"sources":{"record_retention":{"authority_name":"Official authority","source_url":"https://..."}}}`,

    remote_work_rules: `Return EXACTLY ONE object (not an array) with remote work and digital nomad rules for ${countryName}.
{"remote_work_rules":{"pe_risk_threshold_days":183,"tax_liability_threshold_days":183,"social_security_implications":"string","work_permit_required_after_days":null,"bilateral_agreements":["Germany","France"],"digital_nomad_visa_available":false,"digital_nomad_visa_duration_months":null,"digital_nomad_visa_requirements":null,"notes":"string","source_url":"https://...","is_current":true},"sources":{"remote_work_rules":{"authority_name":"Official authority","source_url":"https://..."}}}`,

    expense_rules: `Return ALL key employer expense reimbursement rules for ${countryName}. Include: mileage, meal allowance, home office, professional development. tax_treatment MUST be exactly: fully_exempt|partially_exempt|fully_taxable.
{"expense_rules":[{"expense_type":"Mileage allowance","tax_treatment":"fully_exempt","exempt_amount":null,"exempt_currency":null,"mileage_rate_per_km":0.25,"receipts_required":false,"reporting_requirements":"string","notes":"string","source_url":"https://...","is_current":true}],"sources":{"expense_rules":{"authority_name":"Official authority","source_url":"https://..."}}}`,

    contractor_rules: `Return EXACTLY ONE object (not an array) with contractor classification rules for ${countryName}.
{"contractor_rules":{"classification_test":"Test name and description","key_factors":["Control","Substitution","Mutuality of obligation"],"misclassification_penalty":"Description of penalties","deemed_employment_threshold":"string","platform_worker_law":null,"ir35_equivalent":null,"safe_harbour_criteria":"string","official_url":"https://...","notes":"string","is_current":true},"sources":{"contractor_rules":{"authority_name":"Official authority","source_url":"https://..."}}}`,

    work_permits: `Return ALL main work permit types for foreign employees in ${countryName}. Include: primary skilled worker permit, EU Blue Card if EU member, intra-company transfer permit.
{"work_permits":[{"permit_type":"Skilled Worker Visa","processing_days_min":8,"processing_days_max":56,"cost_local_currency":719,"currency_code":"${currencyCode}","validity_months":60,"renewable":true,"requires_employer_sponsor":true,"quota_system":false,"official_url":"https://...","notes":"string","is_current":true}],"sources":{"work_permits":{"authority_name":"Official immigration authority","source_url":"https://..."}}}`,

    entity_setup: `Return ALL main legal entity types available in ${countryName}. Include: primary subsidiary type, Branch Office, Representative Office. tier must be exactly "free".
{"entity_setup":[{"entity_type":"Private Limited Company","minimum_capital_local":null,"minimum_capital_usd":null,"setup_timeline_days_min":1,"setup_timeline_days_max":3,"setup_cost_usd_approx":500,"local_director_required":false,"local_shareholder_required":false,"registered_address_required":true,"corporate_tax_rate":25,"withholding_tax_rate":0,"vat_rate":20,"vat_registration_threshold":90000,"annual_filing_requirements":["Annual accounts filing","Corporation tax return"],"official_registry_url":"https://...","tier":"free","notes":"string","is_current":true}],"sources":{"entity_setup":{"authority_name":"Official company registry","source_url":"https://..."}}}`,

    tax_credits: `Return ALL main tax credits, allowances, and deductions for ${countryName} ${year}. Include: personal allowance, employment credit, child/family credits. tier must be exactly "free".
{"tax_credits":[{"credit_type":"personal_allowance","credit_name":"Personal Allowance","amount":12570,"rate_percentage":null,"applies_to":"all_employees","income_threshold":100000,"currency_code":"${currencyCode}","tax_year":${year},"tier":"free","notes":"string","source_url":"https://...","is_current":true}],"sources":{"tax_credits":{"authority_name":"Official tax authority","source_url":"https://..."}}}`,

    regional_tax_rates: `Return regional/state/cantonal tax rates for ${countryName} ONLY if it has meaningful sub-national tax variation (e.g. US states, Swiss cantons, Canadian provinces, Australian state payroll tax). If ${countryName} has NO significant regional tax variation (e.g. UK, Ireland, Singapore, New Zealand), return an EMPTY array []. tier must be exactly "free".
{"regional_tax_rates":[{"region_code":"US-CA","region_name":"California","tax_type":"state_income_tax","rate":13.3,"applies_above":null,"applies_below":null,"currency_code":"${currencyCode}","tax_year":${year},"tier":"free","notes":"string","source_url":"https://...","is_current":true}],"sources":{"regional_tax_rates":{"authority_name":"Official regional authority","source_url":"https://..."}}}`,

    salary_benchmarks: `Return salary benchmarks for ${countryName}. Include ALL of these job families: software_engineering, finance_accounting, human_resources, sales_marketing. Include junior, mid, and senior levels for each (12 records minimum). tier must be exactly "free".
{"salary_benchmarks":[{"job_family":"software_engineering","job_level":"junior","percentile_25":30000,"percentile_50":35000,"percentile_75":42000,"currency_code":"${currencyCode}","benchmark_year":${year},"tier":"free","source":"Official statistics authority","is_current":true}],"sources":{"salary_benchmarks":{"authority_name":"Official statistics authority","source_url":"https://..."}}}`,

    government_benefit_payments: `Return ALL statutory benefit payment schemes for ${countryName}. Include: sick pay, maternity, paternity, parental, unemployment. If a benefit does not exist include a record noting this. benefit_type: maternity|paternity|sick|parental|adoption|unemployment. paid_by: employer|government|split. tier must be exactly "free".
{"government_benefit_payments":[{"benefit_type":"sick","paid_by":"employer","employer_rate_percentage":null,"government_rate_percentage":null,"government_cap_weekly":109.40,"currency_code":"${currencyCode}","reclaim_mechanism":false,"reclaim_percentage":null,"waiting_days":3,"maximum_duration_weeks":28,"qualifying_period_weeks":null,"tax_year":${year},"tier":"free","notes":"string","source_url":"https://...","is_current":true}],"sources":{"government_benefit_payments":{"authority_name":"Official social security authority","source_url":"https://..."}}}`,
  }

  return ctx + (specs[tableKey] ?? `Return all ${tableKey} data for ${countryName} in JSON format with a sources key.`)
}

export async function POST(req: NextRequest) {
  try {
    const { countryCode, countryName, currencyCode, tableKey } = await req.json()

    if (!countryCode || !countryName || !currencyCode || !tableKey) {
      return NextResponse.json({ error: "Missing required fields: countryCode, countryName, currencyCode, tableKey" }, { status: 400 })
    }
    if (!/^[A-Za-z]{2,3}$/.test(countryCode)) {
      return NextResponse.json({ error: "Invalid countryCode format" }, { status: 400 })
    }
    if (!/^[A-Za-z]{3}$/.test(currencyCode)) {
      return NextResponse.json({ error: "Invalid currencyCode format" }, { status: 400 })
    }
    if (!ALL_TABLE_KEYS.includes(tableKey)) {
      return NextResponse.json({ error: `Unknown tableKey: ${tableKey}` }, { status: 400 })
    }

    const prompt = buildPrompt(tableKey, countryName, countryCode.toUpperCase(), currencyCode.toUpperCase())

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    })

    const aiData = await response.json()
    const textContent = (aiData.content ?? [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("")

    if (!textContent) {
      return NextResponse.json({ error: "No response from AI", raw: aiData }, { status: 500 })
    }

    let parsed: any
    try {
      let clean = textContent.trim()
      const fenceMatch = clean.match(/\`\`\`(?:json)?\s*([\s\S]*?)\`\`\`/)
      if (fenceMatch) {
        clean = fenceMatch[1].trim()
      } else {
        const start = clean.indexOf("{")
        const end = clean.lastIndexOf("}")
        if (start !== -1 && end !== -1) clean = clean.slice(start, end + 1)
      }
      parsed = JSON.parse(clean)
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response", raw: textContent.slice(0, 500) }, { status: 500 })
    }

    const tableData = parsed[tableKey]
    const sourceData = parsed.sources?.[tableKey] ?? null

    if (tableData === undefined || tableData === null) {
      return NextResponse.json({ error: `AI did not return data for ${tableKey}`, raw: textContent.slice(0, 500) }, { status: 500 })
    }
    if (OBJECT_TABLES.has(tableKey)) {
      if (typeof tableData !== "object" || Array.isArray(tableData) || Object.keys(tableData).length === 0) {
        return NextResponse.json({ error: `Invalid object returned for ${tableKey} — retry` }, { status: 500 })
      }
    } else if (!OPTIONAL_EMPTY.has(tableKey)) {
      if (!Array.isArray(tableData) || tableData.length === 0) {
        return NextResponse.json({ error: `Empty data returned for ${tableKey} — retry` }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, key: tableKey, data: tableData, source: sourceData })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Unknown error" }, { status: 500 })
  }
}
