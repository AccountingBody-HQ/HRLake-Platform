// ============================================
// GLOBALPAYROLLEXPERT — TYPESCRIPT TYPES
// Matches the Supabase schema built in Task 7
// ============================================

// --- COUNTRIES ---
export interface Country {
  id: string
  code: string               // ISO 3166-1 alpha-2 e.g. "GB"
  name: string
  flag_emoji: string
  currency_code: string      // e.g. "GBP"
  currency_symbol: string    // e.g. "£"
  region: string             // e.g. "Europe"
  status: 'active' | 'coming_soon' | 'draft'
  last_verified: string      // ISO date string
  official_source_url: string | null
  created_at: string
  updated_at: string
}

// --- PAYROLL TAX BRACKETS ---
export interface PayrollTaxBracket {
  id: string
  country_code: string
  tax_year: number
  min_income: number
  max_income: number | null  // null = no upper limit
  rate_percent: number
  bracket_label: string      // e.g. "Basic rate"
  created_at: string
}

// --- SOCIAL SECURITY ---
export interface SocialSecurity {
  id: string
  country_code: string
  contribution_type: 'employee' | 'employer'
  rate_percent: number
  cap_amount: number | null  // null = no cap
  description: string | null
  created_at: string
}

// --- EMPLOYMENT RULES ---
export interface EmploymentRules {
  id: string
  country_code: string
  minimum_wage: number | null
  minimum_wage_period: 'hourly' | 'monthly' | 'annual' | null
  annual_leave_days: number | null
  public_holidays: number | null
  notice_period_days: number | null
  probation_period_days: number | null
  overtime_rate: number | null        // e.g. 1.5 = time and a half
  payroll_frequency: string | null    // e.g. "Monthly"
  minimum_wage_unit: string | null    // e.g. "GBP_per_hour", "EUR_per_month"
  created_at: string
}

// --- PAYROLL COMPLIANCE ---
export interface PayrollCompliance {
  id: string
  country_code: string
  obligation_type: string       // e.g. "PAYE registration"
  description: string
  deadline: string | null
  authority_name: string | null
  authority_url: string | null
  created_at: string
}

// --- PROFILES (authenticated users) ---
export interface Profile {
  id: string                    // Clerk user ID
  email: string
  full_name: string | null
  plan: 'free' | 'pro'
  created_at: string
  updated_at: string
}

// --- SUBSCRIPTIONS ---
export interface Subscription {
  id: string
  user_id: string
  lemon_squeezy_id: string
  plan: 'pro'
  status: 'active' | 'cancelled' | 'expired' | 'paused'
  current_period_end: string
  created_at: string
}

// --- SAVED CALCULATIONS ---
export interface SavedCalculation {
  id: string
  user_id: string
  country_code: string
  gross_salary: number
  calculation_result: CalculationResult
  label: string | null
  created_at: string
}

// --- CALCULATION RESULT (stored as JSONB) ---
export interface CalculationResult {
  gross_salary: number
  currency_code: string
  income_tax: number
  employee_ss: number
  employer_ss: number
  net_pay: number
  total_employer_cost: number
  effective_tax_rate: number
  tax_brackets_applied: TaxBracketApplied[]
}

export interface TaxBracketApplied {
  label: string
  rate_percent: number
  taxable_amount: number
  tax_amount: number
}

// --- EMAIL SUBSCRIBERS ---
export interface EmailSubscriber {
  id: string
  email: string
  first_name: string | null
  status: 'active' | 'unsubscribed'
  source: string | null          // e.g. "homepage", "calculator"
  subscribed_at: string
}

// --- AI CONVERSATIONS ---
export interface AIConversation {
  id: string
  user_id: string
  messages: AIMessage[]
  country_context: string | null
  created_at: string
  updated_at: string
}

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// --- EMBEDDINGS ---
export interface Embedding {
  id: string
  content_type: string           // e.g. "country_page", "article"
  source_id: string
  content_text: string
  embedding: number[]            // vector(1536)
  created_at: string
}

// --- UTILITY TYPES ---
export type Region =
  | 'Europe'
  | 'North America'
  | 'South America'
  | 'Asia Pacific'
  | 'Middle East'
  | 'Africa'

export type PlanType = 'free' | 'pro'

// Country with joined data (used on country hub pages)
export interface CountryWithData extends Country {
  employment_rules: EmploymentRules | null
  social_security: SocialSecurity[]
  payroll_tax_brackets: PayrollTaxBracket[]
  payroll_compliance: PayrollCompliance[]
}