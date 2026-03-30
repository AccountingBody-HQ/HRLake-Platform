import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { ArrowRight, Shield, Globe, FileText, Clock, Users, Baby } from 'lucide-react'

export const metadata = {
  title: 'HR Compliance & Employment Law by Country | GlobalPayrollExpert',
  description: 'Global employment law guides covering minimum wage, annual leave, notice periods, maternity leave, and probation periods across 195 countries.',
}

const TOPICS = [
  {
    slug: 'minimum-wage',
    title: 'Minimum Wage',
    description: 'Statutory pay floors by country — hourly, daily, and monthly rates from official labour authorities.',
    icon: FileText,
    color: 'blue',
    accent: 'bg-blue-50 text-blue-700',
    top: 'bg-blue-600',
    border: 'hover:border-blue-300',
  },
  {
    slug: 'annual-leave',
    title: 'Annual Leave',
    description: 'Minimum paid holiday entitlements per year — what the law guarantees every employee.',
    icon: Globe,
    color: 'teal',
    accent: 'bg-teal-50 text-teal-700',
    top: 'bg-teal-600',
    border: 'hover:border-teal-300',
  },
  {
    slug: 'notice-periods',
    title: 'Notice Periods',
    description: 'Minimum statutory notice employers must give on termination — before severance obligations begin.',
    icon: Clock,
    color: 'indigo',
    accent: 'bg-indigo-50 text-indigo-700',
    top: 'bg-indigo-600',
    border: 'hover:border-indigo-300',
  },
  {
    slug: 'maternity-leave',
    title: 'Maternity Leave',
    description: 'Statutory maternity and primary carer leave entitlements — duration and qualifying conditions.',
    icon: Baby,
    color: 'sky',
    accent: 'bg-sky-50 text-sky-700',
    top: 'bg-sky-600',
    border: 'hover:border-sky-300',
  },
  {
    slug: 'probation-periods',
    title: 'Probation Periods',
    description: 'Maximum probation period allowed by law and what different dismissal rules apply during that window.',
    icon: Users,
    color: 'violet',
    accent: 'bg-violet-50 text-violet-700',
    top: 'bg-violet-600',
    border: 'hover:border-violet-300',
  },
]

const COMPLIANCE_AREAS = [
  {
    title: 'Employment Contracts',
    body: 'Written contract requirements, mandatory clauses, fixed-term rules, and at-will versus just-cause dismissal jurisdictions.',
    icon: '📄',
  },
  {
    title: 'Working Time',
    body: 'Maximum weekly hours, mandatory rest periods, overtime thresholds, and night work premiums by country.',
    icon: '⏱️',
  },
  {
    title: 'Data Protection',
    body: 'Employee data rights under GDPR and equivalent laws — what employers can collect, store, and process.',
    icon: '🔒',
  },
  {
    title: 'Termination Rules',
    body: 'Notice obligations, severance formulas, redundancy procedures, and protected dismissal categories.',
    icon: '⚖️',
  },
]

