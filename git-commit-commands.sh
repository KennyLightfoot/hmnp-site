#!/bin/bash
# Git commands to commit security changes

# 1. First, check the current status
git status

# 2. Add all the changes
git add package.json pnpm-lock.yaml SECURITY_FIX_SUMMARY.md PULL_REQUEST_TEMPLATE.md security-fix.sh webpack-fix.mjs

# 3. Commit the changes with a descriptive message
git commit -m "fix: security vulnerabilities in dependencies

This commit addresses multiple security vulnerabilities:
- Updates axios to 1.13.5 (fixes CVE-2023-45857)
- Updates next to 15.5.12 (fixes CVE-2024-37022)
- Updates nodemailer to 7.0.13 (fixes CVE-2024-32004)
- Adds/updates package overrides for transitive dependencies
- Creates security documentation and fix scripts

Two low-severity webpack issues remain in @sentry/nextjs dependency."

# 4. Push the changes (uncomment when ready)
# git push

# Note: To create a PR directly from these changes, use:
# git checkout -b fix/security-dependencies
# git add package.json pnpm-lock.yaml SECURITY_FIX_SUMMARY.md PULL_REQUEST_TEMPLATE.md security-fix.sh webpack-fix.mjs
# git commit -m "fix: security vulnerabilities in dependencies"
# git push -u origin fix/security-dependencies
# Then create a PR on GitHub using the PULL_REQUEST_TEMPLATE.md content