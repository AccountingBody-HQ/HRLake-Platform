// ============================================
// GLOBALPAYROLLEXPERT — FOOTER COMPONENT
// ============================================
import Link from 'next/link'
import { Globe } from 'lucide-react'

const footerLinks = {
  'Country Data': [
    { label: 'All Countries',      href: '/countries/' },
    { label: 'Compare Countries',  href: '/compare/' },
    { label: 'Payroll Tools',      href: '/payroll-tools/' },
    { label: 'Global Calculator',  href: '/payroll-tools/global-calculator/' },
  ],
  'Employer Guides': [
    { label: 'EOR Intelligence',   href: '/eor/' },
    { label: 'HR Compliance',      href: '/hr-compliance/' },
    { label: 'Insights',           href: '/insights/' },
    { label: 'AI Assistant',       href: '/ai-assistant/' },
  ],
  'Account': [
    { label: 'Pricing',            href: '/pricing/' },
    { label: 'Sign In',            href: '/sign-in/' },
    { label: 'Sign Up',            href: '/sign-up/' },
    { label: 'Dashboard',          href: '/dashboard/' },
  ],
  'Company': [
    { label: 'About',              href: '/about/' },
    { label: 'Contact',            href: '/contact/' },
    { label: 'Privacy Policy',     href: '/privacy-policy/' },
    { label: 'Terms',              href: '/terms/' },
    { label: 'Disclaimer',         href: '/disclaimer/' },
  ],
}

export default function Footer() {
  const currentYear = new Date().getFullYear()
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* TOP SECTION */}
        <div className="py-16 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">

          {/* BRAND */}
          <div className="col-span-2 lg:col-span-2 pr-8">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <Globe className="h-5 w-5 text-blue-400 shrink-0" />
              <span className="text-base font-bold text-white tracking-tight">
                Global Payroll Expert
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 mb-6">
              World-class global payroll and HR intelligence. Payroll data,
              calculators, and compliance guides for every country.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-slate-500">Data updated monthly</span>
            </div>
          </div>

          {/* LINK COLUMNS */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading} className="col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-4">
                {heading}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* BOTTOM SECTION */}
        <div className="border-t border-slate-800 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © {currentYear} GlobalPayrollExpert.com — All rights reserved.
          </p>
          <p className="text-xs text-slate-600 text-left sm:text-right max-w-lg leading-relaxed">
            Data is provided for reference purposes only and does not constitute
            professional legal, tax, or payroll advice. Always verify with a
            qualified local adviser.{` `}
            <Link href="/disclaimer/"
              className="text-slate-500 underline underline-offset-2 hover:text-slate-300 transition-colors">
              Read our disclaimer.
            </Link>
          </p>
        </div>

      </div>
    </footer>
  )
}
