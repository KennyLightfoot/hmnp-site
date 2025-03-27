import type { Metadata } from "next"
import { BlogCard } from "@/components/blog/blog-card"
import { BlogSidebar } from "@/components/blog/blog-sidebar"
import { BlogSchema } from "@/components/blog/blog-schema"
import { blogPosts } from "@/data/blog-posts"

export const metadata: Metadata = {
  title: "Blog Archive | Houston Mobile Notary Pros",
  description: "Browse our complete collection of articles, guides, and resources about notary services in Houston.",
  keywords: "notary blog archive, houston notary articles, mobile notary resources",
}

export default function ArchivePage() {
  // Group posts by year and month
  const groupedPosts = blogPosts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .reduce(
      (acc, post) => {
        const date = new Date(post.date)
        const year = date.getFullYear()
        const month = date.toLocaleString("default", { month: "long" })

        if (!acc[year]) {
          acc[year] = {}
        }

        if (!acc[year][month]) {
          acc[year][month] = []
        }

        acc[year][month].push(post)
        return acc
      },
      {} as Record<number, Record<string, typeof blogPosts>>,
    )

  return (
    <>
      <BlogSchema isBlogList={true} />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="mb-4 text-3xl font-bold">Blog Archive</h1>
          <p className="text-xl text-muted-foreground">Browse our complete collection of articles and resources</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {Object.entries(groupedPosts).map(([year, months]) => (
              <div key={year} className="mb-10">
                <h2 className="mb-6 text-2xl font-bold">{year}</h2>

                {Object.entries(months).map(([month, posts]) => (
                  <div key={month} className="mb-8">
                    <h3 className="mb-4 text-xl font-semibold">{month}</h3>
                    <div className="grid gap-6 sm:grid-cols-2">
                      {posts.map((post) => (
                        <BlogCard key={post.id} post={post} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
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

