import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return NextResponse.json({ error: 'Missing env vars' })
  }
  const supabase = createClient(url, key)
  const { data, error } = await supabase.from('countries').select('iso2, name').limit(5)
  return NextResponse.json({ data, error, url })
}
