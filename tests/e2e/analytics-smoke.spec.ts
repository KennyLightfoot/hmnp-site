import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Analytics Smoke Tests', () => {
  test('should fire service_view event on service page visit', async ({ page }) => {
    // Initialize dataLayer
    await page.goto(`${BASE_URL}/services/mobile-notary`);
    
    // Wait for page to load and analytics to fire
    await page.waitForTimeout(1000);

    // Check dataLayer for service_view event
    const serviceViewEvent = await page.evaluate(() => {
      const dataLayer = (window as any).dataLayer || [];
      return dataLayer.find(
        (event: any) => event.event === 'service_view' && event.service_type === 'MOBILE',
      );
    });

    expect(serviceViewEvent).toBeTruthy();
    expect(serviceViewEvent?.service_type).toBe('MOBILE');
  });

  test('should fire calculator_use event when using pricing calculator', async ({ page }) => {
    // Stub pricing API
    await page.route('**/api/pricing/transparent**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          serviceType: 'STANDARD_NOTARY',
          basePrice: 75,
          totalPrice: 75,
          breakdown: {
            serviceBase: {
              amount: 75,
              label: 'Standard Notary Service',
              description: 'Base service fee',
              isDiscount: false,
            },
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
          ghlActions: {
            tags: [],
          },
          metadata: {
            requestId: 'test-request-id',
            calculatedAt: new Date().toISOString(),
            version: '1.0.0',
            calculationTime: 0,
          },
        }),
      });
    });

    await page.goto(`${BASE_URL}/pricing-demo`);
    await expect(
      page.getByRole('heading', { name: /transparent pricing/i }),
    ).toBeVisible();

    // Clear dataLayer before interaction
    await page.evaluate(() => {
      (window as any).dataLayer = [];
    });

    // Select service type to trigger calculation
    const serviceSelect = page.locator('select, [role="combobox"]').first();
    await serviceSelect.click();
    await page.getByText('Standard Notary').click();

    // Wait for calculation to complete
    await page.waitForTimeout(1500);

    // Check dataLayer for calculator_use event
    const calculatorEvent = await page.evaluate(() => {
      const dataLayer = (window as any).dataLayer || [];
      return dataLayer.find((event: any) => event.event === 'calculator_use');
    });

    expect(calculatorEvent).toBeTruthy();
    expect(calculatorEvent?.service_type).toBe('STANDARD_NOTARY');
    expect(calculatorEvent?.price).toBe(75);
  });

  test('should fire click_to_call event when clicking tel link', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    
    // Clear dataLayer before interaction
    await page.evaluate(() => {
      (window as any).dataLayer = [];
    });

    // Find a tel: link (could be in header, footer, or sticky CTA)
    const telLink = page.locator('a[href^="tel:"]').first();
    
    if (await telLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Click the tel link
      await telLink.click();

      // Wait a moment for analytics to fire
      await page.waitForTimeout(500);

      // Check dataLayer for click_to_call event
      const callEvent = await page.evaluate(() => {
        const dataLayer = (window as any).dataLayer || [];
        return dataLayer.find((event: any) => event.event === 'click_to_call');
      });

      expect(callEvent).toBeTruthy();
      expect(callEvent?.location).toBeTruthy();
    } else {
      // If no tel link found, skip this test (not all pages have tel links)
      test.skip();
    }
  });

  test('should fire booking_started event when starting booking flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/booking`);
    await expect(
      page.getByRole('heading', { name: 'Book Your Notary Appointment' }),
    ).toBeVisible();

    // Clear dataLayer before interaction
    await page.evaluate(() => {
      (window as any).dataLayer = [];
    });

    // Switch to full booking tab
    const fullBookingTab = page.getByRole('tab', { name: 'Full Online Booking' });
    await fullBookingTab.click();

    // Click Continue to start the booking flow
    await page.getByRole('button', { name: 'Continue' }).click();

    // Wait for analytics to fire
    await page.waitForTimeout(500);

    // Check dataLayer for booking_started event
    const bookingStartedEvent = await page.evaluate(() => {
      const dataLayer = (window as any).dataLayer || [];
      return dataLayer.find((event: any) => event.event === 'booking_started');
    });

    expect(bookingStartedEvent).toBeTruthy();
    expect(bookingStartedEvent?.serviceType).toBeTruthy();
    expect(bookingStartedEvent?.path).toBe('full');
  });
});

