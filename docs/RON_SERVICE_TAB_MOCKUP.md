# RON Service Tab Mockup

## Overview
This document provides a mockup for the Remote Online Notarization (RON) tab that will be added to the Services page between "Loan Signing" and "Estate Planning Package".

## UI Design

```jsx
<TabsContent value="ron" className="space-y-8">
  <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
    <div className="space-y-4">
      <h3 className="text-2xl font-serif font-semibold">Remote Online Notarization (RON)</h3>
      <p className="text-secondary/90">
        Notarize from anywhere via secure video. No travel, no waiting rooms — just your
        documents, your ID, and 10 minutes of your time.
      </p>
      <p className="text-secondary/80">
        Remote Online Notarization (RON) lets you get documents notarized from your phone, tablet,
        or computer — fully legal in Texas. We use knowledge-based authentication (KBA) and live
        AV recording to verify your identity and complete the signing securely. Sessions are 
        available same-day, 7am–9pm daily.
      </p>
      
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2 text-secondary">What you'll need</h4>
          <ul className="text-sm text-secondary/80 space-y-1">
            <li className="flex items-start">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              Government-issued photo ID
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              Device with camera & microphone
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              Your documents ready to upload
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              Internet connection
            </li>
          </ul>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2 text-secondary">Best for</h4>
          <ul className="text-sm text-secondary/80 space-y-1">
            <li className="flex items-start">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              Out-of-state signers
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              Remote work environments
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              Clients with limited mobility
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
              Time-sensitive documents
            </li>
          </ul>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-white"
          asChild
        >
          <Link href="/booking?mode=RON">Book a RON Session</Link>
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          className="border-primary text-primary"
          asChild
        >
          <Link href="/services/remote-online-notarization">Learn More</Link>
        </Button>
      </div>
    </div>
    
    <div className="relative rounded-xl overflow-hidden shadow-lg">
      <Image
        src="/services/ron-illustration.jpg"
        alt="Remote Online Notarization illustration showing a person using a laptop for video notary session"
        width={600}
        height={400}
        className="object-cover w-full"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6">
        <div className="text-white space-y-2">
          <div className="font-semibold text-xl">RON: $25/act · No travel fee</div>
          <p className="text-sm text-white/90">
            Sessions from $25 · Additional acts +$25 each · Available same-day
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge className="bg-white/20 text-white border-white/10">
              Credential Analysis
            </Badge>
            <Badge className="bg-white/20 text-white border-white/10">
              KBA Verification
            </Badge>
            <Badge className="bg-white/20 text-white border-white/10">
              Secure AV Recording
            </Badge>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div className="border-t border-gray-200 pt-8 mt-4">
    <h4 className="font-medium text-xl mb-6">How RON Works</h4>
    <div className="grid gap-6 md:grid-cols-4">
      <div className="bg-gray-50 rounded-lg p-5 relative">
        <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full absolute -top-4 left-5">
          1
        </div>
        <h5 className="font-medium mt-2 mb-2">Upload Documents</h5>
        <p className="text-sm text-secondary/80">
          Upload your documents during booking or share them securely before your session.
        </p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-5 relative">
        <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full absolute -top-4 left-5">
          2
        </div>
        <h5 className="font-medium mt-2 mb-2">Verify Identity</h5>
        <p className="text-sm text-secondary/80">
          Complete KBA (identity verification questions) and credential analysis of your ID.
        </p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-5 relative">
        <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full absolute -top-4 left-5">
          3
        </div>
        <h5 className="font-medium mt-2 mb-2">Video Session</h5>
        <p className="text-sm text-secondary/80">
          Connect with our notary via secure video call to complete the notarization.
        </p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-5 relative">
        <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full absolute -top-4 left-5">
          4
        </div>
        <h5 className="font-medium mt-2 mb-2">Receive Documents</h5>
        <p className="text-sm text-secondary/80">
          Get your digitally notarized documents delivered instantly via email.
        </p>
      </div>
    </div>
  </div>
  
  <div className="bg-gray-50 rounded-xl p-6 mt-6">
    <h4 className="font-medium text-lg mb-4">Common Questions About RON</h4>
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <h5 className="font-medium text-secondary">Is RON legally valid in Texas?</h5>
        <p className="text-sm text-secondary/80 mt-1">
          Yes, Remote Online Notarization is fully legal in Texas under HB 1217. Documents notarized online have the same legal validity as in-person notarization.
        </p>
      </div>
      
      <div>
        <h5 className="font-medium text-secondary">What types of documents can be notarized online?</h5>
        <p className="text-sm text-secondary/80 mt-1">
          Most common documents can be notarized online, including affidavits, powers of attorney, and many real estate documents. Some exceptions apply for wills and certain court documents.
        </p>
      </div>
      
      <div>
        <h5 className="font-medium text-secondary">Do I need to be in Texas?</h5>
        <p className="text-sm text-secondary/80 mt-1">
          No, you can be anywhere in the world. The notary must be commissioned in Texas, but signers can be in any location as long as the document falls under Texas jurisdiction.
        </p>
      </div>
      
      <div>
        <h5 className="font-medium text-secondary">What is KBA verification?</h5>
        <p className="text-sm text-secondary/80 mt-1">
          Knowledge-Based Authentication (KBA) verifies your identity through multiple-choice questions based on your personal history, such as previous addresses or vehicles owned.
        </p>
      </div>
    </div>
    
    <div className="mt-6">
      <Link href="/faq#ron" className="text-primary hover:text-primary/80 text-sm font-medium">
        View all RON FAQs →
      </Link>
    </div>
  </div>
</TabsContent>
```

## Design Notes

1. **Layout Structure:**
   - Two-column layout for intro section
   - Four-column process steps
   - Two-column FAQ preview

2. **Key Components:**
   - Service description
   - Requirements and use cases
   - Pricing information
   - Step-by-step process
   - FAQ preview
   - CTAs (Book and Learn More)

3. **Styling:**
   - Consistent with existing tab designs
   - Uses the same color scheme and typography
   - Maintains responsive design for all screen sizes

4. **Content Focus:**
   - Clear explanation of what RON is
   - Emphasis on convenience and legality
   - Transparent pricing
   - Simple process steps

5. **Call-to-Actions:**
   - Primary: "Book a RON Session" (links to booking form with RON mode)
   - Secondary: "Learn More" (links to dedicated RON service page)
   - Tertiary: "View all RON FAQs" (links to FAQ page with RON section)

## Implementation Notes

1. The mockup uses existing UI components:
   - `TabsContent` from the UI library
   - `Button` component
   - `Badge` component
   - `Link` component from Next.js
   - `Image` component from Next.js

2. Required assets:
   - Add a RON illustration image at `/public/services/ron-illustration.jpg`

3. Icons:
   - Import `CheckCircleIcon` from heroicons