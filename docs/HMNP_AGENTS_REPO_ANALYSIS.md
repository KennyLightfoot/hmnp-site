# HMNP Agents Repo Analysis

## Overview
The `hmnp-agents` repository (https://github.com/KennyLightfoot/hmnp-agents) is responsible for generating blog content using AI agents, which is then synchronized into the `hmnp-site` Next.js frontend.

## Expected Workflow

### 1. Blog Generation Pipeline
```
Agent generates content → Markdown export → Sync to frontend → Display on site
```

### 2. Key Components (Based on User Context)

#### A. Blog Generation
- **Location**: Likely in `src/` or `lib/` directory
- **Process**: 
  - AI agents create blog content
  - Content is formatted as Markdown with frontmatter
  - Files are exported with kebab-case slugs (e.g., `the-convenience-of-mobile-notary-services.md`)

#### B. Sync Script
- **Location**: `src/cli/syncBlogsToFrontend.ts` (mentioned in earlier conversation)
- **Purpose**: Copies generated markdown files to `hmnp-site/content/blogs/`
- **Command**: `pnpm blogs:sync`
- **Target Path**: `../hmnp-site/content/blogs/` (or `../hmnp/content/blogs/`)

#### C. Export Process
- **Command**: `pnpm blogs:export` (mentioned earlier)
- **Output**: Markdown files with frontmatter:
  ```yaml
  ---
  title: "The Convenience of Mobile Notary Services..."
  slug: "the-convenience-of-mobile-notary-services"
  summary: "..."
  metaDescription: "..."
  date: "2025-11-16T20:31:01.811Z"
  ---
  # Content here...
  ```

## Expected File Structure

```
hmnp-agents/
├── src/
│   ├── cli/
│   │   └── syncBlogsToFrontend.ts    # Sync script
│   ├── agents/
│   │   └── blogAgent.ts               # Blog generation agent
│   └── ...
├── exports/
│   └── blogs/                         # Generated markdown files
│       └── *.md
├── package.json
└── ...
```

## Integration Points

### Frontend (hmnp-site) Expectations
1. **Directory**: `content/blogs/` (created and ready)
2. **Loader**: `lib/blogs.ts` reads from both `content/blog/` and `content/blogs/`
3. **Routes**: 
   - `/blog` - Index page showing all posts
   - `/blog/[slug]` - Individual post pages

### Sync Script Requirements
The sync script should:
1. Read markdown files from agents export directory
2. Copy them to `../hmnp-site/content/blogs/` (or `../hmnp/content/blogs/`)
3. Ensure filenames match slugs (kebab-case)
4. Preserve frontmatter structure

## Current Status

### ✅ Completed in hmnp-site
- [x] Created `content/blogs/` directory
- [x] Unified blog loader (`lib/blogs.ts`) reads from both directories
- [x] Blog index page uses `post.slug` for URLs
- [x] Blog slug page uses `getAllBlogSlugs()` for static params
- [x] Simplified `getBlogBySlug()` function

### 🔍 Needs Verification in hmnp-agents
- [ ] Sync script path: `src/cli/syncBlogsToFrontend.ts`
- [ ] Target directory: Should point to `../hmnp-site/content/blogs/` or `../hmnp/content/blogs/`
- [ ] Frontmatter structure: Should include `slug`, `title`, `summary`, `metaDescription`, `date`
- [ ] Filename format: Should match slug (kebab-case)
- [ ] Export command: `pnpm blogs:export`
- [ ] Sync command: `pnpm blogs:sync`

## Next Steps

1. **Verify Sync Script Configuration**
   - Check `src/cli/syncBlogsToFrontend.ts` exists
   - Verify `FRONTEND_REPO_DIR` points to correct path
   - Ensure `FRONTEND_BLOGS_DIR` is `content/blogs` (not `content/blog`)

2. **Test the Workflow**
   ```bash
   # In hmnp-agents repo
   pnpm blogs:export    # Generate markdown files
   pnpm blogs:sync      # Sync to hmnp-site/content/blogs/
   
   # In hmnp-site repo
   pnpm dev            # Start dev server
   # Visit http://localhost:3000/blog
   ```

3. **Verify Frontmatter Structure**
   - Ensure exported files have `slug` field
   - Verify slug matches filename (kebab-case)
   - Check that `title`, `summary`, `metaDescription`, `date` are present

## Questions to Answer

1. What is the exact path structure in `hmnp-agents`?
2. Where are blog files exported before syncing?
3. Does the sync script handle file conflicts?
4. Is there a review/approval step before syncing?
5. How are blog posts generated? (What triggers the agent?)

## Related Files in hmnp-site

- `lib/blogs.ts` - Unified blog loader
- `app/blog/page.tsx` - Blog index page
- `app/blog/[slug]/page.tsx` - Individual blog post page
- `content/blogs/` - Target directory for synced posts

