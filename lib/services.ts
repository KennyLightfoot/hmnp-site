import { fetchWithCache } from "@/lib/cache-utils"
import type { Service, ServiceCategory } from "@/lib/service-types"

// Export the services array
export const services: Service[] = [
  {
    id: "1",
    slug: "mobile-notary-services",
    title: "Mobile Notary Services",
    description: "Professional notary services at your location, including homes, offices, hospitals, and more.",
    content: `
# Mobile Notary Services in Houston

Our mobile notary service brings professional notarization directly to you. Whether you're at home, in the office, at a hospital, or any other location in the Houston area, our certified notaries will travel to meet you at a time that fits your schedule.

## What We Offer

- **Convenience**: No need to travel or take time off work
- **Flexibility**: Evening and weekend appointments available
- **Professionalism**: Experienced notaries who understand proper document execution
- **Reliability**: On-time service with clear communication
- **Efficiency**: Quick turnaround for urgent document needs

## Documents We Commonly Notarize

- Real estate documents
- Power of Attorney
- Medical directives
- Affidavits
- Loan documents
- Wills and trusts
- Business agreements
- Auto title transfers
- Permission for minor travel
- And many more

## How It Works

1. **Contact us**: Call, email, or use our online booking system
2. **Schedule**: Set up a convenient time and location
3. **Preparation**: We'll advise on any document requirements
4. **Meeting**: Our notary arrives at your location
5. **Notarization**: Documents are properly executed and notarized
6. **Completion**: You receive your notarized documents immediately

## Service Area

We serve the entire Houston metropolitan area, including:

- Downtown Houston
- The Heights
- Montrose
- River Oaks
- Memorial
- West University
- Bellaire
- Sugar Land
- Katy
- The Woodlands
- Pearland
- Clear Lake
- And surrounding communities

## Why Choose Our Mobile Notary Service

- **Experience**: Our notaries have processed thousands of documents
- **Knowledge**: We understand complex documents and requirements
- **Convenience**: We work around your schedule, not the other way around
- **Peace of mind**: Proper notarization protects your important transactions

Contact us today to schedule your mobile notary appointment!
    `,
    image: "/placeholder.svg?height=600&width=800",
    icon: "car",
    category: "general",
    featured: true,
    pricing: {
      type: "variable",
      startingAt: 60,
      description: "Starting at $60, varies based on location and document complexity",
    },
    faqs: [
      {
        question: "How much notice do you need for a mobile notary appointment?",
        answer:
          "While we can often accommodate same-day requests, we recommend booking 24-48 hours in advance when possible. For urgent needs, please call us directly.",
      },
      {
        question: "What forms of payment do you accept?",
        answer: "We accept cash, credit cards, Venmo, Zelle, and PayPal. Payment is due at the time of service.",
      },
      {
        question: "Do I need to prepare anything before the notary arrives?",
        answer:
          "Please have all documents ready but unsigned. All signers must be present with valid government-issued photo ID. Let us know in advance how many signatures need notarization.",
      },
      {
        question: "How long does a typical notarization take?",
        answer:
          "Most appointments take 15-30 minutes, depending on the number of signatures required. Loan signings typically take 30-60 minutes.",
      },
      {
        question: "What if I need to reschedule my appointment?",
        answer:
          "Please give us as much notice as possible if you need to reschedule. We understand that circumstances change and will work with you to find a new time.",
      },
    ],
  },
  {
    id: "2",
    slug: "loan-signing-services",
    title: "Loan Signing Services",
    description: "Specialized notary services for mortgage closings, refinances, and other loan documents.",
    content: `
# Loan Signing Services in Houston

Our professional loan signing agents provide specialized notary services for mortgage closings, refinances, and other loan documents. We understand the importance of these transactions and ensure they're executed properly and efficiently.

## Our Loan Signing Expertise

- **Purchase Mortgages**: Complete closing packages for home purchases
- **Refinances**: Documentation for home loan refinancing
- **Home Equity Loans**: HELOC and home equity loan closings
- **Reverse Mortgages**: Specialized handling of reverse mortgage documents
- **Commercial Loans**: Business and commercial property loan closings

## Why Choose a Certified Loan Signing Agent

Loan documents are complex and require special knowledge. Our Notary Signing Agents:

- Are certified and background-checked
- Understand mortgage and loan terminology
- Can explain document purposes (without giving legal advice)
- Know the proper execution requirements for each document
- Ensure all signatures, initials, and notarizations are properly placed
- Maintain confidentiality and security of sensitive financial information

## The Loan Signing Process

1. **Appointment scheduling**: We coordinate with you, your lender, and/or title company
2. **Document preparation**: We receive and review documents before the appointment
3. **Signing meeting**: We guide you through each document requiring signature
4. **Document verification**: We ensure all documents are properly executed
5. **Document return**: We return the completed package to the appropriate parties

## Flexible Scheduling

We understand that loan closings often operate on tight timelines. We offer:

- Same-day service when available
- Evening appointments
- Weekend appointments
- Rush service for time-sensitive closings

## Service Area

We provide loan signing services throughout the Houston metropolitan area, including all surrounding communities and suburbs.

## Our Commitment

- **Accuracy**: Every document properly executed
- **Timeliness**: Punctual service and prompt document return
- **Professionalism**: Clear communication and respectful service
- **Convenience**: We come to your home, office, or preferred location
- **Confidentiality**: Your personal and financial information remains secure

Contact us today to schedule your loan signing appointment or to learn more about our services!
    `,
    image: "/placeholder.svg?height=600&width=800",
    icon: "file-text",
    category: "specialized",
    featured: true,
    pricing: {
      type: "fixed",
      price: 150,
      description: "$150 flat fee for standard loan signing packages",
    },
    faqs: [
      {
        question: "How long does a loan signing appointment take?",
        answer:
          "Most loan signings take 30-60 minutes, depending on the number of documents and questions you may have.",
      },
      {
        question: "Do all parties need to be present for a loan signing?",
        answer:
          "Yes, all borrowers listed on the loan documents must be present with valid government-issued photo ID.",
      },
      {
        question: "Can you explain the loan documents to me?",
        answer:
          "As a notary signing agent, we can explain what each document is and where to sign, but cannot provide legal or financial advice about the terms of your loan.",
      },
      {
        question: "What happens after the signing is complete?",
        answer:
          "After all documents are signed, we'll return them to your lender or title company according to their instructions. This is typically done via overnight delivery or electronic return.",
      },
      {
        question: "What if there's an error in my loan documents?",
        answer:
          "If you notice any errors in your loan documents, we'll note your concerns and can help you communicate with your lender. However, we cannot make changes to the documents ourselves.",
      },
    ],
  },
  {
    id: "3",
    slug: "real-estate-document-services",
    title: "Real Estate Document Services",
    description: "Notarization for deeds, mortgages, affidavits, and other real estate documents.",
    content: `
# Real Estate Document Services in Houston

Our specialized real estate document services provide professional notarization for all types of property transactions. We understand the legal requirements for real estate documents in Texas and ensure they're properly executed.

## Real Estate Documents We Notarize

- **Deeds**: Warranty deeds, quitclaim deeds, special warranty deeds
- **Mortgage Documents**: Mortgages, deeds of trust, promissory notes
- **Affidavits**: Affidavits of title, heirship, identity
- **Closing Documents**: Settlement statements, closing disclosures
- **Property Transfers**: Interspousal transfers, transfers to trusts
- **Leases**: Commercial and residential lease agreements
- **Lien Documents**: Lien releases, subordination agreements
- **HOA Documents**: HOA-related certifications and affidavits

## Why Proper Notarization Matters for Real Estate

Real estate transactions involve significant assets and legal rights. Proper notarization:

- Verifies the identity of signers
- Helps prevent fraud
- Creates legally binding documents
- Ensures documents can be recorded with county offices
- Protects all parties in the transaction

## Our Real Estate Document Process

1. **Document review**: We help identify which documents require notarization
2. **Identity verification**: We verify all signers with proper government ID
3. **Proper execution**: We ensure documents are signed correctly
4. **Official notarization**: We apply our notary seal and signature
5. **Recording guidance**: We can advise on document recording requirements

## Convenient Service Options

- **Mobile service**: We come to your home, office, or closing location
- **Flexible scheduling**: Evening and weekend appointments available
- **Quick turnaround**: Same-day and next-day appointments often available
- **Multiple signers**: We can coordinate notarization with multiple parties

## Our Real Estate Expertise

Our notaries have extensive experience with Texas real estate documents and understand:

- Texas-specific notarial requirements
- Property deed execution requirements
- Mortgage document standards
- Recording office requirements
- Common real estate document issues

## Service Area

We provide real estate document services throughout Houston and surrounding areas, including all local counties where your documents may need to be recorded.

Contact us today to schedule your real estate document notarization or to learn more about our services!
    `,
    image: "/placeholder.svg?height=600&width=800",
    icon: "home",
    category: "specialized",
    featured: false,
    pricing: {
      type: "variable",
      startingAt: 75,
      description: "Starting at $75, varies based on document complexity and location",
    },
    faqs: [
      {
        question: "Do all real estate documents need to be notarized?",
        answer:
          "Not all real estate documents require notarization, but many important ones do, including deeds, mortgages, and certain affidavits. We can help you determine which documents in your package need notarization.",
      },
      {
        question: "Can you help with recording documents after notarization?",
        answer:
          "While we don't directly record documents with the county, we can provide guidance on the recording process and requirements. The actual recording is typically handled by a title company or attorney.",
      },
      {
        question: "What ID is required for real estate document notarization?",
        answer:
          "All signers must present a valid, government-issued photo ID such as a driver's license, passport, or state ID card. The name on your ID must match the name on the documents.",
      },
      {
        question: "Can you notarize documents for property outside of Texas?",
        answer:
          "Yes, we can notarize documents for property located in other states, as long as the notarization takes place in Texas. However, some states have specific requirements, so please let us know in advance.",
      },
      {
        question: "What if someone on the deed cannot be present for notarization?",
        answer:
          "All parties named on a deed or mortgage typically need to sign in the presence of a notary. If someone cannot be present, they may need to sign with a different notary or consider options like power of attorney. We can discuss your specific situation.",
      },
    ],
  },
  {
    id: "4",
    slug: "apostille-services",
    title: "Apostille Services",
    description:
      "Document authentication services for international use, including apostille and embassy legalization.",
    content: `
# Apostille and Document Authentication Services

Our apostille services help you authenticate documents for use in foreign countries. Whether you need documents for immigration, business, education, or personal matters, we can guide you through the authentication process.

## What is an Apostille?

An apostille is a certificate that authenticates the origin of a public document for use in countries that participate in the Hague Apostille Convention. It's essentially an international notarization that verifies your document will be recognized in foreign countries.

## Documents We Can Help Authenticate

- **Vital Records**: Birth certificates, death certificates, marriage certificates
- **Educational Documents**: Diplomas, transcripts, degrees, school records
- **Legal Documents**: Power of attorney, affidavits, court judgments
- **Business Documents**: Articles of incorporation, certificates of good standing, commercial documents
- **Personal Documents**: Background checks, adoption papers, immigration documents

## Our Apostille Process

1. **Document evaluation**: We determine if your document qualifies for apostille
2. **Notarization**: If required, we notarize the document (some documents must be notarized before apostille)
3. **Document preparation**: We prepare your document according to state requirements
4. **Submission**: We submit your document to the appropriate Secretary of State office
5. **Authentication**: We obtain the apostille certificate
6. **Return delivery**: We deliver the authenticated document back to you

## Additional Authentication Services

- **Embassy Legalization**: For countries not part of the Hague Convention
- **Document Translation**: Certified translations for foreign-language documents
- **Document Certification**: Creating certified copies of original documents
- **Consular Authentication**: Additional authentication through consulates

## Why Choose Our Apostille Services

- **Experience**: We understand the specific requirements for different countries
- **Efficiency**: We know how to navigate government processes quickly
- **Accuracy**: We ensure documents are prepared correctly the first time
- **Convenience**: We handle the entire process so you don't have to
- **Peace of mind**: Your important documents are handled professionally

## Timeframes and Expedited Service

Standard apostille processing typically takes 1-3 weeks depending on the state and document type. We also offer expedited service for time-sensitive needs.

Contact us today to discuss your document authentication needs and get a personalized quote for your specific situation!
    `,
    image: "/placeholder.svg?height=600&width=800",
    icon: "globe",
    category: "specialized",
    featured: false,
    pricing: {
      type: "variable",
      startingAt: 125,
      description: "Starting at $125, varies based on document type and processing time",
    },
    faqs: [
      {
        question: "What countries require an apostille?",
        answer:
          "Apostilles are recognized by countries that are members of the Hague Apostille Convention, which includes over 100 countries. For non-member countries, different authentication procedures may be required.",
      },
      {
        question: "How long does the apostille process take?",
        answer:
          "Standard processing typically takes 1-3 weeks. Expedited service is available for an additional fee and can reduce the timeframe to 2-5 business days in many cases.",
      },
      {
        question: "Do I need to provide the original document for an apostille?",
        answer:
          "In most cases, yes. Government-issued documents like birth certificates and marriage certificates must be originals or certified copies from the issuing agency. For some documents, certified copies may be acceptable.",
      },
      {
        question: "Can you apostille documents from any state?",
        answer:
          "Documents must be apostilled by the Secretary of State in the state where they were issued. We can facilitate apostilles for documents from any state, though documents from states other than Texas may require additional time.",
      },
      {
        question: "What information do I need to provide for apostille services?",
        answer:
          "We'll need to know the country where the document will be used, the type of document, how quickly you need it processed, and your contact information. We'll provide a detailed checklist based on your specific needs.",
      },
    ],
  },
  {
    id: "5",
    slug: "will-signing-services",
    title: "Will Signing Services",
    description: "Professional notarization for wills, trusts, and estate planning documents.",
    content: `
# Will Signing and Estate Document Services

Our will signing services provide professional assistance with the proper execution of wills, trusts, and other estate planning documents. We ensure these important documents are signed and witnessed according to Texas law.

## Estate Documents We Handle

- **Last Will and Testament**: Traditional and holographic wills
- **Living Trusts**: Revocable and irrevocable trust documents
- **Power of Attorney**: Financial and medical powers of attorney
- **Medical Directives**: Living wills and advance healthcare directives
- **Guardianship Designations**: Documents appointing guardians for minor children
- **Property Transfers**: Deeds transferring property to or from trusts
- **Beneficiary Designations**: Forms designating inheritance recipients

## The Importance of Proper Execution

Estate documents must be executed according to specific legal requirements to be valid. Improper execution can lead to:

- Documents being declared invalid
- Probate complications
- Family disputes
- Unintended distribution of assets
- Court challenges to your wishes

## Our Will Signing Process

1. **Preparation consultation**: We discuss your needs and document requirements
2. **Witness coordination**: We can provide witnesses if needed (required for wills in Texas)
3. **Signing ceremony**: We facilitate the formal signing with all required parties
4. **Proper notarization**: We notarize documents according to legal requirements
5. **Document verification**: We ensure all signatures and witness requirements are met

## Special Considerations We Address

- **Testamentary capacity**: Ensuring signers understand the documents
- **Witness requirements**: Providing disinterested witnesses when needed
- **Self-proving affidavits**: Adding these to wills to simplify probate
- **Multiple originals**: Creating duplicate originals when appropriate
- **Document storage guidance**: Advising on safe storage of original documents

## Mobile Service for Estate Planning

We understand that estate planning often involves:

- Multiple family members who need to be present
- Elderly or ill individuals who cannot travel easily
- Coordination with attorneys who may attend remotely
- Sensitive discussions best held in private settings

Our mobile service comes to your home, attorney's office, hospital, care facility, or other location of your choice.

## Legal Compliance

While we do not provide legal advice, our notaries understand Texas requirements for:

- Will execution formalities
- Witness qualifications
- Notarial acts for estate documents
- Self-proving affidavit requirements

Contact us today to schedule your will signing appointment or to learn more about our estate document services!
    `,
    image: "/placeholder.svg?height=600&width=800",
    icon: "file-text",
    category: "specialized",
    featured: false,
    pricing: {
      type: "fixed",
      price: 100,
      description: "$100 flat fee for standard will signing package including witnesses",
    },
    faqs: [
      {
        question: "Does a will need to be notarized in Texas?",
        answer:
          "In Texas, a will doesn't legally require notarization to be valid. However, adding a self-proving affidavit (which does require notarization) makes the probate process much easier. Most attorneys recommend this approach.",
      },
      {
        question: "Can you provide witnesses for my will signing?",
        answer:
          "Yes, we can provide disinterested witnesses for your will signing. Texas requires two witnesses for a standard will. Our service includes witnesses if needed.",
      },
      {
        question: "What ID is required for will signings?",
        answer:
          "All signers must present valid government-issued photo identification. Witnesses must also provide identification.",
      },
      {
        question: "Can you notarize a will for someone in a hospital or nursing home?",
        answer:
          "Yes, we regularly provide will signing services at hospitals, nursing homes, and assisted living facilities. We take extra care to ensure the signing is conducted properly in these settings.",
      },
      {
        question: "Do you prepare the will documents?",
        answer:
          "No, we do not prepare legal documents or provide legal advice. You should have your will and estate documents prepared by an attorney before our appointment. We focus solely on the proper execution and notarization of documents that have already been prepared.",
      },
    ],
  },
  {
    id: "6",
    slug: "business-document-services",
    title: "Business Document Services",
    description: "Notarization for corporate documents, contracts, agreements, and other business paperwork.",
    content: `
# Business Document Notary Services

Our business document services provide professional notarization for corporations, LLCs, partnerships, and sole proprietorships. We understand the importance of properly executed business documents and offer convenient mobile service at your office or business location.

## Business Documents We Notarize

- **Formation Documents**: Articles of incorporation, operating agreements, partnership agreements
- **Corporate Resolutions**: Board resolutions, shareholder resolutions, banking resolutions
- **Contracts and Agreements**: Business contracts, service agreements, non-disclosure agreements
- **Commercial Leases**: Lease agreements, amendments, and related documents
- **Loan Documents**: Business loans, commercial mortgages, equipment financing
- **Affidavits**: Business affidavits, statements of facts
- **International Business Documents**: Documents requiring apostille or authentication
- **Regulatory Filings**: Documents for state and federal regulatory compliance

## Benefits for Businesses

- **Convenience**: We come to your office during business hours
- **Efficiency**: No need for employees to leave work for notarization
- **Professionalism**: Experienced notaries familiar with business documents
- **Flexibility**: Early morning, lunch hour, or after-hours appointments
- **Reliability**: On-time service that respects your schedule

## Our Business Notary Process

1. **Scheduling**: Easy online scheduling or phone booking
2. **Preparation**: Clear instructions on document requirements
3. **On-site service**: We arrive at your location with all necessary supplies
4. **Efficient execution**: Quick, professional notarization
5. **Proper documentation**: All notarial acts properly recorded

## Volume Discounts and Corporate Accounts

For businesses with regular notary needs, we offer:

- Volume discounts for multiple documents
- Corporate account setup for simplified billing
- Scheduled recurring visits for regular notary needs
- Priority scheduling for urgent business matters

## Industries We Serve

- Legal firms
- Real estate companies
- Financial institutions
- Healthcare organizations
- Technology companies
- Manufacturing businesses
- Construction firms
- Professional service providers
- Non-profit organizations

## Additional Business Services

- **Witness provision**: When witnesses are required for documents
- **Document delivery**: Secure delivery options after notarization
- **Bulk processing**: Efficient handling of multiple documents
- **After-hours service**: Evening and weekend appointments

Contact us today to discuss your business notary needs or to set up a corporate account for ongoing services!
    `,
    image: "/placeholder.svg?height=600&width=800",
    icon: "briefcase",
    category: "general",
    featured: false,
    pricing: {
      type: "variable",
      startingAt: 75,
      description: "Starting at $75, with volume discounts available for multiple documents",
    },
    faqs: [
      {
        question: "Can you notarize documents for multiple employees during one visit?",
        answer:
          "Yes, we can notarize documents for multiple employees during a single visit. This is an efficient way to handle company-wide notary needs, and volume discounts may apply.",
      },
      {
        question: "Do you offer regular scheduled visits for businesses with ongoing notary needs?",
        answer:
          "Yes, we can arrange regular scheduled visits (weekly, bi-weekly, monthly) for businesses with consistent notary requirements. Please contact us to set up a corporate service schedule.",
      },
      {
        question: "Can you notarize documents that will be used internationally for our business?",
        answer:
          "Yes, we can notarize business documents that will be used internationally. For documents requiring additional authentication like an apostille, we offer those services as well.",
      },
      {
        question: "What business ID or credentials do you need to see?",
        answer:
          "For business documents, we need to verify the identity of the individual signers with government-issued photo ID. We may also need to see corporate credentials or authorization documents depending on the type of document being notarized.",
      },
      {
        question: "Can you help with notarizing corporate documents for a new business formation?",
        answer:
          "Yes, we regularly assist with notarizing documents for new business formations, including articles of incorporation, operating agreements, and banking resolutions. We understand the time-sensitive nature of these documents.",
      },
    ],
  },
  {
    id: "7",
    slug: "i9-verification-services",
    title: "I-9 Verification Services",
    description: "Authorized representative services for remote I-9 employment eligibility verification.",
    content: `
# I-9 Verification Services for Employers

Our I-9 verification services provide authorized representative assistance for employers who need to complete Form I-9 for remote employees. We help ensure compliance with employment eligibility verification requirements while making the process convenient for both employers and employees.

## What We Offer

- **Authorized Representative Service**: We act as the employer's authorized representative to complete Section 2 of Form I-9
- **Document Verification**: In-person verification of employee identity and employment authorization documents
- **Compliance Expertise**: Knowledge of proper I-9 completion requirements
- **Convenient Locations**: We meet employees at their location
- **Quick Turnaround**: Timely completion to meet employment deadlines

## The I-9 Verification Process

1. **Employer preparation**: Employer completes Section 1 with the employee remotely
2. **Scheduling**: We schedule a convenient time to meet the employee
3. **Document review**: We examine the employee's original identity and employment authorization documents
4. **Section 2 completion**: We complete Section 2 as the employer's authorized representative
5. **Document return**: We return the completed I-9 to the employer

## Documents We Can Verify

We can verify all documents on the USCIS Lists of Acceptable Documents, including:

- **List A documents**: U.S. Passport, Permanent Resident Card, Employment Authorization Document
- **List B documents**: Driver's license, ID card, school ID with photograph
- **List C documents**: Social Security card, birth certificate, Native American tribal document

## Benefits of Our I-9 Service

- **Compliance**: Helps ensure proper completion of the Form I-9
- **Convenience**: Eliminates the need for remote employees to travel to the employer's location
- **Efficiency**: Streamlines the onboarding process for remote workers
- **Expertise**: Reduces the risk of errors in the verification process
- **Geographic flexibility**: Supports hiring in multiple locations

## Who Needs This Service

- Companies hiring remote employees
- Businesses with multiple locations
- Organizations with distributed workforces
- Companies onboarding employees in new geographic areas
- HR departments managing remote hiring

## Legal Compliance Note

While we provide authorized representative services, the employer remains responsible for ensuring the proper completion of Form I-9 and compliance with employment eligibility verification requirements.

Contact us today to schedule I-9 verification services or to learn more about how we can assist with your remote employee onboarding!
    `,
    image: "/placeholder.svg?height=600&width=800",
    icon: "clipboard-check",
    category: "specialized",
    featured: false,
    pricing: {
      type: "fixed",
      price: 85,
      description: "$85 flat fee per I-9 verification, with volume discounts available",
    },
    faqs: [
      {
        question: "How quickly can you complete an I-9 verification?",
        answer:
          "We can typically schedule I-9 verifications within 24-48 hours of request. For urgent needs, same-day service may be available in some areas for an additional fee.",
      },
      {
        question: "Does the employee need to prepare anything for the I-9 verification meeting?",
        answer:
          "The employee should have completed Section 1 of Form I-9 prior to our meeting and must bring original unexpired documents from the Lists of Acceptable Documents (either one document from List A or one document each from List B and List C).",
      },
      {
        question: "Can you complete I-9 verifications for multiple employees at the same location?",
        answer:
          "Yes, we can verify documents for multiple employees during a single visit, which is often more cost-effective for employers onboarding several remote employees in the same area.",
      },
      {
        question: "How do you handle the completed I-9 form?",
        answer:
          "After completing Section 2 as your authorized representative, we can securely return the form to the employer via their preferred method (secure email, upload to their system, or physical delivery if required).",
      },
      {
        question: "Are you familiar with the current I-9 requirements and acceptable documents?",
        answer:
          "Yes, we stay current with USCIS requirements and updates to the Form I-9 process. We are familiar with all acceptable documents and verification requirements.",
      },
    ],
  },
  {
    id: "8",
    slug: "hospital-and-medical-facility-services",
    title: "Hospital & Medical Facility Services",
    description: "Specialized notary services for patients in hospitals, nursing homes, and medical facilities.",
    content: `
# Hospital and Medical Facility Notary Services

Our specialized hospital notary services provide compassionate, professional notarization for patients in hospitals, nursing homes, rehabilitation centers, and other medical facilities. We understand the unique challenges of these environments and offer respectful service tailored to healthcare settings.

## Medical Documents We Notarize

- **Advance Directives**: Living wills and healthcare directives
- **Medical Power of Attorney**: Healthcare proxy designations
- **HIPAA Authorizations**: Medical information release forms
- **Medical Consent Forms**: Treatment authorization documents
- **Insurance Documents**: Health insurance claims and forms
- **Property Documents**: Real estate and property transfers for patients
- **Financial Documents**: Banking and financial paperwork
- **Estate Planning**: Wills, trusts, and related documents

## Our Hospital Notary Approach

- **Respectful service**: Quiet, patient interaction appropriate for medical settings
- **Flexible timing**: Scheduling around medical procedures and rest periods
- **Infection control**: Adherence to facility protocols and hygiene standards
- **Privacy awareness**: Maintaining confidentiality in shared rooms
- **Accommodation**: Adapting to patient mobility and positioning needs
- **Family coordination**: Working with family members and healthcare proxies when appropriate

## Special Considerations We Address

- **Capacity assessment**: Working with healthcare providers to ensure patient capacity
- **Witness coordination**: Providing witnesses when needed (avoiding staff as witnesses)
- **Bedside service**: Comfortable document execution for bedridden patients
- **Medical interruptions**: Patience with care-related interruptions
- **Emotional sensitivity**: Compassionate service during difficult circumstances

## Facility Coordination

We work directly with:

- Hospital social workers
- Nursing staff
- Patient advocates
- Facility administrators
- Risk management departments
- Hospital legal departments

## Service Area

We serve all major hospitals, medical centers, nursing homes, rehabilitation facilities, hospice centers, and assisted living communities throughout the Houston metropolitan area.

## Appointment Scheduling

- **Urgent service**: Same-day appointments often available
- **Pre-scheduled visits**: Coordination with medical staff and family
- **Discharge planning**: Notarization before patient discharge
- **After-hours service**: Evening and weekend appointments

Contact us today to schedule hospital notary services or to establish an ongoing relationship with your healthcare facility!
    `,
    image: "/placeholder.svg?height=600&width=800",
    icon: "stethoscope",
    category: "specialized",
    featured: false,
    pricing: {
      type: "fixed",
      price: 95,
      description: "$95 flat fee for hospital and medical facility visits",
    },
    faqs: [
      {
        question: "How do you handle notarizations for patients who have physical limitations?",
        answer:
          "For patients with physical limitations, we can accommodate various signing methods, including signature stamps or making a mark with a witness. We work closely with medical staff to ensure the process is comfortable for the patient while meeting legal requirements.",
      },
      {
        question: "Do you need permission from the hospital or facility before coming?",
        answer:
          "While patients have the right to visitors including notaries, we recommend coordinating with nursing staff or administration before arrival. This ensures a smooth process and compliance with facility protocols. We're experienced in working with healthcare facilities.",
      },
      {
        question: "What if the patient is unable to communicate clearly?",
        answer:
          "If a patient cannot communicate clearly, we may not be able to proceed with notarization. Notarial acts require the signer to communicate their awareness and willingness. We can consult with medical staff and family to determine the best course of action.",
      },
      {
        question: "Can family members sign documents on behalf of the patient?",
        answer:
          "Family members can only sign on behalf of a patient if they have proper legal authority (such as power of attorney). Otherwise, the patient must sign their own documents. We can help determine the appropriate approach based on the specific situation and documents.",
      },
      {
        question: "How quickly can you come to a hospital for an urgent notarization?",
        answer:
          "For urgent hospital situations, we prioritize these appointments and can often arrive within 2-3 hours in the Houston metro area. Please call rather than book online for urgent hospital requests so we can expedite service.",
      },
    ],
  },
]

