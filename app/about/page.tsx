import Link from 'next/link'
import { ArrowRight, Globe, Shield, Users, BookOpen, ExternalLink } from 'lucide-react'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About GlobalPayrollExpert — Methodology, Data Standards & Mission',
  description: 'The most comprehensive global payroll intelligence platform. Data methodology, verification standards, and a mission to cover every country.',
  alternates: {
    canonical: 'https://globalpayrollexpert.com/about/',
  },
  openGraph: {
    title: 'About GlobalPayrollExpert — Methodology, Data Standards & Mission',
    description: 'Learn about our data methodology, verification standards, and mission to cover every country.',
    url: 'https://globalpayrollexpert.com/about/',
    siteName: 'GlobalPayrollExpert',
    type: 'website',
  },
}



const WHO_ITS_FOR = [
  { icon: Users,    title: 'EOR Firms',               body: 'Employer of Record providers calculating total employment costs and compliance obligations across multiple jurisdictions.' },
  { icon: Shield,   title: 'HR Directors',             body: 'Global HR leaders managing payroll compliance, leave entitlements, and employment law across international teams.' },
  { icon: BookOpen, title: 'Lawyers & Accountants',    body: 'Legal and finance professionals advising clients on cross-border employment, tax treaties, and payroll obligations.' },
  { icon: Globe,    title: 'Founders & Finance Teams', body: 'Companies hiring internationally who need accurate employer cost data before making hiring decisions.' },
]

const METHODOLOGY = [
  { step: '01', title: 'Government Sources Only',  body: 'Every data point is traced to an official publication — a tax authority website, government gazette, or statutory instrument. We do not accept secondary sources, news articles, or unverified third-party data.' },
  { step: '02', title: 'Expert Review',            body: 'Data is reviewed by qualified payroll professionals before publication. Where rules are complex or ambiguous, practitioner commentary is added to explain edge cases.' },
  { step: '03', title: 'Monthly Update Cycle',     body: 'All Tier 1 country data (major economies) is reviewed on a rolling monthly cycle. Tax year changes, budget announcements, and rate changes are applied as they are confirmed.' },
  { step: '04', title: 'Source Transparency',      body: 'Every country page lists its data sources with direct links to the original government publications. You can verify every figure yourself.' },
]

const COVERAGE = [
  { tier: 'Tier 1', label: '20 Major Economies',      desc: 'UK, US, Germany, France, Australia, Canada, Singapore, UAE, Japan, Netherlands, and more. Full data depth — all tables populated and verified.', status: 'Live',        color: 'bg-emerald-500' },
  { tier: 'Tier 2', label: '40 Additional Countries', desc: 'Broader coverage of significant economies across Europe, Asia Pacific, Americas, and Middle East.', status: 'In progress', color: 'bg-blue-500'    },
  { tier: 'Tier 3', label: '135+ Remaining Countries',desc: 'Full global coverage — every UN-recognised jurisdiction. Core data fields populated for all.', status: 'Planned',     color: 'bg-slate-400'   },
]

