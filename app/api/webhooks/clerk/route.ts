import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'No webhook secret' }, { status: 500 })
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Verify the webhook
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: any

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data
    const email = email_addresses?.[0]?.email_address || ''
    const fullName = [first_name, last_name].filter(Boolean).join(' ') || email

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id,
        email,
        full_name: fullName,
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('Profile creation error:', profileError.message)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Create platform membership for HRLake
    const { error: membershipError } = await supabase
      .from('platform_memberships')
      .upsert({
        user_id: id,
        platform: 'hrlake',
      }, { onConflict: 'user_id,platform' })

    if (membershipError) {
      console.error('Membership creation error:', membershipError.message)
      // Non-fatal — profile was created successfully
    }

    console.log('User created in Supabase:', id, email)
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data
    const email = email_addresses?.[0]?.email_address || ''
    const fullName = [first_name, last_name].filter(Boolean).join(' ') || email

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await supabase
      .from('profiles')
      .upsert({
        id,
        email,
        full_name: fullName,
      }, { onConflict: 'id' })
  }

  return NextResponse.json({ success: true })
}
