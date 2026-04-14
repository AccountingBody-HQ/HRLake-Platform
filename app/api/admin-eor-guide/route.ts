import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!

function buildPrompt(countryName: string, countryCode: string, currencyCode: string): string {
  return `You are the world's most accurate EOR (Employer of Record) data specialist. Your task is to return a complete, precise JSON EOR guide for ${countryName} (${countryCode}, currency: ${currencyCode}).

CRITICAL RULES:
1. Return ONLY a raw JSON object. No markdown. No code blocks. No explanation. Start with { and end with }.
2. All fields are required. No nulls, no empty strings, no empty arrays.
3. Numeric fields must be plain numbers only — no %, no currency symbols.
4. Base all data on current official sources for ${countryName}.

RETURN THIS EXACT STRUCTURE:

{
  "eor_available": true,
  "eor_maturity": "Mature | Established | Developing",
  "risk_level": "Low | Medium | High",
  "hire_speed": "Fast | Medium | Slow",
  "provider_fee_low": <number — lower end of typical EOR provider fee as % of employer cost, e.g. 9>,
  "provider_fee_high": <number — upper end of typical EOR provider fee as % of employer cost, e.g. 15>,
  "ss_employer_rate": <number — employer social security / payroll tax rate as a percentage, e.g. 13.8>,
  "ss_employer_display": "<string — employer SS rate as it should display, e.g. '13.8%' or '~20%' or 'Fixed amounts (~1%)'>",
  "income_tax_range": "<string — personal income tax range as it should display, e.g. '20–45%' or '0%' or '0–30%'>",
  "recommendation_title": "<string — one clear sentence recommending EOR approach for ${countryName}, e.g. 'EOR ideal for initial ${countryName} hires'>",
  "recommendation_detail": "<string — 2-3 sentences explaining why EOR is or is not recommended, covering the key local complexity drivers>",
  "eor_pros": [
    "<string — specific EOR advantage in ${countryName} — name the actual local scheme, law, or authority>",
    "<string — specific EOR advantage>",
    "<string — specific EOR advantage>",
    "<string — specific EOR advantage>",
    "<string — specific EOR advantage>"
  ],
  "eor_cons": [
    "<string — specific EOR limitation or cost in ${countryName}>",
    "<string — specific EOR limitation>",
    "<string — specific EOR limitation>",
    "<string — specific EOR limitation>"
  ],
  "direct_pros": [
    "<string — specific advantage of direct employment in ${countryName}>",
    "<string — specific advantage>",
    "<string — specific advantage>",
    "<string — specific advantage>"
  ],
  "direct_cons": [
    "<string — specific challenge of direct employment in ${countryName} — name actual requirements>",
    "<string — specific challenge>",
    "<string — specific challenge>",
    "<string — specific challenge>"
  ],
  "compliance_risks": [
    {
      "risk": "<string — name of the specific compliance risk, e.g. 'Superannuation guarantee'>",
      "detail": "<string — 2 sentences explaining the risk and its consequence. Name the actual law, authority, or scheme.>",
      "severity": "High | Medium | Low"
    },
    {
      "risk": "<string>",
      "detail": "<string>",
      "severity": "High | Medium | Low"
    },
    {
      "risk": "<string>",
      "detail": "<string>",
      "severity": "High | Medium | Low"
    },
    {
      "risk": "<string>",
      "detail": "<string>",
      "severity": "High | Medium | Low"
    }
  ],
  "key_facts": [
    { "label": "<string — short label, e.g. 'Employer SS rate'>", "value": "<string — concise value, e.g. '13.8% above £9,100/yr'>" },
    { "label": "<string>", "value": "<string>" },
    { "label": "<string>", "value": "<string>" },
    { "label": "<string>", "value": "<string>" },
    { "label": "<string>", "value": "<string>" },
    { "label": "<string>", "value": "<string>" }
  ],
  "source_url": "<string — official government, social security, or labour authority URL for ${countryName}>"
}

ACCURACY REQUIREMENTS:
- eor_maturity: Mature = large established provider ecosystem (US, UK, DE, AU). Established = solid but smaller ecosystem. Developing = limited providers, higher risk.
- risk_level: Low = straightforward compliance. Medium = moderate complexity. High = complex regulation, high cost, or high termination risk.
- hire_speed: Fast = days. Medium = 1-2 weeks. Slow = 2-4+ weeks.
- provider_fee_low/high: Research current market rates for EOR providers in ${countryName}.
- compliance_risks: Order from highest to lowest severity. Always include the primary payroll/social security risk as the first item.
- key_facts: Always include employer SS rate as the first key fact. Include income tax, minimum leave, notice period, and 2 other country-specific facts.
- eor_pros: Always start with the most compelling reason to use EOR in ${countryName} — name the specific local scheme or law it handles.
- All content must be specific to ${countryName} — no generic statements that could apply to any country.

Return the JSON now. Start immediately with {`
}

