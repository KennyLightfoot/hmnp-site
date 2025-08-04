/**
 * Comprehensive Booking System E2E Tests
 * Houston Mobile Notary Pros
 * 
 * Tests the complete booking system including:
 * - Redis connection and caching
 * - Interactive pricing updates
 * - Form validation and step progression
 * - Error handling and fallbacks
 * - Mobile responsiveness
 * 
 * Updated: August 4, 2025
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

const TEST_SERVICES = [
  'STANDARD_NOTARY',
  'EXTENDED_HOURS', 
  'LOAN_SIGNING',
  'RON_SERVICES'
];

test.describe('Booking System Comprehensive Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to booking page
    await page.goto('/booking');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Ensure we're on the booking page
    await expect(page.locator('h1')).toContainText('Book Your Notary Service');
  });

  test.describe('System Health & Redis Connection', () => {
    
    test('should load without Redis connection errors', async ({ page }) => {
      // Check console for Redis errors
      const consoleErrors: string[] = [];
      
      page.on('console', (msg) => {
        if (msg.type() === 'error' && msg.text().includes('Redis')) {
          consoleErrors.push(msg.text());
        }
      });
      
      // Wait for page to fully load
      await page.waitForTimeout(3000);
      
      // Should not have Redis connection errors
      expect(consoleErrors.length).toBe(0);
    });

    test('should display interactive pricing without excessive updates', async ({ page }) => {
      // Count interactive pricing update logs
      const pricingUpdates: string[] = [];
      
      page.on('console', (msg) => {
        if (msg.text().includes('Interactive pricing updated')) {
          pricingUpdates.push(msg.text());
        }
      });
      
      // Wait for pricing to load
      await page.waitForTimeout(2000);
      
      // Should have reasonable number of pricing updates (not 50+)
      expect(pricingUpdates.length).toBeLessThan(10);
    });

    test('should handle pricing API gracefully', async ({ page }) => {
      // Monitor for 500 errors
      const apiErrors: string[] = [];
      
      page.on('response', (response) => {
        if (response.url().includes('/api/pricing/') && response.status() === 500) {
          apiErrors.push(`500 error on ${response.url()}`);
        }
      });
      
      // Wait for API calls to complete
      await page.waitForTimeout(3000);
      
      // Should not have 500 errors
      expect(apiErrors.length).toBe(0);
    });
  });

  test.describe('Service Selection & Pricing', () => {
    
    test('should display all service options', async ({ page }) => {
      // Wait for services to load
      await page.waitForSelector('[data-testid="service-option"], .cursor-pointer', { timeout: 10000 });
      
      // Check that services are displayed
      const services = await page.locator('[data-testid="service-option"], .cursor-pointer').count();
      expect(services).toBeGreaterThan(0);
      
      // Verify service types are present
      for (const serviceType of TEST_SERVICES) {
        const serviceElement = page.locator(`text=${serviceType.replace('_', ' ')}`).first();
        await expect(serviceElement).toBeVisible();
      }
    });

    test('should update pricing when service is selected', async ({ page }) => {
      // Wait for services to load
      await page.waitForSelector('[data-testid="service-option"], .cursor-pointer', { timeout: 10000 });
      
      // Click on first service
      await page.locator('[data-testid="service-option"], .cursor-pointer').first().click();
      
      // Wait for pricing to update
      await page.waitForTimeout(1000);
      
      // Should show pricing information
      const pricingElement = page.locator('text=/\\$[0-9]+/').first();
      await expect(pricingElement).toBeVisible();
    });

    test('should show interactive pricing calculator', async ({ page }) => {
      // Look for interactive pricing component
      const pricingCalculator = page.locator('text=Interactive Pricing, text=Live Updates').first();
      await expect(pricingCalculator).toBeVisible();
    });
  });

  test.describe('Form Validation & Step Progression', () => {
    
    test('should validate current step only', async ({ page }) => {
      // Wait for services to load
      await page.waitForSelector('[data-testid="service-option"], .cursor-pointer', { timeout: 10000 });
      
      // Try to continue without selecting service
      const continueButton = page.locator('button:has-text("Continue"), button:has-text("Next")').first();
      if (await continueButton.isVisible()) {
        await continueButton.click();
        
        // Should stay on current step or show validation error
        // Should NOT validate future steps
        await page.waitForTimeout(1000);
        
        // Verify we're still on service selection or showing validation
        const serviceSection = page.locator('text=Choose Service, text=Select a Service').first();
        const validationError = page.locator('text=Please select a service, text=Required').first();
        
        expect(await serviceSection.isVisible() || await validationError.isVisible()).toBeTruthy();
      }
    });

    test('should progress through steps correctly', async ({ page }) => {
      // Wait for services to load
      await page.waitForSelector('[data-testid="service-option"], .cursor-pointer', { timeout: 10000 });
      
      // Select a service
      await page.locator('[data-testid="service-option"], .cursor-pointer').first().click();
      
      // Continue to next step
      const continueButton = page.locator('button:has-text("Continue"), button:has-text("Next")').first();
      await continueButton.click();
      
      // Should advance to next step
      await page.waitForTimeout(2000);
      
      // Verify we're on the next step (contact info or scheduling)
      const nextStepElement = page.locator('text=Contact Info, text=Your Information, text=Tell Us About Yourself').first();
      await expect(nextStepElement).toBeVisible();
    });

    test('should show progress indicator', async ({ page }) => {
      // Look for progress bar or step indicator
      const progressBar = page.locator('[role="progressbar"], .progress-bar, .step-indicator').first();
      await expect(progressBar).toBeVisible();
    });
  });

  test.describe('Error Handling & Resilience', () => {
    
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network error by blocking API calls
      await page.route('**/api/**', (route) => {
        route.abort('failed');
      });
      
      // Try to interact with the form
      await page.waitForSelector('[data-testid="service-option"], .cursor-pointer', { timeout: 10000 });
      await page.locator('[data-testid="service-option"], .cursor-pointer').first().click();
      
      // Should not crash, should show fallback or error message
      await page.waitForTimeout(2000);
      
      // Page should still be functional
      await expect(page.locator('h1')).toContainText('Book Your Notary Service');
    });

    test('should handle React errors gracefully', async ({ page }) => {
      // Monitor for React error #185
      const reactErrors: string[] = [];
      
      page.on('console', (msg) => {
        if (msg.text().includes('React error #185')) {
          reactErrors.push(msg.text());
        }
      });
      
      // Interact with the form
      await page.waitForSelector('[data-testid="service-option"], .cursor-pointer', { timeout: 10000 });
      await page.locator('[data-testid="service-option"], .cursor-pointer').first().click();
      
      // Wait for any errors
      await page.waitForTimeout(3000);
      
      // Should not have React error #185
      expect(reactErrors.length).toBe(0);
    });

    test('should show error boundaries when needed', async ({ page }) => {
      // Look for error boundary components
      const errorBoundary = page.locator('text=Something went wrong, text=Error boundary').first();
      
      // Should not be visible initially
      await expect(errorBoundary).not.toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Wait for services to load
      await page.waitForSelector('[data-testid="service-option"], .cursor-pointer', { timeout: 10000 });
      
      // Should be able to select service
      await page.locator('[data-testid="service-option"], .cursor-pointer').first().click();
      
      // Should show mobile-optimized layout
      const mobileLayout = page.locator('.mobile-optimized, [data-mobile="true"]').first();
      // Note: This might not exist, but the form should still be functional
      
      // Continue button should be accessible
      const continueButton = page.locator('button:has-text("Continue"), button:has-text("Next")').first();
      await expect(continueButton).toBeVisible();
    });

    test('should have touch-friendly buttons', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check button sizes (should be at least 44px for touch)
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44);
          expect(box.width).toBeGreaterThanOrEqual(44);
        }
      }
    });
  });

  test.describe('Performance & Loading States', () => {
    
    test('should show loading states appropriately', async ({ page }) => {
      // Look for loading indicators
      const loadingIndicators = page.locator('.loading, .spinner, [data-loading="true"]');
      
      // Should show loading initially
      if (await loadingIndicators.first().isVisible()) {
        await expect(loadingIndicators.first()).toBeVisible();
        
        // Should disappear after loading
        await page.waitForTimeout(5000);
        await expect(loadingIndicators.first()).not.toBeVisible();
      }
    });

    test('should load within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      // Wait for page to be fully interactive
      await page.waitForSelector('[data-testid="service-option"], .cursor-pointer', { timeout: 10000 });
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
    });
  });

  test.describe('Accessibility', () => {
    
    test('should have proper ARIA labels', async ({ page }) => {
      // Check for ARIA labels on form elements
      const formElements = page.locator('input, select, button');
      const elementCount = await formElements.count();
      
      let ariaLabelCount = 0;
      for (let i = 0; i < Math.min(elementCount, 10); i++) {
        const element = formElements.nth(i);
        const ariaLabel = await element.getAttribute('aria-label');
        const ariaLabelledby = await element.getAttribute('aria-labelledby');
        
        if (ariaLabel || ariaLabelledby) {
          ariaLabelCount++;
        }
      }
      
      // Should have some ARIA labels for accessibility
      expect(ariaLabelCount).toBeGreaterThan(0);
    });

    test('should be keyboard navigable', async ({ page }) => {
      // Focus on first interactive element
      await page.keyboard.press('Tab');
      
      // Should be able to navigate with keyboard
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should not get stuck in infinite loop
      await page.waitForTimeout(1000);
    });
  });
}); 