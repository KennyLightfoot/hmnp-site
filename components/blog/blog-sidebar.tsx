import { BlogSearch } from "./blog-search"
import { BlogCard } from "./blog-card"
import { BlogCategoryCard } from "./blog-category-card"
import { blogCategories } from "@/data/blog-posts"
import { getPopularPosts, getRecentPosts } from "@/data/blog-posts"

export function BlogSidebar() {
  const popularPosts = getPopularPosts(3)
  const recentPosts = getRecentPosts(3)

  // Convert categories object to array with counts
  const categories = Object.entries(blogCategories).map(([id, category]) => ({
    id: id as any,
    ...category,
    count: 0, // This would be dynamically calculated in a real implementation
  }))

  return (
    <aside className="space-y-8">
      <div>
        <BlogSearch />
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">Categories</h2>
        <div className="space-y-3">
          {categories.map((category) => (
            <BlogCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">Popular Articles</h2>
        <div className="space-y-4">
          {popularPosts.map((post) => (
            <BlogCard key={post.id} post={post} variant="compact" />
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">Recent Articles</h2>
        <div className="space-y-4">
          {recentPosts.map((post) => (
            <BlogCard key={post.id} post={post} variant="compact" />
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-primary/5 p-4">
        <h3 className="mb-2 text-lg font-semibold">Subscribe to Our Newsletter</h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Get the latest notary tips and industry updates delivered to your inbox.
        </p>
        <form className="space-y-2">
          <input
            type="email"
            placeholder="Your email address"
            className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
            required
          />
          <button
            type="submit"
            className="w-full rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Subscribe
          </button>
        </form>
      </div>
    </aside>
  )
}

