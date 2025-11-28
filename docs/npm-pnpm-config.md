### npm / pnpm Configuration

This project uses **pnpm** as the package manager and relies on a small amount of configuration to keep builds secure and Next.js-friendly.

---

### 1. Package Manager

- **Declared in**: `package.json`
  - `"packageManager": "pnpm@10.x"` (see the exact version in `package.json`).
- **Usage**:
  - Local and CI should use `pnpm` for install, build, and test commands:
    - `pnpm install`
    - `pnpm build`
    - `pnpm test`

---

### 2. Dependency overrides

- **Declared in**: `package.json` under `"overrides"`.
- **Purpose**: Pin and secure a few transitive dependencies without relying on older `.npmrc`-style overrides.
- **Key overrides** (examples, see `package.json` for the full list):
  - `prismjs@<1.30.0` → `>=1.30.0`
  - `brace-expansion@>=1.0.0 <=1.1.11` → `>=1.1.12`
  - `ws` and `tar-fs` pins for tooling like Lighthouse / Puppeteer.
- **Notes**:
  - These overrides are **pnpm-supported** and apply consistently across local dev and CI.
  - The old `.npmrc` line `override.prismjs@<1.30.0>=>=1.30.0` has been removed in favor of this standard mechanism.

---

### 3. Hoisting configuration

- **Declared in**: `.npmrc`
- **Config**:
  - `public-hoist-pattern[]=*@prisma/client*`
  - `public-hoist-pattern[]=*.prisma*`
- **Purpose**:
  - Ensure `@prisma/client` and related `.prisma` artifacts are hoisted in a way that plays nicely with Next.js 15’s bundling and the monorepo/node_modules layout.
- **Behavior**:
  - This affects how pnpm structures the `node_modules` tree but should not produce warnings on modern pnpm.

---

### 4. Local vs CI behavior

- **Local dev**:
  - Use `pnpm install` directly.
  - `.npmrc` hoist patterns apply as usual.
  - `package.json` overrides ensure vulnerable/buggy versions are pinned.
- **CI / Vercel**:
  - Vercel uses the `packageManager` field and `pnpm-lock.yaml` to perform installs.
  - The same overrides and hoist settings apply; no extra Vercel-specific config is required.

---

### 5. Intentional quirks (for reviewers)

- We **do not** use any Yarn-specific or deprecated override syntax anymore.
- All security-sensitive pins (e.g., PrismJS, tar-fs, ws, validator, js-yaml) live in the `overrides` block in `package.json`.
- If pnpm introduces new warnings about config keys in future versions, they should be:
  1. Fixed (preferred), or
  2. Documented here with a short explanation and reference to the upstream issue.


