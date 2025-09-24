/**
 * Notifications Directory Index
 * Re-exports from the main notifications.ts file and provides convenience instances
 */

// Re-export everything from the main notifications file
export * from '../notifications';

// Import the class to create instances
import { NotificationService } from '../notifications';

// Export singleton instance (lowercase) that the code expects
export const notificationService = NotificationService.getInstance();

// Also export the class directly for type compatibility
export { NotificationService } from '../notifications'; 