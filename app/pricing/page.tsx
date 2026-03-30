import Link from 'next/link'
import { ArrowRight, Check, X } from 'lucide-react'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Free and Pro Plans',
  description: 'GlobalPayrollExpert is free for all country data, calculators, and employment law guides. Upgrade to Pro for saved calculations, PDF exports, AI assistant, and rate-change alerts.',
  alternates: {
    canonical: 'https://globalpayrollexpert.com/pricing/',
  },
  openGraph: {
    title: 'Pricing — Free and Pro Plans',
    description: 'Free country data and calculators. Pro plan for saved calculations, PDF exports, and AI assistant.',
    url: 'https://globalpayrollexpert.com/pricing/',
    siteName: 'GlobalPayrollExpert',
    type: 'website',
  },
}



const FREE_FEATURES = [
  'All country payroll data pages',
  'Income tax brackets and rates',
  'Employer social security rates',
  'Employment law summaries',
  'Basic payroll calculator',
  'Country comparison tool',
  'Public insights articles',
  'EOR intelligence guides',
  'No account required',
]

const PRO_FEATURES = [
  'Everything in Free',
  'Save unlimited calculations',
  'Full PDF export of any calculation',
  'PayrollExpert AI assistant',
  'Priority data updates',
  'Termination rules (all countries)',
  'Contractor classification rules',
  'Double taxation treaty data',
  'Remote work tax rules',
  'Rate-change email alerts',
  'Pro data badge on all pages',
]

const COMPARISON = [
  { feature: 'Country payroll data pages',         free: true,  pro: true  },
  { feature: 'Income tax brackets',                free: true,  pro: true  },
  { feature: 'Employer social security rates',     free: true,  pro: true  },
  { feature: 'Employment law summaries',           free: true,  pro: true  },
  { feature: 'Basic payroll calculator',           free: true,  pro: true  },
  { feature: 'Country comparison tool',            free: true,  pro: true  },
  { feature: 'Public insights articles',           free: true,  pro: true  },
  { feature: 'Save calculations',                  free: false, pro: true  },
  { feature: 'PDF export',                         free: false, pro: true  },
  { feature: 'PayrollExpert AI assistant',         free: false, pro: true  },
  { feature: 'Termination rules',                  free: false, pro: true  },
  { feature: 'Contractor classification rules',    free: false, pro: true  },
  { feature: 'Double taxation treaty data',        free: false, pro: true  },
  { feature: 'Remote work PE rules',               free: false, pro: true  },
  { feature: 'Rate-change alerts',                 free: false, pro: true  },
]

const FAQS = [
  {
    q: 'Is the free plan really free?',
    a: 'Yes. All country payroll data pages, tax brackets, employer costs, employment law summaries, and the basic calculator are permanently free — no account required.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We use Lemon Squeezy as our payment processor, which accepts all major credit and debit cards. EU VAT is handled automatically at checkout.',
  },
  {
    q: 'Can I cancel my Pro plan at any time?',
    a: 'Yes. You can cancel at any time from your dashboard. Your Pro access continues until the end of your current billing period.',
  },
  {
    q: 'Is there a discount for annual billing?',
    a: 'Yes. The annual plan is £249 per year — equivalent to £20.75 per month, saving you over £99 compared to monthly billing.',
  },
  {
    q: 'Do you offer team or enterprise plans?',
    a: 'Enterprise pricing with API access, white-label calculators, and dedicated support is available. Contact us to discuss your requirements.',
  },
  {
    q: 'Is the data accurate enough for professional use?',
    a: 'Our data is sourced from official government publications and reviewed by qualified payroll professionals. It is designed as a research and reference tool. We always recommend verifying critical decisions with a qualified adviser in the relevant jurisdiction.',
  },
]

