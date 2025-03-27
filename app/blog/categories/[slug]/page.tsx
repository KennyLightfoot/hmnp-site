import { getBlogPostsByCategory, getBlogCategories } from "@/data/blog-posts"
import { notFound } from "next/navigation"
import Link from "next/link"

export async function generateStaticParams() {
  const categories = await getBlogCategories()
  return Object.keys(categories).map((category) => ({
    slug: category,
  }))
}

export default async function BlogCategoryPage({ params }: { params: { slug: string } }) {
  const posts = await getBlogPostsByCategory(params.slug)
  const categories = await getBlogCategories()

  if (!posts.length) {
    notFound()
  }

  const categoryInfo = categories[params.slug]

  return (
    <div className="container mx-auto py-8">
      <Link href="/blog" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to all posts
      </Link>

      <h1 className="text-3xl font-bold mb-4">{categoryInfo?.name || params.slug}</h1>
      {categoryInfo?.description && <p className="text-gray-600 mb-6">{categoryInfo.description}</p>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="border rounded-lg overflow-hidden shadow-sm">
            {post.coverImage && (
              <img src={post.coverImage || "/placeholder.svg"} alt={post.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:underline">
                Read more
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

