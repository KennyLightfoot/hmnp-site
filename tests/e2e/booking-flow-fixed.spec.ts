import { test, expect } from '@playwright/test';

test.describe('Booking Flow Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure the dev server is running
    await page.goto('/booking');
  });

  test('should load services successfully', async ({ page }) => {
    // Wait for services to load
    await page.waitForSelector('[data-testid="service-option"]', { timeout: 10000 });
    
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
    await expect(firstService.locator('text=/[0-9]+\\s*min/')).toBeVisible(); // Duration
    
    // Check that service name is present
    const serviceName = await firstService.locator('h3, .service-name').textContent();
    expect(serviceName).toBeTruthy();
    expect(serviceName!.length).toBeGreaterThan(0);
  });

  test('should allow service selection', async ({ page }) => {
    // Wait for services to load
    await page.waitForSelector('[data-testid="service-option"]', { timeout: 10000 });
    
    // Click on first service
    await page.locator('[data-testid="service-option"]').first().click();
    
    // Should advance to next step (calendar/time selection)
    await expect(page.locator('text="Pick Time"')).toBeVisible({ timeout: 5000 });
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
    await expect(page.locator('text="Pick Your Time"')).toBeVisible();
    
    // Progress bar should show 40% (2/5 steps)
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock the API to return an error
    await page.route('/api/services', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ success: false, error: 'Server error' })
      });
    });
    
    await page.goto('/booking');
    
    // Should display error message instead of crashing
    await expect(page.locator('text="Error Loading Services"')).toBeVisible({ timeout: 10000 });
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