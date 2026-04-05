import { NextRequest, NextResponse } from 'next/server'

const SITE_MAP: Record<string, string> = {
  HRLake: 'hrlake',
  AccountingBody: 'accountingbody',
  EthioTax: 'ethiotax',
}

const CONTENT_TYPE_MAP: Record<string, string> = {
  'Country Report': 'country-report',
  'Explainer': 'explainer',
  'HR Management': 'hr-management',
  'EOR Guide': 'eor-guide',
  'Tax Guide': 'tax-guide',
  'Course': 'tutorial',
  'Article': 'article',
}

function makeKey() {
  return Math.random().toString(36).slice(2, 12)
}

function parseInline(text: string): any[] {
  const parts = text.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
  const spanList: any[] = []
  for (const part of parts) {
    if (!part) continue
    if (part.startsWith('***') && part.endsWith('***')) {
      spanList.push({ _type: 'span', _key: makeKey(), text: part.slice(3, -3), marks: ['strong', 'em'] })
    } else if (part.startsWith('**') && part.endsWith('**')) {
      spanList.push({ _type: 'span', _key: makeKey(), text: part.slice(2, -2), marks: ['strong'] })
    } else if (part.startsWith('*') && part.endsWith('*')) {
      spanList.push({ _type: 'span', _key: makeKey(), text: part.slice(1, -1), marks: ['em'] })
    } else if (part.startsWith('`') && part.endsWith('`')) {
      spanList.push({ _type: 'span', _key: makeKey(), text: part.slice(1, -1), marks: ['code'] })
    } else {
      spanList.push({ _type: 'span', _key: makeKey(), text: part, marks: [] })
    }
  }
  return spanList.length > 0 ? spanList : [{ _type: 'span', _key: makeKey(), text, marks: [] }]
}

function markdownToBlocks(markdown: string): any[] {
  const lines = markdown.split('\n')
  const blocks: any[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) { i++; continue }

    if (line.startsWith('# ')) {
      blocks.push({ _type: 'block', _key: makeKey(), style: 'h1', children: [{ _type: 'span', _key: makeKey(), text: line.slice(2).trim(), marks: [] }], markDefs: [] })
      i++; continue
    }
    if (line.startsWith('## ')) {
      blocks.push({ _type: 'block', _key: makeKey(), style: 'h2', children: [{ _type: 'span', _key: makeKey(), text: line.slice(3).trim(), marks: [] }], markDefs: [] })
      i++; continue
    }
    if (line.startsWith('### ')) {
      blocks.push({ _type: 'block', _key: makeKey(), style: 'h3', children: [{ _type: 'span', _key: makeKey(), text: line.slice(4).trim(), marks: [] }], markDefs: [] })
      i++; continue
    }
    if (line.startsWith('#### ')) {
      blocks.push({ _type: 'block', _key: makeKey(), style: 'h4', children: [{ _type: 'span', _key: makeKey(), text: line.slice(5).trim(), marks: [] }], markDefs: [] })
      i++; continue
    }

    if (line.match(/^[-*+] /)) {
      while (i < lines.length && lines[i].match(/^[-*+] /)) {
        blocks.push({ _type: 'block', _key: makeKey(), style: 'normal', listItem: 'bullet', level: 1, children: parseInline(lines[i].replace(/^[-*+] /, '').trim()), markDefs: [] })
        i++
      }
      continue
    }

    if (line.match(/^\d+\. /)) {
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        blocks.push({ _type: 'block', _key: makeKey(), style: 'normal', listItem: 'number', level: 1, children: parseInline(lines[i].replace(/^\d+\. /, '').trim()), markDefs: [] })
        i++
      }
      continue
    }

    if (line.trim() === '---' || line.trim() === '***') { i++; continue }

    const paraLines: string[] = []
    while (i < lines.length && lines[i].trim() && !lines[i].match(/^#{1,4} /) && !lines[i].match(/^[-*+] /) && !lines[i].match(/^\d+\. /) && lines[i].trim() !== '---') {
      paraLines.push(lines[i].trim())
      i++
    }
    if (paraLines.length > 0) {
      blocks.push({ _type: 'block', _key: makeKey(), style: 'normal', children: parseInline(paraLines.join(' ')), markDefs: [] })
    }
  }
  return blocks
}

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 200)
}

function extractTitle(content: string, fallback: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : fallback
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { content, topic, site, contentType, country, aiSummary, keyTerms, showOnSites, canonicalOwner } = body

    if (!content || !site || !contentType || !canonicalOwner || !showOnSites?.length) {
      return NextResponse.json({ error: 'content, site, contentType, canonicalOwner and showOnSites are required' }, { status: 400 })
    }

    const token     = process.env.SANITY_API_TOKEN
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '4rllejq1'
    const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET    ?? 'production'

    if (!token) {
      return NextResponse.json({ error: 'SANITY_API_TOKEN is not set' }, { status: 500 })
    }

    const title       = extractTitle(content, topic)
    const slug        = generateSlug(title)
    const blocks      = markdownToBlocks(content)
    const now         = new Date().toISOString()
    const today       = now.slice(0, 10)
    const mappedSites = (showOnSites as string[]).map((s: string) => SITE_MAP[s] ?? s.toLowerCase())
    const mappedOwner = SITE_MAP[canonicalOwner] ?? canonicalOwner.toLowerCase()
    const mappedType  = CONTENT_TYPE_MAP[contentType] ?? 'article'
    const keyTermsArr = keyTerms ? keyTerms.split(',').map((t: string) => t.trim()).filter(Boolean) : []
    const countryTags = country && country.length <= 3 ? [country.toUpperCase()] : []

    const doc: any = {
      _type:                   'article',
      title,
      slug:                    { _type: 'slug', current: slug },
      excerpt:                 aiSummary ?? '',
      body:                    blocks,
      contentType:             mappedType,
      publishedAt:             now,
      dataFreshDate:           today,
      requiresQuarterlyReview: ['country-report', 'tax-guide', 'eor-guide'].includes(mappedType),
      showOnSites:             mappedSites,
      canonicalOwner:          mappedOwner,
      aiSummary:               aiSummary ?? '',
      aiKeyTerms:              keyTermsArr,
      aiSearchable:            true,
    }

    if (countryTags.length > 0) {
      doc.countryTags        = countryTags
      doc.relatedCountryCode = countryTags[0]
    }

    const mutation  = { mutations: [{ create: doc }] }
    const url       = `https://${projectId}.api.sanity.io/v2021-06-07/data/mutate/${dataset}`
    const sanityRes = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer \${token}` },
      body:    JSON.stringify(mutation),
    })

    const sanityData = await sanityRes.json()
    if (!sanityRes.ok) {
      console.error('Sanity error:', sanityData)
      return NextResponse.json({ error: sanityData?.message ?? 'Sanity publish failed' }, { status: 500 })
    }

    return NextResponse.json({
      success:        true,
      documentId:     sanityData?.results?.[0]?.id ?? null,
      title,
      slug,
      showOnSites:    mappedSites,
      canonicalOwner: mappedOwner,
    })

  } catch (err: any) {
    console.error('content-factory/publish error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
