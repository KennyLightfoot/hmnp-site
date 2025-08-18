## Tailwind CSS v4 Upgrade Plan

Status: Draft (no code changes yet)

What changes
- Tailwind 4 introduces configless setup, PostCSS changes, and new content scanning.

Action steps
1) Bump deps (separate PR will apply):
   - tailwindcss: ^4
   - @tailwindcss/forms, @tailwindcss/typography compatible versions
2) Config:
   - Replace `tailwind.config.js` if present with v4 approach or `tailwind.config.ts` minimal exports.
   - Update `postcss.config.js` per Tailwind 4 docs.
3) Content scanning:
   - Ensure `app/**/*.{ts,tsx}`, `components/**/*.{ts,tsx}` included.
4) CSS entry:
   - Keep `@tailwind base; @tailwind components; @tailwind utilities;` in `styles/globals.css`.
5) Audit class name changes:
   - Verify any removed utilities; adjust if needed.
6) Test:
   - Build and run E2E flows.

Rollback
- Revert to Tailwind 3 by restoring package versions and old configs.

