/**
 * 🚀 Core Web Vitals Optimization - Phase 5 Technical SEO
 * Houston Mobile Notary Pros
 * 
 * This module provides comprehensive Core Web Vitals optimization
 * to achieve top Google rankings for mobile notary searches.
 * 
 * Target Metrics:
 * - LCP (Largest Contentful Paint): < 2.5s
 * - FID (First Input Delay): < 100ms 
 * - CLS (Cumulative Layout Shift): < 0.1
 * - INP (Interaction to Next Paint): < 200ms
 */

// Dynamic import to prevent server-side execution
// import { onLCP, onINP, onCLS, onFCP, onTTFB } from 'web-vitals';

// Import logging utilities
import { perfLogger, debugLogger, errorLogger } from '@/lib/logger';

// Type declaration for Google Analytics gtag function
declare global {
  function gtag(command: string, ...args: any[]): void;
}

// Web Vitals types
interface WebVitalsMetric {
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
  name: string;
  delta: number;
  entries: any[];
}

// =============================================================================
// 📊 CORE WEB VITALS MONITORING
// =============================================================================

export interface WebVitalsMetrics {
  lcp: number;
  inp: number;
  cls: number;
  fcp: number;
  ttfb: number;
}

export interface OptimizationReport {
  metrics: WebVitalsMetrics;
  recommendations: string[];
  score: number;
  issues: string[];
  optimizations: string[];
}

// Track performance across user sessions
let performanceData: Partial<WebVitalsMetrics> = {};
let optimizationCallbacks: ((report: OptimizationReport) => void)[] = [];

// =============================================================================
// 🎯 PERFORMANCE MONITORING INITIALIZATION
// =============================================================================

export async function initializeWebVitalsMonitoring() {
  if (typeof window === 'undefined') return;
  
  // Singleton guard to prevent duplicate initialization
  if ((window as any).__webVitalsInitialized) {
    return;
  }
  (window as any).__webVitalsInitialized = true;

  try {
    // Dynamic import to prevent server-side execution
    const { onLCP, onINP, onCLS, onFCP, onTTFB } = await import('web-vitals');

    // Largest Contentful Paint (LCP) - Critical for mobile "near me" searches
    onLCP((metric) => {
      performanceData.lcp = metric.value;
      
      // Log LCP performance
      perfLogger.metrics(`LCP: ${metric.value}ms`, {
        rating: metric.rating,
        target: '< 2500ms',
        passed: metric.value < 2500
      });

      // Send to analytics
      sendToAnalytics('lcp', metric.value, metric.rating);
      
      // Auto-optimize if LCP is poor
      if (metric.value > 2500) {
        optimizeLCP();
      }
    });

    // Interaction to Next Paint (INP) - Critical for booking conversions (replaces FID)
    onINP((metric) => {
      performanceData.inp = metric.value;
      
      perfLogger.metrics(`INP: ${metric.value}ms`, {
        rating: metric.rating,
        target: '< 200ms',
        passed: metric.value < 200
      });

      sendToAnalytics('inp', metric.value, metric.rating);
      
      if (metric.value > 200) {
        optimizeINP();
      }
    });

    // Cumulative Layout Shift (CLS) - Critical for mobile UX
    onCLS((metric) => {
      performanceData.cls = metric.value;
      
      perfLogger.metrics(`CLS: ${metric.value}`, {
        rating: metric.rating,
        target: '< 0.1',
        passed: metric.value < 0.1
      });

      sendToAnalytics('cls', metric.value, metric.rating);
      
      if (metric.value > 0.1) {
        optimizeCLS();
      }
    });

    // First Contentful Paint (FCP)
    onFCP((metric) => {
      performanceData.fcp = metric.value;
      sendToAnalytics('fcp', metric.value, metric.rating);
    });

    // Time to First Byte (TTFB)
    onTTFB((metric) => {
      performanceData.ttfb = metric.value;
      sendToAnalytics('ttfb', metric.value, metric.rating);
    });
  } catch (error) {
    errorLogger.error('Failed to initialize web vitals monitoring:', error instanceof Error ? error : new Error(String(error)));
  }
}

// =============================================================================
// 🚀 LCP OPTIMIZATION STRATEGIES
// =============================================================================

function optimizeLCP() {
  perfLogger.optimization('Optimizing LCP performance...');
  
  // Strategy 1: Preload critical resources
  preloadCriticalResources();
  
  // Strategy 2: Optimize images
  optimizeImages();
  
  // Strategy 3: Reduce render-blocking resources
  optimizeRenderBlocking();
  
  // Strategy 4: Improve server response times
  optimizeServerResponse();
}

function preloadCriticalResources() {
  if (typeof window === 'undefined') return;
  
  const head = document.head;
  
  // Preload hero image
  const heroPreload = document.createElement('link');
  heroPreload.rel = 'preload';
  heroPreload.as = 'image';
  heroPreload.href = '/hero-background.jpg';
  head.appendChild(heroPreload);
  
  // Note: Removed hard-coded CSS preload as it causes 404s due to dynamic file names
  // Next.js automatically handles critical CSS loading
  
  // Note: Font preloading is handled by advanced-page-speed.ts to avoid duplication
}

