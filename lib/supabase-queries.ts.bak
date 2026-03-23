// ============================================
// GLOBALPAYROLLEXPERT — SUPABASE QUERY FUNCTIONS
// Matches the real DB architecture: public.countries
// iso2 is the country code column
// coverage_level: full | partial | basic | none
// ============================================

import { createSupabaseServerClient } from './supabase'

// --- GET ALL COUNTRIES ---
// Returns all countries ordered alphabetically
// Used on the countries index page
export async function getAllCountries() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('countries')
    .select('id, iso2, iso3, name, currency, flag_emoji, region, coverage_level, payroll_complexity_score')
    .order('name', { ascending: true })

  if (error) {
    console.error('getAllCountries error:', error.message)
    return []
  }
  return data ?? []
}

// --- GET ALL COUNTRY CODES ---
// Returns iso2 codes for all countries — used for generateStaticParams
export async function getAllCountryCodes(): Promise<{ iso2: string }[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('countries')
    .select('iso2')
    .order('name', { ascending: true })

  if (error) {
    console.error('getAllCountryCodes error:', error.message)
    return []
  }
  return data ?? []
}

// --- GET SINGLE COUNTRY BY ISO2 CODE ---
// Returns one country by its 2-letter ISO code e.g. "GB"
export async function getCountryByCode(iso2: string) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('countries')
    .select('*')
    .eq('iso2', iso2.toUpperCase())
    .single()

  if (error) {
    console.error(`getCountryByCode(${iso2}) error:`, error.message)
    return null
  }
  return data
}

// --- GET COUNTRY COUNT ---
// Returns total number of countries — used for the count badge
export async function getCountryCount(): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const { count, error } = await supabase
    .from('countries')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('getCountryCount error:', error.message)
    return 0
  }
  return count ?? 0
}
