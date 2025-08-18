## Sanity v4 + next-sanity v10 Upgrade Plan

Status: Draft

Key changes
- Sanity 4 is a new major; next-sanity 10 aligns with Next.js 14+.

Action steps
1) Bump deps in separate branch:
   - sanity: ^4
   - next-sanity: ^10
2) Update Sanity config and client creation per new APIs.
3) Audit Studio commands (`sanity dev/build/deploy`).
4) Verify any `@sanity/preview-kit` usage with React 19.

Testing
- Run studio locally, publish draft content, confirm GROQ queries.

Rollback
- Revert versions and config on failure.

