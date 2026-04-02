import { createClient } from '@supabase/supabase-js'
import GlobalCalculatorClient from './GlobalCalculatorClient'

export const metadata = {
  title: 'Global Payroll Calculator — All Countries | HRLake',
  description: 'Calculate net salary, income tax, and total employer cost for any country. Full payroll and employment cost breakdown for HR and finance teams — free, no sign-in required.',
}

export const dynamic = 'force-dynamic'

export default async function GlobalCalculatorPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch all countries that have tax bracket data
  const { data: countries } = await supabase
    .from('countries')
    .select('iso2, name, currency_code, flag_emoji')
    .order('name', { ascending: true })

  return (
    <main className="flex-1 bg-white">

      {/* Hero */}
      <section className="relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%), radial-gradient(ellipse at 0% 100%, rgba(14,30,80,0.4) 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-14">
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <a href="/payroll-tools/" className="hover:text-slate-300 transition-colors">Payroll Tools</a>
            <span className="text-slate-700">›</span>
            <span className="text-slate-400">Global Calculator</span>
          </nav>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-blue-300 text-xs font-semibold tracking-wide">Global Payroll Calculator · {new Date().getFullYear()}</span>
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white leading-tight mb-5" style={{ letterSpacing: '-0.025em' }}>
              Calculate payroll<br />for <span className="text-blue-400">any country</span>.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
              Select a country, enter a gross salary, and get a full breakdown — net pay, income tax, social security, and total employer cost. Switch countries instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <GlobalCalculatorClient countries={countries ?? []} />
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-amber-800 text-sm leading-relaxed">
              <span className="font-bold">Disclaimer:</span> Calculations are for indicative purposes only. Tax rules vary by individual circumstances. Always consult a qualified payroll professional before making decisions.
            </p>
          </div>
        </div>
      </section>

    </main>
  )
}
