import Link from "next/link"
import { getBreadcrumbStructuredData, jsonLd } from "@/lib/structured-data"
import { ArrowRight, Check } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Everything is Free | HRLake",
  description: "HRLake is completely free. All country payroll data, tax guides, employment law, EOR intelligence, payroll calculators, and AI assistant — no account required for most features.",
  alternates: { canonical: "https://hrlake.com/pricing/" },
  openGraph: {
    title: "Everything is Free | HRLake",
    description: "All country payroll data, calculators, EOR intelligence, and employment law guides — completely free.",
    url: "https://hrlake.com/pricing/",
    siteName: "HRLake",
    type: "website",
  },
}

const ALL_FEATURES = [
  { category: "Country Data", items: ["Income tax brackets and rates for all active countries", "Employer and employee social security rates", "Employment law summaries", "Statutory leave and benefits data", "Public holiday calendars", "Payroll compliance obligations"] },
  { category: "Calculators & Tools", items: ["Full gross-to-net payroll calculator", "PDF export of any calculation", "Country comparison tool", "EOR cost estimator", "Currency converter", "Save and revisit calculations (free account)"] },
  { category: "EOR Intelligence", items: ["EOR vs direct employment analysis", "Risk level and maturity ratings", "Provider fee range estimates", "Compliance risk grids", "Hiring speed guidance", "Full recommendation per country"] },
  { category: "Guides & Compliance", items: ["Tax guides with structured data", "Hiring guides with step-by-step process", "HR compliance guides", "Leave and benefits guides", "Compliance calendars", "Payroll guides"] },
  { category: "AI & Insights", items: ["HRLake AI assistant", "Latest analysis and intelligence articles", "Country-specific HR insights", "Employment law updates"] },
]

const FAQS = [
  { q: "Is everything really free?", a: "Yes. All country data, calculators, EOR guides, employment law summaries, AI assistant, and PDF exports are free. No hidden tiers, no credit card required for core features." },
  { q: "Do I need an account?", a: "No account is required to access country data, calculators, and guides. A free account lets you save calculations and revisit them later." },
  { q: "Will it always be free?", a: "All core data and tools are and will remain free. A Pro plan is in development for power users who need advanced features. Subscribers will be notified first when it launches." },
  { q: "Is the data accurate enough for professional use?", a: "All data is sourced from official government publications and reviewed by qualified payroll professionals. It is designed as a research and reference tool. We always recommend verifying critical decisions with a qualified adviser in the relevant jurisdiction." },
  { q: "Do you offer enterprise plans?", a: "Enterprise pricing with API access, white-label calculators, and dedicated support is available for EOR platforms, payroll bureaus, and law firms. Contact us to discuss your requirements." },
  { q: "How often is the data updated?", a: "Employment rates, tax brackets, and statutory thresholds are reviewed on a rolling monthly cycle and updated when official sources publish changes." },
]

export default function PricingPage() {
  const breadcrumb = getBreadcrumbStructuredData([
    { name: "Home", href: "https://hrlake.com/" },
    { name: "Pricing", href: "https://hrlake.com/pricing/" },
  ])
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <main className="bg-white flex-1">

        {/* HERO */}
        <section className="relative bg-slate-950 overflow-hidden">
          <div className="absolute inset-0" style={{background: "radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%)"}} />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20 text-center">
            <nav className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-6">
              <a href="/" className="hover:text-slate-200 transition-colors">Home</a>
              <span>›</span>
              <span className="text-slate-300">Pricing</span>
            </nav>
            <div className="inline-flex items-center gap-2 bg-teal-600/10 border border-teal-500/20 rounded-full px-4 py-1.5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span className="text-teal-300 text-xs font-semibold tracking-wide">No catch. No card. No paywall.</span>
            </div>
            <h1 className="font-serif text-4xl lg:text-6xl font-bold text-white leading-[1.08] mb-6" style={{letterSpacing: "-0.025em"}}>
              Everything is<br /><span className="text-teal-400">free.</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
              Every data point, every calculator, every guide, every EOR analysis — free to access right now.
              No account required for most features. No upgrade prompts. No limits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/countries/"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-4 rounded-xl transition-colors text-sm">
                Browse country data <ArrowRight size={15} />
              </Link>
              <Link href="/payroll-tools/"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold px-7 py-4 rounded-xl transition-colors text-sm">
                Open payroll calculator
              </Link>
            </div>
          </div>
        </section>

        {/* WHAT IS FREE */}
        <section className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
            <div className="mb-14 text-center">
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">What you get</p>
              <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight">Everything. Free.</h2>
              <p className="text-slate-500 mt-4 max-w-xl mx-auto leading-relaxed">All of the below is available right now at no cost. A Pro plan is in development — subscribers will be notified first when it launches.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ALL_FEATURES.map(section => (
                <div key={section.category} className="bg-white border border-slate-200 rounded-2xl p-7">
                  <div className="h-1 bg-blue-600 rounded-full mb-5 w-10" />
                  <h3 className="font-bold text-slate-900 text-lg mb-4">{section.category}</h3>
                  <ul className="space-y-2.5">
                    {section.items.map(item => (
                      <li key={item} className="flex items-start gap-2.5">
                        <Check size={15} className="text-teal-500 shrink-0 mt-0.5" />
                        <span className="text-slate-600 text-sm leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ENTERPRISE */}
        <section className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
            <div className="bg-slate-900 rounded-2xl p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 max-w-5xl mx-auto">
              <div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Enterprise</p>
                <h3 className="font-bold text-white text-2xl mb-2 leading-snug">API access, white-label calculators, dedicated support.</h3>
                <p className="text-slate-400 leading-relaxed max-w-lg">For EOR platforms, payroll bureaus, and law firms with bulk data needs. Custom pricing based on usage and integration requirements.</p>
              </div>
              <Link href="/contact/"
                className="shrink-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-4 rounded-xl transition-colors text-sm">
                Contact us <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
            <div className="mb-14">
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-3">FAQ</p>
              <h2 className="font-serif text-4xl font-bold text-slate-900 tracking-tight">Common questions.</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 max-w-5xl">
              {FAQS.map(faq => (
                <div key={faq.q} className="bg-white border border-slate-200 rounded-2xl p-7">
                  <h3 className="font-bold text-slate-900 mb-3 leading-snug">{faq.q}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden" style={{backgroundColor: "#0d1f3c"}}>
          <div className="absolute inset-0" style={{background: "radial-gradient(ellipse at 80% 50%, rgba(30,111,255,0.12) 0%, transparent 60%)"}} />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div>
              <h2 className="font-serif text-4xl font-bold text-white leading-tight tracking-tight mb-4">
                The platform is free.<br />Start now.
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-xl">
                No account required for most features. Subscribe to stay updated on new countries,
                data updates, and Pro plan launch.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link href="/countries/"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-4 rounded-xl transition-colors text-sm">
                Browse free data <ArrowRight size={15} />
              </Link>
              <Link href="/insights/"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold px-7 py-4 rounded-xl transition-colors text-sm">
                Subscribe for updates
              </Link>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}
