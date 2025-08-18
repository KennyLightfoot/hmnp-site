## Resend v6 Upgrade Plan

Status: Draft

Notes
- Resend 6 includes API changes around email send payload.

Action steps
1) Bump `resend` to ^6 in separate branch.
2) Audit any usage in `lib/email` or API routes.
3) Validate templates and attachments.

Rollback
- Revert to v2 if regressions occur.

