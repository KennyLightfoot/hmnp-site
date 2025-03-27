import type { BlogPost } from "@/lib/blog-types"

interface BlogSchemaProps {
  post?: BlogPost
  isBlogList?: boolean
}

export function BlogSchema({ post, isBlogList = false }: BlogSchemaProps) {
  if (isBlogList) {
    const blogSchema = {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Houston Mobile Notary Pros Blog",
      description: "Resources, guides, and information about notary services in Houston, Texas",
      url: "https://houstonmobilenotarypros.com/blog",
      publisher: {
        "@type": "Organization",
        name: "Houston Mobile Notary Pros",
        logo: {
          "@type": "ImageObject",
          url: "https://houstonmobilenotarypros.com/logo.png",
        },
      },
    }

    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
  }

  if (post) {
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      image: post.image,
      datePublished: post.date,
      dateModified: post.lastUpdated || post.date,
      author: {
        "@type": "Person",
        name: post.author.name,
        jobTitle: post.author.title,
      },
      publisher: {
        "@type": "Organization",
        name: "Houston Mobile Notary Pros",
        logo: {
          "@type": "ImageObject",
          url: "https://houstonmobilenotarypros.com/logo.png",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://houstonmobilenotarypros.com/blog/${post.slug}`,
      },
    }

    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
  }

  return null
}

