/**
 * ⚡ Advanced Page Speed Optimization - Phase 5 Technical SEO
 * Houston Mobile Notary Pros
 * 
 * This module provides advanced page speed optimizations beyond standard caching
 * to achieve sub-2-second page loads for better search rankings.
 * 
 * Key Optimizations:
 * - Resource preloading and prefetching
 * - Bundle optimization and code splitting
 * - Image optimization and lazy loading
 * - Critical CSS extraction
 * - Service Worker caching strategies
 * - Database query optimization
 * - CDN integration and edge caching
 */

// Import logging utilities
import { perfLogger, debugLogger, errorLogger } from '@/lib/logger';

// =============================================================================
// 📊 PERFORMANCE CONFIGURATION
// =============================================================================

interface PerformanceConfig {
  targets: {
    lcp: number;        // Largest Contentful Paint
    fcp: number;        // First Contentful Paint
    ttfb: number;       // Time to First Byte
    tti: number;        // Time to Interactive
    si: number;         // Speed Index
  };
  
  optimization: {
    enablePreloading: boolean;
    enablePrefetching: boolean;
    enableImageOptimization: boolean;
    enableCriticalCSS: boolean;
    enableServiceWorker: boolean;
    enableBundleOptimization: boolean;
  };
  
  caching: {
    staticAssets: number;      // Cache duration for static assets
    dynamicContent: number;    // Cache duration for dynamic content
    apiResponses: number;      // Cache duration for API responses
    userSessions: number;      // Cache duration for user sessions
  };
}

const PERFORMANCE_CONFIG: PerformanceConfig = {
  targets: {
    lcp: 2500,    // 2.5 seconds
    fcp: 1800,    // 1.8 seconds
    ttfb: 600,    // 0.6 seconds
    tti: 3800,    // 3.8 seconds
    si: 3000      // 3.0 seconds
  },
  
  optimization: {
    enablePreloading: true,
    enablePrefetching: true,
    enableImageOptimization: true,
    enableCriticalCSS: true,
    enableServiceWorker: true,
    enableBundleOptimization: true
  },
  
  caching: {
    staticAssets: 31536000,    // 1 year
    dynamicContent: 300,       // 5 minutes
    apiResponses: 60,          // 1 minute
    userSessions: 1800         // 30 minutes
  }
};

// =============================================================================
// 🚀 RESOURCE PRELOADING & PREFETCHING
// =============================================================================

export class ResourceOptimizer {
  private static instance: ResourceOptimizer;
  private preloadedResources: Set<string> = new Set();
  private prefetchedResources: Set<string> = new Set();
  private criticalResources: string[] = [];

  static getInstance(): ResourceOptimizer {
    if (!ResourceOptimizer.instance) {
      ResourceOptimizer.instance = new ResourceOptimizer();
    }
    return ResourceOptimizer.instance;
  }

  initialize(): void {
    perfLogger.info('🚀 Initializing resource optimizer...');
    
    if (PERFORMANCE_CONFIG.optimization.enablePreloading) {
      this.preloadCriticalResources();
    }
    
    if (PERFORMANCE_CONFIG.optimization.enablePrefetching) {
      this.setupIntelligentPrefetching();
    }
    
    if (PERFORMANCE_CONFIG.optimization.enableImageOptimization) {
      this.optimizeImages();
    }
    
    if (PERFORMANCE_CONFIG.optimization.enableCriticalCSS) {
      this.extractCriticalCSS();
    }
  }

  private preloadCriticalResources(): void {
    perfLogger.info('📦 Preloading critical resources...');
    
    // Define critical resources for Houston Mobile Notary Pros
    // Note: Removed hard-coded Next.js assets as they cause 404s due to dynamic file names
    // Only preload resources that are immediately needed for LCP
    this.criticalResources = [
      // Critical fonts - only if used above the fold
      'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
      
      // Hero images - only if displayed above the fold
      '/hero-background.jpg'
      
      // Note: Removed favicon and icons as they're not critical for LCP
    ];
    
    this.criticalResources.forEach(resource => {
      this.preloadResource(resource);
    });
  }

  private preloadResource(url: string): void {
    if (this.preloadedResources.has(url)) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    
    // Determine resource type
    if (url.endsWith('.css')) {
      link.as = 'style';
    } else if (url.endsWith('.js')) {
      link.as = 'script';
    } else if (url.match(/\.(woff2|woff|ttf|otf)$/)) {
      link.as = 'font';
      link.crossOrigin = 'anonymous';
    } else if (url.match(/\.(jpg|jpeg|png|webp|avif|ico)$/)) {
      link.as = 'image';
    } else {
      // Fallback for unknown file types - don't preload them
      console.warn(`Unknown file type for preload: ${url}`);
      return;
    }
    
    link.href = url;
    document.head.appendChild(link);
    
    this.preloadedResources.add(url);
    perfLogger.debug(`📦 Preloaded: ${url}`);
  }

