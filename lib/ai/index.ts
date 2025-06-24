/**
 * AI System Exports
 * Central export file for all AI-related functionality
 */

export { IntelligentAssistant } from './intelligent-assistant';
export type { 
  AIResponse, 
  CustomerInsight, 
  PredictiveAnalytics 
} from './intelligent-assistant';

// Create a singleton instance for easy use throughout the app
import { IntelligentAssistant } from './intelligent-assistant';

export const aiAssistant = new IntelligentAssistant();

// Convenience functions for common AI operations
export const handleCustomerMessage = async (
  message: string, 
  context?: any
) => {
  return await aiAssistant.handleCustomerInquiry(message, context || {});
};

export const generateCustomerInsight = async (customerId: string) => {
  return await aiAssistant.generateCustomerInsights(customerId);
};

export const optimizeBooking = async (bookingRequest: any) => {
  return await aiAssistant.optimizeBookingAssignment(bookingRequest);
}; 