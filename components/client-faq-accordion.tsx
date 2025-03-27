"use client"

import { FAQAccordion } from "@/components/faq-accordion"
import { generalFaqs } from "@/data/faqs"

export default function ClientFAQAccordion({ faqs = generalFaqs.slice(0, 4) }) {
  return (
    <FAQAccordion
      faqs={faqs}
      title="Frequently Asked Questions"
      description="Find answers to common questions about our notary services"
    />
  )
}

