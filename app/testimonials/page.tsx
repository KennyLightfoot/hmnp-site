import Link from "next/link"
import { Star, Quote, ArrowRight, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TestimonialCard from "@/components/testimonial-card"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Client Testimonials | Houston Mobile Notary Pros",
  description:
    "Read reviews and testimonials from satisfied clients who have used our mobile notary services in Houston and surrounding areas.",
  keywords:
    "notary testimonials, mobile notary reviews, Houston notary service reviews, client feedback, notary recommendations",
  openGraph: {
    title: "Client Testimonials | Houston Mobile Notary Pros",
    description: "Read what our clients say about our professional mobile notary services in Houston.",
    url: "/testimonials",
    type: "website",
  },
}

// Sample testimonial data - in a real implementation, this would come from a database
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "Houston, TX",
    service: "Essential Mobile Package",
    rating: 5,
    date: "June 15, 2023",
    content:
      "I needed a notary for my power of attorney documents and Houston Mobile Notary Pros made it so easy. The notary arrived on time, was professional, and efficiently handled all my documents. I highly recommend their services!",
    featured: true,
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    location: "Pearland, TX",
    service: "Loan Signing Service",
    rating: 5,
    date: "July 3, 2023",
    content:
      "Our loan signing went smoothly thanks to the professional service provided. The notary explained everything clearly and made sure all documents were properly executed. The process was much less stressful than I anticipated!",
  },
  {
    id: 3,
    name: "Jennifer Williams",
    location: "Sugar Land, TX",
    service: "Priority Service Package",
    rating: 4.5,
    date: "May 22, 2023",
    content:
      "I needed a notary urgently for some time-sensitive documents. I called in the morning and they had someone at my office by lunchtime. The service was prompt and professional. Would definitely use again!",
  },
  {
    id: 4,
    name: "David Thompson",
    location: "Katy, TX",
    service: "Reverse Mortgage Signing",
    rating: 5,
    date: "August 10, 2023",
    content:
      "The notary who handled our reverse mortgage signing was knowledgeable and patient. They took the time to ensure we understood each document before signing. Their expertise made a complex process much easier.",
  },
  {
    id: 5,
    name: "Lisa Chen",
    location: "The Woodlands, TX",
    service: "Weekend Service",
    rating: 5,
    date: "September 5, 2023",
    content:
      "I was impressed that they could accommodate my request for a Sunday appointment. The notary was professional and efficient, and the additional weekend fee was well worth the convenience. Great service!",
  },
  {
    id: 6,
    name: "Robert Garcia",
    location: "Galveston, TX",
    service: "Essential Mobile Package",
    rating: 4.5,
    date: "July 28, 2023",
    content:
      "Despite being at the edge of their service area, they arrived on time and provided excellent service. The notary was friendly and professional. I appreciated their willingness to travel to my location.",
  },
  {
    id: 7,
    name: "Emily Parker",
    location: "Baytown, TX",
    service: "Priority Service Package",
    rating: 5,
    date: "October 12, 2023",
    content:
      "When I needed a notary within hours for an urgent business document, Houston Mobile Notary Pros delivered. Their priority service is worth every penny. The notary arrived within the promised timeframe and was extremely professional.",
  },
  {
    id: 8,
    name: "James Wilson",
    location: "Missouri City, TX",
    service: "Loan Signing Service",
    rating: 5,
    date: "November 3, 2023",
    content:
      "As a first-time homebuyer, I was nervous about the closing process. The notary from Houston Mobile Notary Pros was patient and thorough, explaining each document without rushing us. Made the experience much less stressful!",
  },
  {
    id: 9,
    name: "Maria Gonzalez",
    location: "Friendswood, TX",
    service: "Essential Mobile Package",
    rating: 4.5,
    date: "December 7, 2023",
    content:
      "I needed several documents notarized for my small business, and Houston Mobile Notary Pros made it simple. The notary was knowledgeable and efficient. I'll definitely use their services again for future notarization needs.",
  },
  {
    id: 10,
    name: "Thomas Lee",
    location: "League City, TX",
    service: "Specialty Services",
    rating: 5,
    date: "January 15, 2024",
    content:
      "I required apostille services for international documents, which can be complicated. Houston Mobile Notary Pros handled everything professionally and kept me informed throughout the process. Excellent service!",
  },
  {
    id: 11,
    name: "Sophia Martinez",
    location: "Houston, TX",
    service: "Priority Service Package",
    rating: 5,
    date: "February 8, 2024",
    content:
      "When my closing documents needed to be signed immediately, Houston Mobile Notary Pros came through with their priority service. The notary arrived within 90 minutes of my call and was extremely professional. Worth every penny!",
  },
  {
    id: 12,
    name: "William Johnson",
    location: "Pearland, TX",
    service: "Loan Signing Service",
    rating: 5,
    date: "March 22, 2024",
    content:
      "Our refinance signing was handled perfectly. The notary arrived early, was well-prepared, and guided us through the mountain of paperwork efficiently. I would recommend Houston Mobile Notary Pros to anyone needing loan signing services.",
  },
]

