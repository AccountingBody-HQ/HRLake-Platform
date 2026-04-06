# HRLake Scripts — Operations Manual

This directory contains all operational scripts for the HRLake platform.
These scripts are permanent. Never delete or move them.

---

## batch_publish.py — Content Factory Batch Generator

### What it does
Generates and publishes all country content to Sanity CMS.
20 countries x 8 content types = 160 articles total.

### How to run


### Estimated time
Approximately 55 minutes. Do not close the terminal while it runs.

### Log file
/workspaces/HRLake-Platform/scripts/batch_log.txt
Format: STATUS|ContentType|CountryCode|CountryName|SanityDocumentID|Slug

### If it fails partway through
1. Check batch_log.txt to see what was published
2. Add completed articles to the skip set in the script
3. Rerun - it will skip already-published articles

### The 20 active countries
GB, US, DE, FR, AU, IE, NL, BE, CA, DK, SE, NO, IT, ES, PL, PT, SG, CH, JP, AE

### The 8 content types
1. Country Report
2. Tax Guide
3. EOR Guide
4. Payroll Guide
5. Hiring Guide
6. HR Compliance Guide
7. Leave and Benefits
8. Compliance Calendar

### Live deployment URL
https://global-payroll-expert-platform.vercel.app

### Sanity project
Project ID: 4rllejq1 | Dataset: production
Studio: accountingbody-website.vercel.app/studio

---

## Platform Architecture

### Layer 1 - Intelligence Engine (Supabase)
Project: hrlake-platform | Schema: hrlake
Status: 100% COMPLETE for all 20 active countries
Tables populated: tax_brackets, social_security, employment_rules,
filing_calendar, public_holidays, statutory_leave, working_hours,
termination_rules, pension_schemes, payroll_compliance, data_sources,
country_coverage, data_quality

### Layer 2 - Content Factory (Sanity CMS)
Project ID: 4rllejq1 | Dataset: production
Generate endpoint: /api/content-factory/generate
Publish endpoint: /api/content-factory/publish
Status: Pipeline built and tested. Run batch_publish.py to populate.

### Layer 3 - Static (Next.js / GitHub / Vercel)
Repository: AccountingBody-HQ/HRLake-Platform
Vercel project: hrlake-platform
Live URL: global-payroll-expert-platform.vercel.app
Custom domain: hrlake.com (pending DNS cutover)

---

## Environment Variables (Vercel - hrlake-platform)

| Variable | Status |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Confirmed |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Confirmed |
| SUPABASE_SERVICE_ROLE_KEY | Confirmed |
| NEXT_PUBLIC_SANITY_PROJECT_ID | Confirmed - 4rllejq1 |
| NEXT_PUBLIC_SANITY_DATASET | Confirmed - production |
| SANITY_WRITE_TOKEN | Confirmed |
| SANITY_API_READ_TOKEN | Confirmed |
| ANTHROPIC_API_KEY | Confirmed |
| OPENAI_API_KEY | NOT YET SET - required for RAG |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | Dev key only - needs production |
| CLERK_SECRET_KEY | Dev key only - needs production |
| RESEND_API_KEY | Confirmed |
| ADMIN_EMAIL | info@accountingbody.com |
| ADMIN_SECRET | Wolega@888 |
| NEXT_PUBLIC_SENTRY_DSN | NOT YET SET - required before launch |
| LEMON_SQUEEZY_WEBHOOK_SECRET | NOT YET SET - required for payments |

---

## Admin Pages

| Page | URL | Status |
|---|---|---|
| Data Quality Dashboard | /admin/data-quality/ | Built |
| AI Content Factory | /admin/content-factory/ | Built |
| Country Builder / Engine | /admin/country-builder/ | TO BUILD |
| Coverage Map | /admin/coverage/ | Built |
| Admin Settings | /admin/settings/ | Built |
| Admin Login | /admin-login/ | Built - password: Wolega@888 |

---

## Page Templates - Build Status

| Page | URL Pattern | Status |
|---|---|---|
| Country Overview | /countries/[code]/ | Built |
| Payroll Calculator | /countries/[code]/payroll-calculator/ | Built |
| Employment Law | /countries/[code]/employmentlaw/ | Built |
| Tax Guide | /countries/[code]/tax-guide/ | Built |
| Hiring Guide | /countries/[code]/hiring-guide/ | Built |
| EOR Guide | /eor/[country]/ | Built |
| Payroll Guide | /countries/[code]/payroll-guide/ | TO BUILD |
| HR Compliance Guide | /countries/[code]/hr-compliance/ | TO BUILD |
| Leave and Benefits | /countries/[code]/leave-benefits/ | TO BUILD |
| Compliance Calendar | /countries/[code]/compliance-calendar/ | TO BUILD |

---

## Remaining Build Tasks (priority order)

1. Run batch_publish.py - generate all 160 Sanity articles
2. Build /countries/[code]/payroll-guide/ page template
3. Build /countries/[code]/hr-compliance/ page template
4. Build /countries/[code]/leave-benefits/ page template
5. Build /countries/[code]/compliance-calendar/ page template
6. Build /admin/country-builder/ admin page
7. Set OPENAI_API_KEY in Vercel for RAG embeddings
8. Set NEXT_PUBLIC_SENTRY_DSN in Vercel for error monitoring
9. Upgrade Clerk to production keys before DNS cutover
10. Expand to remaining 36 countries (target: 57 total)

---

## Supabase Data Summary (as of 6 April 2026)

| Table | Rows | Countries |
|---|---|---|
| tax_brackets | varies | 20 |
| social_security | varies | 20 |
| employment_rules | varies | 20 |
| filing_calendar | 91 | 20 |
| public_holidays | 215 | 20 |
| statutory_leave | 119 | 20 |
| working_hours | 20 | 20 |
| termination_rules | 20 | 20 |
| pension_schemes | 35 | 20 |
| payroll_compliance | 60 | 20 |
| data_sources | 47 | 20 |
| country_coverage | 20 | 20 |
| data_quality | 120 | 20 |

---

## Single Source of Truth

The HRLake Information Processing and Handling Manual V1 is the
permanent operating manual for this platform. Every decision must
be consistent with that document.

This platform represents years of life work.
Build everything as if it will serve millions of users for decades.
Because it will.
