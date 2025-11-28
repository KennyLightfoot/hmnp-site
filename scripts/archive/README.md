# Archived One-Time Fix Scripts

This directory contains **historical, one-off fix scripts** that were used
during earlier migration and cleanup phases. They have been removed from the
active `scripts/` root to avoid accidental execution and to keep the current
operational surface area lean.

Key points:

- These scripts are **not** part of normal operations.
- Do **not** wire these into CI/CD, npm scripts, or runbooks.
- If you ever need to see the original implementations, prefer:
  - `git history` for the original versions, or
  - reading the archived stubs here and locating the matching commit.

New migrations or fixes should be implemented as fresh, well-scoped scripts
under `scripts/` with clear documentation, not by reusing these legacy tools.