// Group testimonials by service type for the tabs
const essentialTestimonials = testimonials.filter((t) => t.service.includes("Essential"))
const priorityTestimonials = testimonials.filter((t) => t.service.includes("Priority"))
const loanTestimonials = testimonials.filter((t) => t.service.includes("Loan") || t.service.includes("Mortgage"))
const specialtyTestimonials = testimonials.filter(
  (t) => t.service.includes("Specialty") || t.service.includes("Weekend"),
)

// Featured testimonials
const featuredTestimonials = testimonials.filter((t) => t.featured || t.rating === 5).slice(0, 3)

export default function TestimonialsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-[#002147] mb-4">Client Testimonials</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Read what our clients have to say about our mobile notary services. We're proud to have served hundreds of
          satisfied customers throughout the Houston area.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-[#002147] text-white p-8 rounded-lg text-center">
          <div className="flex justify-center mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <p className="text-4xl font-bold mb-2">4.9/5</p>
          <p className="text-sm">Average Rating</p>
        </div>
        <div className="bg-[#A52A2A] text-white p-8 rounded-lg text-center">
          <div className="text-4xl font-bold mb-2">500+</div>
          <p className="text-sm">Satisfied Clients</p>
        </div>
        <div className="bg-[#91A3B0] text-white p-8 rounded-lg text-center">
          <div className="text-4xl font-bold mb-2">95%</div>
          <p className="text-sm">5-Star Reviews</p>
        </div>
      </div>

      {/* Featured Testimonials */}
      <div className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-[#002147]">Featured Testimonials</h2>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featuredTestimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              name={testimonial.name}
              location={testimonial.location}
              service={testimonial.service}
              rating={testimonial.rating}
              date={testimonial.date}
              content={testimonial.content}
              featured={testimonial.featured}
            />
          ))}
        </div>
      </div>

      {/* Testimonials by Service Type */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-8">Client Reviews by Service</h2>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
            <TabsTrigger value="all">All Reviews</TabsTrigger>
            <TabsTrigger value="essential">Essential Service</TabsTrigger>
            <TabsTrigger value="priority">Priority Service</TabsTrigger>
            <TabsTrigger value="loan">Loan Signing</TabsTrigger>
            <TabsTrigger value="specialty">Specialty Services</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  name={testimonial.name}
                  location={testimonial.location}
                  service={testimonial.service}
                  rating={testimonial.rating}
                  date={testimonial.date}
                  content={testimonial.content}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="essential">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {essentialTestimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  name={testimonial.name}
                  location={testimonial.location}
                  service={testimonial.service}
                  rating={testimonial.rating}
                  date={testimonial.date}
                  content={testimonial.content}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="priority">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {priorityTestimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  name={testimonial.name}
                  location={testimonial.location}
                  service={testimonial.service}
                  rating={testimonial.rating}
                  date={testimonial.date}
                  content={testimonial.content}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="loan">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loanTestimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  name={testimonial.name}
                  location={testimonial.location}
                  service={testimonial.service}
                  rating={testimonial.rating}
                  date={testimonial.date}
                  content={testimonial.content}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="specialty">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specialtyTestimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  name={testimonial.name}
                  location={testimonial.location}
                  service={testimonial.service}
                  rating={testimonial.rating}
                  date={testimonial.date}
                  content={testimonial.content}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Trusted By Section */}
      <div className="mb-16 bg-gray-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-[#002147] mb-8 text-center">Trusted By</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center h-24">
            <div className="text-center">
              <p className="font-semibold text-gray-700">Houston Title Co.</p>
              <p className="text-xs text-gray-500">Real Estate Services</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center h-24">
            <div className="text-center">
              <p className="font-semibold text-gray-700">Gulf Coast Lending</p>
              <p className="text-xs text-gray-500">Mortgage Services</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center h-24">
            <div className="text-center">
              <p className="font-semibold text-gray-700">Bayou City Realty</p>
              <p className="text-xs text-gray-500">Real Estate Agency</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center h-24">
            <div className="text-center">
              <p className="font-semibold text-gray-700">Texas Legal Group</p>
              <p className="text-xs text-gray-500">Law Firm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leave a Review CTA */}
      <div className="mb-16 bg-[#002147] text-white p-8 rounded-lg">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">Share Your Experience</h2>
            <p className="mb-6">
              We value your feedback! If you've used our services, please take a moment to share your experience. Your
              review helps us improve and helps others find reliable notary services in Houston.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/reviews">
                <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] text-white">
                  Leave a Review
                </Button>
              </Link>
            </div>
          </div>
          <div className="bg-white/10 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Also Review Us On</h3>
            <div className="grid grid-cols-3 gap-4">
              <a
                href="https://g.co/kgs/HqnKqcz"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 p-4 rounded-lg text-center transition-colors"
              >
                <p className="font-semibold">Google</p>
              </a>
              <a
                href="https://www.facebook.com/profile.php?viewas=100000686899395&id=61556113852881"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 p-4 rounded-lg text-center transition-colors"
              >
                <p className="font-semibold">Facebook</p>
              </a>
              <a
                href="https://www.yelp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 hover:bg-white/30 p-4 rounded-lg text-center transition-colors"
              >
                <p className="font-semibold">Yelp</p>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Video Testimonials */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-[#002147] mb-8">Video Testimonials</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-200 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
            <div className="text-center p-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Video testimonial coming soon</p>
            </div>
          </div>
          <div className="bg-gray-200 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
            <div className="text-center p-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Video testimonial coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Quote */}
      <div className="mb-16 relative">
        <div className="absolute top-0 left-0 text-[#002147]/5">
          <Quote className="h-24 w-24" />
        </div>
        <div className="relative z-10 text-center max-w-3xl mx-auto px-8 py-12">
          <p className="text-2xl italic text-[#002147] mb-6">
            "Houston Mobile Notary Pros has been our go-to notary service for all our real estate transactions. Their
            reliability, professionalism, and flexibility have made them an invaluable partner for our business."
          </p>
          <div className="font-semibold text-[#A52A2A]">- James Wilson, Broker</div>
          <div className="text-sm text-gray-600">Bayou City Realty</div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-[#A52A2A] text-white p-8 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-4">Experience Our Award-Winning Service</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Join our hundreds of satisfied clients and experience the convenience and professionalism of Houston Mobile
          Notary Pros.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/booking">
            <Button size="lg" className="bg-white text-[#A52A2A] hover:bg-gray-100">
              Book Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/services">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
              Explore Our Services
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
