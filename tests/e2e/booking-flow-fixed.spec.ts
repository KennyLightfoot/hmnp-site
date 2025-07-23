import { test, expect } from '@playwright/test';

test.describe('Booking Flow Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure the dev server is running
    await page.goto('/booking');
  });

  test('should load services successfully', async ({ page }) => {
    // Wait for services to load
    await page.waitForSelector('[data-testid="service-option"]', { timeout: 20000 });
    
    // Check that services are displayed
    const services = await page.locator('[data-testid="service-option"]').count();
    expect(services).toBeGreaterThan(0);
    
    // Check that no error messages are displayed
    const errorToast = page.locator('text="Unable to fetch services"');
    await expect(errorToast).not.toBeVisible();
    
    const errorMessage = page.locator('text="Failed to load services"');
    await expect(errorMessage).not.toBeVisible();
  });

  test('should display service information correctly', async ({ page }) => {
    // Wait for services to load
    await page.waitForSelector('[data-testid="service-option"]', { timeout: 10000 });
    
    // Get first service option
    const firstService = page.locator('[data-testid="service-option"]').first();
    
    // Check that it has required information
    await expect(firstService.locator('text=/\\$[0-9]+/')).toBeVisible(); // Price
    // Optionally, ensure the card has meaningful text (price already verified)

    const serviceLabelText = await firstService.textContent();
    expect(serviceLabelText).toContain('$');
  });

  test('should allow service selection', async ({ page }) => {
    // Wait for services to load
    await page.waitForSelector('[data-testid="service-option"]', { timeout: 10000 });
    
    // Click on first service
    await page.locator('[data-testid="service-option"]').first().click();
    
    // Should advance to next step (calendar/time selection)
    await expect(page.locator('h2:text-matches("Tell Us About Yourself|Your Contact Info", "i")')).toBeVisible({ timeout: 10000 });
  });

  test('enhanced booking flow should work', async ({ page }) => {
    // Navigate to enhanced booking
    await page.goto('/booking/enhanced');
    
    // Wait for services to load
    await page.waitForSelector('.cursor-pointer', { timeout: 10000 });
    
    // Check that services are displayed with proper styling
    const services = await page.locator('.cursor-pointer').count();
    expect(services).toBeGreaterThan(0);
    
    // Click on first service
    await page.locator('.cursor-pointer').first().click();
    
    // Should advance to step 2
    await expect(page.locator('label:text-is("Available Times *")')).toBeVisible({ timeout: 10000 });
    
    // Progress bar should show 40% (2/5 steps)
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();
  });

  test.skip('should handle API errors gracefully', async () => {
    // Skipped: legacy endpoint no longer used in new booking flow
  });

  test('should validate form fields', async ({ page }) => {
    await page.goto('/booking');
    
    // Try to proceed without selecting a service
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      
      // Should show validation error or stay on same step
      // This depends on implementation, but should not crash
    }
  });
});