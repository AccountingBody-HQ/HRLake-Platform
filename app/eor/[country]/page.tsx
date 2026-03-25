import Link from 'next/link'
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, AlertCircle, Building2, Shield, Clock, DollarSign, ChevronRight } from 'lucide-react'
import EORCostEstimator from '@/components/EORCostEstimator'

const COUNTRY_DATA: Record<string, {
  name: string; flag: string; currency: string; risk: string; speed: string;
  eorAvailable: boolean; eorMaturity: string;
  providerFeeRangeLow: number; providerFeeRangeHigh: number;
  ssEmployer: string; incomeTaxRange: string;
  directProsCons: { pros: string[]; cons: string[] };
  eorProsCons:    { pros: string[]; cons: string[] };
  recommendation: string; recommendationDetail: string;
  complianceRisks: { risk: string; detail: string; severity: 'High' | 'Medium' | 'Low' }[];
  keyFacts: { label: string; value: string }[];
}> = {
  gb: {
    name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', risk: 'Low', speed: 'Fast',
    eorAvailable: true, eorMaturity: 'Mature',
    providerFeeRangeLow: 8, providerFeeRangeHigh: 15,
    ssEmployer: '13.8%', incomeTaxRange: '20–45%',
    directProsCons: {
      pros: ['Full control over employment terms', 'No provider markup costs at scale', 'Direct relationship with employee'],
      cons: ['Requires UK legal entity', 'Payroll bureau and HR overhead', 'Liable for all compliance failures'],
    },
    eorProsCons: {
      pros: ['Hire in days, not months', 'Provider handles PAYE, NI, pensions auto-enrolment', 'No UK entity required'],
      cons: ['8–15% markup on employer cost', 'Less direct control over employment contract terms', 'IR35 status must still be assessed by you'],
    },
    recommendation: 'EOR for first 1–5 UK hires',
    recommendationDetail: 'The UK has a mature EOR market with strong provider competition. For initial hires or testing the market, EOR is the clear choice. Once you have 10+ permanent UK employees, evaluate setting up a UK Ltd company to reduce ongoing markup costs.',
    complianceRisks: [
      { risk: 'IR35 / Off-payroll working rules', detail: 'If you engage contractors through a PSC, IR35 status determination is your responsibility as the end client. Misclassification can result in significant HMRC liability.', severity: 'High' },
      { risk: 'Auto-enrolment pension', detail: 'Employers must auto-enrol eligible workers into a qualifying pension scheme. Your EOR provider will handle this, but confirm the scheme meets minimum requirements.', severity: 'Medium' },
      { risk: 'National Living Wage compliance', detail: 'The NLW increases annually in April. Your EOR must apply the correct rate immediately — confirm your provider\'s update process.', severity: 'Medium' },
      { risk: 'Right to Work checks', detail: 'Employers must verify employees have the right to work in the UK before employment begins. This obligation does not transfer to the EOR — you remain responsible.', severity: 'High' },
    ],
    keyFacts: [
      { label: 'Employer NI rate', value: '13.8% above £9,100/yr' },
      { label: 'Apprenticeship Levy', value: '0.5% of payroll over £3m' },
      { label: 'Auto-enrolment minimum', value: '3% employer pension contribution' },
      { label: 'Statutory notice (1 yr+)', value: '1 week per year of service' },
      { label: 'Minimum wage (2025)', value: '£12.21/hr (age 21+)' },
      { label: 'EOR providers active', value: 'Deel, Remote, Rippling, Papaya, Oyster' },
    ],
  },
  de: {
    name: 'Germany', flag: '🇩🇪', currency: 'EUR', risk: 'Medium', speed: 'Fast',
    eorAvailable: true, eorMaturity: 'Mature',
    providerFeeRangeLow: 10, providerFeeRangeHigh: 18,
    ssEmployer: '~20%', incomeTaxRange: '14–45%',
    directProsCons: {
      pros: ['Full entity control', 'No EOR markup', 'Direct access to German collective agreements'],
      cons: ['GmbH setup takes 4–8 weeks, €25,000 minimum capital', 'Works council obligations at 5+ employees', 'Complex payroll with Sozialversicherung split across 5 branches'],
    },
    eorProsCons: {
      pros: ['Hire in days', 'Provider handles Sozialversicherung, Lohnsteuer, Kirchensteuer', 'No GmbH required'],
      cons: ['10–18% markup', 'Works council engagement becomes complex at scale', 'Provider controls employment contract template'],
    },
    recommendation: 'EOR strongly recommended for first German hires',
    recommendationDetail: 'Germany has one of the most complex payroll systems in Europe — five branches of social security, Kirchensteuer (church tax), solidarity surcharge, and mandatory works council rights at scale. EOR removes that burden entirely for early-stage hiring. Consider a GmbH once you have 15+ permanent employees.',
    complianceRisks: [
      { risk: 'Works council (Betriebsrat)', detail: 'Once you have 5+ employees in Germany, they have the right to establish a works council with co-determination rights on working hours, overtime, and some HR decisions.', severity: 'High' },
      { risk: 'Sozialversicherung complexity', detail: 'German SS splits across pension (RV), health (KV), unemployment (AV), long-term care (PV), and accident insurance (UV). Each has its own rates, caps, and filing requirements.', severity: 'High' },
      { risk: 'Kirchensteuer (church tax)', detail: 'Employees who are registered church members pay Kirchensteuer (8–9% of income tax). Employers must withhold this. Your EOR will handle it if you provide the employee\'s Steueridentifikationsnummer.', severity: 'Medium' },
      { risk: 'Termination protection', detail: 'After 6 months, employees gain full unfair dismissal protection under the Kündigungsschutzgesetz. Redundancy without cause is legally complex and expensive.', severity: 'High' },
    ],
    keyFacts: [
      { label: 'Employer SS (approx)', value: '~20% of gross salary' },
      { label: 'SS contribution cap', value: '€90,600/yr (West, 2025)' },
      { label: 'Minimum wage (2025)', value: '€12.82/hr' },
      { label: 'Minimum annual leave', value: '20 days (5-day week)' },
      { label: 'Notice period (4 yrs)', value: '4 weeks to month-end' },
      { label: 'EOR providers active', value: 'Deel, Remote, Rippling, Oyster, Boundless' },
    ],
  },
  fr: {
    name: 'France', flag: '🇫🇷', currency: 'EUR', risk: 'High', speed: 'Medium',
    eorAvailable: true, eorMaturity: 'Mature',
    providerFeeRangeLow: 12, providerFeeRangeHigh: 20,
    ssEmployer: '~30%', incomeTaxRange: '0–45%',
    directProsCons: {
      pros: ['Full entity control', 'Direct access to collective agreements (conventions collectives)', 'No markup at scale'],
      cons: ['SAS/SARL setup takes 4–6 weeks', 'Highest employer SS in western Europe (~30%)', 'Extremely complex termination process'],
    },
    eorProsCons: {
      pros: ['Hire in days', 'Provider navigates conventions collectives', 'No French entity required', 'Provider liable for social charges compliance'],
      cons: ['12–20% markup on already high employer cost', 'Provider controls contract template', 'Collective agreement coverage must still be determined'],
    },
    recommendation: 'EOR strongly recommended — France is high complexity',
    recommendationDetail: 'France has the most complex employment law environment in western Europe. Employer social charges of ~30%, mandatory collective agreement compliance, a 35-hour working week, 5 weeks minimum holiday, and one of the most employee-protective termination frameworks in the world. EOR is strongly recommended unless you plan to build a significant French operation (20+ employees).',
    complianceRisks: [
      { risk: 'Conventions collectives', detail: 'Most industries have a mandatory collective agreement (convention collective) that overrides statutory minimums on pay, hours, and benefits. Your EOR must apply the correct one.', severity: 'High' },
      { risk: 'Licenciement (dismissal process)', detail: 'Dismissal in France requires a formal entretien préalable (meeting), written grounds, and a waiting period. Constructive dismissal claims are common. Termination without cause is almost always challenged.', severity: 'High' },
      { risk: '35-hour working week', detail: 'Overtime beyond 35 hours per week attracts mandatory premium pay and triggers additional employer contributions. Annual hours accounts (forfait jours) are an alternative for senior employees.', severity: 'Medium' },
      { risk: 'Profit sharing (participation)', detail: 'Companies with 50+ employees must implement a statutory profit-sharing scheme. Your EOR should flag when you approach this threshold.', severity: 'Medium' },
    ],
    keyFacts: [
      { label: 'Employer SS (approx)', value: '~30% of gross salary' },
      { label: 'Minimum wage (SMIC 2025)', value: '€11.88/hr' },
      { label: 'Minimum annual leave', value: '25 working days (5 weeks)' },
      { label: 'Standard working week', value: '35 hours' },
      { label: 'Maternity leave', value: '16 weeks (employer + state)' },
      { label: 'EOR providers active', value: 'Deel, Remote, Papaya, Oyster, Globalization Partners' },
    ],
  },
  us: {
    name: 'United States', flag: '🇺🇸', currency: 'USD', risk: 'Low', speed: 'Fast',
    eorAvailable: true, eorMaturity: 'Mature',
    providerFeeRangeLow: 10, providerFeeRangeHigh: 18,
    ssEmployer: '7.65%', incomeTaxRange: '10–37%',
    directProsCons: {
      pros: ['Full control over benefits and compensation', 'No markup cost at scale', 'Direct employment relationship'],
      cons: ['State-by-state compliance (50 states)', 'Benefits administration complex and costly', 'At-will employment but state exceptions vary widely'],
    },
    eorProsCons: {
      pros: ['No need for state registrations', 'Provider handles FICA, FUTA, SUTA per state', 'Hire across any state immediately'],
      cons: ['10–18% markup', 'Benefits package less flexible than direct', 'Provider controls employer-side employment decisions'],
    },
    recommendation: 'EOR for multi-state hiring or international companies entering the US',
    recommendationDetail: 'The US has relatively low employer taxes (7.65% FICA) but enormous complexity across 50 states — each with different income tax, unemployment tax, workers\' compensation, and employment law. EOR is the fastest path to multi-state hiring. For international companies entering the US market, EOR removes the need to form a US entity before validating the market.',
    complianceRisks: [
      { risk: 'State-by-state employment law', detail: 'California, New York, and Washington have significantly more employee-protective laws than federal minimums. Minimum wage, paid leave, and classification rules vary dramatically by state.', severity: 'High' },
      { risk: 'Worker classification (1099 vs W-2)', detail: 'The IRS and state agencies apply different tests for contractor classification. Misclassification triggers back taxes, penalties, and potential class action exposure in states like California.', severity: 'High' },
      { risk: 'Workers\' compensation', detail: 'Mandatory in all states. Rates vary by industry and state. Your EOR handles this but confirm coverage extends to all states your employees work in.', severity: 'Medium' },
      { risk: 'Benefits compliance (ACA)', detail: 'Employers with 50+ full-time equivalent employees must offer ACA-compliant health coverage. Your EOR should track your headcount across all clients to identify when this applies.', severity: 'Medium' },
    ],
    keyFacts: [
      { label: 'FICA (employer)', value: '7.65% (SS 6.2% + Medicare 1.45%)' },
      { label: 'Federal minimum wage', value: '$7.25/hr (many states higher)' },
      { label: 'FUTA rate', value: '6% on first $7,000 (credits reduce to 0.6%)' },
      { label: 'At-will employment', value: 'Yes (with state exceptions)' },
      { label: 'Statutory leave (federal)', value: '12 weeks unpaid FMLA (50+ employees)' },
      { label: 'EOR providers active', value: 'Deel, Remote, Rippling, Gusto, Papaya, Oyster' },
    ],
  },
  sg: {
    name: 'Singapore', flag: '🇸🇬', currency: 'SGD', risk: 'Low', speed: 'Fast',
    eorAvailable: true, eorMaturity: 'Mature',
    providerFeeRangeLow: 9, providerFeeRangeHigh: 14,
    ssEmployer: '17%', incomeTaxRange: '0–22%',
    directProsCons: {
      pros: ['Low tax environment', 'Full operational control', 'No markup cost at scale'],
      cons: ['Pte Ltd setup required', 'CPF administration', 'At least one local director required by law'],
    },
    eorProsCons: {
      pros: ['No Pte Ltd required', 'Provider handles CPF contributions', 'English-language compliance — lowest admin burden in APAC', 'Fast onboarding (days)'],
      cons: ['9–14% markup', 'Local director still needed for some entity-level actions', 'Less flexibility on benefits design'],
    },
    recommendation: 'EOR ideal for APAC market entry via Singapore',
    recommendationDetail: 'Singapore is the easiest EOR market in Asia Pacific. English-language compliance, straightforward CPF rules, and a mature provider ecosystem make it the natural APAC entry point. EOR makes sense for the first 1–10 hires; a Pte Ltd becomes viable at 10–15+ permanent employees given the low setup complexity.',
    complianceRisks: [
      { risk: 'CPF contributions', detail: 'Central Provident Fund contributions apply to Singapore Citizens and PRs only. Employer rate is 17% for employees under 55. Employment Pass and S Pass holders are exempt.', severity: 'Medium' },
      { risk: 'Work pass management', detail: 'EP, S Pass, and work permit quotas are tied to local employee ratios. Your EOR must manage pass renewals and quota compliance carefully.', severity: 'High' },
      { risk: 'Progressive wage model', detail: 'Minimum wage frameworks apply in specific sectors (cleaning, security, landscape). Confirm your sector\'s requirements with your EOR provider.', severity: 'Low' },
      { risk: 'Personal Data Protection Act', detail: 'PDPA compliance applies to all employee data. Your EOR should have a compliant data processing agreement in place.', severity: 'Low' },
    ],
    keyFacts: [
      { label: 'Employer CPF rate', value: '17% (employees under 55)' },
      { label: 'CPF wage ceiling', value: 'S$6,800/month (ordinary wages)' },
      { label: 'Minimum annual leave', value: '7 days (rising to 14 after 8 years)' },
      { label: 'Corporate tax rate', value: '17% (with startup exemptions)' },
      { label: 'Income tax (top rate)', value: '22% (above S$1m)' },
      { label: 'EOR providers active', value: 'Deel, Remote, Velocity Global, Oyster' },
    ],
  },
}

