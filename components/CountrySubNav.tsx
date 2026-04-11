'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useEffect } from 'react'

interface Props {
  code: string
  countryName: string
}

const tabs = [
  { label: 'Overview',       path: '' },
  { label: 'Calculator',     path: '/payroll-calculator' },
  { label: 'Tax',            path: '/tax-guide' },
  { label: 'Payroll',        path: '/payroll-guide' },
  { label: 'Employment Law', path: '/employmentlaw' },
  { label: 'Hiring',         path: '/hiring-guide' },
  { label: 'HR Compliance',  path: '/hr-compliance' },
  { label: 'Leave',          path: '/leave-benefits' },
  { label: 'Compliance',     path: '/compliance-calendar' },
  { label: 'EOR Guide',      path: '/eor' },
  { label: 'Insights',       path: '/insights' },
]

export default function CountrySubNav({ code, countryName }: Props) {
  const pathname = usePathname()
  const base = `/countries/${code.toLowerCase()}`
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current
      const active = activeRef.current
      const offset = active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2
      container.scrollTo({ left: offset, behavior: 'smooth' })
    }
  }, [pathname])

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-16 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 shrink-0 border-r border-slate-200 pr-4 py-3">
            <img
              src={`https://flagcdn.com/20x15/${code.toLowerCase()}.png`}
              alt={countryName}
              width={20}
              height={15}
              className="rounded-sm shadow-sm"
            />
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">{countryName}</span>
          </div>
          <div
            ref={scrollRef}
            className="flex items-center gap-1 overflow-x-auto py-2.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-1"
          >
            {tabs.map(tab => {
              const href = tab.label === 'EOR Guide'
                ? `/eor/${code.toLowerCase()}/`
                : `${base}${tab.path}/`
              const isActive = pathname === href || pathname === href.slice(0, -1)
              return (
                <Link
                  key={href}
                  href={href}
                  ref={isActive ? activeRef : null}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
