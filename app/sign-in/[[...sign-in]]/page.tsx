import { SignIn } from '@clerk/nextjs'

export const metadata = {
  title: 'Sign In | HRLake',
  description: 'Sign in to your HRLake account.',
}

export default function SignInPage() {
  return (
    <main className="flex items-center justify-center px-4"
      style={{background: 'radial-gradient(ellipse at 50% 0%, rgba(30,111,255,0.1) 0%, transparent 60%), #020817'}}>
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="1.5"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#3b82f6" strokeWidth="1.5"/>
            </svg>
            <span className="text-white font-semibold text-base tracking-tight">HRLake</span>
          </div>
          <div className="h-px w-8 bg-blue-500/30" />
        </div>

        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'w-full shadow-2xl rounded-2xl border border-slate-800',
              cardBox: 'w-full',
              headerTitle: 'text-slate-900 font-bold text-lg',
              headerSubtitle: 'text-slate-500 text-sm',
              socialButtonsBlockButton: 'border border-slate-200 hover:bg-slate-50 rounded-xl font-medium text-sm',
              dividerLine: 'bg-slate-200',
              dividerText: 'text-slate-400 text-xs',
              formFieldLabel: 'text-slate-700 text-sm font-medium',
              formFieldInput: 'border-slate-300 rounded-lg text-slate-900 focus:border-blue-500 focus:ring-blue-500/20',
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm',
              footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium',
              footerActionText: 'text-slate-500 text-sm',
            },
          }}
        />
      </div>
    </main>
  )
}
