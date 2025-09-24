import Link from 'next/link'
import { getSortedPostsData, PostData } from '@/lib/posts'
import { format } from 'date-fns'
import type { Metadata } from "next"

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
        url: '/og-image.jpg', // Use a relevant OG image for the blog
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
    images: [`${BASE_URL}/og-image.jpg`], // Must be an absolute URL
  },
}

export default function BlogIndex() {
  const allPostsData = getSortedPostsData()

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center text-[#002147] mb-12">HMNP Blog</h1>
      <div className="grid gap-8 max-w-3xl mx-auto">
        {allPostsData.map(({ id, date, title, excerpt, author }: PostData) => (
          <article key={id} className="border-b pb-8 last:border-b-0">
            <h2 className="text-2xl font-semibold text-[#A52A2A] mb-2">
              <Link href={`/blog/${id}`} className="hover:underline">
                {title}
              </Link>
            </h2>
            <div className="text-sm text-gray-500 mb-3">
              <span>{format(new Date(date), 'MMMM d, yyyy')}</span> by <span>{author}</span>
            </div>
            <p className="text-gray-700 mb-4">{excerpt}</p>
            <Link href={`/blog/${id}`} className="text-[#002147] font-medium hover:underline">
              Read more &rarr;
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
} 