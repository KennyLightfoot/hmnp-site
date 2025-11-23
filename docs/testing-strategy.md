# Testing Strategy

## Overview

This document outlines the testing strategy for the Houston Mobile Notary Pros booking system, focusing on maintaining high code coverage and ensuring reliability of critical business logic.

## Coverage Goals

### Global Targets
- **Overall Coverage**: 70-80%+ for all code
- **Critical Paths**: 80%+ coverage for business-critical logic
- **Core Services**: 80%+ coverage for pricing, booking validation, and slot reservation

### Per-File Thresholds

#### `lib/pricing-engine.ts`
- **Target**: 70%+ coverage
- **Rationale**: Core pricing logic that directly impacts revenue and customer experience
- **Focus Areas**: 
  - All service types
  - Discount calculations
  - Surcharge calculations
  - Error handling and fallback scenarios
  - Upsell detection logic

#### `lib/booking-validation.ts`
- **Target**: 80%+ coverage
- **Rationale**: Input validation is critical for data integrity and security
- **Focus Areas**:
  - All schema validations
  - State transition validations
  - Service availability checks
  - Edge cases and error handling

#### `lib/slot-reservation.ts`
- **Target**: 100% coverage (maintained)
- **Rationale**: Slot reservation logic must be bulletproof to prevent double-booking

## Testing Approach

### Unit Tests

Unit tests focus on testing individual functions and methods in isolation with mocked dependencies.

**Location**: `tests/unit/`

**Key Principles**:
- Mock external dependencies (database, APIs, Redis)
- Test both happy paths and error scenarios
- Cover edge cases and boundary conditions
- Keep tests fast and deterministic

**Example Structure**:
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup mocks
  });

  describe('MethodName - Happy Path', () => {
    it('should handle normal case', () => {
      // Test implementation
    });
  });

  describe('MethodName - Error Handling', () => {
    it('should handle error case', () => {
      // Test implementation
    });
  });
});
```

### Integration Tests

Integration tests verify that multiple components work together correctly.

**Location**: `tests/api/`

**Key Principles**:
- Test real API endpoints
- Use test database when possible
- Verify end-to-end workflows
- Clean up test data after each test

## Test Coverage by Component

### Pricing Engine (`lib/pricing-engine.ts`)

**Test File**: `tests/unit/pricing-engine-comprehensive.test.ts`

**Coverage Areas**:
- ✅ All service types (STANDARD_NOTARY, EXTENDED_HOURS, LOAN_SIGNING, RON_SERVICES, etc.)
- ✅ Base price calculations
- ✅ Surcharge calculations (after-hours, weekend, priority, same-day)
- ✅ Discount calculations (first-time, referral, promo codes, volume)
- ✅ Travel fee calculations (currently disabled but code tested)
- ✅ Upsell detection logic
- ✅ Error handling and fallback pricing
- ✅ Caching behavior
- ✅ Metadata and request tracking

**Key Test Scenarios**:
- Happy path calculations for each service type
- Error handling when dependencies fail
- Edge cases (zero discounts, negative totals, etc.)
- Factory functions and convenience methods

### Booking Validation (`lib/booking-validation.ts`)

**Test Files**: 
- `tests/unit/booking-validation.test.ts` (existing)
- `tests/unit/booking-validation-uncovered.test.ts` (new)

**Coverage Areas**:
- ✅ All Zod schema validations
- ✅ RON services location type validation
- ✅ Partial validation error handling
- ✅ Slot reservation validation
- ✅ Payment intent validation
- ✅ Booking state transition validation
- ✅ Service availability validation

**Key Test Scenarios**:
- Valid booking data acceptance
- Invalid data rejection with proper error messages
- State transition rules (e.g., PENDING → PAYMENT_PENDING ✓, PENDING → COMPLETED ✗)
- Service availability by time and day
- Edge cases (null, undefined, empty objects)

### Slot Reservation (`lib/slot-reservation.ts`)

**Test Files**: `tests/unit/slot-reservation*.test.ts`

**Coverage**: 100% (maintained)

**Coverage Areas**:
- ✅ Slot creation and reservation
- ✅ TTL expiration handling
- ✅ Conflict detection
- ✅ Cleanup operations

## Running Tests

### Run All Tests
```bash
pnpm test
```

### Run Tests with Coverage
```bash
pnpm test:unit:coverage
```

### Run Specific Test File
```bash
pnpm test tests/unit/pricing-engine-comprehensive.test.ts
```

### Watch Mode
```bash
pnpm test:unit:watch
```

## Coverage Reports

Coverage reports are generated in multiple formats:
- **Text**: Displayed in terminal
- **JSON**: `coverage/coverage-summary.json`
- **HTML**: `coverage/index.html` (open in browser)
- **LCOV**: `coverage/lcov.info` (for CI integration)

## CI Integration

Coverage thresholds are enforced in CI:
- Global minimum: 70% for branches, functions, lines, statements
- Per-file thresholds: As specified in `vitest.config.ts`
- Build fails if thresholds are not met

## Best Practices

### Writing Tests

1. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how it does it
   - Tests should remain valid even if implementation changes

2. **Use Descriptive Test Names**
   - Test names should clearly describe what is being tested
   - Use format: "should [expected behavior] when [condition]"

3. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should calculate correct price', () => {
     // Arrange
     const params = { serviceType: 'STANDARD_NOTARY', ... };
     
     // Act
     const result = engine.calculateBookingPrice(params);
     
     // Assert
     expect(result.total).toBe(75);
   });
   ```

4. **Mock External Dependencies**
   - Mock database calls, API calls, Redis, etc.
   - Keep tests fast and deterministic

5. **Test Edge Cases**
   - Boundary values (min, max, zero)
   - Invalid inputs
   - Error conditions
   - Null/undefined handling

### Maintaining Coverage

1. **Run Coverage Before Committing**
   - Ensure new code has adequate test coverage
   - Fix any coverage regressions

2. **Review Coverage Reports Regularly**
   - Identify untested code paths
   - Prioritize testing critical business logic

3. **Update Tests When Requirements Change**
   - Keep tests in sync with business requirements
   - Remove obsolete tests

## Key Edge Cases to Test

### Pricing Engine
- Zero or negative totals (should be clamped to 0)
- Invalid service types (should use fallback)
- Discount calculation failures (should continue without discount)
- Travel fee calculation failures (should use fallback)
- Large document counts
- Multiple discount types applied together

### Booking Validation
- Invalid date formats
- Past dates (should be rejected)
- Invalid email/phone formats
- Document count exceeding service limits
- Invalid state transitions
- Service availability outside business hours

## Future Improvements

1. **Property-Based Testing**
   - Consider using libraries like fast-check for generating test cases
   - Especially useful for validation logic

2. **Performance Testing**
   - Add benchmarks for critical paths
   - Ensure pricing calculations remain fast

3. **Contract Testing**
   - Test API contracts between services
   - Ensure backward compatibility

4. **Visual Regression Testing**
   - For UI components (if applicable)

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Coverage Thresholds Guide](https://vitest.dev/guide/coverage.html)

