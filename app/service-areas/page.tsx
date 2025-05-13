import Link from "next/link"
import { Metadata } from "next"
import { SERVICE_AREAS } from "@/lib/serviceAreas"

export const metadata: Metadata = {
  title: "Mobile Notary Service Areas | Houston Mobile Notary Pros",
  description:
    "Browse all cities and areas we serve for mobile notary and loan signing services throughout Greater Houston and the Gulf Coast.",
}

export default function ServiceAreasIndexPage() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#002147] mb-8">Areas We Serve</h1>
        <p className="text-gray-700 mb-6">
          Houston Mobile Notary Pros provides on-site notarization across the Greater Houston region and Gulf Coast.
          Select your city below for details.
        </p>
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {SERVICE_AREAS.map((area) => (
            <li key={area.slug}>
              <Link
                href={`/service-areas/${area.slug}`}
                className="text-[#002147] hover:text-[#A52A2A] underline"
              >
                {area.cityName}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
