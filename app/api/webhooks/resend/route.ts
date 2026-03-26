import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

// Verify the request is genuinely from Resend
async function verifyResendWebhook(request: NextRequest, body: string): Promise<boolean> {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) return false

  const svixId = request.headers.get('svix-id')
  const svixTimestamp = request.headers.get('svix-timestamp')
  const svixSignature = request.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) return false

  try {
    const signedContent = `${svixId}.${svixTimestamp}.${body}`
    const secretBytes = Uint8Array.from(
      atob(secret.replace('whsec_', '')),
      c => c.charCodeAt(0)
    )
    const key = await crypto.subtle.importKey(
      'raw', secretBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    )
    const signatureBytes = await crypto.subtle.sign(
      'HMAC', key, new TextEncoder().encode(signedContent)
    )
    const computedSignature = 'v1,' + btoa(
      String.fromCharCode(...new Uint8Array(signatureBytes))
    )
    const signatures = svixSignature.split(' ')
    return signatures.some(sig => sig === computedSignature)
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()

    // Verify webhook signature
    const isValid = await verifyResendWebhook(request, rawBody)
    if (!isValid) {
      console.error('Resend webhook: invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    const { type, data } = body

    const relevantEvents = ['email.bounced', 'email.complained']

    if (!relevantEvents.includes(type)) {
      return NextResponse.json({ received: true })
    }

    const email = data?.to?.[0] || data?.email
    if (!email) {
      return NextResponse.json({ received: true })
    }

    const supabase = createSupabaseAdminClient()

    let newStatus = ''
    if (type === 'email.bounced') newStatus = 'bounced'
    else if (type === 'email.complained') newStatus = 'complained'

    if (!newStatus) return NextResponse.json({ received: true })

    const { error } = await supabase
      .from('email_subscribers')
      .update({ status: newStatus })
      .eq('email', email.toLowerCase().trim())
      .eq('platform', 'gpe')

    if (error) {
      console.error('Resend webhook Supabase error:', error)
      return NextResponse.json({ error: 'Failed to update subscriber' }, { status: 500 })
    }

    console.log(`Resend webhook: ${type} for ${email} — status updated to ${newStatus}`)
    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Resend webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