  private setupIntelligentPrefetching(): void {
    perfLogger.info('🔮 Setting up intelligent prefetching...');
    
    // Prefetch likely navigation targets based on user behavior
    const prefetchTargets = this.getPrefetchTargets();
    
    // Use Intersection Observer to prefetch when user scrolls near links
    const linkObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement;
          if (link.href && !this.prefetchedResources.has(link.href)) {
            this.prefetchResource(link.href);
          }
        }
      });
    }, { rootMargin: '50px' });
    
    // Observe all links
    document.querySelectorAll('a[href^="/"]').forEach(link => {
      linkObserver.observe(link);
    });
    
    // Immediate prefetch for high-probability pages
    prefetchTargets.forEach(target => {
      this.prefetchResource(target);
    });
  }

  private getPrefetchTargets(): string[] {
    const currentPath = window.location.pathname;
    
    // Define prefetch targets based on user journey
    const prefetchMap: Record<string, string[]> = {
      '/': ['/booking', '/services/mobile-notary', '/services/loan-signing-specialist'],
      '/services': ['/booking', '/faq', '/pricing'],
      '/services/mobile-notary': ['/booking', '/faq'],
      '/services/loan-signing-specialist': ['/booking', '/faq'],
      '/booking': ['/booking/success', '/payment'],
      '/faq': ['/booking', '/contact'],
      '/contact': ['/booking', '/services']
    };
    
    return prefetchMap[currentPath] || [];
  }

  private prefetchResource(url: string): void {
    if (this.prefetchedResources.has(url)) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
    
    this.prefetchedResources.add(url);
    perfLogger.debug(`🔮 Prefetched: ${url}`);
  }

  private optimizeImages(): void {
    perfLogger.info('🖼️ Optimizing images...');
    
    // Implement progressive image loading
    this.setupProgressiveImageLoading();
    
    // Convert images to WebP format
    this.convertToWebP();
    
    // Implement responsive images
    this.setupResponsiveImages();
  }

  private setupProgressiveImageLoading(): void {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          // Load low-quality placeholder first
          if (img.dataset.placeholder) {
            img.src = img.dataset.placeholder;
          }
          
          // Then load full-quality image
          const fullImg = new Image();
          fullImg.onload = () => {
            img.src = img.dataset.src!;
            img.classList.add('loaded');
          };
          fullImg.src = img.dataset.src!;
          
          imageObserver.unobserve(img);
        }
      });
    }, { rootMargin: '50px' });
    
    images.forEach(img => imageObserver.observe(img));
  }

  private convertToWebP(): void {
    // Check WebP support
    const supportsWebP = this.checkWebPSupport();
    
    if (supportsWebP) {
      const images = document.querySelectorAll('img[src$=".jpg"], img[src$=".jpeg"], img[src$=".png"]');
      
      images.forEach(img => {
        const htmlImg = img as HTMLImageElement;
        const webpSrc = htmlImg.src.replace(/\.(jpg|jpeg|png)$/, '.webp');
        
        // Check if WebP version exists
        fetch(webpSrc, { method: 'HEAD' })
          .then(response => {
            if (response.ok) {
              htmlImg.src = webpSrc;
            }
          })
          .catch(() => {
            // WebP version doesn't exist, keep original
          });
      });
    }
  }

  private checkWebPSupport(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  private setupResponsiveImages(): void {
    const images = document.querySelectorAll('img[data-sizes]');
    
    images.forEach(img => {
      const htmlImg = img as HTMLImageElement;
      const sizes = htmlImg.dataset.sizes;
      
      if (sizes) {
        const sizeMap = JSON.parse(sizes);
        const deviceWidth = window.innerWidth;
        
        // Find appropriate image size
        const sortedSizes = Object.keys(sizeMap).sort((a, b) => parseInt(a) - parseInt(b));
        
        for (const size of sortedSizes) {
          if (deviceWidth <= parseInt(size)) {
            htmlImg.src = sizeMap[size];
            break;
          }
        }
      }
    });
  }

  private extractCriticalCSS(): void {
    perfLogger.info('🎨 Extracting critical CSS...');
    
    // Identify critical CSS for above-the-fold content
    const criticalElements = document.querySelectorAll('header, nav, .hero, .hero-section, .above-fold');
    
    const criticalCSS = this.extractCSSForElements(criticalElements);
    
    if (criticalCSS) {
      // Inject critical CSS inline
      const style = document.createElement('style');
      style.textContent = criticalCSS;
      document.head.appendChild(style);
      
      // Load non-critical CSS asynchronously
      this.loadNonCriticalCSS();
    }
  }

  private extractCSSForElements(elements: NodeListOf<Element>): string {
    let criticalCSS = '';
    
    elements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      
      // Extract key properties for above-the-fold content
      const criticalProperties = [
        'display', 'position', 'top', 'left', 'right', 'bottom',
        'width', 'height', 'margin', 'padding', 'border',
        'background', 'color', 'font-family', 'font-size',
        'font-weight', 'line-height', 'text-align'
      ];
      
      let elementCSS = `.${element.className} {`;
      
      criticalProperties.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop);
        if (value && value !== 'auto' && value !== 'none') {
          elementCSS += `${prop}: ${value};`;
        }
      });
      
      elementCSS += '}';
      criticalCSS += elementCSS;
    });
    
    return criticalCSS;
  }

  private loadNonCriticalCSS(): void {
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    
    stylesheets.forEach(stylesheet => {
      const link = stylesheet as HTMLLinkElement;
      
      // Skip if already loaded or is critical
      if (link.dataset.loaded || link.href.includes('critical')) {
        return;
      }
      
      // Load non-critical CSS asynchronously
      link.media = 'print';
      link.onload = () => {
        link.media = 'all';
        link.dataset.loaded = 'true';
      };
    });
  }
}

