import Link from 'next/link'
import { getSortedPostsData, PostData } from '@/lib/posts'
import { format } from 'date-fns'
import type { Metadata } from "next"
import { Calendar, User, Clock, ArrowRight, BookOpen, Star, TrendingUp, FileText, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Blog | Houston Mobile Notary Pros",
  description:
    "Read the latest news, tips, and insights from Houston Mobile Notary Pros. Stay informed about notary services, loan signings, and more.",
  keywords: "notary blog, Houston notary, mobile notary tips, loan signing advice",
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: "Blog | Houston Mobile Notary Pros",
    description: "Stay updated with the latest from Houston Mobile Notary Pros blog.",
    url: `${BASE_URL}/blog`,
    siteName: 'Houston Mobile Notary Pros',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Houston Mobile Notary Pros Blog',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Blog | Houston Mobile Notary Pros",
    description: "News, tips, and insights on notary services from HMNP.",
    images: [`${BASE_URL}/og-image.jpg`],
  },
}

export default function BlogIndex() {
  const allPostsData = getSortedPostsData()
  
  // Blog categories for filtering
  const blogCategories = [
    { name: 'All Posts', value: 'all', count: allPostsData.length },
    { name: 'Notary Tips', value: 'tips', count: Math.floor(allPostsData.length * 0.3) },
    { name: 'Loan Signings', value: 'loan-signing', count: Math.floor(allPostsData.length * 0.25) },
    { name: 'Business Services', value: 'business', count: Math.floor(allPostsData.length * 0.2) },
    { name: 'Industry News', value: 'news', count: Math.floor(allPostsData.length * 0.15) },
    { name: 'Customer Stories', value: 'stories', count: Math.floor(allPostsData.length * 0.1) }
  ]

  // Featured post (first post gets featured treatment)
  const featuredPost = allPostsData[0]
  const regularPosts = allPostsData.slice(1)

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#002147]/5 via-[#A52A2A]/5 to-[#002147]/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-[#002147] tracking-tight mb-6">
            HMNP Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Stay informed with the latest notary industry insights, helpful tips, and updates from Houston Mobile Notary Pros
          </p>
          
          {/* Blog Stats */}
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-[#A52A2A]">{allPostsData.length}</div>
              <div className="text-sm text-gray-600">Total Posts</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-[#A52A2A]">500+</div>
              <div className="text-sm text-gray-600">Monthly Readers</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-[#A52A2A]">4.9★</div>
              <div className="text-sm text-gray-600">Reader Rating</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-[#A52A2A]">Weekly</div>
              <div className="text-sm text-gray-600">New Content</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search blog posts..." 
                className="pl-10 pr-4 py-3 border-2 border-[#002147]/20 focus:border-[#A52A2A]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="bg-[#A52A2A] text-white px-3 py-1 mb-4">
                Featured Post
              </Badge>
              <h2 className="text-3xl font-bold text-[#002147] mb-4">Latest from Our Blog</h2>
            </div>
            
            <Card className="max-w-4xl mx-auto border-2 border-[#A52A2A]/20 hover:border-[#A52A2A]/40 transition-all duration-300 hover:shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(featuredPost.date), 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{featuredPost.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>5 min read</span>
                  </div>
                </div>
                <CardTitle className="text-2xl md:text-3xl text-[#002147] mb-3">
                  <Link href={`/blog/${featuredPost.id}`} className="hover:text-[#A52A2A] transition-colors duration-200">
                    {featuredPost.title}
                  </Link>
                </CardTitle>
                <p className="text-lg text-gray-600 leading-relaxed">{featuredPost.excerpt}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">Featured content</span>
                  </div>
                  <Button className="bg-[#A52A2A] hover:bg-[#8B0000]" asChild>
                    <Link href={`/blog/${featuredPost.id}`}>
                      Read Full Article
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {blogCategories.map((category) => (
              <Button
                key={category.value}
                variant="outline"
                size="sm"
                className={`${
                  category.value === 'all' 
                    ? 'bg-[#002147] text-white border-[#002147] hover:bg-[#001a38]' 
                    : 'hover:border-[#A52A2A] hover:text-[#A52A2A]'
                }`}
              >
                {category.name}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Regular Posts Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#002147] mb-4">All Blog Posts</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse our complete collection of helpful articles and industry insights
            </p>
          </div>

          <div className="grid gap-8 max-w-6xl mx-auto">
            {regularPosts.map(({ id, date, title, excerpt, author }: PostData) => (
              <Card 
                key={id} 
                className="border border-gray-200 hover:border-[#002147]/30 transition-all duration-300 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <article>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(date), 'MMMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>3-5 min read</span>
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-semibold text-[#002147] mb-3 hover:text-[#A52A2A] transition-colors duration-200">
                      <Link href={`/blog/${id}`} className="hover:underline">
                        {title}
                      </Link>
                    </h2>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed">{excerpt}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-[#A52A2A]" />
                        <span className="text-sm text-gray-600">Notary Tips</span>
                      </div>
                      <Link 
                        href={`/blog/${id}`} 
                        className="text-[#002147] font-medium hover:text-[#A52A2A] transition-colors duration-200 flex items-center gap-1"
                      >
                        Read more
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gradient-to-r from-[#002147] to-[#001a38] text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl text-gray-200 mb-8">
              Get the latest notary tips, industry news, and service updates delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Input 
                placeholder="Enter your email address" 
                className="flex-1 max-w-md text-gray-900"
              />
              <Button className="bg-[#A52A2A] hover:bg-[#8B0000] px-8">
                Subscribe
              </Button>
            </div>
            <p className="text-sm text-gray-300 mt-4">
              No spam, unsubscribe at any time. We respect your privacy.
            </p>
          </div>
        </div>
      </section>

      {/* Related Services CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#002147] mb-6">Need Notary Services?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Ready to put our expertise to work? Book your mobile notary service today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[#A52A2A] hover:bg-[#8B0000] h-12 px-8" asChild>
              <Link href="/booking">
                <FileText className="h-5 w-5 mr-2" />
                Book Now
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8" asChild>
              <Link href="/services">
                <TrendingUp className="h-5 w-5 mr-2" />
                View Services
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
} 