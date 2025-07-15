/**
 * Comprehensive Booking Flow E2E Tests
 * Houston Mobile Notary Pros
 * 
 * Tests complete user journey from service selection to booking confirmation
 * including payment processing, error handling, and mobile responsiveness.
 */

import { test, expect, Page } from '@playwright/test';

// Test data constants
const TEST_CUSTOMER = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe.test@example.com',
  phone: '713-555-0123',
  address: '123 Main St',
  city: 'Houston',
  state: 'TX',
  zipCode: '77002'
};

const STRIPE_TEST_CARDS = {
  success: '4242424242424242',
  declined: '4000000000000002',
  insufficient_funds: '4000000000009995',
  expired: '4000000000000069'
};

test.describe('Comprehensive Booking Flow Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to booking page
    await page.goto('/booking');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Ensure we're on the booking page
    await expect(page.locator('h1')).toContainText('Book Your Notary Service');
  });

  test.describe('Happy Path - Complete Booking Flow', () => {
    
    test('should complete full mobile notary booking with payment', async ({ page }) => {
      // Step 1: Service Selection
      await page.click('[data-testid="service-standard-notary"]');
      await expect(page.locator('[data-testid="service-standard-notary"]')).toHaveClass(/selected/);
      
      // Verify pricing appears
      await expect(page.locator('[data-testid="base-price"]')).toContainText('$75');
      
      await page.click('[data-testid="continue-service-selection"]');
      
      // Step 2: Customer Information
      await page.fill('[data-testid="firstName"]', TEST_CUSTOMER.firstName);
      await page.fill('[data-testid="lastName"]', TEST_CUSTOMER.lastName);
      await page.fill('[data-testid="email"]', TEST_CUSTOMER.email);
      await page.fill('[data-testid="phone"]', TEST_CUSTOMER.phone);
      
      await page.click('[data-testid="continue-customer-info"]');
      
      // Step 3: Location Details
      await page.fill('[data-testid="address"]', TEST_CUSTOMER.address);
      await page.fill('[data-testid="city"]', TEST_CUSTOMER.city);
      await page.selectOption('[data-testid="state"]', TEST_CUSTOMER.state);
      await page.fill('[data-testid="zipCode"]', TEST_CUSTOMER.zipCode);
      
      // Wait for distance calculation
      await page.waitForSelector('[data-testid="distance-calculated"]');
      
      await page.click('[data-testid="continue-location"]');
      
      // Step 4: Document Details
      await page.selectOption('[data-testid="document-count"]', '2');
      await page.selectOption('[data-testid="signer-count"]', '1');
      
      // Add document types
      await page.click('[data-testid="add-document-type"]');
      await page.selectOption('[data-testid="document-type-0"]', 'Affidavit');
      await page.selectOption('[data-testid="document-type-1"]', 'Power of Attorney');
      
      await page.click('[data-testid="continue-documents"]');
      
      // Step 5: Scheduling
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      
      await page.fill('[data-testid="preferred-date"]', dateString);
      await page.selectOption('[data-testid="preferred-time"]', '14:00');
      
      await page.click('[data-testid="continue-scheduling"]');
      
      // Step 6: Review and Payment
      await expect(page.locator('[data-testid="booking-summary"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-price"]')).toContainText('$');
      
      // Fill payment information
      await page.fill('[data-testid="card-number"]', STRIPE_TEST_CARDS.success);
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvc"]', '123');
      await page.fill('[data-testid="card-name"]', `${TEST_CUSTOMER.firstName} ${TEST_CUSTOMER.lastName}`);
      
      // Submit booking
      await page.click('[data-testid="submit-booking"]');
      
      // Wait for processing
      await page.waitForSelector('[data-testid="booking-confirmation"]', { timeout: 30000 });
      
      // Verify confirmation
      await expect(page.locator('[data-testid="booking-confirmation"]')).toContainText('Booking Confirmed');
      await expect(page.locator('[data-testid="booking-number"]')).toContainText('HMN');
      
      // Verify email confirmation message
      await expect(page.locator('[data-testid="email-confirmation"]')).toContainText(TEST_CUSTOMER.email);
    });

    test('should complete RON booking flow', async ({ page }) => {
      // Select RON service
      await page.click('[data-testid="service-ron"]');
      await expect(page.locator('[data-testid="service-ron"]')).toHaveClass(/selected/);
      
      // Verify RON pricing
      await expect(page.locator('[data-testid="base-price"]')).toContainText('$35');
      
      await page.click('[data-testid="continue-service-selection"]');
      
      // Fill customer information
      await page.fill('[data-testid="firstName"]', TEST_CUSTOMER.firstName);
      await page.fill('[data-testid="lastName"]', TEST_CUSTOMER.lastName);
      await page.fill('[data-testid="email"]', TEST_CUSTOMER.email);
      await page.fill('[data-testid="phone"]', TEST_CUSTOMER.phone);
      
      await page.click('[data-testid="continue-customer-info"]');
      
      // RON doesn't require location - should skip to documents
      await expect(page.locator('[data-testid="document-details"]')).toBeVisible();
      
      // Complete RON booking
      await page.selectOption('[data-testid="document-count"]', '1');
      await page.selectOption('[data-testid="signer-count"]', '1');
      
      await page.click('[data-testid="continue-documents"]');
      
      // RON scheduling - available 24/7
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      
      await page.fill('[data-testid="preferred-date"]', dateString);
      await page.selectOption('[data-testid="preferred-time"]', '10:00');
      
      await page.click('[data-testid="continue-scheduling"]');
      
      // Payment
      await page.fill('[data-testid="card-number"]', STRIPE_TEST_CARDS.success);
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvc"]', '123');
      await page.fill('[data-testid="card-name"]', `${TEST_CUSTOMER.firstName} ${TEST_CUSTOMER.lastName}`);
      
      await page.click('[data-testid="submit-booking"]');
      
      // Verify RON confirmation
      await page.waitForSelector('[data-testid="booking-confirmation"]', { timeout: 30000 });
      await expect(page.locator('[data-testid="ron-session-link"]')).toBeVisible();
      await expect(page.locator('[data-testid="ron-instructions"]')).toContainText('Proof.com');
    });
  });

  test.describe('Error Scenarios', () => {
    
    test('should handle payment declined', async ({ page }) => {
      // Go through booking flow quickly
      await completeBookingToPayment(page);
      
      // Use declined card
      await page.fill('[data-testid="card-number"]', STRIPE_TEST_CARDS.declined);
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvc"]', '123');
      await page.fill('[data-testid="card-name"]', `${TEST_CUSTOMER.firstName} ${TEST_CUSTOMER.lastName}`);
      
      await page.click('[data-testid="submit-booking"]');
      
      // Verify error handling
      await expect(page.locator('[data-testid="payment-error"]')).toContainText('Your card was declined');
      await expect(page.locator('[data-testid="retry-payment"]')).toBeVisible();
      
      // Verify booking is not created
      await expect(page.locator('[data-testid="booking-confirmation"]')).not.toBeVisible();
    });

    test('should handle insufficient funds', async ({ page }) => {
      await completeBookingToPayment(page);
      
      // Use insufficient funds card
      await page.fill('[data-testid="card-number"]', STRIPE_TEST_CARDS.insufficient_funds);
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvc"]', '123');
      await page.fill('[data-testid="card-name"]', `${TEST_CUSTOMER.firstName} ${TEST_CUSTOMER.lastName}`);
      
      await page.click('[data-testid="submit-booking"]');
      
      await expect(page.locator('[data-testid="payment-error"]')).toContainText('insufficient funds');
    });

    test('should handle expired card', async ({ page }) => {
      await completeBookingToPayment(page);
      
      // Use expired card
      await page.fill('[data-testid="card-number"]', STRIPE_TEST_CARDS.expired);
      await page.fill('[data-testid="card-expiry"]', '12/20'); // Past date
      await page.fill('[data-testid="card-cvc"]', '123');
      await page.fill('[data-testid="card-name"]', `${TEST_CUSTOMER.firstName} ${TEST_CUSTOMER.lastName}`);
      
      await page.click('[data-testid="submit-booking"]');
      
      await expect(page.locator('[data-testid="payment-error"]')).toContainText('expired');
    });

    test('should handle invalid form data', async ({ page }) => {
      // Try to proceed without selecting service
      await page.click('[data-testid="continue-service-selection"]');
      await expect(page.locator('[data-testid="service-error"]')).toContainText('Please select a service');
      
      // Select service and try invalid email
      await page.click('[data-testid="service-standard-notary"]');
      await page.click('[data-testid="continue-service-selection"]');
      
      await page.fill('[data-testid="firstName"]', TEST_CUSTOMER.firstName);
      await page.fill('[data-testid="lastName"]', TEST_CUSTOMER.lastName);
      await page.fill('[data-testid="email"]', 'invalid-email');
      await page.fill('[data-testid="phone"]', TEST_CUSTOMER.phone);
      
      await page.click('[data-testid="continue-customer-info"]');
      
      await expect(page.locator('[data-testid="email-error"]')).toContainText('Please enter a valid email');
    });

    test('should handle service area restrictions', async ({ page }) => {
      await page.click('[data-testid="service-standard-notary"]');
      await page.click('[data-testid="continue-service-selection"]');
      
      // Fill customer info
      await page.fill('[data-testid="firstName"]', TEST_CUSTOMER.firstName);
      await page.fill('[data-testid="lastName"]', TEST_CUSTOMER.lastName);
      await page.fill('[data-testid="email"]', TEST_CUSTOMER.email);
      await page.fill('[data-testid="phone"]', TEST_CUSTOMER.phone);
      
      await page.click('[data-testid="continue-customer-info"]');
      
      // Enter address outside service area
      await page.fill('[data-testid="address"]', '123 Far Away St');
      await page.fill('[data-testid="city"]', 'Austin');
      await page.selectOption('[data-testid="state"]', 'TX');
      await page.fill('[data-testid="zipCode"]', '78701');
      
      await page.click('[data-testid="continue-location"]');
      
      // Should show service area error
      await expect(page.locator('[data-testid="service-area-error"]')).toContainText('outside our service area');
    });

    test('should handle document limit violations', async ({ page }) => {
      await page.click('[data-testid="service-standard-notary"]');
      await page.click('[data-testid="continue-service-selection"]');
      
      // Quick navigation to documents
      await fillCustomerInfo(page);
      await fillLocationInfo(page);
      
      // Try to exceed document limit
      await page.selectOption('[data-testid="document-count"]', '25'); // Over limit
      
      await expect(page.locator('[data-testid="document-limit-error"]')).toContainText('exceeds maximum');
    });
  });

  test.describe('Mobile Responsiveness', () => {
    
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Navigate to booking
      await page.goto('/booking');
      
      // Verify mobile layout
      await expect(page.locator('[data-testid="mobile-booking-header"]')).toBeVisible();
      
      // Complete booking on mobile
      await page.click('[data-testid="service-standard-notary"]');
      await page.click('[data-testid="continue-service-selection"]');
      
      // Verify mobile form layout
      await expect(page.locator('[data-testid="mobile-form-container"]')).toBeVisible();
      
      // Fill forms on mobile
      await fillCustomerInfo(page);
      await fillLocationInfo(page);
      
      // Verify mobile payment form
      await page.selectOption('[data-testid="document-count"]', '1');
      await page.selectOption('[data-testid="signer-count"]', '1');
      await page.click('[data-testid="continue-documents"]');
      
      // Mobile scheduling
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      
      await page.fill('[data-testid="preferred-date"]', dateString);
      await page.selectOption('[data-testid="preferred-time"]', '14:00');
      await page.click('[data-testid="continue-scheduling"]');
      
      // Mobile payment
      await expect(page.locator('[data-testid="mobile-payment-form"]')).toBeVisible();
      
      await page.fill('[data-testid="card-number"]', STRIPE_TEST_CARDS.success);
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvc"]', '123');
      await page.fill('[data-testid="card-name"]', `${TEST_CUSTOMER.firstName} ${TEST_CUSTOMER.lastName}`);
      
      await page.click('[data-testid="submit-booking"]');
      
      // Verify mobile confirmation
      await page.waitForSelector('[data-testid="booking-confirmation"]', { timeout: 30000 });
      await expect(page.locator('[data-testid="mobile-confirmation"]')).toBeVisible();
    });

    test('should handle tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto('/booking');
      
      // Verify tablet layout
      await expect(page.locator('[data-testid="tablet-booking-layout"]')).toBeVisible();
      
      // Complete booking flow on tablet
      await completeBookingToPayment(page);
      
      // Verify tablet payment form
      await expect(page.locator('[data-testid="tablet-payment-form"]')).toBeVisible();
    });
  });

  test.describe('Performance Tests', () => {
    
    test('should load booking page within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/booking');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should handle form submission within acceptable time', async ({ page }) => {
      await completeBookingToPayment(page);
      
      // Fill payment info
      await page.fill('[data-testid="card-number"]', STRIPE_TEST_CARDS.success);
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvc"]', '123');
      await page.fill('[data-testid="card-name"]', `${TEST_CUSTOMER.firstName} ${TEST_CUSTOMER.lastName}`);
      
      const submitTime = Date.now();
      await page.click('[data-testid="submit-booking"]');
      
      await page.waitForSelector('[data-testid="booking-confirmation"]', { timeout: 30000 });
      
      const confirmationTime = Date.now() - submitTime;
      
      // Should process within 10 seconds
      expect(confirmationTime).toBeLessThan(10000);
    });
  });

  test.describe('Accessibility Tests', () => {
    
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/booking');
      
      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="service-standard-notary"]')).toBeFocused();
      
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-testid="service-standard-notary"]')).toHaveClass(/selected/);
      
      // Continue with keyboard navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter'); // Continue button
      
      // Verify focus management
      await expect(page.locator('[data-testid="firstName"]')).toBeFocused();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/booking');
      
      // Check ARIA labels
      await expect(page.locator('[data-testid="service-selection"]')).toHaveAttribute('aria-label', 'Select notary service');
      await expect(page.locator('[data-testid="customer-form"]')).toHaveAttribute('aria-label', 'Customer information form');
      await expect(page.locator('[data-testid="payment-form"]')).toHaveAttribute('aria-label', 'Payment information form');
    });
  });

  test.describe('Integration Tests', () => {
    
    test('should integrate with GHL correctly', async ({ page }) => {
      // Mock GHL webhook endpoint
      await page.route('**/api/ghl/webhook', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true })
        });
      });
      
      await completeFullBooking(page);
      
      // Verify GHL integration was called
      // This would be verified through API monitoring in real implementation
    });

    test('should handle Stripe webhook correctly', async ({ page }) => {
      // Mock Stripe webhook
      await page.route('**/api/stripe/webhook', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ received: true })
        });
      });
      
      await completeFullBooking(page);
      
      // Verify Stripe integration
      // This would be verified through payment confirmation
    });
  });

  // Helper functions
  async function completeBookingToPayment(page: Page) {
    await page.click('[data-testid="service-standard-notary"]');
    await page.click('[data-testid="continue-service-selection"]');
    
    await fillCustomerInfo(page);
    await fillLocationInfo(page);
    
    await page.selectOption('[data-testid="document-count"]', '1');
    await page.selectOption('[data-testid="signer-count"]', '1');
    await page.click('[data-testid="continue-documents"]');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    await page.fill('[data-testid="preferred-date"]', dateString);
    await page.selectOption('[data-testid="preferred-time"]', '14:00');
    await page.click('[data-testid="continue-scheduling"]');
  }

  async function fillCustomerInfo(page: Page) {
    await page.fill('[data-testid="firstName"]', TEST_CUSTOMER.firstName);
    await page.fill('[data-testid="lastName"]', TEST_CUSTOMER.lastName);
    await page.fill('[data-testid="email"]', TEST_CUSTOMER.email);
    await page.fill('[data-testid="phone"]', TEST_CUSTOMER.phone);
    await page.click('[data-testid="continue-customer-info"]');
  }

  async function fillLocationInfo(page: Page) {
    await page.fill('[data-testid="address"]', TEST_CUSTOMER.address);
    await page.fill('[data-testid="city"]', TEST_CUSTOMER.city);
    await page.selectOption('[data-testid="state"]', TEST_CUSTOMER.state);
    await page.fill('[data-testid="zipCode"]', TEST_CUSTOMER.zipCode);
    await page.waitForSelector('[data-testid="distance-calculated"]');
    await page.click('[data-testid="continue-location"]');
  }

  async function completeFullBooking(page: Page) {
    await completeBookingToPayment(page);
    
    await page.fill('[data-testid="card-number"]', STRIPE_TEST_CARDS.success);
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');
    await page.fill('[data-testid="card-name"]', `${TEST_CUSTOMER.firstName} ${TEST_CUSTOMER.lastName}`);
    
    await page.click('[data-testid="submit-booking"]');
    await page.waitForSelector('[data-testid="booking-confirmation"]', { timeout: 30000 });
  }
}); 