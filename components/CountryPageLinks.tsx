import Link from 'next/link'
import { Calculator, Scale, FileText, Users } from 'lucide-react'

interface Props {
  countryCode: string
  countryName: string
}

const SUB_PAGES = [
  {
    href: (code: string) => `/countries/${code}/payroll-calculator/`,
    icon: Calculator,
    label: 'Payroll Calculator',
    description: 'Calculate net pay, tax, and employer costs',
    accent: 'bg-blue-50 text-blue-700',
    border: 'hover:border-blue-300',
    top: 'bg-blue-600',
  },
  {
    href: (code: string) => `/countries/${code}/employmentlaw/`,
    icon: Scale,
    label: 'Employment Law',
    description: 'Leave, notice periods, probation, overtime',
    accent: 'bg-indigo-50 text-indigo-700',
    border: 'hover:border-indigo-300',
    top: 'bg-indigo-600',
  },
  {
    href: (code: string) => `/countries/${code}/tax-guide/`,
    icon: FileText,
    label: 'Tax Guide',
    description: 'Income tax brackets, rates and thresholds',
    accent: 'bg-sky-50 text-sky-700',
    border: 'hover:border-sky-300',
    top: 'bg-sky-600',
  },
  {
    href: (code: string) => `/countries/${code}/hiring-guide/`,
    icon: Users,
    label: 'Hiring Guide',
    description: 'How to hire compliantly in this country',
    accent: 'bg-teal-50 text-teal-700',
    border: 'hover:border-teal-300',
    top: 'bg-teal-600',
  },
]

export default function CountryPageLinks({ countryCode, countryName }: Props) {
  const code = countryCode.toLowerCase()

  return (
    <section className="border-t border-slate-200 pt-12 mt-12">
      <div className="mb-8">
        <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-2">
          Explore
        </p>
        <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
          Everything for {countryName}
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {SUB_PAGES.map((page) => (
          <Link
            key={page.label}
            href={page.href(code)}
            className={`group bg-white border border-slate-200 ${page.border} rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col`}
          >
            <div className={`h-1.5 ${page.top}`} />
            <div className="p-6 flex flex-col flex-1">
              <div className={`inline-flex p-3 rounded-xl ${page.accent} w-fit mb-4`}>
                <page.icon size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2 leading-tight">
                {page.label}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed flex-1">
                {page.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
