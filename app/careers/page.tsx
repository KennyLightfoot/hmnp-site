import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CareersSchema } from "./careers-schema"
import { CareerApplicationForm } from "./career-application-form"
import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  DollarSignIcon,
  HeartIcon,
  MapPinIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Careers | Join Our Team of Professional Mobile Notaries | Houston Mobile Notary Pros",
  description:
    "Join our team of professional mobile notaries in Houston. Flexible schedules, competitive pay, and a supportive work environment. Apply today!",
  openGraph: {
    title: "Join Our Team of Professional Mobile Notaries | Houston Mobile Notary Pros",
    description:
      "Join our team of professional mobile notaries in Houston. Flexible schedules, competitive pay, and a supportive work environment. Apply today!",
    type: "website",
    url: "https://houstonmobilenotarypros.com/careers",
    images: [
      {
        url: "https://houstonmobilenotarypros.com/images/careers-og.jpg",
        width: 1200,
        height: 630,
        alt: "Houston Mobile Notary Pros Careers",
      },
    ],
  },
}

export default function CareersPage() {
  return (
    <>
      <CareersSchema />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 py-20 md:py-28">
        <div className="absolute inset-0 opacity-20 bg-[url('/placeholder.svg?height=800&width=1600')] bg-cover bg-center"></div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Join Our Team of Professional Notaries</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Build a rewarding career with flexibility, competitive compensation, and the opportunity to help people
            during important moments in their lives.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
              <a href="#current-openings">View Openings</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              <a href="#application-form">Apply Now</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Join Us Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Join Houston Mobile Notary Pros?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're building a team of exceptional professionals who are passionate about providing outstanding service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <ClockIcon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Flexible Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Work when it suits you. Our mobile notaries enjoy the freedom to set their own hours and manage their
                  own appointments.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <DollarSignIcon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Competitive Compensation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Earn competitive pay with our fair fee structure. The more appointments you complete, the more you can
                  earn.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <UsersIcon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Supportive Team</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Join a collaborative environment where you'll receive training, mentorship, and ongoing support from
                  experienced professionals.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <StarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Professional Development</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Expand your skills with ongoing training opportunities in specialized notary services, customer
                  service, and business development.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <MapPinIcon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Work Locally</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Serve clients in your preferred areas of Houston. We match you with appointments that fit your
                  geographic preferences.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <HeartIcon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Meaningful Work</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Make a difference in people's lives by helping them complete important legal transactions during
                  significant life events.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Current Openings Section */}
      <section id="current-openings" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Current Opportunities</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're always looking for talented professionals to join our team. Check out our current openings below.
            </p>
          </div>

          <Tabs defaultValue="notary" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="notary">Notary Positions</TabsTrigger>
              <TabsTrigger value="admin">Administrative</TabsTrigger>
              <TabsTrigger value="other">Other Roles</TabsTrigger>
            </TabsList>

            <TabsContent value="notary">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Mobile Notary - Loan Signing Specialist</span>
                      <span className="text-sm font-medium px-3 py-1 bg-green-100 text-green-800 rounded-full">
                        Full-Time
                      </span>
                    </CardTitle>
                    <CardDescription>Houston, TX (Greater Houston Area) • Remote/Mobile</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p>
                        We're seeking experienced Notary Signing Agents who specialize in loan signings to join our
                        growing team. In this role, you'll travel to clients' locations to facilitate the signing of
                        loan documents.
                      </p>

                      <div>
                        <h4 className="font-semibold mb-2">Requirements:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Active Texas Notary Public commission</li>
                          <li>Certified Notary Signing Agent (preferred)</li>
                          <li>Reliable transportation and valid driver's license</li>
                          <li>Excellent communication skills</li>
                          <li>Professional appearance and demeanor</li>
                          <li>Background in real estate or mortgage industry (preferred)</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full sm:w-auto">
                      <a href="#application-form">Apply Now</a>
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Mobile Notary - General</span>
                      <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                        Part-Time
                      </span>
                    </CardTitle>
                    <CardDescription>Houston, TX (Greater Houston Area) • Remote/Mobile</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p>
                        Join our team as a part-time Mobile Notary to provide general notary services to clients
                        throughout the Houston area. This position is perfect for those looking for flexible work hours.
                      </p>

                      <div>
                        <h4 className="font-semibold mb-2">Requirements:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Active Texas Notary Public commission</li>
                          <li>Reliable transportation and valid driver's license</li>
                          <li>Excellent customer service skills</li>
                          <li>Ability to work evenings and weekends as needed</li>
                          <li>Professional appearance and demeanor</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full sm:w-auto">
                      <a href="#application-form">Apply Now</a>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="admin">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Appointment Coordinator</span>
                      <span className="text-sm font-medium px-3 py-1 bg-green-100 text-green-800 rounded-full">
                        Full-Time
                      </span>
                    </CardTitle>
                    <CardDescription>Houston, TX • Remote with occasional office visits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p>
                        We're looking for an organized and detail-oriented Appointment Coordinator to manage our
                        scheduling system and coordinate appointments between clients and our mobile notaries.
                      </p>

                      <div>
                        <h4 className="font-semibold mb-2">Requirements:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Excellent organizational and time management skills</li>
                          <li>Strong communication abilities (phone and email)</li>
                          <li>Experience with scheduling software</li>
                          <li>Ability to multitask in a fast-paced environment</li>
                          <li>Customer service experience</li>
                          <li>Knowledge of notary services (preferred)</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full sm:w-auto">
                      <a href="#application-form">Apply Now</a>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="other">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Business Development Representative</span>
                      <span className="text-sm font-medium px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                        Contract
                      </span>
                    </CardTitle>
                    <CardDescription>Houston, TX • Hybrid</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p>
                        We're seeking a motivated Business Development Representative to help grow our partnerships with
                        real estate agencies, title companies, law firms, and other businesses that regularly need
                        notary services.
                      </p>

                      <div>
                        <h4 className="font-semibold mb-2">Requirements:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Sales or business development experience</li>
                          <li>Strong networking abilities</li>
                          <li>Excellent communication and presentation skills</li>
                          <li>Knowledge of the real estate or legal industry (preferred)</li>
                          <li>Self-motivated with ability to work independently</li>
                          <li>Experience with CRM software</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full sm:w-auto">
                      <a href="#application-form">Apply Now</a>
                    </Button>
                  </CardFooter>
                </Card>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <h3 className="text-xl font-semibold text-blue-800 mb-3">
                    Don't see a position that fits your skills?
                  </h3>
                  <p className="text-blue-700 mb-4">
                    We're always interested in connecting with talented professionals. Submit your resume for future
                    opportunities.
                  </p>
                  <Button asChild variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    <a href="#application-form">Submit General Application</a>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Application Process Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Application Process</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've designed a straightforward process to help you join our team quickly and efficiently.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative pl-12 pb-12 md:pb-0">
                <div className="absolute left-0 top-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-blue-200 md:bottom-auto md:h-full"></div>
                <h3 className="text-xl font-bold mb-2">Application Submission</h3>
                <p className="text-gray-600">
                  Complete our online application form with your personal information, qualifications, and experience.
                  Attach your resume and any relevant certifications.
                </p>
              </div>

              <div className="relative pl-12 pb-12 md:pb-0">
                <div className="absolute left-0 top-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-blue-200 md:bottom-auto md:h-full"></div>
                <h3 className="text-xl font-bold mb-2">Initial Review</h3>
                <p className="text-gray-600">
                  Our team will review your application and reach out to schedule a phone interview if your
                  qualifications match our needs.
                </p>
              </div>

              <div className="relative pl-12 pb-12 md:pb-0">
                <div className="absolute left-0 top-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-blue-200 md:bottom-auto md:h-full"></div>
                <h3 className="text-xl font-bold mb-2">Interview & Assessment</h3>
                <p className="text-gray-600">
                  Qualified candidates will participate in a video or in-person interview. For notary positions, we may
                  also assess your knowledge of notarial procedures.
                </p>
              </div>

              <div className="relative pl-12">
                <div className="absolute left-0 top-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  4
                </div>
                <h3 className="text-xl font-bold mb-2">Onboarding</h3>
                <p className="text-gray-600">
                  Successful candidates will receive an offer and begin our onboarding process, which includes training,
                  system setup, and integration with our team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Day in the Life Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">A Day in the Life</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Wonder what it's like to work as a mobile notary with us? Here's a glimpse into a typical day.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/placeholder.svg?height=600&width=800"
                alt="Mobile notary at work"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Morning: Planning Your Day</h3>
                  <p className="text-gray-600">
                    Check your schedule for the day's appointments. Review document requirements for each signing. Plan
                    your route to maximize efficiency.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center">
                  <BriefcaseIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Midday: On the Road</h3>
                  <p className="text-gray-600">
                    Travel to client locations throughout Houston. Conduct professional signing appointments, guiding
                    clients through their documents. Document each notarization properly.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Evening: Wrapping Up</h3>
                  <p className="text-gray-600">
                    Complete any required follow-up tasks. Submit appointment reports through our system. Prepare your
                    notary supplies for the next day.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get answers to common questions about working with Houston Mobile Notary Pros.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">Do I need to be a notary already to apply?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600">
                    For notary positions, yes, you must already have an active Texas Notary Public commission. For
                    administrative or other roles, this is not required. If you're interested in becoming a notary but
                    aren't commissioned yet, we can provide guidance on the process after hiring.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">What areas of Houston do you serve?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600">
                    We serve the entire Greater Houston area, including all surrounding suburbs and counties. When you
                    join our team, you can indicate your preferred service areas, and we'll try to match you with
                    appointments in those locations.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">How much can I expect to earn?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600">
                    Earnings vary based on your role, experience, and the number of appointments you complete. For
                    notary positions, you'll receive a percentage of each appointment fee plus travel compensation. Full
                    details about our compensation structure will be discussed during the interview process.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">Do you provide training?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600">
                    Yes! All team members receive comprehensive training on our systems, procedures, and customer
                    service standards. For notary positions, we also provide ongoing education about document types,
                    industry updates, and best practices.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">What equipment do I need as a mobile notary?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600">
                    You'll need reliable transportation, a smartphone with our scheduling app, your notary supplies
                    (stamp, journal, etc.), and professional attire. Depending on the types of signings you'll handle,
                    you may also need a printer, scanner, and laptop.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">How quickly will I hear back after applying?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600">
                    We typically review applications within 3-5 business days. If your qualifications match our current
                    needs, you'll hear from us to schedule a phone interview. If we don't have an immediate opening that
                    matches your skills, we'll keep your application on file for future opportunities.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="application-form" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Apply to Join Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ready to take the next step? Complete the application form below, and we'll be in touch soon.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <CareerApplicationForm />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Have Questions About Joining Our Team?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            We're happy to discuss our opportunities in more detail. Reach out to our team directly.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              <a href="tel:+17135555555">Call (713) 555-5555</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

