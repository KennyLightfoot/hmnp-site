import { getAllBlogSlugs, getBlogBySlug, type BlogPost } from '@/lib/blogs'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import type { Metadata, ResolvingMetadata } from 'next'
import { Button } from '@/components/ui/button'

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

type Props = {
  params: Promise<{ slug: string }>
}

// Function to generate metadata dynamically
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug
  try {
    const post = await getBlogBySlug(slug)

    // Optionally merge with parent metadata
    // const previousImages = (await parent).openGraph?.images || []

    return {
      metadataBase: new URL(BASE_URL),
      title: `${post.title} | HMNP Blog`,
      description: post.metaDescription || post.summary, // Use metaDescription or summary
      keywords: `notary blog, ${post.title}, Houston notary, mobile notary`,
      alternates: {
        canonical: `/blog/${slug}`,
      },
      openGraph: {
        title: `${post.title} | HMNP Blog`,
        description: post.metaDescription || post.summary,
        url: `${BASE_URL}/blog/${slug}`,
        type: 'article',
        publishedTime: new Date(post.date).toISOString(),
        authors: [post.author],
        images: [
          {
            url: '/og-image.jpg', // Consider using post-specific images later
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${post.title} | HMNP Blog`,
        description: post.metaDescription || post.summary,
        images: [`${BASE_URL}/og-image.jpg`],
      },
    }
  } catch (error) {
    // Handle case where post is not found
    console.error(`Metadata generation failed for slug ${slug}:`, error);
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    }
  }
}

// Generate static paths for all posts at build time
export async function generateStaticParams() {
  const slugs = getAllBlogSlugs()
  return slugs.map((slug) => ({ slug }))
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  let post: BlogPost | null = null;
  const resolvedParams = await params;
  try {
    post = await getBlogBySlug(resolvedParams.slug)
  } catch (error) {
      console.error("Failed to fetch post data:", error);
      notFound(); // Render the 404 page if post isn't found
  }

  if (!post) {
      notFound(); // Should be caught by try/catch, but good practice
  }

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
       <Link href="/blog" className="text-[#002147] hover:underline mb-8 inline-block">
        &larr; Back to Blog
      </Link>
      <h1 className="text-4xl font-bold text-[#A52A2A] mb-4">{post.title}</h1>
      <div className="text-sm text-gray-500 mb-8">
        <span>{format(new Date(post.date), 'MMMM d, yyyy')}</span> by <span>{post.author}</span>
      </div>
      {/* Render the markdown content */}
      {/* Add prose class for basic Tailwind typography styles */}
      <div className="prose lg:prose-xl max-w-none prose-headings:text-[#002147] prose-a:text-[#A52A2A] hover:prose-a:underline prose-strong:text-[#002147]">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* CTA Section */}
      <section className="mt-8 border-t pt-6">
        <h2 className="text-xl font-semibold text-[#002147]">Need help with your documents?</h2>
        <p className="mt-2 text-gray-600">
          If you&apos;re in Texas City, Webster, Clear Lake, or the Houston area and
          need a notary to come to you — evenings, weekends, or at a hospital —
          we&apos;ve got you covered.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild className="bg-[#A52A2A] hover:bg-[#8B0000]">
            <Link href="/booking">Book a mobile notary</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">Ask a question first</Link>
          </Button>
        </div>
      </section>
    </article>
  )
} 