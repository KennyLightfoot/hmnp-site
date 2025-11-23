import { MetadataRoute } from 'next'

// TODO: If you have dynamic routes (e.g., blog posts, services), fetch their data
// import { getAllBlogPosts } from '@/lib/blog'; // Example function to get dynamic data
// import { getAllServices } from '@/lib/services'; // Example

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // !!! Replace with your actual domain !!!
  const baseUrl = 'https://houstonmobilenotarypros.com';

  // --- Example: Fetching dynamic blog posts ---
  // const posts = await getAllBlogPosts();
  // const postEntries: MetadataRoute.Sitemap = posts.map(({ slug, updatedAt }) => ({
  //   url: `${baseUrl}/blog/${slug}`,
  //   lastModified: updatedAt, // Use the actual last modified date if available
  //   changeFrequency: 'weekly',
  //   priority: 0.7,
  // }));
  // ---

  // --- Example: Fetching dynamic services ---
  // const services = await getAllServices();
  // const serviceEntries: MetadataRoute.Sitemap = services.map(({ slug, updatedAt }) => ({
  //   url: `${baseUrl}/services/${slug}`,
  //   lastModified: updatedAt,
  //   changeFrequency: 'monthly',
  //   priority: 0.7,
  // }));
  // ---

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/booking`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services/mobile-notary`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/loan-signing-specialist`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/remote-online-notarization`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/services/standard-notary`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/services/extended-hours-notary`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/services/business`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/services/extras`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/services/reverse-mortgage`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/testimonials`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/what-to-expect`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/service-areas`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/service-areas/houston`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/service-areas/league-city`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/service-areas/friendswood`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/service-areas/clear-lake-city`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/service-areas/webster`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/service-areas/pasadena`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/service-areas/pearland`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/service-areas/sugar-land`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/service-areas/texas-city`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/service-areas/nassau-bay`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/service-areas/seabrook`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/service-areas/galveston`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // New Landing Pages
    {
      url: `${baseUrl}/lp/facebook-campaign`,
      lastModified: new Date(),
      changeFrequency: 'monthly', // Or 'yearly' if content is very static
      priority: 0.6, // Adjust based on SEO strategy for this page
    },
    {
      url: `${baseUrl}/lp/gmb-contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7, // Higher priority as it's a key contact point
    },
    {
      url: `${baseUrl}/lp/newsletter-signup`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    // New Thank You Pages
    {
      url: `${baseUrl}/thank-you-fb`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2, // Lower priority for thank you pages
    },
    {
      url: `${baseUrl}/contact/thank-you-gmb`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/newsletter-thank-you`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];

  return [
    ...staticPages,
    // ...postEntries,    // Uncomment and add dynamic entries if needed
    // ...serviceEntries, // Uncomment and add dynamic entries if needed
    // ... add other dynamic entries (reviews, testimonials) here
  ];
}
