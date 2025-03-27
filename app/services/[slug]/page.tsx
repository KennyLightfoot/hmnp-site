import { getServiceBySlug } from "@/lib/services"
import { notFound } from "next/navigation"

export async function generateStaticParams() {
  const { services } = await import("@/lib/services")
  return services.map((service) => ({
    slug: service.slug,
  }))
}

export default async function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = await getServiceBySlug(params.slug)

  if (!service) {
    notFound()
  }

  return (
    <div>
      <h1>{service.name}</h1>
      <p>{service.longDescription || service.description}</p>

      {service.features && service.features.length > 0 && (
        <>
          <h2>Features</h2>
          <ul>
            {service.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </>
      )}

      <a href={`/book?service=${service.slug}`} className="bg-blue-600 text-white px-4 py-2 rounded">
        Book Now
      </a>
    </div>
  )
}

