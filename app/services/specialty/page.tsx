import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Award, ChevronRight, AlertCircle, FileText, Globe, Clock, Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Specialty Notary Services",
  description:
    "Specialized notary services including apostille, background check verification, wedding certificate expediting, and medallion signatures throughout the Houston area.",
}

export default function SpecialtyServicesPage() {
  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <section className="py-12 bg-accent text-accent-foreground">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Specialty Notary Services</h1>
              <p className="text-lg mb-6">
                Beyond standard notarization, we offer specialized services to meet your unique needs. From apostille
                services to medallion signatures, we provide expert assistance for specialized document requirements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-primary text-primary-foreground">
                  <Link href="/booking" className="flex items-center">
                    Book Now <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link href="/contact" className="flex items-center">
                    Contact Us <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=800&width=800"
                alt="Specialty Notary Services"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-12 bg-background">
        <div className="container-custom">
          <h2 className="section-heading mb-8 text-center">Our Specialty Services</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12 text-center">
            We offer a range of specialized notary services to meet your unique document needs. Each service is
            performed with the same professionalism and attention to detail that defines all our work.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Apostille Services */}
            <Card className="flex flex-col h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Apostille Services</CardTitle>
                <CardDescription>Authentication for international use</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-3xl font-bold mb-2">$75</p>
                <p className="text-sm text-muted-foreground mb-4">Plus state fees</p>
                <p className="mb-4">
                  We assist with the apostille process for documents that need to be recognized in foreign countries
                  that are members of the Hague Convention.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Document preparation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Notarization</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>State authentication guidance</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <Link href="/booking?service=apostille" className="w-full flex items-center justify-center">
                    Book This Service <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Background Check Verification */}
            <Card className="flex flex-col h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Background Check Verification</CardTitle>
                <CardDescription>Identity verification for background checks</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-3xl font-bold mb-2">$55</p>
                <p className="text-sm text-muted-foreground mb-4">Flat fee</p>
                <p className="mb-4">
                  We provide notarized identity verification for employment, licensing, and other background check
                  requirements.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Identity verification</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Document completion assistance</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Fingerprinting coordination</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <Link href="/booking?service=background-check" className="w-full flex items-center justify-center">
                    Book This Service <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Wedding Certificate Expediting */}
            <Card className="flex flex-col h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Wedding Certificate Expediting</CardTitle>
                <CardDescription>Streamlined marriage certificate processing</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-3xl font-bold mb-2">$75</p>
                <p className="text-sm text-muted-foreground mb-4">Plus state fees</p>
                <p className="mb-4">
                  We help expedite the process of obtaining and filing marriage certificates, saving you time and
                  hassle.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Document preparation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Filing assistance</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Expedited processing</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <Link href="/booking?service=wedding-certificate" className="w-full flex items-center justify-center">
                    Book This Service <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Medallion Signature */}
            <Card className="flex flex-col h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Medallion Signature</CardTitle>
                <CardDescription>Special certification for financial transactions</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-3xl font-bold mb-2">$150</p>
                <p className="text-sm text-muted-foreground mb-4">High-Risk Handling Fee</p>
                <p className="mb-4">
                  We provide medallion signature guarantee services for securities transfers and other financial
                  transactions.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Securities transfer verification</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Financial document handling</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Enhanced security measures</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <Link href="/booking?service=medallion-signature" className="w-full flex items-center justify-center">
                    Book This Service <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Specialty Services */}
      <section className="py-12 bg-muted">
        <div className="container-custom">
          <h2 className="section-heading mb-8 text-center">Additional Specialty Services</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Document Certification */}
            <div className="bg-background rounded-lg p-6">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Document Certification</h3>
                  <p className="text-muted-foreground mb-4">
                    We provide certified copies of original documents for official purposes.
                  </p>
                  <p className="font-semibold">$25 per document</p>
                </div>
              </div>
            </div>

            {/* I-9 Verification */}
            <div className="bg-background rounded-lg p-6">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">I-9 Verification</h3>
                  <p className="text-muted-foreground mb-4">
                    We serve as authorized representatives for employment eligibility verification.
                  </p>
                  <p className="font-semibold">$45 per verification</p>
                </div>
              </div>
            </div>

            {/* Mobile Fingerprinting */}
            <div className="bg-background rounded-lg p-6">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Mobile Fingerprinting</h3>
                  <p className="text-muted-foreground mb-4">
                    We provide mobile fingerprinting services for background checks and licensing requirements.
                  </p>
                  <p className="font-semibold">$65 per person</p>
                </div>
              </div>
            </div>

            {/* Document Retrieval */}
            <div className="bg-background rounded-lg p-6">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Document Retrieval</h3>
                  <p className="text-muted-foreground mb-4">
                    We assist with retrieving official documents from government offices.
                  </p>
                  <p className="font-semibold">$85 plus government fees</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button className="bg-primary text-primary-foreground">
              <Link href="/contact" className="flex items-center">
                Inquire About Specialty Services <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Apostille Process */}
      <section className="py-12 bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-heading mb-6">The Apostille Process</h2>
              <p className="text-lg mb-6">
                An apostille is a form of authentication issued to documents for use in countries that participate in
                the Hague Convention of 1961. Our apostille service simplifies this complex process.
              </p>

              <h3 className="section-subheading mb-4">How We Help</h3>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-primary mr-3 shrink-0" />
                  <div>
                    <span className="font-semibold">Document Preparation</span>
                    <p className="text-muted-foreground">
                      We ensure your documents are properly prepared for the apostille process.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-primary mr-3 shrink-0" />
                  <div>
                    <span className="font-semibold">Notarization</span>
                    <p className="text-muted-foreground">
                      We provide the required notarization before the apostille can be applied.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-primary mr-3 shrink-0" />
                  <div>
                    <span className="font-semibold">State Authentication</span>
                    <p className="text-muted-foreground">
                      We guide you through the state authentication process required for apostille.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-primary mr-3 shrink-0" />
                  <div>
                    <span className="font-semibold">Apostille Submission</span>
                    <p className="text-muted-foreground">
                      We can assist with submitting your documents to the Secretary of State for apostille.
                    </p>
                  </div>
                </li>
              </ul>

              <div className="bg-muted p-6 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-primary mr-3 shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Important Information</h4>
                    <p>
                      The apostille process typically takes 2-4 weeks to complete. Expedited services are available for
                      an additional fee. State fees for apostille services are not included in our base price.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=800&width=800"
                alt="Apostille Process"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 bg-muted">
        <div className="container-custom max-w-4xl">
          <h2 className="section-heading mb-8 text-center">Frequently Asked Questions</h2>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is an apostille and when do I need one?</AccordionTrigger>
              <AccordionContent>
                <p>
                  An apostille is a certificate that authenticates the origin of a public document. You need an
                  apostille when you have documents that will be used in a foreign country that is a member of the Hague
                  Apostille Convention. Common documents that require apostilles include:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Birth, marriage, and death certificates</li>
                  <li>Educational documents (diplomas, transcripts)</li>
                  <li>Corporate documents</li>
                  <li>Power of attorney</li>
                  <li>Court documents</li>
                  <li>Adoption papers</li>
                </ul>
                <p className="mt-2">
                  If the country where you'll be using the document is not a member of the Hague Convention, you may
                  need a different form of authentication. We can advise you on the specific requirements for your
                  situation.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>
                What is a medallion signature guarantee and why is it different from a regular notarization?
              </AccordionTrigger>
              <AccordionContent>
                <p>
                  A medallion signature guarantee is a special certification used primarily for financial transactions,
                  particularly the transfer of securities. Unlike a standard notarization, which verifies the identity
                  of the signer, a medallion signature guarantee provides additional protection by warranting not only
                  the signature's authenticity but also the signer's capacity and authority to sign.
                </p>
                <p className="mt-2">
                  Medallion signature guarantees are typically required by transfer agents when transferring securities,
                  changing ownership of an account, or selling or transferring stocks or bonds. They provide a higher
                  level of security and protection against fraudulent transfers, which is why they carry a higher fee
                  than standard notarizations.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>How long does the background check verification process take?</AccordionTrigger>
              <AccordionContent>
                <p>
                  Our background check verification service typically takes about 30-45 minutes to complete. This
                  includes:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Verifying your identity with valid government-issued photo ID</li>
                  <li>Completing any required forms</li>
                  <li>Notarizing the necessary documents</li>
                  <li>Providing guidance on next steps in the background check process</li>
                </ul>
                <p className="mt-2">
                  Please note that this service only covers the notarization and verification portion of the background
                  check process. The actual background check is conducted by the requesting organization and may take
                  several days or weeks to complete.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>What documents do I need to bring for wedding certificate expediting?</AccordionTrigger>
              <AccordionContent>
                <p>For our wedding certificate expediting service, you'll need to bring:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Valid government-issued photo ID for both parties</li>
                  <li>Completed marriage license application (if applicable)</li>
                  <li>Any supporting documents required by your county clerk's office</li>
                  <li>Payment for county fees (separate from our service fee)</li>
                  <li>Any specific forms provided by your county</li>
                </ul>
                <p className="mt-2">
                  Requirements can vary by county, so we recommend contacting us in advance to discuss your specific
                  situation. We'll provide guidance on the exact documents needed for your location.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>Do you provide I-9 verification services for employers?</AccordionTrigger>
              <AccordionContent>
                <p>
                  Yes, we provide I-9 verification services for employers. As authorized representatives, we can
                  complete Section 2 of Form I-9 on behalf of employers who have remote employees or cannot meet with
                  new hires in person.
                </p>
                <p className="mt-2">Our I-9 verification service includes:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Meeting with the employee at a convenient location</li>
                  <li>Examining original identity and employment authorization documents</li>
                  <li>Completing Section 2 of Form I-9</li>
                  <li>Returning the completed form to the employer</li>
                </ul>
                <p className="mt-2">
                  Please note that the employer remains responsible for reviewing and ensuring the form is properly
                  completed. Our service simply fulfills the in-person verification requirement.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>Can you help with document retrieval from government offices?</AccordionTrigger>
              <AccordionContent>
                <p>
                  Yes, we offer document retrieval services from various government offices in the Houston area. This
                  service is particularly helpful for individuals who are unable to visit government offices in person
                  due to time constraints, mobility issues, or other reasons.
                </p>
                <p className="mt-2">Our document retrieval service includes:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Consultation to determine your specific document needs</li>
                  <li>Preparation of any required request forms</li>
                  <li>Payment of government fees on your behalf (reimbursed by you)</li>
                  <li>In-person visits to government offices</li>
                  <li>Secure delivery of retrieved documents to you</li>
                </ul>
                <p className="mt-2">
                  Common documents we can retrieve include birth certificates, marriage certificates, property records,
                  and business filings. Please contact us to discuss your specific document retrieval needs.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-accent text-accent-foreground">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Need a Specialized Notary Service?</h2>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            Our specialty services are designed to meet your unique document needs with the same professionalism and
            attention to detail that defines all our work.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground">
              <Link href="/booking" className="flex items-center">
                Book a Service <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link href="/contact" className="flex items-center">
                Contact Us <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

