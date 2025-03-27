import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertCircle, FileText, HelpCircle, Info } from "lucide-react"

export const metadata: Metadata = {
  title: "Document Requirements | Houston Mobile Notary Pros",
  description:
    "Learn what documents and identification you need to prepare for your mobile notary appointment in Houston.",
  keywords: [
    "notary documents",
    "notary requirements",
    "ID for notary",
    "houston notary documents",
    "notary preparation",
  ],
}

export default function DocumentRequirementsPage() {
  return (
    <div className="container-custom py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-oxfordBlue mb-4">Document Requirements</h1>
          <p className="text-lg text-muted-foreground">Everything you need to prepare for your notary appointment</p>
        </div>

        <Tabs defaultValue="general" className="w-full mb-12">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="general">General Requirements</TabsTrigger>
            <TabsTrigger value="identification">Identification</TabsTrigger>
            <TabsTrigger value="document-types">Document Types</TabsTrigger>
            <TabsTrigger value="special-cases">Special Cases</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>General Document Requirements</CardTitle>
                <CardDescription>Basic requirements for all notarizations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium flex items-center">
                      <CheckCircle className="h-5 w-5 text-auburn mr-2" />
                      Document Preparation Checklist
                    </h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          Documents must be <strong>complete</strong> with no blank spaces that need to be filled in
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          Documents should be <strong>unsigned</strong> unless specifically instructed otherwise
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>All pages of multi-page documents must be present</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Documents must be legible and printed on standard paper (not digital)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Documents must have a notary section (acknowledgment or jurat)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-oxfordBlue flex items-center">
                      <AlertCircle className="h-5 w-5 text-auburn mr-2" />
                      Important Notes
                    </h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="text-auburn mr-2">•</span>
                        <span>All signers must be physically present during notarization</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-auburn mr-2">•</span>
                        <span>Signers must be willing participants and understand what they're signing</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-auburn mr-2">•</span>
                        <span>Signers must be mentally competent and not under duress</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-auburn mr-2">•</span>
                        <span>We cannot notarize incomplete or post-dated documents</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-oxfordBlue flex items-center">
                      <FileText className="h-5 w-5 text-auburn mr-2" />
                      Document Format Requirements
                    </h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Original documents are preferred, but copies are acceptable in most cases</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Documents must have space for the notary seal (typically 2" x 2")</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Documents should be printed on 8.5" x 11" paper when possible</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Black or blue ink is recommended for signatures</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="identification" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Identification Requirements</CardTitle>
                <CardDescription>Valid ID is required for all notarizations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium">Acceptable Forms of Identification</h3>
                    <p className="text-sm mt-1">
                      Texas law requires proper identification for notarization. All IDs must be current (not expired).
                    </p>
                    <div className="grid gap-4 md:grid-cols-2 mt-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Primary IDs (Most Common)</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>Texas Driver's License</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>Texas ID Card</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>U.S. Passport or Passport Card</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>U.S. Military ID</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Other Acceptable IDs</h4>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>Permanent Resident Card</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>Out-of-state Driver's License</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>Foreign Passport with Visa</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                            <span>U.S. Certificate of Citizenship</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-oxfordBlue">ID Requirements</h3>
                    <p className="text-sm mt-1">All acceptable IDs must include:</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>A photograph of the individual</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>A physical description of the individual</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>The signature of the individual</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>An identifying number</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>A valid expiration date (not expired)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-oxfordBlue flex items-center">
                      <AlertCircle className="h-5 w-5 text-auburn mr-2" />
                      Unacceptable Forms of ID
                    </h3>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li className="flex items-start">
                        <span className="text-auburn mr-2">✕</span>
                        <span>Expired IDs of any kind</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-auburn mr-2">✕</span>
                        <span>Social Security cards</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-auburn mr-2">✕</span>
                        <span>Birth certificates</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-auburn mr-2">✕</span>
                        <span>School IDs</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-auburn mr-2">✕</span>
                        <span>Employee IDs (unless government-issued)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-auburn mr-2">✕</span>
                        <span>Photocopies of IDs</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium flex items-center">
                      <Info className="h-5 w-5 text-auburn mr-2" />
                      Name Discrepancies
                    </h3>
                    <p className="text-sm mt-1">
                      If your name on your ID differs from the name on your document (due to marriage, divorce, etc.),
                      you may need to provide additional documentation such as:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Marriage certificate</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Divorce decree</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Court order for name change</span>
                      </li>
                    </ul>
                    <p className="text-sm mt-2 italic">
                      Please inform us of any name discrepancies when booking your appointment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="document-types" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Types & Requirements</CardTitle>
                <CardDescription>Specific requirements for common document types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-oxfordBlue">Power of Attorney</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>The principal (person granting power) must be present</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>The agent (person receiving power) does not need to be present</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Document must include a notary acknowledgment section</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Principal must be mentally competent and understand the document</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-oxfordBlue">Loan Documents</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>All borrowers listed on the loan must be present</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Complete loan package must be available</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Borrowers should have valid government-issued photo ID</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Lender instructions should be provided if available</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-oxfordBlue">Affidavits</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Requires a jurat notarization (oath/affirmation)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Signer must swear to or affirm the contents</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Document must be signed in the notary's presence</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Signer must personally appear before the notary</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-oxfordBlue">Deeds & Property Documents</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>All grantors (sellers) must be present</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Grantees (buyers) typically do not need to be present</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Property description must be complete</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Document must include a notary acknowledgment section</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-oxfordBlue">Medical Documents</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Medical directives must be signed by the principal</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>May require witnesses (check document requirements)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Principal must be mentally competent</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>HIPAA forms require the patient's signature</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="special-cases" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Special Cases & Accommodations</CardTitle>
                <CardDescription>Information for unique notarization situations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-oxfordBlue">Foreign Language Documents</h3>
                    <p className="text-sm mt-1">
                      We can notarize documents in foreign languages with the following conditions:
                    </p>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>The notary section must be in English</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>The signer must understand the document content</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>We cannot translate or verify the content of foreign language documents</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-oxfordBlue">Physical Limitations</h3>
                    <p className="text-sm mt-1">We can accommodate signers with physical limitations:</p>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Signature by Mark:</strong> If unable to sign, the signer can make a mark (X) with
                          witnesses present
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Signature by Proxy:</strong> In some cases, another person can sign on behalf of the
                          principal
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Wheelchair Access:</strong> Please inform us in advance if wheelchair access is needed
                        </span>
                      </li>
                    </ul>
                    <p className="text-sm mt-2 italic">
                      Please notify us of any special accommodations when booking your appointment.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-oxfordBlue">Hospital & Care Facility Visits</h3>
                    <p className="text-sm mt-1">
                      We offer notary services at hospitals and care facilities with these requirements:
                    </p>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>The signer must be alert and mentally competent</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Valid ID is still required</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Facility permission may be required (please arrange in advance)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>A private space for the notarization is preferred</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-oxfordBlue">Credible Witness Procedure</h3>
                    <p className="text-sm mt-1">
                      If a signer doesn't have acceptable ID, we may use the credible witness procedure:
                    </p>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Requires 1-2 credible witnesses who know the signer</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Witnesses must have valid government-issued photo ID</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Witnesses must be impartial (not beneficiaries of the document)</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-auburn mr-2 flex-shrink-0 mt-0.5" />
                        <span>Witnesses must be willing to swear/affirm to the signer's identity</span>
                      </li>
                    </ul>
                    <p className="text-sm mt-2 italic">
                      Please contact us in advance if you need to use the credible witness procedure.
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium flex items-center">
                      <HelpCircle className="h-5 w-5 text-auburn mr-2" />
                      Documents We Cannot Notarize
                    </h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="text-auburn mr-2">✕</span>
                        <span>Incomplete documents with blank spaces</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-auburn mr-2">✕</span>
                        <span>Documents where all signers are not present</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-auburn mr-2">✕</span>
                        <span>Documents without notarial wording</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-auburn mr-2">✕</span>
                        <span>Vital records (birth certificates, death certificates, marriage licenses)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-auburn mr-2">✕</span>
                        <span>Documents where the signer doesn't understand the content</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="space-y-8 mt-12">
          <div>
            <h2 className="text-2xl font-bold text-oxfordBlue mb-4">Frequently Asked Questions</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-oxfordBlue flex items-center">
                  <HelpCircle className="h-5 w-5 text-auburn mr-2" />
                  What if I don't have the right ID?
                </h3>
                <p className="text-sm mt-2">
                  If you don't have acceptable ID, we may be able to use the credible witness procedure. Please contact
                  us in advance to discuss options.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-oxfordBlue flex items-center">
                  <HelpCircle className="h-5 w-5 text-auburn mr-2" />
                  Can you provide the documents I need?
                </h3>
                <p className="text-sm mt-2">
                  No, we cannot prepare legal documents or provide templates. You must provide your own documents for
                  notarization. We recommend consulting with an attorney for document preparation.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-oxfordBlue flex items-center">
                  <HelpCircle className="h-5 w-5 text-auburn mr-2" />
                  What if my document doesn't have a notary section?
                </h3>
                <p className="text-sm mt-2">
                  All documents requiring notarization must have appropriate notarial wording (acknowledgment or jurat).
                  We cannot add this language to your documents. Please ensure your document includes this section.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-oxfordBlue flex items-center">
                  <HelpCircle className="h-5 w-5 text-auburn mr-2" />
                  Can you notarize copies of documents?
                </h3>
                <p className="text-sm mt-2">
                  We can notarize copies of some documents, but not vital records or officially filed documents. Texas
                  notaries cannot certify copies of birth certificates, death certificates, or marriage licenses.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-oxfordBlue mb-4">Need More Information?</h2>
            <div className="bg-muted p-6 rounded-lg text-center">
              <p className="mb-4">
                If you have questions about document requirements or need assistance, we're here to help.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-auburn text-white hover:bg-auburn/90 h-10 px-6 py-2"
                >
                  Contact Us
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6 py-2"
                >
                  View FAQs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