export default async function HRCompliancePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch a country count that has employment rules data
  const { data: countryCounts } = await supabase
    .schema('gpe')
    .from('employment_rules')
    .select('country_code')
    .eq('is_current', true)
    .eq('tier', 'free')

  const uniqueCountries = new Set((countryCounts ?? []).map(r => r.country_code)).size

  // Fetch sample countries for the preview strip
  const { data: sampleRules } = await supabase
    .schema('gpe')
    .from('employment_rules')
    .select('country_code')
    .eq('rule_type', 'minimum_wage')
    .eq('is_current', true)
    .eq('tier', 'free')
    .limit(12)

  const sampleCodes = [...new Set((sampleRules ?? []).map(r => r.country_code))]

  const { data: sampleCountries } = await supabase
    .from('countries')
    .select('iso2, name, flag_emoji')
    .in('iso2', sampleCodes)

  return (
    <main className="bg-white">

      {/* Hero */}
      <section className="relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 0% 100%, rgba(14,30,80,0.4) 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-blue-300 text-xs font-semibold tracking-wide">Global Employment Law Intelligence</span>
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white leading-tight mb-6" style={{ letterSpacing: '-0.025em' }}>
              HR Compliance &<br /><span className="text-blue-400">Employment Law</span><br />by Country.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mb-10">
              Minimum wage floors, leave entitlements, notice obligations, and probation rules
              for {uniqueCountries > 0 ? uniqueCountries : 'leading'} countries — sourced directly from official
              government and labour authority publications.
            </p>

            {/* Topic quick links */}
            <div className="flex flex-wrap gap-3">
              {TOPICS.map(t => (
                <Link key={t.slug} href={`/hr-compliance/${t.slug}/`}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 rounded-xl px-4 py-2.5 transition-all group">
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">{t.title}</span>
                  <ArrowRight size={11} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          {/* Stat strip */}
          <div className="mt-14 pt-10 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: uniqueCountries > 0 ? `${uniqueCountries}+` : '20+', label: 'Countries', sub: 'With full data' },
              { value: '5',    label: 'Topic Areas',   sub: 'Covered in depth' },
              { value: 'Free', label: 'Core Access',   sub: 'No account needed' },
              { value: 'Monthly', label: 'Updates', sub: 'Always current' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black text-white tracking-tight">{s.value}</div>
                <div className="text-sm font-bold text-slate-300 mt-1">{s.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Country preview strip */}
      {sampleCountries && sampleCountries.length > 0 && (
        <section className="bg-slate-900 border-b border-slate-800 py-4 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-widest shrink-0">Data available for:</span>
              {sampleCountries.map(c => (
                <div key={c.iso2} className="flex items-center gap-2 shrink-0">
                  <img src={`https://flagcdn.com/20x15/${c.iso2.toLowerCase()}.png`} alt={c.name} width={20} height={15} className="rounded-sm" />
                  <span className="text-slate-400 text-xs font-medium">{c.name}</span>
                </div>
              ))}
              <Link href="/countries/" className="text-blue-400 text-xs font-semibold shrink-0 hover:text-blue-300 transition-colors">
                + more →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Topic cards */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="mb-12">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Comparison Data</p>
            <div className="flex items-end justify-between gap-6">
              <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                Browse by topic.
              </h2>
              <p className="hidden lg:block text-slate-500 max-w-md leading-relaxed">
                Each topic page shows a full country-by-country comparison table — sortable, filterable, and exportable to CSV.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TOPICS.map(t => (
              <Link key={t.slug} href={`/hr-compliance/${t.slug}/`}
                className={`group bg-white border border-slate-200 ${t.border} rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col`}>
                <div className={`h-1.5 ${t.top}`} />
                <div className="p-7 flex flex-col flex-1">
                  <div className={`inline-flex p-3 rounded-xl ${t.accent} w-fit mb-5`}>
                    <t.icon size={22} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-3 leading-tight">{t.title} by Country</h3>
                  <p className="text-slate-500 text-sm leading-relaxed flex-1">{t.description}</p>
                  <div className="mt-6 flex items-center gap-1.5 text-blue-600 text-sm font-semibold group-hover:gap-2.5 transition-all">
                    View comparison <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance areas */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="mb-12">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Key Areas</p>
            <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              What every global employer<br />needs to know.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {COMPLIANCE_AREAS.map(area => (
              <div key={area.title} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{area.icon}</div>
                <h3 className="font-bold text-slate-900 mb-2">{area.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{area.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA to country pages */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="bg-slate-900 rounded-2xl p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-white mb-3">Need a full country employment law profile?</h2>
              <p className="text-slate-400 leading-relaxed max-w-xl">
                Each country page includes the full employment law picture — contracts, termination, leave, working time, payroll obligations, and official source links.
              </p>
            </div>
            <Link href="/countries/"
              className="shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-sm">
              Browse all countries <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-amber-800 text-sm leading-relaxed">
              <span className="font-bold">Data disclaimer:</span> Employment law data is sourced from official government and labour authority publications and is reviewed monthly. This data is provided for reference purposes only and does not constitute legal advice. Always verify current requirements with a qualified local employment lawyer before making HR or hiring decisions.
            </p>
          </div>
        </div>
      </section>

    </main>
  )
}
