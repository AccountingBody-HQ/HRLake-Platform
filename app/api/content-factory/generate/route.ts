import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─────────────────────────────────────────────
// PLATFORM IDENTITY
// ─────────────────────────────────────────────
const PLATFORM_IDENTITY: Record<string, string> = {
  HRLake: `
PLATFORM: HRLake (hrlake.com)
BRAND POSITION: HR Intelligence · EOR Intelligence · Payroll Data
TAGLINE: Where HR, EOR and payroll knowledge dives deep
AUDIENCE: Global HR directors, payroll managers, EOR buyers, employment lawyers, CFOs and international expansion teams at mid-to-large organisations.
VOICE: Authoritative, deep, trusted. Like a senior employment law partner and a global payroll director co-authoring a briefing document. Never superficial. Never generic.
THREE-PILLAR RULE: Every piece of content must balance all three pillars — HR, EOR and Payroll — equally. No article may lead with payroll only, HR only, or EOR only.
WHAT HRLAKE NEVER DOES:
- Never adds qualification tags (CIPD, SHRM, ACCA, CIMA etc.) — legal and copyright risk
- Never recommends a specific payment processor
- Never gives legal advice as fact — frames regulatory content as "generally", "typically", "under [jurisdiction] law"
- Never invents specific legal thresholds, rates or deadlines — flags when figures need verification
- Never writes generic blog content — every article must contain information a senior professional cannot find in a 30-second Google search
QUALITY BENCHMARK: Mercer Global Payroll, Deloitte Employment Law Guides, KPMG International EOR Briefings. That is the standard. Meet it or exceed it.`,

  AccountingBody: `
PLATFORM: AccountingBody (accountingbody.com)
BRAND POSITION: The authoritative platform for global accounting, finance and professional development.
AUDIENCE: Accounting professionals, finance managers, students preparing for professional exams, business owners, CFOs and financial controllers worldwide.
VOICE: Authoritative, educational, precise. Like a senior chartered accountant writing a professional development guide for peers and students.
WHAT ACCOUNTINGBODY NEVER DOES:
- Never adds qualification tags as endorsements without context
- Never gives tax or legal advice as definitive fact without jurisdiction context
- Never reproduces or closely paraphrases IFRS Foundation, IASB, or standards-body wording
- Never invents accounting figures, tax rates or regulatory thresholds
QUALITY BENCHMARK: Kaplan and BPP professional study texts. ICAEW technical releases. Big Four accounting insight publications. That is the standard.`,

  EthioTax: `
PLATFORM: EthioTax (ethiotax.com)
BRAND POSITION: The specialist platform for Ethiopian tax, business law and finance.
AUDIENCE: Ethiopian businesses, accountants, finance professionals, foreign investors entering Ethiopia, legal advisers and government compliance officers.
VOICE: Expert, practical, clear. Written for professionals who need to act on what they read. Not academic. Not vague.
WHAT ETHIOTAX NEVER DOES:
- Never gives legal advice as definitive fact without stating it is general guidance
- Never invents Ethiopian Revenue Authority figures, rates or thresholds
- Never ignores the practical reality of Ethiopian business — content must be actionable in-country
QUALITY BENCHMARK: PwC Ethiopia Tax Facts, EY Ethiopia Investment Guides, World Bank Doing Business Ethiopia reports. That is the standard.`,
}

