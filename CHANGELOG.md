## 2025-08-08

- fix(booking): prevent crash when selecting time by hoisting helper functions in `components/booking/InteractivePricingCalculator.tsx` to avoid TDZ/hoisting error (ReferenceError: Cannot access 'L' before initialization)
- chore(booking): standardize datetime construction to ISO format (`YYYY-MM-DDTHH:mm`) in `components/booking/BookingForm.tsx` for reliable parsing across environments

Notes:
- No behavioral changes to pricing logic; only function declaration order adjusted.
- ISO formatting ensures consistent `Date` parsing and avoids locale-dependent issues.

