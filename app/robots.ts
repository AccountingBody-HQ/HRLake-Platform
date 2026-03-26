import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/admin-login/',
          '/api/',
          '/dashboard/',
          '/sign-in/',
          '/sign-up/',
        ],
      },
    ],
    sitemap: 'https://globalpayrollexpert.com/sitemap.xml',
  }
}
