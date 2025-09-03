'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, DollarSign, Clock, MapPin, FileText, Shield, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const faqs = [
  {
    question: "What's included in the base price?",
    answer: "Our base price includes the notary service, travel within the specified radius, and up to the maximum number of documents and signers for that service tier. Additional fees only apply for extras like additional documents, signers, or extended travel beyond the included radius.",
    icon: DollarSign
  },
  {
    question: "How do you calculate travel fees?",
    answer: "Travel fees are calculated based on the round-trip distance from our base location (ZIP 77591). The first 20-30 miles are included depending on your service tier. Beyond that, we charge $0.50 per mile. We use Google Maps for accurate distance calculations.",
    icon: MapPin
  },
  {
    question: "Do you charge extra for multiple documents?",
    answer: "Yes, additional documents beyond what's included in your service tier are $10 each. For example, if you choose Standard Mobile Notary ($75), you get up to 4 documents included. A 5th document would add $10, making your total $85.",
    icon: FileText
  },
  {
    question: "What's the difference between same-day and urgent service?",
    answer: "Same-day service (1-2 hours) adds a $25 fee and is available before 3pm. Urgent service (30-60 minutes) adds a $50 fee and is available throughout the day. Both require advance notice and depend on our current availability.",
    icon: Clock
  },
  {
    question: "Are there any hidden fees?",
    answer: "No hidden fees! We're completely transparent about our pricing. The only additional charges are clearly listed: extra documents ($10), extra signers ($5), extended travel ($0.50/mile), and urgency fees ($25-$50). Everything else is included.",
    icon: Shield
  },
  {
    question: "Do you offer discounts for multiple appointments?",
    answer: "Yes! We offer volume discounts for businesses and clients with multiple notarization needs. Contact us directly for custom pricing on 5+ appointments or ongoing service agreements. We also offer a 10% discount for first-time customers.",
    icon: Star
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept cash, credit cards, debit cards, and digital payments (Venmo, Zelle). Payment is due at the time of service. For business clients, we can arrange invoicing with net 30 terms for approved accounts.",
    icon: DollarSign
  },
  {
    question: "Can you come to my office or home?",
    answer: "Absolutely! That's what mobile notary service is all about. We come to your location - whether it's your home, office, hospital, or any other convenient place. We just need a flat surface for signing and proper identification.",
    icon: MapPin
  }
]

export default function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#002147] mb-4">Frequently Asked Questions</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get answers to common questions about our pricing and services. Can't find what you're looking for? Contact us directly.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {faqs.map((faq, index) => {
          const Icon = faq.icon
          const isOpen = openIndex === index
          
          return (
            <Card 
              key={index} 
              className="border border-gray-200 hover:border-[#002147]/30 transition-all duration-200"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#002147]/10 rounded-lg">
                      <Icon className="h-5 w-5 text-[#002147]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#002147]">{faq.question}</h3>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-5 w-5 text-[#002147] transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-[#002147] transition-transform duration-200" />
                  )}
                </div>
              </button>
              
              {isOpen && (
                <CardContent className="px-6 pb-6 pt-0">
                  <div className="pl-11">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Contact CTA */}
      <div className="text-center pt-8">
        <div className="bg-gradient-to-r from-[#002147]/5 to-[#A52A2A]/5 p-8 rounded-xl border border-[#002147]/20">
          <h3 className="text-2xl font-bold text-[#002147] mb-4">Still Have Questions?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our team is here to help! Contact us for personalized pricing quotes, custom service arrangements, or any other questions about our mobile notary services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-3 bg-[#002147] text-white font-semibold rounded-lg hover:bg-[#001a38] transition-colors duration-200"
            >
              Contact Us
            </a>
            <a 
              href="/booking" 
              className="inline-flex items-center justify-center px-6 py-3 bg-[#A52A2A] text-white font-semibold rounded-lg hover:bg-[#8B0000] transition-colors duration-200"
            >
              Book Now
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}