// ─────────────────────────────────────────────
// CONTENT TYPE STRUCTURES
// ─────────────────────────────────────────────
const CONTENT_STRUCTURES: Record<string, string> = {
  'Country Report': `
CONTENT TYPE: Country Report
PURPOSE: A comprehensive, authoritative briefing on the HR, EOR and payroll landscape of a specific country. This is the flagship content type. It must be the definitive online resource for professionals expanding into or operating in that country.
REQUIRED SECTIONS (use these headings exactly):
1. Overview — country context, workforce size, key labour market characteristics
2. Employment Law Essentials — contract types, probation, termination, notice periods, statutory minimums
3. Payroll Obligations — payroll frequency, currency, employer and employee contribution rates, key thresholds
4. Tax Framework — income tax bands, employer tax obligations, filing deadlines
5. EOR Considerations — when EOR is appropriate, key risks, common structures used in-country
6. HR Management in Practice — cultural context, hiring norms, leave entitlements, working hours
7. Key Compliance Deadlines — a clear summary of annual/monthly obligations
8. Official Sources — direct links or references to the relevant government/revenue authority
ACCURACY RULES FOR COUNTRY REPORTS:
- Where specific rates are stated (tax bands, social contribution percentages), flag them as: "as of [current year], subject to change — verify with official sources"
- Where figures are unknown or unverified, write "rates vary — consult the [relevant authority]" rather than inventing numbers
- Distinguish between statutory minimums and common employer practice
- Always name the relevant government body or regulatory authority for each area`,

  'EOR Guide': `
CONTENT TYPE: EOR Guide (Employer of Record)
PURPOSE: A practical, expert guide to using an EOR structure in a specific country or for a specific workforce scenario. Must help a senior HR or legal professional make an informed decision.
REQUIRED SECTIONS:
1. What is an EOR and when does it apply — clear, jargon-free explanation with practical triggers
2. Why [Country/Topic] Requires Careful EOR Consideration — specific local factors
3. The EOR Employment Relationship — tri-party structure, responsibilities, liabilities
4. Key Legal Protections for EOR Workers — employment rights that attach regardless of EOR structure
5. Payroll and Benefits Under EOR — what the EOR administers vs what the client company controls
6. Common EOR Risks and How to Mitigate Them — practical risk register
7. Transitioning from EOR to Direct Employment — triggers, process, timeline
8. Selecting an EOR Provider — evaluation criteria (do NOT name or recommend specific providers)
ACCURACY RULES:
- Never recommend a specific EOR provider by name
- Clearly distinguish between what is legally required and what is market practice
- Flag jurisdiction-specific nuances that materially affect the EOR structure`,

  'Tax Guide': `
CONTENT TYPE: Tax Guide
PURPOSE: A clear, practical and technically accurate guide to the tax obligations relevant to the topic. Must be usable by a finance professional or business owner as a starting framework.
REQUIRED SECTIONS:
1. Tax Overview — the tax system in context, who administers it, key principles
2. Income Tax / Corporate Tax Framework — bands, rates, thresholds (with verification caveat)
3. Employer Tax Obligations — what employers must withhold, file and pay
4. Employee Tax Obligations — what employees are liable for, self-assessment triggers
5. VAT / Indirect Tax — applicability, rates, registration thresholds
6. Tax Filing Calendar — key deadlines for the tax year
7. Penalties and Enforcement — what happens when obligations are missed
8. Practical Compliance Tips — how professionals actually manage these obligations
9. Where to Go for Official Guidance — named authority and resource links
ACCURACY RULES:
- All rates and thresholds must carry: "rates as of [current year] — verify with [authority name] for the latest rates"
- Never state a rate as permanent — tax law changes annually in most jurisdictions
- Distinguish between tax residency rules and source-based taxation clearly`,

  'HR Management': `
CONTENT TYPE: HR Management
PURPOSE: A deep-dive educational article on a specific HR management topic. Must be useful to an experienced HR professional, not just an HR student. Must go beyond surface-level definitions.
REQUIRED SECTIONS:
1. The Strategic Context — why this topic matters at board and operational level
2. Core Concepts and Frameworks — the theory, explained through a practical lens
3. Legal and Compliance Considerations — jurisdiction-relevant obligations where applicable
4. Implementation in Practice — how leading organisations actually do this
5. Common Mistakes and How to Avoid Them — specific, named failure modes not generic platitudes
6. Metrics and Measurement — how to know if it is working
7. Key Takeaways — 5-7 bullet points a senior professional can act on immediately
ACCURACY RULES:
- Do not present a single framework as the only approach — acknowledge alternatives
- Where research or data is cited, describe findings accurately and indicate the source type
- Never invent statistics or attribute figures to unnamed studies`,

  'Explainer': `
CONTENT TYPE: Explainer
PURPOSE: A clear, authoritative explanation of a concept, term, regulation or process. Must be the best plain-English explanation of this topic available online — thorough enough for a professional, clear enough for a non-specialist.
REQUIRED SECTIONS:
1. The One-Paragraph Answer — define it clearly and completely in plain English upfront
2. Why It Matters — the practical consequence of understanding or misunderstanding this
3. How It Works in Detail — the mechanics, step by step
4. Common Misconceptions — what people get wrong and why
5. Real-World Application — a concrete scenario showing it in practice (invented but realistic)
6. Related Topics — 3-5 closely related concepts the reader should also understand
ACCURACY RULES:
- The one-paragraph answer must be technically precise, not dumbed-down
- Misconceptions must be genuine common errors, not invented strawmen`,

  'Course': `
CONTENT TYPE: Course (Learning Module)
PURPOSE: A structured educational module designed to take a learner from zero to competent on a specific topic. Must be engaging, logically sequenced and include reinforcement elements.
REQUIRED SECTIONS:
1. Module Overview — what the learner will be able to do after completing this module
2. Learning Objectives — 4-6 specific, measurable outcomes (use "By the end of this module, you will be able to...")
3. Core Content — divided into clearly numbered lessons or sections with logical progression
4. Worked Example — a realistic scenario with a full worked solution demonstrating the key concept
5. Common Pitfalls — specific errors learners make and how to avoid them
6. Knowledge Check — 3-5 reflective questions (open reflective, not MCQ)
7. Summary — consolidate the key learning in 5-7 bullet points
8. Glossary — define 6-10 key terms introduced in the module
ACCURACY RULES:
- Learning objectives must be achievable within the module content
- Worked examples must use invented but realistic figures — never invent regulatory figures
- All technical content must be accurate to current professional standards`,

  'Payroll Guide': `
CONTENT TYPE: Payroll Guide
PURPOSE: A precise, operationally authoritative guide to running payroll in a specific country or on a specific payroll topic. Must be the definitive reference for a payroll manager, HR director or finance controller who needs to understand and manage payroll compliantly. This is HRLake's specialist payroll content — it must reflect all three pillars: the HR context of employment, the EOR implications where relevant, and the payroll mechanics in full technical detail.

REQUIRED SECTIONS (use these headings exactly):
1. Payroll Overview — governance framework, which authority administers payroll compliance, key legislation
2. Payroll Frequency and Payment Deadlines — how often payroll must run, statutory payment dates, cut-off rules, consequences of late payment
3. Gross Pay Components — base salary, allowances, bonuses, overtime, benefits-in-kind and their payroll treatment
4. Employee Statutory Deductions — income tax withholding mechanics, employee social contributions, pension deductions, order of deductions
5. Employer Payroll Contributions — what the employer pays on top of gross salary, contribution rates and thresholds (with verification caveat), secondary costs of employment
6. Net Pay Calculation — how net pay is derived, common calculation errors, rounding rules
7. Payslip Legal Requirements — mandatory payslip contents by law, format requirements, delivery obligations
8. Payroll Filing and Reporting Obligations — what must be filed, with which authority, on what schedule, in what format
9. Year-End Payroll Obligations — annual reconciliation, employee certificates, final submissions, correction procedures
10. EOR and Contractor Payroll Considerations — how EOR structures affect payroll administration, IR35/contractor rules where applicable
11. Common Payroll Compliance Errors — specific, named mistakes payroll teams make in this jurisdiction — not generic cautions
12. Official Payroll Authorities and Resources — named authorities, portals and official guidance sources

THREE-PILLAR BALANCE RULE FOR PAYROLL GUIDES:
- Every Payroll Guide must acknowledge the HR context — how payroll connects to employment contracts, offer letters, and HR policy
- Where EOR is relevant to the jurisdiction, flag the payroll implications of an EOR structure explicitly
- Never write a Payroll Guide that reads like a pure accountancy document — it must speak to the HR professional running or overseeing payroll, not just the payroll technician

ACCURACY RULES FOR PAYROLL GUIDES:
- All contribution rates, tax thresholds and filing deadlines must carry: "as of [current year] — verify with [authority name] for the latest figures"
- Always name the specific payroll authority (e.g., HMRC for UK PAYE, URSSAF for French social contributions, ZUS for Polish social insurance, BIR for Philippines payroll tax)
- Distinguish clearly and explicitly between: (a) employee deductions from gross pay, (b) employer contributions on top of gross pay, and (c) total employment cost
- Never blend payroll rules, rates or thresholds from different jurisdictions in the same calculation example
- Where employer and employee rates differ for the same contribution type, always state both separately
- Payroll figures in worked examples must be invented but realistic — never use round numbers that signal fabrication (e.g., use £42,500 not £50,000)

COPYRIGHT RULES FOR PAYROLL GUIDES:
- Do not reproduce HMRC, IRS, URSSAF or any tax authority guidance verbatim
- Do not mirror the structure of known payroll guides from ADP, Deel, Remote, Papaya Global or similar EOR/payroll providers
- Express all regulatory requirements in original explanatory language`,

  'Accounting Guide': `
CONTENT TYPE: Accounting Guide
PURPOSE: A technically precise, professionally authoritative guide on an accounting, finance or financial reporting topic. Must be suitable for qualified accountants, finance managers, CFOs and students at professional level. Must go beyond surface definitions into practical application, professional judgement and real-world complexity. This is AccountingBody's core content — it must reflect the platform's position as a trusted professional development resource benchmarked against Big Four technical publications and professional study texts.

REQUIRED SECTIONS (use these headings exactly):
1. Topic Overview — what this accounting area covers, why it matters in practice, and what professional problems it solves
2. Applicable Standards and Framework — which accounting standards govern this area (IFRS, UK GAAP, US GAAP) — explain at a high level in your own teaching language without reproducing any standard text
3. Core Recognition and Measurement Principles — the fundamental rules: when to recognise, how to measure, what basis to use
4. Practical Application with Worked Illustration — a full worked example using invented but realistic company names, figures and scenarios. Must include journal entries where relevant, clearly labelled as illustrative
5. Key Judgements and Estimates — where professional judgement is required, what factors influence the judgement, and what the consequences of different judgements are
6. Disclosure Requirements — what must be disclosed in financial statements, where, and in what form
7. Differences Between IFRS and UK/US GAAP — where the frameworks diverge materially, flag it clearly and explain the practical implication
8. Common Errors and Audit Findings — specific, named mistakes finance teams and preparers make — based on common audit findings and professional experience, not generic cautions
9. Key Takeaways — 5-7 bullet points a finance professional or student can act on or remember immediately

WORKED EXAMPLE RULES FOR ACCOUNTING GUIDES:
- Every worked example must use a fully invented company name (e.g., "Hartwell Engineering Ltd" or "Meridian Retail Group") — never use real company names
- All figures must be invented but realistic — use specific amounts like £2,847,000 not round numbers like £3,000,000 which signal fabrication
- Journal entries must always show: account name, debit/credit, amount, and a one-line explanation of the entry
- Never label a journal entry as "correct" without explaining why — always state the accounting principle it applies
- If an example spans multiple periods, always show the comparative clearly

ACCURACY RULES FOR ACCOUNTING GUIDES:
- Never reproduce IFRS Foundation, IASB, FASB, FRC or ASB standard text verbatim — not even short phrases
- Express all standard requirements in original teaching language — restate the requirement in your own professional voice
- Where standards are cited (e.g., IFRS 15, IAS 36), reference them by name but do not reproduce paragraph text or definitions
- Never invent standard references — only cite standards that genuinely apply to the topic
- Where a topic is subject to ongoing interpretation or debate in the profession, acknowledge this rather than presenting one view as definitive
- All technical content must reflect current standards — flag if a standard has been recently amended

COPYRIGHT RULES FOR ACCOUNTING GUIDES:
- Do not reproduce or closely paraphrase Kaplan, BPP, ICAEW, ACCA, CIMA or any professional body study materials
- Do not mirror the structure, worked example scenarios or teaching sequence of known textbooks
- Do not reproduce any examination question or past paper scenario — all examples must be original
- The safe harbour: if your worked example could appear in a Kaplan textbook without modification, rebuild it from scratch with different figures, different company, different scenario

INSIGHT DENSITY FOR ACCOUNTING GUIDES:
- Every paragraph must contain a professional insight that goes beyond what a student could find in a basic textbook definition
- The common errors section must name actual, specific mistakes — "failing to disaggregate performance obligations under IFRS 15 when a contract contains both a product sale and an installation service" is a specific error. "Not understanding the standard" is not
- The worked illustration must demonstrate something genuinely instructive — not just a mechanical calculation, but a scenario that illuminates a judgement call or a common misconception`,

  'Hiring Guide': `
CONTENT TYPE: Hiring Guide
PURPOSE: Practical authoritative guide to hiring in a specific country for HR directors and talent teams.
REQUIRED SECTIONS:
1. Hiring Overview - labour market context, typical hiring timelines
2. Right to Work and Legal Eligibility - verification requirements, work permit rules
3. Employment Contract Requirements - mandatory clauses, contract types, probation rules
4. Job Advertising and Anti-Discrimination Rules - protected characteristics, what employers cannot ask
5. Background Checks - what is legally permitted, what is prohibited, data protection constraints
6. Onboarding Compliance - mandatory registrations, notifications to authorities
7. Employer Registration Requirements - what to register, with which authority, by when
8. Common Hiring Mistakes - specific errors employers make in this jurisdiction
9. Official Sources - named government bodies and resource links
ACCURACY RULES:
- All permit requirements must carry jurisdiction-specific detail
- Distinguish legal requirements from market practice
`,
  'HR Compliance Guide': `
CONTENT TYPE: HR Compliance Guide
PURPOSE: Comprehensive guide to HR compliance obligations in a specific country for HR directors and General Counsel.
REQUIRED SECTIONS:
1. HR Compliance Overview - regulatory framework, key legislation, enforcement bodies
2. Employment Contract Compliance - mandatory terms, prohibited clauses, variation rules
3. Working Time Compliance - hours limits, rest breaks, overtime recording
4. Payroll Compliance Obligations - what HR must ensure payroll does correctly
5. Discrimination and Equal Treatment - protected characteristics, pay equity reporting
6. Data Protection and Employee Privacy - monitoring rules, retention obligations, employee rights
7. Health and Safety Obligations - employer safety duties, risk assessment, accident reporting
8. Disciplinary and Grievance Procedures - statutory minimum requirements, documentation
9. HR Record-Keeping Requirements - what to keep, how long, what format
10. Regulatory Inspections and Enforcement - which authorities inspect, what triggers inspection
11. Common HR Compliance Failures - specific named failures that generate enforcement action
12. Official Compliance Resources - named authorities and portals
ACCURACY RULES:
- All retention periods and timeframes must be jurisdiction-specific with verification caveats
- Distinguish legal minimums from best practice
`,
  'Leave and Benefits': `
CONTENT TYPE: Leave and Benefits Guide
PURPOSE: Precise complete guide to statutory leave entitlements and mandatory benefits in a specific country.
REQUIRED SECTIONS:
1. Leave and Benefits Overview - statutory framework, key legislation, enforcement body
2. Annual Leave - statutory minimum days, accrual method, carry-over rules, payout on termination
3. Public Holidays - full list for current year, mandatory vs discretionary, pay treatment
4. Sick Leave and Sick Pay - entitlement, employer vs government pay, notification requirements
5. Maternity and Adoption Leave - duration, pay structure, notification obligations, return to work protections
6. Paternity and Shared Parental Leave - entitlement, pay, notification, qualifying conditions
7. Other Statutory Leave - bereavement, jury service, study leave, emergency dependant leave
8. Mandatory Benefits Beyond Leave - pension contributions, health insurance, 13th month salary where applicable
9. Benefits Market Practice - what employers typically offer above the statutory minimum
10. Benefits Administration Obligations - what the employer must report or pay to authorities
11. Common Leave and Benefits Errors - specific mistakes employers make in this jurisdiction
12. Official Sources - named authorities for leave and benefits compliance
ACCURACY RULES:
- All leave entitlements must carry current tax year and verification caveat
- Distinguish statutory entitlement from contractual enhancement
`,
  'Compliance Calendar': `
CONTENT TYPE: Compliance Calendar
PURPOSE: Structured actionable annual compliance calendar for employers in a specific country.
REQUIRED SECTIONS:
1. Compliance Calendar Overview - compliance framework, key authorities, cost of missing deadlines
2. Monthly Payroll Compliance Obligations - recurring monthly filings and payments with exact deadlines
3. Quarterly Compliance Obligations - quarterly returns and payments with exact deadlines
4. Annual Compliance Calendar - month-by-month breakdown of all annual obligations chronologically
5. Employee Lifecycle Compliance Triggers - obligations on hiring, changes and termination
6. Penalty and Enforcement Summary - specific penalties for missing each category of deadline
7. Compliance Tools and Filing Portals - named official portals and submission methods
8. Compliance Calendar Quick Reference - condensed table: obligation, deadline, authority, consequence
ACCURACY RULES:
- All deadlines must be specific dates or date formulas not vague descriptions
- All deadlines must carry verification caveat with authority name
- Every obligation must name the specific authority responsible
`,
  'Article': `
CONTENT TYPE: Article
PURPOSE: A high-quality, well-researched editorial article on a topic relevant to the platform audience. Must be original, insightful and go beyond what a reader could find by Googling for 30 seconds.
REQUIRED SECTIONS:
1. Opening — a strong hook that establishes the significance of the topic (not a generic intro)
2. The Core Argument or Analysis — the substance of the piece, with clear logical flow
3. Evidence and Context — data, trends, examples that support the argument
4. Implications — what this means for the reader professionally
5. Conclusion — a definitive, opinionated close that gives the reader something to think about
ACCURACY RULES:
- Never invent statistics — describe data directionally if specific figures are unknown
- Opinion must be clearly framed as analysis, not stated as regulatory fact`,
}