export default function AboutPage() {
  return (
    <main className="bg-white flex-1">

      {/* HERO */}
      <section className="relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0" style={{background: 'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%)'}} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-blue-300 text-xs font-semibold tracking-wide">About GlobalPayrollExpert</span>
            </div>
            <h1 className="font-serif text-4xl lg:text-6xl font-bold text-white leading-[1.08] mb-8" style={{letterSpacing: '-0.025em'}}>
              The world&apos;s most<br /><span className="text-blue-400">trusted payroll</span><br />intelligence platform.
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
              GlobalPayrollExpert exists to give payroll professionals, lawyers, HR directors, and global
              employers authoritative, verified, and current payroll and employment law data for every country in the world.
            </p>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">Our Mission</p>
              <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
                One authoritative source.<br />Every country. Always current.
              </h2>
              <div className="space-y-5 text-slate-600 leading-relaxed">
                <p>Global payroll is fragmented. Employers hiring across borders face a patchwork of government websites in different languages, outdated PDF guides, and consultancy reports that are expensive and often out of date.</p>
                <p>GlobalPayrollExpert is built to fix that. We aggregate, verify, and maintain payroll data — income tax brackets, social security rates, employer costs, employment law, termination rules, and compliance obligations — for every country, in one place, updated continuously.</p>
                <p>Our goal is to become the reference platform for anyone making payroll or hiring decisions across international borders — whether they are running payroll in five countries or researching employer costs in one.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {[
                { value: '195',     label: 'Countries',      sub: 'Full global scope' },
                { value: '37+',     label: 'Data Tables',    sub: 'Per country coverage' },
                { value: 'Monthly', label: 'Update Cycle',   sub: 'Tier 1 countries' },
                { value: '100%',    label: 'Source Verified',sub: 'Government sources only' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{s.value}</div>
                  <div className="text-sm font-bold text-slate-700 mt-1">{s.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHO ITS FOR */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="mb-14">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Who It&apos;s For</p>
            <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight leading-tight">Built for global payroll professionals.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHO_ITS_FOR.map(item => (
              <div key={item.title} className="bg-white border border-slate-200 rounded-2xl p-7 hover:shadow-md transition-shadow">
                <div className="bg-blue-600 text-white w-11 h-11 rounded-xl flex items-center justify-center mb-5">
                  <item.icon size={20} />
                </div>
                <h3 className="font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* METHODOLOGY */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="mb-14">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Data Methodology</p>
            <div className="flex items-end justify-between gap-6">
              <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight leading-tight">How we source and<br />verify every data point.</h2>
              <p className="hidden lg:block text-slate-500 max-w-md leading-relaxed">Our methodology is designed around one principle: every number must be traceable to an official government source.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {METHODOLOGY.map(m => (
              <div key={m.step}>
                <div className="text-6xl font-black text-slate-100 leading-none mb-4 select-none">{m.step}</div>
                <h3 className="font-bold text-slate-900 text-lg mb-3 leading-tight">{m.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COVERAGE */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="mb-14">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Coverage Roadmap</p>
            <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight leading-tight">Growing toward complete<br />global coverage.</h2>
          </div>
          <div className="space-y-5">
            {COVERAGE.map(c => (
              <div key={c.tier} className="bg-white border border-slate-200 rounded-2xl p-7 flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="shrink-0">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{c.tier}</div>
                  <div className="font-bold text-slate-900 text-lg">{c.label}</div>
                </div>
                <div className="flex-1 text-slate-500 text-sm leading-relaxed">{c.desc}</div>
                <div className="shrink-0 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${c.color}`} />
                  <span className="text-sm font-semibold text-slate-600">{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACCURACY DISCLAIMER */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">Data Accuracy</p>
            <h2 className="font-serif text-3xl font-bold text-slate-900 tracking-tight leading-tight mb-6">Accurate data. Honest limitations.</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>We invest significant effort in ensuring the data on GlobalPayrollExpert is accurate, current, and properly sourced. Every data point is linked to an official government publication, and our Tier 1 country data is reviewed on a monthly cycle.</p>
              <p>However, payroll and tax law is complex and changes frequently. Rates can change mid-year. Rules vary by employment category, industry, and region. Edge cases exist in every jurisdiction.</p>
              <p className="font-medium text-slate-800">GlobalPayrollExpert is a research and reference tool. It is not a substitute for qualified professional advice. Always verify critical decisions with a qualified payroll professional, tax adviser, or employment lawyer in the relevant jurisdiction.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-6">
              <Link href="/disclaimer/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors">
                Read our full disclaimer <ArrowRight size={15} />
              </Link>
              <Link href="/contact/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors">
                Report a data error <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden" style={{backgroundColor: '#0d1f3c'}}>
        <div className="absolute inset-0" style={{background: 'radial-gradient(ellipse at 80% 50%, rgba(30,111,255,0.12) 0%, transparent 60%)'}} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div>
            <h2 className="font-serif text-4xl font-bold text-white leading-tight tracking-tight mb-4">Start exploring the data.</h2>
            <p className="text-slate-400 leading-relaxed max-w-xl">All country data, basic calculators, and public insights are free to access — no account required.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link href="/countries/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-4 rounded-xl transition-colors text-sm">
              Browse all countries <ArrowRight size={15} />
            </Link>
            <Link href="/pricing/" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold px-7 py-4 rounded-xl transition-colors text-sm">
              View Pro plan
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
