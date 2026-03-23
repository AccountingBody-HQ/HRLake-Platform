// ============================================
// GLOBALPAYROLLEXPERT — SUPABASE QUERY FUNCTIONS
// Schema: public (countries) + gpe (payroll data)
// Always filter gpe tables: is_current = true
// ============================================

import { createSupabaseServerClient } from './supabase'

export async function getAllCountries() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('countries')
    .select('id, iso2, iso3, name, currency, flag_emoji, region, coverage_level, payroll_complexity_score')
    .order('name', { ascending: true })
  if (error) { console.error('getAllCountries error:', error.message); return [] }
  return data ?? []
}

export async function getAllCountryCodes(): Promise<{ iso2: string }[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('countries')
    .select('iso2')
    .order('name', { ascending: true })
  if (error) { console.error('getAllCountryCodes error:', error.message); return [] }
  return data ?? []
}

export async function getCountryByCode(iso2: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('iso2', iso2.toUpperCase())
    .single()
  if (error) { console.error('getCountryByCode error:', error.message); return null }
  return data
}

export async function getCountryCount(): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { count, error } = await supabase
    .from('countries')
    .select('*', { count: 'exact', head: true })
  if (error) { console.error('getCountryCount error:', error.message); return 0 }
  return count ?? 0
}

export async function getTaxBrackets(iso2: string, taxYear?: number) {
  const supabase = await createSupabaseServerClient()
  let query = supabase
    .from('gpe.tax_brackets')
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
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('gpe.tax_brackets')
    .select('tax_year')
    .eq('country_code', iso2.toUpperCase())
    .eq('is_current', true)
    .order('tax_year', { ascending: false })
  if (error) { console.error('getTaxYears error:', error.message); return [] }
  const years = [...new Set((data ?? []).map((r: any) => r.tax_year).filter(Boolean))]
  return years
}

export async function getSocialSecurity(iso2: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('gpe.social_security')
    .select('*')
    .eq('country_code', iso2.toUpperCase())
    .eq('is_current', true)
  if (error) { console.error('getSocialSecurity error:', error.message); return [] }
  return data ?? []
}

export async function getEmploymentRules(iso2: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('gpe.employment_rules')
    .select('*')
    .eq('country_code', iso2.toUpperCase())
    .eq('is_current', true)
    .single()
  if (error) { console.error('getEmploymentRules error:', error.message); return null }
  return data
}

export async function getPayrollCompliance(iso2: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('gpe.payroll_compliance')
    .select('*')
    .eq('country_code', iso2.toUpperCase())
    .eq('is_current', true)
    .order('obligation_type', { ascending: true })
  if (error) { console.error('getPayrollCompliance error:', error.message); return [] }
  return data ?? []
}

export async function getRelatedCountries(iso2: string, region: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('countries')
    .select('id, iso2, name, flag_emoji, currency, region, coverage_level, payroll_complexity_score')
    .eq('region', region)
    .neq('iso2', iso2.toUpperCase())
    .limit(4)
  if (error) { console.error('getRelatedCountries error:', error.message); return [] }
  return data ?? []
}
