/**
 * LaunchDarkly Server-Side Configuration
 * This file is ONLY for server-side usage (API routes, server components)
 */

import type { FeatureFlagKey, LDContext } from './config';
import { DEFAULT_FLAGS } from './config';

// Environment configuration
const isProduction = process.env.NODE_ENV === 'production';
const LD_SERVER_SDK_KEY = process.env.LAUNCHDARKLY_SERVER_SDK_KEY;

// Server-side LaunchDarkly client (singleton)
let serverClient: any = null;

/**
 * Initialize server-side LaunchDarkly client
 */
export async function initializeServerLD(): Promise<any> {
  if (typeof window !== 'undefined') {
    // Client-side - return null
    return null;
  }
  
  if (serverClient) return serverClient;
  
  if (!LD_SERVER_SDK_KEY) {
    console.warn('LaunchDarkly server SDK key not configured - using default flags');
    return null;
  }
  
  try {
    // Dynamic import to avoid webpack issues
    const { init: initializeLDServer } = await import('launchdarkly-node-server-sdk');
    
    serverClient = initializeLDServer(LD_SERVER_SDK_KEY, {
      offline: !isProduction, // Use offline mode in development
    });
    
    await serverClient.waitForInitialization();
    console.log('✅ LaunchDarkly server client initialized');
    return serverClient;
  } catch (error) {
    console.error('❌ Failed to initialize LaunchDarkly server client:', error);
    return null;
  }
}

/**
 * Get feature flag value server-side
 */
export async function getServerFlag(
  flagKey: FeatureFlagKey, 
  context: { userId?: string; email?: string; userType?: string } = {},
  defaultValue?: boolean
): Promise<boolean> {
  const client = await initializeServerLD();
  
  if (!client) {
    return defaultValue ?? DEFAULT_FLAGS[flagKey];
  }
  
  const ldContext: LDContext = {
    kind: 'user',
    key: context.userId || 'anonymous',
    email: context.email,
    custom: {
      userType: context.userType || 'customer',
      environment: process.env.NODE_ENV,
    }
  };
  
  try {
    return await client.variation(flagKey, ldContext, defaultValue ?? DEFAULT_FLAGS[flagKey]);
  } catch (error) {
    console.error(`Failed to get flag ${flagKey}:`, error);
    return defaultValue ?? DEFAULT_FLAGS[flagKey];
  }
}

/**
 * Batch check multiple flags (useful for performance)
 */
export async function getMultipleFlags(
  flagKeys: FeatureFlagKey[],
  context: { userId?: string; email?: string; userType?: string } = {}
): Promise<Record<FeatureFlagKey, boolean>> {
  const client = await initializeServerLD();
  const results: Record<string, boolean> = {};
  
  if (!client) {
    // Return default values when LaunchDarkly is unavailable
    flagKeys.forEach(key => {
      results[key] = DEFAULT_FLAGS[key];
    });
    return results as Record<FeatureFlagKey, boolean>;
  }
  
  const ldContext: LDContext = {
    kind: 'user',
    key: context.userId || 'anonymous',
    email: context.email,
    custom: {
      userType: context.userType || 'customer',
      environment: process.env.NODE_ENV,
    }
  };
  
  try {
    const allFlags = await client.allFlagsState(ldContext);
    flagKeys.forEach(key => {
      results[key] = allFlags.getFlagValue(key) ?? DEFAULT_FLAGS[key];
    });
  } catch (error) {
    console.error('Failed to get multiple flags:', error);
    flagKeys.forEach(key => {
      results[key] = DEFAULT_FLAGS[key];
    });
  }
  
  return results as Record<FeatureFlagKey, boolean>;
}

/**
 * Track LaunchDarkly events for metrics
 */
export async function trackLDEvent(
  eventName: string,
  context: { userId?: string; email?: string },
  data?: any
) {
  const client = await initializeServerLD();
  
  if (!client) {
    console.warn('LaunchDarkly server client not available for event tracking');
    return;
  }
  
  const ldContext: LDContext = {
    kind: 'user',
    key: context.userId || 'anonymous',
    email: context.email,
    custom: {
      timestamp: Date.now(),
      environment: process.env.NODE_ENV,
      ...data,
    }
  };
  
  try {
    await client.track(eventName, ldContext, data);
  } catch (error) {
    console.error('Failed to track LaunchDarkly event:', error);
  }
} 