export default function PricingPage() {
  return (
    <main className="bg-white flex-1">

      {/* HERO */}
      <section className="relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0" style={{background: 'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%)'}} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="text-blue-300 text-xs font-semibold tracking-wide">Pricing</span>
          </div>
          <h1 className="font-serif text-4xl lg:text-6xl font-bold text-white leading-[1.08] mb-6" style={{letterSpacing: '-0.025em'}}>
            Simple, transparent<br /><span className="text-blue-400">pricing.</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            All core payroll data is free, forever. Upgrade to Pro for saved calculations,
            AI assistance, PDF exports, and premium data.
          </p>
        </div>
      </section>

      {/* PLAN CARDS */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">

            {/* FREE */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="h-1.5 bg-slate-300" />
              <div className="p-8">
                <div className="mb-8">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Free</p>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-black text-slate-900 tracking-tight">£0</span>
                    <span className="text-slate-400 font-medium pb-1">/ forever</span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Full access to all country payroll data, basic calculators, and public content.
                    No account required.
                  </p>
                </div>
                <Link href="/countries/"
                  className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 rounded-xl transition-colors text-sm mb-8">
                  Start exploring free
                </Link>
                <ul className="space-y-3">
                  {FREE_FEATURES.map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* PRO */}
            <div className="bg-white border-2 border-blue-600 rounded-2xl overflow-hidden shadow-lg shadow-blue-600/10 relative">
              <div className="h-1.5 bg-blue-600" />
              <div className="absolute top-6 right-6">
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">Most popular</span>
              </div>
              <div className="p-8">
                <div className="mb-8">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Pro</p>

                  {/* Monthly price */}
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-5xl font-black text-slate-900 tracking-tight">£29</span>
                    <span className="text-slate-400 font-medium pb-1">/ month</span>
                  </div>
                  <p className="text-slate-500 text-sm mb-1">or <span className="font-bold text-slate-700">£249 / year</span> <span className="text-emerald-600 font-semibold">(save £99)</span></p>
                  <p className="text-slate-500 text-sm leading-relaxed mt-3">
                    Everything in Free, plus AI assistance, saved calculations, PDF exports,
                    and full access to all premium data tables.
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {/* Monthly button — links to Lemon Squeezy checkout */}
                  <a
                    href="https://accounting-body.lemonsqueezy.com/checkout/buy/a1446dba-e950-40f5-a6f3-0b9672e5f98f"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors text-sm">
                    Get Pro — £29 / month
                  </a>
                  {/* Annual button */}
                  <a
                    href="https://accounting-body.lemonsqueezy.com/checkout/buy/ed60fede-a9ec-4bad-8e67-011367a456ca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors text-sm">
                    Get Pro — £249 / year <span className="text-blue-300 font-normal">(save £99)</span>
                  </a>
                </div>

                <ul className="space-y-3">
                  {PRO_FEATURES.map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <Check size={16} className="text-blue-600 shrink-0 mt-0.5" />
                      <span className="text-slate-600 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* Enterprise row */}
          <div className="max-w-4xl mx-auto mt-6">
            <div className="bg-slate-900 rounded-2xl p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Enterprise</p>
                <h3 className="font-bold text-white text-lg">API access, white-label calculators, dedicated support.</h3>
                <p className="text-slate-400 text-sm mt-1">For EOR platforms, payroll bureaus, and law firms with bulk data needs.</p>
              </div>
              <Link href="/contact/"
                className="shrink-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-sm">
                Contact us <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="mb-14 text-center">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Full comparison</p>
            <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight">Free vs Pro.</h2>
          </div>

          <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-[1fr_100px_100px] bg-slate-900 px-6 py-4">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Feature</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 text-center">Free</span>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400 text-center">Pro</span>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={row.feature}
                className={`grid grid-cols-[1fr_100px_100px] px-6 py-4 items-center ${i > 0 ? 'border-t border-slate-100' : ''} ${!row.free && row.pro ? 'bg-blue-50/40' : ''}`}>
                <span className="text-sm text-slate-700 font-medium">{row.feature}</span>
                <span className="flex justify-center">
                  {row.free
                    ? <Check size={18} className="text-emerald-500" />
                    : <X size={18} className="text-slate-300" />}
                </span>
                <span className="flex justify-center">
                  {row.pro
                    ? <Check size={18} className="text-blue-600" />
                    : <X size={18} className="text-slate-300" />}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="mb-14">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight">Common questions.</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-5xl">
            {FAQS.map(faq => (
              <div key={faq.q} className="bg-white border border-slate-200 rounded-2xl p-7">
                <h3 className="font-bold text-slate-900 mb-3 leading-snug">{faq.q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden" style={{backgroundColor: '#0d1f3c'}}>
        <div className="absolute inset-0" style={{background: 'radial-gradient(ellipse at 80% 50%, rgba(30,111,255,0.12) 0%, transparent 60%)'}} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div>
            <h2 className="font-serif text-4xl font-bold text-white leading-tight tracking-tight mb-4">
              Start with free. Upgrade when ready.
            </h2>
            <p className="text-slate-400 leading-relaxed max-w-xl">
              No account required to access free data. Sign up for Pro when you need
              saved calculations, AI assistance, and full premium data access.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link href="/countries/"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-4 rounded-xl transition-colors text-sm">
              Browse free data <ArrowRight size={15} />
            </Link>
            <a
              href="https://accounting-body.lemonsqueezy.com/checkout/buy/a1446dba-e950-40f5-a6f3-0b9672e5f98f"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold px-7 py-4 rounded-xl transition-colors text-sm">
              Get Pro — £29/mo
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
