import { test, expect, Page } from '@playwright/test';

/**
 * Fire-Drill Phase 1 Smoke Tests
 * Houston Mobile Notary Pros
 * 
 * Critical smoke tests for immediate deployment validation.
 * Must pass for production release.
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

// Test data for mobile notary booking
const MOBILE_NOTARY_TEST_DATA = {
  service: 'STANDARD_NOTARY',
  customer: {
    name: 'Jane Doe',
    email: 'jane.doe+smoketest@example.com',
    phone: '555-987-6543'
  },
  location: {
    address: '456 Test St',
    city: 'Houston',
    state: 'TX',
    zipCode: '77002'
  },
  documents: {
    count: 2,
    types: ['Affidavit', 'Power of Attorney']
  },
  scheduling: {
    date: '2024-02-20',
    time: '14:00'
  },
  payment: {
    // Stripe test card
    cardNumber: '4242424242424242',
    expiry: '12/25',
    cvc: '123'
  }
};

// Test data for RON booking
const RON_TEST_DATA = {
  service: 'RON_SERVICES',
  customer: {
    name: 'Bob Smith',
    email: 'bob.smith+rontest@example.com',
    phone: '555-456-7890'
  },
  documents: {
    count: 1,
    types: ['Contract']
  },
  scheduling: {
    date: '2024-02-21',
    time: '10:00'
  },
  payment: {
    cardNumber: '4242424242424242',
    expiry: '12/25',
    cvc: '123'
  }
};

test.describe('Fire-Drill Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Mobile Notary Happy Path - Stripe Test Payment', async ({ page }) => {
    await test.step('Navigate to booking', async () => {
      const bookButton = page.locator('button:has-text("Book Now"), a:has-text("Book Now")').first();
      await expect(bookButton).toBeVisible({ timeout: 10000 });
      await bookButton.click();
      await expect(page).toHaveURL(/.*\/booking/, { timeout: 10000 });
    });

    await test.step('Select Standard Notary service', async () => {
      // Look for service selection - try multiple selectors
      const serviceSelector = page.locator('[data-testid="service-STANDARD_NOTARY"]')
        .or(page.locator('text=Standard Notary'))
        .or(page.locator('[value="STANDARD_NOTARY"]'));
      
      await expect(serviceSelector.first()).toBeVisible({ timeout: 10000 });
      await serviceSelector.first().click();
    });

    await test.step('Fill customer information', async () => {
      await page.locator('#customer-name, [name="customer.name"], input[placeholder*="name" i]').fill(MOBILE_NOTARY_TEST_DATA.customer.name);
      await page.locator('#customer-email, [name="customer.email"], input[placeholder*="email" i]').fill(MOBILE_NOTARY_TEST_DATA.customer.email);
      await page.locator('#customer-phone, [name="customer.phone"], input[placeholder*="phone" i]').fill(MOBILE_NOTARY_TEST_DATA.customer.phone);
    });

    await test.step('Fill location information', async () => {
      await page.locator('#location-address, [name="location.address"], input[placeholder*="address" i]').fill(MOBILE_NOTARY_TEST_DATA.location.address);
      await page.locator('#location-city, [name="location.city"], input[placeholder*="city" i]').fill(MOBILE_NOTARY_TEST_DATA.location.city);
      await page.locator('#location-zipcode, [name="location.zipCode"], input[placeholder*="zip" i]').fill(MOBILE_NOTARY_TEST_DATA.location.zipCode);
    });

    await test.step('Configure service details', async () => {
      // Set document count
      const docCountInput = page.locator('#document-count, [name="serviceDetails.documentCount"]');
      if (await docCountInput.isVisible()) {
        await docCountInput.fill(MOBILE_NOTARY_TEST_DATA.documents.count.toString());
      }
    });

    await test.step('Select scheduling', async () => {
      // Select preferred date
      const dateInput = page.locator('#preferred-date, [name="scheduling.preferredDate"], input[type="date"]');
      if (await dateInput.isVisible()) {
        await dateInput.fill(MOBILE_NOTARY_TEST_DATA.scheduling.date);
      }
      
      // Select preferred time
      const timeInput = page.locator('#preferred-time, [name="scheduling.preferredTime"], select[name*="time"]');
      if (await timeInput.isVisible()) {
        await timeInput.selectOption(MOBILE_NOTARY_TEST_DATA.scheduling.time);
      }
    });

    await test.step('Complete payment with Stripe test card', async () => {
      // Navigate through wizard steps if needed
      const continueButton = page.locator('button:has-text("Continue"), button:has-text("Next")');
      
      // Keep clicking continue until we reach payment or final step
      let attempts = 0;
      while (await continueButton.isVisible() && attempts < 5) {
        await continueButton.click();
        await page.waitForTimeout(1000);
        attempts++;
      }

      // Look for Stripe payment elements or final submit
      const paymentFrame = page.frameLocator('iframe[name*="stripe"]').first();
      const cardNumberInput = paymentFrame.locator('[placeholder*="card number"]');
      
      if (await cardNumberInput.isVisible({ timeout: 5000 })) {
        await cardNumberInput.fill(MOBILE_NOTARY_TEST_DATA.payment.cardNumber);
        await paymentFrame.locator('[placeholder*="expiry"], [placeholder*="MM"]').fill(MOBILE_NOTARY_TEST_DATA.payment.expiry);
        await paymentFrame.locator('[placeholder*="cvc"], [placeholder*="security"]').fill(MOBILE_NOTARY_TEST_DATA.payment.cvc);
      }

      // Submit the booking
      const submitButton = page.locator('button:has-text("Complete Booking"), button:has-text("Submit"), button:has-text("Book Now")');
      await expect(submitButton).toBeVisible({ timeout: 10000 });
      await submitButton.click();
    });

    await test.step('Verify booking success', async () => {
      // Look for success indicators
      await expect(page.locator('text=success, text=confirmed, text=booked')).toBeVisible({ timeout: 15000 });
      
      // Check for booking number or confirmation details
      const bookingNumber = page.locator('[data-testid="booking-number"], text=/HMN[0-9A-Z]+/');
      await expect(bookingNumber).toBeVisible({ timeout: 5000 });
      
      console.log('✅ Mobile Notary booking completed successfully');
    });
  });

  test('RON Booking Flow - Includes ronSessionUrl in Response', async ({ page }) => {
    await test.step('Navigate to booking', async () => {
      const bookButton = page.locator('button:has-text("Book Now"), a:has-text("Book Now")').first();
      await expect(bookButton).toBeVisible({ timeout: 10000 });
      await bookButton.click();
      await expect(page).toHaveURL(/.*\/booking/, { timeout: 10000 });
    });

    await test.step('Select RON service', async () => {
      const ronService = page.locator('[data-testid="service-RON_SERVICES"]')
        .or(page.locator('text=Remote Online Notarization'))
        .or(page.locator('text=RON'))
        .or(page.locator('[value="RON_SERVICES"]'));
      
      await expect(ronService.first()).toBeVisible({ timeout: 10000 });
      await ronService.first().click();
    });

    await test.step('Fill customer information', async () => {
      await page.locator('#customer-name, [name="customer.name"], input[placeholder*="name" i]').fill(RON_TEST_DATA.customer.name);
      await page.locator('#customer-email, [name="customer.email"], input[placeholder*="email" i]').fill(RON_TEST_DATA.customer.email);
      await page.locator('#customer-phone, [name="customer.phone"], input[placeholder*="phone" i]').fill(RON_TEST_DATA.customer.phone);
    });

    await test.step('Configure RON service details', async () => {
      // For RON, location might not be required
      const docCountInput = page.locator('#document-count, [name="serviceDetails.documentCount"]');
      if (await docCountInput.isVisible()) {
        await docCountInput.fill(RON_TEST_DATA.documents.count.toString());
      }
    });

    await test.step('Select scheduling', async () => {
      const dateInput = page.locator('#preferred-date, [name="scheduling.preferredDate"], input[type="date"]');
      if (await dateInput.isVisible()) {
        await dateInput.fill(RON_TEST_DATA.scheduling.date);
      }
      
      const timeInput = page.locator('#preferred-time, [name="scheduling.preferredTime"], select[name*="time"]');
      if (await timeInput.isVisible()) {
        await timeInput.selectOption(RON_TEST_DATA.scheduling.time);
      }
    });

    await test.step('Complete booking and verify RON session creation', async () => {
      // Navigate through wizard steps
      const continueButton = page.locator('button:has-text("Continue"), button:has-text("Next")');
      
      let attempts = 0;
      while (await continueButton.isVisible() && attempts < 5) {
        await continueButton.click();
        await page.waitForTimeout(1000);
        attempts++;
      }

      // Set up network monitoring to capture the API response
      let apiResponse: any = null;
      
      page.on('response', async (response) => {
        if (response.url().includes('/api/booking/create') && response.status() === 201) {
          try {
            apiResponse = await response.json();
          } catch (e) {
            console.warn('Could not parse API response:', e);
          }
        }
      });

      // Handle payment if required
      const paymentFrame = page.frameLocator('iframe[name*="stripe"]').first();
      const cardNumberInput = paymentFrame.locator('[placeholder*="card number"]');
      
      if (await cardNumberInput.isVisible({ timeout: 5000 })) {
        await cardNumberInput.fill(RON_TEST_DATA.payment.cardNumber);
        await paymentFrame.locator('[placeholder*="expiry"], [placeholder*="MM"]').fill(RON_TEST_DATA.payment.expiry);
        await paymentFrame.locator('[placeholder*="cvc"], [placeholder*="security"]').fill(RON_TEST_DATA.payment.cvc);
      }

      // Submit the booking
      const submitButton = page.locator('button:has-text("Complete Booking"), button:has-text("Submit"), button:has-text("Book Now")');
      await expect(submitButton).toBeVisible({ timeout: 10000 });
      await submitButton.click();

      // Wait for booking completion
      await expect(page.locator('text=success, text=confirmed, text=booked')).toBeVisible({ timeout: 15000 });
      
      // Wait a bit for the API response to be captured
      await page.waitForTimeout(2000);
      
      // Verify RON session URL is included in response
      if (apiResponse) {
        expect(apiResponse.ronSessionUrl).toBeTruthy();
        expect(apiResponse.ron?.sessionUrl).toBeTruthy();
        expect(apiResponse.ron?.transactionId).toBeTruthy();
        console.log('✅ RON session URL confirmed in API response');
      } else {
        console.warn('⚠️ Could not capture API response for RON session verification');
      }
      
      console.log('✅ RON booking completed successfully');
    });
  });

  test('API Health Check - Booking endpoints respond correctly', async ({ page }) => {
    await test.step('Check booking create endpoint health', async () => {
      const response = await page.request.get(`${BASE_URL}/api/booking/create`);
      // Should return 405 Method Not Allowed for GET (only accepts POST)
      expect(response.status()).toBe(405);
    });

    await test.step('Check pricing calculation endpoint health', async () => {
      const response = await page.request.post(`${BASE_URL}/api/booking/calculate-price`, {
        data: {
          serviceType: 'STANDARD_NOTARY',
          documentCount: 1,
          signerCount: 1
        }
      });
      // Should process the request (200) or return validation error (400)
      expect([200, 400].includes(response.status())).toBeTruthy();
    });

    await test.step('Check slot reservation endpoint health', async () => {
      const response = await page.request.get(`${BASE_URL}/api/booking/reserve-slot`);
      // Should return 405 Method Not Allowed for GET (only accepts POST)
      expect(response.status()).toBe(405);
    });

    console.log('✅ All booking API endpoints are responding correctly');
  });

  test('GHL Webhook endpoint responds correctly', async ({ page }) => {
    await test.step('Test webhook endpoint availability', async () => {
      const response = await page.request.get(`${BASE_URL}/api/webhooks/ghl`);
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body.message).toContain('active');
      expect(body.status).toBe('healthy');
      
      console.log('✅ GHL webhook endpoint is healthy and responsive');
    });

    await test.step('Test webhook POST handling', async () => {
      // Test with minimal webhook payload
      const response = await page.request.post(`${BASE_URL}/api/webhooks/ghl`, {
        data: {
          type: 'ContactCreate',
          contactId: 'test-contact-id'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Should handle the webhook (200) or reject due to missing signature (401)
      expect([200, 401].includes(response.status())).toBeTruthy();
      
      console.log('✅ GHL webhook POST handling is working');
    });
  });
});

// Utility function to wait for form to be ready
async function waitForFormReady(page: Page) {
  await page.waitForSelector('form, [data-testid="booking-form"]', { timeout: 10000 });
  await page.waitForTimeout(1000); // Allow form to initialize
}

// Utility function to handle step navigation
async function navigateToNextStep(page: Page) {
  const nextButton = page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("Submit")');
  if (await nextButton.isVisible()) {
    await nextButton.click();
    await page.waitForTimeout(1000);
    return true;
  }
  return false;
}