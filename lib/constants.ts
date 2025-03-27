// Environment variables
export const REVALIDATE_TOKEN = process.env.REVALIDATE_TOKEN || "default-token-for-dev"

// Cache TTLs (in milliseconds)
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
}

// API endpoints
export const API_ENDPOINTS = {
  GHL_BASE: process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com",
}

// Service categories
export const SERVICE_CATEGORIES = {
  GENERAL: "general",
  SPECIALIZED: "specialized",
}

// Blog categories
export const BLOG_CATEGORIES = [
  "notary-basics",
  "loan-signing",
  "real-estate",
  "legal-documents",
  "business-tips",
  "industry-news",
  "how-to-guides",
  "faq",
]

// Navigation
export const MAIN_NAV_ITEMS = [
  { title: "Home", href: "/" },
  { title: "Services", href: "/services" },
  { title: "About", href: "/about" },
  { title: "Blog", href: "/blog" },
  { title: "Contact", href: "/contact" },
]

// Social media
export const SOCIAL_LINKS = {
  FACEBOOK: "https://facebook.com",
  TWITTER: "https://twitter.com",
  INSTAGRAM: "https://instagram.com",
  LINKEDIN: "https://linkedin.com",
}

// Contact information
export const CONTACT_INFO = {
  PHONE: "(713) 555-1234",
  EMAIL: "info@houstonmobilenotarypros.com",
  ADDRESS: "123 Main St, Houston, TX 77002",
}

// SEO defaults
export const SEO_DEFAULTS = {
  TITLE_TEMPLATE: "%s | Houston Mobile Notary Pros",
  DEFAULT_TITLE: "Houston Mobile Notary Pros | Professional Mobile Notary Services",
  DESCRIPTION:
    "Professional mobile notary services in Houston, TX. We come to you for loan signings, real estate closings, and all your notary needs.",
  CANONICAL: "https://houstonmobilenotarypros.com",
}

