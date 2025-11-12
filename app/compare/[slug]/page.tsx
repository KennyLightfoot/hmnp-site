import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getComparisonBySlug, getAllComparisonSlugs } from "@/lib/comparisons"
import { Check, X } from "lucide-react"
import CtaSection from "@/components/cta-section"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://houstonmobilenotarypros.com"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = getAllComparisonSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const comparison = getComparisonBySlug(resolvedParams.slug)
  
  if (!comparison) {
    return { title: "Not Found" }
  }

  return {
    title: comparison.metaTitle,
    description: comparison.metaDescription,
    keywords: comparison.keywords.join(", "),
    alternates: {
      canonical: `/compare/${comparison.slug}`,
    },
    openGraph: {
      url: `/compare/${comparison.slug}`,
      title: comparison.metaTitle,
      description: comparison.metaDescription,
    },
  }
}

export default async function ComparisonPage({ params }: PageProps) {
  const resolvedParams = await params
  const comparison = getComparisonBySlug(resolvedParams.slug)

  if (!comparison) {
    notFound()
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the difference between ${comparison.optionA.name} and ${comparison.optionB.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: comparison.description
        }
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <article className="container mx-auto px-4 py-12 max-w-5xl">
        <Link href="/blog" className="text-[#002147] hover:underline mb-8 inline-block">
          &larr; Back to Blog
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold text-[#002147] mb-4">
          {comparison.title}
        </h1>
        <p className="text-xl text-gray-600 mb-8">{comparison.description}</p>

        {/* Comparison Table */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Option A */}
          <div className="bg-white border-2 border-[#002147] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-[#002147] mb-4">{comparison.optionA.name}</h2>
            <p className="text-gray-700 mb-4">{comparison.optionA.description}</p>
            
            <div className="mb-4">
              <h3 className="font-semibold text-[#002147] mb-2">Cost:</h3>
              <p className="text-gray-700">{comparison.optionA.cost}</p>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-[#002147] mb-2">Pros:</h3>
              <ul className="space-y-2">
                {comparison.optionA.pros.map((pro, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="text-green-600 mr-2 mt-1 flex-shrink-0" size={20} />
                    <span className="text-gray-700">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-[#002147] mb-2">Cons:</h3>
              <ul className="space-y-2">
                {comparison.optionA.cons.map((con, i) => (
                  <li key={i} className="flex items-start">
                    <X className="text-red-600 mr-2 mt-1 flex-shrink-0" size={20} />
                    <span className="text-gray-700">{con}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[#002147] mb-2">Best For:</h3>
              <ul className="space-y-1">
                {comparison.optionA.bestFor.map((item, i) => (
                  <li key={i} className="text-gray-700">• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Option B */}
          <div className="bg-white border-2 border-[#A52A2A] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-[#A52A2A] mb-4">{comparison.optionB.name}</h2>
            <p className="text-gray-700 mb-4">{comparison.optionB.description}</p>
            
            <div className="mb-4">
              <h3 className="font-semibold text-[#A52A2A] mb-2">Cost:</h3>
              <p className="text-gray-700">{comparison.optionB.cost}</p>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-[#A52A2A] mb-2">Pros:</h3>
              <ul className="space-y-2">
                {comparison.optionB.pros.map((pro, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="text-green-600 mr-2 mt-1 flex-shrink-0" size={20} />
                    <span className="text-gray-700">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-[#A52A2A] mb-2">Cons:</h3>
              <ul className="space-y-2">
                {comparison.optionB.cons.map((con, i) => (
                  <li key={i} className="flex items-start">
                    <X className="text-red-600 mr-2 mt-1 flex-shrink-0" size={20} />
                    <span className="text-gray-700">{con}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[#A52A2A] mb-2">Best For:</h3>
              <ul className="space-y-1">
                {comparison.optionB.bestFor.map((item, i) => (
                  <li key={i} className="text-gray-700">• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Conclusion */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-[#002147] mb-4">Conclusion</h2>
          <p className="text-lg text-gray-700">{comparison.conclusion}</p>
        </div>

        {/* Internal Links */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-[#002147] mb-4">Related Services</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/services/mobile-notary" className="text-[#A52A2A] hover:underline">
              Mobile Notary Services →
            </Link>
            <Link href="/services/remote-online-notarization" className="text-[#A52A2A] hover:underline">
              Remote Online Notarization →
            </Link>
            <Link href="/pricing" className="text-[#A52A2A] hover:underline">
              Notary Pricing →
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

