import Script from "next/script"

export default function EnhancedFAQSchema() {
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
                text: "We serve clients within a 20-mile radius for Standard and 30-mile radius for Extended/Loan Signing, covering the greater Houston area including Houston, Galveston, League City, Pearland, Sugar Land, Katy, The Woodlands, Baytown, Friendswood, and Missouri City. Beyond included miles, tiered travel applies: 21–30 +$25; 31–40 +$45; 41–50 +$65.",
              },
            },
            {
              "@type": "Question",
              name: "How much do your notary services cost?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Our pricing varies based on the service package you select: Standard Mobile Notary starts at $85 for one signer with up to 4 documents. Extended Hours Mobile is $125 for flexible 7am-9pm scheduling. Loan Signing Services are $175 flat fee for standard loan closings and reverse mortgages. Additional fees may apply for weekend service (+$40), and tiered travel beyond included miles (21–30 +$25; 31–40 +$45; 41–50 +$65).",
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
            {
              "@type": "Question",
              name: "How quickly can you respond to a request?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Our response time depends on the service level you choose. For Essential Service, we typically require 24-hour advance notice, but same-day service may be available depending on our schedule. For Priority Service, we guarantee a 2-hour response time, available 7am-9pm daily, including weekends. For urgent needs, we recommend our Priority Service package.",
              },
            },
            {
              "@type": "Question",
              name: "What types of documents can you notarize?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "We can notarize a wide variety of documents including real estate documents (deeds, mortgages, refinancing), powers of attorney, wills and living wills, medical directives, affidavits, loan documents, business agreements, adoption papers, school and education forms, vehicle title transfers, and international documents requiring apostille.",
              },
            },
            {
              "@type": "Question",
              name: "What payment methods do you accept?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "We accept credit/debit cards (Visa, MasterCard, American Express, Discover) which is our preferred method, cash (exact change required), and we offer corporate billing for approved business accounts. Payment is due at the time of service. We do not accept personal checks, money orders, or payment apps like Venmo or Cash App at this time.",
              },
            },
            {
              "@type": "Question",
              name: "Do I need witnesses for my document?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Whether witnesses are required depends on the type of document. In Texas, wills typically require two witnesses who are not beneficiaries. Powers of Attorney require notarization but not witnesses. Deeds generally require notarization but not witnesses. Medical directives often require two witnesses or notarization. If your document requires witnesses, you should arrange for them to be present during the notary appointment.",
              },
            },
            {
              "@type": "Question",
              name: "What should I expect during a mobile notary appointment?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "During a typical appointment, our notary will arrive at your location, verify the identity of all signers using government-issued photo ID, ensure all signers understand the document(s) and are signing willingly, witness the signing of the document(s), complete the notarial certificate and apply their official seal, and collect payment. The process typically takes 15-30 minutes for standard notarizations or 60-90 minutes for loan signings.",
              },
            },
          ],
        }),
      }}
    />
  )
}
