## 2025-08-08

- fix: include `types/**/*.d.ts` and `types/**/*.ts` in `tsconfig.json` so NextAuth session augmentation (`types/next-auth.d.ts`) is recognized during build
- fix: replace nonexistent `BookingStatus.CANCELLED` with `CANCELLED_BY_CLIENT` and `CANCELLED_BY_STAFF` in `app/api/booking/create/route.ts`

### Booking → GHL reliability

- fix(booking): fallback to env-based calendar mapping via `getCalendarIdForService` when `service.externalCalendarId` is missing in `app/api/booking/create/route.ts`
- feat(booking): if appointment creation fails, auto-create a GHL Opportunity to trigger workflows; keeps owners notified even on calendar misconfig
- chore(booking): ensure contact is created/ensured once and reused for both appointment/opportunity

Impact: resolves Vercel build failure due to missing `session.user.id` type and Prisma enum mismatch; local type check passes.

### Booking + GHL integration tweaks

- fix: GHL contact search now uses page/pageLimit (was sending invalid `limit`)
- fix: Removed "Popular Areas" quick-select from `components/booking/steps/LocationStep.tsx`
- fix: Removed "Popular" label in `SchedulingStep` and disabled in `EnhancedSchedulingStep`
- feat: Create GHL appointment immediately during booking creation (also still queued). Adds proper `endTime` per API

## 2025-08-08

- fix(booking): prevent crash when selecting time by hoisting helper functions in `components/booking/InteractivePricingCalculator.tsx` to avoid TDZ/hoisting error (ReferenceError: Cannot access 'L' before initialization)
- chore(booking): standardize datetime construction to ISO format (`YYYY-MM-DDTHH:mm`) in `components/booking/BookingForm.tsx` for reliable parsing across environments

Notes:
- No behavioral changes to pricing logic; only function declaration order adjusted.
- ISO formatting ensures consistent `Date` parsing and avoids locale-dependent issues.


## 2025-08-08T14:04:18Z
- fix: success page only uses real local booking.id; prevents 404 on /api/booking/[id]
- fix: add LocationId header for GHL API requests to stabilize appointment/opportunity creation
