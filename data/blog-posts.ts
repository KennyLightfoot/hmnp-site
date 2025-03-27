import { fetchWithCache } from "@/lib/cache-utils"
import type { BlogAuthor, BlogCategory, BlogPost } from "@/lib/blog-types"

// Export the blog authors
export const blogAuthors: Record<string, BlogAuthor> = {
  "john-doe": {
    name: "John Doe",
    title: "Senior Notary Public",
    avatar: "/placeholder.svg?height=200&width=200",
    bio: "John has been a notary public for over 10 years, specializing in loan signings and real estate transactions.",
  },
  "jane-smith": {
    name: "Jane Smith",
    title: "Certified Loan Signing Agent",
    avatar: "/placeholder.svg?height=200&width=200",
    bio: "Jane is a certified loan signing agent with expertise in mortgage and refinance transactions.",
  },
  "robert-johnson": {
    name: "Robert Johnson",
    title: "Legal Document Specialist",
    avatar: "/placeholder.svg?height=200&width=200",
    bio: "Robert specializes in complex legal documents and has worked with major law firms across Houston.",
  },
}

// Export the blog categories
export const blogCategories: Record<BlogCategory, { name: string; description: string; slug: string }> = {
  "notary-basics": {
    name: "Notary Basics",
    description: "Essential information about notary services and requirements",
    slug: "notary-basics",
  },
  "loan-signing": {
    name: "Loan Signing",
    description: "Information about loan signing processes and requirements",
    slug: "loan-signing",
  },
  "real-estate": {
    name: "Real Estate",
    description: "Notary information specific to real estate transactions",
    slug: "real-estate",
  },
  "legal-documents": {
    name: "Legal Documents",
    description: "Guidance on various legal documents requiring notarization",
    slug: "legal-documents",
  },
  "business-tips": {
    name: "Business Tips",
    description: "Tips for businesses requiring notary services",
    slug: "business-tips",
  },
  "industry-news": {
    name: "Industry News",
    description: "Latest updates in the notary and legal services industry",
    slug: "industry-news",
  },
  "how-to-guides": {
    name: "How-To Guides",
    description: "Step-by-step guides for document preparation and notarization",
    slug: "how-to-guides",
  },
  faq: {
    name: "FAQ",
    description: "Frequently asked questions about notary services",
    slug: "faq",
  },
}