// ─────────────────────────────────────────────
// TECHNICAL ACCURACY RULES
// ─────────────────────────────────────────────
const TECHNICAL_ACCURACY_RULES = `
UNIVERSAL TECHNICAL ACCURACY RULES — APPLY TO ALL CONTENT:
1. Never invent specific legal thresholds, tax rates, contribution percentages or statutory deadlines. If a specific figure is not reliably known, write around it using directional language and refer readers to the official source.
2. Always name the relevant regulatory authority (e.g., HMRC, IRS, Ethiopian Revenue Authority, Bundesagentur für Arbeit) rather than vague references like "the government" or "the tax authority".
3. Distinguish clearly between: (a) what is legally required, (b) what is standard market practice, and (c) what varies by employer or agreement.
4. Where content covers multiple jurisdictions, do not blend rules from different countries without clearly labelling which rule applies where.
5. Employment law content must reflect current law in spirit — do not present repealed or outdated rules as current.
6. Do not present a contested legal or HR question as settled if it is not.
7. Where figures are stated, always add: "(as of [current year] — verify with [authority name] for the latest rates)" — this protects the platform legally and maintains reader trust.`

// ─────────────────────────────────────────────
// COPYRIGHT AND ORIGINALITY RULES
// ─────────────────────────────────────────────
const COPYRIGHT_RULES = `
COPYRIGHT AND ORIGINALITY RULES — NON-NEGOTIABLE:
1. Do not reproduce or closely paraphrase any government guidance, legislative text, IFRS/IASB wording, or standards-body publications. Explain requirements in original teaching language.
2. Do not mirror the distinctive structure, headings sequence or worked example style of known publishers (Mercer, Deloitte, KPMG, PwC, Kaplan, BPP, Croner-i etc.). Use the structure provided in this prompt instead.
3. Do not reproduce signature phrases from well-known HR or payroll frameworks without attribution.
4. All worked examples and scenarios must use invented but realistic names, companies, figures and situations. Never use real company names, real individuals or real case names as protagonists.
5. Express all regulatory requirements in original explanatory language — restate the obligation in teaching voice, never in legislative drafting style.
6. The final output must be demonstrably original in expression — not a paraphrase of any single identifiable source.`

