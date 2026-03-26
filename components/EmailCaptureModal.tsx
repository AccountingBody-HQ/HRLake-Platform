"use client"
import { useState, useEffect } from 'react'
import { X, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'

interface EmailCaptureModalProps {
  trigger?: 'timer' | 'manual'
  delaySeconds?: number
  source?: string
  title?: string
  subtitle?: string
  isOpen?: boolean
  onClose?: () => void
}

export default function EmailCaptureModal({
  trigger = 'timer',
  delaySeconds = 30,
  source = 'modal',
  title = 'Save your calculation and stay informed.',
  subtitle = 'Get monthly global payroll updates — rate changes, new country data, and compliance alerts. Free.',
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}: EmailCaptureModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (trigger !== 'timer') return

    // Check if already dismissed or subscribed
    try {
      const dismissed = localStorage.getItem('gpe_modal_dismissed')
      const subscribed = localStorage.getItem('gpe_subscribed')
      if (dismissed || subscribed) return
    } catch { return }

    const timer = setTimeout(() => {
      setIsOpen(true)
    }, delaySeconds * 1000)

    return () => clearTimeout(timer)
  }, [trigger, delaySeconds])

  // Support controlled mode (opened externally)
  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen)
    }
  }, [controlledIsOpen])

  function handleClose() {
    setIsOpen(false)
    try {
      localStorage.setItem('gpe_modal_dismissed', 'true')
    } catch {}
    controlledOnClose?.()
  }

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
        try {
          localStorage.setItem('gpe_subscribed', 'true')
        } catch {}
        // Auto close after 3 seconds on success
        setTimeout(() => {
          setIsOpen(false)
          controlledOnClose?.()
        }, 3000)
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">

        {/* Top accent bar */}
        <div className="h-1.5 bg-blue-600 w-full" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {status === 'success' ? (
            <div className="text-center py-4">
              <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
              <h3 className="font-bold text-xl text-slate-900 mb-2">You are subscribed.</h3>
              <p className="text-slate-500 text-sm">
                Check your inbox for a confirmation email from GlobalPayrollExpert.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-blue-600 text-xs font-semibold">Free monthly updates</span>
                </div>
                <h3 className="font-bold text-2xl text-slate-900 leading-snug mb-2">
                  {title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {subtitle}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={status === 'loading'}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-300 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 rounded-xl outline-none transition-colors disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {status === 'loading'
                    ? <><Loader2 size={15} className="animate-spin" /> Subscribing...</>
                    : <>Subscribe free <ArrowRight size={14} /></>}
                </button>
              </form>

              {status === 'error' && (
                <p className="text-red-500 text-sm mt-3">{errorMsg}</p>
              )}

              <p className="text-slate-400 text-xs mt-4 text-center">
                No spam · Unsubscribe any time
              </p>

              {/* Dismiss link */}
              <div className="mt-4 text-center">
                <button
                  onClick={handleClose}
                  className="text-slate-400 hover:text-slate-600 text-xs underline transition-colors"
                >
                  No thanks, dismiss
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
