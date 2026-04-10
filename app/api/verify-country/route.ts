import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16000,
        system: 'You are a payroll data verification expert with web search access.\n\nRULES:\n1. You MUST use web_search for EVERY table separately - search tax brackets, then social security, then employment rules against official government sources.\n2. Search at least 3 times minimum before responding.\n3. After searching, produce a single JSON object. No markdown, no code blocks, no explanation before or after. Start your response with { and end with }.\n4. Every single data point in the input must appear in findings. Do not skip any record.\n5. raw_value must be a real number for numeric fields, null for unlimited upper_limit, or a plain string for text fields - no units, no symbols.',
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    console.log('Anthropic status:', response.status)
    console.log('Stop reason:', data.stop_reason)

    // Surface API-level errors (auth failures, rate limits, etc.)
    if (!response.ok || data.type === 'error') {
      const msg = data?.error?.message ?? JSON.stringify(data).slice(0, 300)
      console.error('Anthropic API error:', msg)
      return NextResponse.json({ error: 'Anthropic API error: ' + msg }, { status: 500 })
    }

    if (!data.content || !Array.isArray(data.content)) {
      console.error('Bad response shape:', JSON.stringify(data).slice(0, 500))
      return NextResponse.json({ error: 'No content returned from Claude' }, { status: 500 })
    }

    const textBlocks = data.content.filter((b: any) => b.type === 'text')
    const text = textBlocks[textBlocks.length - 1]?.text ?? ''
    console.log('Text length:', text.length)
    console.log('Text preview:', text.slice(0, 400))

    if (!text) {
      console.error('No text block in content:', JSON.stringify(data.content).slice(0, 1000))
      return NextResponse.json({ error: 'Claude returned no text. Stop reason: ' + data.stop_reason }, { status: 500 })
    }

    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start === -1 || end === -1) {
      console.error('No JSON in response:', text.slice(0, 500))
      return NextResponse.json({ error: 'No JSON found. Got: ' + text.slice(0, 200) }, { status: 500 })
    }

    const jsonStr = text.slice(start, end + 1)
    try {
      const parsed = JSON.parse(jsonStr)
      if (!parsed.findings || !Array.isArray(parsed.findings)) {
        return NextResponse.json({ error: 'Response missing findings array' }, { status: 500 })
      }
      return NextResponse.json({ content: [{ type: 'text', text: jsonStr }] })
    } catch (parseErr: any) {
      console.error('JSON parse error:', parseErr.message)
      console.error('JSON preview:', jsonStr.slice(0, 500))
      return NextResponse.json({ error: 'JSON parse failed: ' + parseErr.message }, { status: 500 })
    }
  } catch (e: any) {
    console.error('verify-country error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
