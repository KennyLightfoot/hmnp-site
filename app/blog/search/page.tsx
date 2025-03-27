import type { Metadata } from "next"
import { BlogCard } from "@/components/blog/blog-card"
import { BlogSidebar } from "@/components/blog/blog-sidebar"
import { blogPosts } from "@/data/blog-posts"

export const metadata: Metadata = {
  title: "Search Results | Houston Mobile Notary Pros Blog",
  description: "Search results for your query in our notary services blog and resources.",
  robots: {
    index: false,
    follow: true,
  },
}

interface SearchPageProps {
  searchParams: {
    q?: string
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""

  // Simple search implementation
  const searchResults = query
    ? blogPosts.filter((post) => {
        const searchableText = `
          ${post.title.toLowerCase()}
          ${post.description.toLowerCase()}
          ${post.content.toLowerCase()}
          ${post.author.name.toLowerCase()}
          ${post.tags.join(" ").toLowerCase()}
          ${post.categories.join(" ").toLowerCase()}
        `
        return searchableText.includes(query.toLowerCase())
      })
    : []

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">Search Results</h1>
        <p className="text-xl text-muted-foreground">
          {searchResults.length} {searchResults.length === 1 ? "result" : "results"} found for "{query}"
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {searchResults.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2">
              {searchResults.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border bg-background p-6 text-center">
              <h2 className="mb-2 text-xl font-semibold">No results found</h2>
              <p className="text-muted-foreground">
                We couldn't find any articles matching your search. Try different keywords or browse our categories.
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
  )
}

