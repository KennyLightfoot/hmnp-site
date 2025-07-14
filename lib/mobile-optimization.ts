/**
 * 📱 Mobile Optimization System - Phase 5 Technical SEO
 * Houston Mobile Notary Pros
 * 
 * This module provides comprehensive mobile optimization targeting
 * the 6.1M "near me" searches identified in our SEO analysis.
 * 
 * Key Focus Areas:
 * - "Near me" search optimization
 * - Mobile-first responsive design
 * - Touch-friendly interactions
 * - Mobile page speed optimization
 * - Local search visibility
 * - Mobile conversion optimization
 */

// =============================================================================
// 📊 MOBILE OPTIMIZATION CONFIGURATION
// =============================================================================

interface MobileOptimizationConfig {
  // Breakpoints for responsive design
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  
  // Touch target minimum sizes
  touchTargets: {
    minSize: number;
    spacing: number;
  };
  
  // Performance thresholds
  performance: {
    maxLCP: number;
    maxFID: number;
    maxCLS: number;
    maxTTI: number;
  };
  
  // Near me search optimization
  nearMeOptimization: {
    enabled: boolean;
    geolocationTimeout: number;
    fallbackZip: string;
    serviceRadius: number;
  };
}

const MOBILE_CONFIG: MobileOptimizationConfig = {
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  },
  touchTargets: {
    minSize: 44, // 44px minimum touch target
    spacing: 8   // 8px spacing between targets
  },
  performance: {
    maxLCP: 2500,  // 2.5 seconds
    maxFID: 100,   // 100ms
    maxCLS: 0.1,   // 0.1 CLS score
    maxTTI: 3800   // 3.8 seconds
  },
  nearMeOptimization: {
    enabled: true,
    geolocationTimeout: 5000,
    fallbackZip: '77591', // Pearland, TX
    serviceRadius: 25      // 25-mile radius
  }
};

// =============================================================================
// 🎯 MOBILE DEVICE DETECTION & OPTIMIZATION
// =============================================================================

export interface MobileDevice {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'small' | 'medium' | 'large';
  touchCapable: boolean;
  orientation: 'portrait' | 'landscape';
  connectionType: 'slow' | 'fast' | 'unknown';
}

export function detectMobileDevice(): MobileDevice {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenSize: 'large',
      touchCapable: false,
      orientation: 'landscape',
      connectionType: 'unknown'
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Device detection
  const isMobile = width < MOBILE_CONFIG.breakpoints.mobile;
  const isTablet = width >= MOBILE_CONFIG.breakpoints.mobile && width < MOBILE_CONFIG.breakpoints.tablet;
  const isDesktop = width >= MOBILE_CONFIG.breakpoints.tablet;
  
  // Screen size classification
  let screenSize: 'small' | 'medium' | 'large' = 'large';
  if (width < 480) screenSize = 'small';
  else if (width < 768) screenSize = 'medium';
  
  // Touch capability
  const touchCapable = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Orientation
  const orientation = height > width ? 'portrait' : 'landscape';
  
  // Connection type detection
  let connectionType: 'slow' | 'fast' | 'unknown' = 'unknown';
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      connectionType = ['slow-2g', '2g', '3g'].includes(effectiveType) ? 'slow' : 'fast';
    }
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenSize,
    touchCapable,
    orientation,
    connectionType
  };
}

// =============================================================================
// 🌍 "NEAR ME" SEARCH OPTIMIZATION
// =============================================================================

export interface LocationData {
  latitude: number;
  longitude: number;
  zipCode: string;
  city: string;
  state: string;
  withinServiceArea: boolean;
  distanceFromBase: number;
}

export class NearMeOptimizer {
  private static instance: NearMeOptimizer;
  private locationData: LocationData | null = null;
  private callbacks: ((location: LocationData) => void)[] = [];

  static getInstance(): NearMeOptimizer {
    if (!NearMeOptimizer.instance) {
      NearMeOptimizer.instance = new NearMeOptimizer();
    }
    return NearMeOptimizer.instance;
  }

  async initializeLocationServices(): Promise<void> {
    console.log('🌍 Initializing "Near Me" optimization...');
    
    // Try to get user's location
    try {
      const location = await this.getUserLocation();
      await this.processLocationData(location);
    } catch (error) {
      console.warn('Geolocation failed, using fallback:', error);
      await this.useFallbackLocation();
    }
  }

  private async getUserLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: MOBILE_CONFIG.nearMeOptimization.geolocationTimeout,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  private async processLocationData(position: GeolocationPosition): Promise<void> {
    const { latitude, longitude } = position.coords;
    
    try {
      // Reverse geocode to get address details
      const response = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
      const locationInfo = await response.json();
      
      // Calculate distance from service base (Pearland, TX)
      const distance = this.calculateDistance(
        latitude,
        longitude,
        29.5630556, // Pearland coordinates
        -95.2861111
      );
      
      this.locationData = {
        latitude,
        longitude,
        zipCode: locationInfo.zipCode || MOBILE_CONFIG.nearMeOptimization.fallbackZip,
        city: locationInfo.city || 'Houston',
        state: locationInfo.state || 'TX',
        withinServiceArea: distance <= MOBILE_CONFIG.nearMeOptimization.serviceRadius,
        distanceFromBase: distance
      };
      
      console.log('📍 Location detected:', this.locationData);
      
      // Optimize content for user's location
      this.optimizeForLocation();
      
      // Notify callbacks
      this.callbacks.forEach(callback => callback(this.locationData!));
      
    } catch (error) {
      console.error('Failed to process location:', error);
      await this.useFallbackLocation();
    }
  }