// ─────────────────────────────────────────────
// SEO AND READABILITY RULES
// ─────────────────────────────────────────────
const SEO_RULES = `
SEO AND READABILITY RULES:
1. The opening paragraph must function as a standalone meta description — authoritative, keyword-rich, and compelling in 2-3 sentences.
2. Use ## for main headings, ### for sub-headings. Every major section must have a heading.
3. Use bullet points and numbered lists only where they genuinely serve clarity — not to pad length.
4. The title (first # heading) must be specific and search-worthy — not generic. Good example: "UK Employer National Insurance Obligations: A Complete Guide". Bad example: "National Insurance Explained".
5. Write for the professional reader scanning on desktop — short paragraphs (3-5 lines max), clear topic sentences, signposted transitions between sections.
6. British English throughout. Spell out abbreviations on first use.`

// ─────────────────────────────────────────────
// FORBIDDEN PHRASES — GAP 1 FIX
// ─────────────────────────────────────────────
const FORBIDDEN_PHRASES = `
FORBIDDEN PHRASES AND PATTERNS — NEVER USE THESE UNDER ANY CIRCUMSTANCES:
The following phrases and patterns are banned. They signal generic AI content and will disqualify the output entirely. If you catch yourself writing any of these, delete and rewrite.

BANNED OPENING PHRASES:
- "In today's fast-paced world..."
- "In today's rapidly changing landscape..."
- "In today's globalised economy..."
- "In the ever-evolving world of..."
- "In recent years..."
- "As the world becomes increasingly..."
- "It is no secret that..."
- "It goes without saying that..."
- "There is no doubt that..."
- "Now more than ever..."

BANNED FILLER PHRASES:
- "It is worth noting that..."
- "It is important to note that..."
- "It should be noted that..."
- "Needless to say..."
- "As previously mentioned..."
- "As we have seen..."
- "At the end of the day..."
- "When all is said and done..."
- "The bottom line is..."
- "Last but not least..."
- "First and foremost..."
- "Without further ado..."

BANNED TRANSITION SENTENCES (sentences that carry zero information):
- Any sentence whose sole purpose is to announce what the next paragraph will say
- Any sentence that summarises what the previous paragraph just said without adding new information
- Any sentence starting with "In this article, we will explore..."
- Any sentence starting with "In this guide, you will learn..."
- Any sentence starting with "Read on to discover..."
- Any sentence starting with "Let us dive in..."
- Any sentence starting with "Let us explore..."

BANNED CLOSING PHRASES:
- "In conclusion, it is clear that..."
- "To summarise, we have covered..."
- "We hope this article has helped..."
- "If you found this article useful..."
- "For more information, please do not hesitate to contact us..."

BANNED VAGUE MODIFIERS:
- "various", "numerous", "a number of", "a wide range of", "a variety of" — replace with specific language
- "many experts believe", "some argue", "others suggest" without any specificity — be precise or do not make the claim
- "significant", "substantial", "considerable" without a figure or concrete comparator

BANNED STRUCTURAL PADDING:
- Do not write a paragraph that exists solely to introduce the next section
- Do not write a conclusion that merely lists what was already covered
- Do not use bullet points to split a single coherent sentence into three fragments

THE RULE BEHIND ALL RULES: Every sentence must carry information that the reader did not have before reading it. If a sentence does not do that, delete it.`

