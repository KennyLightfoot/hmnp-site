/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  sitemapSize: 50000,
}
