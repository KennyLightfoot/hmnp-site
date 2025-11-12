export interface DocumentGuide {
  slug: string
  title: string
  description: string
  metaTitle: string
  metaDescription: string
  documentType: string
  requiresNotarization: boolean
  requirements: {
    id: string[]
    witnesses: number
    specialRequirements?: string[]
  }
  steps: {
    step: number
    title: string
    description: string
  }[]
  cost: string
  timeline: string
  commonMistakes: string[]
  faqs: {
    question: string
    answer: string
  }[]
  keywords: string[]
}

export const DOCUMENT_GUIDES: DocumentGuide[] = [
  {
    slug: "power-of-attorney",
    title: "How to Notarize Power of Attorney in Texas",
    description: "Complete guide to notarizing a power of attorney in Texas. Learn requirements, process, costs, and where to get your POA notarized.",
    metaTitle: "How to Notarize Power of Attorney in Texas | Complete Guide 2024",
    metaDescription: "Step-by-step guide to notarizing power of attorney documents in Texas. Learn requirements, costs, and where to get your POA notarized.",
    documentType: "Power of Attorney",
    requiresNotarization: true,
    requirements: {
      id: ["Driver's license", "State ID", "Passport"],
      witnesses: 0,
      specialRequirements: ["Signer must be mentally competent", "Document must be complete before signing"]
    },
    steps: [
      {
        step: 1,
        title: "Prepare Your Document",
        description: "Complete all required fields in the POA form. Leave signature lines blank until you're with the notary."
      },
      {
        step: 2,
        title: "Find a Notary",
        description: "Choose between mobile notary (we come to you), bank notary (often free), or online notary (RON)."
      },
      {
        step: 3,
        title: "Bring Required Items",
        description: "Bring valid photo ID, completed (but unsigned) POA document, and payment for notary fees."
      },
      {
        step: 4,
        title: "Sign in Notary's Presence",
        description: "Sign the document in front of the notary. The notary will witness your signature and apply their seal."
      },
      {
        step: 5,
        title: "Receive Notarized Document",
        description: "The notary returns the fully notarized document. Keep the original in a safe place."
      }
    ],
    cost: "$10-$15 per signature (state maximum), $75-$150+ for mobile notary",
    timeline: "30-45 minutes for standard POA",
    commonMistakes: [
      "Signing before meeting the notary",
      "Using expired ID",
      "Incomplete forms",
      "Missing self-proving affidavit (if needed)"
    ],
    faqs: [
      {
        question: "Do I need witnesses for a power of attorney in Texas?",
        answer: "Some types of POAs require witnesses in addition to notarization. Medical powers of attorney typically require two witnesses."
      },
      {
        question: "Can I notarize a power of attorney online in Texas?",
        answer: "Yes, Texas allows Remote Online Notarization (RON) for power of attorney documents via video call."
      },
      {
        question: "How long is a notarized power of attorney valid?",
        answer: "A durable power of attorney remains valid until revoked or until your death. Limited POAs expire on the date specified."
      }
    ],
    keywords: [
      "notarize power of attorney Texas",
      "POA notarization",
      "power of attorney notary",
      "notarize POA Houston",
      "Texas POA notarization"
    ]
  },
  {
    slug: "will",
    title: "How to Notarize a Will in Texas",
    description: "Complete guide to notarizing a will in Texas. Learn requirements, process, costs, and why notarization is important for your will.",
    metaTitle: "How to Notarize a Will in Texas | Complete Guide 2024",
    metaDescription: "Step-by-step guide to notarizing a will in Texas. Learn requirements, process, and why notarization matters for will validity.",
    documentType: "Will",
    requiresNotarization: false,
    requirements: {
      id: ["Driver's license", "State ID", "Passport"],
      witnesses: 2,
      specialRequirements: ["Self-proving affidavit recommended", "Witnesses cannot be beneficiaries"]
    },
    steps: [
      {
        step: 1,
        title: "Prepare Your Will",
        description: "Complete all required sections. Include self-proving affidavit (recommended). Leave signature lines blank."
      },
      {
        step: 2,
        title: "Arrange Witnesses",
        description: "Find two witnesses (14+ years old, mentally competent, not beneficiaries). They must be present at signing."
      },
      {
        step: 3,
        title: "Schedule Notary Appointment",
        description: "Choose convenient time and location. Ensure witnesses can attend. Mobile notary can come to you."
      },
      {
        step: 4,
        title: "Sign in Notary's Presence",
        description: "You sign the will, witnesses sign, and notary notarizes all signatures and self-proving affidavit."
      },
      {
        step: 5,
        title: "Store Securely",
        description: "Keep original in safe place (safe deposit box, attorney's office). Provide copies to executor and attorney."
      }
    ],
    cost: "$10-$15 per signature, $75-$150+ for mobile notary with self-proving affidavit",
    timeline: "45-60 minutes including witnesses",
    commonMistakes: [
      "Signing before meeting notary",
      "Using beneficiaries as witnesses",
      "Missing self-proving affidavit",
      "Expired ID"
    ],
    faqs: [
      {
        question: "Is notarization required for a will in Texas?",
        answer: "No, notarization is not required for a will to be valid. However, a self-proving affidavit (which requires notarization) makes probate much easier."
      },
      {
        question: "Do I need witnesses if I notarize my will?",
        answer: "Yes, Texas requires two witnesses for an attested will, regardless of notarization. The notary can serve as one witness, but two separate witnesses are still required."
      },
      {
        question: "Can beneficiaries be witnesses?",
        answer: "No, beneficiaries should not serve as witnesses. Use neutral witnesses who aren't named in the will."
      }
    ],
    keywords: [
      "notarize will Texas",
      "will notarization",
      "notary for will",
      "Texas will notary",
      "notarize will Houston"
    ]
  },
  {
    slug: "real-estate-deed",
    title: "How to Notarize Real Estate Deed in Texas",
    description: "Complete guide to notarizing real estate deeds in Texas. Learn requirements, process, costs, and where to get your deed notarized.",
    metaTitle: "How to Notarize Real Estate Deed in Texas | Complete Guide 2024",
    metaDescription: "Step-by-step guide to notarizing real estate deeds in Texas. Learn requirements, process, and costs for deed notarization.",
    documentType: "Real Estate Deed",
    requiresNotarization: true,
    requirements: {
      id: ["Driver's license", "State ID", "Passport"],
      witnesses: 0,
      specialRequirements: ["Property address and legal description required", "All grantors must be present"]
    },
    steps: [
      {
        step: 1,
        title: "Receive Deed from Title Company",
        description: "Title company or attorney prepares the deed with correct property information and legal description."
      },
      {
        step: 2,
        title: "Review Deed Carefully",
        description: "Verify property address, legal description, and grantor/grantee names are correct before signing."
      },
      {
        step: 3,
        title: "Schedule Notary Appointment",
        description: "Coordinate with title company. Mobile notary can meet at your location or title company office."
      },
      {
        step: 4,
        title: "Sign in Notary's Presence",
        description: "All grantors sign the deed in front of the notary. Notary verifies identity and witnesses signatures."
      },
      {
        step: 5,
        title: "Return to Title Company",
        description: "Notary returns deed to title company for recording with county clerk. Recording typically happens within 30 days."
      }
    ],
    cost: "$10-$15 per signature (state maximum), $75-$150+ for mobile notary",
    timeline: "20-30 minutes for standard deed",
    commonMistakes: [
      "Signing before notary arrives",
      "Wrong property information",
      "Missing grantors",
      "Expired ID"
    ],
    faqs: [
      {
        question: "Do all real estate documents need to be notarized?",
        answer: "No, only certain documents require notarization (typically deeds and mortgages). Other documents may be signed without notarization."
      },
      {
        question: "Can I use Remote Online Notarization for real estate?",
        answer: "Yes, RON is available in Texas for real estate documents, but some title companies may prefer in-person notarization."
      },
      {
        question: "What happens after the deed is notarized?",
        answer: "The deed is returned to the title company, which records it with the county clerk. Recording typically happens within 30 days."
      }
    ],
    keywords: [
      "notarize deed Texas",
      "real estate deed notarization",
      "deed notary Texas",
      "notarize property deed",
      "Texas deed notary"
    ]
  }
]

export function getDocumentGuideBySlug(slug: string): DocumentGuide | undefined {
  return DOCUMENT_GUIDES.find(g => g.slug === slug)
}

export function getAllDocumentGuideSlugs(): string[] {
  return DOCUMENT_GUIDES.map(g => g.slug)
}

