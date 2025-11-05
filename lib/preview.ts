/**
 * Preview Mode Utilities
 * 
 * When PREVIEW_UI_ONLY=true, the application runs in a mode that:
 * - Skips all external API calls (GHL, Stripe, Twilio, etc.)
 * - Returns mock data for UI development and testing
 * - Disables authentication checks
 * - Allows faster iteration on UI components
 */

/**
 * Check if the application is running in preview UI-only mode
 */
export const isPreviewUiOnly = process.env.PREVIEW_UI_ONLY === 'true';

/**
 * Guard function to skip execution when in preview mode
 * @param fn Function to execute only when NOT in preview mode
 * @param fallback Optional fallback value to return in preview mode
 */
export function skipInPreview<T>(fn: () => T, fallback?: T): T | undefined {
  if (isPreviewUiOnly) {
    return fallback;
  }
  return fn();
}

/**
 * Guard for async functions
 */
export async function skipInPreviewAsync<T>(
  fn: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  if (isPreviewUiOnly) {
    return fallback;
  }
  return fn();
}


