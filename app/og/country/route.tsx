// ============================================
// HRLAKE — DYNAMIC OG IMAGE
// Route: /og/country?code=GB&name=United+Kingdom
// ============================================

import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = (searchParams.get('code') ?? 'XX').toLowerCase()
  const name = searchParams.get('name') ?? 'Country'
  const type = searchParams.get('type') ?? 'payroll'

  const typeLabel: Record<string, string> = {
    payroll:    'Payroll Guide',
    calculator: 'Payroll Calculator',
    tax:        'Tax Guide',
    hiring:     'Hiring Guide',
    employment: 'Employment Law',
  }

  const label = typeLabel[type] ?? 'Payroll Guide'
  const year  = new Date().getFullYear()
  const flagUrl = `https://flagcdn.com/96x72/${code}.png`

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#020817',
          padding: '64px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '600px',
            height: '400px',
            background: 'radial-gradient(ellipse at 80% 0%, rgba(30,111,255,0.18) 0%, transparent 70%)',
          }}
        />

        {/* Top section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Logo line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6',
              }}
            />
            <span style={{ color: '#94a3b8', fontSize: '18px', fontWeight: 600, letterSpacing: '0.05em' }}>
              HRLAKE.COM
            </span>
          </div>

          {/* Flag + Country name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px', marginTop: '8px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={flagUrl}
              width={96}
              height={72}
              style={{ borderRadius: '8px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
              alt=""
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span
                style={{
                  color: '#ffffff',
                  fontSize: '64px',
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                {name}
              </span>
              <span
                style={{
                  color: '#60a5fa',
                  fontSize: '28px',
                  fontWeight: 600,
                }}
              >
                {label} {year}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '28px',
          }}
        >
          <div style={{ display: 'flex', gap: '32px' }}>
            {['Tax Brackets', 'Employer Costs', 'Employment Law'].map((item) => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#64748b',
                  fontSize: '16px',
                }}
              >
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                  }}
                />
                {item}
              </div>
            ))}
          </div>
          <div
            style={{
              backgroundColor: '#1e3a5f',
              color: '#93c5fd',
              fontSize: '15px',
              fontWeight: 700,
              padding: '8px 20px',
              borderRadius: '999px',
              border: '1px solid rgba(59,130,246,0.3)',
            }}
          >
            Free · Official Sources · Updated Monthly
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
