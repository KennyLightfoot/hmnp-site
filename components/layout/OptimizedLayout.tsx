"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { preloadLazyComponents, useIntelligentPreloading } from '@/components/lazy/LazyComponents';

interface OptimizedLayoutProps {
  children: React.ReactNode;
}

/**
 * Optimized Layout Component
 * 
 * Provides intelligent preloading, error boundaries, and performance
 * optimizations for the entire application.
 */
export function OptimizedLayout({ children }: OptimizedLayoutProps) {
  const pathname = usePathname();
  const { preloadOnHover } = useIntelligentPreloading();
  const [isClient, setIsClient] = useState(false);

  // Hydration check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Intelligent preloading based on current route
  useEffect(() => {
    if (!isClient) return;

    // Preload components based on current page
    if (pathname.includes('/booking')) {
      preloadLazyComponents.booking();
    } else if (pathname.includes('/faq')) {
      preloadLazyComponents.faq();
    } else if (pathname.includes('/admin')) {
      preloadLazyComponents.admin();
    }

    // Preload likely next pages based on user journey
    const timer = setTimeout(() => {
      if (pathname === '/') {
        // Home page users likely go to booking or FAQ
        preloadLazyComponents.booking();
        preloadLazyComponents.faq();
      } else if (pathname.includes('/services')) {
        // Services page users likely go to booking
        preloadLazyComponents.booking();
      }
    }, 2000); // Delay to not interfere with initial page load

    return () => clearTimeout(timer);
  }, [pathname, isClient]);

  // Prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        {/* Navigation with intelligent preloading */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <a 
                  href="/" 
                  className="text-xl font-bold text-[#002147]"
                >
                  Houston Mobile Notary Pros
                </a>
              </div>
              
              <div className="flex items-center space-x-8">
                <a
                  href="/services"
                  className="text-gray-700 hover:text-[#002147] transition-colors"
                  {...preloadOnHover('booking')}
                >
                  Services
                </a>
                <a
                  href="/booking"
                  className="text-gray-700 hover:text-[#002147] transition-colors"
                  {...preloadOnHover('booking')}
                >
                  Book Now
                </a>
                <a
                  href="/faq"
                  className="text-gray-700 hover:text-[#002147] transition-colors"
                  {...preloadOnHover('faq')}
                >
                  FAQ
                </a>
                <a
                  href="/contact"
                  className="text-gray-700 hover:text-[#002147] transition-colors"
                >
                  Contact
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content with error boundary */}
        <main>
          <ErrorBoundary
            fallback={
              <div className="min-h-96 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Something went wrong
                  </h2>
                  <p className="text-gray-600 mb-6">
                    We're sorry for the inconvenience. Please try refreshing the page.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-[#002147] text-white px-6 py-2 rounded-lg hover:bg-[#003366] transition-colors"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            }
          >
            <Suspense 
              fallback={
                <div className="min-h-96 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002147]"></div>
                </div>
              }
            >
              {children}
            </Suspense>
          </ErrorBoundary>
        </main>

        {/* Footer with contact info */}
        <footer className="bg-gray-50 border-t mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Houston Mobile Notary Pros
                </h3>
                <p className="text-gray-600">
                  Professional mobile notary services throughout the greater Houston area.
                </p>
              </div>
              
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Quick Links
                </h4>
                <div className="space-y-2">
                  <a href="/services" className="block text-gray-600 hover:text-[#002147]">
                    Our Services
                  </a>
                  <a 
                    href="/booking" 
                    className="block text-gray-600 hover:text-[#002147]"
                    {...preloadOnHover('booking')}
                  >
                    Book Appointment
                  </a>
                  <a 
                    href="/faq" 
                    className="block text-gray-600 hover:text-[#002147]"
                    {...preloadOnHover('faq')}
                  >
                    FAQ
                  </a>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">
                  Contact Info
                </h4>
                <div className="space-y-2 text-gray-600">
                  <p>📞 (281) 991-7475</p>
                  <p>📧 info@houstonmobilenotarypros.com</p>
                  <p>📍 Serving Greater Houston Area</p>
                </div>
              </div>
            </div>
            
            <div className="border-t mt-8 pt-6 text-center text-gray-500">
              <p>&copy; 2024 Houston Mobile Notary Pros. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default OptimizedLayout;