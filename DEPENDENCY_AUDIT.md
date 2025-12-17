# Dependency Audit Report
**Date:** 2025-12-17
**Project:** hmnp-site

## Executive Summary

This audit identified **9 security vulnerabilities** (1 critical, 3 high), **significant dependency bloat**, and **numerous outdated packages** that should be addressed.

---

## 🚨 Critical Security Vulnerabilities

### 1. Next.js - CRITICAL RCE Vulnerability (CVE-2025-55182)
- **Severity:** Critical (CVSS 10.0)
- **Current Version:** 15.5.6
- **Fixed In:** 15.5.7+
- **Recommended:** 15.5.8+ (fixes all three Next.js vulnerabilities)
- **Impact:** Remote Code Execution in React flight protocol
- **Action:** **IMMEDIATE UPDATE REQUIRED**

### 2. Next.js - HIGH DoS Vulnerability (CVE-2025-55184)
- **Severity:** High (CVSS 7.5)
- **Current Version:** 15.5.6
- **Fixed In:** 15.5.8
- **Impact:** Denial of Service with Server Components
- **Action:** **IMMEDIATE UPDATE REQUIRED**

### 3. Next.js - MODERATE Source Code Exposure (CVE-2025-55183)
- **Severity:** Moderate (CVSS 5.3)
- **Current Version:** 15.5.6
- **Fixed In:** 15.5.8
- **Impact:** Server Actions source code exposure
- **Action:** **IMMEDIATE UPDATE REQUIRED**

### 4. Additional Vulnerabilities
- **jws** (via google-auth-library): LOW - Update available
- **tmp** (via @lhci/cli): LOW - Arbitrary file write via symlink
- **nodemailer**: LOW - Two vulnerabilities requiring review

---

## 📦 Dependency Bloat Issues

### Date/Time Libraries (HIGH PRIORITY)
The project uses **THREE** different date/time libraries simultaneously:

