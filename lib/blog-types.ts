export type BlogCategoryType =
  | "notary-basics"
  | "loan-signing"
  | "real-estate"
  | "legal-documents"
  | "business-tips"
  | "industry-news"
  | "how-to-guides"
  | "faq"

export interface BlogAuthor {
  name: string
  title: string
  avatar: string
  bio: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  description: string
  content: string
  date: string
  lastUpdated?: string
  author: BlogAuthor
  categories: BlogCategoryType[]
  tags: string[]
  image: string
  readTime: number
  featured?: boolean
  views?: number
}

export interface BlogCategory {
  id: BlogCategoryType
  name: string
  description: string
  slug: string
  count?: number
}

