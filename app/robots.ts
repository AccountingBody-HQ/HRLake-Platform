import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/roodber8/',
          '/roodber8-login/',
          '/api/',
          '/dashboard/',
          '/sign-in/',
          '/sign-up/',
        ],
      },
    ],
    sitemap: 'https://hrlake.com/sitemap.xml',
  }
}
