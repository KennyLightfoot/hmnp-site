import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Booking Happy Path', () => {
  test('standard mobile notary booking from start to confirmation', async ({ page }) => {
    // Stub availability so tests don't depend on external calendars
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

    // Stub CSRF token endpoint
    await page.route('**/api/csrf-token**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ csrfToken: 'test-csrf-token' }),
      });
    });

    // Stub slot reservation endpoint
    await page.route('**/api/booking/reserve-slot**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reservation: { id: 'test-reservation-id' },
        }),
      });
    });

    // Stub booking creation endpoint
    await page.route('**/api/booking/create**', async (route) => {
      const request = route.request();
      if (request.method() !== 'POST') {
        return route.continue();
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          booking: {
            id: 'test-booking-123',
            confirmationNumber: 'test-booking-123',
            scheduledDateTime: '2030-01-01T14:00:00.000Z',
            totalAmount: 75,
            service: {
              name: 'Standard Notary Service',
              serviceType: 'STANDARD_NOTARY',
            },
          },
        }),
      });
    });

    // Go to booking page
    await page.goto(`${BASE_URL}/booking`);
    await expect(
      page.getByRole('heading', { name: 'Book Your Notary Appointment' }),
    ).toBeVisible();

    // Switch to the full online booking flow (not the Express callback tab)
    const fullBookingTab = page.getByRole('tab', { name: 'Full Online Booking' });
    await expect(fullBookingTab).toBeVisible();
    await fullBookingTab.click();

    // Step 1: service selection
    // The booking form defaults to STANDARD_NOTARY, so we can proceed
    // without clicking a specific card to avoid layout-dependent flakiness.
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 2: customer info
    await page.locator('input[name="customer.name"]').fill('E2E Booking Test');
    await page
      .locator('input[name="customer.email"]')
      .fill('e2e-booking@example.com');
    await page.locator('input[name="customer.phone"]').fill('7135550101');

    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 3: location & scheduling
    await page.getByLabel('Street Address').fill('123 Test Street');
    await page.getByLabel('City').fill('Houston');
    await page.getByLabel('State').fill('TX');
    await page.getByLabel('ZIP Code').fill('77002');

    // Pick a date
    const firstDate = page.locator('[data-testid="date-cell"]').first();
    await expect(firstDate).toBeVisible();
    await firstDate.click();

    // Pick the first available time slot
    const firstSlot = page.locator('[data-testid="time-slot"]').first();
    await expect(firstSlot).toBeVisible({ timeout: 10000 });
    await firstSlot.click();

    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 4: review & confirm
    // Set up network monitoring to catch any API errors
    let bookingCreateCalled = false;
    let bookingCreateStatus = 0;
    
    page.on('response', async (response) => {
      if (response.url().includes('/api/booking/create')) {
        bookingCreateCalled = true;
        bookingCreateStatus = response.status();
        if (!response.ok()) {
          const body = await response.text().catch(() => '');
          console.log('Booking create failed:', response.status(), body);
        }
      }
    });

    // Click confirm and wait for navigation
    const confirmButton = page.getByRole('button', { name: 'Confirm Booking' });
    await expect(confirmButton).toBeEnabled();
    
    // Wait for navigation promise
    const navigationPromise = page.waitForURL(/\/booking\/success/, { timeout: 15000 });
    
    await confirmButton.click();

    // Wait for API call and navigation
    await page.waitForTimeout(2000);

    // Check if API was called
    if (!bookingCreateCalled) {
      // Check for error messages on the page
      const errorMessage = await page
        .locator('[role="alert"], .text-red-600, [class*="error"]')
        .first()
        .textContent()
        .catch(() => null);
      
      if (errorMessage) {
        throw new Error(`Booking submission failed: ${errorMessage}`);
      }
      
      // Check console for errors
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      throw new Error(`Booking create API was not called. Console errors: ${consoleErrors.join(', ')}`);
    }

    if (bookingCreateStatus !== 200) {
      throw new Error(`Booking create API returned status ${bookingCreateStatus}`);
    }

    // Wait for navigation to complete
    await navigationPromise;
    await expect(
      page.getByRole('heading', { name: 'Booking Confirmed!' }),
    ).toBeVisible({ timeout: 15000 });
  });
});


