/**
 * Lazy Loading Components
 * 
 * Centralized lazy loading for heavy components to improve initial page load
 * performance and reduce bundle size.
 */

import dynamic from 'next/dynamic';
import { Loader2, Calendar, FileText, MessageSquare, Map, CreditCard, BarChart } from 'lucide-react';

// Loading fallback components
const ComponentLoader = ({ name }: { name: string }) => (
  <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
      <p className="text-sm text-gray-600">Loading {name}...</p>
    </div>
  </div>
);

const CalendarLoader = () => (
  <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border">
    <div className="text-center">
      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
      <p className="text-sm text-gray-600">Loading calendar...</p>
    </div>
  </div>
);

const FormLoader = () => (
  <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
    <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
    <div className="flex gap-4">
      <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
      <div className="h-10 bg-blue-200 rounded w-24 animate-pulse"></div>
    </div>
  </div>
);

const MapLoader = () => (
  <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg border">
    <div className="text-center">
      <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
      <p className="text-sm text-gray-600">Loading map...</p>
    </div>
  </div>
);

// === BOOKING COMPONENTS ===

// Calendar component (heavy due to date calculations and UI)
export const LazyUnifiedBookingCalendar = dynamic(
  () => import('@/components/unified-booking-calendar'),
  {
    loading: CalendarLoader,
    ssr: false, // Calendar interactions require client-side functionality
  }
);

// Optimized booking form (modularized but still substantial)
export const LazyUnifiedBookingForm = dynamic(
  () => import('@/components/booking/UnifiedBookingFormOptimized'),
  {
    loading: FormLoader,
    ssr: false, // Form interactions are client-side heavy
  }
);

// Payment components (Stripe integration)
export const LazyPaymentForm = dynamic(
  () => import('@/components/booking/PaymentForm').then(mod => ({ default: mod.PaymentForm })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading payment form...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

// === FAQ COMPONENTS ===

// Optimized FAQ page
export const LazyFAQClientPage = dynamic(
  () => import('@/components/faq/FAQClientPageOptimized'),
  {
    loading: () => <ComponentLoader name="FAQ" />,
    ssr: true, // FAQ content benefits from SSR for SEO
  }
);

// === MAP COMPONENTS ===

// Location/booking map
export const LazyBookingLocationMap = dynamic(
  () => import('@/components/maps/BookingLocationMap'),
  {
    loading: MapLoader,
    ssr: false, // Maps are always client-side
  }
);

// Service area map
export const LazyServiceAreaMap = dynamic(
  () => import('@/components/maps/ServiceAreaMap'),
  {
    loading: MapLoader,
    ssr: false,
  }
);

// === ADMIN/DASHBOARD COMPONENTS ===

// Admin dashboard (heavy with charts and data)
export const LazyAdminDashboard = dynamic(
  () => import('@/components/admin/Dashboard'),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <BarChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    ),
    ssr: false, // Dashboard is always admin-only and client-side heavy
  }
);

// Booking management table
export const LazyBookingManagement = dynamic(
  () => import('@/components/admin/BookingManagement'),
  {
    loading: () => <ComponentLoader name="booking management" />,
    ssr: false,
  }
);

// === COMMUNICATION COMPONENTS ===

// Chat/messaging components
export const LazyChatWidget = dynamic(
  () => import('@/components/communication/ChatWidget'),
  {
    loading: () => (
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
        <MessageSquare className="h-8 w-8 text-blue-600" />
      </div>
    ),
    ssr: false,
  }
);

// Email templates preview
export const LazyEmailTemplatePreview = dynamic(
  () => import('@/components/email/TemplatePreview'),
  {
    loading: () => <ComponentLoader name="email preview" />,
    ssr: false,
  }
);

// === ANALYTICS COMPONENTS ===

// Analytics dashboard
export const LazyAnalyticsDashboard = dynamic(
  () => import('@/components/analytics/Dashboard'),
  {
    loading: () => <ComponentLoader name="analytics" />,
    ssr: false,
  }
);

// Performance metrics
export const LazyPerformanceMetrics = dynamic(
  () => import('@/components/analytics/PerformanceMetrics'),
  {
    loading: () => <ComponentLoader name="performance metrics" />,
    ssr: false,
  }
);

// === UTILITIES ===

/**
 * Higher-order component for adding lazy loading to any component
 */
export function withLazyLoading<P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  options: {
    loading?: React.ComponentType;
    ssr?: boolean;
    name?: string;
  } = {}
) {
  const { loading, ssr = true, name = 'component' } = options;
  
  return dynamic(importFn, {
    loading: loading || (() => <ComponentLoader name={name} />),
    ssr,
  });
}

/**
 * Preload lazy components for better UX
 */
export const preloadLazyComponents = {
  booking: () => {
    // Preload booking-related components
    import('@/components/unified-booking-calendar');
    import('@/components/booking/UnifiedBookingFormOptimized');
  },
  
  faq: () => {
    // Preload FAQ components
    import('@/components/faq/FAQClientPageOptimized');
  },
  
  maps: () => {
    // Preload map components
    import('@/components/maps/BookingLocationMap');
    import('@/components/maps/ServiceAreaMap');
  },
  
  admin: () => {
    // Preload admin components
    import('@/components/admin/Dashboard');
    import('@/components/admin/BookingManagement');
  },
  
  all: () => {
    // Preload all heavy components
    preloadLazyComponents.booking();
    preloadLazyComponents.faq();
    preloadLazyComponents.maps();
    preloadLazyComponents.admin();
  }
};

/**
 * Hook for intelligent preloading based on user interaction
 */
export function useIntelligentPreloading() {
  const preloadOnHover = (componentType: keyof typeof preloadLazyComponents) => {
    return {
      onMouseEnter: () => {
        preloadLazyComponents[componentType]();
      }
    };
  };

  const preloadOnFocus = (componentType: keyof typeof preloadLazyComponents) => {
    return {
      onFocus: () => {
        preloadLazyComponents[componentType]();
      }
    };
  };

  return { preloadOnHover, preloadOnFocus };
}

export default {
  // Booking
  LazyUnifiedBookingCalendar,
  LazyUnifiedBookingForm,
  LazyPaymentForm,
  
  // FAQ
  LazyFAQClientPage,
  
  // Maps
  LazyBookingLocationMap,
  LazyServiceAreaMap,
  
  // Admin
  LazyAdminDashboard,
  LazyBookingManagement,
  
  // Communication
  LazyChatWidget,
  LazyEmailTemplatePreview,
  
  // Analytics
  LazyAnalyticsDashboard,
  LazyPerformanceMetrics,
  
  // Utilities
  withLazyLoading,
  preloadLazyComponents,
  useIntelligentPreloading,
};