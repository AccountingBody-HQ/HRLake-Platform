import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import ComplianceComparisonTable, { ComplianceRow } from '@/components/ComplianceComparisonTable'

const TOPICS: Record<string, {
  title: string
  description: string
  rule_type: string
  valueLabel: string
  formatValue: (row: any) => string
  icon: string
  color: string
}> = {
  'minimum-wage': {
    title: 'Minimum Wage by Country',
    description: 'The statutory minimum wage floor that employers must pay, sourced from official government and labour authority publications. Where no national minimum wage exists, collective agreements or sector-specific rates may apply.',
    rule_type: 'minimum_wage',
    valueLabel: 'Minimum Wage',
    icon: '💷',
    color: 'blue',
    formatValue: (row) => {
      if (row.value_text) return row.value_text
      if (row.value_numeric && row.value_unit) {
        const unit = row.value_unit
        const currency = unit.split('_')[0]
        const period = unit.includes('per_hour') ? '/hr' : unit.includes('per_month') ? '/mo' : ''
        return `${currency} ${row.value_numeric.toLocaleString()}${period}`
      }
      return '—'
    }
  },
  'annual-leave': {
    title: 'Annual Leave Entitlements by Country',
    description: 'Statutory minimum paid annual leave entitlement per year. Many employers offer more than the legal minimum. Entitlements shown are the floor set by law — part-time and fixed-term employees may have pro-rated rights.',
    rule_type: 'annual_leave',
    valueLabel: 'Annual Leave',
    icon: '🏖️',
    color: 'teal',
    formatValue: (row) => {
      if (row.value_text) return row.value_text
      if (row.value_numeric && row.value_unit) {
        return `${row.value_numeric} ${row.value_unit.replace(/_/g, ' ')}`
      }
      return '—'
    }
  },
  'notice-periods': {
    title: 'Notice Periods by Country',
    description: 'Minimum statutory notice period that employers must give employees on termination. Employee notice obligations and contractual notice periods often differ. Notice periods frequently increase with length of service.',
    rule_type: 'notice_period_min',
    valueLabel: 'Minimum Notice',
    icon: '📋',
    color: 'indigo',
    formatValue: (row) => {
      if (row.value_text) return row.value_text
      if (row.value_numeric && row.value_unit) {
        const unit = row.value_unit.replace(/_/g, ' ')
        return `${row.value_numeric} ${unit}`
      }
      return '—'
    }
  },
  'maternity-leave': {
    title: 'Maternity Leave by Country',
    description: 'Statutory maternity or primary carer leave entitlement. Paid versus unpaid status, qualifying conditions, and pay rates vary significantly by country. Always verify current rules with local legal counsel.',
    rule_type: 'maternity_leave',
    valueLabel: 'Maternity Leave',
    icon: '👶',
    color: 'sky',
    formatValue: (row) => {
      if (row.value_text) return row.value_text
      if (row.value_numeric && row.value_unit) {
        const unit = row.value_unit.replace(/_/g, ' ')
        return `${row.value_numeric} ${unit}`
      }
      return '—'
    }
  },
  'probation-periods': {
    title: 'Probation Periods by Country',
    description: 'Maximum statutory probation period allowed by law. During probation, reduced notice periods and different dismissal rules often apply. Some countries have abolished formal probation entirely.',
    rule_type: 'probation_period_max',
    valueLabel: 'Max Probation',
    icon: '🔍',
    color: 'violet',
    formatValue: (row) => {
      if (row.value_text) return row.value_text
      if (row.value_numeric && row.value_unit) {
        const unit = row.value_unit.replace(/_/g, ' ')
        return `${row.value_numeric} ${unit}`
      }
      return '—'
    }
  },
}

const COLOR_MAP: Record<string, { badge: string; heading: string; border: string; top: string }> = {
  blue:   { badge: 'bg-blue-50 text-blue-700',   heading: 'text-blue-600',   border: 'border-blue-200',   top: 'bg-blue-600' },
  teal:   { badge: 'bg-teal-50 text-teal-700',   heading: 'text-teal-600',   border: 'border-teal-200',   top: 'bg-teal-600' },
  indigo: { badge: 'bg-indigo-50 text-indigo-700', heading: 'text-indigo-600', border: 'border-indigo-200', top: 'bg-indigo-600' },
  sky:    { badge: 'bg-sky-50 text-sky-700',     heading: 'text-sky-600',    border: 'border-sky-200',    top: 'bg-sky-600' },
  violet: { badge: 'bg-violet-50 text-violet-700', heading: 'text-violet-600', border: 'border-violet-200', top: 'bg-violet-600' },
}

