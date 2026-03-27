import { auth, currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await req.json()
  const { country_code, gross_salary, period, label, calculation_result } = body

  if (!country_code || !gross_salary || !calculation_result) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Ensure user profile exists
  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress || ''
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || email

  await supabase
    .from('profiles')
    .upsert({ id: userId, email, full_name: fullName }, { onConflict: 'id' })

  // Check for duplicate — same user, country, salary, period saved in last 60 seconds
  const { data: existing } = await supabase
    .schema('gpe')
    .from('saved_calculations')
    .select('id')
    .eq('user_id', userId)
    .eq('country_code', country_code.toUpperCase())
    .eq('calculation_type', 'payroll')
    .gte('created_at', new Date(Date.now() - 60000).toISOString())
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json({ success: true, duplicate: true })
  }

  // Also check for same gross_salary and period combination
  const { data: sameCalc } = await supabase
    .schema('gpe')
    .from('saved_calculations')
    .select('id, inputs')
    .eq('user_id', userId)
    .eq('country_code', country_code.toUpperCase())
    .eq('calculation_type', 'payroll')
    .limit(20)

  const isDuplicate = sameCalc?.some((c: any) => 
    c.inputs?.gross_salary === gross_salary && c.inputs?.period === period
  )

  if (isDuplicate) {
    return NextResponse.json({ success: true, duplicate: true, message: 'Already saved' })
  }

  // Save the calculation
  const { error } = await supabase
    .schema('gpe')
    .from('saved_calculations')
    .insert({
      user_id: userId,
      country_code: country_code.toUpperCase(),
      name: label || `${country_code.toUpperCase()} — ${new Date().toLocaleDateString('en-GB')}`,
      calculation_type: 'payroll',
      inputs: { gross_salary, period },
      results: calculation_result,
      data_snapshot: calculation_result,
      rates_valid_as_of: new Date().toISOString().split('T')[0],
    })

  if (error) {
    console.error('Save calculation error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