// Export the blog posts
export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "what-documents-require-notarization",
    title: "What Documents Require Notarization in Texas?",
    description: "A comprehensive guide to documents that legally require notarization in the state of Texas.",
    content: `
# What Documents Require Notarization in Texas?

When it comes to legal documents in Texas, knowing which ones require notarization can save you time, money, and potential legal complications. This guide covers the most common documents that require a notary public's seal in the Lone Star State.

## Real Estate Documents

Real estate transactions almost always require notarization. These include:

- **Deed transfers**: When transferring property ownership
- **Mortgage documents**: Including loan agreements and refinancing paperwork
- **Closing documents**: The various documents signed during a real estate closing
- **Property liens**: Documents establishing or removing liens on property

## Legal and Estate Planning Documents

Many important legal documents require notarization to be valid:

- **Power of Attorney**: Giving someone legal authority to act on your behalf
- **Wills and trusts**: Though not always required, notarization adds an extra layer of validity
- **Affidavits**: Written statements made under oath
- **Medical directives**: Including living wills and healthcare powers of attorney

## Business Documents

Businesses frequently need notarization for:

- **Articles of incorporation**: When forming a corporation
- **Partnership agreements**: Formalizing business partnerships
- **Commercial leases**: For business property rentals
- **Contracts**: Major business contracts often require notarization

## Why Notarization Matters

Notarization serves several important purposes:

1. **Verifies identity**: Confirms the signer is who they claim to be
2. **Confirms willingness**: Establishes that signers are acting of their own free will
3. **Creates legal evidence**: Provides proof that the signature is authentic
4. **Deters fraud**: Makes document tampering more difficult

## What to Bring to a Notary Appointment

Always bring:

- Valid government-issued photo ID (driver's license, passport, etc.)
- The complete, unsigned document
- All parties who need to sign
- Payment for notary services

## Mobile Notary Convenience

Remember that a mobile notary can come to your location, saving you time and hassle. This is especially helpful for:

- Real estate closings at your home
- Hospital or care facility document signings
- Business document signings at your office
- Multi-party signings where gathering everyone in one place is difficult

Contact Houston Mobile Notary Pros today to schedule a convenient appointment at your location!
    `,
    date: "2023-06-15",
    lastUpdated: "2023-07-01",
    author: blogAuthors["john-doe"],
    categories: ["notary-basics", "legal-documents"],
    tags: ["texas notary", "document requirements", "legal documents", "notarization"],
    image: "/placeholder.svg?height=600&width=1200",
    readTime: 5,
    featured: true,
    views: 1250,
  },
  {
    id: "2",
    slug: "loan-signing-process-explained",
    title: "The Complete Loan Signing Process Explained",
    description: "A step-by-step guide to the loan signing process for borrowers and real estate professionals.",
    content: `
# The Complete Loan Signing Process Explained

The loan signing process is a critical step in finalizing a mortgage or refinance. Understanding what happens during this process helps borrowers prepare and ensures a smooth closing experience. Here's everything you need to know about loan signings in Texas.

## Before the Signing

Before the actual signing takes place, several steps occur:

1. **Loan approval**: The lender approves your loan application
2. **Document preparation**: The lender prepares the closing disclosure and loan documents
3. **Scheduling**: The title company or lender schedules the signing appointment
4. **Notary assignment**: A notary signing agent is assigned to facilitate the signing

## During the Signing

The loan signing appointment typically includes:

1. **Identity verification**: The notary verifies all signers' identities using government-issued photo ID
2. **Document explanation**: The notary explains each document (though they cannot provide legal advice)
3. **Document signing**: Borrowers sign all required documents
4. **Notarization**: The notary notarizes documents requiring an official seal
5. **Document organization**: The notary organizes the completed package for return to the lender

## Key Documents You'll Sign

During a typical loan signing, you'll encounter:

- **Promissory Note**: The legal "IOU" that contains your promise to repay the loan
- **Deed of Trust/Mortgage**: Secures the promissory note with the property as collateral
- **Closing Disclosure**: Details all costs associated with the loan
- **Loan Application**: The final version of your loan application
- **Various Affidavits and Disclosures**: Additional required legal documents

## After the Signing

Once the signing is complete:

1. **Document return**: The notary returns documents to the lender or title company
2. **Funding**: The lender reviews the documents and funds the loan
3. **Recording**: The deed and mortgage are recorded with the county
4. **Loan servicing**: Your loan servicing begins

## Choosing a Mobile Notary for Your Loan Signing

A qualified mobile notary signing agent can make the process much smoother by:

- Coming to your preferred location
- Having experience with loan documents
- Explaining the process clearly
- Ensuring all documents are properly executed
- Providing a professional, stress-free experience

At Houston Mobile Notary Pros, our certified loan signing agents are experienced with all types of mortgage transactions and can facilitate your signing at your home, office, or another convenient location.

Contact us today to schedule your loan signing appointment!
    `,
    date: "2023-05-20",
    author: blogAuthors["jane-smith"],
    categories: ["loan-signing", "real-estate"],
    tags: ["mortgage", "loan signing", "closing", "refinance"],
    image: "/placeholder.svg?height=600&width=1200",
    readTime: 7,
    views: 980,
  },
  {
    id: "3",
    slug: "power-of-attorney-guide",
    title: "Power of Attorney in Texas: A Complete Guide",
    description:
      "Everything you need to know about creating, using, and notarizing Power of Attorney documents in Texas.",
    content: `
# Power of Attorney in Texas: A Complete Guide

A Power of Attorney (POA) is one of the most important legal documents you can create. It allows you to appoint someone you trust to handle your affairs if you become unable to do so. Here's what Texas residents need to know about this essential document.

## Types of Power of Attorney in Texas

Texas recognizes several types of POA documents:

### Durable Power of Attorney
- Remains in effect if you become incapacitated
- Can be effective immediately or upon incapacity ("springing")
- Covers financial and property matters

### Medical Power of Attorney
- Specifically for healthcare decisions
- Takes effect only when you cannot make medical decisions
- Different from a living will or advance directive

### Limited Power of Attorney
- Grants authority for specific transactions or time periods
- Automatically expires when the task is complete or time elapses
- Often used for real estate or business transactions

### General Power of Attorney
- Grants broad authority over financial matters
- Automatically terminates if you become incapacitated
- Less commonly used due to this limitation

## Requirements for a Valid POA in Texas

For a Power of Attorney to be legally valid in Texas:

1. **You must be mentally competent** when you sign it
2. **It must be in writing**
3. **It must be signed by you (the principal)**
4. **It must be notarized**
5. For real estate transactions, it must be recorded in the county where the property is located

## The Notarization Process

Proper notarization is essential for a valid POA:

1. **Both parties must appear before the notary** (the principal must always appear; the agent only in certain circumstances)
2. **The principal must present valid ID**
3. **The notary must verify the principal's willingness and competence**
4. **The document must be signed in the notary's presence**
5. **The notary applies their seal and signature**

## Choosing Your Agent

When selecting someone to be your agent (attorney-in-fact):

- Choose someone you trust implicitly
- Ensure they're willing to serve in this capacity
- Consider their financial knowledge and responsibility
- Discuss your wishes and expectations with them
- Consider naming a successor agent as backup

## Revoking a Power of Attorney

You can revoke a POA at any time as long as you're mentally competent:

1. Create a written revocation document
2. Have the revocation notarized
3. Provide copies to all relevant parties
4. Record the revocation if the original was recorded

## Mobile Notary Services for POA Documents

Creating a Power of Attorney often occurs during challenging times. A mobile notary can make the process easier by:

- Coming to your home, hospital, or care facility
- Ensuring proper execution of the document
- Providing a professional, compassionate service
- Accommodating multiple signers if needed

Houston Mobile Notary Pros specializes in notarizing sensitive legal documents like Powers of Attorney. Contact us to schedule a convenient appointment at your location.
    `,
    date: "2023-04-10",
    lastUpdated: "2023-06-15",
    author: blogAuthors["robert-johnson"],
    categories: ["legal-documents", "how-to-guides"],
    tags: ["power of attorney", "legal planning", "estate documents", "incapacity planning"],
    image: "/placeholder.svg?height=600&width=1200",
    readTime: 8,
    featured: true,
    views: 1560,
  },
  {
    id: "4",
    slug: "remote-online-notarization-texas",
    title: "Remote Online Notarization in Texas: What You Need to Know",
    description: "An overview of remote online notarization laws and requirements in Texas.",
    content: `
# Remote Online Notarization in Texas: What You Need to Know

Remote Online Notarization (RON) has transformed how notarial acts can be performed in Texas. This technology allows notaries and signers to connect virtually rather than in person. Here's what you need to know about this convenient option.

## What is Remote Online Notarization?

Remote Online Notarization allows a notary to:

- Verify a signer's identity remotely
- Witness document signing via audio-visual technology
- Apply an electronic notarial seal
- Create a secure electronic record of the transaction

## Texas RON Laws and Requirements

Texas was one of the first states to authorize RON. Under Texas law:

1. **Notaries must obtain special commission** as an online notary public
2. **Identity verification** must use both knowledge-based authentication and credential analysis
3. **Audio-visual sessions** must be recorded and retained
4. **Electronic signatures and seals** must meet specific technical standards
5. **Records must be kept** for at least five years

## When to Use Remote Online Notarization

RON is ideal for:

- Signers who are physically unable to meet in person
- International or out-of-state transactions
- Urgent documents needing immediate notarization
- Busy professionals with limited availability
- Anyone preferring the convenience of digital transactions

## When Traditional Mobile Notary Services May Be Better

While RON offers convenience, traditional mobile notary services may be preferable when:

- Documents require physical inspection
- Multiple signers are in the same location
- Technology barriers exist for any participants
- Personal guidance through complex documents is needed
- State or county recording offices require traditional notarization

## The Remote Online Notarization Process

The typical RON process includes:

1. **Scheduling**: Book an appointment with an online notary
2. **Document submission**: Upload documents to the notary's secure platform
3. **Identity verification**: Complete knowledge-based authentication questions and ID verification
4. **Video session**: Connect with the notary via secure video conference
5. **Electronic signing**: Sign documents electronically during the video session
6. **Notarization**: The notary applies their electronic seal and signature
7. **Document delivery**: Receive the completed documents electronically

## Our Notary Services

At Houston Mobile Notary Pros, we offer both traditional mobile notary services and Remote Online Notarization options to meet your specific needs. Our commissioned online notaries use secure, compliant platforms to ensure your documents are legally notarized while providing maximum convenience.

Contact us today to discuss which notarization method is best for your specific documents and situation!
    `,
    date: "2023-03-05",
    author: blogAuthors["john-doe"],
    categories: ["industry-news", "notary-basics"],
    tags: ["remote notarization", "online notary", "digital notary", "technology"],
    image: "/placeholder.svg?height=600&width=1200",
    readTime: 6,
    views: 1120,
  },
  {
    id: "5",
    slug: "notary-fees-texas-explained",
    title: "Notary Fees in Texas Explained: What You Should Expect to Pay",
    description:
      "A breakdown of standard notary fees in Texas and what factors affect pricing for mobile notary services.",
    content: `
# Notary Fees in Texas Explained: What You Should Expect to Pay

Understanding notary fees in Texas can help you budget appropriately for your document needs. This guide breaks down standard fees, additional charges, and what factors influence the cost of notary services.

## Standard Texas Notary Fees

Texas law sets maximum fees that notaries can charge for standard services:

- **For acknowledging or proving a signature**: Up to $6 for the first signature and up to $1 for each additional signature
- **For administering an oath or affirmation**: Up to $6
- **For taking a deposition**: Fees vary based on complexity
- **For certifying a copy**: Up to $6
- **For protesting a bill or note**: Up to $4

## Mobile Notary Service Fees

Mobile notary services typically charge additional fees beyond the basic notarial acts:

### Travel Fees
- Based on distance traveled
- May be calculated per mile or as a flat fee for service areas
- Typically ranges from $25-$75 depending on location and urgency

### Appointment Fees
- Base fee for the convenience of coming to your location
- Typically ranges from $35-$75

### After-Hours Fees
- Additional charges for evenings, weekends, or holidays
- Typically adds $25-$50 to standard rates

## Specialized Notary Services

Specialized services often command higher fees:

### Loan Signing Services
- More complex and time-consuming
- Requires specialized knowledge
- Typically ranges from $125-$200 per signing

### Real Estate Document Packages
- Multiple documents requiring notarization
- Often includes travel to closing location
- Typically ranges from $100-$175

### Emergency/Same-Day Services
- Premium for urgent requests
- Typically adds $50-$100 to standard rates

## What's Included in Quality Mobile Notary Service

When paying for professional mobile notary service, you're getting:

1. **Convenience**: Service at your location of choice
2. **Expertise**: Knowledge of proper document execution
3. **Flexibility**: Appointments that fit your schedule
4. **Professionalism**: Properly executed notarizations
5. **Time savings**: No waiting in line or traveling to a notary

## Our Transparent Pricing Policy

At Houston Mobile Notary Pros, we believe in transparent pricing with no hidden fees. Our pricing structure includes:

- Clear base rates for different service types
- Upfront travel fees based on your location
- Discounts for multiple documents or signers at the same location
- No surprise charges after service is performed

## Getting the Best Value

To get the best value from your mobile notary service:

- Have all documents and signers ready
- Ensure all signers have proper identification
- Book in advance when possible
- Combine multiple notarizations in one appointment
- Ask about package pricing for multiple documents

Contact Houston Mobile Notary Pros today for a clear quote based on your specific notary needs!
    `,
    date: "2023-02-18",
    author: blogAuthors["jane-smith"],
    categories: ["business-tips", "notary-basics"],
    tags: ["notary fees", "pricing", "mobile notary cost", "budget planning"],
    image: "/placeholder.svg?height=600&width=1200",
    readTime: 5,
    views: 1340,
  },
  {
    id: "6",
    slug: "acceptable-id-for-notarization",
    title: "Acceptable Forms of ID for Notarization in Texas",
    description:
      "Learn what identification documents are acceptable for notarization in Texas and avoid common problems.",
    content: `
# Acceptable Forms of ID for Notarization in Texas

One of the most important aspects of the notarization process is proper identification. Texas has specific requirements for what constitutes acceptable identification for notarial acts. Understanding these requirements can help you avoid delays and complications.

## Primary Forms of Acceptable ID in Texas

Texas notaries can accept the following forms of identification:

### Government-Issued Photo IDs

- **Driver's license** issued by any U.S. state
- **State ID card** issued by any U.S. state
- **U.S. passport** or passport card
- **Foreign passport** stamped by U.S. Immigration
- **Military ID** with photo
- **Permanent resident card** or alien registration receipt card (Form I-551)
- **U.S. Certificate of Citizenship or Naturalization**
- **Texas License to Carry a Handgun or Concealed Handgun License**

## ID Requirements

For an ID to be acceptable, it must:

1. **Be current and valid** (not expired)
2. **Be government-issued**
3. **Contain a photograph** of the bearer
4. **Contain a physical description** of the bearer
5. **Contain the bearer's signature** (that the notary can compare)
6. **Be issued with an identifying number**

## Common ID Problems and Solutions

### Expired ID

**Problem**: Your ID is expired.
**Solution**: Renew your ID before seeking notarization. Texas notaries cannot accept expired identification.

### Name Discrepancy

**Problem**: Your name on the ID doesn't match the name on the document.
**Solution**: You may need to sign the document with the name exactly as it appears on your ID, and then add "also known as" (AKA) with your other name.

### No Acceptable ID

**Problem**: You don't have any of the acceptable forms of ID.
**Solution**: In limited circumstances, Texas allows for "credible witnesses" who have acceptable ID and can vouch for your identity. Both you and the witnesses must appear before the notary.

## Special Circumstances

### Minors

For minors who don't have government-issued photo ID, a parent or legal guardian with proper ID can establish the minor's identity.

### Elderly or Disabled Individuals

For those in care facilities who may have expired IDs, additional documentation may be required, such as:
- Facility-issued ID in conjunction with other identifying documents
- Credible witness testimony
- In some cases, a court order

## Preparing for Your Notary Appointment

To ensure a smooth notarization process:

1. **Check your ID before scheduling** to ensure it's valid and meets requirements
2. **Bring a backup form of ID** if you have concerns about your primary ID
3. **Don't sign the document before meeting with the notary**
4. **Inform the notary in advance** if you have special circumstances

## Our Commitment to Proper Identification

At Houston Mobile Notary Pros, we strictly adhere to Texas identification requirements to protect all parties from fraud while providing convenient mobile service. Our notaries are trained to properly verify identity while making the process as smooth as possible.

Contact us today to schedule your mobile notary appointment, and feel free to ask any questions about identification requirements for your specific situation.
    `,
    date: "2023-01-25",
    author: blogAuthors["john-doe"],
    categories: ["how-to-guides", "notary-basics"],
    tags: ["identification", "notary requirements", "ID verification", "fraud prevention"],
    image: "/placeholder.svg?height=600&width=1200",
    readTime: 6,
    views: 1680,
  },
]

