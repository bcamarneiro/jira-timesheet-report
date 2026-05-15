# /premium

Source-available code for the paid tier of the product. **Licensed separately from the root of the repository** — see `LICENSE` in this directory.

## License summary (non-binding — `LICENSE` is authoritative)

This directory is licensed under the Business Source License 1.1 (BSL 1.1).

- You **may** read, modify, and self-host this code for personal or internal use.
- You **may not** offer it as a paid or hosted service to third parties before the Change Date.
- On the Change Date (4 years after first commit), the license auto-converts to Apache 2.0.

The rest of the repository (everything outside `/premium/`) is MIT-licensed and unaffected.

## Boundary rules

- Nothing in `/frontend/` may import from `/premium/`. A CI check enforces this.
- Premium-only code that the frontend needs (e.g., auth UI, account page) lives here and is included in the build only when `BUILD_TIER=premium`.
- Free-tier builds (`BUILD_TIER=free`, the default) must produce a working app without any code from this directory.

## Why BSL and not MIT

The Free tier is a complete, useful product on its own. The Premium tier is a paid hosted convenience (the CORS proxy + auth + billing). BSL prevents someone from cloning Premium and reselling it as a competing service while it's actively being developed; it does not restrict end-user or internal-use freedom. After 4 years the code becomes Apache 2.0 — fully open.
