/**
 * @type {import('next-sitemap').IConfig}
 */
export default {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com',
  generateRobotsTxt: true,
  generateIndexSitemap: true, // create index if more than one sitemap
  sitemapSize: 50000, // optional, default 50000
  exclude: [
    '/booking/checkout',
    '/booking/checkout/*',
  ],
  // Because `generateStaticParams` already enumerates dynamic paths, next-sitemap will include
  // all `/service-areas/[slug]` pages automatically via `.next/prerender-manifest.json`.
}
