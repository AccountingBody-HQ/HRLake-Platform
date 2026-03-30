import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — GlobalPayrollExpert',
  description: 'Terms and conditions for using GlobalPayrollExpert.com.',
}

export default function TermsPage() {
  return (
    <main className="bg-white flex-1">

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
              Terms of Service
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
                  ['#acceptance',       'Acceptance'],
                  ['#the-platform',     'The platform'],
                  ['#accounts',         'Accounts'],
                  ['#pro-plan',         'Pro plan'],
                  ['#acceptable-use',   'Acceptable use'],
                  ['#data-accuracy',    'Data accuracy'],
                  ['#intellectual-property', 'Intellectual property'],
                  ['#liability',        'Liability'],
                  ['#termination',      'Termination'],
                  ['#changes',          'Changes'],
                  ['#governing-law',    'Governing law'],
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
                  Please read these Terms of Service carefully before using GlobalPayrollExpert.com.
                  By accessing or using the platform, you agree to be bound by these terms.
                  If you do not agree, please do not use the platform.
                </p>
              </div>

              <h2 id="acceptance">1. Acceptance of terms</h2>
              <p>By accessing GlobalPayrollExpert.com (&quot;the platform&quot;, &quot;we&quot;, &quot;us&quot;), you agree to these Terms of Service and our <Link href="/privacy-policy/">Privacy Policy</Link>. These terms apply to all users, including free and Pro subscribers.</p>

              <h2 id="the-platform">2. The platform</h2>
              <p>GlobalPayrollExpert is a payroll intelligence and reference platform providing country payroll data, calculators, employment law summaries, and related tools. The platform is operated by AccountingBody HQ.</p>
              <p>We reserve the right to modify, suspend, or discontinue any part of the platform at any time. We will endeavour to provide reasonable notice of significant changes.</p>

              <h2 id="accounts">3. Accounts</h2>
              <p>Some features require you to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must notify us immediately of any unauthorised use of your account.</p>
              <p>You must provide accurate and complete information when creating your account. You must be at least 18 years old to create an account.</p>

              <h2 id="pro-plan">4. Pro plan and payments</h2>
              <p>The Pro plan is a paid subscription that provides access to additional features including saved calculations, PDF exports, the AI assistant, and premium data tables.</p>
              <p>Payments are processed by Lemon Squeezy. By subscribing to Pro, you agree to Lemon Squeezy&apos;s terms of service. Subscription fees are charged in advance on a monthly or annual basis.</p>
              <p>You may cancel your Pro subscription at any time from your dashboard. Cancellation takes effect at the end of the current billing period. We do not offer refunds for partial billing periods, except where required by law.</p>
              <p>We reserve the right to change Pro plan pricing with reasonable notice. Price changes will not affect your current billing period.</p>

              <h2 id="acceptable-use">5. Acceptable use</h2>
              <p>You agree not to use the platform to:</p>
              <ul>
                <li>Scrape, copy, or systematically extract data from the platform without our written permission</li>
                <li>Attempt to gain unauthorised access to any part of the platform or its infrastructure</li>
                <li>Use the platform in any way that violates applicable law or regulation</li>
                <li>Resell, sublicense, or redistribute platform data or content without our written permission</li>
                <li>Use automated tools to access the platform at a rate that disrupts normal service</li>
                <li>Attempt to reverse engineer any part of the platform</li>
              </ul>
              <p>We reserve the right to suspend or terminate accounts that violate these terms without notice.</p>

              <h2 id="data-accuracy">6. Data accuracy and disclaimer</h2>
              <p>We make every reasonable effort to ensure the accuracy of data on the platform. All data is sourced from official government publications and reviewed by qualified payroll professionals.</p>
              <p>However, payroll and tax law changes frequently. We cannot guarantee that all data is current or complete at any given time. The platform is a research and reference tool — it is not professional advice.</p>
              <p>Please read our full <Link href="/disclaimer/">Data Accuracy Disclaimer</Link>. You should always verify critical decisions with a qualified professional in the relevant jurisdiction.</p>

              <h2 id="intellectual-property">7. Intellectual property</h2>
              <p>All content on the platform — including but not limited to the design, layout, text, graphics, and data compilations — is owned by or licensed to AccountingBody HQ and is protected by copyright and other intellectual property laws.</p>
              <p>You may access and use the platform for your own personal or internal business purposes. You may not reproduce, distribute, or create derivative works from platform content without our written permission.</p>
              <p>Underlying payroll data (tax rates, employment law rules) is sourced from public government publications. Our compilation, structuring, and verification of that data is our intellectual property.</p>

              <h2 id="liability">8. Limitation of liability</h2>
              <p>To the fullest extent permitted by law, GlobalPayrollExpert and AccountingBody HQ shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform or reliance on data provided.</p>
              <p>Our total liability to you for any claim arising from these terms or your use of the platform shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
              <p>Nothing in these terms excludes or limits liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be excluded by law.</p>

              <h2 id="termination">9. Termination</h2>
              <p>We may suspend or terminate your account at any time if you breach these terms or if we believe your account is being used fraudulently or in a way that harms other users or the platform.</p>
              <p>You may delete your account at any time from your dashboard. Upon deletion, your personal data will be removed in accordance with our <Link href="/privacy-policy/">Privacy Policy</Link>.</p>

              <h2 id="changes">10. Changes to these terms</h2>
              <p>We may update these terms from time to time. We will notify registered users of significant changes by email. Continued use of the platform after changes take effect constitutes acceptance of the updated terms.</p>

              <h2 id="governing-law">11. Governing law</h2>
              <p>These terms are governed by the laws of England and Wales. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>

              <hr />
              <p>If you have any questions about these terms, please <Link href="/contact/">contact us</Link>.</p>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
