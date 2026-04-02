import Link from 'next/link'
import { Database, BarChart3, Settings, Shield } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">HRLake Admin</p>
              <p className="text-slate-500 text-xs">Internal tools</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            { href: '/admin/data-quality', icon: Database, label: 'Data Quality', sub: 'Verify country data' },
            { href: '/admin/coverage',     icon: BarChart3, label: 'Coverage Map', sub: 'Country coverage' },
            { href: '/admin/settings',     icon: Settings,  label: 'Settings',     sub: 'Admin settings' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-800 transition-all group"
            >
              <div className="bg-slate-800 group-hover:bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0">
                <item.icon size={15} className="text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">{item.label}</p>
                <p className="text-xs text-slate-500">{item.sub}</p>
              </div>
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 transition-all"
          >
            <span className="text-xs text-slate-500 hover:text-slate-300">← Back to platform</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

    </div>
  )
}
