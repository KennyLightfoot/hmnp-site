/**
 * Enhanced Playwright Tests - Booking Resilience
 * Houston Mobile Notary Pros
 * 
 * Advanced E2E tests with network failure simulation, API mocking,
 * and resilience testing for production-like scenarios
 */

import { test, expect, Page } from '@playwright/test';
import { testUtils } from '../setupEnv';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

// Test data for resilience scenarios
const RESILIENCE_TEST_DATA = {
  validBooking: {
    service: 'STANDARD_NOTARY',
    customer: {
      name: 'Resilience Test User',
      email: 'resilience@example.com',
      phone: '555-987-6543'
    },
    location: {
      address: '789 Resilience Ave',
      city: 'Houston',
      state: 'TX',
      zipCode: '77003'
    },
    documents: {
      count: 2,
      types: ['Contract', 'Affidavit']
    },
    scheduling: {
      date: '2024-02-22',
      time: '15:00'
    }
  },
  invalidData: {
    customer: {
      name: '',
      email: 'invalid-email',
      phone: '123'
    },
    location: {
      address: '',
      city: '',
      state: 'INVALID',
      zipCode: '123'
    }
  }
};

test.describe('Booking Flow Resilience Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Set up console monitoring for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });

    // Monitor network responses
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`HTTP ${response.status()}: ${response.url()}`);
      }
    });
  });

  test('should handle network failures gracefully', async ({ page }) => {
    await test.step('Navigate to booking page', async () => {
      const bookButton = page.locator('button:has-text("Book Now"), a:has-text("Book Now")').first();
      await expect(bookButton).toBeVisible({ timeout: 10000 });
      await bookButton.click();
      await expect(page).toHaveURL(/.*\/booking/);
    });

    await test.step('Fill initial form data', async () => {
      await fillBookingForm(page, RESILIENCE_TEST_DATA.validBooking);
    });

    await test.step('Simulate API failure during price calculation', async () => {
      // Intercept pricing API and return error
      await page.route('**/api/booking/calculate-price', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });

      // Trigger price calculation by changing service type
      const serviceSelector = page.locator('[data-testid="service-selector"]').first();
      if (await serviceSelector.isVisible()) {
        await serviceSelector.click();
      }

      // Should show error message to user
      await expect(page.locator('text=error, text=failed')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Recovery after API becomes available', async () => {
      // Remove the route intercept to simulate API recovery
      await page.unroute('**/api/booking/calculate-price');
      
      // Mock successful response
      await page.route('**/api/booking/calculate-price', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              basePrice: 75,
              travelFee: 0,
              surcharges: 0,
              discounts: 0,
              total: 75,
              breakdown: {
                lineItems: [
                  { description: 'Standard Notary Service', amount: 75, type: 'base' }
                ]
              }
            }
          })
        });
      });

      // Retry price calculation
      const retryButton = page.locator('button:has-text("retry"), button:has-text("try again")').first();
      if (await retryButton.isVisible()) {
        await retryButton.click();
      }

      // Should show successful pricing
      await expect(page.locator('text=$75')).toBeVisible({ timeout: 5000 });
    });
  });

  test('should handle Stripe payment failures', async ({ page }) => {
    await test.step('Complete booking form', async () => {
      await navigateToBooking(page);
      await fillBookingForm(page, RESILIENCE_TEST_DATA.validBooking);
      await navigateToPayment(page);
    });

    await test.step('Simulate payment failure', async () => {
      // Mock Stripe to return payment failure
      // @ts-ignore - Adding mock property for testing
      (window as any).mockStripeFailure = true;

      await page.route('**/api/booking/create', route => {
        route.fulfill({
          status: 402,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Payment processing failed',
            code: 'PAYMENT_ERROR',
            details: {
              type: 'card_declined',
              message: 'Your card was declined.'
            }
          })
        });
      });

      // Fill payment details and submit
      await fillPaymentForm(page);
      await page.click('[data-testid="submit-button"]');

      // Should show payment error
      await expect(page.locator('text=payment failed, text=card declined')).toBeVisible({ timeout: 10000 });
    });

    await test.step('Retry with different payment method', async () => {
      // Mock successful payment
      await page.route('**/api/booking/create', route => {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            booking: {
              id: 'test-booking-123',
              bookingNumber: 'HMN12345678',
              status: 'CONFIRMED',
              totalPrice: 75
            }
          })
        });
      });

      // Try payment again
      const retryButton = page.locator('button:has-text("Try Again"), button:has-text("Update Payment")').first();
      if (await retryButton.isVisible()) {
        await retryButton.click();
      } else {
        await page.click('[data-testid="submit-button"]');
      }

      // Should show success
      await expect(page.locator('text=confirmed, text=success')).toBeVisible({ timeout: 10000 });
    });
  });

  test('should validate form inputs and show helpful error messages', async ({ page }) => {
    await test.step('Navigate to booking form', async () => {
      await navigateToBooking(page);
    });

    await test.step('Submit form with invalid data', async () => {
      await fillInvalidData(page, RESILIENCE_TEST_DATA.invalidData);
      
      const nextButton = page.locator('button:has-text("Continue"), button:has-text("Next")');
      await nextButton.click();

      // Should show validation errors
      await expect(page.locator('text=required, text=invalid')).toBeVisible();
    });

    await test.step('Fix validation errors progressively', async () => {
      // Fix name
      await page.locator('input[name*="name"], #customer-name').fill('Valid Name');
      
      // Fix email
      await page.locator('input[name*="email"], #customer-email').fill('valid@example.com');
      
      // Fix phone
      await page.locator('input[name*="phone"], #customer-phone').fill('555-123-4567');

      // Should clear validation errors as they're fixed
      await testUtils.waitForCondition(async () => {
        const errorElements = await page.locator('text=required, text=invalid').count();
        return errorElements < 3; // Some errors should be cleared
      });
    });
  });

  test('should handle session timeouts gracefully', async ({ page }) => {
    await test.step('Start booking process', async () => {
      await navigateToBooking(page);
      await fillBookingForm(page, RESILIENCE_TEST_DATA.validBooking);
    });

    await test.step('Simulate session timeout', async () => {
      // Mock authentication failure
      await page.route('**/api/booking/**', route => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Session expired',
            code: 'SESSION_EXPIRED'
          })
        });
      });

      const nextButton = page.locator('button:has-text("Continue")');
      await nextButton.click();

      // Should handle session expiry
      await expect(page.locator('text=session expired, text=please refresh')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Refresh and retry', async () => {
      await page.reload();
      
      // Should be able to restart booking process
      await expect(page.locator('button:has-text("Book Now")')).toBeVisible();
    });
  });

  test('should maintain form state during temporary failures', async ({ page }) => {
    await test.step('Fill partial form data', async () => {
      await navigateToBooking(page);
      
      // Fill customer info
      await page.locator('input[name*="name"], #customer-name').fill(RESILIENCE_TEST_DATA.validBooking.customer.name);
      await page.locator('input[name*="email"], #customer-email').fill(RESILIENCE_TEST_DATA.validBooking.customer.email);
      await page.locator('input[name*="phone"], #customer-phone').fill(RESILIENCE_TEST_DATA.validBooking.customer.phone);
    });

    await test.step('Simulate temporary network failure', async () => {
      // Simulate network disconnection
      await page.route('**/*', route => {
        route.abort('failed');
      });

      const nextButton = page.locator('button:has-text("Continue")');
      await nextButton.click();

      // Should show network error
      await expect(page.locator('text=network error, text=connection failed')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Restore network and verify form data preserved', async () => {
      // Restore network
      await page.unroute('**/*');
      
      // Check that form data is still there
      const nameValue = await page.locator('input[name*="name"], #customer-name').inputValue();
      const emailValue = await page.locator('input[name*="email"], #customer-email').inputValue();
      
      expect(nameValue).toBe(RESILIENCE_TEST_DATA.validBooking.customer.name);
      expect(emailValue).toBe(RESILIENCE_TEST_DATA.validBooking.customer.email);
    });
  });

  test('should handle slow network connections', async ({ page }) => {
    await test.step('Simulate slow network', async () => {
      // Slow down all network requests
      await page.route('**/*', async route => {
        await testUtils.sleep(2000); // 2 second delay
        await route.continue();
      });

      await navigateToBooking(page);
    });

    await test.step('Show loading states during slow operations', async () => {
      await fillBookingForm(page, RESILIENCE_TEST_DATA.validBooking);
      
      const nextButton = page.locator('button:has-text("Continue")');
      await nextButton.click();

      // Should show loading indicator
      await expect(page.locator('text=loading, [data-testid="loading"], .loading')).toBeVisible({ timeout: 1000 });
    });

    await test.step('Complete successfully despite slow network', async () => {
      // Should eventually complete
      await expect(page.locator('text=loading')).not.toBeVisible({ timeout: 15000 });
    });
  });

  test('should recover from browser refresh during booking', async ({ page }) => {
    await test.step('Start booking process', async () => {
      await navigateToBooking(page);
      await fillBookingForm(page, RESILIENCE_TEST_DATA.validBooking);
    });

    await test.step('Refresh browser mid-process', async () => {
      await page.reload();
      
      // Should return to a valid state (either resume or restart)
      await expect(page.locator('button:has-text("Book Now"), h1:has-text("booking"), h2:has-text("service")')).toBeVisible({ timeout: 10000 });
    });
  });

  test('should handle multiple tab scenarios', async ({ browser }) => {
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await test.step('Start booking in first tab', async () => {
      await page1.goto(BASE_URL);
      await navigateToBooking(page1);
      await fillBookingForm(page1, RESILIENCE_TEST_DATA.validBooking);
    });

    await test.step('Open booking in second tab', async () => {
      await page2.goto(`${BASE_URL}/booking`);
      
      // Should handle multiple instances gracefully
      await expect(page2.locator('button:has-text("Book Now"), h1:has-text("booking")')).toBeVisible();
    });

    await test.step('Complete booking in first tab', async () => {
      await navigateToPayment(page1);
      
      // Mock successful booking
      await page1.route('**/api/booking/create', route => {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            booking: {
              id: 'test-booking-123',
              bookingNumber: 'HMN12345678',
              status: 'CONFIRMED'
            }
          })
        });
      });

      await fillPaymentForm(page1);
      const submitButton = page1.locator('button:has-text("Complete Booking")');
      await submitButton.click();

      await expect(page1.locator('text=confirmed')).toBeVisible({ timeout: 10000 });
    });

    await context.close();
  });
});

