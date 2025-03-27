import { fetchWithCache, registerCacheKey } from "@/lib/server-cache"

export interface Testimonial {
  id: string
  name: string
  location: string
  avatar?: string
  rating: number
  text: string
  date: string
  source: "Google" | "Facebook" | "Direct"
  verified?: boolean
  serviceType?: string
}

// Export the testimonials array directly
export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    location: "Dickinson, TX",
    rating: 5,
    text: "Houston Mobile Notary Pros made my home refinance so easy! The notary arrived on time, was professional, and guided me through all the documents. Highly recommend!",
    date: "2023-10-15",
    source: "Google",
    verified: true,
    serviceType: "home-refinance",
  },
  {
    id: "2",
    name: "Michael Rodriguez",
    location: "League City, TX",
    rating: 5,
    text: "I needed a notary for some urgent legal documents on a Sunday, and they were able to accommodate me with their weekend service. Worth every penny for the convenience!",
    date: "2023-09-22",
    source: "Facebook",
    verified: true,
    serviceType: "urgent-legal",
  },
  {
    id: "3",
    name: "Jennifer Williams",
    location: "Texas City, TX",
    rating: 5,
    text: "As a real estate agent, I regularly need notary services for my clients. Houston Mobile Notary Pros has been my go-to for years. Always reliable and professional.",
    date: "2023-11-05",
    source: "Google",
    verified: true,
    serviceType: "real-estate",
  },
  {
    id: "4",
    name: "David Thompson",
    location: "Friendswood, TX",
    rating: 4,
    text: "Great service for our family trust documents. The notary was knowledgeable and patient with our elderly parents. Would use again.",
    date: "2023-08-17",
    source: "Direct",
    verified: true,
    serviceType: "family-trust",
  },
  {
    id: "5",
    name: "Lisa Martinez",
    location: "Pearland, TX",
    rating: 5,
    text: "I was in a bind needing same-day notary service for my business documents. They arrived within hours of my call. Exceptional service!",
    date: "2023-10-30",
    source: "Google",
    verified: true,
    serviceType: "business",
  },
  {
    id: "6",
    name: "Robert Chen",
    location: "Clear Lake, TX",
    rating: 5,
    text: "Used their loan signing service for our mortgage refinance. The notary explained everything clearly and made the process stress-free. Excellent experience!",
    date: "2023-09-12",
    source: "Facebook",
    verified: true,
    serviceType: "loan-signing",
  },
  {
    id: "7",
    name: "Amanda Patel",
    location: "Houston, TX",
    rating: 5,
    text: "I've used Houston Mobile Notary Pros multiple times for both personal and business documents. They're always punctual, professional, and make the process seamless. Their online booking system is also very convenient!",
    date: "2023-12-05",
    source: "Google",
    verified: true,
    serviceType: "all",
  },
  {
    id: "8",
    name: "Carlos Mendez",
    location: "Katy, TX",
    rating: 5,
    text: "Exceptional service! I needed a notary for my power of attorney documents on short notice, and they were able to come to my home the same day. The notary was very knowledgeable and helped explain everything clearly.",
    date: "2024-01-18",
    source: "Facebook",
    verified: true,
    serviceType: "power-of-attorney",
  },
  {
    id: "9",
    name: "Emily Watson",
    location: "Sugar Land, TX",
    rating: 4,
    text: "Very professional service. The notary arrived on time and was well-prepared. The only reason I'm giving 4 stars instead of 5 is because the confirmation email took a while to arrive, but the actual service was excellent.",
    date: "2024-02-10",
    source: "Google",
    verified: true,
    serviceType: "all",
  },
  {
    id: "10",
    name: "James Wilson",
    location: "The Woodlands, TX",
    rating: 5,
    text: "As an attorney, I often need reliable notary services for my clients. Houston Mobile Notary Pros has consistently delivered excellent service. Their notaries are knowledgeable about legal documents and always professional.",
    date: "2024-01-05",
    source: "Direct",
    verified: true,
    serviceType: "legal",
  },
  {
    id: "11",
    name: "Sophia Garcia",
    location: "Baytown, TX",
    rating: 5,
    text: "I needed a notary for my real estate closing documents, and Houston Mobile Notary Pros made it so easy! They came to my office, were on time, and very efficient. Will definitely use them again!",
    date: "2023-11-28",
    source: "Facebook",
    verified: true,
    serviceType: "real-estate",
  },
  {
    id: "12",
    name: "William Taylor",
    location: "Cypress, TX",
    rating: 5,
    text: "Outstanding service! The notary was professional, friendly, and made sure all my documents were properly executed. The online booking process was simple and the pricing was transparent.",
    date: "2024-02-22",
    source: "Google",
    verified: true,
    serviceType: "all",
  },
]

/**
 * Get all testimonials with caching
 */
export function getAllTestimonials() {
  const cacheKey = "all_testimonials"
  registerCacheKey(cacheKey)

  return fetchWithCache(
    cacheKey,
    () => Promise.resolve(testimonials),
    3600, // Cache for 1 hour
  )
}

/**
 * Get testimonials by service type with caching
 */
export function getTestimonialsByService(serviceType: string) {
  const cacheKey = `testimonials_${serviceType}`
  registerCacheKey(cacheKey)

  return fetchWithCache(
    cacheKey,
    () => {
      const filtered = testimonials.filter((t) => t.serviceType === serviceType || t.serviceType === "all")
      return Promise.resolve(filtered)
    },
    3600, // Cache for 1 hour
  )
}