1. **moment** (2.30.1) + **moment-timezone** (0.5.48)
   - ⚠️ Moment.js is in [maintenance mode](https://momentjs.com/docs/#/-project-status/)
   - Legacy library, not recommended for new development
   - Used in 38 files across the project

2. **luxon** (3.7.1) + **@types/luxon**
   - Modern alternative to moment
   - Better for date manipulation

3. **date-fns** (4.1.0) + **date-fns-tz** (3.2.0)
   - Tree-shakeable, functional approach
   - Excellent for modern projects

**Recommendation:**
- **Standardize on `date-fns`** (already on v4, most modern)
- Remove `moment`, `moment-timezone`, `luxon`, and `@types/luxon`
- Migrate all date/time logic to `date-fns`
- **Estimated bundle savings:** ~50-100KB gzipped

### Potential Duplicate/Unnecessary Dependencies

1. **bcrypt** (6.0.0)
   - Check if actually needed or if using Next-Auth's built-in hashing

2. **axios** (1.13.2) + **node-fetch** (3.3.2)
   - Using two HTTP clients
   - Consider standardizing on native `fetch` (available in Node 18+)

3. **body-parser** (2.2.0)
   - Built into Express 4.16+, likely unnecessary

4. **cors** (2.8.5)
   - Check if needed - Next.js API routes handle CORS differently

5. **chalk** (5.6.0)
   - Used for CLI coloring - verify it's actually used in scripts

6. **gtag** (1.0.1)
   - Potentially redundant with `@next/third-parties` (which includes Google Analytics)

---

## 📊 Outdated Packages

### Major Version Updates Available

| Package | Current | Latest | Breaking? | Priority |
|---------|---------|--------|-----------|----------|
| **next** | 15.5.6 | 16.0.10 | Yes | HIGH (security) |
| **@prisma/client** | 6.14.0 | 7.2.0 | Yes | Medium |
| **prisma** | 6.14.0 | 7.2.0 | Yes | Medium |
| **sanity** | 4.6.1 | 5.0.1 | Yes | Medium |
| **@sentry/nextjs** | 9.46.0 | 10.31.0 | Yes | Medium |
| **@stripe/react-stripe-js** | 3.9.0 | 5.4.1 | Yes | Medium |
| **@stripe/stripe-js** | 7.8.0 | 8.6.0 | Yes | Medium |
| **stripe** | 18.4.0 | 20.1.0 | Yes | Medium |
| **tailwindcss** | 3.4.17 | 4.1.18 | Yes | Low |
| **zod** | 3.25.76 | 4.2.1 | Yes | Low |
| **vitest** | 3.2.4 | 4.0.16 | Yes | Low |
| **recharts** | 2.15.4 | 3.6.0 | Yes | Low |
| **resend** | 2.1.0 | 6.6.0 | Yes | Medium |
| **nodemailer** | 6.10.1 | 7.0.11 | Yes | Medium |

### Minor/Patch Updates (Safe to Update)

| Package | Current | Latest | Notes |
|---------|---------|--------|-------|
| **@hookform/resolvers** | 5.2.1 | 5.2.2 | Patch |
| **lucide-react** | 0.533.0 | 0.561.0 | Minor |
| **@tailwindcss/forms** | 0.5.10 | 0.5.11 | Patch |
| **@tailwindcss/typography** | 0.5.16 | 0.5.19 | Patch |
| **@supabase/ssr** | 0.6.1 | 0.8.0 | Minor |
| **moment-timezone** | 0.5.48 | 0.6.0 | Minor (remove instead) |

### Dev Dependencies

| Package | Current | Latest | Notes |
|---------|---------|--------|-------|
| **@lhci/cli** | 0.13.0 | 0.15.1 | Minor |
| **cross-env** | 7.0.3 | 10.1.0 | Major |
| **dotenv** | 16.6.1 | 17.2.3 | Major |
| **dotenv-cli** | 7.4.4 | 11.0.0 | Major |
| **jsdom** | 26.1.0 | 27.3.0 | Major |
| **googleapis** | 150.0.1 | 169.0.0 | Minor |

---

## 🎯 Recommended Actions

### Phase 1: Immediate Security Fixes (Do Now)
```bash
# Update Next.js to fix critical vulnerabilities
pnpm update next@15.5.8

# Update other security-related packages
pnpm update google-auth-library
```

### Phase 2: Remove Duplicate Dependencies (High Priority)
```bash
# Remove moment.js in favor of date-fns
pnpm remove moment moment-timezone luxon @types/luxon

# After migrating all date logic to date-fns
```

**Migration Steps:**
1. Create utility functions for common date operations using `date-fns`
2. Search and replace moment/luxon calls with date-fns equivalents
3. Test thoroughly, especially timezone handling
4. Remove packages after complete migration

### Phase 3: Clean Up Unnecessary Dependencies
```bash
# Remove if not used
pnpm remove body-parser  # Built into Express
pnpm remove gtag         # If using @next/third-parties

# Consider consolidating HTTP clients
# Evaluate: axios vs native fetch
```

### Phase 4: Safe Minor/Patch Updates
```bash
# Update all minor/patch versions safely
pnpm update -i
```

### Phase 5: Major Version Updates (Test Thoroughly)
```bash
# Update one at a time, test after each

# Prisma (coordinate client + CLI)
pnpm update @prisma/client@latest prisma@latest
pnpm prisma generate

# Sentry
pnpm update @sentry/nextjs@latest

# Stripe
pnpm update stripe@latest @stripe/stripe-js@latest @stripe/react-stripe-js@latest

# Sanity
pnpm update sanity@latest next-sanity@latest @sanity/client@latest

# Resend
pnpm update resend@latest
```

### Phase 6: Consider Major Breaking Changes (Lower Priority)
- **Tailwind CSS v4**: Major rewrite, evaluate if worth the migration effort
- **Zod v4**: Review breaking changes before upgrading
- **Next.js 16**: Major version with potential breaking changes

---

## 📈 Expected Improvements

### Security
- ✅ Fix 1 critical, 3 high, 2 moderate vulnerabilities
- ✅ Reduce attack surface by removing unused packages

### Performance
- 📦 Bundle size reduction: ~50-100KB (from date library consolidation)
- ⚡ Faster dependency installation
- 🎯 Fewer transitive dependencies

### Maintenance
- 🔄 Up-to-date dependencies = better support
- 🐛 Bug fixes and performance improvements from updates
- 📚 Better documentation for current versions

---

## ⚠️ Risks & Considerations

### Breaking Changes
- Next.js 15.5.8 should be backward compatible (patch version)
- Major version updates (Prisma, Sentry, Stripe) require testing
- Date library migration requires comprehensive testing

### Testing Strategy
1. Update Next.js immediately (security critical)
2. Run full test suite after each phase
3. Test in staging environment before production
4. Monitor error tracking (Sentry) after deployment
5. Have rollback plan ready

---

## 🔍 Additional Findings

### Package.json Issues

1. **Inconsistent `@types/node` versions**
   - dependencies: `24.1.0`
   - devDependencies: `20.16.2`
   - **Fix:** Remove from dependencies, keep only in devDependencies

2. **Override complexity**
   - Many overrides in package.json suggest transitive dependency issues
   - Some may be obsolete after updates

### Recommendations for Future

1. **Dependency Management**
   - Use `pnpm-update-interactive` regularly
   - Set up Dependabot or Renovate for automated updates
   - Review dependencies quarterly

2. **Bundle Analysis**
   - Run bundle analyzer regularly: `webpack-bundle-analyzer`
   - Monitor bundle size in CI/CD
   - Consider code splitting for large dependencies

3. **Security Scanning**
   - Add `pnpm audit` to CI/CD pipeline
   - Set up automated security alerts
   - Review `overrides` periodically

---

## 📋 Implementation Checklist

- [ ] **CRITICAL:** Update Next.js to 15.5.8 or later
- [ ] Update google-auth-library (jws vulnerability)
- [ ] Create date-fns utility wrapper functions
- [ ] Migrate moment.js usage to date-fns (38 files)
- [ ] Migrate luxon usage to date-fns
- [ ] Remove moment, moment-timezone, luxon packages
- [ ] Remove body-parser if unused
- [ ] Consolidate HTTP clients (axios vs fetch)
- [ ] Fix @types/node duplication
- [ ] Update safe minor/patch versions
- [ ] Plan and test major version updates
- [ ] Review and clean up package.json overrides
- [ ] Set up automated dependency monitoring
- [ ] Document dependency update policy

---

## Summary Statistics

- **Total Dependencies:** 2,412 (including transitive)
- **Direct Dependencies:** 125
- **Dev Dependencies:** 28
- **Security Vulnerabilities:** 9 (1 critical, 3 high, 2 moderate, 3 low)
- **Packages with Major Updates:** 20+
- **Packages with Minor/Patch Updates:** 15+
- **Identified Bloat Issues:** 3 duplicate date libraries, 4+ potentially unused packages
