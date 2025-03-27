import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://houstonmobilenotarypros.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/booking/confirmation", "/contact/confirmation", "/admin/*", "/api/*", "/*.json$", "/*.xml$"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/booking/confirmation", "/contact/confirmation"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}

