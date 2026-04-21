'use client'
import { Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Globe, ShieldCheck, Sparkles,
  BarChart3, Settings, LogOut, ExternalLink,
  ChevronRight, Layers, RefreshCw
} from 'lucide-react'

const NAV = [
  { href: '/admin',                exact: true,  icon: LayoutDashboard, label: 'Command Centre',  sub: 'Overview & actions'       },
  { href: '/admin/country-builder', exact: false, icon: Layers,          label: 'Country Manager', sub: 'Add, populate, activate'  },
  { href: '/admin/data-quality',    exact: false, icon: ShieldCheck,     label: 'Data Quality',    sub: 'Verify country data'      },
  { href: '/admin/content-factory', exact: false, icon: Sparkles,        label: 'Content Factory', sub: 'AI article generation'    },
  { href: '/admin/coverage',        exact: false, icon: BarChart3,       label: 'Coverage Map',    sub: 'Platform coverage status' },
  { href: '/admin/annual-update',    exact: false, icon: RefreshCw,       label: 'Annual Update',   sub: 'Bulk re-verification'     },
  { href: '/admin/settings',        exact: false, icon: Settings,        label: 'Settings',        sub: 'Config & environment'     },
]

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(href + '/')
}

function getBreadcrumb(pathname: string) {
  const map: Record<string, string> = {
    '/admin':                 'Command Centre',
    '/admin/country-builder': 'Country Manager',
    '/admin/data-quality':    'Data Quality',
    '/admin/content-factory': 'Content Factory',
    '/admin/coverage':        'Coverage Map',
    '/admin/annual-update':   'Annual Update',
    '/admin/settings':        'Settings',
  }
  const base  = '/' + pathname.split('/').slice(1, 3).join('/')
  const label = map[base] ?? 'Admin'
  const parts = pathname.split('/')
  const isDetail = parts.length > 3
  return { label, isDetail, detail: isDetail ? parts[3]?.toUpperCase() : null }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const crumb    = getBreadcrumb(pathname)

  async function handleLogout() {
    await fetch('/api/admin-logout', { method: 'POST' })
    router.push('/admin-login')
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#080d1a' }}>

      {/* SIDEBAR */}
      <aside className="w-64 shrink-0 flex flex-col border-r" style={{ background: '#0d1424', borderColor: '#1a2238' }}>

        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: '#1a2238' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)' }}>
              <Globe size={17} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-tight">HRLake</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <p className="text-xs font-semibold" style={{ color: '#34d399' }}>Admin Console</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const active = isActive(pathname, item.href, item.exact)
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative"
                style={{
                  background:  active ? 'rgba(37,99,235,0.12)' : 'transparent',
                  borderLeft:  active ? '2px solid #2563eb'    : '2px solid transparent',
                }}>
                {active && (
                  <div className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ background: 'linear-gradient(90deg,rgba(37,99,235,0.06),transparent)' }} />
                )}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
                  style={{ background: active ? '#2563eb' : 'rgba(255,255,255,0.04)' }}>
                  <item.icon size={15} style={{ color: active ? '#ffffff' : '#475569' }} />
                </div>
                <div className="relative">
                  <p className="text-sm font-semibold" style={{ color: active ? '#ffffff' : '#64748b' }}>
                    {item.label}
                  </p>
                  <p className="text-xs" style={{ color: active ? 'rgba(255,255,255,0.45)' : '#334155' }}>
                    {item.sub}
                  </p>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t space-y-0.5" style={{ borderColor: '#1a2238' }}>
          <a href="https://hrlake.com"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold" style={{ color: '#475569' }}>View Live Platform</span>
            </div>
            <ExternalLink size={11} style={{ color: '#1e293b' }} />
          </a>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all w-full text-left"
            style={{ background: 'transparent' }}>
            <LogOut size={14} style={{ color: '#ef4444' }} />
            <span className="text-xs font-semibold" style={{ color: '#ef4444' }}>Log out</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="h-12 shrink-0 flex items-center px-6 border-b"
          style={{ background: '#0d1424', borderColor: '#1a2238' }}>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold" style={{ color: '#334155' }}>Admin</span>
            <ChevronRight size={12} style={{ color: '#1e293b' }} />
            <span className="font-semibold" style={{ color: '#64748b' }}>{crumb.label}</span>
            {crumb.isDetail && crumb.detail && (
              <>
                <ChevronRight size={12} style={{ color: '#1e293b' }} />
                <span className="font-bold text-white">{crumb.detail}</span>
              </>
            )}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold" style={{ color: '#34d399' }}>Build: Green</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Suspense fallback={
            <div className="p-8 space-y-4 animate-pulse">
              <div className="h-8 w-64 rounded-xl" style={{ background: '#0d1424' }} />
              <div className="h-4 w-96 rounded-lg" style={{ background: '#0d1424' }} />
              <div className="grid grid-cols-4 gap-4 mt-6">
                {[...Array(4)].map((_,i) => (
                  <div key={i} className="h-28 rounded-2xl" style={{ background: '#0d1424' }} />
                ))}
              </div>
              <div className="h-64 rounded-2xl mt-4" style={{ background: '#0d1424' }} />
            </div>
          }>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  )
}
