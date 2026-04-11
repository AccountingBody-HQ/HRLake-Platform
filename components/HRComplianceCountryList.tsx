import { getFlag } from '@/lib/flag'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

interface Country {
  iso2: string
  name: string
  flag_emoji: string
  currency_code: string
  region: string
}

interface Props {
  topic: string
  topicLabel: string
}

async function getCountriesForTopic(): Promise<Country[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('countries')
    .select('iso2, name, flag_emoji, currency_code, region')
    .order('name', { ascending: true })

  if (error || !data) return []
  return data
}

export default async function HRComplianceCountryList({ topic, topicLabel }: Props) {
  const countries = await getCountriesForTopic()

  if (countries.length === 0) return null

  const grouped = countries.reduce((acc: Record<string, Country[]>, country) => {
    const region = country.region || 'Other'
    if (!acc[region]) acc[region] = []
    acc[region].push(country)
    return acc
  }, {})

  const regionOrder = ['Europe', 'Americas', 'Asia Pacific', 'Middle East', 'Africa', 'Other']

  return (
    <section className="border-t border-slate-200 pt-12 mt-12">
      <div className="mb-10">
        <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-2">
          By Country
        </p>
        <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
          {topicLabel} — all countries
        </h2>
        <p className="text-slate-500 text-sm mt-2">
          Select a country to view its {topicLabel.toLowerCase()} rules and requirements.
        </p>
      </div>

      <div className="space-y-10">
        {regionOrder.map((region) => {
          const regionCountries = grouped[region]
          if (!regionCountries || regionCountries.length === 0) return null

          return (
            <div key={region}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 pb-2 border-b border-slate-100">
                {region}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {regionCountries.map((country) => (
                  <Link
                    key={country.iso2}
                    href={`/countries/${country.iso2.toLowerCase()}/employmentlaw/`}
                    className="group flex items-center gap-3 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-xl p-4 transition-all duration-200"
                  >
                    <span className="text-xl leading-none shrink-0">{getFlag(country.iso2)}</span>
                    <span className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors text-sm leading-tight flex-1">
                      {country.name}
                    </span>
                    <ArrowRight size={13} className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
