import Link from 'next/link'
import { ArrowRight, Calculator, Globe, RefreshCw, BarChart2 } from 'lucide-react'

export const metadata = {
  title: 'Payroll Tools | GlobalPayrollExpert',
  description: 'Free payroll calculators and tools — net pay, employer cost, country comparison, and salary currency conversion for 195 countries.',
}

const TOOLS = [
  {
    slug: 'global-calculator',
    title: 'Global Payroll Calculator',
    description: 'Select any country, enter a gross salary, and get a full payroll breakdown — net pay, income tax, employee and employer social security, and total employer cost. Shown monthly and annually with PDF export.',
    icon: Calculator,
    accent: 'bg-blue-50 text-blue-700',
    top: 'bg-blue-600',
    border: 'hover:border-blue-300',
    badge: 'Most used',
    badgeColor: 'bg-blue-100 text-blue-700',
    href: '/payroll-tools/global-calculator/',
  },
  {
    slug: 'currency-converter',
    title: 'Salary Currency Converter',
    description: 'Convert any salary between currencies using live exchange rates. Useful for benchmarking compensation across markets and presenting packages to international candidates.',
    icon: RefreshCw,
    accent: 'bg-teal-50 text-teal-700',
    top: 'bg-teal-600',
    border: 'hover:border-teal-300',
    badge: null,
    badgeColor: '',
    href: '/payroll-tools/currency-converter/',
  },
]

const ALSO = [
  {
    title: 'Country Comparison Tool',
    description: 'Side-by-side employer cost comparison for two countries at a given salary.',
    href: '/compare/',
    icon: BarChart2,
  },
  {
    title: 'Per-Country Calculators',
    description: 'Each country page has its own dedicated payroll calculator with local tax bracket detail.',
    href: '/countries/',
    icon: Globe,
  },
]

export default function PayrollToolsPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* Hero */}
      <section className="relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 0% 100%, rgba(14,30,80,0.4) 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-blue-300 text-xs font-semibold tracking-wide">Free Payroll Tools</span>
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white leading-tight mb-6" style={{ letterSpacing: '-0.025em' }}>
              Payroll calculators<br />and <span className="text-blue-400">tools</span>.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
              Free tools for calculating net pay, employer costs, and salary conversions — built on verified government data for 195 countries.
            </p>
          </div>

          <div className="mt-14 pt-10 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { value: '195',    label: 'Countries',    sub: 'Full global coverage' },
              { value: 'Free',   label: 'No sign-in',   sub: 'Core tools always free' },
              { value: 'Live',   label: 'Exchange rates', sub: 'Updated daily' },
              { value: 'PDF',    label: 'Export ready', sub: 'Download any result' },
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

      {/* Main tools */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="mb-12">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">Tools</p>
            <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              All payroll tools.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {TOOLS.map(tool => (
              <Link key={tool.slug} href={tool.href}
                className={`group bg-white border border-slate-200 ${tool.border} rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col`}>
                <div className={`h-1.5 ${tool.top}`} />
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-5">
                    <div className={`inline-flex p-3 rounded-xl ${tool.accent}`}>
                      <tool.icon size={24} />
                    </div>
                    {tool.badge && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tool.badgeColor}`}>
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-xl mb-3 leading-tight">{tool.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed flex-1">{tool.description}</p>
                  <div className="mt-7 flex items-center gap-1.5 text-blue-600 text-sm font-semibold group-hover:gap-2.5 transition-all">
                    Open tool <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Also available */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <h2 className="font-serif text-2xl font-bold text-slate-900 mb-8">Also available</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {ALSO.map(item => (
              <Link key={item.href} href={item.href}
                className="group flex items-start gap-5 bg-slate-50 border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-xl p-6 transition-all">
                <div className="bg-blue-600 text-white w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
                  <item.icon size={20} />
                </div>
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-1">{item.title}</div>
                  <div className="text-sm text-slate-500 leading-relaxed">{item.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-amber-800 text-sm leading-relaxed">
              <span className="font-bold">Disclaimer:</span> All payroll calculations are for indicative purposes only. Tax rules are complex and vary by individual circumstances. Always consult a qualified payroll professional or tax adviser before making payroll or hiring decisions.
            </p>
          </div>
        </div>
      </section>

    </main>
  )
}
