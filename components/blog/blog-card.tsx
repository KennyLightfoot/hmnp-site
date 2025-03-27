import Link from "next/link"
import { Calendar, Clock, Eye } from "lucide-react"
import type { BlogPost } from "@/lib/blog-types"
import { formatDate } from "@/lib/utils"

interface BlogCardProps {
  post: BlogPost
  variant?: "default" | "compact" | "featured"
}

export function BlogCard({ post, variant = "default" }: BlogCardProps) {
  if (variant === "featured") {
    return (
      <div className="group relative overflow-hidden rounded-lg border bg-background shadow-md transition-all hover:shadow-lg">
        <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10">
          <span className="sr-only">View {post.title}</span>
        </Link>
        <div className="relative aspect-video w-full overflow-hidden">
          <img
            src={post.image || "/placeholder.svg"}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute bottom-0 left-0 p-4">
            {post.categories.slice(0, 2).map((category) => (
              <span
                key={category}
                className="mr-2 inline-block rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground"
              >
                {category.replace(/-/g, " ")}
              </span>
            ))}
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <h3 className="mb-2 text-xl font-bold leading-tight text-foreground sm:text-2xl">{post.title}</h3>
          <p className="mb-4 text-muted-foreground line-clamp-2">{post.description}</p>
          <div className="flex items-center text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>
            <div className="mx-2">•</div>
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              <span>{post.readTime} min read</span>
            </div>
            {post.views && (
              <>
                <div className="mx-2">•</div>
                <div className="flex items-center">
                  <Eye className="mr-1 h-4 w-4" />
                  <span>{post.views.toLocaleString()} views</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div className="group flex items-start space-x-4">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
          <img src={post.image || "/placeholder.svg"} alt={post.title} className="h-full w-full object-cover" />
        </div>
        <div>
          <h3 className="font-medium leading-tight group-hover:text-primary">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h3>
          <div className="mt-1 flex items-center text-xs text-muted-foreground">
            <Calendar className="mr-1 h-3 w-3" />
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group overflow-hidden rounded-lg border bg-background shadow transition-all hover:shadow-md">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={post.image || "/placeholder.svg"}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <div className="mb-2">
            {post.categories.slice(0, 2).map((category) => (
              <span
                key={category}
                className="mr-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {category.replace(/-/g, " ")}
              </span>
            ))}
          </div>
          <h3 className="mb-2 text-lg font-semibold leading-tight text-foreground group-hover:text-primary">
            {post.title}
          </h3>
          <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{post.description}</p>
          <div className="flex items-center text-xs text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="mr-1 h-3 w-3" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>
            <div className="mx-2">•</div>
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              <span>{post.readTime} min read</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

