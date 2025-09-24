'use client';

/**
 * 🎯 Client Component Wrapper for ProactiveEngagementEngine
 * Houston Mobile Notary Pros
 * 
 * This wrapper component handles the function callbacks that can't be passed
 * from Server Components to Client Components in Next.js App Router.
 */

import React from 'react';
import ProactiveEngagementEngine from './ProactiveEngagementEngine';

export default function ProactiveEngagementWrapper() {
  
  const handleEngagement = (trigger: any, behavior: any) => {
    console.log('🎯 Proactive Engagement:', { trigger: trigger.name, behavior });
    // This would open the AI chat widget with the trigger message
    // You can add custom logic here for triggering the AI chat
  };

  const handleAnalytics = (event: string, data: any) => {
    console.log('📊 Engagement Analytics:', { event, data });
    // This would send to your analytics service
    // You can add custom analytics tracking here
  };

  return (
    <ProactiveEngagementEngine
      onEngagement={handleEngagement}
      onAnalytics={handleAnalytics}
    />
  );
} 