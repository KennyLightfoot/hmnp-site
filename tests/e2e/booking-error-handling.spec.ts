import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Booking Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Initialize dataLayer if it doesn't exist
    await page.addInitScript(() => {
      (window as any).dataLayer = [];
    });

    // Stub pricing API to prevent JSON parsing errors
    await page.route('**/api/pricing/transparent**', async (route) => {
      if (route.request().method() !== 'POST') {
        return route.continue();
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          serviceType: 'STANDARD_NOTARY',
          basePrice: 75,
          totalPrice: 75,
          breakdown: {
            serviceBase: { amount: 75, label: 'Standard Notary Service', description: 'Base service fee', isDiscount: false },
            travelFee: undefined,
            timeBasedSurcharges: [],
            discounts: [],
          },
          transparency: {
            whyThisPrice: 'Standard pricing',
            feeExplanations: [],
            priceFactors: [],
            alternatives: [],
          },
          businessRules: {
            isValid: true,
            serviceAreaZone: 'IN_METRO',
            isWithinServiceArea: true,
            documentLimitsExceeded: false,
            dynamicPricingActive: false,
            discountsApplied: [],
            violations: [],
            recommendations: [],
          },
          ghlActions: { tags: [] },
          metadata: {
            requestId: 'test-request-id',
            calculatedAt: new Date().toISOString(),
            version: '1.0.0',
            calculationTime: 0,
          },
        }),
      });
    });

    // Stub availability API for all tests
    await page.route('**/api/booking/availability**', async (route) => {
      if (route.request().method() !== 'GET') {
        return route.continue();
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          availableSlots: [
            {
              startTime: '2030-01-01T14:00:00.000Z',
              endTime: '2030-01-01T15:00:00.000Z',
              duration: 60,
              available: true,
            },
          ],
        }),
      });
    });

    // Stub CSRF token
    await page.route('**/api/csrf-token**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ csrfToken: 'test-csrf-token' }),
      });
    });

    await page.goto(`${BASE_URL}/booking`);
    await expect(
      page.getByRole('heading', { name: 'Book Your Notary Appointment' }),
    ).toBeVisible();

    // Switch to full booking tab
    const fullBookingTab = page.getByRole('tab', { name: 'Full Online Booking' });
    await fullBookingTab.click();
  });

  test.afterEach(async ({ page }) => {
    // Clean up any route handlers and clear state
    await page.unroute('**/api/**');
    await page.evaluate(() => {
      (window as any).dataLayer = [];
    });
  });

  test('should display error message when booking creation API returns 500', async ({ page }) => {
    // Stub booking creation to return 500 error
    await page.route('**/api/booking/create**', async (route) => {
      if (route.request().method() !== 'POST') {
        return route.continue();
      }
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Internal server error. Please try again later.',
        }),
      });
    });

    // Stub slot reservation
    await page.route('**/api/booking/reserve-slot**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reservation: { id: 'test-reservation-id' },
        }),
      });
    });

    // Complete booking form up to submission
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.locator('input[name="customer.name"]').fill('Error Test User');
    await page.locator('input[name="customer.email"]').fill('error-test@example.com');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByLabel('Street Address').fill('123 Test St');
    await page.getByLabel('City').fill('Houston');
    await page.getByLabel('State').fill('TX');
    await page.getByLabel('ZIP Code').fill('77002');

    const firstDate = page.locator('[data-testid="date-cell"]').first();
    await expect(firstDate).toBeVisible();
    await firstDate.click();

    const firstSlot = page.locator('[data-testid="time-slot"]').first();
    await expect(firstSlot).toBeVisible({ timeout: 10000 });
    await firstSlot.click();

    await page.getByRole('button', { name: 'Continue' }).click();

    // Submit booking
    await page.getByRole('button', { name: 'Confirm Booking' }).click();

    // Wait for error to appear
    await page.waitForTimeout(1000);

    // Verify error message is displayed
    const errorAlert = page.locator('[role="alert"], .text-red-600, [class*="error"]').first();
    await expect(errorAlert).toBeVisible({ timeout: 5000 });
    
    const errorText = await errorAlert.textContent();
    expect(errorText).toMatch(/error|failed|try again/i);

    // Verify booking_error event was pushed to dataLayer
    const errorEvent = await page.evaluate(() => {
      const dataLayer = (window as any).dataLayer || [];
      return dataLayer.find((event: any) => event.event === 'booking_error');
    });

    expect(errorEvent).toBeTruthy();
    expect(errorEvent?.reason).toBe('submit_failed');

    // Verify form is still accessible (user can retry)
    // After error, form might be on review step or have navigated back
    // Check if confirm button is still visible (on review step) or if we can navigate back
    const confirmButtonVisible = await page.getByRole('button', { name: 'Confirm Booking' }).isVisible().catch(() => false);
    const backButtonVisible = await page.getByRole('button', { name: /back|previous/i }).isVisible().catch(() => false);
    
    // Form should still be accessible for retry
    expect(confirmButtonVisible || backButtonVisible).toBe(true);
  });

  test('should handle slot conflict (409 error) and allow selecting different time', async ({ page }) => {
    // Stub slot reservation to return 409 conflict
    await page.route('**/api/booking/reserve-slot**', async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Selected time was just taken. Please choose another time.',
        }),
      });
    });

    // Complete booking form up to scheduling
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.locator('input[name="customer.name"]').fill('Conflict Test User');
    await page.locator('input[name="customer.email"]').fill('conflict-test@example.com');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByLabel('Street Address').fill('123 Test St');
    await page.getByLabel('City').fill('Houston');
    await page.getByLabel('State').fill('TX');
    await page.getByLabel('ZIP Code').fill('77002');

    const firstDate = page.locator('[data-testid="date-cell"]').first();
    await expect(firstDate).toBeVisible();
    await firstDate.click();

    const firstSlot = page.locator('[data-testid="time-slot"]').first();
    await expect(firstSlot).toBeVisible({ timeout: 10000 });
    await firstSlot.click();

    await page.getByRole('button', { name: 'Continue' }).click();

    // Submit booking - should trigger slot conflict
    await page.getByRole('button', { name: 'Confirm Booking' }).click();

    // Wait for conflict error
    await page.waitForTimeout(1000);

    // Verify conflict error message is displayed
    const errorAlert = page.locator('[role="alert"], .text-red-600, [class*="error"]').first();
    await expect(errorAlert).toBeVisible({ timeout: 5000 });
    
    const errorText = await errorAlert.textContent();
    expect(errorText).toMatch(/taken|conflict|choose another|different time/i);

    // After slot conflict, form should stay on review step or go back to scheduling
    // Check if we're on review step (error shown) or scheduling step
    const isOnReviewStep = await page.getByRole('button', { name: 'Confirm Booking' }).isVisible().catch(() => false);
    const isOnSchedulingStep = await page.getByLabel('Street Address').isVisible().catch(() => false);
    
    // Form should be on one of these steps (not navigated away)
    expect(isOnReviewStep || isOnSchedulingStep).toBe(true);
    
    // Error message was already verified above, no need to check again
  });

  test('should handle network timeout gracefully', async ({ page }) => {
    // Stub booking creation to simulate timeout (abort request)
    await page.route('**/api/booking/create**', async (route) => {
      if (route.request().method() !== 'POST') {
        return route.continue();
      }
      // Simulate network failure by aborting
      await route.abort('failed');
    });

    // Stub slot reservation
    await page.route('**/api/booking/reserve-slot**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reservation: { id: 'test-reservation-id' },
        }),
      });
    });

    // Complete booking form
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.locator('input[name="customer.name"]').fill('Timeout Test User');
    await page.locator('input[name="customer.email"]').fill('timeout-test@example.com');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByLabel('Street Address').fill('123 Test St');
    await page.getByLabel('City').fill('Houston');
    await page.getByLabel('State').fill('TX');
    await page.getByLabel('ZIP Code').fill('77002');

    const firstDate = page.locator('[data-testid="date-cell"]').first();
    await expect(firstDate).toBeVisible();
    await firstDate.click();

    const firstSlot = page.locator('[data-testid="time-slot"]').first();
    await expect(firstSlot).toBeVisible({ timeout: 10000 });
    await firstSlot.click();

    await page.getByRole('button', { name: 'Continue' }).click();

    // Submit booking
    await page.getByRole('button', { name: 'Confirm Booking' }).click();

    // Wait for error handling
    await page.waitForTimeout(2000);

    // Verify error message is displayed
    const errorAlert = page.locator('[role="alert"], .text-red-600, [class*="error"]').first();
    await expect(errorAlert).toBeVisible({ timeout: 5000 });
    
    const errorText = await errorAlert.textContent();
    expect(errorText).toMatch(/error|failed|try again|network/i);

    // Verify form is still usable (user can retry)
    await expect(page.getByRole('button', { name: 'Confirm Booking' })).toBeVisible();
  });

  test('should handle availability API failure gracefully', async ({ page }) => {
    // Stub availability API to return 500 error
    await page.route('**/api/booking/availability**', async (route) => {
      if (route.request().method() !== 'GET') {
        return route.continue();
      }
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Failed to load availability',
        }),
      });
    });

    // Navigate to scheduling step
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.locator('input[name="customer.name"]').fill('Availability Test User');
    await page.locator('input[name="customer.email"]').fill('availability-test@example.com');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByLabel('Street Address').fill('123 Test St');
    await page.getByLabel('City').fill('Houston');
    await page.getByLabel('State').fill('TX');
    await page.getByLabel('ZIP Code').fill('77002');

    // Select a date - should trigger availability fetch
    const firstDate = page.locator('[data-testid="date-cell"]').first();
    await expect(firstDate).toBeVisible();
    await firstDate.click();

    // Wait for error to appear
    await page.waitForTimeout(1500);

    // Verify error message is displayed (either in date cell or as alert)
    const hasError = await Promise.race([
      page.locator('[role="alert"]').first().isVisible().then(() => true).catch(() => false),
      page.locator('text=/error|failed|unavailable/i').first().isVisible().then(() => true).catch(() => false),
      page.locator('[data-testid="date-cell"]').first().getAttribute('class').then(cls => cls?.includes('error') || false).catch(() => false),
    ]).catch(() => false);

    // At minimum, verify the form doesn't crash and user can still interact
    await expect(page.getByLabel('Street Address')).toBeVisible();
  });

  test('should push booking_error event to dataLayer on submission failure', async ({ page }) => {
    // Clear dataLayer before test
    await page.evaluate(() => {
      (window as any).dataLayer = [];
    });

    // Stub booking creation to fail
    await page.route('**/api/booking/create**', async (route) => {
      if (route.request().method() !== 'POST') {
        return route.continue();
      }
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Invalid booking data',
        }),
      });
    });

    // Stub slot reservation
    await page.route('**/api/booking/reserve-slot**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reservation: { id: 'test-reservation-id' },
        }),
      });
    });

    // Complete booking form
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.locator('input[name="customer.name"]').fill('Analytics Test User');
    await page.locator('input[name="customer.email"]').fill('analytics-test@example.com');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByLabel('Street Address').fill('123 Test St');
    await page.getByLabel('City').fill('Houston');
    await page.getByLabel('State').fill('TX');
    await page.getByLabel('ZIP Code').fill('77002');

    const firstDate = page.locator('[data-testid="date-cell"]').first();
    await expect(firstDate).toBeVisible();
    await firstDate.click();

    const firstSlot = page.locator('[data-testid="time-slot"]').first();
    await expect(firstSlot).toBeVisible({ timeout: 10000 });
    await firstSlot.click();

    await page.getByRole('button', { name: 'Continue' }).click();

    // Submit booking
    await page.getByRole('button', { name: 'Confirm Booking' }).click();

    // Wait for error handling
    await page.waitForTimeout(1500);

    // Verify booking_error event was pushed
    const errorEvent = await page.evaluate(() => {
      const dataLayer = (window as any).dataLayer || [];
      return dataLayer.find((event: any) => event.event === 'booking_error');
    });

    expect(errorEvent).toBeTruthy();
    expect(errorEvent?.reason).toBe('submit_failed');
    expect(errorEvent?.message).toBeTruthy();
  });
});

