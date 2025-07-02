/**
 * Lazy Loading Components (Simplified after booking system removal)
 * 
 * Centralized lazy loading for remaining heavy components.
 */

import dynamic from 'next/dynamic';
import { Loader2, FileText, Map } from 'lucide-react';

// Loading fallback components
const ComponentLoader = ({ name }: { name: string }) => (
  <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
      <p className="text-sm text-gray-600">Loading {name}...</p>
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

// === FAQ COMPONENTS ===

export const LazyFAQClientPage = dynamic(
  () => import('@/components/faq/FAQClientPageOptimized'),
  {
    loading: () => <ComponentLoader name="FAQ" />,
    ssr: true, // FAQ content benefits from SSR for SEO
  }
);

// === MAP COMPONENTS ===

export const LazyServiceAreaMap = dynamic(
  () => import('@/components/maps/ServiceAreaMap'),
  {
    loading: MapLoader,
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
  faq: () => {
    // Preload FAQ components
    import('@/components/faq/FAQClientPageOptimized');
  },
  
  maps: () => {
    // Preload map components  
    import('@/components/maps/ServiceAreaMap');
  },
  
  all: () => {
    // Preload all heavy components
    preloadLazyComponents.faq();
    preloadLazyComponents.maps();
  }
};

export default {
  // FAQ
  LazyFAQClientPage,
  
  // Maps
  LazyServiceAreaMap,
  
  // Utilities
  withLazyLoading,
  preloadLazyComponents,
};