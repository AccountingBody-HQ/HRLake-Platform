"use client"
import { useState } from 'react'
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react'

interface EmailCaptureProps {
  source?: string
  variant?: 'default' | 'compact' | 'dark'
  title?: string
  subtitle?: string
}

export default function EmailCapture({
  source = 'inline',
  variant = 'default',
  title = 'Monthly HR and employment updates.',
  subtitle = 'Rate changes, new country data, and compliance alerts — once a month, free.',
}: EmailCaptureProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong. Please try again.')
        setStatus('error')
      } else {
        setStatus('success')
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className={`rounded-2xl p-8 flex items-center gap-4 ${
        variant === 'dark'
          ? 'bg-slate-800 border border-slate-700'
          : 'bg-green-50 border border-green-200'
      }`}>
        <CheckCircle className="text-green-500 shrink-0" size={28} />
        <div>
          <p className={`font-bold text-lg ${variant === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            You are subscribed.
          </p>
          <p className={`text-sm mt-1 ${variant === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Check your inbox for a confirmation email from HRLake.
          </p>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={status === 'loading'}
          className="flex-1 px-4 py-2.5 bg-white border border-slate-300 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 rounded-xl outline-none transition-colors text-sm disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2 shrink-0"
        >
          {status === 'loading' ? <Loader2 size={15} className="animate-spin" /> : <>Subscribe <ArrowRight size={14} /></>}
        </button>
      </form>
      <p className="text-xs mt-2 text-slate-400">
        By subscribing you agree to receive monthly updates from HRLake. No spam. Unsubscribe any time. See our <a href="/privacy-policy/" className="underline hover:text-slate-600">Privacy Policy</a>.
      </p>
    </>
    )
  }

  return (
    <div className={`rounded-2xl p-8 ${
      variant === 'dark'
        ? 'bg-slate-900 border border-slate-800'
        : 'bg-slate-50 border border-slate-200'
    }`}>
      <h3 className={`font-bold text-xl mb-2 ${variant === 'dark' ? 'text-white' : 'text-slate-900'}`}>
        {title}
      </h3>
      <p className={`text-sm leading-relaxed mb-6 ${variant === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
        {subtitle}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={status === 'loading'}
          className={`flex-1 px-5 py-3.5 border focus:border-blue-500 placeholder:text-slate-500 rounded-xl outline-none transition-colors disabled:opacity-60 ${
            variant === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'bg-white border-slate-300 text-slate-900'
          }`}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shrink-0"
        >
          {status === 'loading'
            ? <><Loader2 size={15} className="animate-spin" /> Subscribing...</>
            : <>Subscribe free <ArrowRight size={14} /></>}
        </button>
      </form>
      {status === 'error' && (
        <p className="text-red-500 text-sm mt-3">{errorMsg}</p>
      )}
      <p className={`text-xs mt-4 ${variant === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>
        By subscribing you agree to receive monthly updates from HRLake. No spam. Unsubscribe any time. See our{' '}
        <a href="/privacy-policy/" className={`underline ${variant === 'dark' ? 'hover:text-slate-400' : 'hover:text-slate-600'}`}>Privacy Policy</a>.
      </p>
    </div>
  )
}
