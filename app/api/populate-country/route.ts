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
  "work_permits": [
    // ALL main work permit types available for foreign employees in ${countryName}
    // MUST include at minimum: the primary skilled worker permit, EU Blue Card (if EU member), and ICT/intra-company transfer permit
    // Include any notable fast-track or points-based routes
    // Fields:
    //   permit_type (string): official name of the permit e.g. "Skilled Worker Visa", "EU Blue Card", "H-1B Visa"
    //   processing_days_min (integer): minimum processing time in calendar days
    //   processing_days_max (integer): maximum processing time in calendar days
    //   cost_local_currency (number or null): application fee in local currency - null if no standard fee
    //   currency_code (string or null): currency code for the cost - null if no fee
    //   validity_months (integer or null): validity period in months - null if permanent/indefinite
    //   renewable (boolean): true if the permit can be renewed
    //   requires_employer_sponsor (boolean): true if an employer must sponsor the application
    //   quota_system (boolean): true if a quota or cap limits the number of permits issued
    //   official_url (string): official government immigration authority URL
    //   notes (string): comprehensive description including salary thresholds, eligibility criteria, labour market test requirements, and pathway to permanent residence
  ],
  "contractor_rules": {
    // EXACTLY ONE object with contractor classification rules for ${countryName}
    // Fields:
    //   classification_test (string): name and description of the test used to determine contractor vs employee status
    //   key_factors (array of strings): list of key factors considered in the classification test
    //   misclassification_penalty (string): description of penalties for misclassifying employees as contractors
    //   deemed_employment_threshold (string): description of thresholds or conditions that trigger employment presumption
    //   platform_worker_law (string or null): description of any platform/gig worker specific legislation
    //   ir35_equivalent (string or null): description of any IR35-equivalent off-payroll working rules
    //   safe_harbour_criteria (string): conditions under which a contractor arrangement is considered safe
    //   official_url (string): official government or authority URL
    //   notes (string): comprehensive explanation of the contractor classification landscape including key cases and enforcement priorities
  },
  "expense_rules": [
    // ALL key employer expense reimbursement rules for ${countryName}
    // MUST include at minimum: mileage/vehicle, meal allowance, and home office
    // Include professional development if a specific tax exemption exists
    // Fields:
    //   expense_type (string): clear name e.g. "Mileage / Motor vehicle allowance", "Meal allowance", "Home office allowance"
    //   tax_treatment (string): MUST be one of exactly: fully_exempt | partially_exempt | fully_taxable
    //   exempt_amount (number or null): the exempt threshold amount - null if no fixed amount
    //   exempt_currency (string or null): currency code for the exempt amount - null if no fixed amount
    //   mileage_rate_per_km (number or null): official tax-free rate per km - null if not applicable
    //   receipts_required (boolean): true if receipts must be provided to claim the exemption
    //   reporting_requirements (string): description of documentation and reporting obligations
    //   notes (string): comprehensive explanation including exact rates, thresholds, and key conditions
    //   source_url (string): official government or authority URL
  ],
  "remote_work_rules": {
    // EXACTLY ONE object with remote work and digital nomad rules for ${countryName}
    // Fields:
    //   pe_risk_threshold_days (integer or null): days after which permanent establishment risk arises for foreign employer - null if no income tax
    //   tax_liability_threshold_days (integer or null): days after which remote worker becomes tax liable in ${countryName} - null if no income tax
    //   social_security_implications (string): description of social security obligations for remote workers
    //   work_permit_required_after_days (integer or null): days after which a work permit is required - null if no threshold
    //   bilateral_agreements (array of strings): list of countries with bilateral social security or tax agreements relevant to remote work
    //   digital_nomad_visa_available (boolean): true if ${countryName} offers a dedicated digital nomad visa
    //   digital_nomad_visa_duration_months (integer or null): duration of digital nomad visa in months - null if not available
    //   digital_nomad_visa_requirements (string or null): key requirements for the digital nomad visa - null if not available
    //   notes (string): comprehensive explanation of remote work rules, special tax regimes, and key considerations for employers
    //   source_url (string): official government or authority URL
  },
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
  "salary_benchmarks": [
    // Salary benchmarks for key job families in ${countryName}
    // MUST include at minimum: software_engineering, finance_accounting, human_resources, sales_marketing
    // For each job family include junior, mid, and senior levels
    // Fields:
    //   job_family (string): MUST be one of: software_engineering | finance_accounting | human_resources | sales_marketing
    //   job_level (string): MUST be one of: junior | mid | senior | director | c_suite
    //   percentile_25 (number): 25th percentile annual salary in local currency
    //   percentile_50 (number): median annual salary in local currency
    //   percentile_75 (number): 75th percentile annual salary in local currency
    //   currency_code (string): local currency code e.g. "GBP", "USD", "EUR"
    //   benchmark_year (integer): use 2025
    //   tier (string): MUST be exactly "free"
    //   source (string): official or reputable salary data source name
  ],
  "regional_tax_rates": [
    // Regional, state, provincial, cantonal, or municipal tax rates for ${countryName}
    // Only include if ${countryName} has meaningful sub-national tax variation relevant to employers
    // Examples: US state income tax, Canadian provincial tax, Swiss cantonal tax, Australian state payroll tax, German trade tax by city
    // If ${countryName} has no significant regional tax variation (e.g. UK, Ireland, Singapore), return an empty array []
    // Fields:
    //   region_code (string): ISO-style code e.g. "US-CA", "CA-ON", "CH-ZG", "AU-NSW"
    //   region_name (string): full region name e.g. "California", "Ontario", "Zug", "New South Wales"
    //   tax_type (string): category e.g. "state_income_tax", "provincial_income_tax", "canton_tax", "state_payroll_tax", "municipal_trade_tax", "regional_income_tax", "municipal_additional_tax"
    //   rate (number): tax rate as a percentage e.g. 13.3 for 13.3%
    //   applies_above (number or null): income threshold above which this rate applies - null if flat rate
    //   applies_below (number or null): income ceiling - null if no upper limit
    //   currency_code (string or null): currency for the threshold amounts
    //   tax_year (integer): use 2025
    //   tier (string): MUST be exactly "free"
    //   notes (string): explanation including how this interacts with national tax and key employer implications
    //   source_url (string): official regional/state/cantonal tax authority URL
  ],
  "tax_credits": [
    // ALL main tax credits, allowances, and deductions available to employees and employers in ${countryName}
    // MUST include at minimum: personal allowance/basic exemption, employment credit/deduction, and any family or child credits
    // Fields:
    //   credit_type (string): category e.g. "personal_allowance", "employment_credit", "child_tax_credit", "standard_deduction"
    //   credit_name (string): official name e.g. "Personal Allowance", "Arbeidskorting", "Child Tax Credit"
    //   amount (number or null): fixed credit/allowance amount in local currency - null if percentage-based
    //   rate_percentage (number or null): percentage rate e.g. 10 for 10% deduction - null if fixed amount
    //   applies_to (string): who qualifies e.g. "all_employees", "low_income_workers", "married_couples", "per_child"
    //   income_threshold (number or null): income ceiling above which credit phases out - null if no threshold
    //   currency_code (string or null): currency code e.g. "GBP", "EUR" - null if no fixed amount
    //   tax_year (integer): tax year this applies to - use 2025
    //   tier (string): MUST be exactly "free"
    //   notes (string): clear explanation including phase-out rules, eligibility conditions, and practical impact
    //   source_url (string): official government tax authority URL
  ],
  "entity_setup": [
    // ALL main legal entity types available for foreign companies to establish in \${countryName}
    // MUST include at minimum: the primary subsidiary type (e.g. Limited Company, GmbH, SAS), Branch Office, and Representative Office where applicable
    // Fields:
    //   entity_type (string): official name e.g. "Private Limited Company", "Branch Office", "Representative Office"
    //   minimum_capital_local (number or null): minimum share capital in local currency - null if none required
    //   minimum_capital_usd (number or null): minimum share capital in USD equivalent - null if none required
    //   setup_timeline_days_min (integer or null): minimum days to incorporate
    //   setup_timeline_days_max (integer or null): maximum days to incorporate
    //   setup_cost_usd_approx (number or null): approximate total setup cost in USD including fees
    //   local_director_required (boolean): true if a local resident director is legally required
    //   local_shareholder_required (boolean): true if a local shareholder is legally required
    //   registered_address_required (boolean): true if a local registered address is required
    //   corporate_tax_rate (number or null): applicable corporate income tax rate as a percentage e.g. 25 for 25%
    //   withholding_tax_rate (number or null): standard dividend withholding tax rate as a percentage
    //   vat_rate (number or null): standard VAT/GST rate as a percentage
    //   vat_registration_threshold (number or null): annual turnover threshold in local currency above which VAT registration is mandatory
    //   annual_filing_requirements (array of strings): list of annual compliance obligations e.g. ["Annual accounts filing", "Corporate tax return", "Annual general meeting"]
    //   official_registry_url (string): official government company registry URL
    //   tier (string): MUST be exactly "free"
    //   notes (string): comprehensive description including liability protection, foreign ownership rules, repatriation of profits, and key advantages/disadvantages
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
    const required = ["tax_brackets","social_security","employment_rules","statutory_leave","public_holidays","filing_calendar","payroll_compliance","working_hours","termination_rules","pension_schemes","mandatory_benefits","health_insurance","payslip_requirements","record_retention","remote_work_rules","expense_rules","contractor_rules","work_permits","entity_setup","tax_credits","regional_tax_rates","salary_benchmarks"]
    const empty = required.filter(k => !parsed[k] || parsed[k].length === 0)
    if (empty.length > 0) {
      return NextResponse.json({ error: "AI returned empty arrays for: " + empty.join(", "), raw: textContent.slice(0, 800) }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: parsed })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Unknown error" }, { status: 500 })
  }
}
