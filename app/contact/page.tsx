'use client'

import { useState } from 'react'
import { ArrowRight, Mail, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us — Data Corrections and Enquiries',
  description: 'Get in touch with the GlobalPayrollExpert team. Report a data error, request a country update, or ask a question about our global payroll intelligence platform.',
  alternates: {
    canonical: 'https://globalpayrollexpert.com/contact/',
  },
  openGraph: {
    title: 'Contact Us — Data Corrections and Enquiries',
    description: 'Report a data error, request a country update, or ask a question about GlobalPayrollExpert.',
    url: 'https://globalpayrollexpert.com/contact/',
    siteName: 'GlobalPayrollExpert',
    type: 'website',
  },
}



type FormType = 'general' | 'correction'

export default function ContactPage() {
  const [formType, setFormType] = useState<FormType>('general')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, form_type: formType }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-white">

      {/* HERO */}
      <section className="relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0" style={{background: 'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%)'}} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-blue-300 text-xs font-semibold tracking-wide">Contact</span>
            </div>
            <h1 className="font-serif text-4xl lg:text-6xl font-bold text-white leading-[1.08] mb-8" style={{letterSpacing: '-0.025em'}}>
              Get in touch<br />with <span className="text-blue-400">our team.</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">
              General enquiries, data correction requests, or partnership questions —
              we read every message and respond within two business days.
            </p>
          </div>
        </div>
      </section>

      {/* FORM SECTION */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-3 gap-16">

            {/* LEFT — contact info */}
            <div className="lg:col-span-1">
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-6">How we can help</p>
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                    <MessageSquare size={18} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">General enquiries</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">Questions about the platform, data coverage, Pro plan, or partnerships.</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                    <AlertCircle size={18} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">Data corrections</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">Found an error in a country&apos;s payroll data? Use the correction form and we will verify and update it promptly.</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                  <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                    <Mail size={18} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">Response time</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">We aim to respond to all messages within two business days. Data corrections are prioritised.</p>
                </div>
              </div>
            </div>

            {/* RIGHT — form */}
            <div className="lg:col-span-2">

              {/* Tab toggle */}
              <div className="flex gap-2 mb-8 bg-white border border-slate-200 rounded-xl p-1.5 w-fit">
                <button
                  onClick={() => setFormType('general')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    formType === 'general'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  General enquiry
                </button>
                <button
                  onClick={() => setFormType('correction')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    formType === 'correction'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Data correction
                </button>
              </div>

              {status === 'success' ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 text-center">
                  <div className="bg-emerald-500 text-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle size={26} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-xl mb-2">Message received</h3>
                  <p className="text-slate-500 leading-relaxed max-w-md mx-auto">
                    {formType === 'correction'
                      ? 'Thank you for the correction report. We will verify the data against official sources and update it promptly.'
                      : 'We have received your message and will respond within two business days.'}
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-6 text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-8 space-y-5">

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full name *</label>
                      <input
                        name="full_name"
                        required
                        placeholder="Jane Smith"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-colors text-slate-900 placeholder:text-slate-400 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email address *</label>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="jane@company.com"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-colors text-slate-900 placeholder:text-slate-400 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Organisation</label>
                    <input
                      name="organisation"
                      placeholder="Company or firm name (optional)"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-colors text-slate-900 placeholder:text-slate-400 text-sm"
                    />
                  </div>

                  {formType === 'correction' && (
                    <>
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Country *</label>
                          <input
                            name="country"
                            required
                            placeholder="e.g. Germany"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-colors text-slate-900 placeholder:text-slate-400 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Data field *</label>
                          <input
                            name="data_field"
                            required
                            placeholder="e.g. Employer social security rate"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-colors text-slate-900 placeholder:text-slate-400 text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Current value shown</label>
                          <input
                            name="current_value"
                            placeholder="What the site currently shows"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-colors text-slate-900 placeholder:text-slate-400 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Correct value</label>
                          <input
                            name="correct_value"
                            placeholder="What it should be"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-colors text-slate-900 placeholder:text-slate-400 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Official source URL</label>
                        <input
                          name="source_url"
                          type="url"
                          placeholder="https://gov-website.example.com/tax-rates"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-colors text-slate-900 placeholder:text-slate-400 text-sm"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {formType === 'correction' ? 'Additional notes' : 'Message *'}
                    </label>
                    <textarea
                      name="message"
                      required={formType === 'general'}
                      rows={5}
                      placeholder={formType === 'correction' ? 'Any additional context about the correction...' : 'How can we help?'}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-colors text-slate-900 placeholder:text-slate-400 text-sm resize-none"
                    />
                  </div>

                  {status === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-medium">
                      Something went wrong. Please try again or email us directly.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold px-7 py-3.5 rounded-xl transition-colors text-sm"
                  >
                    {status === 'sending' ? 'Sending...' : formType === 'correction' ? 'Submit correction' : 'Send message'}
                    {status !== 'sending' && <ArrowRight size={15} />}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
