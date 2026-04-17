import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function validIso2(code: unknown): code is string {
  return typeof code === 'string' && /^[A-Za-z]{2}$/.test(code)
}

export async function POST(req: NextRequest) {
  try {
  const body = await req.json()
  const { iso2, iso3, name, currency_code, currency_symbol, currency_name, flag_emoji, region } = body
  if (!iso2 || !name || !currency_code) {
    return NextResponse.json({ error: 'iso2, name and currency_code are required' }, { status: 400 })
  }
  if (!validIso2(iso2)) {
    return NextResponse.json({ error: 'iso2 must be exactly 2 letters' }, { status: 400 })
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { error } = await supabase.from('countries').insert({
    iso2: iso2.toUpperCase(),
    iso3: iso3 ? iso3.toUpperCase() : iso2.toUpperCase() + 'X',
    name,
    local_name: name,
    currency_code,
    currency_symbol: currency_symbol || currency_code,
    currency_name: currency_name || currency_code,
    flag_emoji: flag_emoji || '',
    region: region || null,
    sub_region: null,
    phone_code: '',
    capital_city: '',
    tax_year_start_month: 1,
    payroll_frequency: 'monthly',
    is_active: false,
    hrlake_coverage_level: 'none'
  })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PATCH(req: NextRequest) {
  try {
  const body = await req.json()
  const { iso2, is_active } = body
  if (!validIso2(iso2)) {
    return NextResponse.json({ error: 'iso2 must be exactly 2 letters' }, { status: 400 })
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const updateData: any = { is_active }
  if (is_active) {
    // Only set to partial if currently none — never downgrade from full
    const { data: current } = await supabase
      .from('countries')
      .select('hrlake_coverage_level')
      .eq('iso2', iso2.toUpperCase())
      .single()
    if (!current || current.hrlake_coverage_level === 'none') {
      updateData.hrlake_coverage_level = 'partial'
    }
  }
  const { error } = await supabase.from('countries').update(updateData).eq('iso2', iso2.toUpperCase())
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  try {
  const body = await req.json()
  const { iso2 } = body
  if (!validIso2(iso2)) {
    return NextResponse.json({ error: 'iso2 must be exactly 2 letters' }, { status: 400 })
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  // Delete all hrlake table data in parallel
  const hrlakeTables = [
    'tax_brackets','social_security','employment_rules','statutory_leave',
    'public_holidays','filing_calendar','payroll_compliance',
    'working_hours','termination_rules','pension_schemes',
    'mandatory_benefits','health_insurance','payslip_requirements',
    'record_retention','remote_work_rules','expense_rules',
    'contractor_rules','work_permits','entity_setup',
    'tax_credits','regional_tax_rates','salary_benchmarks',
    'government_benefit_payments',
  ]
  const deleteResults = await Promise.all(hrlakeTables.map(table =>
    supabase.schema('hrlake').from(table).delete().eq('country_code', iso2.toUpperCase())
  ))
  const deleteErrors = deleteResults.map((r, i) => r.error ? hrlakeTables[i] + ': ' + r.error.message : null).filter(Boolean)
  if (deleteErrors.length > 0) {
    return NextResponse.json({ error: 'Delete failed for: ' + deleteErrors.join(', ') }, { status: 500 })
  }
  // Delete eor_guides, embeddings (foreign key constraint on countries table)
  await supabase.schema('hrlake').from('eor_guides').delete().eq('country_code', iso2.toUpperCase())
  await supabase.schema('hrlake').from('embeddings').delete().eq('country_code', iso2.toUpperCase())
  // Delete official sources
  await supabase.schema('hrlake').from('official_sources').delete().eq('country_code', iso2.toUpperCase())
  // Delete the country row
  const { error } = await supabase.from('countries').delete().eq('iso2', iso2.toUpperCase())
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
