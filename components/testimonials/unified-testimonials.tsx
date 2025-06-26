"use client";

import { useState, useEffect } from 'react';
import { Star, StarHalf, ChevronLeft, ChevronRight, Quote, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// ===========================================
// TYPES AND INTERFACES
// ===========================================

export interface Testimonial {
  id: number;
  name: string;
  location: string;
  service: string;
  rating: number;
  date: string;
  content: string;
  featured?: boolean;
  verified?: boolean;
  avatar?: string;
}

export interface TestimonialDisplayProps {
  testimonials?: Testimonial[];
  variant?: 'card' | 'carousel' | 'section' | 'page';
  itemsToShow?: number;
  showTabs?: boolean;
  showNavigation?: boolean;
  showRating?: boolean;
  showStats?: boolean;
  className?: string;
  title?: string;
  description?: string;
}

// ===========================================
// TESTIMONIAL DATA (Centralized)
// ===========================================

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "Houston, TX",
    service: "Essential Mobile Package",
    rating: 5,
    date: "June 15, 2023",
    content: "I needed a notary for my power of attorney documents and Houston Mobile Notary Pros made it so easy. The notary arrived on time, was professional, and efficiently handled all my documents. I highly recommend their services!",
    featured: true,
    verified: true,
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    location: "Pearland, TX",
    service: "Loan Signing Service",
    rating: 5,
    date: "July 3, 2023",
    content: "Our loan signing went smoothly thanks to the professional service provided. The notary explained everything clearly and made sure all documents were properly executed. The process was much less stressful than I anticipated!",
    verified: true,
  },
  {
    id: 3,
    name: "Jennifer Williams",
    location: "Sugar Land, TX",
    service: "Priority Service Package",
    rating: 4.5,
    date: "May 22, 2023",
    content: "I needed a notary urgently for some time-sensitive documents. I called in the morning and they had someone at my office by lunchtime. The service was prompt and professional. Would definitely use again!",
    verified: true,
  },
  {
    id: 4,
    name: "David Thompson",
    location: "Katy, TX",
    service: "Reverse Mortgage Signing",
    rating: 5,
    date: "August 10, 2023",
    content: "The notary who handled our reverse mortgage signing was knowledgeable and patient. They took the time to ensure we understood each document before signing. Their expertise made a complex process much easier.",
    verified: true,
  },
  {
    id: 5,
    name: "Lisa Chen",
    location: "The Woodlands, TX",
    service: "Weekend Service",
    rating: 5,
    date: "September 5, 2023",
    content: "I was impressed that they could accommodate my request for a Sunday appointment. The notary was professional and efficient, and the additional weekend fee was well worth the convenience. Great service!",
    verified: true,
  },
  {
    id: 6,
    name: "Robert Garcia",
    location: "Galveston, TX",
    service: "Essential Mobile Package",
    rating: 4.5,
    date: "July 28, 2023",
    content: "Despite being at the edge of their service area, they arrived on time and provided excellent service. The notary was friendly and professional. I appreciated their willingness to travel to my location.",
    verified: true,
  },
  {
    id: 7,
    name: "Emily Parker",
    location: "Baytown, TX",
    service: "Priority Service Package",
    rating: 5,
    date: "October 12, 2023",
    content: "When I needed a notary within hours for an urgent business document, Houston Mobile Notary Pros delivered. Their priority service is worth every penny. The notary arrived within the promised timeframe and was extremely professional.",
    verified: true,
  },
  {
    id: 8,
    name: "James Wilson",
    location: "Missouri City, TX",
    service: "Loan Signing Service",
    rating: 5,
    date: "November 3, 2023",
    content: "As a first-time homebuyer, I was nervous about the closing process. The notary from Houston Mobile Notary Pros was patient and thorough, explaining each document without rushing us. Made the experience much less stressful!",
    verified: true,
  },
  {
    id: 9,
    name: "Maria Gonzalez",
    location: "Friendswood, TX",
    service: "Essential Mobile Package",
    rating: 4.5,
    date: "December 7, 2023",
    content: "I needed several documents notarized for my small business, and Houston Mobile Notary Pros made it simple. The notary was knowledgeable and efficient. I'll definitely use their services again for future notarization needs.",
    verified: true,
  },
  {
    id: 10,
    name: "Thomas Lee",
    location: "League City, TX",
    service: "Specialty Services",
    rating: 5,
    date: "January 15, 2024",
    content: "I required apostille services for international documents, which can be complicated. Houston Mobile Notary Pros handled everything professionally and kept me informed throughout the process. Excellent service!",
    verified: true,
  },
  {
    id: 11,
    name: "Sophia Martinez",
    location: "Houston, TX",
    service: "Priority Service Package",
    rating: 5,
    date: "February 8, 2024",
    content: "When my closing documents needed to be signed immediately, Houston Mobile Notary Pros came through with their priority service. The notary arrived within 90 minutes of my call and was extremely professional. Worth every penny!",
    verified: true,
  },
  {
    id: 12,
    name: "William Johnson",
    location: "Pearland, TX",
    service: "Loan Signing Service",
    rating: 5,
    date: "March 22, 2024",
    content: "Our refinance signing was handled perfectly. The notary arrived early, was well-prepared, and guided us through the mountain of paperwork efficiently. I would recommend Houston Mobile Notary Pros to anyone needing loan signing services.",
    verified: true,
  },
];

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

