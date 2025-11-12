import fs from 'fs'
import path from 'path'

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com'
const now = new Date().toISOString()
const serviceRoot = path.join(process.cwd(), 'app', 'services')
const serviceAreasFile = path.join(process.cwd(), 'lib', 'serviceAreas.ts')

const baseRoutes = ['/', '/services', '/pricing', '/faq', '/contact', '/service-areas']

function collectServiceRoutes(dir, prefix) {
  const routes = new Set()
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  if (entries.some((entry) => entry.isFile() && entry.name === 'page.tsx')) {
    routes.add(prefix)
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name.startsWith('(') || entry.name.startsWith('_') || entry.name === 'components') continue
    const childDir = path.join(dir, entry.name)
    const childPrefix = `${prefix}/${entry.name}`.replace(/\/+/g, '/')
    collectServiceRoutes(childDir, childPrefix).forEach((route) => routes.add(route))
  }
  return routes
}

function collectServiceAreaRoutes() {
  if (!fs.existsSync(serviceAreasFile)) return new Set()
  const contents = fs.readFileSync(serviceAreasFile, 'utf8')
  const matches = contents.matchAll(/slug:\s*"([^"]+)"/g)
  const routes = new Set()
  for (const match of matches) {
    routes.add(`/service-areas/${match[1]}`)
  }
  return routes
}

function priorityForRoute(route) {
  if (route === '/') return 1.0
  if (route.startsWith('/services/')) return 0.9
  if (route.startsWith('/service-areas/')) return 0.8
  return 0.7
}

/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl,
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  sitemapSize: 50000,
  changefreq: 'daily',
  priority: 0.7,
  autoLastmod: true,
  exclude: [
    '/booking/checkout',
    '/booking/checkout/*',
  ],
  additionalPaths: async () => {
    const routes = new Set(baseRoutes)
    collectServiceRoutes(serviceRoot, '/services').forEach((route) => routes.add(route))
    collectServiceAreaRoutes().forEach((route) => routes.add(route))
    return Array.from(routes).map((loc) => ({
      loc,
      changefreq: 'daily',
      priority: priorityForRoute(loc),
      lastmod: now,
    }))
  },
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
    ],
    additionalSitemaps: [`${siteUrl.replace(/\\/$/, '')}/sitemap.xml`],
  },
}
