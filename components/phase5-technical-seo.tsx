'use client';

/**
 * 🚀 Phase 5: Technical SEO Component
 * Houston Mobile Notary Pros
 * 
 * This component initializes all Phase 5 technical SEO optimizations:
 * - Core Web Vitals optimization
 * - Mobile optimization for "near me" searches
 * - Advanced page speed optimization
 * - Enhanced schema markup expansion
 */

import React, { useEffect, useState } from 'react';

// Dynamic imports for code splitting
const initializeWebVitalsMonitoring = () => import('@/lib/core-web-vitals').then(m => m.initializeWebVitalsMonitoring);
const initializeMobileOptimization = () => import('@/lib/mobile-optimization').then(m => m.initializeMobileOptimization);
const initializeAdvancedPageSpeed = () => import('@/lib/advanced-page-speed').then(m => m.initializeAdvancedPageSpeed);
const initializeEnhancedSchemaMarkup = () => import('@/lib/enhanced-schema-markup').then(m => m.initializeEnhancedSchemaMarkup);

interface Phase5Status {
  webVitals: 'pending' | 'loading' | 'loaded' | 'error';
  mobileOptimization: 'pending' | 'loading' | 'loaded' | 'error';
  pageSpeed: 'pending' | 'loading' | 'loaded' | 'error';
  schemaMarkup: 'pending' | 'loading' | 'loaded' | 'error';
}

export default function Phase5TechnicalSEO() {
  const [status, setStatus] = useState<Phase5Status>({
    webVitals: 'pending',
    mobileOptimization: 'pending',
    pageSpeed: 'pending',
    schemaMarkup: 'pending'
  });

  const [initializationComplete, setInitializationComplete] = useState(false);

  useEffect(() => {
    // Initialize Phase 5 optimizations
    initializePhase5Optimizations();
  }, []);

  const initializePhase5Optimizations = async () => {
    console.log('🚀 Phase 5: Starting Technical SEO Optimization...');
    
    try {
      // Initialize Core Web Vitals monitoring
      setStatus(prev => ({ ...prev, webVitals: 'loading' }));
      const webVitalsInit = await initializeWebVitalsMonitoring();
      await webVitalsInit(); // This is now async
      setStatus(prev => ({ ...prev, webVitals: 'loaded' }));
      console.log('✅ Phase 5: Core Web Vitals optimization initialized');

      // Initialize Mobile Optimization
      setStatus(prev => ({ ...prev, mobileOptimization: 'loading' }));
      const mobileInit = await initializeMobileOptimization();
      await mobileInit();
      setStatus(prev => ({ ...prev, mobileOptimization: 'loaded' }));
      console.log('✅ Phase 5: Mobile optimization initialized');

      // Initialize Advanced Page Speed
      setStatus(prev => ({ ...prev, pageSpeed: 'loading' }));
      const pageSpeedInit = await initializeAdvancedPageSpeed();
      await pageSpeedInit();
      setStatus(prev => ({ ...prev, pageSpeed: 'loaded' }));
      console.log('✅ Phase 5: Advanced page speed optimization initialized');

      // Initialize Enhanced Schema Markup
      setStatus(prev => ({ ...prev, schemaMarkup: 'loading' }));
      const schemaInit = await initializeEnhancedSchemaMarkup();
      await schemaInit();
      setStatus(prev => ({ ...prev, schemaMarkup: 'loaded' }));
      console.log('✅ Phase 5: Enhanced schema markup initialized');

      setInitializationComplete(true);
      console.log('🎉 Phase 5: Technical SEO Optimization Complete!');
      
      // Send completion analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'phase5_technical_seo_complete', {
          event_category: 'technical_seo',
          event_label: 'phase5_initialization',
          value: 1
        });
      }

    } catch (error) {
      console.error('❌ Phase 5: Technical SEO initialization failed:', error);
      
      // Mark failed components
      setStatus(prev => ({
        webVitals: prev.webVitals === 'loading' ? 'error' : prev.webVitals,
        mobileOptimization: prev.mobileOptimization === 'loading' ? 'error' : prev.mobileOptimization,
        pageSpeed: prev.pageSpeed === 'loading' ? 'error' : prev.pageSpeed,
        schemaMarkup: prev.schemaMarkup === 'loading' ? 'error' : prev.schemaMarkup,
      }));
    }
  };

  // Development mode indicator
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Only show status in development mode
  if (isDevelopment && !initializationComplete) {
    return (
      <div 
        className="fixed top-4 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-mono max-w-sm"
        style={{ fontSize: '12px' }}
      >
        <div className="font-bold mb-2">🚀 Phase 5: Technical SEO</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <StatusIcon status={status.webVitals} />
            <span>Core Web Vitals</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon status={status.mobileOptimization} />
            <span>Mobile Optimization</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon status={status.pageSpeed} />
            <span>Page Speed</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon status={status.schemaMarkup} />
            <span>Schema Markup</span>
          </div>
        </div>
      </div>
    );
  }

  // Show completion badge briefly in development
  if (isDevelopment && initializationComplete) {
    return (
      <div className="fixed top-4 left-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-mono">
        ✅ Phase 5: Technical SEO Complete
      </div>
    );
  }

  return null;
}

// Status icon component
function StatusIcon({ status }: { status: Phase5Status[keyof Phase5Status] }) {
  switch (status) {
    case 'pending':
      return <span className="text-gray-400">⏳</span>;
    case 'loading':
      return <span className="text-yellow-400 animate-spin">⚡</span>;
    case 'loaded':
      return <span className="text-green-400">✅</span>;
    case 'error':
      return <span className="text-red-400">❌</span>;
    default:
      return <span className="text-gray-400">❓</span>;
  }
}

// Export types for other components
export type { Phase5Status }; 