  private async useFallbackLocation(): Promise<void> {
    console.log('🔄 Using fallback location (Pearland, TX)');
    
    this.locationData = {
      latitude: 29.5630556,
      longitude: -95.2861111,
      zipCode: '77591',
      city: 'Pearland',
      state: 'TX',
      withinServiceArea: true,
      distanceFromBase: 0
    };
    
    this.optimizeForLocation();
    this.callbacks.forEach(callback => callback(this.locationData!));
  }

  private optimizeForLocation(): void {
    if (!this.locationData) return;
    
    const { city, zipCode, withinServiceArea, distanceFromBase } = this.locationData;
    
    // Update page titles and meta descriptions
    this.updateLocationSEO(city, zipCode);
    
    // Show/hide service area messaging
    this.updateServiceAreaMessaging(withinServiceArea, distanceFromBase);
    
    // Optimize CTAs based on location
    this.optimizeLocationCTAs(withinServiceArea);
    
    // Update schema markup
    this.updateLocationSchema(this.locationData);
  }

  private updateLocationSEO(city: string, zipCode: string): void {
    // Update title for better local SEO
    const title = document.title;
    if (!title.includes(city)) {
      document.title = `${title} | ${city} Mobile Notary Service`;
    }
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      const content = metaDescription.getAttribute('content') || '';
      if (!content.includes(city)) {
        metaDescription.setAttribute('content', 
          `${content} Serving ${city}, ${zipCode} and surrounding areas.`);
      }
    }
  }

  private updateServiceAreaMessaging(withinServiceArea: boolean, distance: number): void {
    const serviceAreaElements = document.querySelectorAll('[data-service-area]');
    
    serviceAreaElements.forEach(element => {
      const htmlElement = element as HTMLElement;
      
      if (withinServiceArea) {
        htmlElement.innerHTML = `
          <div class="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-green-700">
                  ✅ <strong>Great news!</strong> We serve your area. 
                  We're approximately ${distance.toFixed(1)} miles away.
                </p>
              </div>
            </div>
          </div>
        `;
      } else {
        htmlElement.innerHTML = `
          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-yellow-700">
                  ⚠️ You're ${distance.toFixed(1)} miles from our service area. 
                  <a href="/contact" class="underline">Contact us</a> for availability.
                </p>
              </div>
            </div>
          </div>
        `;
      }
    });
  }

  private optimizeLocationCTAs(withinServiceArea: boolean): void {
    const ctaButtons = document.querySelectorAll('[data-cta]');
    
    ctaButtons.forEach(button => {
      const htmlButton = button as HTMLElement;
      
      if (withinServiceArea) {
        htmlButton.textContent = 'Book Mobile Notary Now';
        htmlButton.className += ' bg-green-600 hover:bg-green-700';
      } else {
        htmlButton.textContent = 'Check Availability';
        htmlButton.className += ' bg-yellow-600 hover:bg-yellow-700';
      }
    });
  }

  private updateLocationSchema(location: LocationData): void {
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    if (schemaScript) {
      try {
        const schema = JSON.parse(schemaScript.textContent || '{}');
        
        // Update service area
        if (schema.areaServed) {
          schema.areaServed.push({
            '@type': 'City',
            name: location.city,
            addressRegion: location.state,
            postalCode: location.zipCode
          });
        }
        
        schemaScript.textContent = JSON.stringify(schema);
      } catch (error) {
        console.error('Failed to update schema:', error);
      }
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  onLocationDetected(callback: (location: LocationData) => void): void {
    this.callbacks.push(callback);
    
    // If location is already available, call immediately
    if (this.locationData) {
      callback(this.locationData);
    }
  }

  getLocationData(): LocationData | null {
    return this.locationData;
  }
}

// =============================================================================
// 🎯 MOBILE TOUCH OPTIMIZATION
// =============================================================================

export function optimizeTouchInteractions(): void {
  console.log('👆 Optimizing touch interactions...');
  
  // Ensure minimum touch target sizes
  const touchTargets = document.querySelectorAll('button, a, input, select, textarea');
  touchTargets.forEach(target => {
    const element = target as HTMLElement;
    const rect = element.getBoundingClientRect();
    
    if (rect.width < MOBILE_CONFIG.touchTargets.minSize || 
        rect.height < MOBILE_CONFIG.touchTargets.minSize) {
      element.style.minWidth = `${MOBILE_CONFIG.touchTargets.minSize}px`;
      element.style.minHeight = `${MOBILE_CONFIG.touchTargets.minSize}px`;
      element.style.padding = `${MOBILE_CONFIG.touchTargets.spacing}px`;
    }
  });
  
  // Add touch feedback
  addTouchFeedback();
  
  // Optimize scroll behavior
  optimizeScrollBehavior();
  
  // Add swipe gestures
  addSwipeGestures();
}

function addTouchFeedback(): void {
  const interactiveElements = document.querySelectorAll('button, a, [data-interactive]');
  
  interactiveElements.forEach(element => {
    const htmlElement = element as HTMLElement;
    
    htmlElement.addEventListener('touchstart', () => {
      htmlElement.style.transform = 'scale(0.95)';
      htmlElement.style.opacity = '0.8';
    });
    
    htmlElement.addEventListener('touchend', () => {
      htmlElement.style.transform = 'scale(1)';
      htmlElement.style.opacity = '1';
    });
  });
}

function optimizeScrollBehavior(): void {
  // Smooth scrolling for mobile
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // Add momentum scrolling for iOS
  const scrollableElements = document.querySelectorAll('.scrollable');
  scrollableElements.forEach(element => {
    const htmlElement = element as HTMLElement;
    htmlElement.style.webkitOverflowScrolling = 'touch';
  });
}

function addSwipeGestures(): void {
  let startX = 0;
  let startY = 0;
  
  document.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  });
  
  document.addEventListener('touchmove', (e) => {
    if (!startX || !startY) return;
    
    const diffX = startX - e.touches[0].clientX;
    const diffY = startY - e.touches[0].clientY;
    
    // Detect swipe gestures
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 50) {
        // Swipe left
        handleSwipeLeft();
      } else if (diffX < -50) {
        // Swipe right
        handleSwipeRight();
      }
    }
  });
}