const riskColour: Record<string, string> = {
  Low:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High:   'bg-red-50 text-red-700 border-red-200',
}
const severityColour: Record<string, string> = {
  High:   'border-l-red-500 bg-red-50',
  Medium: 'border-l-amber-500 bg-amber-50',
  Low:    'border-l-blue-400 bg-blue-50',
}
const severityBadge: Record<string, string> = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low:    'bg-blue-100 text-blue-700',
}

export async function generateStaticParams() {
  return Object.keys(COUNTRY_DATA).map(code => ({ country: code }))
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params
  const data = COUNTRY_DATA[country]
  if (!data) return { title: 'EOR Guide | GlobalPayrollExpert' }
  return {
    title: `EOR Guide: ${data.name} | GlobalPayrollExpert`,
    description: `Employer of Record guide for ${data.name}. EOR availability, provider fees, compliance risks, and EOR vs direct employment comparison.`,
  }
}

export default async function EORCountryPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params
  const data = COUNTRY_DATA[country]

  if (!data) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <p className="text-5xl mb-6">🌍</p>
          <h1 className="font-serif text-3xl font-bold text-slate-900 mb-4">EOR guide coming soon</h1>
          <p className="text-slate-500 mb-8">We are building detailed EOR guides for all 195 countries. This one is in progress.</p>
          <Link href="/eor/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
            <ArrowLeft size={15} /> Back to EOR hub
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">

      {/* ══════ HERO ══════ */}
      <section className="relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0" style={{background: 'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%)'}} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16">
          <Link href="/eor/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium mb-8 transition-colors">
            <ArrowLeft size={15} /> EOR Intelligence
          </Link>
          <div className="flex items-start justify-between gap-8">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">{data.flag}</span>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white tracking-tight">{data.name}</h1>
                  </div>
                  <p className="text-slate-400">Employer of Record Guide</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${riskColour[data.risk]}`}>
                  {data.risk} compliance risk
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border bg-blue-600/10 text-blue-300 border-blue-500/20">
                  {data.eorMaturity} EOR market
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border bg-white/5 text-slate-300 border-white/10">
                  Hire speed: {data.speed}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ BREADCRUMB STRIP ══════ */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/eor/" className="hover:text-slate-300 transition-colors">EOR</Link>
          <ChevronRight size={12} />
          <span className="text-slate-400">{data.name}</span>
        </div>
      </div>

      {/* ══════ KEY FACTS ══════ */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {data.keyFacts.map(f => (
              <div key={f.label} className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{f.label}</p>
                <p className="text-slate-900 font-bold text-sm leading-snug">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ RECOMMENDATION ══════ */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-start">

            {/* Recommendation box */}
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">Our Recommendation</p>
              <div className="bg-blue-600 rounded-2xl p-8 text-white mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 size={22} />
                  <h2 className="font-serif text-2xl font-bold">{data.recommendation}</h2>
                </div>
                <p className="text-blue-100 leading-relaxed">{data.recommendationDetail}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <p className="text-slate-700 text-sm font-bold mb-4">EOR provider fee range for {data.name}</p>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-black text-slate-900">{data.providerFeeRangeLow}–{data.providerFeeRangeHigh}%</span>
                  <span className="text-slate-500 text-sm pb-1">on top of total employer cost</span>
                </div>
                <p className="text-slate-400 text-xs mt-3">
                  Rates vary by provider, headcount, and benefits scope. Always request itemised quotes from at least three providers.
                </p>
              </div>
            </div>

            {/* EOR vs Direct comparison */}
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">EOR vs Direct Employment</p>
              <div className="grid gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <p className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <CheckCircle size={17} className="text-blue-600" /> EOR advantages in {data.name}
                  </p>
                  <ul className="space-y-2.5">
                    {data.eorProsCons.pros.map(p => (
                      <li key={p} className="flex gap-2.5 text-sm text-blue-800">
                        <CheckCircle size={15} className="text-blue-500 shrink-0 mt-0.5" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <p className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <AlertCircle size={17} className="text-amber-500" /> EOR limitations in {data.name}
                  </p>
                  <ul className="space-y-2.5">
                    {data.eorProsCons.cons.map(c => (
                      <li key={c} className="flex gap-2.5 text-sm text-slate-600">
                        <XCircle size={15} className="text-slate-400 shrink-0 mt-0.5" />{c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ COMPLIANCE RISKS ══════ */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">Compliance Risks</p>
          <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Key EOR compliance risks in {data.name}.
          </h2>
          <p className="text-slate-500 mb-10 max-w-2xl">
            These are the most important compliance issues for employers using EOR in {data.name}. 
            Discuss each with your chosen provider before signing.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {data.complianceRisks.map(r => (
              <div key={r.risk} className={`border-l-4 rounded-r-2xl p-6 ${severityColour[r.severity]}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="font-bold text-slate-900 text-sm">{r.risk}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${severityBadge[r.severity]}`}>
                    {r.severity}
                  </span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{r.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ COST ESTIMATOR ══════ */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">Cost Estimator</p>
          <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight mb-8">
            Estimate your {data.name} EOR cost.
          </h2>
          <EORCostEstimator />
        </div>
      </section>

      {/* ══════ FOOTER CTA ══════ */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 mb-1">Need full payroll data for {data.name}?</p>
              <p className="text-slate-500 text-sm">Income tax brackets, social security rates, employment law, and payroll calculator.</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href={`/countries/${country}/`}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-3 rounded-xl transition-colors text-sm">
                {data.name} country page <ArrowRight size={14} />
              </Link>
              <Link href="/eor/"
                className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-5 py-3 rounded-xl transition-colors text-sm">
                <ArrowLeft size={14} /> All EOR guides
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
