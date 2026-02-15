## Security Updates for HMNP Site

This PR addresses security vulnerabilities in the Houston Mobile Notary Pros site dependencies.

### Changes Made

- Updated direct dependencies with security fixes:
  - axios: ^1.13.5 (fixes CVE-2023-45857)
  - next: ^15.5.12 (fixes CVE-2024-37022)
  - nodemailer: ^7.0.13 (fixes CVE-2024-32004 and CVE-2024-4971)

- Added/updated package overrides for transitive dependencies:
  - tar: >=7.5.7
  - jws: >=3.2.3
  - lodash: >=4.17.23
  - lodash-es: >=4.17.23
  - undici: >=6.23.0
  - preact: >=10.27.3
  - qs: >=6.14.2
  - fast-xml-parser: >=5.3.4
  - webpack: >=5.104.1 (via @sentry/nextjs)

- Created comprehensive documentation:
  - SECURITY_VULNERABILITIES.md: Details all identified vulnerabilities
  - SECURITY_UPDATE_PLAN.md: Documents the update approach
  - SECURITY_FIX_SUMMARY.md: Summarizes changes made and remaining issues

- Added maintenance scripts:
  - security-fix.sh: Applies all security fixes and verifies results
  - webpack-fix.mjs: Specifically addresses webpack vulnerabilities

### Remaining Issues

There are two low-severity webpack vulnerabilities that persist in the @sentry/nextjs dependency chain despite our best efforts to override them. These are not critical and can be addressed in a future update if needed.

### Testing

All unit tests pass, confirming that these security updates do not break existing functionality.

```
Test Files  27 passed (27)
Tests      235 passed | 2 skipped (237)
```

### Next Steps

1. Consider upgrading @sentry/nextjs in a future update to address remaining webpack issues
2. Implement a regular security audit schedule
3. Add dependency scanning to CI/CD pipeline