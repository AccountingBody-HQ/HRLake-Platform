import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { iso2, iso3, name, currency_code, currency_symbol, currency_name, flag_emoji, region } = body
  if (!iso2 || !name || !currency_code) {
    return NextResponse.json({ error: 'iso2, name and currency_code are required' }, { status: 400 })
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
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { iso2, is_active } = body
  if (!iso2) {
    return NextResponse.json({ error: 'iso2 is required' }, { status: 400 })
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { error } = await supabase.from('countries').update({ is_active }).eq('iso2', iso2.toUpperCase())
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const body = await req.json()
  const { iso2 } = body
  if (!iso2) {
    return NextResponse.json({ error: 'iso2 is required' }, { status: 400 })
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  // Delete all hrlake table data first
  const hrlakeTables = ['tax_brackets','social_security','employment_rules','statutory_leave','public_holidays','filing_calendar','payroll_compliance','working_hours','termination_rules','pension_schemes']
  for (const table of hrlakeTables) {
    await supabase.schema('hrlake').from(table).delete().eq('country_code', iso2.toUpperCase())
  }
  // Delete official sources
  await supabase.schema('hrlake').from('official_sources').delete().eq('country_code', iso2.toUpperCase())
  // Delete the country row
  const { error } = await supabase.from('countries').delete().eq('iso2', iso2.toUpperCase())
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
