import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { ServiceType } from "@/lib/services"
import { FaqAccordion } from "@/components/faq-accordion"
import { CTABanner } from "@/components/cta-banner"
import { getIconByName } from "@/lib/icons"

interface ServiceTemplateProps {
  service: ServiceType
}

export function ServiceTemplate({ service }: ServiceTemplateProps) {
  return (
    <main className="flex flex-col">
      <section className="py-12 bg-accent text-accent-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{service.title}</h1>
              <p className="text-lg mb-6">{service.description}</p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link href="/booking">Book Now</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden">
              <Image
                src={service.image || `/placeholder.svg?height=600&width=800`}
                alt={service.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {service.features.map((feature, index) => {
              const Icon = getIconByName(feature.iconName)
              return (
                <div key={index} className="bg-card p-6 rounded-xl shadow-sm">
                  <div className="flex items-center mb-4">
                    {Icon && <Icon className="h-6 w-6 text-primary mr-3" />}
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Pricing Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {service.pricing.map((price, index) => (
              <div
                key={index}
                className={`bg-card p-6 rounded-xl shadow-sm border ${
                  index === 1 ? "border-primary" : "border-transparent"
                }`}
              >
                <h3 className="text-xl font-bold mb-2">{price.title}</h3>
                <p className="text-muted-foreground mb-4">{price.description}</p>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-primary">${price.price}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {price.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <span className="text-primary mr-2">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full">
                  <Link href="/booking">Book This Package</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto">
            <FaqAccordion faqs={service.faqs} />
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <CTABanner />
        </div>
      </section>
    </main>
  )
}