function renderStars(rating: number) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-[#A52A2A] text-[#A52A2A]" />);
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-[#A52A2A] text-[#A52A2A]" />);
  }

  // Add empty stars to make 5 total
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-star-${i}`} className="h-4 w-4 text-gray-300" />);
  }

  return stars;
}

function calculateStats(testimonials: Testimonial[]) {
  const totalReviews = testimonials.length;
  const averageRating = testimonials.reduce((sum, t) => sum + t.rating, 0) / totalReviews;
  const fiveStarCount = testimonials.filter(t => t.rating === 5).length;
  const fiveStarPercentage = Math.round((fiveStarCount / totalReviews) * 100);
  
  return {
    totalReviews,
    averageRating: Math.round(averageRating * 10) / 10,
    fiveStarPercentage
  };
}

function groupTestimonialsByService(testimonials: Testimonial[]) {
  return {
    all: testimonials,
    standard: testimonials.filter(t => t.service.includes('Standard') || t.service.includes('Essential')),
    extended: testimonials.filter(t => t.service.includes('Extended') || t.service.includes('Priority')),
    loan: testimonials.filter(t => t.service.includes('Loan') || t.service.includes('Mortgage')),
    specialty: testimonials.filter(t => t.service.includes('Specialty') || t.service.includes('Weekend')),
  };
}

// ===========================================
// TESTIMONIAL CARD COMPONENT
// ===========================================

interface TestimonialCardProps {
  testimonial: Testimonial;
  featured?: boolean;
  compact?: boolean;
}

function TestimonialCard({ testimonial, featured = false, compact = false }: TestimonialCardProps) {
  return (
    <Card
      className={cn(
        'h-full transition-shadow duration-300',
        featured || testimonial.featured
          ? 'border-[#A52A2A] shadow-lg'
          : 'border-gray-200 shadow-md hover:shadow-lg',
        compact && 'text-sm'
      )}
    >
      {(featured || testimonial.featured) && (
        <div className="bg-[#A52A2A] text-white text-center py-1 text-sm font-medium">
          Featured Review
        </div>
      )}
      <CardContent className={cn('pt-6', compact && 'pt-4 pb-2')}>
        <div className="flex items-center mb-4">
          {renderStars(testimonial.rating)}
          {testimonial.verified && (
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              Verified
            </span>
          )}
        </div>
        <blockquote className={cn(
          'text-gray-700 italic mb-4',
          compact && 'text-sm mb-2 line-clamp-3'
        )}>
          "{testimonial.content}"
        </blockquote>
      </CardContent>
      <CardFooter className={cn(
        'border-t bg-gray-50 flex flex-col items-start pt-4',
        compact && 'pt-2 pb-3'
      )}>
        <div className="font-semibold text-[#002147]">{testimonial.name}</div>
        <div className="text-sm text-gray-600">{testimonial.location}</div>
        <div className="flex justify-between w-full mt-2 text-xs text-gray-500">
          <span>{testimonial.service}</span>
          <span>{testimonial.date}</span>
        </div>
      </CardFooter>
    </Card>
  );
}

// ===========================================
// MAIN UNIFIED TESTIMONIALS COMPONENT
// ===========================================

export default function UnifiedTestimonials({
  testimonials = DEFAULT_TESTIMONIALS,
  variant = 'section',
  itemsToShow = 3,
  showTabs = false,
  showNavigation = true,
  showRating = true,
  showStats = false,
  className,
  title = "What Our Clients Say",
  description = "Read testimonials from satisfied clients who have used our mobile notary services"
}: TestimonialDisplayProps) {
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const stats = calculateStats(testimonials);
  const groupedTestimonials = groupTestimonialsByService(testimonials);
  const featuredTestimonials = testimonials.filter(t => t.featured || t.rating === 5).slice(0, 3);
  
  // Carousel navigation
  const nextSlide = () => {
    const itemsToDisplay = isMobile ? 1 : itemsToShow;
    const newIndex = currentIndex + itemsToDisplay;
    if (newIndex < testimonials.length) {
      setCurrentIndex(newIndex);
    } else {
      setCurrentIndex(0);
    }
  };

  const prevSlide = () => {
    const itemsToDisplay = isMobile ? 1 : itemsToShow;
    const newIndex = currentIndex - itemsToDisplay;
    if (newIndex >= 0) {
      setCurrentIndex(newIndex);
    } else {
      setCurrentIndex(Math.max(0, testimonials.length - itemsToDisplay));
    }
  };

  const visibleTestimonials = testimonials.slice(
    currentIndex,
    currentIndex + (isMobile ? 1 : itemsToShow)
  );

  // ===========================================
  // RENDER VARIANTS
  // ===========================================

  if (variant === 'card') {
    return (
      <div className={className}>
        <TestimonialCard testimonial={testimonials[0]} />
      </div>
    );
  }

  if (variant === 'carousel') {
    return (
      <div className={cn('w-full py-12', className)}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#002147] mb-4">{title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          {showNavigation && (
            <>
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-4 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-white shadow-md hover:bg-gray-100"
                  onClick={prevSlide}
                  aria-label="Previous testimonials"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>

              <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-4 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-white shadow-md hover:bg-gray-100"
                  onClick={nextSlide}
                  aria-label="Next testimonials"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </>
          )}

          {/* Testimonial Cards */}
          <div className="px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visibleTestimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  compact={variant === 'carousel'}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-8">
          {Array.from({ 
            length: Math.ceil(testimonials.length / (isMobile ? 1 : itemsToShow)) 
          }).map((_, index) => (
            <button
              key={index}
              className={cn(
                'h-2 w-2 rounded-full mx-1',
                index === Math.floor(currentIndex / (isMobile ? 1 : itemsToShow))
                  ? 'bg-[#A52A2A]'
                  : 'bg-gray-300 hover:bg-gray-400'
              )}
              onClick={() => setCurrentIndex(index * (isMobile ? 1 : itemsToShow))}
              aria-label={`Go to testimonial group ${index + 1}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'section') {
    return (
      <section className={cn('py-16 bg-gray-50', className)}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block bg-[#91A3B0]/20 px-4 py-2 rounded-full mb-4">
              <span className="text-[#002147] font-medium">Client Testimonials</span>
            </div>
            <h2 className="text-3xl font-bold text-[#002147] mb-4">{title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{description}</p>
          </div>

          {showStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-[#002147] text-white p-8 rounded-lg text-center">
                <div className="flex justify-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-4xl font-bold mb-2">{stats.averageRating}/5</p>
                <p className="text-sm">Average Rating</p>
              </div>
              <div className="bg-[#A52A2A] text-white p-8 rounded-lg text-center">
                <div className="text-4xl font-bold mb-2">{stats.totalReviews}+</div>
                <p className="text-sm">Satisfied Clients</p>
              </div>
              <div className="bg-[#91A3B0] text-white p-8 rounded-lg text-center">
                <div className="text-4xl font-bold mb-2">{stats.fiveStarPercentage}%</div>
                <p className="text-sm">5-Star Reviews</p>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-md mb-12">
            {showRating && (
              <div className="flex justify-center mb-6">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
            )}
            
            <UnifiedTestimonials
              testimonials={testimonials}
              variant="carousel"
              itemsToShow={itemsToShow}
              showNavigation={showNavigation}
              title=""
              description=""
            />
          </div>

          <div className="text-center">
            <Link href="/testimonials">
              <Button variant="outline" className="border-[#002147] text-[#002147] hover:bg-[#002147] hover:text-white">
                View All Testimonials
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'page') {
    return (
      <div className={cn('container mx-auto px-4 py-12', className)}>
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[#002147] mb-4">{title}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{description}</p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#002147] text-white p-8 rounded-lg text-center">
            <div className="flex justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-4xl font-bold mb-2">{stats.averageRating}/5</p>
            <p className="text-sm">Average Rating</p>
          </div>
          <div className="bg-[#A52A2A] text-white p-8 rounded-lg text-center">
            <div className="text-4xl font-bold mb-2">{stats.totalReviews}+</div>
            <p className="text-sm">Satisfied Clients</p>
          </div>
          <div className="bg-[#91A3B0] text-white p-8 rounded-lg text-center">
            <div className="text-4xl font-bold mb-2">{stats.fiveStarPercentage}%</div>
            <p className="text-sm">5-Star Reviews</p>
          </div>
        </div>

        {/* Featured Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-[#002147] mb-8">Featured Testimonials</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredTestimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                featured={true}
              />
            ))}
          </div>
        </div>

        {/* Testimonials by Service Type */}
        {showTabs && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-[#002147] mb-8">Client Reviews by Service</h2>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
                <TabsTrigger value="all">All Reviews</TabsTrigger>
                <TabsTrigger value="standard">Standard Service</TabsTrigger>
                <TabsTrigger value="extended">Extended Hours</TabsTrigger>
                <TabsTrigger value="loan">Loan Signing</TabsTrigger>
                <TabsTrigger value="specialty">Specialty Services</TabsTrigger>
              </TabsList>
              
              {Object.entries(groupedTestimonials).map(([key, testimonialGroup]) => (
                <TabsContent key={key} value={key}>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonialGroup.map((testimonial) => (
                      <TestimonialCard
                        key={testimonial.id}
                        testimonial={testimonial}
                      />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

        {/* Quote Section */}
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
    );
  }

  // Default fallback
  return (
    <div className={className}>
      <div className="grid gap-6">
        {testimonials.slice(0, itemsToShow).map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>
    </div>
  );
}