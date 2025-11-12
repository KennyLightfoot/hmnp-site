export interface Comparison {
  slug: string
  title: string
  description: string
  metaTitle: string
  metaDescription: string
  optionA: {
    name: string
    description: string
    pros: string[]
    cons: string[]
    cost: string
    bestFor: string[]
  }
  optionB: {
    name: string
    description: string
    pros: string[]
    cons: string[]
    cost: string
    bestFor: string[]
  }
  conclusion: string
  keywords: string[]
}

export const COMPARISONS: Comparison[] = [
  {
    slug: "mobile-notary-vs-office-notary",
    title: "Mobile Notary vs Office Notary: Which is Better?",
    description: "Compare mobile notary services vs traditional office notaries. Learn the pros, cons, costs, and when to choose each option.",
    metaTitle: "Mobile Notary vs Office Notary: Complete Comparison | Houston Mobile Notary Pros",
    metaDescription: "Compare mobile notary vs office notary services. Learn costs, convenience, and which option is best for your needs in Houston.",
    optionA: {
      name: "Mobile Notary",
      description: "A notary who travels to your location—home, office, hospital, or any convenient spot.",
      pros: [
        "Convenience - We come to you",
        "Flexible scheduling - Evening and weekend appointments",
        "No travel required - Save time and gas",
        "Perfect for busy schedules",
        "Ideal for elderly or disabled clients",
        "Hospital and home visits available"
      ],
      cons: [
        "Higher cost - Typically $75-$150+",
        "Requires scheduling - Need to book appointment",
        "Travel time - Notary must travel to you"
      ],
      cost: "$75-$150+ per appointment (includes travel)",
      bestFor: [
        "Busy professionals",
        "Elderly or disabled individuals",
        "Hospital patients",
        "Real estate closings",
        "Evening or weekend needs",
        "Multiple signers at one location"
      ]
    },
    optionB: {
      name: "Office Notary",
      description: "Traditional notary service where you visit the notary's office or a business location.",
      pros: [
        "Lower cost - Often $10-$15 per signature",
        "Immediate service - Walk-in availability at some locations",
        "No appointment needed - Many banks offer free service",
        "Professional office setting",
        "Standard business hours"
      ],
      cons: [
        "You must travel - Inconvenient for some",
        "Limited hours - Typically business hours only",
        "Less flexible - May not accommodate urgent needs",
        "Not available evenings/weekends at most locations",
        "May require multiple trips if documents need revision"
      ],
      cost: "$10-$15 per signature (state maximum), often free at banks",
      bestFor: [
        "Simple, single-document notarizations",
        "Cost-conscious clients",
        "Standard business hours",
        "Bank customers (often free)",
        "Non-urgent documents"
      ]
    },
    conclusion: "Choose mobile notary if you value convenience, flexibility, and time savings. Choose office notary if cost is your primary concern and you can travel during business hours. For urgent needs, evening/weekend appointments, or multiple signers, mobile notary is typically the better choice.",
    keywords: [
      "mobile notary vs office notary",
      "mobile notary comparison",
      "office notary vs mobile",
      "notary service comparison",
      "mobile notary cost",
      "office notary cost"
    ]
  },
  {
    slug: "remote-online-notarization-vs-mobile-notary",
    title: "Remote Online Notarization vs Mobile Notary: Which Should You Choose?",
    description: "Compare Remote Online Notarization (RON) vs mobile notary services. Learn when to use each method and which is better for your needs.",
    metaTitle: "RON vs Mobile Notary: Complete Comparison | Houston Mobile Notary Pros",
    metaDescription: "Compare Remote Online Notarization vs mobile notary services. Learn costs, convenience, and which option is best for your documents.",
    optionA: {
      name: "Remote Online Notarization (RON)",
      description: "Notarization via secure video conference with a certified RON notary. Documents are signed electronically.",
      pros: [
        "No travel required - Done from anywhere",
        "Fast - Instant connection, no travel time",
        "Available 24/7 - Some platforms offer round-the-clock service",
        "Lower cost - Typically $25-$50",
        "Perfect for remote signers",
        "Digital documents - No scanning needed"
      ],
      cons: [
        "Requires technology - Need reliable internet and device",
        "Not all documents eligible - Some require in-person",
        "Institution acceptance - Some may prefer in-person",
        "Less personal - No face-to-face interaction",
        "Technology barriers - May be difficult for some users"
      ],
      cost: "$25-$50 per notarization",
      bestFor: [
        "Urgent documents",
        "Remote locations",
        "Tech-savvy users",
        "Simple documents",
        "Multiple signers in different locations",
        "Cost-conscious clients"
      ]
    },
    optionB: {
      name: "Mobile Notary",
      description: "A notary who travels to your location to notarize documents in person.",
      pros: [
        "Personal interaction - Face-to-face service",
        "All document types - Works for any notarization",
        "No technology needed - Works for everyone",
        "Physical documents - Original documents handled",
        "Universal acceptance - Accepted by all institutions",
        "Elderly-friendly - No technology barriers"
      ],
      cons: [
        "Higher cost - Typically $75-$150+",
        "Requires scheduling - Need to book appointment",
        "Travel time - Notary must travel to you",
        "Limited availability - Based on notary schedule"
      ],
      cost: "$75-$150+ per appointment (includes travel)",
      bestFor: [
        "Complex documents",
        "Elderly or less tech-savvy clients",
        "Physical documents",
        "High-value transactions",
        "Institutions requiring in-person",
        "Personal preference for face-to-face"
      ]
    },
    conclusion: "Choose RON if you're comfortable with technology, need urgent service, or want to save on costs. Choose mobile notary if you prefer personal interaction, have complex documents, or need universal acceptance. For most standard documents, both options work well—choose based on your comfort level and preferences.",
    keywords: [
      "RON vs mobile notary",
      "remote online notarization vs mobile",
      "online notary vs mobile notary",
      "virtual notary vs mobile",
      "RON comparison",
      "online notarization comparison"
    ]
  }
]

export function getComparisonBySlug(slug: string): Comparison | undefined {
  return COMPARISONS.find(c => c.slug === slug)
}

export function getAllComparisonSlugs(): string[] {
  return COMPARISONS.map(c => c.slug)
}

