import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      full_name,
      email,
      organisation,
      message,
      form_type,
      country,
      data_field,
      current_value,
      correct_value,
      source_url,
    } = body

    // Save to Supabase contact_submissions table
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        platform: 'hrlake',
        full_name,
        email,
        organisation: organisation || null,
        message: message || null,
        form_type,
        metadata: form_type === 'correction'
          ? { country, data_field, current_value, correct_value, source_url }
          : null,
      })

    if (dbError) {
      console.error('Supabase insert error:', dbError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Send admin notification via Resend (only if key is set)
    if (process.env.RESEND_API_KEY) {
      try {
        const subject = form_type === 'correction'
          ? `[HRLake] Data correction request — ${country || 'Unknown country'}`
          : `[HRLake] Contact form — ${full_name}`

        const html = form_type === 'correction'
          ? `
            <h2>Data Correction Request</h2>
            <p><strong>From:</strong> ${full_name} (${email})</p>
            ${organisation ? `<p><strong>Organisation:</strong> ${organisation}</p>` : ''}
            <p><strong>Country:</strong> ${country}</p>
            <p><strong>Data field:</strong> ${data_field}</p>
            <p><strong>Current value shown:</strong> ${current_value || 'Not provided'}</p>
            <p><strong>Correct value:</strong> ${correct_value || 'Not provided'}</p>
            ${source_url ? `<p><strong>Source URL:</strong> <a href="${source_url}">${source_url}</a></p>` : ''}
            ${message ? `<p><strong>Notes:</strong> ${message}</p>` : ''}
          `
          : `
            <h2>General Enquiry</h2>
            <p><strong>From:</strong> ${full_name} (${email})</p>
            ${organisation ? `<p><strong>Organisation:</strong> ${organisation}</p>` : ''}
            <p><strong>Message:</strong><br/>${message}</p>
          `

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'HRLake <noreply@hrlake.com>',
            to: [process.env.ADMIN_EMAIL || 'admin@hrlake.com'],
            subject,
            html,
          }),
        })
      } catch (emailErr) {
        // Email failure does not block the response — submission is already saved
        console.error('Resend error:', emailErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
