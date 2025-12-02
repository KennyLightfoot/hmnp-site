import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Express Booking Path', () => {
  test.beforeEach(async ({ page }) => {
    // Initialize dataLayer if it doesn't exist
    await page.addInitScript(() => {
      (window as any).dataLayer = [];
    });

    // Stub the submit-ad-lead API endpoint
    await page.route('**/api/submit-ad-lead**', async (route) => {
      if (route.request().method() !== 'POST') {
        return route.continue();
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          id: 'test-lead-123',
          message: 'Lead submitted successfully',
        }),
      });
    });

    await page.goto(`${BASE_URL}/booking`);
    await expect(
      page.getByRole('heading', { name: 'Book Your Notary Appointment' }),
    ).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    // Clean up route handlers and clear state
    await page.unroute('**/api/**');
    await page.evaluate(() => {
      (window as any).dataLayer = [];
    });
  });

  test('should submit Express callback form and show success state', async ({ page }) => {
    // Clear dataLayer before test
    await page.evaluate(() => {
      (window as any).dataLayer = [];
    });

    // Express tab should be active by default
    const expressTab = page.getByRole('tab', { name: /express callback/i });
    await expect(expressTab).toBeVisible();

    // Fill Express form fields
    // LeadForm requires: firstName, lastName, email, phone, message, termsAccepted
    await page.locator('input[name="firstName"]').fill('Express Test');
    await page.locator('input[name="lastName"]').fill('User');
    await page.locator('input[name="email"]').fill('express-test@example.com');
    await page.locator('input[name="phone"]').fill('7135551234');
    await page.locator('textarea[name="message"]').fill('Need notary service ASAP');

    // Accept terms (checkbox) - use label or id selector since it's a custom Checkbox component
    const termsCheckbox = page.locator('#termsAccepted, [id="termsAccepted"]').first();
    await expect(termsCheckbox).toBeVisible({ timeout: 5000 });
    await termsCheckbox.click();

    // Submit form
    const submitButton = page.getByRole('button', { name: /request call back/i });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Wait for success state
    await expect(
      page.getByRole('heading', { name: "You're All Set!" }),
    ).toBeVisible({ timeout: 5000 });

    // Verify success message content
    await expect(
      page.getByText(/we've received your request/i),
    ).toBeVisible();

    // Verify badges are displayed
    await expect(
      page.getByText(/we'll call or text you/i),
    ).toBeVisible();
    await expect(
      page.getByText(/usually within 15 minutes/i),
    ).toBeVisible();

    // Verify express_booking_success event was fired
    const successEvent = await page.evaluate(() => {
      const dataLayer = (window as any).dataLayer || [];
      return dataLayer.find((event: any) => 
        event.event === 'booking_funnel' && 
        event.funnel_stage === 'express_booking_success'
      );
    });

    expect(successEvent).toBeTruthy();
    expect(successEvent?.path).toBe('express');
    expect(successEvent?.leadId).toBeTruthy();
  });

  test('should require name and contact info (phone OR email)', async ({ page }) => {
    // The form button is only disabled during submission, not based on validation
    // Validation happens on submit, so we'll test that submission fails without required fields
    
    const submitButton = page.getByRole('button', { name: /request call back/i });
    
    // Button should be visible and enabled (form doesn't disable based on validation state)
    await expect(submitButton).toBeVisible();
    
    // Try to submit without filling required fields - should show validation errors
    await submitButton.click();
    
    // Wait for validation errors to appear
    await page.waitForTimeout(500);
    
    // Check for validation error messages (form uses react-hook-form which shows errors)
    const hasErrors = await Promise.race([
      page.locator('text=/required|must|invalid/i').first().isVisible().then(() => true).catch(() => false),
      page.locator('[role="alert"]').first().isVisible().then(() => true).catch(() => false),
    ]).catch(() => false);
    
    // Form should show validation errors and not submit
    expect(hasErrors).toBe(true);
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    // Fill form with invalid email
    await page.locator('input[name="firstName"]').fill('Test');
    await page.locator('input[name="lastName"]').fill('User');
    await page.locator('input[name="email"]').fill('not-an-email');
    await page.locator('input[name="phone"]').fill('7135551234');
    await page.locator('textarea[name="message"]').fill('Need service');
    
    const termsCheckbox = page.locator('#termsAccepted, [id="termsAccepted"]').first();
    await expect(termsCheckbox).toBeVisible({ timeout: 5000 });
    await termsCheckbox.click();

    // Try to submit form - validation happens on submit
    const submitButton = page.getByRole('button', { name: /request call back/i });
    await submitButton.click();

    // Wait for validation error
    await page.waitForTimeout(1000);

    // Check for email validation error
    const hasEmailError = await Promise.race([
      page.locator('text=/valid email|invalid email|email/i').first().isVisible().then(() => true).catch(() => false),
      page.locator('input[name="email"]').getAttribute('aria-invalid').then(val => val === 'true').catch(() => false),
      page.locator('[role="alert"]').first().isVisible().then(() => true).catch(() => false),
    ]).catch(() => false);

    // Form should show validation error and not submit successfully
    expect(hasEmailError).toBe(true);
  });

  test('should show validation errors for invalid phone', async ({ page }) => {
    // Fill form with invalid phone
    await page.locator('input[name="firstName"]').fill('Test');
    await page.locator('input[name="lastName"]').fill('User');
    await page.locator('input[name="email"]').fill('test@example.com');
    await page.locator('input[name="phone"]').fill('123'); // Too short
    await page.locator('textarea[name="message"]').fill('Need service');
    
    const termsCheckbox = page.locator('#termsAccepted, [id="termsAccepted"]').first();
    await expect(termsCheckbox).toBeVisible({ timeout: 5000 });
    await termsCheckbox.click();

    // Try to submit form - validation happens on submit
    const submitButton = page.getByRole('button', { name: /request call back/i });
    await submitButton.click();

    // Wait for validation error
    await page.waitForTimeout(1000);

    // Check for phone validation error
    const hasPhoneError = await Promise.race([
      page.locator('text=/valid phone|invalid phone|phone number/i').first().isVisible().then(() => true).catch(() => false),
      page.locator('input[name="phone"]').getAttribute('aria-invalid').then(val => val === 'true').catch(() => false),
      page.locator('[role="alert"]').first().isVisible().then(() => true).catch(() => false),
    ]).catch(() => false);

    // Form should show validation error and not submit successfully
    expect(hasPhoneError).toBe(true);
  });

  test('should handle API error gracefully', async ({ page }) => {
    // Stub API to return error
    await page.route('**/api/submit-ad-lead**', async (route) => {
      if (route.request().method() !== 'POST') {
        return route.continue();
      }
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Server error. Please try again later.',
        }),
      });
    });

    // Fill and submit form
    await page.locator('input[name="firstName"]').fill('Error Test');
    await page.locator('input[name="lastName"]').fill('User');
    await page.locator('input[name="email"]').fill('error-test@example.com');
    await page.locator('input[name="phone"]').fill('7135551234');
    await page.locator('textarea[name="message"]').fill('Need service');
    
    const termsCheckbox = page.locator('#termsAccepted, [id="termsAccepted"]').first();
    await expect(termsCheckbox).toBeVisible({ timeout: 5000 });
    await termsCheckbox.click();

    const submitButton = page.getByRole('button', { name: /request call back/i });
    await submitButton.click();

    // Wait for error message
    await page.waitForTimeout(1000);

    // Verify error is displayed
    const errorAlert = page.locator('[role="alert"], .text-red-600, [class*="error"]').first();
    await expect(errorAlert).toBeVisible({ timeout: 5000 });
    
    const errorText = await errorAlert.textContent();
    expect(errorText).toMatch(/error|failed|try again/i);

    // Verify form is still visible (user can retry)
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
  });
});