export async function generateStaticParams() {
  return Object.keys(TOPICS).map(topic => ({ topic }))
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params
  const config = TOPICS[topic]
  if (!config) return {}
  const year = new Date().getFullYear()
  const title = `${config.title} ${year}`
  return {
    title,
    description: config.description,
    alternates: {
      canonical: `https://globalpayrollexpert.com/hr-compliance/${topic}/`,
    },
    openGraph: {
      title,
      description: config.description,
      url: `https://globalpayrollexpert.com/hr-compliance/${topic}/`,
      siteName: 'GlobalPayrollExpert',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: config.description,
    },
  }
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params
  const config = TOPICS[topic]
  if (!config) notFound()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch employment rules for this topic from gpe schema
  const { data: rules, error: rulesError } = await supabase
    .schema('gpe')
    .from('employment_rules')
    .select('country_code, rule_type, value_text, value_numeric, value_unit, applies_to, notes, source_url')
    .eq('rule_type', config.rule_type)
    .eq('is_current', true)
    .eq('tier', 'free')

  // Fetch all countries for name/flag lookup
  const { data: countries } = await supabase
    .from('countries')
    .select('iso2, name, flag_emoji')

  const countryMap = new Map((countries ?? []).map(c => [c.iso2, c]))

  // Merge into ComplianceRow shape
  const rows: ComplianceRow[] = (rules ?? []).map(rule => {
    const country = countryMap.get(rule.country_code)
    return {
      country_code: rule.country_code,
      country_name: country?.name ?? rule.country_code,
      flag_emoji: country?.flag_emoji ?? '',
      value_display: config.formatValue(rule),
      value_numeric: rule.value_numeric,
      value_unit: rule.value_unit,
      applies_to: rule.applies_to,
      notes: rule.notes ?? null,
    }
  })

  const colors = COLOR_MAP[config.color]
  const otherTopics = Object.entries(TOPICS).filter(([k]) => k !== topic)

  return (
    <main className="bg-white flex-1">

      {/* Hero */}
      <section className="relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.12) 0%, transparent 60%)' }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-14">
          <Link href="/hr-compliance/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors mb-8">
            <ArrowLeft size={15} /> HR Compliance
          </Link>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-blue-300 text-xs font-semibold tracking-wide">Employment Law · {rows.length} Countries</span>
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white leading-tight mb-5" style={{ letterSpacing: '-0.02em' }}>
              {config.icon} {config.title}
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
              {config.description}
            </p>
          </div>
        </div>
      </section>

      {/* Table section */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          {rulesError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 text-sm">
              Unable to load data. Please try again later.
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <p className="text-lg font-medium mb-2">Data coming soon</p>
              <p className="text-sm">We are currently populating this dataset. Check back shortly.</p>
            </div>
          ) : (
            <ComplianceComparisonTable rows={rows} valueLabel={config.valueLabel} />
          )}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-amber-800 text-sm leading-relaxed">
              <span className="font-bold">Data disclaimer:</span> Employment law data is sourced from official government and labour authority publications and is updated regularly. This data is provided for reference purposes only and does not constitute legal advice. Always verify current requirements with a qualified local employment lawyer before making HR decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Other topics */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <h2 className="font-serif text-2xl font-bold text-slate-900 mb-8">Other compliance topics</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherTopics.map(([slug, t]) => (
              <Link key={slug} href={`/hr-compliance/${slug}/`}
                className="group bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-xl p-5 transition-all">
                <div className="text-2xl mb-3">{t.icon}</div>
                <div className="font-semibold text-slate-800 group-hover:text-blue-700 text-sm leading-snug transition-colors">{t.title}</div>
                <div className="flex items-center gap-1 text-blue-600 text-xs font-semibold mt-3 group-hover:gap-2 transition-all">
                  View data <ArrowRight size={11} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
