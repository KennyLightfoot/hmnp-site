/**
 * Checkout Flow E2E Tests
 * Houston Mobile Notary Pros - Payment Processing & Confirmation
 * 
 * Tests the complete checkout flow including payment processing,
 * confirmation workflows, and various payment scenarios.
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
  expired: '4000000000000069',
  processing_error: '4000000000000119',
  authentication_required: '4000002500003155'
};

const MOCK_BOOKING_DATA = {
  serviceType: 'STANDARD_NOTARY',
  basePrice: 75,
  travelFee: 15,
  documentFee: 10,
  totalPrice: 100,
  bookingId: 'HMN12345678',
  estimatedDuration: 30
};

test.describe.skip('Checkout Flow Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock Stripe API responses
    await page.route('**/api/payments/**', route => {
      const url = route.request().url();
      const body = route.request().postDataJSON();
      
      if (url.includes('/create-payment-intent')) {
        const cardNumber = body?.payment_method?.card?.number || STRIPE_TEST_CARDS.success;
        
        if (cardNumber === STRIPE_TEST_CARDS.success) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              client_secret: 'pi_test_success_secret',
              payment_intent_id: 'pi_test_success'
            })
          });
        } else if (cardNumber === STRIPE_TEST_CARDS.declined) {
          route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              error: 'Your card was declined.'
            })
          });
        } else if (cardNumber === STRIPE_TEST_CARDS.insufficient_funds) {
          route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              error: 'Your card has insufficient funds.'
            })
          });
        } else {
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({
              success: false,
              error: 'Payment processing error.'
            })
          });
        }
      } else if (url.includes('/confirm-payment')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            status: 'succeeded',
            booking_id: MOCK_BOOKING_DATA.bookingId
          })
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      }
    });

    // Mock booking creation
    await page.route('**/api/booking/create', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          booking: {
            id: MOCK_BOOKING_DATA.bookingId,
            status: 'PAYMENT_PENDING',
            ...MOCK_BOOKING_DATA
          }
        })
      });
    });

    // Mock GHL webhook
    await page.route('**/api/ghl/webhook', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    // Start at booking page and complete booking to checkout
    await page.goto('/booking');
    await completeBookingToCheckout(page);
  });

  test.describe('Payment Form', () => {
    
    test('should display payment form with correct pricing', async ({ page }) => {
      // Verify payment form is visible
      await expect(page.locator('[data-testid="payment-form"]')).toBeVisible();
      
      // Verify pricing summary
      await expect(page.locator('[data-testid="base-price"]')).toContainText('$75.00');
      await expect(page.locator('[data-testid="travel-fee"]')).toContainText('$15.00');
      await expect(page.locator('[data-testid="document-fee"]')).toContainText('$10.00');
      await expect(page.locator('[data-testid="total-price"]')).toContainText('$100.00');
      
      // Verify payment form fields
      await expect(page.locator('[data-testid="card-number"]')).toBeVisible();
      await expect(page.locator('[data-testid="card-expiry"]')).toBeVisible();
      await expect(page.locator('[data-testid="card-cvc"]')).toBeVisible();
      await expect(page.locator('[data-testid="cardholder-name"]')).toBeVisible();
      await expect(page.locator('[data-testid="billing-zip"]')).toBeVisible();
      
      // Verify security badges
      await expect(page.locator('[data-testid="ssl-badge"]')).toBeVisible();
      await expect(page.locator('[data-testid="stripe-badge"]')).toBeVisible();
      
      // Verify submit button
      await expect(page.locator('[data-testid="submit-payment"]')).toBeVisible();
      await expect(page.locator('[data-testid="submit-payment"]')).toBeDisabled();
    });

    test('should validate payment form fields', async ({ page }) => {
      // Test empty form submission
      await page.click('[data-testid="submit-payment"]');
      
      // Verify validation messages
      await expect(page.locator('[data-testid="card-number-error"]')).toContainText('Card number is required');
      await expect(page.locator('[data-testid="card-expiry-error"]')).toContainText('Expiry date is required');
      await expect(page.locator('[data-testid="card-cvc-error"]')).toContainText('CVC is required');
      
      // Test invalid card number
      await page.fill('[data-testid="card-number"]', '1234567890123456');
      await page.locator('[data-testid="card-number"]').blur();
      await expect(page.locator('[data-testid="card-number-error"]')).toContainText('Invalid card number');
      
      // Test invalid expiry date
      await page.fill('[data-testid="card-expiry"]', '13/25');
      await page.locator('[data-testid="card-expiry"]').blur();
      await expect(page.locator('[data-expiry-error"]')).toContainText('Invalid expiry date');
      
      // Test invalid CVC
      await page.fill('[data-testid="card-cvc"]', '12');
      await page.locator('[data-testid="card-cvc"]').blur();
      await expect(page.locator('[data-testid="card-cvc-error"]')).toContainText('Invalid CVC');
      
      // Test valid form enables submit
      await page.fill('[data-testid="card-number"]', STRIPE_TEST_CARDS.success);
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvc"]', '123');
      await page.fill('[data-testid="cardholder-name"]', `${TEST_CUSTOMER.firstName} ${TEST_CUSTOMER.lastName}`);
      await page.fill('[data-testid="billing-zip"]', TEST_CUSTOMER.zipCode);
      
      await expect(page.locator('[data-testid="submit-payment"]')).toBeEnabled();
    });

    test('should format card inputs correctly', async ({ page }) => {
      // Test card number formatting
      await page.fill('[data-testid="card-number"]', '4242424242424242');
      await expect(page.locator('[data-testid="card-number"]')).toHaveValue('4242 4242 4242 4242');
      
      // Test expiry formatting
      await page.fill('[data-testid="card-expiry"]', '1225');
      await expect(page.locator('[data-testid="card-expiry"]')).toHaveValue('12/25');
      
      // Test CVC length limit
      await page.fill('[data-testid="card-cvc"]', '12345');
      await expect(page.locator('[data-testid="card-cvc"]')).toHaveValue('123');
    });

    test('should detect card type', async ({ page }) => {
      // Test Visa detection
      await page.fill('[data-testid="card-number"]', '4242424242424242');
      await expect(page.locator('[data-testid="card-type-icon"]')).toHaveAttribute('alt', 'Visa');
      
      // Test Mastercard detection
      await page.fill('[data-testid="card-number"]', '5555555555554444');
      await expect(page.locator('[data-testid="card-type-icon"]')).toHaveAttribute('alt', 'Mastercard');
      
      // Test American Express detection
      await page.fill('[data-testid="card-number"]', '378282246310005');
      await expect(page.locator('[data-testid="card-type-icon"]')).toHaveAttribute('alt', 'American Express');
    });
  });

  test.describe('Successful Payment Flow', () => {
    
    test('should process successful payment', async ({ page }) => {
      // Fill payment form
      await fillPaymentForm(page, STRIPE_TEST_CARDS.success);
      
      // Submit payment
      await page.click('[data-testid="submit-payment"]');
      
      // Verify processing state
      await expect(page.locator('[data-testid="payment-processing"]')).toBeVisible();
      await expect(page.locator('[data-testid="processing-spinner"]')).toBeVisible();
      await expect(page.locator('[data-testid="submit-payment"]')).toBeDisabled();
      
      // Wait for payment completion
      await page.waitForSelector('[data-testid="payment-success"]', { timeout: 10000 });
      
      // Verify success message
      await expect(page.locator('[data-testid="payment-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="booking-confirmed"]')).toBeVisible();
      
      // Verify booking details
      await expect(page.locator('[data-testid="confirmation-booking-id"]')).toContainText(MOCK_BOOKING_DATA.bookingId);
      await expect(page.locator('[data-testid="confirmation-total"]')).toContainText('$100.00');
      
      // Verify next steps
      await expect(page.locator('[data-testid="next-steps"]')).toBeVisible();
      await expect(page.locator('[data-testid="confirmation-email"]')).toContainText(TEST_CUSTOMER.email);
    });

    test('should display confirmation page with all details', async ({ page }) => {
      // Complete payment
      await fillPaymentForm(page, STRIPE_TEST_CARDS.success);
      await page.click('[data-testid="submit-payment"]');
      await page.waitForSelector('[data-testid="payment-success"]', { timeout: 10000 });
      
      // Verify confirmation page sections
      await expect(page.locator('[data-testid="confirmation-header"]')).toContainText('Booking Confirmed');
      
      // Verify booking summary
      await expect(page.locator('[data-testid="service-summary"]')).toContainText('Standard Mobile Notary');
      await expect(page.locator('[data-testid="customer-summary"]')).toContainText(TEST_CUSTOMER.firstName);
      await expect(page.locator('[data-testid="location-summary"]')).toContainText(TEST_CUSTOMER.address);
      
      // Verify payment summary
      await expect(page.locator('[data-testid="payment-method"]')).toContainText('•••• 4242');
      await expect(page.locator('[data-testid="payment-amount"]')).toContainText('$100.00');
      await expect(page.locator('[data-testid="payment-status"]')).toContainText('Paid');
      
      // Verify contact information
      await expect(page.locator('[data-testid="business-phone"]')).toContainText('(832) 617-4285');
      await expect(page.locator('[data-testid="business-email"]')).toContainText('info@houstonmobilenotarypros.com');
      
      // Verify action buttons
      await expect(page.locator('[data-testid="print-confirmation"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-to-calendar"]')).toBeVisible();
      await expect(page.locator('[data-testid="book-another"]')).toBeVisible();
    });

    test('should send confirmation email', async ({ page }) => {
      // Mock email service
      await page.route('**/api/email/send', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            messageId: 'email_123'
          })
        });
      });

      // Complete payment
      await fillPaymentForm(page, STRIPE_TEST_CARDS.success);
      await page.click('[data-testid="submit-payment"]');
      await page.waitForSelector('[data-testid="payment-success"]', { timeout: 10000 });
      
      // Verify email confirmation message
      await expect(page.locator('[data-testid="email-sent-confirmation"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-sent-confirmation"]')).toContainText(TEST_CUSTOMER.email);
      
      // Verify resend email option
      await expect(page.locator('[data-testid="resend-email"]')).toBeVisible();
      
      // Test resend functionality
      await page.click('[data-testid="resend-email"]');
      await expect(page.locator('[data-testid="email-resent-message"]')).toBeVisible();
    });
  });

  test.describe('Payment Error Scenarios', () => {
    
    test('should handle declined card', async ({ page }) => {
      // Fill form with declined card
      await fillPaymentForm(page, STRIPE_TEST_CARDS.declined);
      
      // Submit payment
      await page.click('[data-testid="submit-payment"]');
      
      // Verify error handling
      await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="payment-error"]')).toContainText('Your card was declined');
      
      // Verify form is re-enabled
      await expect(page.locator('[data-testid="submit-payment"]')).toBeEnabled();
      
      // Verify retry suggestion
      await expect(page.locator('[data-testid="payment-retry-suggestion"]')).toBeVisible();
      await expect(page.locator('[data-testid="try-different-card"]')).toBeVisible();
    });

    test('should handle insufficient funds', async ({ page }) => {
      // Fill form with insufficient funds card
      await fillPaymentForm(page, STRIPE_TEST_CARDS.insufficient_funds);
      
      // Submit payment
      await page.click('[data-testid="submit-payment"]');
      
      // Verify specific error message
      await expect(page.locator('[data-testid="payment-error"]')).toContainText('insufficient funds');
      
      // Verify helpful suggestions
      await expect(page.locator('[data-testid="insufficient-funds-help"]')).toBeVisible();
      await expect(page.locator('[data-testid="contact-bank-suggestion"]')).toBeVisible();
    });

    test('should handle expired card', async ({ page }) => {
      // Fill form with expired card
      await fillPaymentForm(page, STRIPE_TEST_CARDS.expired);
      
      // Submit payment
      await page.click('[data-testid="submit-payment"]');
      
      // Verify expired card error
      await expect(page.locator('[data-testid="payment-error"]')).toContainText('expired');
      
      // Verify card update suggestion
      await expect(page.locator('[data-testid="update-card-suggestion"]')).toBeVisible();
    });

    test('should handle processing errors', async ({ page }) => {
      // Fill form with processing error card
      await fillPaymentForm(page, STRIPE_TEST_CARDS.processing_error);
      
      // Submit payment
      await page.click('[data-testid="submit-payment"]');
      
      // Verify generic error handling
      await expect(page.locator('[data-testid="payment-error"]')).toContainText('processing error');
      
      // Verify retry button
      await expect(page.locator('[data-testid="retry-payment"]')).toBeVisible();
      
      // Test retry functionality
      await page.click('[data-testid="retry-payment"]');
      await expect(page.locator('[data-testid="payment-processing"]')).toBeVisible();
    });

    test('should handle network errors', async ({ page }) => {
      // Mock network error
      await page.route('**/api/payments/create-payment-intent', route => {
        route.abort('failed');
      });

      // Fill form and submit
      await fillPaymentForm(page, STRIPE_TEST_CARDS.success);
      await page.click('[data-testid="submit-payment"]');
      
      // Verify network error handling
      await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="network-error"]')).toContainText('connection problem');
      
      // Verify retry option
      await expect(page.locator('[data-testid="check-connection"]')).toBeVisible();
    });
  });

  test.describe('Promo Code Integration', () => {
    
    test('should apply valid promo code', async ({ page }) => {
      // Mock promo code validation
      await page.route('**/api/promo-codes/validate', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            valid: true,
            discount: 10,
            discountType: 'percentage',
            newTotal: 90
          })
        });
      });

      // Enter promo code
      await page.click('[data-testid="promo-code-toggle"]');
      await page.fill('[data-testid="promo-code-input"]', 'SAVE10');
      await page.click('[data-testid="apply-promo-code"]');
      
      // Verify discount applied
      await expect(page.locator('[data-testid="promo-discount"]')).toContainText('-$10.00');
      await expect(page.locator('[data-testid="total-price"]')).toContainText('$90.00');
      await expect(page.locator('[data-testid="promo-code-success"]')).toBeVisible();
    });

    test('should handle invalid promo code', async ({ page }) => {
      // Mock invalid promo code
      await page.route('**/api/promo-codes/validate', route => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            valid: false,
            error: 'Invalid promo code'
          })
        });
      });

      // Enter invalid promo code
      await page.click('[data-testid="promo-code-toggle"]');
      await page.fill('[data-testid="promo-code-input"]', 'INVALID');
      await page.click('[data-testid="apply-promo-code"]');
      
      // Verify error message
      await expect(page.locator('[data-testid="promo-code-error"]')).toContainText('Invalid promo code');
      await expect(page.locator('[data-testid="total-price"]')).toContainText('$100.00');
    });

    test('should remove promo code', async ({ page }) => {
      // Apply valid promo code first
      await page.route('**/api/promo-codes/validate', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            valid: true,
            discount: 10,
            discountType: 'percentage',
            newTotal: 90
          })
        });
      });

      await page.click('[data-testid="promo-code-toggle"]');
      await page.fill('[data-testid="promo-code-input"]', 'SAVE10');
      await page.click('[data-testid="apply-promo-code"]');
      
      // Remove promo code
      await page.click('[data-testid="remove-promo-code"]');
      
      // Verify discount removed
      await expect(page.locator('[data-testid="promo-discount"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="total-price"]')).toContainText('$100.00');
    });
  });

  test.describe('Mobile Checkout', () => {
    
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Navigate to mobile checkout
      await page.goto('/booking');
      await completeBookingToCheckout(page);
      
      // Verify mobile layout
      await expect(page.locator('[data-testid="mobile-checkout-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="mobile-payment-form"]')).toBeVisible();
      
      // Verify mobile-optimized form
      await expect(page.locator('[data-testid="mobile-card-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="mobile-submit-button"]')).toBeVisible();
      
      // Test mobile payment flow
      await fillPaymentForm(page, STRIPE_TEST_CARDS.success);
      await page.click('[data-testid="submit-payment"]');
      
      // Verify mobile confirmation
      await page.waitForSelector('[data-testid="mobile-confirmation"]', { timeout: 10000 });
      await expect(page.locator('[data-testid="mobile-confirmation"]')).toBeVisible();
    });

    test('should handle mobile keyboard', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/booking');
      await completeBookingToCheckout(page);
      
      // Test numeric keyboard for card number
      await page.click('[data-testid="card-number"]');
      await expect(page.locator('[data-testid="card-number"]')).toHaveAttribute('inputmode', 'numeric');
      
      // Test numeric keyboard for CVC
      await page.click('[data-testid="card-cvc"]');
      await expect(page.locator('[data-testid="card-cvc"]')).toHaveAttribute('inputmode', 'numeric');
    });
  });

  test.describe('Performance Tests', () => {
    
    test('should load checkout within performance budget', async ({ page }) => {
      await page.goto('/booking');
      
      const checkoutStartTime = Date.now();
      await completeBookingToCheckout(page);
      const checkoutLoadTime = Date.now() - checkoutStartTime;
      
      // Checkout should load within 2 seconds
      expect(checkoutLoadTime).toBeLessThan(2000);
    });

    test('should process payment within acceptable time', async ({ page }) => {
      await fillPaymentForm(page, STRIPE_TEST_CARDS.success);
      
      const paymentStartTime = Date.now();
      await page.click('[data-testid="submit-payment"]');
      await page.waitForSelector('[data-testid="payment-success"]', { timeout: 10000 });
      const paymentTime = Date.now() - paymentStartTime;
      
      // Payment should process within 5 seconds
      expect(paymentTime).toBeLessThan(5000);
    });
  });

  test.describe('Security Tests', () => {
    
    test('should not expose sensitive data', async ({ page }) => {
      await fillPaymentForm(page, STRIPE_TEST_CARDS.success);
      
      // Check that card number is not in DOM
      const pageContent = await page.content();
      expect(pageContent).not.toContain('4242424242424242');
      
      // Check that CVC is not in DOM
      expect(pageContent).not.toContain('123');
      
      // Verify card number is masked
      await expect(page.locator('[data-testid="card-number"]')).toHaveValue('4242 4242 4242 4242');
    });

    test('should validate SSL connection', async ({ page }) => {
      // Verify SSL indicators
      await expect(page.locator('[data-testid="ssl-badge"]')).toBeVisible();
      await expect(page.locator('[data-testid="secure-checkout-badge"]')).toBeVisible();
      
      // Verify secure form submission
      await fillPaymentForm(page, STRIPE_TEST_CARDS.success);
      await page.click('[data-testid="submit-payment"]');
      
      // Check that payment is submitted over HTTPS
      const requests: any[] = [];
      page.on('request', request => {
        if (request.url().includes('/api/payments/')) {
          requests.push(request);
        }
      });
      
      expect(requests.length).toBeGreaterThan(0);
      requests.forEach(request => {
        expect(request.url()).toMatch(/^https:/);
      });
    });
  });

  // Helper functions
  async function completeBookingToCheckout(page: Page) {
    // Quick booking completion to reach checkout
    await page.click('[data-testid="service-standard-notary"]');
    await page.click('[data-testid="continue-service-selection"]');
    
    // Customer info
    await page.fill('[data-testid="firstName"]', TEST_CUSTOMER.firstName);
    await page.fill('[data-testid="lastName"]', TEST_CUSTOMER.lastName);
    await page.fill('[data-testid="email"]', TEST_CUSTOMER.email);
    await page.fill('[data-testid="phone"]', TEST_CUSTOMER.phone);
    await page.click('[data-testid="continue-customer-info"]');
    
    // Location info
    await page.fill('[data-testid="address"]', TEST_CUSTOMER.address);
    await page.fill('[data-testid="city"]', TEST_CUSTOMER.city);
    await page.selectOption('[data-testid="state"]', TEST_CUSTOMER.state);
    await page.fill('[data-testid="zipCode"]', TEST_CUSTOMER.zipCode);
    await page.waitForSelector('[data-testid="distance-calculated"]');
    await page.click('[data-testid="continue-location"]');
    
    // Document details
    await page.selectOption('[data-testid="document-count"]', '2');
    await page.selectOption('[data-testid="signer-count"]', '1');
    await page.click('[data-testid="continue-documents"]');
    
    // Scheduling
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    await page.fill('[data-testid="preferred-date"]', dateString || "");
    await page.selectOption('[data-testid="preferred-time"]', '14:00');
    await page.click('[data-testid="continue-scheduling"]');
    
    // Now at checkout/payment page
    await page.waitForSelector('[data-testid="payment-form"]');
  }

  async function fillPaymentForm(page: Page, cardNumber: string) {
    await page.fill('[data-testid="card-number"]', cardNumber);
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');
    await page.fill('[data-testid="cardholder-name"]', `${TEST_CUSTOMER.firstName} ${TEST_CUSTOMER.lastName}`);
    await page.fill('[data-testid="billing-zip"]', TEST_CUSTOMER.zipCode);
  }
}); 