function optimizeImages() {
  if (typeof window === 'undefined') return;
  
  // Lazy load images below the fold
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src!;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach((img) => imageObserver.observe(img));
}

function optimizeRenderBlocking() {
  if (typeof window === 'undefined') return;
  
  // Defer non-critical CSS
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  stylesheets.forEach((stylesheet) => {
    const link = stylesheet as HTMLLinkElement;
    if (!link.href.includes('critical') && !link.href.includes('app.css')) {
      link.media = 'print';
      link.onload = () => {
        link.media = 'all';
      };
    }
  });
}

function optimizeServerResponse() {
  if (typeof window === 'undefined') return;
  
  // Prefetch likely navigation targets
  const prefetchTargets = [
    '/booking',
    '/services/mobile-notary',
    '/services/loan-signing-specialist',
    '/faq'
  ];
  
  prefetchTargets.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
}

// =============================================================================
// ⚡ FID OPTIMIZATION STRATEGIES
// =============================================================================

function optimizeFID() {
  perfLogger.optimization('Optimizing FID performance...');
  
  // Strategy 1: Break up long tasks
  optimizeLongTasks();
  
  // Strategy 2: Defer non-essential JavaScript
  deferNonEssentialJS();
  
  // Strategy 3: Use web workers for heavy computations
  useWebWorkers();
}

function optimizeLongTasks() {
  // Use scheduler.postTask if available
  if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
    const scheduler = (window as any).scheduler;
    
    // Defer heavy operations
    scheduler.postTask(() => {
      // Heavy DOM manipulations
      initializeNonCriticalComponents();
    }, { priority: 'background' });
  } else {
    // Fallback using setTimeout
    setTimeout(() => {
      initializeNonCriticalComponents();
    }, 0);
  }
}

function deferNonEssentialJS() {
  if (typeof window === 'undefined') return;
  
  // Defer analytics scripts
  const scripts = document.querySelectorAll('script[data-defer]');
  scripts.forEach((script) => {
    const newScript = document.createElement('script');
    newScript.src = (script as HTMLScriptElement).src;
    newScript.async = true;
    document.body.appendChild(newScript);
    script.remove();
  });
}

function useWebWorkers() {
  if (typeof window === 'undefined') return;
  
  // Use web workers for pricing calculations
  if ('Worker' in window) {
    const worker = new Worker('/workers/pricing-calculator.js');
    
    worker.onmessage = (event) => {
      const { type, data } = event.data;
      if (type === 'pricing-calculated') {
        updatePricingUI(data);
      }
    };
    
    // Store worker reference globally
    (window as any).pricingWorker = worker;
  }
}

// =============================================================================
// 📐 CLS OPTIMIZATION STRATEGIES  
// =============================================================================

function optimizeCLS() {
  perfLogger.optimization('Optimizing CLS performance...');
  
  // Strategy 1: Reserve space for dynamic content
  reserveSpaceForDynamicContent();
  
  // Strategy 2: Avoid inserting content above existing content
  avoidContentInsertion();
  
  // Strategy 3: Use CSS containment
  useCSSContainment();
}

function reserveSpaceForDynamicContent() {
  if (typeof window === 'undefined') return;
  
  // Reserve space for images
  const images = document.querySelectorAll('img:not([width]):not([height])');
  images.forEach((img) => {
    const htmlImg = img as HTMLImageElement;
    htmlImg.style.aspectRatio = '16/9'; // Default aspect ratio
    htmlImg.style.width = '100%';
    htmlImg.style.height = 'auto';
  });
  
  // Reserve space for ads/widgets
  const adSlots = document.querySelectorAll('.ad-slot');
  adSlots.forEach((slot) => {
    const htmlSlot = slot as HTMLElement;
    htmlSlot.style.minHeight = '250px';
  });
}

function avoidContentInsertion() {
  if (typeof window === 'undefined') return;
  
  // Use transform instead of top/left changes
  const animations = document.querySelectorAll('[data-animate]');
  animations.forEach((element) => {
    const htmlElement = element as HTMLElement;
    htmlElement.style.transform = 'translateY(0)';
    htmlElement.style.willChange = 'transform';
  });
}

function useCSSContainment() {
  if (typeof window === 'undefined') return;
  
  // Add CSS containment to independent sections
  const sections = document.querySelectorAll('section, .container');
  sections.forEach((section) => {
    const htmlSection = section as HTMLElement;
    htmlSection.style.contain = 'layout style';
  });
}

// =============================================================================
// 🔄 INP OPTIMIZATION STRATEGIES
// =============================================================================

function optimizeINP() {
  perfLogger.optimization('Optimizing INP performance...');
  
  // Strategy 1: Debounce frequent interactions
  debounceInteractions();
  
  // Strategy 2: Use event delegation
  useEventDelegation();
  
  // Strategy 3: Optimize form inputs
  optimizeFormInputs();
}

