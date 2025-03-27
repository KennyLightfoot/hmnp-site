import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CTABanner } from "@/components/cta-banner"
// import { services } from "@/lib/services" // Removed existing services import
import { getServices } from "@/lib/services" // Added new services import

export const metadata: Metadata = {
  title: "Mobile Notary Services | Houston Mobile Notary Pros",
  description:
    "Explore our comprehensive mobile notary services including loan signings, reverse mortgages, and specialty notarizations throughout the Houston area.",
}

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <main className="flex flex-col">
      <section className="py-12 bg-accent text-accent-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Mobile Notary Services</h1>
          <p className="text-lg max-w-2xl mx-auto">
            We offer a comprehensive range of mobile notary services to meet your needs. Our experienced notaries come
            to your location for convenience and peace of mind.
          </p>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="border rounded-lg p-4">
                <h2 className="text-xl font-bold">{service.name}</h2>
                <p>{service.description}</p>
                <a href={`/services/${service.slug}`} className="text-blue-600 hover:underline">
                  Learn more
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Need a Custom Notary Solution?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We understand that every situation is unique. Contact us to discuss your specific notary needs and we'll
              create a custom solution for you.
            </p>
          </div>
          <div className="flex justify-center">
            <Button asChild size="lg" className="mr-4">
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/booking">Book Now</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <CTABanner />
        </div>
      </section>
    </main>
  )
}

