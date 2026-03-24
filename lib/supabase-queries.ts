// ============================================
// GLOBALPAYROLLEXPERT — SUPABASE QUERY FUNCTIONS
// Schema: public (countries) + gpe (payroll data)
// Always filter gpe tables: is_current = true
// ============================================

import { createClient } from '@supabase/supabase-js'

function getPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function getAllCountries() {
  const supabase = getPublicClient()
  const { data, error } = await supabase
    .from('countries')
    .select('id, iso2, iso3, name, currency_code, flag_emoji, region, coverage_level, payroll_complexity_score')
    .order('name', { ascending: true })
  if (error) { console.error('getAllCountries error:', error.message); return [] }
  return data ?? []
}

export async function getAllCountryCodes(): Promise<{ iso2: string }[]> {
  // Uses basic client — no cookies — safe for generateStaticParams at build time
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await supabase
    .from('countries')
    .select('iso2')
    .order('name', { ascending: true })
  if (error) { console.error('getAllCountryCodes error:', error.message); return [] }
  return data ?? []
}

export async function getCountryByCode(iso2: string) {
  const supabase = getPublicClient()
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('iso2', iso2.toUpperCase())
    .single()
  if (error) { console.error('getCountryByCode error:', error.message); return null }
  return data
}

export async function getCountryCount(): Promise<number> {
  const supabase = getPublicClient()
  const { count, error } = await supabase
    .from('countries')
    .select('*', { count: 'exact', head: true })
  if (error) { console.error('getCountryCount error:', error.message); return 0 }
  return count ?? 0
}

export async function getTaxBrackets(iso2: string, taxYear?: number) {
  const supabase = getPublicClient()
  let query = supabase
    .schema('gpe').from('tax_brackets')
    .select('*')
    .eq('country_code', iso2.toUpperCase())
    .eq('is_current', true)
    .order('bracket_order', { ascending: true })
  if (taxYear) { query = query.eq('tax_year', taxYear) }
  const { data, error } = await query
  if (error) { console.error('getTaxBrackets error:', error.message); return [] }
  return data ?? []
}

export async function getTaxYears(iso2: string): Promise<number[]> {
  const supabase = getPublicClient()
  const { data, error } = await supabase
    .schema('gpe').from('tax_brackets')
    .select('tax_year')
    .eq('country_code', iso2.toUpperCase())
    .eq('is_current', true)
    .order('tax_year', { ascending: false })
  if (error) { console.error('getTaxYears error:', error.message); return [] }
  const years = [...new Set((data ?? []).map((r: any) => r.tax_year).filter(Boolean))]
  return years
}

export async function getSocialSecurity(iso2: string) {
  const supabase = getPublicClient()
  const { data, error } = await supabase
    .schema('gpe').from('social_security')
    .select('*')
    .eq('country_code', iso2.toUpperCase())
    .eq('is_current', true)
  if (error) { console.error('getSocialSecurity error:', error.message); return [] }
  return data ?? []
}

export async function getEmploymentRules(iso2: string) {
  const supabase = getPublicClient()
  const { data, error } = await supabase
    .schema('gpe').from('employment_rules')
    .select('*')
    .eq('country_code', iso2.toUpperCase())
    .eq('is_current', true)
  if (error) { console.error('getEmploymentRules error:', error.message); return null }
  if (!data || data.length === 0) return null
  // Transform array of rule rows into keyed object
  const rules: Record<string, any> = {}
  for (const row of data) { rules[row.rule_type] = row }
  return {
    minimum_wage:         rules['minimum_wage']?.value_numeric ?? null,
    annual_leave_days:    rules['annual_leave']?.value_numeric ?? null,
    sick_leave_days:      rules['sick_leave']?.value_numeric ?? null,
    notice_period_days:   rules['notice_period_min']?.value_numeric ?? null,
    probation_period_days: rules['probation_period_max']?.value_numeric ?? null,
    maternity_leave_weeks: rules['maternity_leave']?.value_numeric ?? null,
    paternity_leave_weeks: rules['paternity_leave']?.value_numeric ?? null,
    overtime_rate:        rules['overtime_rate']?.value_numeric ?? null,
    payroll_frequency:    rules['minimum_wage']?.value_unit ?? null,
    thirteenth_month_pay: !!rules['thirteenth_month_pay'],
    working_hours_max:    rules['working_hours_max']?.value_numeric ?? null,
  }
}

export async function getPayrollCompliance(iso2: string) {
  const supabase = getPublicClient()
  const { data, error } = await supabase
    .schema('gpe').from('payroll_compliance')
    .select('*')
    .eq('country_code', iso2.toUpperCase())
    .eq('is_current', true)
    .order('obligation_type', { ascending: true })
  if (error) { console.error('getPayrollCompliance error:', error.message); return [] }
  return data ?? []
}

export async function getRelatedCountries(iso2: string, region: string) {
  const supabase = getPublicClient()
  const { data, error } = await supabase
    .from('countries')
    .select('id, iso2, name, flag_emoji, currency_code, region, coverage_level, payroll_complexity_score')
    .eq('region', region)
    .neq('iso2', iso2.toUpperCase())
    .limit(4)
  if (error) { console.error('getRelatedCountries error:', error.message); return [] }
  return data ?? []
}
