import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import crypto from 'crypto'

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-signature') ?? ''
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ?? ''

  if (!verifySignature(rawBody, signature, secret)) {
    console.error('Invalid webhook signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)
  const eventName = event.meta?.event_name
  const data = event.data?.attributes
  const userId = event.meta?.custom_data?.user_id

  if (!userId) {
    console.error('No user_id in webhook custom_data')
    return NextResponse.json({ error: 'No user_id' }, { status: 400 })
  }

  const supabase = createSupabaseAdminClient()

  try {
    if (eventName === 'subscription_created') {
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        lemon_squeezy_id: String(event.data?.id),
        platform: 'hrlake',
        plan: 'pro',
        status: data.status,
        current_period_end: data.renews_at,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

      await supabase.from('profiles').update({ plan: 'pro' }).eq('id', userId)
    }

    if (eventName === 'subscription_updated') {
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        lemon_squeezy_id: String(event.data?.id),
        platform: 'hrlake',
        plan: data.status === 'active' ? 'pro' : 'free',
        status: data.status,
        current_period_end: data.renews_at,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
    }

    if (eventName === 'subscription_cancelled') {
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        lemon_squeezy_id: String(event.data?.id),
        platform: 'hrlake',
        plan: 'free',
        status: 'cancelled',
        current_period_end: data.ends_at,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

      await supabase.from('profiles').update({ plan: 'free' }).eq('id', userId)
    }

    if (eventName === 'subscription_payment_success') {
      await supabase.from('subscriptions').update({
        current_period_end: data.renews_at,
        status: 'active',
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