// Helper functions
async function navigateToBooking(page: Page) {
  const bookButton = page.locator('button:has-text("Book Now"), a:has-text("Book Now")').first();
  await expect(bookButton).toBeVisible({ timeout: 10000 });
  await bookButton.click();
  await expect(page).toHaveURL(/.*\/booking/);
}

async function fillBookingForm(page: Page, data: any) {
  // Service selection
  const serviceSelector = page.locator('[data-testid="service-STANDARD_NOTARY"], text=Standard Notary').first();
  if (await serviceSelector.isVisible()) {
    await serviceSelector.click();
  }

  // Customer information
  await page.locator('input[name*="name"], #customer-name').fill(data.customer.name);
  await page.locator('input[name*="email"], #customer-email').fill(data.customer.email);
  await page.locator('input[name*="phone"], #customer-phone').fill(data.customer.phone);

  // Location information
  if (data.location) {
    await page.locator('input[name*="address"], #location-address').fill(data.location.address);
    await page.locator('input[name*="city"], #location-city').fill(data.location.city);
    await page.locator('input[name*="zipcode"], #location-zipcode').fill(data.location.zipCode);
  }

  // Service details
  if (data.documents) {
    const docCountInput = page.locator('#document-count, [name*="documentCount"]');
    if (await docCountInput.isVisible()) {
      await docCountInput.fill(data.documents.count.toString());
    }
  }

  // Scheduling
  if (data.scheduling) {
    const dateInput = page.locator('#preferred-date, input[type="date"]');
    if (await dateInput.isVisible()) {
      await dateInput.fill(data.scheduling.date);
    }
    
    const timeInput = page.locator('#preferred-time, select[name*="time"]');
    if (await timeInput.isVisible()) {
      await timeInput.selectOption(data.scheduling.time);
    }
  }
}

