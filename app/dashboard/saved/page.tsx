import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { Calculator, ArrowLeft, Trash2, ArrowRight, Globe } from 'lucide-react'

export const metadata = {
  title: 'Saved Calculations',
  description: 'Your saved payroll calculations.',
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
    return data || []
  } catch {
    return []
  }
}

export default async function SavedCalculationsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const calculations = await getSavedCalculations(userId)

  return (
    <main className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <Link href="/dashboard/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors mb-6">
            <ArrowLeft size={15} /> Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white">Saved Calculations</h1>
          <p className="text-slate-400 text-sm mt-1">All your saved payroll calculations in one place</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">

        {calculations.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
            <Calculator size={48} className="text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-700 mb-2">No saved calculations yet</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
              Run a payroll calculation for any country and save it to access it here any time.
            </p>
            <Link href="/payroll-tools/"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              Open Payroll Calculator <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

            {/* Table header */}
            <div className="grid grid-cols-[1fr_1fr_1fr_120px] px-7 py-4 bg-slate-900 gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Label</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Country</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Saved On</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Actions</span>
            </div>

            <div className="divide-y divide-slate-100">
              {calculations.map((calc: any) => (
                <div key={calc.id}
                  className="grid grid-cols-[1fr_1fr_1fr_120px] px-7 py-5 items-center gap-4 hover:bg-slate-50 transition-colors">

                  <div>
                    <div className="font-semibold text-slate-800 text-sm">
                      {calc.name || 'Untitled calculation'}
                    </div>
                    {calc.inputs?.gross_salary && (
                      <div className="text-slate-400 text-xs mt-0.5">
                        Gross: {Number(calc.inputs?.gross_salary).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <img
                      src={`https://flagcdn.com/20x15/${calc.country_code?.toLowerCase()}.png`}
                      alt={calc.country_code}
                      width={20}
                      height={15}
                      className="rounded-sm shadow-sm"
                    />
                    <span className="font-mono text-slate-700 text-sm font-medium uppercase">
                      {calc.country_code}
                    </span>
                  </div>

                  <div className="text-slate-500 text-sm">
                    {new Date(calc.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/countries/${calc.country_code?.toLowerCase()}/payroll-calculator/`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-semibold transition-colors">
                      <Globe size={12} /> Re-run
                    </Link>
                    <span className="text-slate-300">|</span>
                    <span className="inline-flex items-center gap-1 text-slate-400 hover:text-red-500 text-xs font-semibold transition-colors cursor-pointer">
                      <Trash2 size={12} /> Delete
                    </span>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </main>
  )
}
