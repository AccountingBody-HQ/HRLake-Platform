// lib/structured-data.ts
// JSON-LD structured data generators for GlobalPayrollExpert

const BASE_URL = "https://globalpayrollexpert.com"

export function getHomepageStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GlobalPayrollExpert",
    description: "The global reference platform for payroll data, employer obligations, employment law, tax summaries, and hiring compliance — covering every country in the world.",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: BASE_URL + "/search/?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "GlobalPayrollExpert",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: BASE_URL + "/logo.png",
      },
    },
  }
}

export function getCountryStructuredData(country: {
  name: string
  code: string
  currency_code?: string
  region?: string
  last_verified?: string
  official_source_url?: string
}) {
  const countryUrl = BASE_URL + "/countries/" + country.code.toLowerCase() + "/"
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: country.name + " Payroll Data — Tax Rates, Social Security & Employment Law",
    description: "Official payroll data for " + country.name + ": income tax brackets, employer social security rates, employment law obligations, minimum wage, statutory leave, and payroll compliance rules. Verified against government sources.",
    url: countryUrl,
    identifier: country.code.toUpperCase(),
    keywords: [
      country.name + " payroll",
      country.name + " income tax",
      country.name + " employer costs",
      country.name + " employment law",
      country.name + " social security",
      "global payroll",
      "employer of record",
    ],
    license: "https://creativecommons.org/licenses/by/4.0/",
    creator: {
      "@type": "Organization",
      name: "GlobalPayrollExpert",
      url: BASE_URL,
    },
    ...(country.last_verified && { dateModified: country.last_verified }),
    ...(country.official_source_url && {
      isBasedOn: { "@type": "CreativeWork", url: country.official_source_url },
    }),
    spatialCoverage: {
      "@type": "Place",
      name: country.name,
      ...(country.region && { containedInPlace: { "@type": "Place", name: country.region } }),
    },
    ...(country.currency_code && {
      variableMeasured: [{ "@type": "PropertyValue", name: "Currency", value: country.currency_code }],
    }),
  }
}

export function getCalculatorStructuredData(country: {
  name: string
  code: string
}) {
  const calcUrl = BASE_URL + "/countries/" + country.code.toLowerCase() + "/payrollcalculator/"
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: country.name + " Payroll Calculator",
    description: "Free payroll calculator for " + country.name + ". Calculate net salary, income tax, employee and employer social security contributions, and total employer cost — full line-by-line breakdown.",
    url: calcUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
    },
    featureList: [
      "Net salary calculation",
      "Income tax breakdown by bracket",
      "Employee social security contributions",
      "Employer social security contributions",
      "Total employer cost calculation",
      "PDF export of results",
    ],
    creator: {
      "@type": "Organization",
      name: "GlobalPayrollExpert",
      url: BASE_URL,
    },
  }
}

export function getArticleStructuredData(article: {
  title: string
  slug: string
  excerpt?: string
  publishedAt?: string
  category?: string
  authorName?: string
}) {
  const articleUrl = BASE_URL + "/insights/" + article.slug + "/"
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    ...(article.excerpt && { description: article.excerpt }),
    url: articleUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    publisher: {
      "@type": "Organization",
      name: "GlobalPayrollExpert",
      url: BASE_URL,
      logo: { "@type": "ImageObject", url: BASE_URL + "/logo.png" },
    },
    author: {
      "@type": "Organization",
      name: article.authorName ?? "GlobalPayrollExpert Editorial Team",
      url: BASE_URL,
    },
    ...(article.publishedAt && {
      datePublished: article.publishedAt,
      dateModified: article.publishedAt,
    }),
    ...(article.category && { articleSection: article.category }),
    inLanguage: "en",
  }
}

export function getComparisonStructuredData(countries: {
  name: string
  code: string
}[]) {
  const names = countries.map((c) => c.name).join(" vs ")
  const codes = countries.map((c) => c.code.toLowerCase()).join("-vs-")
  const compUrl = BASE_URL + "/compare/?countries=" + codes
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: names + " — Payroll Cost & Employment Law Comparison",
    description: "Side-by-side comparison of employer costs, income tax rates, social security contributions, and employment law obligations between " + names + ". Data sourced from official government publications.",
    url: compUrl,
    keywords: [
      ...countries.map((c) => c.name + " employer costs"),
      "payroll comparison",
      "global employer costs",
      "EOR cost comparison",
      "international payroll",
    ],
    creator: {
      "@type": "Organization",
      name: "GlobalPayrollExpert",
      url: BASE_URL,
    },
    spatialCoverage: countries.map((c) => ({ "@type": "Place", name: c.name })),
  }
}


// ─── 6. BREADCRUMBLIST ───────────────────────────────────────
export function getBreadcrumbStructuredData(items: {
  name: string
  href: string
}[]) {
  const BASE = 'https://globalpayrollexpert.com'
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: BASE + item.href,
    })),
  }
}
export function jsonLd(data: object): string {
  return JSON.stringify(data)
}
