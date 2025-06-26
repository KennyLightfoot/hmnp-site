import Script from "next/script"
import { usePathname } from "next/navigation"
import Link from "next/link"

export default function BreadcrumbJSONLD() {
  const pathname = usePathname()
  
  // Handle case where pathname might be null
  if (!pathname) {
    return null
  }
  
  // Convert pathname into breadcrumb segments
  const segments = pathname.split("/").filter(Boolean)
  
  // Safely get the base URL with fallback
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com'
  
  const breadcrumbItems = segments.map((seg, idx) => {
    const url = `/${segments.slice(0, idx + 1).join('/')}`
    return {
      "@type": "ListItem",
      position: idx + 1,
      name: seg.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      item: `${baseUrl}${url}`,
    }
  })
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  }

  return (
    <Script
      id="breadcrumb-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
