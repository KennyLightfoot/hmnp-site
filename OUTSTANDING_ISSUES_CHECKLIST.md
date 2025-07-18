# Outstanding Issues Checklist

The following items summarize all unresolved problems identified in the latest audit report.
Each item must be resolved before declaring the system production ready.

## Critical Issues

- [ ] **Missing V2 API Endpoints** – `/api/v2/` routes referenced in the codebase do not exist.
- [ ] **BookingForm Validation Bug** – the form validates all steps at once, blocking progression.
- [ ] **Missing Reserve-Slot Endpoint** – `/api/booking/reserve-slot` route is absent.
- [ ] **Broken Availability Endpoint** – `/api/booking/availability` throws runtime errors.

## High Priority Issues

- [ ] **Schema Mismatches** – potential discrepancies between frontend `serviceType` fields and backend `serviceId` expectations.
- [ ] **Documentation Inconsistencies** – deployment docs claim production readiness despite open blockers.

For implementation details see `CRITICAL_ISSUES_AUDIT_REPORT.md` and `FIX_IMPLEMENTATION_PLAN.md`. 