// Export helper functions
export function getPostBySlug(slug: string): BlogPost | null {
  return blogPosts.find((post) => post.slug === slug) || null
}

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter((post) => post.featured)
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  return blogPosts
    .filter((p) => p.id !== post.id && p.categories.some((cat) => post.categories.includes(cat)))
    .slice(0, limit)
}

export function getPopularPosts(limit = 3): BlogPost[] {
  return [...blogPosts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, limit)
}

export function getRecentPosts(limit = 3): BlogPost[] {
  return [...blogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit)
}

// Cached versions of the functions
export async function getBlogPosts(): Promise<BlogPost[]> {
  const cacheKey = "blog:posts:all"

  return fetchWithCache(
    cacheKey,
    () => Promise.resolve(blogPosts),
    6 * 60 * 60 * 1000, // Cache for 6 hours
  )
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const cacheKey = `blog:posts:slug:${slug}`

  return fetchWithCache(
    cacheKey,
    () => Promise.resolve(getPostBySlug(slug)),
    6 * 60 * 60 * 1000, // Cache for 6 hours
  )
}

export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
  const cacheKey = `blog:posts:category:${category}`

  return fetchWithCache(
    cacheKey,
    () => Promise.resolve(blogPosts.filter((post) => post.categories.includes(category))),
    6 * 60 * 60 * 1000, // Cache for 6 hours
  )
}

