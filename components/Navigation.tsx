'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Globe, User, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react'
import SearchBar from '@/components/SearchBar'
import { usePathname } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'

const countryDropdown = [
  { label: 'All Countries', href: '/countries/', sub: 'COUNTRY_COUNT_PLACEHOLDER' },
  { label: 'Compare Countries', href: '/compare/', sub: 'Side-by-side cost comparison' },
  { label: 'Global Calculator', href: '/payroll-tools/global-calculator/', sub: 'Multi-country payroll tool' },
  { label: 'EOR Intelligence', href: '/eor/', sub: 'Employer of Record guides' },
]

const toolsDropdown = [
  { label: 'Payroll Tools', href: '/payroll-tools/', sub: 'All payroll tools' },
  { label: 'Global Calculator', href: '/payroll-tools/global-calculator/', sub: 'Multi-country calculator' },
  { label: 'Currency Converter', href: '/payroll-tools/currency-converter/', sub: 'Live exchange rates' },
  { label: 'Compare Countries', href: '/compare/', sub: 'Side-by-side comparison' },
  { label: 'AI Assistant', href: '/ai-assistant/', sub: 'Ask HR and payroll questions' },
]

function MobileSection({ label, links, onClose, countryCount }: {
  label: string
  links: { label: string; href: string; sub?: string }[]
  onClose: () => void
  countryCount?: number
}) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
      >
        {label}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="ml-3 border-l border-slate-800 pl-3 mb-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex flex-col px-3 py-2 rounded-lg hover:bg-white/5 transition-all group"
            >
              <span className="text-sm font-medium text-slate-300 group-hover:text-white">{link.label}</span>
              {link.sub && <span className="text-xs text-slate-500 group-hover:text-slate-400">{link.sub === 'COUNTRY_COUNT_PLACEHOLDER' ? `Browse all ${countryCount} countries` : link.sub}</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navigation({ countryCount = 23 }: { countryCount?: number }) {
  const pathname = usePathname()
  const strip = (h: string) => h.replace(/\/$/, '')
  const matchesAny = (paths: string[]) => paths.some(h => {
    const p = strip(pathname); const s = strip(h)
    return p === s || p.startsWith(s + '/')
  })
  const navGroups: Record<string, string[]> = {
    '/countries/': ['/countries/'],
    '/eor/': ['/eor/'],
    '/hr-compliance/': ['/hr-compliance/'],
    '/payroll-tools/': ['/payroll-tools/', '/compare/', '/ai-assistant/'],
    '/insights/': ['/insights/'],
  }
  const isActive = (href: string) => matchesAny(navGroups[href] || [href])
  const navLink = (href: string) => `px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${isActive(href) ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [countriesOpen, setCountriesOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const { isSignedIn, user } = useUser()
  const { signOut } = useClerk()

  const firstName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split('@')?.[0] || 'Account'

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-6">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 mr-10">
            <Globe className="h-5 w-5 text-blue-500" />
            <span className="text-base font-bold text-white tracking-tight hidden sm:block">
              HRLake<span className="align-super text-[10px] ml-0.5">®</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1">
            <div className="relative"
              onMouseEnter={() => setCountriesOpen(true)}
              onMouseLeave={() => setCountriesOpen(false)}
            >
              <Link href="/countries/"
                className={`flex items-center gap-1 ${navLink('/countries/')}`}
              >
                Countries <ChevronDown size={12} />
              </Link>
              {countriesOpen && (
                <div className="absolute left-0 top-full -mt-1 pt-2 w-64 z-50">
                  <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2">
                  {countryDropdown.map(item => (
                    <Link key={item.href} href={item.href}
                      className="block px-4 py-2.5 hover:bg-slate-800 transition-colors"
                      onClick={() => setCountriesOpen(false)}
                    >
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.sub === 'COUNTRY_COUNT_PLACEHOLDER' ? `Browse all ${countryCount} countries` : item.sub}</p>
                    </Link>
                  ))}
                  </div>
                </div>
              )}
            </div>
            <Link href="/eor/" className={navLink('/eor/')}>EOR</Link>
            <Link href="/hr-compliance/" className={navLink('/hr-compliance/')}>HR Compliance</Link>
            <div className="relative"
              onMouseEnter={() => setToolsOpen(true)}
              onMouseLeave={() => setToolsOpen(false)}
            >
              <Link href="/payroll-tools/"
                className={`flex items-center gap-1 ${navLink('/payroll-tools/')}`}
              >
                Tools <ChevronDown size={12} />
              </Link>
              {toolsOpen && (
                <div className="absolute left-0 top-full -mt-1 pt-2 w-64 z-50">
                  <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2">
                  {toolsDropdown.map(item => (
                    <Link key={item.href} href={item.href}
                      className="block px-4 py-2.5 hover:bg-slate-800 transition-colors"
                      onClick={() => setToolsOpen(false)}
                    >
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.sub === 'COUNTRY_COUNT_PLACEHOLDER' ? `Browse all ${countryCount} countries` : item.sub}</p>
                    </Link>
                  ))}
                  </div>
                </div>
              )}
            </div>
            <Link href="/insights/" className={navLink('/insights/')}>Insights</Link>
            <Link href="/insights/?topic=education" className={navLink('/insights/')}>Learning</Link>
          </nav>

          {/* SEARCH — desktop */}
          <div className="hidden md:block flex-1 lg:flex-none lg:w-56 xl:w-64">
            <SearchBar variant="nav" />
          </div>

          {/* CTA — signed out — placed on hold, pending future decision */}

          {/* USER MENU — signed in */}
          {isSignedIn && (
            <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto lg:ml-0 relative">

              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-3 py-1.5 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                  <User size={13} className="text-white" />
                </div>
                <span className="text-sm font-medium text-slate-300">{firstName}</span>
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50">
                  <Link href="/dashboard/"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <LayoutDashboard size={15} className="text-blue-400" />
                    Dashboard
                  </Link>
                  <Link href="/dashboard/saved/"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <User size={15} className="text-blue-400" />
                    Saved Calculations
                  </Link>
                  <div className="border-t border-slate-700 my-1" />
                  <button
                    onClick={() => { setUserMenuOpen(false); signOut({ redirectUrl: '/' }) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MOBILE BUTTON */}
          <button
            className="md:hidden ml-auto p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-950 border-t border-slate-800/80">
          <div className="px-4 py-3">
            <SearchBar variant="nav" placeholder="Search countries…" />
          </div>
          <nav className="px-2 pb-2">
            {/* Countries expandable section */}
            <MobileSection label="Countries" links={countryDropdown} onClose={() => setMobileOpen(false)} countryCount={countryCount} />
            {/* Tools expandable section */}
            <MobileSection label="Tools" links={toolsDropdown} onClose={() => setMobileOpen(false)} />
            {/* Remaining flat links */}
            {[
              { label: 'HR Compliance', href: '/hr-compliance/' },
              { label: 'Insights', href: '/insights/' },
              { label: 'Learning', href: '/insights/?topic=education' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="px-4 py-3 border-t border-slate-800/80 flex gap-2">
            {!isSignedIn ? (
              <></>
            ) : (
              <>
                <Link href="/dashboard/"
                  className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-slate-300 border border-slate-700 rounded-lg transition-all"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); signOut({ redirectUrl: '/' }) }}
                  className="flex-1 text-center px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-all"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
