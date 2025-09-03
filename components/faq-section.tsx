import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import MiniFAQ from "@/components/mini-faq"
import React from "react" // Import React if using React.ReactNode

// Define the structure for a single FAQ item
interface FaqItem {
  id: string
  question: string
  answer: React.ReactNode // Since the answer can contain JSX
}

// Define the props for the FaqSection component
interface FaqSectionProps {
  faqs: FaqItem[]
}

export default function FaqSection({ faqs }: FaqSectionProps) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block bg-secondary/10 px-4 py-2 rounded-full mb-4">
            <span className="text-[#002147] font-medium">FAQ</span>
          </div>
          <h2 className="text-3xl font-bold text-[#002147] mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about our mobile notary services
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
            <MiniFAQ faqs={faqs} showMoreLink={true} />

            <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#002147]">Still have questions?</h3>
                <p className="text-gray-600 text-sm">We're here to help with any questions you may have.</p>
              </div>
              <Link href="/faq">
                <Button className="bg-secondary hover:bg-secondary-darker">
                  View All FAQs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 