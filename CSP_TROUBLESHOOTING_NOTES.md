# CSP Troubleshooting Notes (Post-Commit afa7775)

This document summarizes the issues encountered after commit `afa77751118b8ac3c3b3905bf419e73b96044fd7` while attempting to resolve Content Security Policy (CSP) errors.

**Problem Summary:**

Attempts to refine the CSP after commit `afa7775` led to the application rendering a blank white screen on Vercel deployments, despite still showing CSP violations in the browser console.

**Key Observations:**

1.  **Initial State (Commit `afa7775`):** The application was functional, but generated CSP errors related to inline scripts and styles (`'unsafe-inline'`).
2.  **CSP Modifications:** Various attempts were made to tighten the CSP, including:
    *   Removing `'unsafe-inline'` from `script-src` and `style-src`.
    *   Using nonces for script tags (implemented via `next.config.js` middleware).
    *   Experimenting with static hashes (later removed).
3.  **Dependency Updates:** Investigation revealed that dependency updates occurring *after* commit `afa7775` were correlated with the blank screen issue, even when CSP changes were reverted. Specifically, updates between the working deployment and the broken one seemed to be the primary cause, rather than the CSP changes themselves.
4.  **Blank Screen Issue:** The primary symptom was a blank white screen, indicating a critical rendering failure, potentially related to JavaScript errors triggered by the interplay of updated dependencies and CSP restrictions, even when `'unsafe-inline'` was temporarily re-added.

**Conclusion:**

The blank screen issue appears linked to dependency updates made after commit `afa7775`. While tightening the CSP is still a goal, resolving the underlying rendering problem caused by these updates is the priority. Future attempts to modify the CSP should be done cautiously, ideally *after* identifying and fixing the conflict introduced by the dependency updates.

**Next Steps:**

1.  Identify the specific dependency updates causing the rendering failure.
2.  Resolve the conflicts introduced by these updates.
3.  Re-address CSP refinement, likely starting with nonce-based approaches for scripts and styles.

**Update (Date of this attempt):**

*   After reverting to `afa7775`, the site still showed a blank screen and CSP errors in Vercel deployments.
*   Errors indicated blocks related to inline scripts/styles, Vercel Analytics (`va.vercel-scripts.com`), Vercel Toolbar/Feedback (`vercel.live`), and potential WebSocket issues (`Connection closed`).
*   Modified `middleware.ts` to allow `va.vercel-scripts.com`, `vercel.live`, and `wss:` in relevant CSP directives. This restored site visibility but broke some form functionality (booking page dropdowns/radio buttons).
*   Console errors now showed scripts blocked due to `'strict-dynamic'` overriding `'self'`, and continued inline script/style blocks.
*   Attempted adding `'unsafe-inline'` alongside the nonce, but browser security rules ignore `'unsafe-inline'` when a nonce is present, resulting in a blank screen again.
*   **Current Approach:** Removed nonce generation and `'strict-dynamic'`. Simplified CSP to use `'unsafe-inline'` for both `script-src` and `style-src` as a temporary measure to restore full functionality. Added `frame-src` for `vercel.live`. 