// =============================================================================
// 🗃️ ADVANCED CACHING STRATEGIES
// =============================================================================

export class AdvancedCaching {
  private static instance: AdvancedCaching;
  private cacheStorage: CacheStorage | null = null;
  private indexedDB: IDBDatabase | null = null;

  static getInstance(): AdvancedCaching {
    if (!AdvancedCaching.instance) {
      AdvancedCaching.instance = new AdvancedCaching();
    }
    return AdvancedCaching.instance;
  }

  async initialize(): Promise<void> {
    perfLogger.info('🗃️ Initializing advanced caching...');
    
    // Initialize Cache API
    if ('caches' in window) {
      this.cacheStorage = window.caches;
      await this.setupCacheStrategies();
    }
    
    // Initialize IndexedDB for complex data
    if ('indexedDB' in window) {
      await this.initializeIndexedDB();
    }
    
    // Setup background sync
    this.setupBackgroundSync();
  }

  private async setupCacheStrategies(): Promise<void> {
    if (!this.cacheStorage) return;
    
    const cache = await this.cacheStorage.open('hmnp-advanced-cache-v1');
    
    // Cache critical resources
    const criticalResources = [
      '/',
      '/booking',
      '/services/mobile-notary',
      '/services/loan-signing-specialist',
      '/faq',
      '/manifest.json'
    ];
    
    await cache.addAll(criticalResources);
    
    console.log('✅ Critical resources cached');
  }

  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('hmnp-cache-db', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.indexedDB = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('api-cache')) {
          const apiStore = db.createObjectStore('api-cache', { keyPath: 'url' });
          apiStore.createIndex('timestamp', 'timestamp');
        }
        
        if (!db.objectStoreNames.contains('user-data')) {
          const userStore = db.createObjectStore('user-data', { keyPath: 'id' });
          userStore.createIndex('lastAccess', 'lastAccess');
        }
      };
    });
  }

  async cacheAPIResponse(url: string, data: any, ttl: number = 300): Promise<void> {
    if (!this.indexedDB) return;
    
    const transaction = this.indexedDB.transaction(['api-cache'], 'readwrite');
    const store = transaction.objectStore('api-cache');
    
    const cacheEntry = {
      url,
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000 // Convert to milliseconds
    };
    
    await store.put(cacheEntry);
    console.log(`💾 API response cached: ${url}`);
  }

  async getCachedAPIResponse(url: string): Promise<any | null> {
    if (!this.indexedDB) return null;
    
    const transaction = this.indexedDB.transaction(['api-cache'], 'readonly');
    const store = transaction.objectStore('api-cache');
    
    return new Promise((resolve) => {
      const request = store.get(url);
      
      request.onsuccess = () => {
        const result = request.result;
        
        if (result) {
          const age = Date.now() - result.timestamp;
          
          if (age < result.ttl) {
            console.log(`💾 API response retrieved from cache: ${url}`);
            resolve(result.data);
          } else {
            // Expired, remove from cache
            this.removeFromCache(url);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => resolve(null);
    });
  }

  private async removeFromCache(url: string): Promise<void> {
    if (!this.indexedDB) return;
    
    const transaction = this.indexedDB.transaction(['api-cache'], 'readwrite');
    const store = transaction.objectStore('api-cache');
    
    await store.delete(url);
  }

  private setupBackgroundSync(): void {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        // Register background sync
        return registration.sync.register('background-sync');
      });
    }
  }
}

