import { NextResponse } from 'next/server'

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
        max_tokens: 5000,
        system: 'You are a payroll data verification expert. You have access to web search. Always search official government sources to verify data before responding. Always respond with valid JSON only. No markdown, no explanation, no code blocks. Just the raw JSON object.',
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
          }
        ],
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    })

    const data = await response.json()
    console.log('Anthropic response status:', response.status)

    // With tools, Claude may return multiple content blocks
    // We need to find the final text block after tool use
    let text = ''
    if (data.content && Array.isArray(data.content)) {
      // Get the last text block — this is the final answer after web search
      const textBlocks = data.content.filter((block: any) => block.type === 'text')
      text = textBlocks[textBlocks.length - 1]?.text ?? ''
    }

    console.log('Final text response:', text.slice(0, 300))
    return NextResponse.json({ content: [{ type: 'text', text }] })

  } catch (e: any) {
    console.error('verify-country error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