export async function getBlogPostsByTag(tag: string): Promise<BlogPost[]> {
  const cacheKey = `blog:posts:tag:${tag}`

  return fetchWithCache(
    cacheKey,
    () => Promise.resolve(blogPosts.filter((post) => post.tags.includes(tag))),
    6 * 60 * 60 * 1000, // Cache for 6 hours
  )
}

export async function getRecentBlogPosts(limit = 3): Promise<BlogPost[]> {
  const cacheKey = `blog:posts:recent:${limit}`

  return fetchWithCache(
    cacheKey,
    () => Promise.resolve(getRecentPosts(limit)),
    6 * 60 * 60 * 1000, // Cache for 6 hours
  )
}

export async function getFeaturedBlogPosts(): Promise<BlogPost[]> {
  const cacheKey = "blog:posts:featured"

  return fetchWithCache(
    cacheKey,
    () => Promise.resolve(getFeaturedPosts()),
    6 * 60 * 60 * 1000, // Cache for 6 hours
  )
}

export async function getPopularBlogPosts(limit = 3): Promise<BlogPost[]> {
  const cacheKey = `blog:posts:popular:${limit}`

  return fetchWithCache(
    cacheKey,
    () => Promise.resolve(getPopularPosts(limit)),
    6 * 60 * 60 * 1000, // Cache for 6 hours
  )
}

export async function getRelatedBlogPosts(post: BlogPost, limit = 3): Promise<BlogPost[]> {
  const cacheKey = `blog:posts:related:${post.id}:${limit}`

  return fetchWithCache(
    cacheKey,
    () => Promise.resolve(getRelatedPosts(post, limit)),
    6 * 60 * 60 * 1000, // Cache for 6 hours
  )
}

export async function getBlogCategories(): Promise<
  Record<string, { name: string; description: string; slug: string }>
> {
  const cacheKey = "blog:categories"

  return fetchWithCache(
    cacheKey,
    () => Promise.resolve(blogCategories),
    24 * 60 * 60 * 1000, // Cache for 24 hours
  )
}