async function fillInvalidData(page: Page, invalidData: any) {
  await page.locator('input[name*="name"], #customer-name').fill(invalidData.customer.name);
  await page.locator('input[name*="email"], #customer-email').fill(invalidData.customer.email);
  await page.locator('input[name*="phone"], #customer-phone').fill(invalidData.customer.phone);
}

async function navigateToPayment(page: Page) {
  // Click through wizard steps to reach payment
  let attempts = 0;
  while (attempts < 5) {
    const continueButton = page.locator('button:has-text("Continue"), button:has-text("Next")');
    if (await continueButton.isVisible()) {
      await continueButton.click();
      await page.waitForTimeout(1000);
      attempts++;
    } else {
      break;
    }
  }
}

async function fillPaymentForm(page: Page) {
  // Look for Stripe elements or payment form
  const paymentFrame = page.frameLocator('iframe[name*="stripe"]').first();
  const cardNumberInput = paymentFrame.locator('[placeholder*="card number"]');
  
  if (await cardNumberInput.isVisible({ timeout: 5000 })) {
    await cardNumberInput.fill('4242424242424242');
    await paymentFrame.locator('[placeholder*="expiry"], [placeholder*="MM"]').fill('12/25');
    await paymentFrame.locator('[placeholder*="cvc"], [placeholder*="security"]').fill('123');
  }
}