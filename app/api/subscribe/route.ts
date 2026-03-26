import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source = 'unknown', calculation_summary } = body

    // --- VALIDATE EMAIL ---
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // --- SAVE TO SUPABASE ---
    const supabase = createSupabaseAdminClient()
    const { error: dbError } = await supabase
      .from('email_subscribers')
      .upsert(
        {
          email: email.toLowerCase().trim(),
          platform: 'gpe',
          status: 'subscribed',
          source,
          subscribed_at: new Date().toISOString(),
        },
        {
          onConflict: 'email,platform',
          ignoreDuplicates: false,
        }
      )

    if (dbError) {
      console.error('Supabase error:', dbError)
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
    }

    // --- SEND WELCOME EMAIL ---
    if (calculation_summary) {
      // Calculation results email
      await resend.emails.send({
        from: 'GlobalPayrollExpert <onboarding@resend.dev>',
        to: email,
        subject: 'Your payroll calculation — GlobalPayrollExpert',
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
            <div style="background: #0f172a; padding: 32px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 20px;">GlobalPayrollExpert</h1>
              <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px;">Global Payroll Intelligence Platform</p>
            </div>
            <div style="background: #f8fafc; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
              <h2 style="color: #1e293b; margin: 0 0 16px;">Your payroll calculation</h2>
              <p style="color: #475569; line-height: 1.6;">Here is a summary of your calculation:</p>
              <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 24px 0; font-family: monospace; font-size: 14px; color: #1e293b; white-space: pre-wrap;">${calculation_summary}</div>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">You are now subscribed to our monthly global payroll updates — rate changes, new country data, and compliance alerts, once a month.</p>
              <a href="https://globalpayrollexpert.com/countries/" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 16px;">Browse all countries</a>
            </div>
            <div style="padding: 24px; text-align: center;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">GlobalPayrollExpert.com · <a href="https://globalpayrollexpert.com/unsubscribe/?email=${email}" style="color: #94a3b8;">Unsubscribe</a></p>
            </div>
          </div>
        `,
      })
    } else {
      // Standard welcome email
      await resend.emails.send({
        from: 'GlobalPayrollExpert <onboarding@resend.dev>',
        to: email,
        subject: 'Welcome to GlobalPayrollExpert updates',
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
            <div style="background: #0f172a; padding: 32px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 20px;">GlobalPayrollExpert</h1>
              <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px;">Global Payroll Intelligence Platform</p>
            </div>
            <div style="background: #f8fafc; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
              <h2 style="color: #1e293b; margin: 0 0 16px;">You are subscribed.</h2>
              <p style="color: #475569; line-height: 1.6;">Thank you for subscribing to GlobalPayrollExpert monthly updates.</p>
              <p style="color: #475569; line-height: 1.6;">Once a month you will receive:</p>
              <ul style="color: #475569; line-height: 1.8; padding-left: 20px;">
                <li>Payroll rate changes across key jurisdictions</li>
                <li>New country data additions</li>
                <li>Employment law updates</li>
                <li>Compliance deadline alerts</li>
              </ul>
              <a href="https://globalpayrollexpert.com/countries/" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 16px;">Explore country data</a>
            </div>
            <div style="padding: 24px; text-align: center;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">GlobalPayrollExpert.com · <a href="https://globalpayrollexpert.com/unsubscribe/?email=${email}" style="color: #94a3b8;">Unsubscribe</a></p>
            </div>
          </div>
        `,
      })
    }

    return NextResponse.json({ success: true, message: 'Subscribed successfully' })

  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
