import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const TABLE_MAP: Record<string, string> = {
  tax_brackets:      'hrlake.tax_brackets',
  social_security:   'hrlake.social_security',
  employment_rules:  'hrlake.employment_rules',
  statutory_leave:   'hrlake.statutory_leave',
  public_holidays:   'hrlake.public_holidays',
  filing_calendar:   'hrlake.filing_calendar',
  payroll_compliance:'hrlake.payroll_compliance',
  working_hours:     'hrlake.working_hours',
  termination_rules: 'hrlake.termination_rules',
  pension_schemes:   'hrlake.pension_schemes',
}

const NUMERIC_FIELDS = new Set([
  'lower_limit', 'upper_limit', 'rate', 'bracket_order',
  'employer_rate', 'employee_rate',
  'employer_cap_annual', 'employee_cap_annual',
  'value_numeric',
  'minimum_days', 'maximum_days', 'payment_rate', 'qualifying_period_months',
  'due_day', 'due_month', 'grace_period_days',
  'standard_hours_per_week', 'maximum_hours_per_week',
  'overtime_threshold_daily', 'overtime_threshold_weekly',
  'overtime_rate_multiplier',
  'notice_period_min_days', 'probation_period_max_months',
  'severance_weeks_per_year',
  'tax_year', 'year',
])

const BOOLEAN_FIELDS = new Set([
  'is_paid', 'is_mandatory', 'is_current', 'severance_mandatory',
  'opt_out_allowed',
])

function castValue(field: string, raw: unknown): unknown {
  const str = String(raw)
  if (BOOLEAN_FIELDS.has(field)) {
    return str === 'true' || str === '1'
  }
  if (NUMERIC_FIELDS.has(field)) {
    const n = Number(str)
    if (!isNaN(n)) return n
  }
  return raw
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { countryCode, action, finding } = body
    console.log('admin-update-country:', action, countryCode)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (action === 'approve_all') {
      const { error } = await supabase
        .from('countries')
        .update({
          last_data_update: new Date().toISOString().split('T')[0],
          hrlake_coverage_level: 'full',
        })
        .eq('iso2', countryCode)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    if (action === 'update_value') {
      const { table, field, new_value, record_id } = finding
      if (!record_id) return NextResponse.json({ error: 'No record_id provided' }, { status: 400 })
      if (!TABLE_MAP[table]) return NextResponse.json({ error: 'Unknown table: ' + table }, { status: 400 })

      const typedValue = castValue(field, new_value)
      console.log('Updating hrlake.' + table + '.' + field + ' = ' + typedValue + ' (' + typeof typedValue + ') for id=' + record_id)

      const { error } = await supabase
        .schema('hrlake')
        .from(table)
        .update({ [field]: typedValue })
        .eq('id', record_id)

      if (error) {
        console.error('update_value error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e: any) {
    console.error('admin-update-country exception:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
