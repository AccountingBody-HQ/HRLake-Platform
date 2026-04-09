import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { iso2, iso3, name, currency_code, flag_emoji, region } = body
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
    currency_code,
    flag_emoji: flag_emoji || '',
    region: region || null,
    is_active: false,
    hrlake_coverage_level: 'none'
  })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
