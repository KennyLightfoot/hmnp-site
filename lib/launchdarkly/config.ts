/**
 * LaunchDarkly Configuration for HMNP Feature Flags
 */

import { 
  LDClient, 
  LDContext,
  LDFlagSet,
  initialize as initializeLDClient 
} from 'launchdarkly-js-client-sdk';

// Feature Flag Keys - Keep these in sync with LaunchDarkly dashboard
export const FEATURE_FLAGS = {
  MOBILE_RON_TOGGLE: 'mobile-ron-toggle',
  REAL_TIME_PRICING: 'real-time-pricing',
  DISTANCE_GEOFENCING: 'distance-geofencing',
  PROOF_RON_INTEGRATION: 'proof-ron-integration',
  ADVANCED_BOOKING_FLOW: 'advanced-booking-flow',
  PAYMENT_FLOW_V2: 'payment-flow-v2',
} as const;

export type FeatureFlagKey = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];

// Environment configuration
const isProduction = process.env.NODE_ENV === 'production';
const isClient = typeof window !== 'undefined';

// LaunchDarkly SDK keys from environment
const LD_CLIENT_SDK_KEY = process.env.NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_SDK_KEY;
const LD_SERVER_SDK_KEY = process.env.LAUNCHDARKLY_SERVER_SDK_KEY;

// Default flag values (fallback when LaunchDarkly is unavailable)
const DEFAULT_FLAGS: Record<FeatureFlagKey, boolean> = {
  [FEATURE_FLAGS.MOBILE_RON_TOGGLE]: false, // Start with mobile-only until RON is ready
  [FEATURE_FLAGS.REAL_TIME_PRICING]: true, // Safe to enable - improves UX
  [FEATURE_FLAGS.DISTANCE_GEOFENCING]: true, // Safe to enable - prevents bad bookings
  [FEATURE_FLAGS.PROOF_RON_INTEGRATION]: false, // Wait until Phase 2
  [FEATURE_FLAGS.ADVANCED_BOOKING_FLOW]: true, // Phase 1 feature
  [FEATURE_FLAGS.PAYMENT_FLOW_V2]: false, // Future enhancement
};

/**
 * CLIENT-SIDE UTILITIES
 * These functions are safe to use in React components
 */

/**
 * Client-side LaunchDarkly provider configuration
 */
export const getClientLDConfig = () => {
  if (!LD_CLIENT_SDK_KEY) {
    console.warn('LaunchDarkly client SDK key not configured');
    return null;
  }

  return {
    clientSideID: LD_CLIENT_SDK_KEY,
    options: {
      bootstrap: DEFAULT_FLAGS, // Prevent flash of default content
      offline: !isProduction,
    }
  };
};

/**
 * Create LaunchDarkly context from user data
 */
export function createLDContext(user?: {
  id?: string;
  email?: string;
  name?: string;
  userType?: 'customer' | 'admin' | 'notary';
}): LDContext {
  return {
    kind: 'user',
    key: user?.id || `anonymous-${Date.now()}`,
    name: user?.name,
    email: user?.email,
    custom: {
      userType: user?.userType || 'customer',
      timestamp: Date.now(),
      environment: process.env.NODE_ENV,
    }
  };
}

/**
 * Get feature flag value - CLIENT-SAFE VERSION
 * Returns default values when used client-side, actual values when used server-side
 */
export function getFeatureFlag(flagKey: FeatureFlagKey): boolean {
  // For client-side usage, always return the default value
  // The actual LaunchDarkly client will override this through the provider
  return DEFAULT_FLAGS[flagKey];
}

/**
 * CLIENT-SAFE feature flag helpers
 * These return default values and are safe to use in React components
 */
export function shouldShowMobileRonToggle(): boolean {
  return DEFAULT_FLAGS[FEATURE_FLAGS.MOBILE_RON_TOGGLE];
}

export function shouldEnableRealTimePricing(): boolean {
  return DEFAULT_FLAGS[FEATURE_FLAGS.REAL_TIME_PRICING];
}

export function shouldEnableDistanceGeofencing(): boolean {
  return DEFAULT_FLAGS[FEATURE_FLAGS.DISTANCE_GEOFENCING];
}

export function shouldEnableProofRON(): boolean {
  return DEFAULT_FLAGS[FEATURE_FLAGS.PROOF_RON_INTEGRATION];
}

export function shouldEnableAdvancedBookingFlow(): boolean {
  return DEFAULT_FLAGS[FEATURE_FLAGS.ADVANCED_BOOKING_FLOW];
}

/**
 * Feature flag utilities for React components
 */
export const useFeatureFlag = (flagKey: FeatureFlagKey, defaultValue?: boolean) => {
  // This will be implemented with the LaunchDarkly React provider
  // For now, return default values
  return defaultValue ?? DEFAULT_FLAGS[flagKey];
};

/**
 * Export default flags for reference
 */
export { DEFAULT_FLAGS };

// Server-side functions moved to ./server.ts to avoid client/server conflicts

// All server-side functions have been moved to ./server.ts

// Client-safe exports only
export default {
  FEATURE_FLAGS,
  createLDContext,
  getClientLDConfig,
  getFeatureFlag,
  shouldShowMobileRonToggle,
  shouldEnableRealTimePricing,
  shouldEnableDistanceGeofencing,
  shouldEnableProofRON,
  shouldEnableAdvancedBookingFlow,
}; 