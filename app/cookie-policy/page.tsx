import Link from 'next/link'
import CookieSettingsButton from '@/components/CookieSettingsButton'

export const metadata = {
  title: 'Cookie Policy — GlobalPayrollExpert',
  description: 'How GlobalPayrollExpert uses cookies and how to manage them.',
}

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* HERO */}
      <section className="relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0" style={{background: 'radial-gradient(ellipse at 60% 0%, rgba(30,111,255,0.15) 0%, transparent 60%)'}} />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-blue-300 text-xs font-semibold tracking-wide">Legal</span>
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white leading-[1.08] mb-6" style={{letterSpacing: '-0.025em'}}>
              Cookie Policy
            </h1>
            <p className="text-slate-400 text-sm">Last updated: March 2026</p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-4 gap-16">

            {/* Sticky nav */}
            <div className="hidden lg:block">
              <div className="sticky top-8 space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Contents</p>
                {[
                  ['#what-are-cookies',    'What are cookies'],
                  ['#essential',           'Essential cookies'],
                  ['#analytics',           'Analytics cookies'],
                  ['#functional',          'Functional cookies'],
                  ['#third-party',         'Third-party cookies'],
                  ['#managing-cookies',    'Managing cookies'],
                  ['#contact',             'Contact us'],
                ].map(([href, label]) => (
                  <a key={href} href={href} className="block text-sm text-slate-500 hover:text-blue-600 py-1 transition-colors">
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="lg:col-span-3 prose prose-slate max-w-none">

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12 not-prose">
                <p className="text-blue-800 text-sm leading-relaxed">
                  This Cookie Policy explains how GlobalPayrollExpert.com uses cookies and similar
                  technologies. We use cookies to operate the platform, remember your preferences,
                  and understand how visitors use the site. We do not use cookies for advertising.
                </p>
              </div>

              <h2 id="what-are-cookies">1. What are cookies</h2>
              <p>Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work efficiently, remember your preferences, and provide information to website owners.</p>
              <p>We also use similar technologies such as local storage and session tokens, which work in a similar way to cookies and are covered by this policy.</p>

              <h2 id="essential">2. Essential cookies</h2>
              <p>These cookies are strictly necessary for the platform to function. They cannot be switched off. Without them, features like signing in and maintaining your session would not work.</p>

              {/* Cookie table */}
              <div className="not-prose overflow-x-auto rounded-2xl border border-slate-200 my-8">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900 text-slate-300">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider">Cookie</th>
                      <th className="hidden sm:table-cell text-left px-5 py-3 text-xs font-bold uppercase tracking-wider">Provider</th>
                      <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider">Purpose</th>
                      <th className="hidden sm:table-cell text-left px-5 py-3 text-xs font-bold uppercase tracking-wider">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { name: '__session',        provider: 'Clerk',               purpose: 'Maintains your authenticated session',              duration: 'Session' },
                      { name: '__client_uat',     provider: 'Clerk',               purpose: 'User authentication token',                        duration: '1 year'  },
                      { name: 'gpe_admin',        provider: 'GlobalPayrollExpert', purpose: 'Admin area session (internal use only)',            duration: '7 days'  },
                      { name: 'cookie_consent',   provider: 'GlobalPayrollExpert', purpose: 'Stores your cookie consent preferences',           duration: '1 year'  },
                    ].map(row => (
                      <tr key={row.name} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-mono text-xs text-slate-700">{row.name}</td>
                        <td className="hidden sm:table-cell px-5 py-3 text-slate-600">{row.provider}</td>
                        <td className="px-5 py-3 text-slate-600">{row.purpose}</td>
                        <td className="hidden sm:table-cell px-5 py-3 text-slate-500">{row.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 id="analytics">3. Analytics cookies</h2>
              <p>We use analytics cookies to understand how visitors use the platform — which pages are most visited, how long people spend on the site, and where visitors come from. This helps us improve the platform. These cookies collect data in aggregate and do not identify you personally.</p>

              <div className="not-prose overflow-x-auto rounded-2xl border border-slate-200 my-8">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900 text-slate-300">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider">Cookie</th>
                      <th className="hidden sm:table-cell text-left px-5 py-3 text-xs font-bold uppercase tracking-wider">Provider</th>
                      <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider">Purpose</th>
                      <th className="hidden sm:table-cell text-left px-5 py-3 text-xs font-bold uppercase tracking-wider">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { name: '_ga',         provider: 'Google Analytics', purpose: 'Distinguishes unique users',           duration: '2 years'  },
                      { name: '_ga_*',       provider: 'Google Analytics', purpose: 'Maintains session state',             duration: '2 years'  },
                      { name: '_vercel_*',   provider: 'Vercel Analytics', purpose: 'Platform performance analytics',      duration: 'Session'  },
                    ].map(row => (
                      <tr key={row.name} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-mono text-xs text-slate-700">{row.name}</td>
                        <td className="hidden sm:table-cell px-5 py-3 text-slate-600">{row.provider}</td>
                        <td className="px-5 py-3 text-slate-600">{row.purpose}</td>
                        <td className="hidden sm:table-cell px-5 py-3 text-slate-500">{row.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p>Analytics cookies are only set if you accept them via our cookie consent banner. You can withdraw consent at any time.</p>

              <h2 id="functional">4. Functional cookies</h2>
              <p>Functional cookies remember your preferences and improve your experience. For example, remembering your preferred calculator settings or your last searched country.</p>
              <p>These cookies do not track you across other websites and do not collect personal data that could be used to identify you.</p>

              <h2 id="third-party">5. Third-party cookies</h2>
              <p>Some third-party services we use may set their own cookies. These are set by:</p>
              <ul>
                <li><strong>Clerk</strong> — for authentication. Clerk&apos;s cookies are essential and cannot be disabled.</li>
                <li><strong>Google Analytics</strong> — for usage analytics, only if you consent.</li>
                <li><strong>Lemon Squeezy</strong> — may set cookies during the checkout process.</li>
              </ul>
              <p>We do not use any advertising networks or third-party tracking cookies for marketing purposes. We do not share cookie data with advertisers.</p>

              <h2 id="managing-cookies">6. Managing your cookie preferences</h2>
              <p>When you first visit the platform, you will be shown a cookie consent banner. You can choose to accept all cookies, accept essential cookies only, or customise your preferences.</p>
              <p>You can update your cookie preferences at any time by clicking the cookie settings link in the footer.</p>
              <p>You can also control cookies through your browser settings. Most browsers allow you to:</p>
              <ul>
                <li>See what cookies are stored and delete them individually</li>
                <li>Block third-party cookies</li>
                <li>Block cookies from specific sites</li>
                <li>Block all cookies</li>
                <li>Delete all cookies when you close your browser</li>
              </ul>
              <p>Please note that blocking essential cookies will prevent the platform from functioning correctly — you will not be able to sign in or maintain your session.</p>
              <p>For guidance on managing cookies in your browser, visit <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer">aboutcookies.org</a>.</p>

              <div className="not-prose bg-slate-900 border border-slate-700 rounded-2xl p-6 my-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-white font-bold text-sm mb-1">Manage your cookie preferences</p>
                  <p className="text-slate-400 text-sm">You can review and update your consent choices at any time.</p>
                </div>
                <div className="shrink-0 [&>button]:bg-blue-600 [&>button]:hover:bg-blue-500 [&>button]:text-white [&>button]:font-semibold [&>button]:text-sm [&>button]:px-5 [&>button]:py-2.5 [&>button]:rounded-xl [&>button]:transition-all">
                  <CookieSettingsButton />
                </div>
              </div>

              <h2 id="contact">7. Contact us</h2>
              <p>If you have any questions about our use of cookies, please <Link href="/contact/">contact us</Link>. For information about how we handle your personal data more broadly, see our <Link href="/privacy-policy/">Privacy Policy</Link>.</p>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
