import Link from "next/link"
import type { BlogCategory } from "@/lib/blog-types"

interface BlogCategoryCardProps {
  category: {
    id: BlogCategory
    name: string
    description: string
    slug: string
    count?: number
  }
}

export function BlogCategoryCard({ category }: BlogCategoryCardProps) {
  return (
    <Link
      href={`/blog/category/${category.slug}`}
      className="block rounded-lg border bg-background p-4 shadow transition-all hover:shadow-md hover:border-primary/50"
    >
      <h3 className="mb-1 text-lg font-semibold">{category.name}</h3>
      <p className="mb-2 text-sm text-muted-foreground">{category.description}</p>
      {category.count !== undefined && (
        <span className="text-xs font-medium text-primary">
          {category.count} {category.count === 1 ? "article" : "articles"}
        </span>
      )}
    </Link>
  )
}

