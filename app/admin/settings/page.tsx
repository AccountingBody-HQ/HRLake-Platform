import { Settings, Database, Mail, Key, Globe, Shield, AlertTriangle, CheckCircle } from 'lucide-react'

export default function AdminSettingsPage() {

  const ENV_VARS = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL',          service: 'Supabase',      status: 'confirmed' },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',     service: 'Supabase',      status: 'confirmed' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY',         service: 'Supabase',      status: 'confirmed' },
    { key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', service: 'Clerk',         status: 'dev'       },
    { key: 'CLERK_SECRET_KEY',                  service: 'Clerk',         status: 'dev'       },
    { key: 'ANTHROPIC_API_KEY',                 service: 'Anthropic',     status: 'confirmed' },
    { key: 'OPENAI_API_KEY',                    service: 'OpenAI',        status: 'confirmed' },
    { key: 'RESEND_API_KEY',                    service: 'Resend',        status: 'sandbox'   },
    { key: 'ADMIN_EMAIL',                       service: 'Admin',         status: 'confirmed' },
    { key: 'NEXT_PUBLIC_SANITY_PROJECT_ID',     service: 'Sanity',        status: 'confirmed' },
    { key: 'NEXT_PUBLIC_SANITY_DATASET',        service: 'Sanity',        status: 'confirmed' },
    { key: 'SANITY_WRITE_TOKEN',                service: 'Sanity',        status: 'confirmed' },
    { key: 'LEMON_SQUEEZY_WEBHOOK_SECRET',      service: 'Lemon Squeezy', status: 'confirmed' },
    { key: 'NEXT_PUBLIC_SENTRY_DSN',            service: 'Sentry',        status: 'confirmed' },
    { key: 'ADMIN_SECRET',                      service: 'Admin Auth',    status: 'confirmed' },
    { key: 'SANITY_API_TOKEN',                  service: 'Sanity',        status: 'confirmed' },
  ]

  const CHECKLIST = [
    // Infrastructure
    { label: 'Upgrade Vercel to Pro — required for 120s AI routes and rate limiting', done: false },
    { label: 'Upgrade Supabase to Pro — required for PITR and no auto-pause',         done: false },
    { label: 'Enable Point-in-Time Recovery in Supabase after Pro upgrade',           done: false },
    { label: 'Confirm connection pooling — update Vercel env var to port 6543',       done: false },
    // Security & rate limiting
    { label: 'Implement rate limiting on /api/chat — uncontrolled cost risk',         done: false },
    { label: 'Implement rate limiting on /api/calculate',                             done: false },
    // Auth & keys
    { label: 'Switch Clerk to production keys (pk_live_*) in Vercel',                done: false },
    // DNS & email
    { label: 'DNS cutover: hrlake.com → Vercel',                                     done: false },
    { label: 'Switch Resend from address to noreply@hrlake.com post-DNS',            done: false },
    { label: 'Verify Clerk sign-in on live domain post-DNS',                         done: false },
    { label: 'Test email capture on live domain',                                    done: false },
    // SEO & QA
    { label: 'Canonical tags pointing to hrlake.com',                                done: false },
    { label: 'Search Console: submit sitemap',                                       done: false },
    { label: 'Mobile tested (375px minimum)',                                        done: false },
    // Completed
    { label: 'Dynamic year filters replace all hardcoded 2025 values',               done: true  },
    { label: 'AI Populate rewritten as sequential per-table with retry',             done: true  },
    { label: 'AI Verification rewritten as 23 individual table calls',               done: true  },
    { label: 'Auto-verify on first country insert',                                  done: true  },
    { label: 'Insert route column mapping fixed from live schema',                   done: true  },
  ]

  const card = { background: '#0d1424', borderColor: '#1a2238' }

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(100,116,139,0.12)' }}>
          <Settings size={20} style={{ color: '#64748b' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm" style={{ color: '#475569' }}>
            Platform configuration, environment variables and pre-launch checklist
          </p>
        </div>
      </div>

      {/* Warning banner */}
      <div className="rounded-2xl p-4 mb-8 flex items-start gap-3"
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
        <AlertTriangle size={16} className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: '#f59e0b' }}>Clerk keys are in DEV mode</p>
          <p className="text-xs mt-0.5" style={{ color: '#92400e' }}>
            Do NOT upgrade Clerk keys or action DNS cutover until all pre-launch checklist items are complete.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">

        {/* Database */}
        <div className="rounded-2xl border overflow-hidden" style={card}>
          <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: '#1a2238' }}>
            <Database size={15} style={{ color: '#2dd4bf' }} />
            <h2 className="text-white font-bold text-sm">Database</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            {[
              { label: 'Provider',   value: 'Supabase (PostgreSQL)' },
              { label: 'Schemas',    value: 'public + hrlake' },
              { label: 'Auth',       value: 'Row Level Security enabled' },
              { label: 'Admin writes', value: 'Service role key (bypasses RLS)' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#475569' }}>{row.label}</span>
                <span className="text-sm font-medium text-white">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hosting */}
        <div className="rounded-2xl border overflow-hidden" style={card}>
          <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: '#1a2238' }}>
            <Globe size={15} style={{ color: '#3b82f6' }} />
            <h2 className="text-white font-bold text-sm">Hosting & Deployment</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            {[
              { label: 'Host',        value: 'Vercel' },
              { label: 'Framework',   value: 'Next.js 16 (Turbopack)' },
              { label: 'Deploys',     value: 'Auto on git push to main' },
              { label: 'Live URL',    value: 'hrlake.com' },
              { label: 'Domain',      value: 'hrlake.com (DNS pending)' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#475569' }}>{row.label}</span>
                <span className="text-sm font-medium text-white">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Email */}
        <div className="rounded-2xl border overflow-hidden" style={card}>
          <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: '#1a2238' }}>
            <Mail size={15} style={{ color: '#f59e0b' }} />
            <h2 className="text-white font-bold text-sm">Email</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            {[
              { label: 'Provider',      value: 'Resend' },
              { label: 'Mode',          value: 'Sandbox (pre-DNS)' },
              { label: 'From (now)',    value: 'onboarding@resend.dev' },
              { label: 'From (post-DNS)', value: 'noreply@hrlake.com' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#475569' }}>{row.label}</span>
                <span className="text-sm font-medium text-white">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Auth & Payments */}
        <div className="rounded-2xl border overflow-hidden" style={card}>
          <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: '#1a2238' }}>
            <Shield size={15} style={{ color: '#10b981' }} />
            <h2 className="text-white font-bold text-sm">Auth & Payments</h2>
          </div>
          <div className="px-6 py-5 space-y-3">
            {[
              { label: 'Auth',      value: 'Clerk (dev keys)' },
              { label: 'Payments',  value: 'Lemon Squeezy (webhooks configured)' },
              { label: 'Admin gate', value: 'Cookie-based password' },
              { label: 'Errors',    value: 'Sentry' },
              { label: 'CMS',       value: 'Sanity (project: 4rllejq1)' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#475569' }}>{row.label}</span>
                <span className="text-sm font-medium text-white">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Environment Variables */}
      <div className="rounded-2xl border overflow-hidden mb-6" style={card}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#1a2238' }}>
          <div className="flex items-center gap-2">
            <Key size={15} style={{ color: '#a78bfa' }} />
            <h2 className="text-white font-bold text-sm">Environment Variables</h2>
          </div>
          <p className="text-xs" style={{ color: '#334155' }}>Vercel → Settings → Environment Variables</p>
        </div>
        <div className="divide-y" style={{ borderColor: '#111827' }}>
          {ENV_VARS.map(item => (
            <div key={item.key} className="px-6 py-3 flex items-center justify-between"
              style={{ borderColor: '#111827' }}>
              <div className="flex items-center gap-4">
                <code className="text-xs font-mono" style={{ color: '#93c5fd' }}>{item.key}</code>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: '#111827', color: '#475569' }}>{item.service}</span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                item.status === 'confirmed' ? '' : item.status === 'dev' ? '' : ''
              }`}
                style={
                  item.status === 'confirmed' ? { background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' } :
                  item.status === 'dev'       ? { background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' } :
                                               { background: 'rgba(59,130,246,0.1)',  color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }
                }>
                {item.status === 'confirmed' ? '✓ Confirmed' : item.status === 'dev' ? '⚠ Dev key' : '◈ Sandbox'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pre-launch checklist */}
      <div className="rounded-2xl border overflow-hidden" style={card}>
        <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: '#1a2238' }}>
          <CheckCircle size={15} style={{ color: '#10b981' }} />
          <h2 className="text-white font-bold text-sm">Pre-Launch Checklist</h2>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold ml-1"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {CHECKLIST.filter(i => !i.done).length} remaining
          </span>
        </div>
        <div className="divide-y" style={{ borderColor: '#111827' }}>
          {CHECKLIST.map((item, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4"
              style={{ borderColor: '#111827' }}>
              <div className="w-5 h-5 rounded-md shrink-0 flex items-center justify-center"
                style={item.done
                  ? { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid #1f2937' }}>
                {item.done && <CheckCircle size={12} style={{ color: '#10b981' }} />}
              </div>
              <span className="text-sm" style={{ color: item.done ? '#10b981' : '#64748b' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
