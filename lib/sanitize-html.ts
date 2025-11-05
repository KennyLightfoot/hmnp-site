/**
 * HTML Sanitization
 * 
 * TODO: Install and use isomorphic-dompurify for proper sanitization in production
 * For now, this is a passthrough for build purposes
 */
export function sanitizeHtml(html: string): string {
  // Basic sanitization - remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '');
} 