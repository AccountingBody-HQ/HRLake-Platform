import { createClient } from '@supabase/supabase-js'
import { CheckCircle, AlertCircle, Clock, Database } from 'lucide-react'
import Link from 'next/link'

async function getDataQualitySummary() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: countries, error: cErr } = await supabase
      .from('countries')
      .select('iso2, name, currency_code, gpe_coverage_level, last_data_update, payroll_complexity_score')
      .eq('is_active', true)
      .order('name')

    if (cErr) console.error('countries error:', cErr.message)

    const { data: brackets, error: bErr } = await supabase
      .schema('gpe').from('tax_brackets')
      .select('country_code')
      .eq('is_current', true)

    if (bErr) console.error('brackets error:', bErr.message)

    const { data: ss, error: sErr } = await supabase
      .schema('gpe').from('social_security')
      .select('country_code')
      .eq('is_current', true)

    if (sErr) console.error('ss error:', sErr.message)

    const { data: rules, error: rErr } = await supabase
      .schema('gpe').from('employment_rules')
      .select('country_code')
      .eq('is_current', true)

    if (rErr) console.error('rules error:', rErr.message)

    const bracketCodes = new Set((brackets ?? []).map((r: any) => r.country_code))
    const ssCodes = new Set((ss ?? []).map((r: any) => r.country_code))
    const rulesCodes = new Set((rules ?? []).map((r: any) => r.country_code))

    return (countries ?? []).map((c: any) => ({
      ...c,
      has_tax: bracketCodes.has(c.iso2),
      has_ss: ssCodes.has(c.iso2),
      has_rules: rulesCodes.has(c.iso2),
      complete: bracketCodes.has(c.iso2) && ssCodes.has(c.iso2) && rulesCodes.has(c.iso2),
    }))
  } catch (e) {
    console.error('getDataQualitySummary error:', e)
    return []
  }
}

export default async function DataQualityPage() {
  const countries = await getDataQualitySummary()
  const complete = countries.filter((c: any) => c.complete).length
  const incomplete = countries.filter((c: any) => !c.complete).length
  const total = countries.length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Data Quality Dashboard</h1>
        <p className="text-slate-400 text-sm">Monitor and verify payroll data across all countries</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Countries', value: total,      color: 'text-blue-400',    bg: 'bg-blue-600/10 border-blue-600/20' },
          { label: 'Fully Complete',  value: complete,   color: 'text-emerald-400', bg: 'bg-emerald-600/10 border-emerald-600/20' },
          { label: 'Incomplete',      value: incomplete, color: 'text-red-400',     bg: 'bg-red-600/10 border-red-600/20' },
          { label: 'Coverage',        value: total > 0 ? Math.round((complete/total)*100) + '%' : '0%', color: 'text-amber-400', bg: 'bg-amber-600/10 border-amber-600/20' },
        ].map(card => (
          <div key={card.label} className={`border rounded-2xl p-5 ${card.bg}`}>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">{card.label}</p>
            <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {total === 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
          <p className="text-red-400 font-bold mb-2">No data loaded</p>
          <p className="text-slate-400 text-sm">Check Supabase connection and RLS policies.</p>
        </div>
      )}

      {total > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-white font-bold">Country Data Status</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Country</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tax</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">SS</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Rules</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {countries.map((c: any) => (
                  <tr key={c.iso2} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://flagcdn.com/20x15/${c.iso2.toLowerCase()}.png`}
                          alt={c.name}
                          width={20}
                          height={15}
                          className="rounded-sm"
                        />
                        <div>
                          <p className="text-white font-semibold text-sm">{c.name}</p>
                          <p className="text-slate-500 text-xs">{c.iso2} · {c.currency_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {c.has_tax ? '✅' : '❌'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {c.has_ss ? '✅' : '❌'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {c.has_rules ? '✅' : '❌'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {c.complete
                        ? <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full">Complete</span>
                        : <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-3 py-1 rounded-full">Incomplete</span>}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-slate-400 text-xs">
                        {c.last_data_update
                          ? new Date(c.last_data_update).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/data-quality/${c.iso2.toLowerCase()}`}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Verify
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
