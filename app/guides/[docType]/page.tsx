import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getDocumentGuideBySlug, getAllDocumentGuideSlugs } from "@/lib/documentGuides"
import { CheckCircle, AlertCircle } from "lucide-react"
import CtaSection from "@/components/cta-section"
import FaqSection from "@/components/faq-section"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://houstonmobilenotarypros.com"

interface PageProps {
  params: Promise<{ docType: string }>
}

export async function generateStaticParams() {
  const slugs = getAllDocumentGuideSlugs()
  return slugs.map((slug) => ({ docType: slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const guide = getDocumentGuideBySlug(resolvedParams.docType)
  
  if (!guide) {
    return { title: "Not Found" }
  }

  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    keywords: guide.keywords.join(", "),
    alternates: {
      canonical: `/guides/${guide.slug}`,
    },
    openGraph: {
      url: `/guides/${guide.slug}`,
      title: guide.metaTitle,
      description: guide.metaDescription,
    },
  }
}

export default async function DocumentGuidePage({ params }: PageProps) {
  const resolvedParams = await params
  const guide = getDocumentGuideBySlug(resolvedParams.docType)

  if (!guide) {
    notFound()
  }

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: guide.title,
    description: guide.description,
    step: guide.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.description
    }))
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/blog" className="text-[#002147] hover:underline mb-8 inline-block">
          &larr; Back to Blog
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold text-[#002147] mb-4">
          {guide.title}
        </h1>
        <p className="text-xl text-gray-600 mb-8">{guide.description}</p>

        {/* Quick Info Box */}
        <div className="bg-blue-50 border-l-4 border-[#002147] rounded p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-[#002147] mb-2">Document Type:</h3>
              <p className="text-gray-700">{guide.documentType}</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#002147] mb-2">Notarization Required:</h3>
              <p className="text-gray-700">
                {guide.requiresNotarization ? (
                  <span className="text-green-600 font-semibold">Yes</span>
                ) : (
                  <span className="text-orange-600 font-semibold">Recommended</span>
                )}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#002147] mb-2">Cost:</h3>
              <p className="text-gray-700">{guide.cost}</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#002147] mb-2">Timeline:</h3>
              <p className="text-gray-700">{guide.timeline}</p>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#002147] mb-4">Requirements</h2>
          <div className="bg-white border rounded-lg p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-[#002147] mb-2">Required ID:</h3>
              <ul className="list-disc list-inside text-gray-700">
                {guide.requirements.id.map((idType, i) => (
                  <li key={i}>{idType}</li>
                ))}
              </ul>
            </div>
            {guide.requirements.witnesses > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-[#002147] mb-2">Witnesses Required:</h3>
                <p className="text-gray-700">{guide.requirements.witnesses} witness(es)</p>
              </div>
            )}
            {guide.requirements.specialRequirements && guide.requirements.specialRequirements.length > 0 && (
              <div>
                <h3 className="font-semibold text-[#002147] mb-2">Special Requirements:</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {guide.requirements.specialRequirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Step-by-Step Process */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#002147] mb-4">Step-by-Step Process</h2>
          <div className="space-y-4">
            {guide.steps.map((step) => (
              <div key={step.step} className="bg-white border rounded-lg p-6">
                <div className="flex items-start">
                  <div className="bg-[#002147] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#002147] mb-2">{step.title}</h3>
                    <p className="text-gray-700">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Common Mistakes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#002147] mb-4">Common Mistakes to Avoid</h2>
          <div className="bg-red-50 border-l-4 border-red-500 rounded p-6">
            <ul className="space-y-2">
              {guide.commonMistakes.map((mistake, i) => (
                <li key={i} className="flex items-start">
                  <AlertCircle className="text-red-600 mr-2 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700">{mistake}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-8">
          <FaqSection 
            faqs={guide.faqs.map((faq, i) => ({
              id: String(i),
              question: faq.question,
              answer: faq.answer
            }))} 
          />
        </div>

        {/* Internal Links */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-[#002147] mb-4">Related Services</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/services/mobile-notary" className="text-[#A52A2A] hover:underline">
              Mobile Notary Services →
            </Link>
            <Link href="/services/estate-planning" className="text-[#A52A2A] hover:underline">
              Estate Planning Notarization →
            </Link>
            <Link href="/services/real-estate-notary" className="text-[#A52A2A] hover:underline">
              Real Estate Notarization →
            </Link>
            <Link href="/booking" className="text-[#A52A2A] hover:underline">
              Book Appointment →
            </Link>
          </div>
        </div>

        <CtaSection />
      </article>
    </>
  )
}

