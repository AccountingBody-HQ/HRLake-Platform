'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  code: string
  countryName: string
}

const tabs = [
  { label: 'Overview',            path: '' },
  { label: 'Calculator',          path: '/payroll-calculator' },
  { label: 'Tax Guide',           path: '/tax-guide' },
  { label: 'Payroll Guide',       path: '/payroll-guide' },
  { label: 'Employment Law',      path: '/employmentlaw' },
  { label: 'Hiring Guide',        path: '/hiring-guide' },
  { label: 'HR Compliance',       path: '/hr-compliance' },
  { label: 'Leave & Benefits',    path: '/leave-benefits' },
  { label: 'Compliance Calendar', path: '/compliance-calendar' },
  { label: 'EOR Guide',           path: '/eor' },
]

export default function CountrySubNav({ code, countryName }: Props) {
  const pathname = usePathname()
  const base = `/countries/${code.toLowerCase()}`

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center overflow-x-auto -mb-px">
          {tabs.map(tab => {
            const href = tab.label === 'EOR Guide'
              ? `/eor/${code.toLowerCase()}/`
              : `${base}${tab.path}/`
            const isActive = pathname === href || pathname === href.slice(0, -1)
            return (
              <Link
                key={href}
                href={href}
                className={`shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-blue-600 hover:border-blue-300'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
