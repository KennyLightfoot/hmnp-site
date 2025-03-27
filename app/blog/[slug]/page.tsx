import { getBlogPostBySlug, getRelatedBlogPosts } from "@/data/blog-posts"
import { notFound } from "next/navigation"
import Link from "next/link"

export async function generateStaticParams() {
  const { blogPosts } = await import("@/data/blog-posts")
  return blogPosts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedBlogPosts(post, 3)

  return (
    <div className="container mx-auto py-8">
      <Link href="/blog" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to all posts
      </Link>

      {post.coverImage && (
        <img
          src={post.coverImage || "/placeholder.svg"}
          alt={post.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}

      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      <div className="flex gap-2 mb-6">
        {post.categories.map((category) => (
          <Link
            key={category}
            href={`/blog/category/${category}`}
            className="px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300 transition"
          >
            {category}
          </Link>
        ))}
      </div>

      <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: post.content }} />

      {relatedPosts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Related Posts</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <div key={relatedPost.id} className="border rounded-lg overflow-hidden shadow-sm">
                {relatedPost.coverImage && (
                  <img
                    src={relatedPost.coverImage || "/placeholder.svg"}
                    alt={relatedPost.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{relatedPost.title}</h3>
                  <p className="text-gray-600 mb-4">{relatedPost.excerpt}</p>
                  <Link href={`/blog/${relatedPost.slug}`} className="text-blue-600 hover:underline">
                    Read more
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

