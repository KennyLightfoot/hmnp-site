import { Calendar, Clock, Tag } from "lucide-react"
import type { BlogPost } from "@/lib/blog-types"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { BlogCard } from "./blog-card"
import { getRelatedPosts } from "@/data/blog-posts"

interface BlogPostContentProps {
  post: BlogPost
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  const relatedPosts = getRelatedPosts(post, 3)

  return (
    <article className="mx-auto max-w-3xl">
      {/* Post Header */}
      <header className="mb-8">
        <div className="mb-3">
          {post.categories.map((category) => (
            <Link
              key={category}
              href={`/blog/category/${category}`}
              className="mr-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary hover:bg-primary/20"
            >
              {category.replace(/-/g, " ")}
            </Link>
          ))}
        </div>
        <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl">{post.title}</h1>
        <p className="mb-6 text-xl text-muted-foreground">{post.description}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <div className="mr-3 h-10 w-10 overflow-hidden rounded-full">
              <img
                src={post.author.avatar || "/placeholder.svg"}
                alt={post.author.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="font-medium text-foreground">{post.author.name}</div>
              <div className="text-xs">{post.author.title}</div>
            </div>
          </div>
          <div className="flex items-center">
            <Calendar className="mr-1 h-4 w-4" />
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4" />
            <span>{post.readTime} min read</span>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="mb-8 overflow-hidden rounded-lg">
        <img src={post.image || "/placeholder.svg"} alt={post.title} className="h-full w-full object-cover" />
      </div>

      {/* Post Content */}
      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

      {/* Tags */}
      <div className="my-8 flex flex-wrap items-center gap-2">
        <Tag className="h-4 w-4 text-muted-foreground" />
        {post.tags.map((tag) => (
          <Link
            key={tag}
            href={`/blog/tag/${tag.replace(/ /g, "-").toLowerCase()}`}
            className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
          >
            {tag}
          </Link>
        ))}
      </div>

      {/* Share */}
      <div className="mb-8 flex items-center">
        <span className="mr-3 font-medium">Share this article:</span>
        <div className="flex space-x-2">
          <button
            aria-label="Share on Facebook"
            className="rounded-full bg-[#1877F2] p-2 text-white hover:bg-[#1877F2]/90"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
            </svg>
          </button>
          <button
            aria-label="Share on Twitter"
            className="rounded-full bg-[#1DA1F2] p-2 text-white hover:bg-[#1DA1F2]/90"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 5.89998C21.26 6.20998 20.46 6.41998 19.64 6.50998C20.49 6.00998 21.14 5.24998 21.44 4.34998C20.64 4.79998 19.74 5.12998 18.79 5.29998C18.03 4.54998 16.93 4.09998 15.72 4.09998C13.39 4.09998 11.51 5.97998 11.51 8.28998C11.51 8.59998 11.54 8.89998 11.61 9.18998C8.09 9.01998 4.97 7.34998 2.87 4.78998C2.54 5.38998 2.35 6.00998 2.35 6.69998C2.35 7.97998 2.99 9.11998 3.98 9.77998C3.3 9.75998 2.66 9.57998 2.11 9.28998V9.33998C2.11 11.38 3.56 13.09 5.5 13.45C5.18 13.54 4.84 13.58 4.48 13.58C4.23 13.58 3.99 13.56 3.75 13.52C4.24 15.2 5.81 16.43 7.67 16.47C6.21 17.6 4.37 18.28 2.36 18.28C2.05 18.28 1.74 18.26 1.44 18.23C3.32 19.42 5.56 20.13 7.97 20.13C15.71 20.13 19.94 13.64 19.94 8.05998C19.94 7.88998 19.94 7.71998 19.93 7.54998C20.74 6.97998 21.45 6.26998 22 5.44998V5.89998Z" />
            </svg>
          </button>
          <button
            aria-label="Share on LinkedIn"
            className="rounded-full bg-[#0A66C2] p-2 text-white hover:bg-[#0A66C2]/90"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.5 8C7.32843 8 8 7.32843 8 6.5C8 5.67157 7.32843 5 6.5 5C5.67157 5 5 5.67157 5 6.5C5 7.32843 5.67157 8 6.5 8Z" />
              <path d="M5 10C5 9.44772 5.44772 9 6 9H7C7.55228 9 8 9.44772 8 10V18C8 18.5523 7.55228 19 7 19H6C5.44772 19 5 18.5523 5 18V10Z" />
              <path d="M11 19H12C12.5523 19 13 18.5523 13 18V13.5C13 12 16 11 16 13V18.0004C16 18.5527 16.4477 19 17 19H18C18.5523 19 19 18.5523 19 18V12C19 10 17.5 9 15.5 9C13.5 9 13 10.5 13 10.5V10C13 9.44772 12.5523 9 12 9H11C10.4477 9 10 9.44772 10 10V18C10 18.5523 10.4477 19 11 19Z" />
            </svg>
          </button>
          <button aria-label="Share via Email" className="rounded-full bg-gray-600 p-2 text-white hover:bg-gray-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Author Bio */}
      <div className="mb-8 rounded-lg border bg-background p-6">
        <div className="flex flex-col items-center sm:flex-row sm:items-start">
          <div className="mb-4 h-20 w-20 overflow-hidden rounded-full sm:mb-0 sm:mr-6">
            <img
              src={post.author.avatar || "/placeholder.svg"}
              alt={post.author.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h3 className="mb-1 text-xl font-bold">{post.author.name}</h3>
            <p className="mb-3 text-sm font-medium text-muted-foreground">{post.author.title}</p>
            <p className="text-muted-foreground">{post.author.bio}</p>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold">Related Articles</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((relatedPost) => (
              <BlogCard key={relatedPost.id} post={relatedPost} />
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