// ─────────────────────────────────────────────
// INSIGHT DENSITY RULE — GAP 2 FIX
// ─────────────────────────────────────────────
const INSIGHT_DENSITY_RULES = `
INSIGHT DENSITY RULES — THE PROFESSIONAL READER TEST:
Every paragraph must pass this test: would a senior HR director, payroll manager, employment lawyer or finance executive read this paragraph and think "I learned something I did not already know, or I now understand something I was previously unclear on"?

If the answer is no — the paragraph must be rewritten or deleted.

SPECIFIC DENSITY REQUIREMENTS:
1. Every main section must contain at least one specific, non-obvious professional insight. Not a definition. Not a restatement of common knowledge. A genuine insight — a nuance, a practical implication, a common failure mode, a jurisdiction-specific rule, a professional standard that most practitioners miss.
2. Every worked example must use specific invented but realistic figures, not vague placeholders. "Company X pays an employee £42,500 per year" is acceptable. "A company pays its employee a salary" is not.
3. Every "common mistakes" or "pitfalls" section must name actual, specific mistakes professionals make — not generic cautions. "Failing to account for the employer NIC secondary threshold when calculating total employment cost" is a specific mistake. "Not understanding the rules" is not.
4. Statistical or data claims must be directionally specific: "Industry surveys consistently show that EOR adoption has grown fastest in APAC markets" is acceptable. "Many companies use EOR" is not.
5. The final paragraph of every article must leave the reader with something actionable or a perspective shift — not a generic summary. It must end on a note of professional insight, not administrative closure.

THE DENSITY BENCHMARK: Read any randomly selected paragraph from the finished article. If it could appear in a generic HR blog post written by a junior copywriter, it is not good enough. It must read like it was written by a domain expert with 15+ years of experience who is sharing hard-won knowledge.`

