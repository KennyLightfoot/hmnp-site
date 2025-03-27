import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Clock, DollarSign, MapPin, AlertCircle, HelpCircle, Calendar } from "lucide-react"

export const metadata: Metadata = {
  title: "Fee Schedule | Houston Mobile Notary Pros",
  description:
    "Transparent pricing for all our mobile notary services. View our complete fee schedule including travel fees, after-hours rates, and specialty service pricing.",
  keywords: ["notary fees", "mobile notary pricing", "houston notary cost", "loan signing fees", "notary travel fees"],
}

export default function FeeSchedulePage() {
  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-oxfordBlue mb-4">Fee Schedule</h1>
          <p className="text-lg text-muted-foreground">Transparent pricing for all our mobile notary services</p>
        </div>

        <div className="bg-slate-50 p-6 rounded-lg mb-8 border border-slate-200">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-auburn h-6 w-6 mt-1 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-lg mb-2">Important Fee Information</h2>
              <p className="text-muted-foreground mb-4">
                Our fees are structured to provide fair and transparent pricing for all notary services. All fees are
                due at the time of service and can be paid via cash, credit card, or electronic payment methods.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-auburn" />
                  <span className="text-sm">Base fees + travel fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-auburn" />
                  <span className="text-sm">Travel calculated by distance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-auburn" />
                  <span className="text-sm">After-hours premium after 6 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-auburn" />
                  <span className="text-sm">Weekend/holiday premium applies</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Texas law limits the maximum fee a notary can charge for notarial acts. Our
                service fees include travel, preparation, and administrative costs.
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="essential" className="mb-12">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
            <TabsTrigger value="essential">Essential</TabsTrigger>
            <TabsTrigger value="priority">Priority</TabsTrigger>
            <TabsTrigger value="loan">Loan Signing</TabsTrigger>
            <TabsTrigger value="specialty">Specialty</TabsTrigger>
          </TabsList>

          <TabsContent value="essential" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Essential Mobile Package</CardTitle>
                <CardDescription>Our standard service for general notarization needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">Base Fee</div>
                    <div>$60 (includes first signature/document)</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">Additional Signatures</div>
                    <div>$10 per signature</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">Additional Documents</div>
                    <div>$25 per document</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">Travel Fee</div>
                    <div>$2.50 per mile (round trip from 77591)</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">After Hours (after 6 PM)</div>
                    <div>+$25 premium</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="font-medium">Weekend/Holiday</div>
                    <div>+$50 premium</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="font-semibold mb-3">Essential Package Example</h3>
              <p className="mb-4 text-muted-foreground">
                For a standard weekday appointment at 10 miles distance with 2 documents and 3 signatures:
              </p>
              <div className="space-y-2 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Base Fee</div>
                  <div>$60.00</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Additional Document (1)</div>
                  <div>$25.00</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Additional Signatures (2)</div>
                  <div>$20.00</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Travel Fee (20 miles round trip)</div>
                  <div>$50.00</div>
                </div>
                <Separator className="my-2" />
                <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
                  <div>Total</div>
                  <div>$155.00</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="priority" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Priority Service</CardTitle>
                <CardDescription>Expedited service for urgent notarization needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">Base Fee</div>
                    <div>$100 (includes first signature/document)</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">Additional Signatures</div>
                    <div>$10 per signature</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">Additional Documents</div>
                    <div>$25 per document</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">Travel Fee</div>
                    <div>$2.50 per mile (round trip from 77591)</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">After Hours (after 6 PM)</div>
                    <div>+$25 premium</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">Weekend/Holiday</div>
                    <div>+$50 premium</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="font-medium">Response Time</div>
                    <div>Within 2 hours (subject to availability)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="font-semibold mb-3">Priority Service Example</h3>
              <p className="mb-4 text-muted-foreground">
                For an urgent same-day appointment at 15 miles distance with 1 document and 2 signatures:
              </p>
              <div className="space-y-2 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Priority Base Fee</div>
                  <div>$100.00</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Additional Signature (1)</div>
                  <div>$10.00</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Travel Fee (30 miles round trip)</div>
                  <div>$75.00</div>
                </div>
                <Separator className="my-2" />
                <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
                  <div>Total</div>
                  <div>$185.00</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="loan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Loan Signing Services</CardTitle>
                <CardDescription>Specialized service for real estate and loan document signings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">Standard Loan Package</div>
                    <div>$150 (includes up to 4 notarized signatures)</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">Additional Signatures</div>
                    <div>$10 per signature</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">Reverse Mortgage</div>
                    <div>$175 base fee</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">Travel Fee</div>
                    <div>$2.50 per mile (round trip from 77591)</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">After Hours (after 6 PM)</div>
                    <div>+$25 premium</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">Weekend/Holiday</div>
                    <div>+$50 premium</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="font-medium">Loan Signing Specialist</div>
                    <div>Certified and experienced in loan documents</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="font-semibold mb-3">Loan Signing Example</h3>
              <p className="mb-4 text-muted-foreground">
                For a standard loan signing at 12 miles distance with 6 notarized signatures:
              </p>
              <div className="space-y-2 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Standard Loan Package</div>
                  <div>$150.00</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Additional Signatures (2)</div>
                  <div>$20.00</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Travel Fee (24 miles round trip)</div>
                  <div>$60.00</div>
                </div>
                <Separator className="my-2" />
                <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
                  <div>Total</div>
                  <div>$230.00</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specialty" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Specialty Services</CardTitle>
                <CardDescription>Specialized notary services for unique situations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">Hospital/Care Facility</div>
                    <div>$125 base fee</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">Jail/Detention Facility</div>
                    <div>$150 base fee (subject to facility approval)</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">Corporate Services</div>
                    <div>Custom quote based on volume</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">I-9 Verification</div>
                    <div>$75 base fee</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">Travel Fee</div>
                    <div>$2.50 per mile (round trip from 77591)</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-medium">After Hours (after 6 PM)</div>
                    <div>+$25 premium</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="font-medium">Weekend/Holiday</div>
                    <div>+$50 premium</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="font-semibold mb-3">Specialty Service Example</h3>
              <p className="mb-4 text-muted-foreground">
                For a hospital visit at 8 miles distance with 2 documents and 3 signatures:
              </p>
              <div className="space-y-2 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Hospital Visit Base Fee</div>
                  <div>$125.00</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Additional Document (1)</div>
                  <div>$25.00</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Additional Signatures (2)</div>
                  <div>$20.00</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Travel Fee (16 miles round trip)</div>
                  <div>$40.00</div>
                </div>
                <Separator className="my-2" />
                <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
                  <div>Total</div>
                  <div>$210.00</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-8 mb-12">
          <h2 className="text-2xl font-bold tracking-tight">Additional Fee Information</h2>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-auburn" />
                Travel Fee Calculation
              </h3>
              <p className="mb-4 text-muted-foreground">
                Travel fees are calculated at $2.50 per mile, measured as the round-trip distance from our base location
                (ZIP 77591) to your location. We use Google Maps to determine the most efficient route.
              </p>
              <div className="bg-slate-50 p-4 rounded-md">
                <p className="text-sm font-medium">Example Calculation:</p>
                <p className="text-sm text-muted-foreground">
                  If you are 15 miles from our base location, the round-trip distance is 30 miles.
                  <br />
                  30 miles × $2.50 = $75.00 travel fee
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-auburn" />
                After-Hours & Weekend Premiums
              </h3>
              <p className="mb-4 text-muted-foreground">
                Our standard business hours are Monday through Friday, 8:00 AM to 6:00 PM. Appointments outside these
                hours incur the following additional fees:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                <li>After 6:00 PM: $25 additional fee</li>
                <li>Weekends (Saturday & Sunday): $50 additional fee</li>
                <li>Holidays: $50 additional fee</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> After-hours and weekend premiums can be combined if applicable.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-auburn" />
                Payment Methods
              </h3>
              <p className="mb-4 text-muted-foreground">We accept the following payment methods:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Cash</li>
                <li>Credit/Debit Cards (Visa, MasterCard, American Express, Discover)</li>
                <li>Mobile Payment Apps (Venmo, Zelle, Cash App)</li>
                <li>Corporate Checks (for established business clients only)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-12">
          <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>

          <div className="grid gap-4">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold mb-2 flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-auburn" />
                Why do mobile notary fees cost more than at a bank or UPS store?
              </h3>
              <p className="text-muted-foreground">
                Mobile notary services include travel time, gas, vehicle maintenance, and the convenience of coming to
                your location at your preferred time. Our mobile service saves you time and hassle while providing
                professional expertise at your doorstep.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold mb-2 flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-auburn" />
                Do you offer discounts for multiple documents or signatures?
              </h3>
              <p className="text-muted-foreground">
                Yes, our pricing structure is designed to be more economical for multiple documents or signatures in a
                single appointment. The base fee covers the first document/signature, with reduced rates for additional
                items.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold mb-2 flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-auburn" />
                What if my appointment takes longer than expected?
              </h3>
              <p className="text-muted-foreground">
                Our fees are based on document and signature count, not time spent. However, for appointments exceeding
                1 hour due to client delays or complex situations, an additional fee of $25 per half hour may apply.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <h3 className="font-semibold mb-2 flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-auburn" />
                Do you charge for appointments that need to be rescheduled?
              </h3>
              <p className="text-muted-foreground">
                We understand that plans change. There is no fee for rescheduling with at least 2 hours' notice.
                Cancellations with less than 2 hours' notice may incur a $50 fee to cover preparation and travel time
                already invested.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Ready to Schedule Your Notary Service?</h2>
          <p className="text-muted-foreground">
            Book your appointment today or contact us for a custom quote for your specific needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/booking">
                <Calendar className="h-5 w-5" />
                Book an Appointment
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/contact">
                <HelpCircle className="h-5 w-5" />
                Request a Custom Quote
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

