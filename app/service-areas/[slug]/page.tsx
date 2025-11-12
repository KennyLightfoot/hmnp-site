import Link from "next/link"
import { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import { getServiceAreaBySlug, SERVICE_AREAS } from "@/lib/serviceAreas"
import { CITY_INFO } from "@/lib/cityInfo"
import { CITY_FAQS } from "@/lib/faqs"
import ServiceHoursBanner from "@/components/service-hours-banner"
import WhyChooseUs from "@/components/why-choose-us"
import CtaSection from "@/components/cta-section"
import ServiceAreaJSONLD from "@/components/service-area-jsonld"
import FaqSection from "@/components/faq-section"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return SERVICE_AREAS.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const area = getServiceAreaBySlug(resolvedParams.slug)
  if (!area) return { title: "Not Found" }
  return {
    title: area.title,
    description: area.description,
    keywords: area.keywords,
    alternates: {
      canonical: `/service-areas/${area.slug}`,
    },
    openGraph: {
      url: `/service-areas/${area.slug}`,
      title: area.title,
      description: area.description,
    },
  }
}

export default async function ServiceAreaDynamicPage({ params }: PageProps) {
  const resolvedParams = await params;
  const area = getServiceAreaBySlug(resolvedParams.slug)
  if (!area) notFound()
  const info = CITY_INFO[resolvedParams.slug]
  const faqs = CITY_FAQS[resolvedParams.slug] || []

  return (
    <>
      <ServiceAreaJSONLD area={area} faqs={faqs} />
      <section className="relative py-20 md:py-28 bg-[#002147] text-white text-center overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Mobile Notary {area.cityName} | Notary Near Me
          </h1>
          <p className="text-xl mb-4 max-w-2xl mx-auto">{area.description}</p>
          <p className="text-lg mb-8 max-w-3xl mx-auto text-blue-100">
            Professional loan signing agent, after-hours notary, and mobile notary services in {area.cityName}. Same-day appointments available.
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center bg-[#A52A2A] hover:bg-[#8B0000] px-6 py-3 rounded text-white transition-colors"
          >
            Book an Appointment
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
        <div className="absolute inset-0 bg-[url('/hero-background.jpg')] bg-cover bg-center opacity-20" />
      </section>

      <ServiceHoursBanner />
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4 text-[#002147]">
            Mobile Notary Services in {area.cityName}, TX
          </h2>
          <p className="text-gray-700 mb-6 whitespace-pre-line">
            {`
Looking for an after-hours mobile notary in ${area.cityName}? Houston Mobile Notary Pros travels to every corner of ${area.cityName} and the surrounding Clear Lake region. We serve ZIP codes ${info?.zipCodes?.join(", ")} and can meet you at landmarks like ${info?.landmarks?.join(", ")}. Whether you need a loan signing agent near zip ${info?.zipCodes?.[0]} or urgent apostille and notarization services, our commissioned team shows up on time with everything required—stamps, seals, and ID verification tools. Same-day notary public appointments in ${area.cityName} are just a click away. Book online, call, or text and we'll dispatch a professional to your home, office, marina, or hospital room.
            `}
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-[#002147] mb-3">Mobile Notary Services</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Wills & Estate Planning</li>
                <li>• Powers of Attorney</li>
                <li>• Real Estate Documents</li>
                <li>• Business Contracts</li>
                <li>• Affidavits & Oaths</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-[#002147] mb-3">Loan Signing Agent</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Purchase Agreements</li>
                <li>• Refinance Closings</li>
                <li>• HELOC Signings</li>
                <li>• Reverse Mortgages</li>
                <li>• Commercial Loans</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-[#002147] mb-3">Emergency & After-Hours</h3>
              <ul className="text-gray-700 space-y-2">
                <li>• Same-Day Service</li>
                <li>• Evening Appointments</li>
                <li>• Weekend Availability</li>
                <li>• Holiday Service</li>
                <li>• Hospital Visits</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-[#002147] mb-3">Why Choose Our {area.cityName} Mobile Notary Services?</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-700 mb-2">✓ <strong>Certified & Insured:</strong> All notaries are Texas-commissioned with E&O insurance</p>
                <p className="text-gray-700 mb-2">✓ <strong>Fast Response:</strong> Same-day and emergency appointments available</p>
                <p className="text-gray-700 mb-2">✓ <strong>Professional Service:</strong> Punctual, discreet, and reliable</p>
              </div>
              <div>
                <p className="text-gray-700 mb-2">✓ <strong>Convenient Locations:</strong> We come to your home, office, or hospital</p>
                <p className="text-gray-700 mb-2">✓ <strong>Competitive Pricing:</strong> Transparent rates with no hidden fees</p>
                <p className="text-gray-700 mb-2">✓ <strong>RON Available:</strong> Remote Online Notarization when you can't meet in person</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <FaqSection faqs={faqs.map((f, i) => ({ id: String(i), question: f.question, answer: f.answer }))} />
      <WhyChooseUs />
      <CtaSection />
    </>
  )
}
