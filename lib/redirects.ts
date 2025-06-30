/**
 * SOP Compliance URL Redirects
 * Redirects old forbidden service type URLs to new SOP-compliant URLs
 * Ensures SEO preservation and user experience continuity
 */

export interface RedirectMapping {
  source: string;
  destination: string;
  permanent: boolean;
  statusCode?: number;
}

/**
 * Service URL redirects from forbidden types to SOP-compliant types
 */
export const SERVICE_REDIRECTS: RedirectMapping[] = [
  // Essential → Standard Notary
  {
    source: '/services/essential',
    destination: '/services/standard-notary',
    permanent: true,
  },
  {
    source: '/services/essential/:path*',
    destination: '/services/standard-notary/:path*',
    permanent: true,
  },
  
  // Priority → Extended Hours Notary  
  {
    source: '/services/priority',
    destination: '/services/extended-hours-notary',
    permanent: true,
  },
  {
    source: '/services/priority/:path*',
    destination: '/services/extended-hours-notary/:path*',
    permanent: true,
  },
  
  // Basic → Standard Notary
  {
    source: '/services/basic',
    destination: '/services/standard-notary',
    permanent: true,
  },
  {
    source: '/services/basic/:path*',
    destination: '/services/standard-notary/:path*',
    permanent: true,
  },
  
  // Premium → Specialty Notary Service
  {
    source: '/services/premium',
    destination: '/services/specialty-notary-service',
    permanent: true,
  },
  {
    source: '/services/premium/:path*',
    destination: '/services/specialty-notary-service/:path*',
    permanent: true,
  },
  
  // Loan Signing → Loan Signing Specialist (in case any old references exist)
  {
    source: '/services/loan-signing',
    destination: '/services/loan-signing-specialist',
    permanent: true,
  },
  {
    source: '/services/loan-signing/:path*',
    destination: '/services/loan-signing-specialist/:path*',
    permanent: true,
  },
];

/**
 * API endpoint redirects for legacy calendar endpoints
 */
export const API_REDIRECTS: RedirectMapping[] = [
  // Calendar API redirects
  {
    source: '/api/calendar/essential/:path*',
    destination: '/api/calendar/standard-notary/:path*',
    permanent: true,
  },
  {
    source: '/api/calendar/priority/:path*',
    destination: '/api/calendar/extended-hours-notary/:path*',
    permanent: true,
  },
  {
    source: '/api/calendar/basic/:path*',
    destination: '/api/calendar/standard-notary/:path*',
    permanent: true,
  },
  {
    source: '/api/calendar/premium/:path*',
    destination: '/api/calendar/specialty-notary-service/:path*',
    permanent: true,
  },
  
  // Booking API redirects (redirect legacy /api/booking to /api/bookings)
  {
    source: '/api/booking/:path*',
    destination: '/api/bookings/:path*',
    permanent: true,
  },
];

/**
 * All redirects combined for easy import
 */
export const ALL_REDIRECTS: RedirectMapping[] = [
  ...SERVICE_REDIRECTS,
  ...API_REDIRECTS,
];

/**
 * Generate Next.js redirects configuration
 */
export function generateNextJSRedirects() {
  return ALL_REDIRECTS.map(redirect => ({
    source: redirect.source,
    destination: redirect.destination,
    permanent: redirect.permanent,
    statusCode: redirect.statusCode || (redirect.permanent ? 301 : 302),
  }));
}

/**
 * Check if a URL should be redirected
 */
export function getRedirectForPath(path: string): string | null {
  const redirect = ALL_REDIRECTS.find(r => {
    // Simple pattern matching for exact matches
    if (r.source === path) return true;
    
    // Handle wildcard patterns like /services/essential/:path*
    if (r.source.includes(':path*')) {
      const basePattern = r.source.replace('/:path*', '');
      return path.startsWith(basePattern);
    }
    
    return false;
  });
  
  if (!redirect) return null;
  
  // Handle wildcard replacements
  if (redirect.source.includes(':path*') && redirect.destination.includes(':path*')) {
    const baseSource = redirect.source.replace('/:path*', '');
    const baseDestination = redirect.destination.replace('/:path*', '');
    const remainingPath = path.substring(baseSource.length);
    return baseDestination + remainingPath;
  }
  
  return redirect.destination;
}

/**
 * SEO meta redirect information
 */
export const REDIRECT_META = {
  title: 'SOP Compliance Service Migration',
  description: 'Service URLs have been updated for SOP compliance. You are being redirected automatically.',
  keywords: [
    'Houston Mobile Notary',
    'Notary Services',
    'Standard Notary',
    'Extended Hours Notary', 
    'Loan Signing Specialist',
    'Specialty Notary Service',
    'SOP Compliance'
  ],
};

export default {
  SERVICE_REDIRECTS,
  API_REDIRECTS,
  ALL_REDIRECTS,
  generateNextJSRedirects,
  getRedirectForPath,
  REDIRECT_META,
};