// Export helper functions
export function getServiceBySlug(slug: string): Service | null {
  return services.find((service) => service.slug === slug) || null
}

export function getServicesByCategory(category: ServiceCategory): Service[] {
  return services.filter((service) => service.category === category)
}

export function getFeaturedServices(): Service[] {
  return services.filter((service) => service.featured)
}

// Cached versions of the functions
export async function getServices(): Promise<Service[]> {
  const cacheKey = "services:all"

  return fetchWithCache(
    cacheKey,
    () => Promise.resolve(services),
    24 * 60 * 60 * 1000, // Cache for 24 hours
  )
}

export async function getCachedServiceBySlug(slug: string): Promise<Service | null> {
  const cacheKey = `services:slug:${slug}`

  return fetchWithCache(
    cacheKey,
    () => Promise.resolve(getServiceBySlug(slug)),
    24 * 60 * 60 * 1000, // Cache for 24 hours
  )
}

export async function getCachedServicesByCategory(category: ServiceCategory): Promise<Service[]> {
  const cacheKey = `services:category:${category}`

  return fetchWithCache(
    cacheKey,
    () => Promise.resolve(getServicesByCategory(category)),
    24 * 60 * 60 * 1000, // Cache for 24 hours
  )
}

export async function getCachedFeaturedServices(): Promise<Service[]> {
  const cacheKey = "services:featured"

  return fetchWithCache(
    cacheKey,
    () => Promise.resolve(getFeaturedServices()),
    24 * 60 * 60 * 1000, // Cache for 24 hours
  )
}

