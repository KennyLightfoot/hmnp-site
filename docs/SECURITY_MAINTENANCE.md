# Security Maintenance Guide

This document outlines best practices for maintaining security in the HMNP site repository.

## Regular Security Audits

Implement a regular security audit schedule:

```bash
# Run a basic security audit
pnpm audit

# Run a more comprehensive audit including moderate-level issues
pnpm security-audit
```

## Automated Security Checks

1. **Pre-commit Hooks**: Use the existing Husky pre-commit hooks to scan for secrets and vulnerabilities:

```bash
# Run git secret scanning
pnpm security:scan:staged
```

2. **CI Pipeline**: Add security scanning to your CI pipeline:

```yaml
# Example GitHub Actions job
security-scan:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '20'
    - run: npm install -g pnpm
    - run: pnpm install
    - run: pnpm audit
    - run: pnpm security:scan
```

## Dependency Management

### Regular Updates

Schedule regular dependency updates:

```bash
# Update all dependencies to their latest compatible version
pnpm up

# Update a specific dependency
pnpm up <package-name>
```

### Version Pinning

Pin critical dependencies to exact versions to avoid unexpected changes:

```json
"dependencies": {
  "critical-package": "1.2.3"
}
```

### Overrides

Use overrides for transitive dependencies with known issues:

```json
"overrides": {
  "vulnerable-package": "safe-version"
}
```

## Vulnerability Response

When a vulnerability is identified:

1. Assess the severity and impact
2. Document the vulnerability
3. Update the affected dependency
4. Test thoroughly
5. Deploy the fix
6. Document the resolution

## Security-Related Scripts

The repository includes several security-related scripts:

- `scripts/update-security-dependencies.sh`: Update dependencies to fix security vulnerabilities
- `scripts/scan-git-secrets.sh`: Scan the repository for secrets
- `scripts/security-audit.sh`: Perform a comprehensive security audit

## Best Practices

### Environment Variables

- Never commit `.env` files
- Use `.env.example` to document required variables
- Regularly rotate secrets

### API Security

- Use rate limiting for all public endpoints
- Implement proper validation for all inputs
- Use HTTPS for all external communications
- Implement proper CORS policy

### Authentication

- Keep authentication libraries up-to-date
- Use secure password hashing (bcrypt)
- Implement proper JWT validation
- Use short-lived tokens

### File Uploads

- Validate file types and sizes
- Scan uploaded files for malicious content
- Store files outside the web root
- Use unique, non-predictable filenames

## Resources

- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [OWASP Top 10 for Web Applications](https://owasp.org/www-project-top-ten/)
- [Next.js Security Documentation](https://nextjs.org/docs/authentication)
- [GitHub's Security Overview](https://docs.github.com/en/code-security)

## Reporting Security Issues

If you discover a security issue, please report it responsibly:

1. Do not disclose the issue publicly until it has been addressed
2. Report the issue directly to the repository owner
3. Provide detailed information about the vulnerability
4. Allow a reasonable time for the issue to be fixed before disclosure

## Security Update History

| Date | Vulnerabilities Fixed | PR/Commit |
|------|----------------------|-----------|
| 2026-02-15 | Multiple high severity issues (Next.js, Axios, Nodemailer, etc.) | [Update security dependencies](#) |

## Contacts

For security-related questions or concerns, contact:
- Kenny Lightfoot (KennyLightfoot@github.com)