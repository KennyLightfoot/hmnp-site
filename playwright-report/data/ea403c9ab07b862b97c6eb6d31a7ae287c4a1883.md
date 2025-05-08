# Test info

- Name: Portal Document Management - ADMIN >> ADMIN user can upload and download a document
- Location: /home/fleece-johnson/HMNP-Site/hmnp-site/tests/e2e/portal/documents.spec.ts:42:3

# Error details

```
TimeoutError: page.waitForURL: Timeout 20000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/portal" until "load"
============================================================
    at /home/fleece-johnson/HMNP-Site/hmnp-site/tests/e2e/portal/documents.spec.ts:36:16
```

# Page snapshot

```yaml
- banner:
  - link "Houston Mobile Notary Pros":
    - /url: /
    - img "Houston Mobile Notary Pros"
  - navigation:
    - list:
      - listitem:
        - link "Services":
          - /url: /services
      - listitem:
        - link "Testimonials":
          - /url: /testimonials
      - listitem:
        - link "FAQ":
          - /url: /faq
      - listitem:
        - link "Blog":
          - /url: /blog
      - listitem:
        - link "Contact":
          - /url: /contact
  - link "Book Now":
    - /url: /booking
- main:
  - heading "Sign in to HMNP Portal" [level=1]
  - text: Email
  - textbox "Email": testuser@example.com
  - text: Password
  - textbox "Password": password123
  - button "Sign In"
- contentinfo:
  - link "Houston Mobile Notary Pros":
    - /url: /
    - img "Houston Mobile Notary Pros"
  - link "Services":
    - /url: /services
  - link "Book Now":
    - /url: /booking
  - link "Testimonials":
    - /url: /testimonials
  - link "FAQ":
    - /url: /faq
  - link "Contact":
    - /url: /contact
  - paragraph: © 2025 Houston Mobile Notary Pros. All rights reserved.
  - paragraph: Serving Houston and surrounding areas with professional mobile notary services.
  - paragraph: "Phone: (281) 779-8847 | Email: contact@houstonmobilenotarypros.com"
  - link "Terms & Conditions":
    - /url: /terms
  - text: "|"
  - link "Privacy Policy":
    - /url: /privacy
- region "Notifications (F8)":
  - list
- button "Open Next.js Dev Tools":
  - img
- alert
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 | import path from 'path'; // Needed for resolving file paths if saving downloads
   3 | import fs from 'fs'; // Needed for reading/writing files if checking content
   4 |
   5 | test.describe('Portal Document Management - ADMIN', () => {
   6 |   // Log in as ADMIN before each test
   7 |   test.beforeEach(async ({ page }) => {
   8 |     const loginUrl = process.env.PLAYWRIGHT_LOGIN_URL;
   9 |     const emailSelector = process.env.PLAYWRIGHT_EMAIL_SELECTOR;
   10 |     const passwordSelector = process.env.PLAYWRIGHT_PASSWORD_SELECTOR;
   11 |     const submitSelector = process.env.PLAYWRIGHT_SUBMIT_SELECTOR;
   12 |     const username = process.env.PLAYWRIGHT_TEST_USERNAME;
   13 |     const password = process.env.PLAYWRIGHT_TEST_PASSWORD;
   14 |
   15 |     console.log('--- Debugging Environment Variables ---');
   16 |     console.log('PLAYWRIGHT_LOGIN_URL:', loginUrl);
   17 |     console.log('PLAYWRIGHT_EMAIL_SELECTOR:', emailSelector);
   18 |     console.log('PLAYWRIGHT_PASSWORD_SELECTOR:', passwordSelector);
   19 |     console.log('PLAYWRIGHT_SUBMIT_SELECTOR:', submitSelector);
   20 |     console.log('PLAYWRIGHT_TEST_USERNAME:', username);
   21 |     console.log('PLAYWRIGHT_TEST_PASSWORD:', password);
   22 |     console.log('-------------------------------------');
   23 |
   24 |     if (!loginUrl || !emailSelector || !passwordSelector || !submitSelector || !username || !password) {
   25 |       throw new Error('Playwright E2E test environment variables are not fully set. Please check your .env file.');
   26 |     }
   27 |
   28 |     // Increase timeout for initial navigation
   29 |     await page.goto(loginUrl, { timeout: 60000 }); // 60 seconds
   30 |     await page.locator(emailSelector).fill(username);
   31 |     await page.locator(passwordSelector).fill(password);
   32 |     await page.locator(submitSelector).click();
   33 |
   34 |     // Wait specifically for the URL to change to something containing /portal,
   35 |     // giving it more time due to dev server compilation.
>  36 |     await page.waitForURL('**/portal', { timeout: 20000 }); // Increased to 20 seconds
      |                ^ TimeoutError: page.waitForURL: Timeout 20000ms exceeded.
   37 |
   38 |     // After waitForURL succeeds, this assertion should pass quickly.
   39 |     await expect(page).toHaveURL(/.*\/portal/);
   40 |   });
   41 |
   42 |   test('ADMIN user can upload and download a document', async ({ page }) => {
   43 |     test.setTimeout(60000); // Set timeout for this specific test to 60 seconds
   44 |     // 1. Navigate to the specific assignment page
   45 |     const assignmentId = 'test-assignment-id'; // Placeholder ID
   46 |     await page.goto(`/portal/${assignmentId}`);
   47 |     await expect(page).toHaveURL(`/portal/${assignmentId}`); // Confirm navigation
   48 |
   49 |     // 2. Define the file to upload
   50 |     const fileName = `test-upload-${Date.now()}.txt`; // Unique filename
   51 |     const fileContent = 'This is the content of the test file for ADMIN.';
   52 |
   53 |     // 3. Locate the file input element and set the file
   54 |     //    Use setInputFiles for <input type="file">
   55 |     await page.locator('input#document-upload').setInputFiles({
   56 |       name: fileName,
   57 |       mimeType: 'text/plain',
   58 |       buffer: Buffer.from(fileContent),
   59 |     });
   60 |
   61 |     // 4. Click the explicit "Upload Document" button
   62 |     await page.locator('button:has-text("Upload Document")').click();
   63 |
   64 |     // 5. Wait for upload confirmation: the file appears in the documents table
   65 |     //    Locate the table row containing the uploaded filename.
   66 |     //    Increase timeout if uploads/refresh take longer.
   67 |     const uploadedRowLocator = page.locator(`tr:has-text("${fileName}")`);
   68 |     await expect(uploadedRowLocator).toBeVisible({ timeout: 15000 }); // Wait up to 15s
   69 |
   70 |     // 6. Locate the download button *within that specific row*
   71 |     const downloadButtonLocator = uploadedRowLocator.locator('button:has-text("Download")');
   72 |     await expect(downloadButtonLocator).toBeEnabled();
   73 |
   74 |     // 7. Start waiting for the download *before* clicking the button
   75 |     const downloadPromise = page.waitForEvent('download', { timeout: 10000 }); // Wait up to 10s for download start
   76 |     await downloadButtonLocator.click();
   77 |
   78 |     // 8. Wait for the download event to complete
   79 |     const download = await downloadPromise;
   80 |
   81 |     // 9. Assert the downloaded filename is correct
   82 |     expect(download.suggestedFilename()).toBe(fileName);
   83 |
   84 |     // 10. (Optional but recommended) Save and verify content
   85 |     //     This requires a temporary directory accessible by the test runner
   86 |     //     Adjust the path as needed for your environment.
   87 |     const tempDir = path.join(__dirname, '..', 'temp-downloads'); // Example: tests/temp-downloads
   88 |     if (!fs.existsSync(tempDir)) {
   89 |       fs.mkdirSync(tempDir, { recursive: true });
   90 |     }
   91 |     const tempFilePath = path.join(tempDir, download.suggestedFilename());
   92 |
   93 |     try {
   94 |         await download.saveAs(tempFilePath);
   95 |         expect(fs.existsSync(tempFilePath)).toBe(true); // Check file exists
   96 |         const downloadedContent = fs.readFileSync(tempFilePath, 'utf-8');
   97 |         expect(downloadedContent).toBe(fileContent); // Check content matches
   98 |         console.log(`Verified downloaded content for ${fileName}`);
   99 |     } finally {
  100 |         // Clean up the downloaded file
  101 |         if (fs.existsSync(tempFilePath)) {
  102 |             fs.unlinkSync(tempFilePath);
  103 |         }
  104 |     }
  105 |
  106 |   });
  107 |
  108 |   // TODO: Add more tests for different roles (STAFF, PARTNER) and edge cases (errors, etc.)
  109 | }); 
```