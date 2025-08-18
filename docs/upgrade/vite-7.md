## Vite v7 Upgrade Plan

Status: Draft

Notes
- Vite 7 requires Node 18+, aligns well with React 19.

Action steps
1) Bump `vite` to ^7 and `@vitejs/plugin-react` to ^5.
2) Verify vitest compatibility (currently ^3.2.x OK).
3) Run unit tests and build.

Rollback
- Revert vite and plugin versions if issues arise.