export async function POST(req: NextRequest) {
  try {
    const { action, countryCode, countryName, currencyCode, guideData } = await req.json()

    if (action === 'generate') {
      if (!countryCode || !countryName) {
        return NextResponse.json({ error: 'countryCode and countryName required' }, { status: 400 })
      }

      const prompt = buildPrompt(countryName, countryCode, currencyCode || 'USD')

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      const data = await response.json()
      const textContent = (data.content ?? [])
        .filter((b: any) => b.type === 'text')
        .map((b: any) => b.text)
        .join('')

      if (!textContent) {
        return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
      }

      let parsed: any
      try {
        let clean = textContent.trim()
        const fenceMatch = clean.match(/```(?:json)?\s*([\s\S]*?)```/)
        if (fenceMatch) clean = fenceMatch[1].trim()
        else {
          const start = clean.indexOf('{')
          const end = clean.lastIndexOf('}')
          if (start !== -1 && end !== -1) clean = clean.slice(start, end + 1)
        }
        parsed = JSON.parse(clean)
      } catch {
        return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
      }

      // Validate required fields
      const required = ['eor_available','eor_maturity','risk_level','hire_speed',
        'provider_fee_low','provider_fee_high','ss_employer_rate','ss_employer_display',
        'income_tax_range','recommendation_title','recommendation_detail',
        'eor_pros','eor_cons','direct_pros','direct_cons','compliance_risks','key_facts']
      const missing = required.filter(k => !parsed[k])
      if (missing.length > 0) {
        return NextResponse.json({ error: 'AI response missing fields: ' + missing.join(', ') }, { status: 500 })
      }

      // Validate array lengths
      if (parsed.eor_pros?.length !== 5) return NextResponse.json({ error: 'eor_pros must have exactly 5 items' }, { status: 500 })
      if (parsed.eor_cons?.length !== 4) return NextResponse.json({ error: 'eor_cons must have exactly 4 items' }, { status: 500 })
      if (parsed.direct_pros?.length !== 4) return NextResponse.json({ error: 'direct_pros must have exactly 4 items' }, { status: 500 })
      if (parsed.direct_cons?.length !== 4) return NextResponse.json({ error: 'direct_cons must have exactly 4 items' }, { status: 500 })
      if (parsed.compliance_risks?.length !== 4) return NextResponse.json({ error: 'compliance_risks must have exactly 4 items' }, { status: 500 })
      if (parsed.key_facts?.length !== 6) return NextResponse.json({ error: 'key_facts must have exactly 6 items' }, { status: 500 })

      return NextResponse.json({ ok: true, guide: parsed })
    }

    if (action === 'save') {
      if (!countryCode || !guideData) {
        return NextResponse.json({ error: 'countryCode and guideData required' }, { status: 400 })
      }

      // Delete existing guide for this country
      await sb.schema('hrlake').from('eor_guides').delete().eq('country_code', countryCode.toUpperCase())

      // Insert new guide
      const { error } = await sb.schema('hrlake').from('eor_guides').insert({
        ...guideData,
        country_code: countryCode.toUpperCase(),
        tax_year: 2025,
        valid_from: new Date().toISOString().split('T')[0],
        is_current: true,
        tier: 'free',
      })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
