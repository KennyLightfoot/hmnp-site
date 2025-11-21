import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const MANUAL_BLOGS_DIR = path.join(process.cwd(), 'content', 'blog')
const AGENT_BLOGS_DIR = path.join(process.cwd(), 'content', 'blogs')

/**
 * Normalize a slug to kebab-case
 * Ensures slugs are always URL-safe and consistent
 */
function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

export type BlogPost = {
  slug: string
  title: string
  summary: string
  metaDescription: string
  date: string
  author: string
  content: string
  contentHtml?: string
}

/**
 * Normalize frontmatter data from different sources into a consistent BlogPost shape
 */
function normalizeBlogPost(
  filenameSlug: string,
  frontmatter: any,
  markdownContent: string
): Omit<BlogPost, 'contentHtml'> {
  // Normalize slug: prefer frontmatter slug, otherwise use filename-based slug
  // Always normalize to kebab-case to ensure URL safety
  const rawSlug = frontmatter.slug || filenameSlug
  const slug = normalizeSlug(rawSlug)

  // Normalize title: prefer title, fallback to slug
  const title = frontmatter.title || slug

  // Normalize summary: prefer summary, then excerpt, then empty string
  const summary = frontmatter.summary || frontmatter.excerpt || ''

  // Normalize metaDescription: prefer metaDescription, then description, then summary
  const metaDescription =
    frontmatter.metaDescription ||
    frontmatter.description ||
    summary ||
    ''

  // Normalize date: prefer date, then publishedAt/createdAt, default to current date
  const date =
    frontmatter.date ||
    frontmatter.publishedAt ||
    frontmatter.createdAt ||
    new Date().toISOString()

  // Normalize author: default to "Houston Mobile Notary Pros" if missing
  const author =
    frontmatter.author || 'Houston Mobile Notary Pros'

  return {
    slug,
    title,
    summary,
    metaDescription,
    date,
    author,
    content: markdownContent,
  }
}

/**
 * Read markdown files from a directory and return normalized blog posts
 */
function readBlogsFromDirectory(
  directory: string
): Omit<BlogPost, 'contentHtml'>[] {
  if (!fs.existsSync(directory)) {
    return []
  }

  const fileNames = fs.readdirSync(directory)
  const blogPosts = fileNames
    .filter((fileName) => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
    .map((fileName) => {
      // Remove ".md" or ".mdx" from file name to get slug
      const slug = fileName.replace(/\.mdx?$/, '')

      // Read markdown file as string
      const fullPath = path.join(directory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents)

      // Normalize the blog post data
      return normalizeBlogPost(
        slug,
        matterResult.data,
        matterResult.content
      )
    })

  return blogPosts
}

/**
 * Get all blog slugs from both directories
 */
export function getAllBlogSlugs(): string[] {
  const manualSlugs = fs.existsSync(MANUAL_BLOGS_DIR)
    ? fs
        .readdirSync(MANUAL_BLOGS_DIR)
        .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
        .map((f) => {
          const filenameSlug = f.replace(/\.mdx?$/, '')
          // Read file to get frontmatter slug if it exists
          try {
            const fullPath = path.join(MANUAL_BLOGS_DIR, f)
            const fileContents = fs.readFileSync(fullPath, 'utf8')
            const matterResult = matter(fileContents)
            const rawSlug = matterResult.data.slug || filenameSlug
            return normalizeSlug(rawSlug)
          } catch {
            return normalizeSlug(filenameSlug)
          }
        })
    : []

  const agentSlugs = fs.existsSync(AGENT_BLOGS_DIR)
    ? fs
        .readdirSync(AGENT_BLOGS_DIR)
        .filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
        .map((f) => {
          const filenameSlug = f.replace(/\.mdx?$/, '')
          // Read file to get frontmatter slug if it exists
          try {
            const fullPath = path.join(AGENT_BLOGS_DIR, f)
            const fileContents = fs.readFileSync(fullPath, 'utf8')
            const matterResult = matter(fileContents)
            const rawSlug = matterResult.data.slug || filenameSlug
            return normalizeSlug(rawSlug)
          } catch {
            return normalizeSlug(filenameSlug)
          }
        })
    : []

  // Combine and deduplicate (agent posts take precedence if slug conflicts)
  const allSlugs = [...new Set([...agentSlugs, ...manualSlugs])]
  return allSlugs
}

/**
 * Helper function to try a file path and return it if it exists
 */
function tryFile(p: string): string | null {
  return fs.existsSync(p) ? p : null
}

/**
 * Get a single blog post by slug
 * Dead simple lookup - decode URI and try the paths
 * Expects URL slug to match filename exactly (kebab-case from pipeline)
 */
export async function getBlogBySlug(rawSlug: string): Promise<BlogPost> {
  // URL segment, might be encoded - decode and normalize it
  const decodedSlug = decodeURIComponent(rawSlug)
  const slug = normalizeSlug(decodedSlug)

  // Try agent blogs first, then manual blogs for backwards compat
  const candidates = [
    path.join(AGENT_BLOGS_DIR, `${slug}.md`),
    path.join(MANUAL_BLOGS_DIR, `${slug}.md`),
  ]

  const fullPath = candidates.map(tryFile).find(Boolean)

  if (!fullPath) {
    throw new Error(`Blog post not found for slug: ${slug} (original: ${rawSlug})`)
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  // Extract final slug from frontmatter or filename, normalize for consistency
  const rawFinalSlug = (data as any).slug ?? path.basename(fullPath).replace(/\.md$/, '')
  const finalSlug = normalizeSlug(rawFinalSlug)

  // Convert markdown to HTML
  const processedContent = await remark()
    .use(html)
    .process(content)
  const contentHtml = processedContent.toString()

  return {
    slug: finalSlug,
    title: (data as any).title ?? finalSlug,
    summary: (data as any).summary ?? (data as any).excerpt ?? '',
    metaDescription:
      (data as any).metaDescription ??
      (data as any).description ??
      (data as any).summary ??
      '',
    date: (data as any).date ?? new Date().toISOString(),
    author: (data as any).author ?? 'Houston Mobile Notary Pros',
    content,
    contentHtml,
  }
}

/**
 * Get all blog posts from both directories, merged and sorted by date (newest first)
 */
export function getAllBlogs(): BlogPost[] {
  const manualPosts = readBlogsFromDirectory(MANUAL_BLOGS_DIR)
  const agentPosts = readBlogsFromDirectory(AGENT_BLOGS_DIR)

  // Create a map to handle slug conflicts (agent posts take precedence)
  const postsMap = new Map<string, Omit<BlogPost, 'contentHtml'>>()

  // Add manual posts first
  for (const post of manualPosts) {
    postsMap.set(post.slug, post)
  }

  // Add agent posts (will overwrite manual posts with same slug)
  for (const post of agentPosts) {
    postsMap.set(post.slug, post)
  }

  // Convert to array and sort by date (newest first)
  const allPosts = Array.from(postsMap.values()).sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA // newest first
  })

  return allPosts
}