function handleSwipeLeft(): void {
  // Handle left swipe (e.g., next service)
  console.log('👈 Swipe left detected');
}

function handleSwipeRight(): void {
  // Handle right swipe (e.g., previous service)
  console.log('👉 Swipe right detected');
}

// =============================================================================
// 📊 MOBILE PERFORMANCE MONITORING
// =============================================================================

export function monitorMobilePerformance(): void {
  const device = detectMobileDevice();
  
  if (!device.isMobile) return;
  
  console.log('📱 Monitoring mobile performance...');
  
  // Track mobile-specific metrics
  const performanceObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach(entry => {
      if (entry.entryType === 'navigation') {
        const navigationEntry = entry as PerformanceNavigationTiming;
        
        // Send mobile performance data
        sendMobilePerformanceData({
          type: 'navigation',
          loadTime: navigationEntry.loadEventEnd - navigationEntry.navigationStart,
          domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.navigationStart,
          firstPaint: navigationEntry.domContentLoadedEventEnd - navigationEntry.navigationStart,
          device: device,
          connectionType: device.connectionType
        });
      }
    });
  });
  
  performanceObserver.observe({ entryTypes: ['navigation'] });
}

function sendMobilePerformanceData(data: any): void {
  fetch('/api/analytics/mobile-performance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  }).catch(console.error);
}

// =============================================================================
// 🚀 MOBILE OPTIMIZATION INITIALIZATION
// =============================================================================

export function initializeMobileOptimization(): void {
  // Singleton guard to prevent duplicate initialization
  if (typeof window !== 'undefined' && (window as any).__mobileOptimizationInitialized) {
    return;
  }
  if (typeof window !== 'undefined') {
    (window as any).__mobileOptimizationInitialized = true;
  }

  console.log('🚀 Initializing mobile optimization system...');
  
  const device = detectMobileDevice();
  
  if (device.isMobile) {
    // Initialize near me optimization
    const nearMeOptimizer = NearMeOptimizer.getInstance();
    nearMeOptimizer.initializeLocationServices();
    
    // Optimize touch interactions
    optimizeTouchInteractions();
    
    // Monitor performance
    monitorMobilePerformance();
    
    // Add mobile-specific styles
    addMobileStyles();
    
    console.log('✅ Mobile optimization initialized for', device.screenSize, 'screen');
  }
}

function addMobileStyles(): void {
  const style = document.createElement('style');
  style.textContent = `
    /* Mobile-specific optimizations */
    @media (max-width: 768px) {
      /* Improve text readability */
      body {
        font-size: 16px;
        line-height: 1.5;
      }
      
      /* Optimize button sizes */
      button, .btn {
        min-height: 44px;
        min-width: 44px;
        padding: 12px 16px;
      }
      
      /* Improve form usability */
      input, textarea, select {
        font-size: 16px; /* Prevent zoom on iOS */
        min-height: 44px;
      }
      
      /* Optimize spacing */
      .container {
        padding: 16px;
      }
      
      /* Improve mobile navigation */
      .mobile-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: white;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
      }
      
      /* Service area messaging */
      .service-area-message {
        position: sticky;
        top: 0;
        z-index: 999;
      }
    }
  `;
  
  document.head.appendChild(style);
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMobileOptimization);
  } else {
    initializeMobileOptimization();
  }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMobileOptimization);
  } else {
    initializeMobileOptimization();
  }
} 