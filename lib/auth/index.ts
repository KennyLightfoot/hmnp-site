/**
 * Main Auth Export - Unified Authentication System
 * 
 * This is the primary auth export that consolidates all authentication
 * functionality into a single, unified system.
 */

// Export everything from the unified auth system
export * from './unified-auth';

// Import the unified auth configuration as default
import { authOptions } from './unified-auth';

// Re-export for backward compatibility
export { authOptions }; 