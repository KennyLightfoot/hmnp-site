import { test, expect } from '@playwright/test';

/**
 * Phase 1 E2E Tests: Mobile and RON Booking Flows
 * Tests the complete user journey for both service types
 */

test.describe('Phase 1: Enhanced Booking Flows', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to main booking page
    await page.goto('/booking');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('Mobile Notary Booking Flow', () => {
    
    test('should complete full mobile booking with Stripe payment', async ({ page }) => {
      // Step 1: Service Type Selection
      await expect(page.locator('h1')).toContainText('Enhanced Booking Experience');
      
      // Mobile service should be selected by default
      const mobileCard = page.locator('[data-testid="mobile-service-card"]').first();
      await expect(mobileCard).toHaveClass(/border-\[#A52A2A\]/);
      
      // Verify mobile service details are visible
      await expect(page.locator('text=In-person service at your location')).toBeVisible();
      await expect(page.locator('text=Most Popular')).toBeVisible();
      
      // Continue to next step
      await page.click('button:has-text("Continue to Service Selection")');
      
      // Step 2: Service Selection
      await expect(page.locator('text=Service Selection')).toBeVisible();
      
      // Select Standard Notary Service (SOP compliant)
      await page.click('[data-testid="service-standard-notary"]');
      await expect(page.locator('[data-testid="service-standard-notary"]')).toHaveClass(/border-\[#A52A2A\]/);
      
      // Verify real-time pricing appears
      await expect(page.locator('[data-testid="live-quote"]')).toBeVisible();
      await expect(page.locator('text=Live Quote')).toBeVisible();
      
      await page.click('button:has-text("Next")');
      
      // Step 3: Contact Information
      await page.fill('[data-testid="firstName"]', 'John');
      await page.fill('[data-testid="lastName"]', 'Doe');
      await page.fill('[data-testid="email"]', 'john.doe@example.com');
      await page.fill('[data-testid="phone"]', '713-555-0123');
      
      await page.click('button:has-text("Next")');
      
      // Step 4: Location Details
      await page.fill('[data-testid="address"]', '123 Main Street');
      await page.fill('[data-testid="city"]', 'Houston');
      await page.fill('[data-testid="state"]', 'TX');
      await page.fill('[data-testid="postalCode"]', '77001');
      
      // Wait for distance calculation
      await page.waitForTimeout(2000);
      
      // Verify geofencing works - should be within service area
      await expect(page.locator('[data-testid="travel-fee-info"]')).toBeVisible();
      
      await page.click('button:has-text("Next")');
      
      // Step 5: Review & Complete
      await expect(page.locator('text=Review & Complete')).toBeVisible();
      
      // Verify pricing summary
      await expect(page.locator('[data-testid="final-price"]')).toBeVisible();
      await expect(page.locator('[data-testid="payment-summary"]')).toBeVisible();
      
      // Accept terms
      await page.check('[data-testid="terms-checkbox"]');
      
      // Complete booking
      await page.click('button:has-text("Complete Booking")');
      
      // Should redirect to Stripe checkout or confirmation
      await page.waitForURL(/\/checkout|\/booking-confirmation/);
      
      // Verify successful booking creation
      if (page.url().includes('/checkout')) {
        await expect(page.locator('[data-testid="stripe-checkout"]')).toBeVisible();
      } else {
        await expect(page.locator('text=Booking Confirmed')).toBeVisible();
      }
    });

    test('should show travel fee for distant locations', async ({ page }) => {
      // Select mobile service and proceed to location entry
      await page.click('button:has-text("Continue to Service Selection")');
      
      // Select a service
      await page.click('[data-testid="service-standard-notary"]');
      await page.click('button:has-text("Next")');
      
      // Fill contact info
      await page.fill('[data-testid="firstName"]', 'Jane');
      await page.fill('[data-testid="lastName"]', 'Smith');
      await page.fill('[data-testid="email"]', 'jane.smith@example.com');
      await page.fill('[data-testid="phone"]', '713-555-0456');
      await page.click('button:has-text("Next")');
      
      // Enter location beyond free radius (Katy, TX is ~20 miles from Houston)
      await page.fill('[data-testid="address"]', '123 Katy Mills Blvd');
      await page.fill('[data-testid="city"]', 'Katy');
      await page.fill('[data-testid="state"]', 'TX');
      await page.fill('[data-testid="postalCode"]', '77494');
      
      // Wait for distance calculation
      await page.waitForTimeout(3000);
      
      // Verify travel fee is calculated and displayed
      await expect(page.locator('[data-testid="travel-warning"]')).toBeVisible();
      await expect(page.locator('text=Travel fee applies')).toBeVisible();
      
      // Verify pricing updates to include travel fee
      await expect(page.locator('[data-testid="travel-fee-amount"]')).toBeVisible();
      await expect(page.locator('[data-testid="pricing-breakdown"]')).toContainText('Travel');
    });

    test('should block booking for locations outside service area', async ({ page }) => {
      // Proceed to location entry
      await page.click('button:has-text("Continue to Service Selection")');
      await page.click('[data-testid="service-standard-notary"]');
      await page.click('button:has-text("Next")');
      
      // Fill contact info
      await page.fill('[data-testid="firstName"]', 'Bob');
      await page.fill('[data-testid="lastName"]', 'Wilson');
      await page.fill('[data-testid="email"]', 'bob.wilson@example.com');
      await page.fill('[data-testid="phone"]', '713-555-0789');
      await page.click('button:has-text("Next")');
      
      // Enter location far outside service area (Austin, TX is ~165 miles)
      await page.fill('[data-testid="address"]', '100 Congress Ave');
      await page.fill('[data-testid="city"]', 'Austin');
      await page.fill('[data-testid="state"]', 'TX');
      await page.fill('[data-testid="postalCode"]', '78701');
      
      // Wait for distance calculation
      await page.waitForTimeout(3000);
      
      // Verify service area restriction warning
      await expect(page.locator('[data-testid="service-area-error"]')).toBeVisible();
      await expect(page.locator('text=beyond our standard')).toBeVisible();
      
      // Verify booking is blocked
      await page.click('button:has-text("Next")');
      await page.check('[data-testid="terms-checkbox"]');
      await page.click('button:has-text("Complete Booking")');
      
      // Should show error message instead of proceeding
      await expect(page.locator('[data-testid="booking-error"]')).toBeVisible();
      await expect(page.locator('text=Service Area Restriction')).toBeVisible();
    });

    test('should apply promo code and update pricing', async ({ page }) => {
      // Complete booking flow up to pricing
      await page.click('button:has-text("Continue to Service Selection")');
      await page.click('[data-testid="service-standard-notary"]');
      await page.click('button:has-text("Next")');
      
      // Fill contact and location info quickly
      await page.fill('[data-testid="firstName"]', 'Alice');
      await page.fill('[data-testid="lastName"]', 'Brown');
      await page.fill('[data-testid="email"]', 'alice.brown@example.com');
      await page.fill('[data-testid="phone"]', '713-555-0321');
      await page.click('button:has-text("Next")');
      
      await page.fill('[data-testid="address"]', '456 Houston St');
      await page.fill('[data-testid="city"]', 'Houston');
      await page.fill('[data-testid="state"]', 'TX');
      await page.fill('[data-testid="postalCode"]', '77002');
      await page.click('button:has-text("Next")');
      
      // Get original price
      const originalPrice = await page.locator('[data-testid="final-price"]').textContent();
      
      // Apply promo code
      await page.fill('[data-testid="promo-code"]', 'FIRST20');
      await page.locator('[data-testid="promo-code"]').blur(); // Trigger validation
      
      // Wait for promo validation
      await page.waitForTimeout(2000);
      
      // Verify promo code applied successfully
      await expect(page.locator('[data-testid="promo-success"]')).toBeVisible();
      await expect(page.locator('text=Promo code applied!')).toBeVisible();
      
      // Verify price updated with discount
      const discountedPrice = await page.locator('[data-testid="final-price"]').textContent();
      expect(discountedPrice).not.toBe(originalPrice);
      
      // Verify discount shows in breakdown
      await expect(page.locator('[data-testid="pricing-breakdown"]')).toContainText('Promo discount');
    });
  });

  test.describe('RON Booking Flow', () => {
    
    test('should complete full RON booking flow', async ({ page }) => {
      // Navigate to main booking page
      await page.goto('/booking');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Step 1: Service Type Selection
      await expect(page.locator('h1')).toContainText('Book Your Notary Appointment');
      
      // Select RON service
      const ronCard = page.locator('[data-testid="ron-service-card"]').first();
      await expect(ronCard).toBeVisible();
      await ronCard.click();
      
      // Continue to next step
      await page.click('button:has-text("Continue to Service Selection")');
      
      // Step 2: Service Selection
      await expect(page.locator('text=Service Selection')).toBeVisible();
      
      // Select RON Services
      await page.click('[data-testid="service-ron-services"]');
      await expect(page.locator('[data-testid="service-ron-services"]')).toHaveClass(/border-\[#A52A2A\]/);
      
      // Verify real-time pricing appears
      await expect(page.locator('[data-testid="live-quote"]')).toBeVisible();
      await expect(page.locator('text=Live Quote')).toBeVisible();
      
      await page.click('button:has-text("Next")');
      
      // Step 3: Contact Information
      await page.fill('[data-testid="firstName"]', 'Jane');
      await page.fill('[data-testid="lastName"]', 'Smith');
      await page.fill('[data-testid="email"]', 'jane.smith@example.com');
      await page.fill('[data-testid="phone"]', '555-987-6543');
      
      await page.click('button:has-text("Next")');
      
      // Step 4: Scheduling (RON - no location needed)
      await expect(page.locator('text=Scheduling')).toBeVisible();
      
      // Select date and time
      await page.click('[data-testid="date-picker"]');
      await page.click('[data-testid="date-option"]');
      
      await page.click('[data-testid="time-slot"]');
      
      await page.click('button:has-text("Next")');
      
      // Step 5: Review & Confirm
      await expect(page.locator('text=Review & Confirm')).toBeVisible();
      
      // Verify booking details
      await expect(page.locator('text=RON Services')).toBeVisible();
      await expect(page.locator('text=Jane Smith')).toBeVisible();
      await expect(page.locator('text=jane.smith@example.com')).toBeVisible();
      
      // Submit booking
      await page.click('button:has-text("Confirm Booking")');
      
      // Verify success
      await expect(page.locator('text=Booking created successfully')).toBeVisible();
    });
  });

  test.describe('Real-time Pricing Integration', () => {
    
    test('should update pricing in real-time as form is filled', async ({ page }) => {
      await page.click('button:has-text("Continue to Service Selection")');
      
      // Select service and verify initial pricing
      await page.click('[data-testid="service-standard-notary"]');
      await expect(page.locator('[data-testid="live-quote"]')).toBeVisible();
      
      // Get base price
      const basePrice = await page.locator('[data-testid="base-price"]').textContent();
      
      await page.click('button:has-text("Next")');
      
      // Fill contact info and continue
      await page.fill('[data-testid="firstName"]', 'Test');
      await page.fill('[data-testid="lastName"]', 'User');
      await page.fill('[data-testid="email"]', 'test@example.com');
      await page.fill('[data-testid="phone"]', '713-555-0000');
      await page.click('button:has-text("Next")');
      
      // Enter location that will incur travel fee
      await page.fill('[data-testid="address"]', '123 Cypress Creek Pkwy');
      await page.fill('[data-testid="city"]', 'Cypress');
      await page.fill('[data-testid="state"]', 'TX');
      await page.fill('[data-testid="postalCode"]', '77429');
      
      // Wait for distance calculation and pricing update
      await page.waitForTimeout(3000);
      
      // Verify pricing updated with travel fee
      const updatedPrice = await page.locator('[data-testid="final-price"]').textContent();
      expect(updatedPrice).not.toBe(basePrice);
      
      // Verify "Updated" badge appears
      await expect(page.locator('[data-testid="pricing-updated-badge"]')).toBeVisible();
    });

    test('should show deposit vs full payment correctly', async ({ page }) => {
      await page.click('button:has-text("Continue to Service Selection")');
      
      // Select service that requires deposit
      await page.click('[data-testid="service-standard-notary"]'); // Assumes standard notary requires deposit
      
      // Verify deposit information is displayed
      await expect(page.locator('[data-testid="deposit-info"]')).toBeVisible();
      await expect(page.locator('text=Deposit Required')).toBeVisible();
      await expect(page.locator('text=Pay now (deposit)')).toBeVisible();
      await expect(page.locator('text=Remaining balance')).toBeVisible();
    });
  });

  test.describe('Accessibility & Performance', () => {
    
    test('should meet accessibility standards', async ({ page }) => {
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="mobile-service-card"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="ron-service-card"]')).toBeFocused();
      
      // Test ARIA labels and roles
      await expect(page.locator('role=button')).toHaveCount(3); // Should have proper button roles
      const ariaLabelCount = await page.locator('[aria-label]').count();
      expect(ariaLabelCount).toBeGreaterThanOrEqual(1); // Should have ARIA labels
    });

    test('should load quickly and be responsive', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/booking');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load in under 3 seconds
      
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('[data-testid="mobile-service-card"]')).toBeVisible();
      await expect(page.locator('[data-testid="ron-service-card"]')).toBeVisible();
    });
  });
});

test.describe('Feature Flag Integration', () => {
  
  test('should respect LaunchDarkly feature flags', async ({ page }) => {
    // Test with RON disabled (default state)
    await page.goto('/booking');
    await expect(page.locator('text=Coming Soon')).toBeVisible();
    
    // Future: Test with RON enabled via feature flag
    // This would require mocking LaunchDarkly responses or using test environment
  });
  
  test('should gracefully handle feature flag failures', async ({ page }) => {
    // Mock network failure for feature flags
    await page.route('**/launchdarkly/**', route => route.abort());
    
    await page.goto('/booking');
    
    // Should still work with default fallback values
    await expect(page.locator('[data-testid="mobile-service-card"]')).toBeVisible();
    await expect(page.locator('text=Coming Soon')).toBeVisible(); // Default: RON disabled
  });
});

test.describe('Feature Flags & Deployment', () => {
  
  test('should display Phase 1 completion status', async ({ page }) => {
    // Verify Phase 1 features are marked as complete
    await expect(page.locator('text=Phase 1 Complete')).toBeVisible();
    await expect(page.locator('text=Mobile/RON Toggle, Real-time Pricing, Distance Geofencing')).toBeVisible();
    
    // Verify Phase 2 is marked as coming
    await expect(page.locator('text=Phase 2 Coming')).toBeVisible();
    await expect(page.locator('text=Proof RON Integration, Document Upload, Video Sessions')).toBeVisible();
  });

  test('should handle mobile viewport correctly', async ({ page }) => {
    // Test responsive design
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Service selection should still be visible and functional
    await expect(page.locator('text=Mobile Notary')).toBeVisible();
    await expect(page.locator('text=Remote Online Notarization')).toBeVisible();
    
    // Should be able to interact with service cards
    await page.click('button:has-text("Continue to Service Selection")');
  });
});

test.describe('Integration Points', () => {
  
  test('should prepare for LaunchDarkly integration', async ({ page }) => {
    // Test that the page is ready for feature flag integration
    await expect(page.locator('h1')).toContainText('Enhanced Booking Experience');
    
    // The RON "Coming Soon" state demonstrates feature flag readiness
    await expect(page.locator('text=Coming Soon')).toBeVisible();
  });

  test('should prepare for Google Maps integration', async ({ page }) => {
    // Verify the page structure supports location-based features
    await expect(page.locator('text=Mobile Notary')).toBeVisible();
    
    // Mobile service option indicates location will be collected
    await expect(page.locator('text=We come to you')).toBeVisible();
  });

  test('should prepare for Stripe payment integration', async ({ page }) => {
    // Test navigation flow that will lead to payment
    await page.click('button:has-text("Continue to Service Selection")');
    
    // Should successfully navigate (payment integration comes later)
    await expect(page.locator('text=Service Selection')).toBeVisible();
  });
});

// Additional test for error handling and edge cases 