// ─────────────────────────────────────────────
// OUTPUT FORMAT
// ─────────────────────────────────────────────
const OUTPUT_FORMAT = `
OUTPUT FORMAT — FOLLOW EXACTLY:
- Output the full article content in markdown only
- No preamble, no meta-commentary, no "here is your article" framing
- No qualification tags (CIPD, SHRM, ACCA, CIMA, CPA etc.) anywhere in the content
- After the article, on a new line, write exactly: ---AI_SUMMARY---
  Then write a 2-3 sentence plain-English summary optimised for vector search and RAG retrieval. This summary must capture the core topic, jurisdiction (if applicable), and the most useful facts in the article.
- Then on a new line write exactly: ---AI_KEY_TERMS---
  Then write 10-15 comma-separated key terms for vector indexing. Include: the main topic, relevant jurisdiction, content type, and related professional concepts.`

// ─────────────────────────────────────────────
// PROMPT BUILDER
// ─────────────────────────────────────────────
function buildPrompt(config: {
  site: string; contentType: string; country: string
  topic: string; tone: string; length: string
  aiSummary?: string; keyTerms?: string
}) {
  const wordTargets: Record<string, string> = {
    short:    '480 to 560 words — tight, precise, zero padding. Every sentence earns its place.',
    standard: '950 to 1100 words — comprehensive but focused. Dense with professional insight.',
    deep:     '2000 to 2500 words — exhaustive, reference-quality. The definitive resource on this topic.',
  }
  const wordTarget   = wordTargets[config.length] ?? wordTargets.standard
  const platformCtx  = PLATFORM_IDENTITY[config.site]   ?? PLATFORM_IDENTITY.HRLake
  const structureCtx = CONTENT_STRUCTURES[config.contentType] ?? CONTENT_STRUCTURES.Article
  const countryLine  = config.country
    ? `COUNTRY / JURISDICTION FOCUS: ${config.country}. All content must be specific to this jurisdiction where relevant. Do not blend rules from other countries without explicit labelling.`
    : 'JURISDICTION: Global / general principles unless the topic requires a specific jurisdiction, in which case state it clearly.'

  const toneGuide: Record<string, string> = {
    Authoritative: 'Write as a senior expert addressing peers. Confident. Definitive where the facts support it. No hedging where clarity is possible. No softening language where the professional reality is hard.',
    Educational:   'Write as a master educator. Build understanding layer by layer. Use clear examples. Assume the reader is intelligent but new to this specific topic. Never condescend. Never oversimplify to the point of inaccuracy.',
    Technical:     'Write as a specialist practitioner. Precise terminology. Detailed mechanics. Assume the reader is a professional who needs the full technical picture and will notice if you cut corners or oversimplify.',
  }
  const toneInstruction = toneGuide[config.tone] ?? toneGuide.Authoritative

  return `You are the lead content director for a world-class professional knowledge platform. You are writing content that will be read by senior HR directors, payroll managers, employment lawyers, EOR specialists, accountants and finance executives worldwide. Your output is benchmarked against Mercer, Deloitte, KPMG, PwC and the Financial Times. Mediocre output is not acceptable. Generic content is not acceptable. Filler is not acceptable. This platform represents years of professional work and every article must be exceptional from the first word to the last.

═══════════════════════════════════════
SECTION 1 — PLATFORM IDENTITY
═══════════════════════════════════════
${platformCtx}

═══════════════════════════════════════
SECTION 2 — CONTENT SPECIFICATION
═══════════════════════════════════════
${structureCtx}

TOPIC: ${config.topic}
${countryLine}

TONE INSTRUCTION: ${toneInstruction}

TARGET LENGTH: ${wordTarget}

═══════════════════════════════════════
SECTION 3 — TECHNICAL ACCURACY RULES
═══════════════════════════════════════
${TECHNICAL_ACCURACY_RULES}

═══════════════════════════════════════
SECTION 4 — COPYRIGHT AND ORIGINALITY
═══════════════════════════════════════
${COPYRIGHT_RULES}

═══════════════════════════════════════
SECTION 5 — SEO AND READABILITY
═══════════════════════════════════════
${SEO_RULES}

═══════════════════════════════════════
SECTION 6 — FORBIDDEN PHRASES
═══════════════════════════════════════
${FORBIDDEN_PHRASES}

═══════════════════════════════════════
SECTION 7 — INSIGHT DENSITY RULES
═══════════════════════════════════════
${INSIGHT_DENSITY_RULES}

═══════════════════════════════════════
SECTION 8 — QUALITY SELF-CHECK
═══════════════════════════════════════
Before finalising your output, run through every one of these checks. If any answer is no — rewrite that section before outputting:

1. Does every paragraph pass the professional reader test — would a senior domain expert learn something or gain genuine clarity from it?
2. Is every factual claim either verified, appropriately caveated, or clearly framed as general guidance?
3. Does the structure follow the required template for this content type exactly — every required section present?
4. Is the opening paragraph strong enough to stand alone as a meta description — specific, authoritative, keyword-rich?
5. Is the content completely original in expression — not a paraphrase of any single identifiable source?
6. Have you checked every sentence against the forbidden phrases list and removed every banned phrase?
7. Does the article end on a note of genuine professional insight — not administrative closure?
8. If this article appeared on the same page as a Mercer Global Payroll briefing or a Deloitte Employment Law Guide — would it hold its own in terms of depth, accuracy and authority?

If the answer to question 8 is anything other than yes — rewrite until it is.

═══════════════════════════════════════
SECTION 9 — OUTPUT FORMAT
═══════════════════════════════════════
${OUTPUT_FORMAT}`
}

