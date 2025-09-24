import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'content/blog')

export interface PostData {
  id: string
  title: string
  date: string
  author: string
  excerpt: string
  contentHtml?: string // Optional for list view
}

export function getSortedPostsData(): PostData[] {
  // Get file names under /content/blog
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md') || fileName.endsWith('.mdx')) // Ensure we only read markdown files
    .map((fileName) => {
      // Remove ".md" or ".mdx" from file name to get id
      const id = fileName.replace(/\.mdx?$/, '')

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents)

      // Combine the data with the id
      return {
        id,
        title: matterResult.data.title || 'Untitled', // Provide default title
        date: matterResult.data.date || new Date().toISOString().split('T')[0], // Provide default date
        author: matterResult.data.author || 'Unknown Author',
        excerpt: matterResult.data.excerpt || '',
      } as PostData
    })
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames
    .filter((fileName) => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
    .map((fileName) => {
      return {
        params: {
          slug: fileName.replace(/\.mdx?$/, ''),
        },
      }
    })
}

export async function getPostData(id: string): Promise<PostData> {
  const fullPath = path.join(postsDirectory, `${id}.md`)
  // Check for .mdx if .md doesn't exist (optional, depends if you use mdx)
  // const fullPathMdx = path.join(postsDirectory, `${id}.mdx`)
  // const actualPath = fs.existsSync(fullPath) ? fullPath : fs.existsSync(fullPathMdx) ? fullPathMdx : null;

  // For simplicity, assuming only .md for now
  if (!fs.existsSync(fullPath)) {
      throw new Error(`Post not found for slug: ${id}`);
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    title: matterResult.data.title || 'Untitled',
    date: matterResult.data.date || new Date().toISOString().split('T')[0],
    author: matterResult.data.author || 'Unknown Author',
    excerpt: matterResult.data.excerpt || '',
  }
} 