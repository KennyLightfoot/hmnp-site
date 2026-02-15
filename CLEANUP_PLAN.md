# Repository Cleanup Plan

This document outlines the remaining cleanup and organization tasks for the Houston Mobile Notary Pros codebase.

## Completed Cleanup Tasks

✅ Basic repository cleanup with `cleanup-standard.sh`:
- Removed sensitive credential files
- Removed Python virtual environments (venv-ads/)
- Removed backup directories
- Removed business documents (PDFs, docx)
- Removed duplicate files
- Organized root files into proper directories
- Updated .gitignore
- Removed build artifacts and junk files

✅ Documentation organization:
- Created documentation index
- Added architecture documentation
- Added API documentation
- Organized script documentation

✅ BlueNotary RON integration:
- Added RON API routes
- Created RON dashboard component
- Updated environment variables
- Added integration documentation

## Remaining Tasks

### 1. Code Quality Improvements

- [ ] Fix remaining TypeScript errors
  ```bash
  pnpm tsc --noEmit
  ```

- [ ] Fix ESLint issues
  ```bash
  pnpm lint
  ```

- [ ] Remove remaining unused code
  ```bash
  npx ts-prune
  ```

- [ ] Update dependencies to latest versions
  ```bash
  npx npm-check-updates -u
  pnpm install
  ```

### 2. Database Optimization

- [ ] Review and optimize database schema
  ```bash
  pnpm prisma format
  ```

- [ ] Add missing indexes for performance
  ```bash
  pnpm prisma db execute --file scripts/optimize-database.sql
  ```

- [ ] Clean up unused database tables/columns
  ```bash
  # Create migration for cleanup
  pnpm prisma migrate dev --name cleanup_unused_tables
  ```

### 3. Performance Optimization

- [ ] Analyze and optimize bundle size
  ```bash
  pnpm build
  pnpm analyze
  ```

- [ ] Implement proper code splitting for pages
- [ ] Add image optimization for large images
- [ ] Implement proper caching strategies

### 4. Security Enhancements

- [ ] Rotate all credentials in environment variables (they're in git history)
- [ ] Review and enhance rate limiting
- [ ] Add additional CSRF protection
- [ ] Implement proper content security policy
- [ ] Use BFG Repo Cleaner to purge secrets from history

### 5. Testing Improvements

- [ ] Increase test coverage
- [ ] Add integration tests for critical flows
- [ ] Add end-to-end tests with Playwright

### 6. Documentation Enhancements

- [ ] Create comprehensive developer onboarding guide
- [ ] Document all API endpoints
- [ ] Update deployment procedures
- [ ] Create troubleshooting guide

## Implementation Plan

### Phase 1: Security & Immediate Concerns

1. Rotate all credentials
2. Fix critical TypeScript/ESLint errors
3. Implement additional security measures

### Phase 2: Performance & Code Quality

1. Remove unused code
2. Optimize bundle size
3. Update dependencies
4. Implement proper caching

### Phase 3: Database & Testing

1. Optimize database schema
2. Add missing indexes
3. Clean up unused tables
4. Increase test coverage

### Phase 4: Documentation & Tooling

1. Enhance documentation
2. Add developer tooling
3. Create proper CI/CD pipeline

## Monitoring & Validation

After each phase, validate the changes with:

1. Full test suite execution
2. Lighthouse performance tests
3. Security scanning
4. Manual testing of critical flows

## Long-Term Maintenance

Implement the following ongoing practices:

1. Regular dependency updates (monthly)
2. Code quality checks in CI pipeline
3. Performance regression testing
4. Security scanning
5. Documentation updates with significant changes