import { test, expect, Page } from '@playwright/test';

/**
 * Critical Path E2E Tests - Booking Flow
 * 
 * Tests the complete booking journey from service selection to payment completion.
 * This is the most critical user flow for revenue generation.
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

// Test data for booking - SOP COMPLIANT
const TEST_BOOKING_DATA = {
  service: {
    name: 'Standard Notary Services',  // SOP: was 'Essential Notary Services'
    price: '$75'
  },
  client: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe+test@example.com',
    phone: '555-123-4567',
    address: {
      street: '123 Main St',
      city: 'Houston',
      zipCode: '77001'
    }
  },
  appointment: {
    date: '2024-02-15', // Future date
    time: '2:00 PM'
  },
  payment: {
    // Test card numbers (Stripe test mode)
    cardNumber: '4242424242424242',
    expiry: '12/25',
    cvc: '123',
    zipCode: '77001'
  }
};

test.describe('Critical Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start each test from the home page
    await page.goto(BASE_URL);
  });

  test('Complete booking flow - Standard Notary Services', async ({ page }) => {
    // Step 1: Navigate to booking page
    await test.step('Navigate to booking page', async () => {
      const bookButton = page.locator('button:has-text("Book Now"), a:has-text("Book Now")').first();
      await expect(bookButton).toBeVisible({ timeout: 10000 });
      await bookButton.click();
      
      await expect(page).toHaveURL(/.*\/booking/, { timeout: 10000 });
    });

    // Step 2: Select service
    await test.step('Select service', async () => {
      // Look for service cards or selection options
      const serviceCard = page.locator(`[data-testid="service-${TEST_BOOKING_DATA.service.name}"]`)
        .or(page.locator(`:has-text("${TEST_BOOKING_DATA.service.name}")`).first());
      
      await expect(serviceCard).toBeVisible({ timeout: 10000 });
      await serviceCard.click();

      // Verify service selection
      const selectedService = page.locator('.selected, .bg-blue-100, [data-selected="true"]')
        .or(page.locator(`:has-text("${TEST_BOOKING_DATA.service.name}")`));
      await expect(selectedService).toBeVisible();
    });

    // Step 3: Fill client information
    await test.step('Fill client information', async () => {
      // Fill personal information
      await page.locator('#firstName, [name="firstName"]').fill(TEST_BOOKING_DATA.client.firstName);
      await page.locator('#lastName, [name="lastName"]').fill(TEST_BOOKING_DATA.client.lastName);
      await page.locator('#email, [name="email"]').fill(TEST_BOOKING_DATA.client.email);
      await page.locator('#phone, [name="phone"]').fill(TEST_BOOKING_DATA.client.phone);

      // Fill address information
      await page.locator('#address, [name="address"], #street').fill(TEST_BOOKING_DATA.client.address.street);
      await page.locator('#city, [name="city"]').fill(TEST_BOOKING_DATA.client.address.city);
      await page.locator('#zipCode, [name="zipCode"], #zip').fill(TEST_BOOKING_DATA.client.address.zipCode);
    });

    // Step 4: Select appointment date and time
    await test.step('Select appointment date and time', async () => {
      // Open date picker
      const datePicker = page.locator('#date, [name="date"], .date-picker').first();
      await datePicker.click();
      
      // Select date (this may vary based on your date picker implementation)
      const dateOption = page.locator(`[data-date="${TEST_BOOKING_DATA.appointment.date}"]`)
        .or(page.locator(`:has-text("15")`).first()); // Fallback for day selection
      await dateOption.click();

      // Select time slot
      const timeSlot = page.locator(`[data-time="${TEST_BOOKING_DATA.appointment.time}"]`)
        .or(page.locator(`:has-text("${TEST_BOOKING_DATA.appointment.time}")`).first());
      await expect(timeSlot).toBeVisible({ timeout: 5000 });
      await timeSlot.click();
    });

    // Step 5: Review booking details
    await test.step('Review booking details', async () => {
      // Proceed to review/payment
      const proceedButton = page.locator('button:has-text("Continue"), button:has-text("Proceed"), button:has-text("Next")').last();
      await proceedButton.click();

      // Verify booking summary is displayed
      await expect(page.locator(':has-text("Booking Summary"), :has-text("Review")')).toBeVisible();
      
      // Verify service details
      await expect(page.locator(`:has-text("${TEST_BOOKING_DATA.service.name}")`)).toBeVisible();
      await expect(page.locator(`:has-text("${TEST_BOOKING_DATA.client.firstName}")`)).toBeVisible();
      await expect(page.locator(`:has-text("${TEST_BOOKING_DATA.client.email}")`)).toBeVisible();
    });

    // Step 6: Payment processing
    await test.step('Process payment', async () => {
      // Wait for Stripe Elements to load
      await page.waitForSelector('iframe[name^="__privateStripeFrame"]', { timeout: 15000 });

      // Switch to Stripe card iframe
      const cardFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
      
      // Fill payment information
      await cardFrame.locator('[name="cardnumber"]').fill(TEST_BOOKING_DATA.payment.cardNumber);
      await cardFrame.locator('[name="exp-date"]').fill(TEST_BOOKING_DATA.payment.expiry);
      await cardFrame.locator('[name="cvc"]').fill(TEST_BOOKING_DATA.payment.cvc);
      await cardFrame.locator('[name="postal"]').fill(TEST_BOOKING_DATA.payment.zipCode);

      // Submit payment
      const payButton = page.locator('button:has-text("Pay"), button:has-text("Complete"), button:has-text("Submit")').last();
      await payButton.click();

      // Wait for payment processing
      await expect(page.locator(':has-text("Processing"), :has-text("Please wait")')).toBeVisible({ timeout: 5000 });
      
      // Wait for success page
      await expect(page).toHaveURL(/.*\/(confirmation|success|thank-you)/, { timeout: 30000 });
    });

    // Step 7: Verify booking confirmation
    await test.step('Verify booking confirmation', async () => {
      // Check for confirmation message
      await expect(page.locator(':has-text("Confirmed"), :has-text("Success"), :has-text("Thank you")')).toBeVisible();
      
      // Verify booking details are displayed
      await expect(page.locator(`:has-text("${TEST_BOOKING_DATA.client.email}")`)).toBeVisible();
      
      // Check for booking reference number
      await expect(page.locator('[data-testid="booking-id"], [data-testid="reference"]')
        .or(page.locator(':has-text("Booking ID"), :has-text("Reference")'))).toBeVisible();
    });
  });

  test('Booking flow - Handle payment failure', async ({ page }) => {
    // Test payment failure scenario using Stripe test card that always fails
    await test.step('Navigate to booking and fill details', async () => {
      await page.goto(`${BASE_URL}/booking`);
      
      // Quick form fill (abbreviated for payment failure test)
      await page.locator('#firstName, [name="firstName"]').fill('Test');
      await page.locator('#lastName, [name="lastName"]').fill('Failure');
      await page.locator('#email, [name="email"]').fill('test.failure@example.com');
      await page.locator('#phone, [name="phone"]').fill('555-999-0000');
    });

    await test.step('Use card that always fails', async () => {
      // Navigate to payment step
      const proceedButton = page.locator('button:has-text("Continue"), button:has-text("Proceed")').last();
      await proceedButton.click();

      // Wait for Stripe Elements
      await page.waitForSelector('iframe[name^="__privateStripeFrame"]', { timeout: 15000 });
      const cardFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first();
      
      // Use Stripe test card that always fails
      await cardFrame.locator('[name="cardnumber"]').fill('4000000000000002');
      await cardFrame.locator('[name="exp-date"]').fill('12/25');
      await cardFrame.locator('[name="cvc"]').fill('123');
      await cardFrame.locator('[name="postal"]').fill('77001');

      const payButton = page.locator('button:has-text("Pay"), button:has-text("Complete")').last();
      await payButton.click();

      // Verify error handling
      await expect(page.locator(':has-text("declined"), :has-text("failed"), .error, .alert-error')).toBeVisible({ timeout: 10000 });
    });
  });

  test('Booking form validation', async ({ page }) => {
    await test.step('Test required field validation', async () => {
      await page.goto(`${BASE_URL}/booking`);
      
      // Try to proceed without filling required fields
      const proceedButton = page.locator('button:has-text("Continue"), button:has-text("Proceed"), button[type="submit"]').first();
      await proceedButton.click();

      // Check for validation errors
      await expect(page.locator('.error, .text-red-500, [role="alert"]')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Test email validation', async () => {
      // Fill invalid email
      await page.locator('#email, [name="email"]').fill('invalid-email');
      await page.locator('#firstName, [name="firstName"]').fill('Test'); // Trigger validation
      
      // Check for email validation error
      await expect(page.locator(':has-text("valid email"), :has-text("email format")')).toBeVisible({ timeout: 5000 });
    });

    await test.step('Test phone validation', async () => {
      // Fill invalid phone
      await page.locator('#phone, [name="phone"]').fill('123');
      await page.locator('#firstName, [name="firstName"]').fill('Test'); // Trigger validation
      
      // Check for phone validation error
      await expect(page.locator(':has-text("valid phone"), :has-text("phone number")')).toBeVisible({ timeout: 5000 });
    });
  });

  test('Service selection and pricing display', async ({ page }) => {
    await test.step('Verify all services are displayed', async () => {
      await page.goto(`${BASE_URL}/booking`);
      
      // Check that multiple service options are available
      const serviceCards = page.locator('[data-testid^="service-"], .Service-card, .Service-option');
      await expect(serviceCards).toHaveCount(3, { timeout: 10000 }); // Expecting at least 3 services
    });

    await test.step('Verify pricing updates on service selection', async () => {
      // Select different services and verify price changes
      const standardService = page.locator(':has-text("Standard Notary"), :has-text("Standard")').first();
      await standardService.click();
      
      await expect(page.locator(':has-text("$75"), [data-testid="price"]')).toBeVisible();
      
      // Try extended hours service
      const extendedService = page.locator(':has-text("Extended Hours"), :has-text("Extended")').first();
      if (await extendedService.isVisible()) {
        await extendedService.click();
        await expect(page.locator(':has-text("$100"), :has-text("$125")')).toBeVisible();
      }
    });
  });
});

test.describe('Mobile Booking Flow', () => {
  test.use({
    viewport: { width: 375, height: 812 } // iPhone viewport
  });

  test('Complete booking on mobile device', async ({ page }) => {
    await test.step('Mobile booking flow', async () => {
      await page.goto(`${BASE_URL}/booking`);
      
      // Verify mobile-friendly layout
      await expect(page.locator('.booking-form, form')).toBeVisible();
      
      // Test mobile form interaction
      await page.locator('#firstName, [name="firstName"]').fill(TEST_BOOKING_DATA.client.firstName);
      await page.locator('#email, [name="email"]').fill(TEST_BOOKING_DATA.client.email);
      
      // Verify form is still usable on mobile
      const proceedButton = page.locator('button:has-text("Continue"), button:has-text("Proceed")').first();
      await expect(proceedButton).toBeVisible();
    });
  });
}); 