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

  nl: {
    name: 'Netherlands', flag: '🇳🇱', currency: 'EUR', risk: 'Low', speed: 'Fast',
    eorAvailable: true, eorMaturity: 'Mature',
    providerFeeRangeLow: 10, providerFeeRangeHigh: 17,
    ssEmployer: '~19%', incomeTaxRange: '9–49.5%',
    directProsCons: {
      pros: ['Full operational control', 'No markup at scale', 'Access to collective labour agreements (CAOs)'],
      cons: ['BV setup required', 'Complex payroll with holiday allowance (vakantiegeld)', 'Works council rights at 50+ employees'],
    },
    eorProsCons: {
      pros: ['Hire in days', 'Provider handles vakantiegeld (8% holiday pay)', 'No BV required', 'Clear contractor classification framework'],
      cons: ['10–17% markup', 'Provider controls employment contract template', 'Less flexibility on benefits design'],
    },
    recommendation: 'EOR ideal for first Dutch hires',
    recommendationDetail: 'The Netherlands has a business-friendly environment with predictable EOR costs. The main complexity is the mandatory 8% holiday allowance (vakantiegeld) and sector-specific collective agreements (CAOs). EOR providers handle both well. Consider a BV once you exceed 10–15 permanent employees.',
    complianceRisks: [
      { risk: 'Vakantiegeld (holiday pay)', detail: 'Employers must accrue and pay an 8% holiday allowance on top of gross salary, typically paid in May. Your EOR must handle this correctly in payroll calculations.', severity: 'Medium' },
      { risk: 'Wet DBA contractor classification', detail: 'The Netherlands has strict rules distinguishing employees from contractors. The Wet DBA framework means misclassification carries significant risk. EOR removes this risk entirely.', severity: 'High' },
      { risk: 'Collective agreements (CAOs)', detail: 'Many sectors have mandatory CAOs that set minimum pay above statutory minimums. Your EOR must identify and apply the correct CAO for your industry.', severity: 'Medium' },
      { risk: 'Transition payment on dismissal', detail: 'Employees are entitled to a transition payment (transitievergoeding) when dismissed, calculated at 1/3 month salary per year of service. Plan for this cost.', severity: 'Medium' },
    ],
    keyFacts: [
      { label: 'Employer SS (approx)', value: '~19% of gross salary' },
      { label: 'Holiday allowance', value: '8% of annual gross (vakantiegeld)' },
      { label: 'Minimum wage (2025)', value: '€13.27/hr' },
      { label: 'Minimum annual leave', value: '20 days (4 × weekly hours)' },
      { label: 'Corporate tax rate', value: '19% (up to €200k), 25.8% above' },
      { label: 'EOR providers active', value: 'Deel, Remote, Oyster, Boundless' },
    ],
  },
  es: {
    name: 'Spain', flag: '🇪🇸', currency: 'EUR', risk: 'Medium', speed: 'Medium',
    eorAvailable: true, eorMaturity: 'Mature',
    providerFeeRangeLow: 11, providerFeeRangeHigh: 18,
    ssEmployer: '~30%', incomeTaxRange: '19–47%',
    directProsCons: {
      pros: ['Full entity control', 'No markup at scale', 'Direct access to collective agreements (convenios)'],
      cons: ['SL setup takes 4–6 weeks', 'High employer SS (~30%)', 'Complex termination process with mandatory severance'],
    },
    eorProsCons: {
      pros: ['Hire in days', 'Provider navigates convenios colectivos', 'No Spanish entity required', 'Provider manages mandatory severance accrual'],
      cons: ['11–18% markup on high employer cost', 'Collective agreement must still be determined', 'Less control over employment terms'],
    },
    recommendation: 'EOR recommended for first Spanish hires',
    recommendationDetail: 'Spain combines high employer social security costs (~30%) with complex collective agreements and significant termination costs. EOR is strongly recommended for the first 1–10 hires. The mandatory severance of 20 days per year of service on dismissal is a significant cost to plan for, but your EOR provider will manage this correctly.',
    complianceRisks: [
      { risk: 'Mandatory severance (indemnización)', detail: 'Employees dismissed for objective reasons receive 20 days salary per year of service (capped at 12 months). Unfair dismissal awards 33 days per year. This cost must be budgeted from day one.', severity: 'High' },
      { risk: 'Convenios colectivos', detail: 'Sector collective agreements in Spain frequently set pay, hours, and benefits above statutory minimums. Your EOR must identify and apply the correct convenio for your industry.', severity: 'High' },
      { risk: 'High employer SS contributions', detail: 'Spanish employer contributions are among the highest in the EU at ~30% of gross salary. This significantly increases the true cost of employment versus the headline salary.', severity: 'Medium' },
      { risk: 'Working time records (registro horario)', detail: 'Since 2019, all employers must keep daily working time records for every employee. Non-compliance carries fines. Confirm your EOR has a compliant timekeeping system.', severity: 'Medium' },
    ],
    keyFacts: [
      { label: 'Employer SS (approx)', value: '~30% of gross salary' },
      { label: 'Minimum wage (SMI 2025)', value: '€1,134/month (14 payments)' },
      { label: 'Minimum annual leave', value: '22 working days' },
      { label: 'Notice period', value: '15 days (statutory minimum)' },
      { label: 'Severance (objective)', value: '20 days/year (max 12 months)' },
      { label: 'EOR providers active', value: 'Deel, Remote, Papaya, Oyster' },
    ],
  },
  ae: {
    name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', risk: 'Low', speed: 'Fast',
    eorAvailable: true, eorMaturity: 'Mature',
    providerFeeRangeLow: 10, providerFeeRangeHigh: 16,
    ssEmployer: '12.5%', incomeTaxRange: '0%',
    directProsCons: {
      pros: ['No income tax on employees', 'Full operational control', 'Free zone entity options available'],
      cons: ['Mainland vs free zone entity decision complex', 'DEWS pension scheme for free zone employees', 'Local sponsor requirement for mainland entities'],
    },
    eorProsCons: {
      pros: ['No UAE entity required', 'Provider handles DEWS contributions', 'Fast onboarding — days', 'No income tax simplifies payroll significantly'],
      cons: ['10–16% markup', 'Provider controls employment contract', 'Free zone vs mainland status still relevant'],
    },
    recommendation: 'EOR well-suited for UAE market entry',
    recommendationDetail: 'The UAE is one of the simplest EOR markets globally. Zero income tax eliminates a major layer of payroll complexity. The main considerations are the DEWS (Daman End of Service) pension scheme for free zone employees and the mainland vs free zone distinction. EOR providers handle both well. Consider a free zone entity for 10+ permanent employees given the tax advantages.',
    complianceRisks: [
      { risk: 'DEWS end-of-service gratuity', detail: 'Employees in UAE free zones are covered by DEWS (Daman), a mandatory savings scheme replacing the traditional end-of-service gratuity. Employer contributions are 5.83% of monthly salary. Your EOR must enrol eligible employees.', severity: 'Medium' },
      { risk: 'Mainland vs free zone distinction', detail: 'Employment law and entity requirements differ between mainland UAE and free zones. Confirm with your EOR which jurisdiction your employees will be employed in and what rules apply.', severity: 'Medium' },
      { risk: 'Visa and work permit management', detail: 'All expatriate employees require a UAE residence visa and work permit. Processing takes 2–4 weeks. Your EOR will sponsor the visa but you must provide required documents promptly.', severity: 'High' },
      { risk: 'End-of-service gratuity (mainland)', detail: 'Mainland employees are entitled to an end-of-service gratuity of 21 days pay per year for the first 5 years, then 30 days per year after. This accrues from day one and must be budgeted.', severity: 'Medium' },
    ],
    keyFacts: [
      { label: 'Income tax', value: '0% (no personal income tax)' },
      { label: 'DEWS contribution', value: '5.83% employer (free zone)' },
      { label: 'Gratuity (mainland)', value: '21 days/yr (first 5 yrs)' },
      { label: 'Minimum annual leave', value: '30 calendar days' },
      { label: 'Corporate tax rate', value: '9% (above AED 375,000 profit)' },
      { label: 'EOR providers active', value: 'Deel, Remote, Velocity Global, Oyster' },
    ],
  },
  jp: {
    name: 'Japan', flag: '🇯🇵', currency: 'JPY', risk: 'High', speed: 'Slow',
    eorAvailable: true, eorMaturity: 'Developing',
    providerFeeRangeLow: 12, providerFeeRangeHigh: 20,
    ssEmployer: '~16%', incomeTaxRange: '5–45%',
    directProsCons: {
      pros: ['Full entity control', 'Direct employment relationship valued culturally', 'No markup at scale'],
      cons: ['KK setup takes 2–3 months, ¥10m capital', 'Complex four-pillar social insurance system', 'Very strong employee protections — termination extremely difficult'],
    },
    eorProsCons: {
      pros: ['Hire without a KK entity', 'Provider handles shakai hoken (social insurance)', 'Access to limited EOR provider network in Japan'],
      cons: ['12–20% markup', 'Fewer providers than Western markets', 'Cultural expectation of direct employment at senior levels', 'Termination still complex even via EOR'],
    },
    recommendation: 'EOR with careful provider selection — Japan requires specialist knowledge',
    recommendationDetail: 'Japan is one of the most complex EOR markets in the world. Strong employee protections, a four-pillar social insurance system, complex tax withholding, and cultural expectations around employment make specialist provider selection critical. Use only providers with a proven Japan track record. Plan for slow onboarding (4–8 weeks) and budget for significantly higher employer costs than the headline salary suggests.',
    complianceRisks: [
      { risk: 'Termination protection', detail: 'Japan has some of the strongest employee protections in the world. Dismissal without "objectively reasonable grounds" is void under the Labour Contract Act. Even EOR providers cannot easily terminate employees — plan entry and exit strategies carefully.', severity: 'High' },
      { risk: 'Four-pillar social insurance', detail: 'Japanese employers must enrol employees in health insurance (kenpo), pension (kosei nenkin), employment insurance (koyo hoken), and workers compensation (rousai). Each has its own rules, rates, and filing requirements.', severity: 'High' },
      { risk: 'Residency and visa requirements', detail: 'Working in Japan requires a valid work visa. Processing can take 6–12 weeks. Your EOR cannot sponsor visas for all visa types — confirm your employee's eligibility before engagement.', severity: 'High' },
      { risk: 'Year-end tax adjustment (nenmatsu chosei)', detail: 'Unlike most countries, Japan's year-end tax settlement is handled by the employer, not the employee. Your EOR must run this process correctly in December each year.', severity: 'Medium' },
    ],
    keyFacts: [
      { label: 'Employer SS (approx)', value: '~16% of gross salary' },
      { label: 'Minimum wage (Tokyo)', value: '¥1,163/hr (2024)' },
      { label: 'Minimum annual leave', value: '10 days (after 6 months)' },
      { label: 'Standard working hours', value: '8hrs/day, 40hrs/week' },
      { label: 'Overtime premium', value: '25% (60hrs+/month: 50%)' },
      { label: 'EOR providers active', value: 'Deel, Remote, Globalization Partners, Velocity Global' },
    ],
  },
  au: {
    name: 'Australia', flag: '🇦🇺', currency: 'AUD', risk: 'Low', speed: 'Fast',
    eorAvailable: true, eorMaturity: 'Mature',
    providerFeeRangeLow: 9, providerFeeRangeHigh: 15,
    ssEmployer: '11%', incomeTaxRange: '0–45%',
    directProsCons: {
      pros: ['Full entity control', 'No markup at scale', 'Direct compliance with Fair Work Act'],
      cons: ['Pty Ltd setup required', 'Superannuation administration', 'Modern Award system adds complexity'],
    },
    eorProsCons: {
      pros: ['No Pty Ltd required', 'Provider handles superannuation (11%)', 'Fair Work Act compliance managed by provider', 'Fast onboarding'],
      cons: ['9–15% markup', 'Modern Award classification must still be determined', 'Provider controls employment contract template'],
    },
    recommendation: 'EOR ideal for initial Australian hires',
    recommendationDetail: 'Australia has a mature EOR market with strong provider competition. The mandatory 11% superannuation contribution and the Modern Award system (which sets minimum pay by industry and role) are the key compliance areas. EOR providers handle both well. Consider a Pty Ltd once you have 10+ permanent employees.',
    complianceRisks: [
      { risk: 'Superannuation guarantee', detail: 'Employers must contribute 11% of ordinary time earnings to a complying super fund (rising to 12% by 2025). Missed or late contributions trigger the Superannuation Guarantee Charge with penalties.', severity: 'High' },
      { risk: 'Modern Award coverage', detail: 'Most employees in Australia are covered by a Modern Award that sets minimum pay rates, penalty rates, and allowances above the National Minimum Wage. Your EOR must classify employees correctly.', severity: 'High' },
      { risk: 'Fair Work Act compliance', detail: 'The Fair Work Act sets the National Employment Standards (NES) — 10 minimum entitlements including annual leave (4 weeks), sick leave (10 days), and parental leave. All must be observed.', severity: 'Medium' },
      { risk: 'Payroll tax (state-level)', detail: 'Each Australian state levies payroll tax once your total payroll exceeds a state-specific threshold. Rates range from 4.75% to 6.85%. Your EOR must manage state registrations correctly.', severity: 'Medium' },
    ],
    keyFacts: [
      { label: 'Superannuation rate', value: '11% of ordinary time earnings' },
      { label: 'National minimum wage', value: 'A$24.10/hr (2024–25)' },
      { label: 'Minimum annual leave', value: '4 weeks (20 days)' },
      { label: 'Personal/sick leave', value: '10 days per year' },
      { label: 'Notice period', value: '1–4 weeks (service-based)' },
      { label: 'EOR providers active', value: 'Deel, Remote, Rippling, Oyster, Velocity Global' },
    ],
  },
  ca: {
    name: 'Canada', flag: '🇨🇦', currency: 'CAD', risk: 'Low', speed: 'Fast',
    eorAvailable: true, eorMaturity: 'Mature',
    providerFeeRangeLow: 9, providerFeeRangeHigh: 15,
    ssEmployer: '~7.5%', incomeTaxRange: '15–33%',
    directProsCons: {
      pros: ['Full entity control', 'No markup at scale', 'Familiar common-law employment framework'],
      cons: ['Provincial variation across 13 jurisdictions', 'Corporation setup required per province', 'CPP, EI, and WSIB all have separate rules'],
    },
    eorProsCons: {
      pros: ['Hire across any province immediately', 'Provider handles CPP, EI, WSIB per province', 'No corporation required', 'Fast onboarding'],
      cons: ['9–15% markup', 'Provincial employment standards still vary', 'Provider controls contract template'],
    },
    recommendation: 'EOR ideal for multi-province hiring or international market entry',
    recommendationDetail: 'Canada is an accessible EOR market with relatively low employer taxes (~7.5%). The main complexity is provincial variation — employment standards, minimum wage, and workers compensation rules differ across 13 provinces and territories. EOR providers handle this well, making Canada one of the easiest international EOR destinations for US and UK companies.',
    complianceRisks: [
      { risk: 'Provincial employment standards variation', detail: 'Each province has its own Employment Standards Act with different minimums for notice, severance, vacation, and overtime. Ontario, Quebec, and BC have materially different rules. Your EOR must apply the correct provincial rules.', severity: 'High' },
      { risk: 'Quebec specifics', detail: 'Quebec operates under a distinct civil law system with additional requirements including Bill 96 (French language requirements for employment contracts). Confirm your EOR has Quebec-specific expertise.', severity: 'High' },
      { risk: 'CPP and EI contributions', detail: 'Canada Pension Plan (CPP) and Employment Insurance (EI) are mandatory contributions. Employer CPP rate is 5.95% (2025). EI employer rate is 1.4× the employee rate. Your EOR handles both.', severity: 'Medium' },
      { risk: 'WSIB / workers compensation', detail: 'Workers compensation is provincially administered and mandatory. Rates vary by industry and province. Your EOR must register in each province where employees work.', severity: 'Medium' },
    ],
    keyFacts: [
      { label: 'Employer CPP rate', value: '5.95% (2025)' },
      { label: 'Employer EI rate', value: '~1.66% (1.4× employee rate)' },
      { label: 'Federal minimum wage', value: 'C$17.30/hr (2024)' },
      { label: 'Minimum vacation', value: '2 weeks (rises to 3 after 5 yrs)' },
      { label: 'Statutory notice', value: '1–8 weeks (province-dependent)' },
      { label: 'EOR providers active', value: 'Deel, Remote, Rippling, Oyster, Papaya' },
    ],
  },
  in: {
    name: 'India', flag: '🇮🇳', currency: 'INR', risk: 'High', speed: 'Medium',
    eorAvailable: true, eorMaturity: 'Mature',
    providerFeeRangeLow: 12, providerFeeRangeHigh: 22,
    ssEmployer: '12%', incomeTaxRange: '0–30%',
    directProsCons: {
      pros: ['Full entity control', 'No markup at scale', 'Large talent pool at competitive salaries'],
      cons: ['Private Limited company setup takes 2–4 months', 'State-level labour law variation across 28 states', 'Complex statutory compliance (PF, ESI, PT, gratuity)'],
    },
    eorProsCons: {
      pros: ['Hire in weeks without an Indian entity', 'Provider handles PF, ESI, PT filings', 'Access to large EOR provider network in India', 'Provider manages state-level compliance variation'],
      cons: ['12–22% markup', 'High base complexity increases risk of provider errors', 'State-level PT rates still vary', 'Senior hires often prefer direct employment relationships'],
    },
    recommendation: 'EOR strongly recommended for first Indian hires — complexity is high',
    recommendationDetail: 'India has one of the largest EOR markets in the world but also one of the most complex regulatory environments. Provident Fund (PF), Employee State Insurance (ESI), Professional Tax (PT), Labour Welfare Fund (LWF), and gratuity all operate under different rules with state-level variation. EOR is strongly recommended unless you are building a 50+ person team, in which case a Private Limited company with a local HR manager becomes viable.',
    complianceRisks: [
      { risk: 'Provident Fund (PF) compliance', detail: 'Mandatory for organisations with 20+ employees. Employer contribution is 12% of basic salary. Late deposits attract interest and penalties. Your EOR must file monthly ECR returns with EPFO.', severity: 'High' },
      { risk: 'Employee State Insurance (ESI)', detail: 'Mandatory for employees earning up to ₹21,000/month. Employer ESI rate is 3.25%. Applies to establishments with 10+ employees. Your EOR handles registration and monthly filings.', severity: 'High' },
      { risk: 'Gratuity obligation', detail: 'Employees with 5+ years of continuous service are entitled to gratuity of 15 days salary per year of service. This is a significant exit cost for long-tenure employees that must be budgeted.', severity: 'High' },
      { risk: 'State-level Professional Tax (PT)', detail: 'Professional Tax is levied by individual states at varying rates (max ₹2,500/year). Your EOR must register and file in each state where employees are based.', severity: 'Medium' },
    ],
    keyFacts: [
      { label: 'Employer PF contribution', value: '12% of basic salary' },
      { label: 'Employer ESI contribution', value: '3.25% (up to ₹21,000/month)' },
      { label: 'Minimum wages', value: 'State-specific (varies widely)' },
      { label: 'Gratuity entitlement', value: '15 days/yr after 5 yrs service' },
      { label: 'Income tax (top rate)', value: '30% above ₹15 lakh/year' },
      { label: 'EOR providers active', value: 'Deel, Remote, Rippling, Papaya, Multiplier' },
    ],
  },
  ie: {
    name: 'Ireland', flag: '🇮🇪', currency: 'EUR', risk: 'Low', speed: 'Fast',
    eorAvailable: true, eorMaturity: 'Mature',
    providerFeeRangeLow: 9, providerFeeRangeHigh: 15,
    ssEmployer: '11.15%', incomeTaxRange: '20–40%',
    directProsCons: {
      pros: ['Low corporate tax (12.5%)', 'Full entity control', 'English-language compliance'],
      cons: ['Limited company setup required', 'PRSI and USC administration', 'Employment law becoming increasingly employee-protective'],
    },
    eorProsCons: {
      pros: ['No Irish entity required', 'Provider handles PAYE, PRSI, USC', 'English-language — lowest compliance burden in the EU', 'Fast onboarding'],
      cons: ['9–15% markup', 'Provider controls contract template', 'Less flexibility on benefits'],
    },
    recommendation: 'EOR ideal — Ireland is the easiest EU EOR market',
    recommendationDetail: 'Ireland is the most accessible EOR destination in the EU. English-language compliance, a straightforward two-rate income tax system, and low employer PRSI (11.15%) make it significantly simpler than France, Germany, or Spain. It is the natural EU entry point for US and UK companies. Consider a Limited company once you have 10+ permanent Irish employees, given the attractive 12.5% corporate tax rate.',
    complianceRisks: [
      { risk: 'PRSI classification', detail: 'Pay Related Social Insurance (PRSI) class must be correctly assigned. Most employees are Class A1 (11.15% employer). Incorrect classification leads to underpayment and Revenue penalties.', severity: 'Medium' },
      { risk: 'Universal Social Charge (USC)', detail: 'USC is an additional income levy (0.5–8%) that must be withheld by the employer through payroll. Your EOR handles USC withholding as part of the PAYE system.', severity: 'Low' },
      { risk: 'Employment (Collective Redundancies) Act', detail: 'Collective redundancies (20+ employees within 30 days) require 30 days advance notice to the Minister for Enterprise. Even EOR headcount may count toward this threshold across all clients.', severity: 'Low' },
      { risk: 'Remote working policy obligations', detail: 'Ireland's Right to Request Remote Working legislation requires employers to have a formal remote working policy and to consider and respond formally to all remote working requests.', severity: 'Low' },
    ],
    keyFacts: [
      { label: 'Employer PRSI rate', value: '11.15% (Class A1)' },
      { label: 'Minimum wage (2025)', value: '€13.50/hr' },
      { label: 'Minimum annual leave', value: '20 days (4 weeks)' },
      { label: 'Income tax rates', value: '20% / 40% (two-rate system)' },
      { label: 'Corporate tax rate', value: '12.5% (trading income)' },
      { label: 'EOR providers active', value: 'Deel, Remote, Boundless, Oyster' },
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