// ─────────────────────────────────────────────
// API ROUTE — GAP 3 FIX: dynamic max_tokens
// ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const config = await req.json()

    if (!config.site || !config.contentType || !config.topic) {
      return NextResponse.json(
        { error: 'site, contentType and topic are required' },
        { status: 400 }
      )
    }

    // Deep Dive needs more tokens — never risk a cut-off article
    const maxTokens = config.length === 'deep' ? 6000 : 4096

    const prompt = buildPrompt(config)

    const message = await client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system:     'You are the lead content director for a world-class professional knowledge platform serving senior HR, payroll, EOR, accounting and tax professionals globally. You never produce generic content. You never invent regulatory figures. You never use filler phrases. You always follow the content structure and all rules provided exactly. Every sentence you write must carry professional-grade insight. Your output is always publication-ready to the standard of Mercer, Deloitte or KPMG briefing documents.',
      messages:   [{ role: 'user', content: prompt }],
    })

    const raw = message.content
      .filter((b: any) => b.type === 'text')
      .map((b: any)    => b.text)
      .join('')

    const summaryMatch  = raw.match(/---AI_SUMMARY---([\s\S]*?)(?:---AI_KEY_TERMS---|$)/)
    const keyTermsMatch = raw.match(/---AI_KEY_TERMS---([\s\S]*)$/)
    const content       = raw.split('---AI_SUMMARY---')[0].trim()
    const aiSummary     = summaryMatch  ? summaryMatch[1].trim()  : ''
    const keyTerms      = keyTermsMatch ? keyTermsMatch[1].trim() : ''

    return NextResponse.json({ content, aiSummary, keyTerms })
  } catch (err: any) {
    console.error('content-factory/generate error:', err)
    return NextResponse.json(
      { error: err.message ?? 'Internal server error' },
      { status: 500 }
    )
  }
}
