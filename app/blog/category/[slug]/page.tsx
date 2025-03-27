import { getBlogPostsByCategory, getBlogCategories } from "@/data/blog-posts"
import { notFound } from "next/navigation"
import { BlogCard } from "@/components/blog/blog-card"
import { BlogSidebar } from "@/components/blog/blog-sidebar"
import { BlogSchema } from "@/components/blog/blog-schema"

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
    <>
      <BlogSchema isBlogList={true} />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="mb-4 text-3xl font-bold">{categoryInfo?.name || params.slug}</h1>
          <p className="text-xl text-muted-foreground">{categoryInfo?.description}</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {posts.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border bg-background p-6 text-center">
                <h2 className="mb-2 text-xl font-semibold">No articles found</h2>
                <p className="text-muted-foreground">
                  We haven't published any articles in this category yet. Check back soon!
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <BlogSidebar />
          </div>
        </div>
      </div>
    </>
  )
}

