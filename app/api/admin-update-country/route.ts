import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

// Cast every value in the update object to its correct DB type
function castPayload(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [field, raw] of Object.entries(obj)) {
    const str = String(raw)
    if (BOOLEAN_FIELDS.has(field)) {
      result[field] = str === 'true' || str === '1'
    } else if (NUMERIC_FIELDS.has(field)) {
      const n = Number(str)
      result[field] = isNaN(n) ? raw : n
    } else {
      result[field] = raw
    }
  }
  return result
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
      const { table, raw_value, record_id } = finding
      if (!record_id) return NextResponse.json({ error: 'No record_id provided' }, { status: 400 })
      if (!table) return NextResponse.json({ error: 'No table provided' }, { status: 400 })

      // raw_value should be an object — but if AI returns a scalar, wrap it using field name
      let valueObj: Record<string, unknown>
      if (typeof raw_value === 'object' && raw_value !== null && !Array.isArray(raw_value)) {
        valueObj = raw_value as Record<string, unknown>
      } else if (finding.field && typeof finding.field === 'string' && !finding.field.includes(',')) {
        console.log('raw_value was scalar — auto-wrapping as { ' + finding.field + ': ' + raw_value + ' }')
        valueObj = { [finding.field]: raw_value }
      } else {
        return NextResponse.json({ error: 'raw_value must be an object, got: ' + typeof raw_value }, { status: 400 })
      }

      const payload = castPayload(valueObj)
      console.log('Updating hrlake.' + table + ' record ' + record_id + ' with', payload)

      const { error } = await supabase
        .schema('hrlake')
        .from(table)
        .update(payload)
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
