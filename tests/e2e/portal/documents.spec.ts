import { test, expect } from '@playwright/test';
import path from 'path'; // Needed for resolving file paths if saving downloads
import fs from 'fs'; // Needed for reading/writing files if checking content

test.describe('Portal Document Management - ADMIN', () => {
  // Log in as ADMIN before each test
  test.beforeEach(async ({ page }) => {
    const loginUrl = process.env.PLAYWRIGHT_LOGIN_URL;
    const emailSelector = process.env.PLAYWRIGHT_EMAIL_SELECTOR;
    const passwordSelector = process.env.PLAYWRIGHT_PASSWORD_SELECTOR;
    const submitSelector = process.env.PLAYWRIGHT_SUBMIT_SELECTOR;
    const username = process.env.PLAYWRIGHT_TEST_USERNAME;
    const password = process.env.PLAYWRIGHT_TEST_PASSWORD;

    console.log('--- Debugging Environment Variables ---');
    console.log('PLAYWRIGHT_LOGIN_URL:', loginUrl);
    console.log('PLAYWRIGHT_EMAIL_SELECTOR:', emailSelector);
    console.log('PLAYWRIGHT_PASSWORD_SELECTOR:', passwordSelector);
    console.log('PLAYWRIGHT_SUBMIT_SELECTOR:', submitSelector);
    console.log('PLAYWRIGHT_TEST_USERNAME:', username);
    console.log('PLAYWRIGHT_TEST_PASSWORD:', password);
    console.log('-------------------------------------');

    if (!loginUrl || !emailSelector || !passwordSelector || !submitSelector || !username || !password) {
      throw new Error('Playwright E2E test environment variables are not fully set. Please check your .env file.');
    }

    // Increase timeout for initial navigation
    await page.goto(loginUrl, { timeout: 60000 }); // 60 seconds
    await page.locator(emailSelector).fill(username);
    await page.locator(passwordSelector).fill(password);
    await page.locator(submitSelector).click();

    // Wait specifically for the URL to change to something containing /portal,
    // giving it more time due to dev server compilation.
    await page.waitForURL('**/portal', { timeout: 20000 }); // Increased to 20 seconds

    // After waitForURL succeeds, this assertion should pass quickly.
    await expect(page).toHaveURL(/.*\/portal/);
  });

  test('ADMIN user can upload and download a document', async ({ page }) => {
    test.setTimeout(60000); // Set timeout for this specific test to 60 seconds
    // 1. Navigate to the specific assignment page
    const assignmentId = 'test-assignment-id'; // Placeholder ID
    await page.goto(`/portal/${assignmentId}`);
    await expect(page).toHaveURL(`/portal/${assignmentId}`); // Confirm navigation

    // 2. Define the file to upload
    const fileName = `test-upload-${Date.now()}.txt`; // Unique filename
    const fileContent = 'This is the content of the test file for ADMIN.';

    // 3. Locate the file input element and set the file
    //    Use setInputFiles for <input type="file">
    await page.locator('input#document-upload').setInputFiles({
      name: fileName,
      mimeType: 'text/plain',
      buffer: Buffer.from(fileContent),
    });

    // 4. Click the explicit "Upload Document" button
    await page.locator('button:has-text("Upload Document")').click();

    // 5. Wait for upload confirmation: the file appears in the documents table
    //    Locate the table row containing the uploaded filename.
    //    Increase timeout if uploads/refresh take longer.
    const uploadedRowLocator = page.locator(`tr:has-text("${fileName}")`);
    await expect(uploadedRowLocator).toBeVisible({ timeout: 15000 }); // Wait up to 15s

    // 6. Locate the download button *within that specific row*
    const downloadButtonLocator = uploadedRowLocator.locator('button:has-text("Download")');
    await expect(downloadButtonLocator).toBeEnabled();

    // 7. Start waiting for the download *before* clicking the button
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }); // Wait up to 10s for download start
    await downloadButtonLocator.click();

    // 8. Wait for the download event to complete
    const download = await downloadPromise;

    // 9. Assert the downloaded filename is correct
    expect(download.suggestedFilename()).toBe(fileName);

    // 10. (Optional but recommended) Save and verify content
    //     This requires a temporary directory accessible by the test runner
    //     Adjust the path as needed for your environment.
    const tempDir = path.join(__dirname, '..', 'temp-downloads'); // Example: tests/temp-downloads
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempFilePath = path.join(tempDir, download.suggestedFilename());

    try {
        await download.saveAs(tempFilePath);
        expect(fs.existsSync(tempFilePath)).toBe(true); // Check file exists
        const downloadedContent = fs.readFileSync(tempFilePath, 'utf-8');
        expect(downloadedContent).toBe(fileContent); // Check content matches
        console.log(`Verified downloaded content for ${fileName}`);
    } finally {
        // Clean up the downloaded file
        if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }

  });

  // TODO: Add more tests for different roles (STAFF, PARTNER) and edge cases (errors, etc.)
}); 