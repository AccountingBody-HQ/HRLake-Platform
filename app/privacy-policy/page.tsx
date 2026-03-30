import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — GlobalPayrollExpert',
  description: 'How GlobalPayrollExpert collects, uses, and protects your personal data.',
}

export default function PrivacyPolicyPage() {
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
              Privacy Policy
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
                  ['#who-we-are',        'Who we are'],
                  ['#data-we-collect',   'Data we collect'],
                  ['#how-we-use',        'How we use data'],
                  ['#data-sharing',      'Data sharing'],
                  ['#cookies',           'Cookies'],
                  ['#your-rights',       'Your rights'],
                  ['#data-retention',    'Data retention'],
                  ['#security',          'Security'],
                  ['#contact',           'Contact us'],
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
                  This Privacy Policy explains how GlobalPayrollExpert.com (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects,
                  uses, and protects your personal data when you use our platform. We are committed to
                  protecting your privacy and complying with the UK GDPR and the Data Protection Act 2018.
                </p>
              </div>

              <h2 id="who-we-are">1. Who we are</h2>
              <p>GlobalPayrollExpert.com is operated by AccountingBody HQ. We are the data controller for personal data collected through this website. If you have any questions about this policy or your personal data, please <Link href="/contact/">contact us</Link>.</p>

              <h2 id="data-we-collect">2. Data we collect</h2>
              <p>We collect the following categories of personal data:</p>
              <h3>Account data</h3>
              <p>When you create an account, we collect your name, email address, and authentication credentials. Account creation is handled securely via Clerk.</p>
              <h3>Usage data</h3>
              <p>We collect information about how you use the platform — pages visited, searches performed, calculators used, and features accessed. This data is used to improve the platform and is not used for advertising.</p>
              <h3>Payment data</h3>
              <p>If you subscribe to Pro, payments are processed by Lemon Squeezy. We do not store your payment card details. We receive subscription status, plan type, and billing period information only.</p>
              <h3>Contact form data</h3>
              <p>If you submit a contact or data correction form, we collect your name, email, organisation (if provided), and the content of your message.</p>
              <h3>Technical data</h3>
              <p>We collect standard technical data including IP address, browser type, device type, and referring URL. This is used for security monitoring and analytics.</p>

              <h2 id="how-we-use">3. How we use your data</h2>
              <p>We use your personal data for the following purposes:</p>
              <ul>
                <li>To provide and maintain your account and subscription</li>
                <li>To process payments and manage your Pro plan</li>
                <li>To send you service communications (account updates, subscription receipts)</li>
                <li>To send you the monthly payroll updates newsletter, if you have subscribed</li>
                <li>To respond to contact form submissions and data correction requests</li>
                <li>To improve the platform through usage analytics</li>
                <li>To monitor for security threats and abuse</li>
                <li>To comply with our legal obligations</li>
              </ul>
              <p>We do not sell your personal data. We do not use your data for advertising or profiling.</p>

              <h2 id="data-sharing">4. Data sharing</h2>
              <p>We share your data only with the following third-party services, all of which are necessary to operate the platform:</p>
              <ul>
                <li><strong>Clerk</strong> — authentication and account management</li>
                <li><strong>Supabase</strong> — secure database hosting (EU region)</li>
                <li><strong>Lemon Squeezy</strong> — payment processing and subscription management</li>
                <li><strong>Resend</strong> — transactional email delivery</li>
                <li><strong>Vercel</strong> — website hosting and infrastructure</li>
                <li><strong>Sentry</strong> — error monitoring</li>
              </ul>
              <p>We do not share your personal data with any other third parties without your explicit consent, except where required by law.</p>

              <h2 id="cookies">5. Cookies</h2>
              <p>We use cookies to operate the platform and improve your experience. For full details of the cookies we use and how to manage them, please read our <Link href="/cookie-policy/">Cookie Policy</Link>.</p>

              <h2 id="your-rights">6. Your rights</h2>
              <p>Under UK GDPR, you have the following rights regarding your personal data:</p>
              <ul>
                <li><strong>Right of access</strong> — you can request a copy of all personal data we hold about you</li>
                <li><strong>Right to rectification</strong> — you can ask us to correct inaccurate data</li>
                <li><strong>Right to erasure</strong> — you can ask us to delete your personal data</li>
                <li><strong>Right to restrict processing</strong> — you can ask us to limit how we use your data</li>
                <li><strong>Right to data portability</strong> — you can request your data in a portable format</li>
                <li><strong>Right to object</strong> — you can object to certain processing activities</li>
                <li><strong>Right to withdraw consent</strong> — where processing is based on consent, you can withdraw it at any time</li>
              </ul>
              <p>To exercise any of these rights, please <Link href="/contact/">contact us</Link>. We will respond within 30 days.</p>

              <h2 id="data-retention">7. Data retention</h2>
              <p>We retain your personal data for as long as your account is active and for a reasonable period thereafter in case you wish to return. Specific retention periods:</p>
              <ul>
                <li>Account data — retained while your account is active, deleted within 30 days of an erasure request</li>
                <li>Payment records — retained for 7 years to comply with financial record-keeping obligations</li>
                <li>Contact form submissions — retained for 2 years</li>
                <li>Usage analytics — retained for 13 months in aggregate form</li>
              </ul>

              <h2 id="security">8. Security</h2>
              <p>We take the security of your personal data seriously. We use industry-standard security measures including encrypted connections (HTTPS), secure database hosting, row-level security on all user data, and regular security monitoring via Sentry.</p>
              <p>No method of transmission over the internet is 100% secure. While we do our best to protect your data, we cannot guarantee absolute security.</p>

              <h2 id="contact">9. Contact us</h2>
              <p>If you have any questions about this Privacy Policy or wish to exercise your data rights, please <Link href="/contact/">contact us</Link>.</p>
              <p>If you are not satisfied with our response, you have the right to lodge a complaint with the Information Commissioner&apos;s Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.</p>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
