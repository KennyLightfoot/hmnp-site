import { getBlogPosts, getBlogCategories } from "@/data/blog-posts"
import Link from "next/link"

export default async function BlogPage() {
  const posts = await getBlogPosts()
  const categories = await getBlogCategories()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(categories).map(([slug, category]) => (
            <Link
              key={slug}
              href={`/blog/category/${slug}`}
              className="px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300 transition"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

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

