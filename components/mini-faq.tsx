import type React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

interface MiniFAQProps {
  faqs: {
    id: string
    question: string
    answer: React.ReactNode
  }[]
  title?: string
  showMoreLink?: boolean
}

export default function MiniFAQ({ faqs, title = "Frequently Asked Questions", showMoreLink = true }: MiniFAQProps) {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-[#002147] mb-6">{title}</h2>

      <Accordion type="single" collapsible className="space-y-4 mb-6">
        {faqs.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-left font-semibold text-[#002147]">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="px-6 py-4 bg-gray-50">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {showMoreLink && (
        <div className="text-center">
          <Link href="/faq">
            <Button variant="outline" className="border-[#002147] text-[#002147]">
              View All FAQs
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
