import { getFlag } from '@/lib/flag'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

interface Country {
  iso2: string
  name: string
  flag_emoji: string
  currency_code: string
}

interface Props {
  currentCode: string
  region: string
}

async function getRelatedCountries(currentCode: string, region: string): Promise<Country[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await supabase
    .from('countries')
    .select('iso2, name, flag_emoji, currency_code')
    .eq('region', region)
    .neq('iso2', currentCode.toUpperCase())
    .limit(4)
  if (error || !data) return []
  return data
}

export default async function RelatedCountries({ currentCode, region }: Props) {
  const countries = await getRelatedCountries(currentCode, region)
  if (countries.length === 0) return null

  return (
    <section className="border-t border-slate-200 pt-12 mt-12">
      <div className="mb-8">
        <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-2">
          Same Region
        </p>
        <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
          More countries in {region}
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {countries.map((country) => (
          <Link
            key={country.iso2}
            href={`/countries/${country.iso2.toLowerCase()}/`}
            className="group bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-2xl p-5 transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl leading-none">{getFlag(country.iso2)}</span>
              <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors text-sm leading-tight">
                {country.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {country.currency_code}
              </span>
              <span className="flex items-center gap-1 text-blue-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                View <ArrowRight size={11} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
