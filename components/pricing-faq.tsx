import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function PricingFaq() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-left">What is included in your base pricing?</AccordionTrigger>
        <AccordionContent>
          Our base pricing includes travel to your location within 20 miles of Houston, notarization of 1-2 documents
          for up to 2 signers, and all required notary supplies. For loan signings, the base price includes the complete
          loan package notarization.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <AccordionTrigger className="text-left">Do you charge extra for travel?</AccordionTrigger>
        <AccordionContent>
          Travel within 20 miles of Houston is included in our base pricing. For locations beyond 20 miles, we charge
          $1.50 per additional mile. For very remote locations, please contact us for a custom quote.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-3">
        <AccordionTrigger className="text-left">What forms of payment do you accept?</AccordionTrigger>
        <AccordionContent>
          We accept cash, credit/debit cards, Venmo, Zelle, and PayPal. Payment is due at the time of service unless
          other arrangements have been made in advance for business clients.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-4">
        <AccordionTrigger className="text-left">
          Is there an additional charge for weekend appointments?
        </AccordionTrigger>
        <AccordionContent>
          Yes, there is a $25 additional fee for weekend appointments for most services. However, our Priority Service
          already includes weekend availability at no extra charge.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-5">
        <AccordionTrigger className="text-left">What is your cancellation policy?</AccordionTrigger>
        <AccordionContent>
          We understand that plans change. There is no fee for cancellations made with at least 24 hours notice. For
          cancellations with less than 24 hours notice, a $25 cancellation fee may apply.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-6">
        <AccordionTrigger className="text-left">Do you offer discounts for multiple notarizations?</AccordionTrigger>
        <AccordionContent>
          Yes, we offer discounts for bulk notarizations and for businesses that require regular notary services. Please
          contact us to discuss your specific needs and we'll be happy to provide a custom quote.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-7">
        <AccordionTrigger className="text-left">
          What is the difference between your Essential and Priority services?
        </AccordionTrigger>
        <AccordionContent>
          Our Essential Mobile Package is our standard service with regular scheduling (typically 24-48 hours notice).
          Our Priority Service offers same-day or next-day appointments, extended hours including evenings, and
          guaranteed availability for urgent needs.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-8">
        <AccordionTrigger className="text-left">Are there any hidden fees I should know about?</AccordionTrigger>
        <AccordionContent>
          We pride ourselves on transparent pricing with no hidden fees. All potential additional charges (extra
          signers, documents, travel, etc.) are clearly outlined in our pricing table. If you have a unique situation,
          we'll provide a clear quote before confirming your appointment.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

