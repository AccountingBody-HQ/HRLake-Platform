import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const BASE_URL = 'https://globalpayrollexpert.com'

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: BASE_URL,                          lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0  },
  { url: `${BASE_URL}/countries/`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9  },
  { url: `${BASE_URL}/payroll-tools/`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8  },
  { url: `${BASE_URL}/eor/`,                lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8  },
  { url: `${BASE_URL}/hr-compliance/`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8  },
  { url: `${BASE_URL}/compare/`,            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7  },
  { url: `${BASE_URL}/insights/`,           lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7  },
  { url: `${BASE_URL}/pricing/`,            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6  },
  { url: `${BASE_URL}/about/`,              lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5  },
  { url: `${BASE_URL}/contact/`,            lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.4  },
  { url: `${BASE_URL}/search/`,             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5  },
  { url: `${BASE_URL}/privacy-policy/`,     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2  },
  { url: `${BASE_URL}/terms/`,              lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2  },
  { url: `${BASE_URL}/disclaimer/`,         lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2  },
  { url: `${BASE_URL}/cookie-policy/`,      lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2  },
]

const HR_COMPLIANCE_TOPICS = [
  'minimum-wage',
  'annual-leave',
  'maternity-leave',
  'paternity-leave',
  'sick-leave',
  'notice-periods',
  'overtime',
  'probation',
  'termination',
  'redundancy',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // ── Fetch all active countries from Supabase ──────────────────────────────
  const { data: countries } = await supabase
    .from('countries')
    .select('iso2, updated_at')
    .order('iso2')

  const countryPages: MetadataRoute.Sitemap = []

  if (countries) {
    for (const country of countries) {
      const code = country.iso2.toLowerCase()
      const mod  = country.updated_at ? new Date(country.updated_at) : new Date()

      // Country hub page
      countryPages.push({
        url:             `${BASE_URL}/countries/${code}/`,
        lastModified:    mod,
        changeFrequency: 'monthly',
        priority:        0.8,
      })

      // Country payroll calculator
      countryPages.push({
        url:             `${BASE_URL}/countries/${code}/payroll-calculator/`,
        lastModified:    mod,
        changeFrequency: 'monthly',
        priority:        0.7,
      })

      // Country employment law
      countryPages.push({
        url:             `${BASE_URL}/countries/${code}/employment-law/`,
        lastModified:    mod,
        changeFrequency: 'monthly',
        priority:        0.7,
      })

      // Country tax guide
      countryPages.push({
        url:             `${BASE_URL}/countries/${code}/tax-guide/`,
        lastModified:    mod,
        changeFrequency: 'monthly',
        priority:        0.7,
      })
    }
  }

  // ── HR Compliance topic pages ─────────────────────────────────────────────
  const hrPages: MetadataRoute.Sitemap = HR_COMPLIANCE_TOPICS.map(topic => ({
    url:             `${BASE_URL}/hr-compliance/${topic}/`,
    lastModified:    new Date(),
    changeFrequency: 'monthly',
    priority:        0.7,
  }))

  // ── Insights articles intentionally EXCLUDED ──────────────────────────────
  // Canonical owner is accountingbody.com — GPE must not submit these to
  // Google. The /insights/ listing page is included in STATIC_PAGES above
  // but individual article URLs are omitted here.

  return [
    ...STATIC_PAGES,
    ...countryPages,
    ...hrPages,
  ]
}