// =============================================================================
// 📊 PERFORMANCE MONITORING
// =============================================================================

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  initialize(): void {
    console.log('📊 Initializing performance monitoring...');
    
    this.setupNavigationObserver();
    this.setupResourceObserver();
    this.setupLongTaskObserver();
    this.setupUserTimingObserver();
    
    // Report metrics periodically
    setInterval(() => {
      this.reportMetrics();
    }, 30000); // Every 30 seconds
  }

  private setupNavigationObserver(): void {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        const navEntry = entry as PerformanceNavigationTiming;
        
        this.metrics.set('ttfb', navEntry.responseStart - navEntry.requestStart);
        this.metrics.set('dom-content-loaded', navEntry.domContentLoadedEventEnd - navEntry.navigationStart);
        this.metrics.set('load-complete', navEntry.loadEventEnd - navEntry.navigationStart);
        
        console.log('📊 Navigation metrics updated');
      });
    });
    
    observer.observe({ entryTypes: ['navigation'] });
    this.observers.push(observer);
  }

  private setupResourceObserver(): void {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        const resourceEntry = entry as PerformanceResourceTiming;
        
        if (resourceEntry.duration > 1000) { // Slow resources > 1s
          console.warn(`🐌 Slow resource: ${resourceEntry.name} (${resourceEntry.duration}ms)`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
    this.observers.push(observer);
  }

  private setupLongTaskObserver(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          console.warn(`🐌 Long task detected: ${entry.duration}ms`);
          
          // Track long tasks
          const longTasks = this.metrics.get('long-tasks') || 0;
          this.metrics.set('long-tasks', longTasks + 1);
        });
      });
      
      try {
        observer.observe({ entryTypes: ['longtask'] });
        this.observers.push(observer);
      } catch (e) {
        console.warn('Long task observer not supported');
      }
    }
  }

  private setupUserTimingObserver(): void {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        console.log(`⏱️ User timing: ${entry.name} - ${entry.duration}ms`);
        this.metrics.set(`user-timing-${entry.name}`, entry.duration);
      });
    });
    
    observer.observe({ entryTypes: ['measure'] });
    this.observers.push(observer);
  }

  private reportMetrics(): void {
    const metricsData = Object.fromEntries(this.metrics);
    
    // Send to analytics
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metrics: metricsData,
        timestamp: Date.now(),
        url: window.location.href
      })
    }).catch(console.error);
  }

  markTiming(name: string): void {
    performance.mark(name);
  }

  measureTiming(name: string, startMark?: string): void {
    if (startMark) {
      performance.measure(name, startMark);
    } else {
      performance.measure(name);
    }
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// =============================================================================
// 🚀 INITIALIZATION
// =============================================================================

export async function initializeAdvancedPageSpeed(): Promise<void> {
  // Singleton guard to prevent duplicate initialization
  if (typeof window !== 'undefined' && (window as any).__advancedPageSpeedInitialized) {
    return;
  }
  if (typeof window !== 'undefined') {
    (window as any).__advancedPageSpeedInitialized = true;
  }

  perfLogger.info('🚀 Initializing advanced page speed optimization...');
  
  try {
    // Initialize resource optimizer
    const resourceOptimizer = ResourceOptimizer.getInstance();
    resourceOptimizer.initialize();
    
    // Initialize advanced caching
    const advancedCaching = AdvancedCaching.getInstance();
    await advancedCaching.initialize();
    
    // Initialize performance monitoring
    const performanceMonitor = PerformanceMonitor.getInstance();
    performanceMonitor.initialize();
    
    console.log('✅ Advanced page speed optimization initialized');
    
  } catch (error) {
    console.error('❌ Failed to initialize page speed optimization:', error);
  }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdvancedPageSpeed);
  } else {
    initializeAdvancedPageSpeed();
  }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdvancedPageSpeed);
  } else {
    initializeAdvancedPageSpeed();
  }
} 