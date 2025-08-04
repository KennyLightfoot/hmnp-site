/**
 * RON Dashboard E2E Tests
 * Houston Mobile Notary Pros - Remote Online Notarization
 * 
 * Tests the complete RON dashboard functionality including session management,
 * document handling, and Proof.com integration.
 */

import { test, expect, Page } from '@playwright/test';

// Test data constants
const TEST_NOTARY = {
  email: 'notary.test@example.com',
  password: 'TestPassword123!',
  name: 'Test Notary',
  commission: 'TX123456789'
};

const TEST_RON_SESSION = {
  transactionId: 'proof_txn_test_123',
  customerName: 'Jane Doe',
  customerEmail: 'jane.doe@example.com',
  documentType: 'Affidavit',
  scheduledTime: '2024-02-15T14:00:00Z',
  status: 'SCHEDULED'
};

const MOCK_PROOF_RESPONSE = {
  transaction_id: 'proof_txn_test_123',
  status: 'waiting_for_notary',
  customer_name: 'Jane Doe',
  documents: [
    {
      id: 'doc_123',
      name: 'Affidavit.pdf',
      status: 'uploaded'
    }
  ],
  notary_join_url: 'https://app.proof.com/notary/join/test_123',
  customer_join_url: 'https://app.proof.com/customer/join/test_123'
};