function debounceInteractions() {
  if (typeof window === 'undefined') return;
  
  // Debounce search input
  const searchInputs = document.querySelectorAll('input[type="search"], input[data-search]');
  searchInputs.forEach((input) => {
    let timeout: NodeJS.Timeout;
    input.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        // Perform search
        performSearch((input as HTMLInputElement).value);
      }, 300);
    });
  });
}

function useEventDelegation() {
  if (typeof window === 'undefined') return;
  
  // Use event delegation for dynamic content
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    
    if (target.matches('.btn-book-now')) {
      event.preventDefault();
      navigateToBooking();
    }
    
    if (target.matches('.service-card')) {
      event.preventDefault();
      selectService(target.dataset.service!);
    }
  });
}

function optimizeFormInputs() {
  if (typeof window === 'undefined') return;
  
  // Optimize form validation
  const forms = document.querySelectorAll('form');
  forms.forEach((form) => {
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      input.addEventListener('blur', () => {
        // Defer validation to avoid blocking
        setTimeout(() => {
          validateField(input as HTMLInputElement);
        }, 0);
      });
    });
  });
}

// =============================================================================
// 📊 ANALYTICS & REPORTING
// =============================================================================

function sendToAnalytics(metric: string, value: number, rating: string) {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  // Send to Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'core_web_vitals', {
      metric_name: metric,
      metric_value: value,
      metric_rating: rating
    });
  }
  
  // Send to internal analytics
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      metric,
      value,
      rating,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    })
  }).catch(error => errorLogger.error('Failed to send web vitals to analytics:', error));
}

export function generateOptimizationReport(): OptimizationReport {
  const recommendations: string[] = [];
  const issues: string[] = [];
  const optimizations: string[] = [];
  
  // Analyze LCP
  if (performanceData.lcp && performanceData.lcp > 2500) {
    issues.push(`LCP is ${performanceData.lcp}ms (target: < 2500ms)`);
    recommendations.push('Optimize images and preload critical resources');
    optimizations.push('Implement image lazy loading and WebP format');
  }
  
  // Analyze INP
  if (performanceData.inp && performanceData.inp > 200) {
    issues.push(`INP is ${performanceData.inp}ms (target: < 200ms)`);
    recommendations.push('Reduce JavaScript execution time and optimize interactions');
    optimizations.push('Use web workers for heavy computations and break up long tasks');
  }
  
  // Analyze CLS
  if (performanceData.cls && performanceData.cls > 0.1) {
    issues.push(`CLS is ${performanceData.cls} (target: < 0.1)`);
    recommendations.push('Reserve space for dynamic content');
    optimizations.push('Add width/height attributes to images');
  }
  
  // Calculate overall score
  const score = calculatePerformanceScore(performanceData);
  
  return {
    metrics: performanceData as WebVitalsMetrics,
    recommendations,
    issues,
    optimizations,
    score
  };
}

function calculatePerformanceScore(metrics: Partial<WebVitalsMetrics>): number {
  let score = 100;
  
  // LCP penalty
  if (metrics.lcp) {
    if (metrics.lcp > 2500) score -= 30;
    else if (metrics.lcp > 2000) score -= 15;
  }
  
  // INP penalty
  if (metrics.inp) {
    if (metrics.inp > 200) score -= 25;
    else if (metrics.inp > 100) score -= 10;
  }
  
  // CLS penalty
  if (metrics.cls) {
    if (metrics.cls > 0.1) score -= 25;
    else if (metrics.cls > 0.05) score -= 10;
  }
  
  // INP penalty
  if (metrics.inp) {
    if (metrics.inp > 200) score -= 20;
    else if (metrics.inp > 100) score -= 8;
  }
  
  return Math.max(0, score);
}

// =============================================================================
// 🎯 HELPER FUNCTIONS
// =============================================================================

function initializeNonCriticalComponents() {
  // Initialize testimonials carousel
  initializeTestimonialsCarousel();
  
  // Initialize FAQ accordion
  initializeFAQAccordion();
  
  // Initialize service area map
  initializeServiceAreaMap();
}

function performSearch(query: string) {
  // Implement search functionality
  debugLogger.debug('Searching for:', query);
}

function navigateToBooking() {
  if (typeof window === 'undefined') return;
  
  // Navigate to booking page
  window.location.href = '/booking';
}

function selectService(service: string) {
  // Handle service selection
  debugLogger.debug('Selected service:', service);
}

function validateField(input: HTMLInputElement) {
  // Validate form field
  debugLogger.debug('Validating field:', input.name);
}

function updatePricingUI(data: any) {
  // Update pricing display
  debugLogger.debug('Updating pricing UI:', data);
}

function initializeTestimonialsCarousel() {
  // Initialize testimonials
}

function initializeFAQAccordion() {
  // Initialize FAQ
}

function initializeServiceAreaMap() {
  // Initialize map
}

// =============================================================================
// 🚀 INITIALIZATION
// =============================================================================

// Note: Initialization is now handled by the Phase5TechnicalSEO component
// No auto-initialization to prevent server-side execution 