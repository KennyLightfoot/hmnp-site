import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Houston Mobile Notary Pros",
    short_name: "HMNP",
    description: "Professional mobile notary services in Houston",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#A52A2A",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}

