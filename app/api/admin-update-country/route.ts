import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { countryCode, action, finding } = await req.json()

    // Use service role key to bypass RLS for admin updates
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (action === 'approve_all') {
      // Mark country as verified today
      const { error } = await supabase
        .from('countries')
        .update({ last_data_update: new Date().toISOString().split('T')[0] })
        .eq('iso2', countryCode)

      if (error) throw new Error(error.message)
      return NextResponse.json({ ok: true, message: 'Country marked as verified' })
    }

    if (action === 'update_value') {
      // Update a specific field in the database
      const { table, field, new_value, record_id } = finding

      if (table === 'tax_brackets') {
        const { error } = await supabase
          .schema('gpe').from('tax_brackets')
          .update({ [field]: new_value })
          .eq('id', record_id)
        if (error) throw new Error(error.message)
      }

      if (table === 'social_security') {
        const { error } = await supabase
          .schema('gpe').from('social_security')
          .update({ [field]: new_value })
          .eq('id', record_id)
        if (error) throw new Error(error.message)
      }

      if (table === 'employment_rules') {
        const { error } = await supabase
          .schema('gpe').from('employment_rules')
          .update({ [field]: new_value })
          .eq('id', record_id)
        if (error) throw new Error(error.message)
      }

      return NextResponse.json({ ok: true, message: 'Value updated' })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('admin-update error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
