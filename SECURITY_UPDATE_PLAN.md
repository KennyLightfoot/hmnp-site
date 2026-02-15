# Security Update Plan

This document outlines the plan to address the security vulnerabilities identified in the HMNP site repository.

## Identified Vulnerabilities

According to the security audit, there are 24 vulnerabilities:
- 12 high severity
- 5 moderate severity
- 7 low severity

## Key Packages to Update

### High Severity

1. **next**: Update to at least v15.5.10
   - Current: ^15.5.9
   - Target: ^15.5.10
   - Fixes: HTTP request deserialization DoS and Image Optimizer vulnerabilities

2. **axios**: Update to at least v1.13.5
   - Current: ^1.13.2
   - Target: ^1.13.5
   - Fixes: Denial of Service vulnerability via __proto__ key in mergeConfig

3. **jsonwebtoken/jws**: Update jsonwebtoken which includes jws
   - Needs investigation of current version and dependencies

4. **nodemailer**: Update to at least v7.0.11
   - Current: ^6.10.1
   - Target: ^7.0.11
   - Fixes: DoS vulnerability caused by recursive calls and email interpretation conflict

5. **tar** (via sanity): May require updating sanity packages
   - Used by `sanity>@sanity/export>tar`
   - Target: >=7.5.7

### Moderate Severity

1. **lodash/lodash-es**: Update dependencies that use these packages
   - Used by multiple packages including @sanity/* packages
   - Affected versions: <=4.17.22
   - Target: >=4.17.23

2. **undici**: Needs update via dependent packages
   - Used by `sanity>@sanity/cli>@sanity/template-validator>@actions/core>@actions/http-client>undici`
   - Target: >=6.23.0

### Low Severity

1. **tmp**: Already addressed in overrides (0.2.4)
2. **diff**: Used by ts-node
3. **webpack**: Used by @sentry/webpack-plugin
4. **qs**: Used by express and superagent

## Update Strategy

1. **Direct Updates**: Update packages we directly depend on:
   - next
   - axios
   - nodemailer

2. **Override Updates**: Update the overrides section in package.json for transitive dependencies:
   - Add/update overrides for tar, jws, undici, lodash, lodash-es

3. **Test Each Change**: After each update, run tests to ensure no functionality is broken:
   ```bash
   pnpm test
   ```

## Implementation Plan

Let's create an updated package.json with the necessary changes:

```json
"dependencies": {
  "axios": "^1.13.5",
  "next": "^15.5.10", 
  "nodemailer": "^7.0.11"
},
"overrides": {
  "tar": ">=7.5.7",
  "prismjs@<1.30.0": ">=1.30.0",
  "brace-expansion@>=1.0.0 <=1.1.11": ">=1.1.12",
  "ws": "8.17.1",
  "jws": ">=3.2.3",
  "lodash": ">=4.17.23",
  "lodash-es": ">=4.17.23",
  "undici": ">=6.23.0",
  "preact": ">=10.27.3",
  "@isaacs/brace-expansion": ">=5.0.1",
  "qs": ">=6.14.2",
  "fast-xml-parser": ">=5.3.4"
}
```

After updating these dependencies, we'll need to run another security audit to confirm all vulnerabilities have been addressed.

## Post-Update Verification

1. Run security audit:
   ```bash
   pnpm audit
   ```

2. Run tests to ensure functionality:
   ```bash
   pnpm test:unit
   ```

3. Build the application to check for any build issues:
   ```bash
   pnpm build:safe
   ```