import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { User, Calculator, Crown, ArrowRight, BookmarkCheck, TrendingUp, Shield } from 'lucide-react'

export const metadata = {
  title: 'Dashboard',
  description: 'Your GlobalPayrollExpert account dashboard.',
}

async function getUserPlan(userId: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', userId)
      .eq('platform', 'gpe')
      .single()
    return data
  } catch {
    return null
  }
}

async function getSavedCalculations(userId: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data } = await supabase
      .schema('gpe')
      .from('saved_calculations')
      .select('id, country_code, name, created_at, results, inputs')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)
    return data || []
  } catch {
    return []
  }
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const subscription = await getUserPlan(userId)
  const savedCalculations = await getSavedCalculations(userId)

  const isPro = subscription?.plan === 'pro' && subscription?.status === 'active'
  const firstName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'there'

  return (
    <main className="bg-slate-50">

      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Welcome back</p>
              <h1 className="text-2xl font-bold text-white">
                {firstName}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {isPro ? (
                <span className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                  <Crown size={12} /> Pro Plan
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                  Free Plan
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">

        {/* Upgrade CTA — only for free users */}
        {!isPro && (
          <div className="mb-10 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown size={18} className="text-blue-200" />
                <span className="text-blue-200 text-xs font-bold uppercase tracking-widest">Upgrade to Pro</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Unlock the full platform</h2>
              <p className="text-blue-200 text-sm leading-relaxed max-w-md">
                Save calculations, export PDFs, access the AI assistant, termination rules, contractor classifications, and rate-change alerts.
              </p>
            </div>
            <Link href="/pricing/"
              className="shrink-0 inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm">
              View Pro plans <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { icon: BookmarkCheck, label: 'Saved Calculations', value: savedCalculations.length.toString(), sub: 'in your account' },
            { icon: Calculator,    label: 'Countries Available', value: '195',  sub: 'full global coverage' },
            { icon: TrendingUp,    label: 'Data Points',         value: '10,000+', sub: 'per country record' },
            { icon: Shield,        label: 'Your Plan',           value: isPro ? 'Pro' : 'Free', sub: isPro ? 'Full access' : 'Core access' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                <s.icon size={18} />
              </div>
              <div className="text-2xl font-black text-slate-900">{s.value}</div>
              <div className="text-sm font-semibold text-slate-700 mt-0.5">{s.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Two column layout */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Saved calculations */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Recent Calculations</h2>
              <Link href="/dashboard/saved/"
                className="text-blue-600 text-sm font-semibold hover:text-blue-700 flex items-center gap-1">
                View all <ArrowRight size={13} />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {savedCalculations.length === 0 ? (
                <div className="px-7 py-12 text-center">
                  <Calculator size={32} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm font-medium mb-1">No saved calculations yet</p>
                  <p className="text-slate-400 text-xs mb-4">Run a payroll calculation and save it to see it here</p>
                  <Link href="/payroll-tools/"
                    className="inline-flex items-center gap-1.5 text-blue-600 text-sm font-semibold hover:text-blue-700">
                    Open calculator <ArrowRight size={13} />
                  </Link>
                </div>
              ) : (
                savedCalculations.map((calc: any) => (
                  <div key={calc.id} className="px-7 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{calc.label || calc.country_code?.toUpperCase()}</div>
                      <div className="text-slate-400 text-xs mt-0.5">
                        {new Date(calc.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <Link href={`/dashboard/saved/`}
                      className="text-blue-600 text-xs font-semibold hover:text-blue-700">
                      View
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-7 py-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">Quick Access</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { href: '/countries/',      icon: User,          label: 'Country Payroll Data',  sub: 'Tax brackets, employer costs, SS rates' },
                { href: '/payroll-tools/',  icon: Calculator,    label: 'Payroll Calculator',    sub: 'Full net pay and employer cost breakdown' },
                { href: '/eor/',            icon: TrendingUp,    label: 'EOR Intelligence',      sub: 'Employer of Record cost modelling' },
                { href: '/hr-compliance/', icon: Shield,         label: 'Employment Law',        sub: 'Leave, notice, probation, termination' },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="px-7 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group">
                  <div className="bg-blue-50 text-blue-600 w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
                    <item.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">{item.label}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{item.sub}</div>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