test.describe('RON Dashboard Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock Proof.com API responses
    await page.route('**/api/proof/**', route => {
      const url = route.request().url();
      
      if (url.includes('/transactions')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            transactions: [MOCK_PROOF_RESPONSE]
          })
        });
      } else if (url.includes('/session/start')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            session_url: 'https://app.proof.com/notary/session/test_123'
          })
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      }
    });

    // Mock authentication
    await page.route('**/api/auth/session', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'notary_123',
            email: TEST_NOTARY.email,
            name: TEST_NOTARY.name,
            role: 'NOTARY'
          }
        })
      });
    });

    // Navigate to RON dashboard
    await page.goto('/ron/dashboard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('Dashboard Overview', () => {
    
    test('should display RON dashboard with session overview', async ({ page }) => {
      // Verify dashboard header
      await expect(page.locator('[data-testid="ron-dashboard-header"]')).toContainText('RON Dashboard');
      
      // Verify session statistics
      await expect(page.locator('[data-testid="total-sessions"]')).toBeVisible();
      await expect(page.locator('[data-testid="pending-sessions"]')).toBeVisible();
      await expect(page.locator('[data-testid="completed-sessions"]')).toBeVisible();
      
      // Verify quick actions
      await expect(page.locator('[data-testid="quick-actions"]')).toBeVisible();
      await expect(page.locator('[data-testid="start-new-session"]')).toBeVisible();
      await expect(page.locator('[data-testid="view-schedule"]')).toBeVisible();
    });

    test('should display pending RON sessions', async ({ page }) => {
      // Verify sessions table
      await expect(page.locator('[data-testid="sessions-table"]')).toBeVisible();
      
      // Verify session row
      await expect(page.locator('[data-testid="session-row"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="customer-name"]')).toContainText('Jane Doe');
      await expect(page.locator('[data-testid="document-type"]')).toContainText('Affidavit');
      await expect(page.locator('[data-testid="session-status"]')).toContainText('SCHEDULED');
      
      // Verify action buttons
      await expect(page.locator('[data-testid="start-session-btn"]')).toBeVisible();
      await expect(page.locator('[data-testid="view-details-btn"]')).toBeVisible();
    });

    test('should filter sessions by status', async ({ page }) => {
      // Test status filter
      await page.click('[data-testid="status-filter"]');
      await page.click('[data-testid="filter-pending"]');
      
      // Verify filtered results
      await expect(page.locator('[data-testid="session-row"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="session-status"]')).toContainText('SCHEDULED');
      
      // Test "All" filter
      await page.click('[data-testid="status-filter"]');
      await page.click('[data-testid="filter-all"]');
      
      // Verify all sessions shown
      await expect(page.locator('[data-testid="session-row"]')).toHaveCount(1);
    });

    test('should search sessions by customer name', async ({ page }) => {
      // Use search functionality
      await page.fill('[data-testid="session-search"]', 'Jane Doe');
      await page.keyboard.press('Enter');
      
      // Verify search results
      await expect(page.locator('[data-testid="session-row"]')).toHaveCount(1);
      await expect(page.locator('[data-testid="customer-name"]')).toContainText('Jane Doe');
      
      // Test no results
      await page.fill('[data-testid="session-search"]', 'Nonexistent Customer');
      await page.keyboard.press('Enter');
      
      await expect(page.locator('[data-testid="no-sessions-message"]')).toBeVisible();
    });
  });

  test.describe('Session Management', () => {
    
    test('should start a RON session', async ({ page }) => {
      // Click start session button
      await page.click('[data-testid="start-session-btn"]');
      
      // Verify session preparation modal
      await expect(page.locator('[data-testid="session-prep-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="customer-info"]')).toContainText('Jane Doe');
      await expect(page.locator('[data-testid="document-info"]')).toContainText('Affidavit.pdf');
      
      // Verify pre-session checklist
      await expect(page.locator('[data-testid="identity-verification"]')).toBeVisible();
      await expect(page.locator('[data-testid="document-review"]')).toBeVisible();
      await expect(page.locator('[data-testid="audio-video-check"]')).toBeVisible();
      
      // Complete checklist
      await page.check('[data-testid="identity-verified"]');
      await page.check('[data-testid="documents-reviewed"]');
      await page.check('[data-testid="tech-check-complete"]');
      
      // Start session
      await page.click('[data-testid="start-ron-session"]');
      
      // Verify session started
      await expect(page.locator('[data-testid="session-started-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="proof-session-link"]')).toBeVisible();
    });

    test('should view session details', async ({ page }) => {
      // Click view details button
      await page.click('[data-testid="view-details-btn"]');
      
      // Verify session details modal
      await expect(page.locator('[data-testid="session-details-modal"]')).toBeVisible();
      
      // Verify customer information
      await expect(page.locator('[data-testid="detail-customer-name"]')).toContainText('Jane Doe');
      await expect(page.locator('[data-testid="detail-customer-email"]')).toContainText('jane.doe@example.com');
      
      // Verify document information
      await expect(page.locator('[data-testid="detail-document-type"]')).toContainText('Affidavit');
      await expect(page.locator('[data-testid="detail-document-status"]')).toContainText('uploaded');
      
      // Verify session information
      await expect(page.locator('[data-testid="detail-transaction-id"]')).toContainText('proof_txn_test_123');
      await expect(page.locator('[data-testid="detail-scheduled-time"]')).toBeVisible();
      
      // Verify action buttons
      await expect(page.locator('[data-testid="detail-start-session"]')).toBeVisible();
      await expect(page.locator('[data-testid="detail-contact-customer"]')).toBeVisible();
    });

    test('should handle session cancellation', async ({ page }) => {
      // Click cancel session button
      await page.click('[data-testid="cancel-session-btn"]');
      
      // Verify cancellation modal
      await expect(page.locator('[data-testid="cancel-session-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="cancel-warning"]')).toContainText('This action cannot be undone');
      
      // Provide cancellation reason
      await page.selectOption('[data-testid="cancel-reason"]', 'customer_request');
      await page.fill('[data-testid="cancel-notes"]', 'Customer requested cancellation');
      
      // Confirm cancellation
      await page.click('[data-testid="confirm-cancel"]');
      
      // Verify cancellation success
      await expect(page.locator('[data-testid="cancel-success-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="session-status"]')).toContainText('CANCELLED');
    });

    test('should reschedule a session', async ({ page }) => {
      // Click reschedule button
      await page.click('[data-testid="reschedule-session-btn"]');
      
      // Verify reschedule modal
      await expect(page.locator('[data-testid="reschedule-modal"]')).toBeVisible();
      
      // Select new date and time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      
      await page.fill('[data-testid="new-date"]', dateString || "");
      await page.selectOption('[data-testid="new-time"]', '15:00');
      
      // Add reschedule reason
      await page.fill('[data-testid="reschedule-reason"]', 'Customer availability changed');
      
      // Confirm reschedule
      await page.click('[data-testid="confirm-reschedule"]');
      
      // Verify reschedule success
      await expect(page.locator('[data-testid="reschedule-success-message"]')).toBeVisible();
    });
  });

  test.describe('Document Management', () => {
    
    test('should display document preview', async ({ page }) => {
      // Click document preview button
      await page.click('[data-testid="preview-document-btn"]');
      
      // Verify document preview modal
      await expect(page.locator('[data-testid="document-preview-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="document-viewer"]')).toBeVisible();
      
      // Verify document controls
      await expect(page.locator('[data-testid="zoom-in"]')).toBeVisible();
      await expect(page.locator('[data-testid="zoom-out"]')).toBeVisible();
      await expect(page.locator('[data-testid="download-document"]')).toBeVisible();
      
      // Test zoom functionality
      await page.click('[data-testid="zoom-in"]');
      await page.click('[data-testid="zoom-out"]');
      
      // Close preview
      await page.click('[data-testid="close-preview"]');
      await expect(page.locator('[data-testid="document-preview-modal"]')).not.toBeVisible();
    });

    test('should handle document upload', async ({ page }) => {
      // Click upload additional document
      await page.click('[data-testid="upload-document-btn"]');
      
      // Verify upload modal
      await expect(page.locator('[data-testid="upload-modal"]')).toBeVisible();
      
      // Mock file upload
      const fileInput = page.locator('[data-testid="file-input"]');
      await fileInput.setInputFiles({
        name: 'additional-document.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('fake pdf content')
      });
      
      // Add document description
      await page.fill('[data-testid="document-description"]', 'Additional supporting document');
      
      // Upload document
      await page.click('[data-testid="upload-confirm"]');
      
      // Verify upload success
      await expect(page.locator('[data-testid="upload-success-message"]')).toBeVisible();
    });

    test('should validate document requirements', async ({ page }) => {
      // Click start session with missing documents
      await page.click('[data-testid="start-session-btn"]');
      
      // Verify validation modal
      await expect(page.locator('[data-testid="document-validation-modal"]')).toBeVisible();
      
      // Verify validation checklist
      await expect(page.locator('[data-testid="document-checklist"]')).toBeVisible();
      await expect(page.locator('[data-testid="identity-document-check"]')).toBeVisible();
      await expect(page.locator('[data-testid="notarization-document-check"]')).toBeVisible();
      
      // Verify cannot proceed without validation
      await expect(page.locator('[data-testid="proceed-session"]')).toBeDisabled();
      
      // Complete validation
      await page.check('[data-testid="identity-verified"]');
      await page.check('[data-testid="documents-complete"]');
      
      // Verify can now proceed
      await expect(page.locator('[data-testid="proceed-session"]')).toBeEnabled();
    });
  });

  test.describe('Proof.com Integration', () => {
    
    test('should connect to Proof.com session', async ({ page }) => {
      // Start session
      await page.click('[data-testid="start-session-btn"]');
      
      // Complete pre-session checklist
      await page.check('[data-testid="identity-verified"]');
      await page.check('[data-testid="documents-reviewed"]');
      await page.check('[data-testid="tech-check-complete"]');
      
      await page.click('[data-testid="start-ron-session"]');
      
      // Verify Proof.com integration
      await expect(page.locator('[data-testid="proof-session-link"]')).toBeVisible();
      await expect(page.locator('[data-testid="proof-session-link"]')).toHaveAttribute('href', /proof\.com/);
      
      // Verify session status update
      await expect(page.locator('[data-testid="session-status"]')).toContainText('IN_PROGRESS');
      
      // Verify session timer
      await expect(page.locator('[data-testid="session-timer"]')).toBeVisible();
    });

    test('should handle Proof.com session completion', async ({ page }) => {
      // Mock session completion webhook
      await page.route('**/api/proof/webhook', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            event: 'session_completed',
            transaction_id: 'proof_txn_test_123',
            status: 'completed',
            completion_time: new Date().toISOString()
          })
        });
      });

      // Start session
      await page.click('[data-testid="start-session-btn"]');
      await page.check('[data-testid="identity-verified"]');
      await page.check('[data-testid="documents-reviewed"]');
      await page.check('[data-testid="tech-check-complete"]');
      await page.click('[data-testid="start-ron-session"]');
      
      // Simulate session completion
      await page.click('[data-testid="complete-session"]');
      
      // Verify completion modal
      await expect(page.locator('[data-testid="session-completion-modal"]')).toBeVisible();
      
      // Verify completion details
      await expect(page.locator('[data-testid="completion-time"]')).toBeVisible();
      await expect(page.locator('[data-testid="notarization-certificate"]')).toBeVisible();
      
      // Verify session status update
      await expect(page.locator('[data-testid="session-status"]')).toContainText('COMPLETED');
    });

    test('should handle Proof.com connection errors', async ({ page }) => {
      // Mock Proof.com API error
      await page.route('**/api/proof/session/start', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Proof.com service unavailable'
          })
        });
      });

      // Attempt to start session
      await page.click('[data-testid="start-session-btn"]');
      await page.check('[data-testid="identity-verified"]');
      await page.check('[data-testid="documents-reviewed"]');
      await page.check('[data-testid="tech-check-complete"]');
      await page.click('[data-testid="start-ron-session"]');
      
      // Verify error handling
      await expect(page.locator('[data-testid="proof-error-message"]')).toBeVisible();
      await expect(page.locator('[data-testid="proof-error-message"]')).toContainText('service unavailable');
      
      // Verify retry option
      await expect(page.locator('[data-testid="retry-connection"]')).toBeVisible();
      
      // Test retry functionality
      await page.route('**/api/proof/session/start', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            session_url: 'https://app.proof.com/notary/session/test_123'
          })
        });
      });
      
      await page.click('[data-testid="retry-connection"]');
      
      // Verify successful retry
      await expect(page.locator('[data-testid="proof-session-link"]')).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/ron/dashboard');
      
      // Verify mobile layout
      await expect(page.locator('[data-testid="mobile-ron-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="mobile-session-cards"]')).toBeVisible();
      
      // Verify mobile navigation
      await page.click('[data-testid="mobile-menu-toggle"]');
      await expect(page.locator('[data-testid="mobile-nav-menu"]')).toBeVisible();
      
      // Test mobile session management
      await page.click('[data-testid="mobile-session-card"]');
      await expect(page.locator('[data-testid="mobile-session-details"]')).toBeVisible();
      
      // Verify mobile-optimized buttons
      await expect(page.locator('[data-testid="mobile-start-session"]')).toBeVisible();
      await expect(page.locator('[data-testid="mobile-session-actions"]')).toBeVisible();
    });

    test('should handle tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto('/ron/dashboard');
      
      // Verify tablet layout
      await expect(page.locator('[data-testid="tablet-ron-layout"]')).toBeVisible();
      await expect(page.locator('[data-testid="tablet-session-grid"]')).toBeVisible();
      
      // Verify tablet-optimized controls
      await expect(page.locator('[data-testid="tablet-quick-actions"]')).toBeVisible();
    });
  });

  test.describe('Performance Tests', () => {
    
    test('should load dashboard within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/ron/dashboard');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should handle multiple sessions efficiently', async ({ page }) => {
      // Mock multiple sessions
      await page.route('**/api/proof/transactions', route => {
        const multipleSessions = Array(50).fill(null).map((_, i) => ({
          ...MOCK_PROOF_RESPONSE,
          transaction_id: `proof_txn_test_${i}`,
          customer_name: `Customer ${i}`
        }));
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            transactions: multipleSessions
          })
        });
      });

      await page.goto('/ron/dashboard');
      
      // Verify pagination or virtualization
      await expect(page.locator('[data-testid="session-row"]')).toHaveCount(10); // Should show 10 per page
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
      
      // Test pagination performance
      const paginationStart = Date.now();
      await page.click('[data-testid="next-page"]');
      await page.waitForLoadState('networkidle');
      const paginationTime = Date.now() - paginationStart;
      
      // Pagination should be fast
      expect(paginationTime).toBeLessThan(1000);
    });
  });

  test.describe('Accessibility', () => {
    
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/ron/dashboard');
      
      // Tab through main elements
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="start-new-session"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="view-schedule"]')).toBeFocused();
      
      // Navigate to session table
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-testid="start-session-btn"]')).toBeFocused();
      
      // Test keyboard activation
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-testid="session-prep-modal"]')).toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/ron/dashboard');
      
      // Check ARIA labels
      await expect(page.locator('[data-testid="sessions-table"]')).toHaveAttribute('aria-label', 'RON sessions table');
      await expect(page.locator('[data-testid="status-filter"]')).toHaveAttribute('aria-label', 'Filter sessions by status');
      await expect(page.locator('[data-testid="session-search"]')).toHaveAttribute('aria-label', 'Search sessions');
      
      // Check button descriptions
      await expect(page.locator('[data-testid="start-session-btn"]')).toHaveAttribute('aria-label', 'Start RON session');
      await expect(page.locator('[data-testid="view-details-btn"]')).toHaveAttribute('aria-label', 'View session details');
    });
  });

  // Helper functions for common actions
  async function loginAsNotary(page: Page) {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', TEST_NOTARY.email);
    await page.fill('[data-testid="password"]', TEST_NOTARY.password);
    await page.click('[data-testid="login-submit"]');
    await page.waitForURL('/ron/dashboard');
  }

  async function createMockSession(page: Page) {
    await page.route('**/api/ron/sessions', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          session: TEST_RON_SESSION
        })
      });
    });
  }
}); 