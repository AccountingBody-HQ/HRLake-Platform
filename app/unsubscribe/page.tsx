import { Suspense } from 'react'
import UnsubscribeClient from './UnsubscribeClient'

export const metadata = {
  title: 'Unsubscribe — GlobalPayrollExpert',
  description: 'Unsubscribe from GlobalPayrollExpert email updates.',
  robots: { index: false, follow: false },
}

export default function UnsubscribePage() {
  return (
    <main className="bg-slate-950 flex items-center justify-center px-6">
      <Suspense fallback={
        <div className="text-slate-400 text-sm">Loading...</div>
      }>
        <UnsubscribeClient />
      </Suspense>
    </main>
  )
}
