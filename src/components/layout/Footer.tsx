import Link from "next/link";
import { Globe, Twitter, Linkedin, Mail } from "lucide-react";

const footerLinks = {
  "Countries": [
    { label: "All Countries",     href: "/countries/" },
    { label: "United Kingdom",    href: "/countries/gb/" },
    { label: "United States",     href: "/countries/us/" },
    { label: "Germany",           href: "/countries/de/" },
    { label: "France",            href: "/countries/fr/" },
    { label: "Singapore",         href: "/countries/sg/" },
    { label: "Compare Countries", href: "/compare/" },
  ],
  "Platform": [
    { label: "EOR Intelligence",  href: "/eor/" },
    { label: "HR Compliance",     href: "/hr-compliance/" },
    { label: "Payroll Tools",     href: "/payroll-tools/" },
    { label: "Insights",          href: "/insights/" },
    { label: "Site Search",       href: "/search/" },
    { label: "AI Assistant",      href: "/ai-assistant/" },
  ],
  "Account": [
    { label: "Pricing",           href: "/pricing/" },
    { label: "Sign Up Free",      href: "/sign-up/" },
    { label: "Sign In",           href: "/sign-in/" },
    { label: "Dashboard",         href: "/dashboard/" },
  ],
  "Company": [
    { label: "About",             href: "/about/" },
    { label: "Contact",           href: "/contact/" },
    { label: "Privacy Policy",    href: "/privacy-policy/" },
    { label: "Terms of Use",      href: "/terms/" },
    { label: "Disclaimer",        href: "/disclaimer/" },
    { label: "Cookie Policy",     href: "/cookie-policy/" },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy-950 text-white">
      <div className="border-b border-white/10">
        <div className="container-hrlake py-12">
          <div className="max-w-xl">
            <h3 className="text-xl font-bold mb-1">Stay ahead of global payroll changes</h3>
            <p className="text-slate-400 text-sm mb-4">
              Rate changes, new employment laws, and compliance updates — delivered free.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your work email"
                className="flex-1 h-10 px-4 rounded-md bg-white/10 border border-white/20 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                className="h-10 px-5 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors shrink-0"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-slate-600 mt-2">No spam. Unsubscribe any time.</p>
          </div>
        </div>
      </div>
      <div className="container-hrlake py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group" aria-label="HRLake home">
              <div className="w-8 h-8 rounded-lg bg-gradient-blue flex items-center justify-center shadow-sm">
                <Globe size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <span style={{fontWeight:900,fontSize:"0.9rem",letterSpacing:"-0.06em",fontFamily:"Inter,sans-serif"}}>HR<span style={{color:"#2dd4bf",letterSpacing:"-0.06em"}}>Lake</span></span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Where global HR knowledge dives deep.
              Trusted by enterprise HR teams, EOR firms, lawyers, and payroll directors worldwide.
            </p>
            <div className="flex items-center gap-2">
              <a href="https://twitter.com/hrlake" target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition-colors" aria-label="Twitter">
                <Twitter size={16} />
              </a>
              <a href="https://linkedin.com/company/hrlake" target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition-colors" aria-label="LinkedIn">
                <Linkedin size={16} />
              </a>
              <a href="mailto:hello@hrlake.com" className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:text-white hover:bg-white/10 transition-colors" aria-label="Email">
                <Mail size={16} />
              </a>
            </div>
          </div>
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                {heading}
              </h4>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-slate-500 hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-hrlake py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">&copy; {year} HRLake.com — All rights reserved.</p>
          <p className="text-xs text-slate-700 text-center sm:text-right max-w-md">
            Data is provided for informational purposes only and does not constitute
            professional legal, tax, or payroll advice. Always verify with a qualified adviser.
          </p>
        </div>
      </div>
    </footer>
  );
}
