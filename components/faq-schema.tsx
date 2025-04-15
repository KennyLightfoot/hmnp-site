import Script from "next/script"

export default function FAQSchema() {
  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is a notary public?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "A notary public is a state-appointed official who serves as an impartial witness to the signing of important documents. Notaries verify the identity of signers, ensure they're signing willingly, and in some cases, administer oaths or affirmations. In Texas, notaries are commissioned by the Secretary of State and must follow specific laws and regulations governing notarial acts.",
              },
            },
            {
              "@type": "Question",
              name: "Why should I use a mobile notary service?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "A mobile notary service offers convenience by coming to your location, saving you time and hassle. This is especially valuable when you have mobility issues or health concerns, you're dealing with time-sensitive documents, you need notarization outside normal business hours, you have multiple signers at different locations, or you're in a hospital, nursing home, or detention facility.",
              },
            },
            {
              "@type": "Question",
              name: "What areas do you serve?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "We serve clients within a 30-mile radius of ZIP code 77591, covering the greater Houston area including Houston, Galveston, League City, Pearland, Sugar Land, Katy, The Woodlands, Baytown, Friendswood, and Missouri City. We can also travel beyond our standard service area for an additional fee of $0.50 per mile.",
              },
            },
            {
              "@type": "Question",
              name: "How much do your notary services cost?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Our pricing varies based on the service package you select: Essential Mobile Package starts at $75 for one signer with 1-2 documents. Priority Service Package is $100 flat fee for 2-hour response time. Loan Signing Services are $150 flat fee for standard loan closings and reverse mortgages. Additional fees may apply for weekend service (+$50), extended travel beyond 20 miles ($0.50/mile), or extra documents.",
              },
            },
            {
              "@type": "Question",
              name: "What forms of identification do you accept?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "In accordance with Texas law, we accept government-issued photo identification including driver's license or state ID card issued by any U.S. state, U.S. passport or passport card, U.S. military ID card, permanent resident card, foreign passport with temporary I-551 stamp, employment authorization document with photograph, and U.S. Citizenship and Immigration Services ID card. The ID must be current (not expired), contain a photograph and physical description of the bearer, contain the bearer's signature, and be issued by a governmental entity.",
              },
            },
          ],
        }),
      }}
    />
  )
}
