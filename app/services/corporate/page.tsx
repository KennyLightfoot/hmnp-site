import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, Briefcase, ChevronRight, AlertCircle, Building, Users, Calendar, BarChart } from "lucide-react"

export const metadata: Metadata = {
  title: "Corporate Notary Services",
  description:
    "Professional mobile notary services for businesses, title companies, law firms, and organizations throughout Houston. Custom packages, volume discounts, and dedicated support.",
}

export default function CorporateServicesPage() {
  return (
    <main className="flex flex-col">
      {/* Hero Section */}
      <section className="py-12 bg-accent text-accent-foreground">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Corporate Notary Services</h1>
              <p className="text-lg mb-6">
                Tailored notary solutions for businesses, title companies, law firms, and organizations. Our corporate
                services provide reliability, consistency, and convenience for your ongoing notary needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-primary text-primary-foreground">
                  <Link href="/contact" className="flex items-center">
                    Request a Consultation <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link href="/booking" className="flex items-center">
                    Book a Service <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=800&width=800"
                alt="Corporate Notary Services"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Packages */}
      <section className="py-12 bg-background">
        <div className="container-custom">
          <h2 className="section-heading mb-8 text-center">Corporate Service Packages</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12 text-center">
            Our corporate packages are designed to provide consistent, reliable notary services for businesses with
            regular notarization needs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Title Company Partnership */}
            <Card className="flex flex-col h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Title Company Partnership</CardTitle>
                <CardDescription>Dedicated service for title companies</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-3xl font-bold mb-2">$125</p>
                <p className="text-sm text-muted-foreground mb-4">Per month</p>
                <p className="mb-4">
                  A comprehensive partnership program designed specifically for title companies with regular loan
                  signing needs.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Priority scheduling for closings</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Dedicated phone line</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Volume pricing</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Monthly reporting and analytics</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <Link href="/contact?service=title-company" className="w-full flex items-center justify-center">
                    Request Information <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Business Concierge Package */}
            <Card className="flex flex-col h-full border-primary">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Business Concierge Package</CardTitle>
                <CardDescription>Regular service for businesses</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-3xl font-bold mb-2">$200</p>
                <p className="text-sm text-muted-foreground mb-4">Per month</p>
                <p className="mb-4">
                  A comprehensive notary solution for businesses with regular document notarization requirements.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Up to 10 standard notarizations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>On-site service twice monthly</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Scheduled office hours</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Corporate billing options</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Dedicated account manager</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-primary text-primary-foreground">
                  <Link href="/contact?service=business-concierge" className="w-full flex items-center justify-center">
                    Request Information <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Custom Business Solutions */}
            <Card className="flex flex-col h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Custom Business Solutions</CardTitle>
                <CardDescription>Tailored to your specific needs</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-3xl font-bold mb-2">Custom</p>
                <p className="text-sm text-muted-foreground mb-4">Tailored pricing</p>
                <p className="mb-4">
                  A fully customized notary service solution designed around your organization's specific requirements.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Tailored to your specific needs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Volume discounts available</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Flexible scheduling options</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Custom reporting</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                    <span>Integration with your processes</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <Link href="/contact?service=custom-business" className="w-full flex items-center justify-center">
                    Get a Quote <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Volume Pricing */}
      <section className="py-12 bg-muted">
        <div className="container-custom">
          <h2 className="section-heading mb-8 text-center">Volume Pricing</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12 text-center">
            Our volume pricing offers significant savings for businesses with regular notarization needs. The more
            services you use, the more you save.
          </p>

          <div className="overflow-x-auto">
            <Table className="bg-background">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Service Type</TableHead>
                  <TableHead>Standard Price</TableHead>
                  <TableHead>5-10 Per Month</TableHead>
                  <TableHead>11-20 Per Month</TableHead>
                  <TableHead>21+ Per Month</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Standard Notarizations</TableCell>
                  <TableCell>$75</TableCell>
                  <TableCell>$65 each</TableCell>
                  <TableCell>$60 each</TableCell>
                  <TableCell>$55 each</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Loan Signings</TableCell>
                  <TableCell>$150</TableCell>
                  <TableCell>$135 each</TableCell>
                  <TableCell>$125 each</TableCell>
                  <TableCell>$115 each</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Apostille Services</TableCell>
                  <TableCell>$75</TableCell>
                  <TableCell>$65 each</TableCell>
                  <TableCell>$60 each</TableCell>
                  <TableCell>$55 each</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Background Checks</TableCell>
                  <TableCell>$55</TableCell>
                  <TableCell>$50 each</TableCell>
                  <TableCell>$45 each</TableCell>
                  <TableCell>$40 each</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="mt-8 bg-background p-6 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-primary mr-3 shrink-0" />
              <div>
                <h4 className="font-semibold mb-2">Volume Pricing Notes</h4>
                <p>
                  Volume pricing is applied based on the total number of services used per month. Discounts are applied
                  automatically for corporate clients. Additional fees for weekend service, after-hours service, or
                  extended travel may still apply. Please contact us for a custom quote based on your specific needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* On-Site Service */}
      <section className="py-12 bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=800&width=800"
                alt="On-Site Notary Services"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="section-heading mb-6">On-Site Notary Service</h2>
              <p className="text-lg mb-6">
                Our on-site notary service brings a professional notary to your office on a regular schedule, providing
                convenience for your employees and clients.
              </p>

              <h3 className="section-subheading mb-4">How It Works</h3>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-primary mr-3 shrink-0" />
                  <div>
                    <span className="font-semibold">Scheduled Visits</span>
                    <p className="text-muted-foreground">
                      We establish a regular schedule for notary visits to your office.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-primary mr-3 shrink-0" />
                  <div>
                    <span className="font-semibold">Dedicated Notary</span>
                    <p className="text-muted-foreground">
                      The same notary visits each time, becoming familiar with your needs.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-primary mr-3 shrink-0" />
                  <div>
                    <span className="font-semibold">Bulk Processing</span>
                    <p className="text-muted-foreground">
                      Multiple documents and signers can be handled during each visit.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-6 w-6 text-primary mr-3 shrink-0" />
                  <div>
                    <span className="font-semibold">Simplified Billing</span>
                    <p className="text-muted-foreground">Monthly invoicing with detailed service reports.</p>
                  </div>
                </li>
              </ul>

              <Button className="bg-primary text-primary-foreground">
                <Link href="/contact?service=on-site" className="flex items-center">
                  Schedule On-Site Service <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits for Businesses */}
      <section className="py-12 bg-muted">
        <div className="container-custom">
          <h2 className="section-heading mb-8 text-center">Benefits for Businesses</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Time Efficiency</h3>
              <p className="text-muted-foreground">
                Save valuable employee time by having notary services come to your location on your schedule. No more
                sending staff across town for notarizations.
              </p>
            </div>

            <div className="bg-background rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Cost Savings</h3>
              <p className="text-muted-foreground">
                Our volume pricing and package options provide significant cost savings compared to ad-hoc notary
                services, especially for businesses with regular needs.
              </p>
            </div>

            <div className="bg-background rounded-lg p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Professionalism</h3>
              <p className="text-muted-foreground">
                Provide a professional experience for your clients and employees with our experienced, well-dressed, and
                courteous notaries who understand business protocols.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="py-12 bg-background">
        <div className="container-custom">
          <h2 className="section-heading mb-8 text-center">Industries We Serve</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12 text-center">
            Our corporate notary services are tailored to meet the specific needs of various industries. Here are some
            of the sectors we commonly work with:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-muted p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Real Estate</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                  <span>Title Companies</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                  <span>Real Estate Brokerages</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                  <span>Property Management Firms</span>
                </li>
              </ul>
            </div>

            <div className="bg-muted p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Legal</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                  <span>Law Firms</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                  <span>Legal Aid Organizations</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                  <span>Corporate Legal Departments</span>
                </li>
              </ul>
            </div>

            <div className="bg-muted p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Financial</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                  <span>Banks and Credit Unions</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                  <span>Mortgage Companies</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                  <span>Financial Advisors</span>
                </li>
              </ul>
            </div>

            <div className="bg-muted p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Healthcare</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                  <span>Hospitals</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                  <span>Medical Practices</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                  <span>Long-term Care Facilities</span>
                </li>
              </ul>
            </div>

            <div className="bg-muted p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Education</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                  <span>Universities</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                  <span>Private Schools</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                  <span>Educational Institutions</span>
                </li>
              </ul>
            </div>

            <div className="bg-muted p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Corporate</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                  <span>HR Departments</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                  <span>Corporate Offices</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-2 shrink-0" />
                  <span>Small and Medium Businesses</span>
                </li>
              </ul>
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
              <AccordionTrigger>How does the Title Company Partnership work?</AccordionTrigger>
              <AccordionContent>
                <p>
                  Our Title Company Partnership is a monthly subscription service designed specifically for title
                  companies with regular loan signing needs. Here's how it works:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>You pay a monthly fee of $125 for the partnership</li>
                  <li>You receive priority scheduling for all your loan signings</li>
                  <li>You get access to a dedicated phone line for urgent requests</li>
                  <li>Your loan signings are discounted based on volume</li>
                  <li>You receive monthly reports on all notarizations performed</li>
                  <li>You have a dedicated account manager for your account</li>
                </ul>
                <p className="mt-2">
                  This partnership is ideal for title companies that handle multiple closings each month and need
                  reliable, consistent notary services.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>What's included in the Business Concierge Package?</AccordionTrigger>
              <AccordionContent>
                <p>The Business Concierge Package includes:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Up to 10 standard notarizations per month (additional notarizations at discounted rates)</li>
                  <li>On-site service twice monthly at your office location</li>
                  <li>Scheduled office hours where our notary is available exclusively for your team</li>
                  <li>Corporate billing with monthly invoicing</li>
                  <li>A dedicated account manager who understands your business needs</li>
                  <li>Priority scheduling for any additional notary services needed</li>
                  <li>Monthly service reports</li>
                </ul>
                <p className="mt-2">
                  This package is ideal for businesses that regularly need notary services for employee documents,
                  contracts, affidavits, and other business documents.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>How do you handle confidential business documents?</AccordionTrigger>
              <AccordionContent>
                <p>
                  We understand the sensitive nature of business documents and take confidentiality very seriously. Our
                  approach to handling confidential documents includes:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>All our notaries sign confidentiality agreements</li>
                  <li>We do not retain copies of notarized documents unless specifically requested</li>
                  <li>Our notary journal entries contain only the legally required information</li>
                  <li>We can sign additional non-disclosure agreements if required by your company</li>
                  <li>We follow strict protocols for document handling and security</li>
                  <li>We can work within your company's security procedures</li>
                </ul>
                <p className="mt-2">
                  If you have specific confidentiality requirements, please discuss them with us when setting up your
                  corporate service package.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Can you provide notary services for multiple office locations?</AccordionTrigger>
              <AccordionContent>
                <p>
                  Yes, we can provide notary services for businesses with multiple office locations in the Houston area.
                  Our multi-location service options include:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Rotating schedules between different office locations</li>
                  <li>Dedicated notaries assigned to specific locations</li>
                  <li>Coordinated scheduling across all locations</li>
                  <li>Consolidated billing for all locations</li>
                  <li>Standardized service across your entire organization</li>
                </ul>
                <p className="mt-2">
                  We'll work with you to create a service plan that accommodates all your locations efficiently.
                  Additional fees may apply based on the number of locations and their geographic distribution.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>What reporting and analytics do you provide for corporate clients?</AccordionTrigger>
              <AccordionContent>
                <p>
                  Our corporate clients receive comprehensive reporting and analytics to help track and manage their
                  notary services:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Monthly service reports detailing all notarizations performed</li>
                  <li>Breakdown by document type, department, or other custom categories</li>
                  <li>Usage trends and patterns to help optimize scheduling</li>
                  <li>Cost analysis and savings reports</li>
                  <li>Service level agreement (SLA) performance metrics</li>
                  <li>Custom reports tailored to your specific needs</li>
                </ul>
                <p className="mt-2">
                  These reports can be delivered in various formats (PDF, Excel, etc.) and can be customized to include
                  the specific data points that are most relevant to your organization.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>How do we get started with corporate services?</AccordionTrigger>
              <AccordionContent>
                <p>Getting started with our corporate notary services is a simple process:</p>
                <ol className="list-decimal pl-6 mt-2 space-y-1">
                  <li>Contact us to schedule a consultation (phone, video call, or in-person)</li>
                  <li>During the consultation, we'll discuss your specific notary needs and requirements</li>
                  <li>We'll provide a customized service proposal based on your needs</li>
                  <li>Once you approve the proposal, we'll set up your account and service schedule</li>
                  <li>We'll assign a dedicated account manager to your organization</li>
                  <li>Your account manager will coordinate the implementation of your service plan</li>
                  <li>We'll provide any necessary training or information for your team</li>
                </ol>
                <p className="mt-2">
                  The entire process typically takes 3-5 business days from initial consultation to service
                  implementation. For urgent needs, we can expedite the process.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-accent text-accent-foreground">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Streamline Your Business Notary Needs?</h2>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            Contact us today to discuss how our corporate notary services can save your business time and money while
            providing professional, reliable service.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground">
              <Link href="/contact?service=corporate" className="flex items-center">
                Request a Consultation <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link href="/services" className="flex items-center">
                View All Services <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

