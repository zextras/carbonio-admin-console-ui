# Dependency Update Recommendations

Analysis of all 16 `package.json` files across the monorepo.
Generated from `pnpm outdated --recursive` on `devel` branch.

---

## Phase 1 — Safe, Low-Risk Updates

### 1. Remove `@babel/plugin-proposal-class-properties` from all 11 apps

**Current:** 7.18.6 | **Status:** Deprecated — merged into `@babel/plugin-transform-class-properties`

**Affected workspaces:**
- admin-ui-backup
- admin-ui-cos
- admin-ui-dashboard
- admin-ui-domains
- admin-ui-legalhold
- admin-ui-mta
- admin-ui-notifications
- admin-ui-operations
- admin-ui-privacy
- admin-ui-storage
- admin-ui-subscription

Likely unused already. Modern Babel handles this natively.

### 2. Update `@types/node`

**Current:** 22.19.19 | **Latest:** 25.9.1

Type-only package, zero runtime risk. Update in:
- `apps/admin-ui-bootstrap`
- `packages/ui-shared`

### 3. Update `eslint-plugin-notice`

**Current:** 0.9.10 | **Latest:** 1.0.0

Only in `packages/ui-components`.

---

## Phase 2 — Tooling Updates (medium effort, good ROI)

### 4. ESLint 9 → 10 + `@eslint/js` 10

**eslint:** 9.39.4 → 10.4.0 (14 workspaces)
**@eslint/js:** 9.39.4 → 10.0.1 (root)

> **BLOCKED** — `eslint-plugin-react@7.37.5` is incompatible with ESLint 10
> (`contextOrFilename.getFilename is not a function`). The plugin's `next` tag
> (`7.8.0-rc.0`) may resolve this. Revisit once `eslint-plugin-react` releases
> stable ESLint 10 support. Also blocked: `eslint-plugin-react-hooks`,
> `eslint-plugin-jsx-a11y` (same peer dep issue).

### 5. `eslint-plugin-react-hooks` 5 → 7

**Current:** 5.2.0 | **Latest:** 7.1.1

Root `devDependencies`. Update alongside ESLint.

### 6. `eslint-plugin-simple-import-sort` 12 → 13

**Current:** 12.1.1 | **Latest:** 13.0.0

Root `devDependencies`. Minor config adjustments may be needed.

### 7. `jsdom` 26 → 29

**Current:** 26.1.0 | **Latest:** 29.1.1

Dev-only, test-only impact. 13 workspaces affected.

### 8. `knip` 5 → 6

**Current:** 5.88.1 | **Latest:** 6.14.1

Root `devDependencies`. Check CLI flags for changes.

### 9. `del` 7 → 8

**Current:** 7.1.0 | **Latest:** 8.0.1

Only in `packages/ui-components` `devDependencies`.

### 10. `vite-plugin-svgr` 4 → 5

**Current:** 4.5.0 | **Latest:** 5.2.0

Root `devDependencies`.

---

## Phase 3 — Core Library Major Updates (high effort, test thoroughly)

### 11. `zustand` 4 → 5 ✅

**Current:** ~~4.5.7~~ 5.0.13 | **Latest:** 5.0.13

Breaking API changes in store creators. 13 workspaces affected.

Migration: No source code changes needed. The `create()` API, `devtools` middleware,
and `set(state, replace, action)` pattern are all backward-compatible in v5.
The mock file (`__mocks__/zustand.ts`) already used v5-compatible APIs (`getInitialState`).
Peer dependency `use-sync-external-store >=1.2.0` was already satisfied (1.6.0).

### 12. `i18next` 22 → 26 + `react-i18next` 12 → 17 + `i18next-http-backend` 3 → 4

| Package | Current | Latest |
|---|---|---|
| i18next | 22.5.1 | 26.2.0 |
| react-i18next | 12.3.1 | 17.0.8 |
| i18next-http-backend | 3.0.6 | 4.0.0 |

Update together — these are tightly coupled. Major API changes expected.
13 workspaces for i18next/react-i18next, 2 for i18next-http-backend.

### 13. `immer` 10 → 11

**Current:** 10.2.0 | **Latest:** 11.1.8

13 workspaces. Check for produce/recipe API changes.

### 14. `ua-parser-js` 1 → 2

**Current:** 1.0.41 | **Latest:** 2.0.10

Only 2 workspaces:
- `apps/admin-ui-bootstrap`
- `packages/ui-shared`

---

## Phase 4 — Build Tooling (validate with full build)

### 15. `pnpm` 10 → 11

**Current:** 10.33.4 | **Latest:** 11.1.3

Update `packageManager` field in root + all lockfile references.
Also remove `pnpm` from `dependencies` in individual workspaces (see cleanup notes below).

### 16. `vite` 7 → 8

**Current:** 7.3.3 (ui-shared) / 8.0.x (bootstrap) | **Latest:** 8.0.13

Align both workspaces to vite 8:
- `packages/ui-shared` — currently `^7.2.6`
- `apps/admin-ui-bootstrap` — already `^8.0.0`

### 17. `@vitejs/plugin-react` 5 → 6

**Current:** 5.2.0 | **Latest:** 6.0.2

3 workspaces: root, ui-shared, bootstrap. Update alongside vite.

### 18. `@tsconfig/vite-react` 7 → 8

**Current:** 7.0.2 | **Latest:** 8.0.6

Root `devDependencies` only.

---

## Cleanup Notes

### Misplaced dependencies

- **`pnpm` is in `dependencies`** of 11 workspaces — it should not be a runtime dependency. Move to `devDependencies` or remove entirely (root `packageManager` field suffices).
- **`@vitest/browser-preview` is in `dependencies`** of several apps — it's a dev tool. Move to `devDependencies`.

### Version inconsistencies

- **`react`**: `admin-ui-test-utils` uses `^19.2.3` while all others use `^19.1.0`. Align to `^19.1.0`.
- **`vite`**: `ui-shared` uses `^7.2.6` while `bootstrap` uses `^8.0.0`. Align both to `^8.0.0` (Phase 4).

---

## Full Outdated Summary

| Package | Current | Latest | Scope | Phase |
|---|---|---|---|---|
| `@babel/plugin-proposal-class-properties` | 7.18.6 | Deprecated | 11 apps | 1 |
| `@types/node` | 22.19.19 | 25.9.1 | 2 workspaces | 1 |
| `eslint-plugin-notice` | 0.9.10 | 1.0.0 | ui-components | 1 |
| `eslint` | 9.39.4 | 10.4.0 | 14 workspaces | 2 |
| `@eslint/js` | 9.39.4 | 10.0.1 | root | 2 |
| `eslint-plugin-react-hooks` | 5.2.0 | 7.1.1 | root | 2 |
| `eslint-plugin-simple-import-sort` | 12.1.1 | 13.0.0 | root | 2 |
| `jsdom` | 26.1.0 | 29.1.1 | 13 workspaces | 2 |
| `knip` | 5.88.1 | 6.14.1 | root | 2 |
| `del` | 7.1.0 | 8.0.1 | ui-components | 2 |
| `vite-plugin-svgr` | 4.5.0 | 5.2.0 | root | 2 |
| `zustand` | 4.5.7 | 5.0.13 | 13 workspaces | 3 |
| `i18next` | 22.5.1 | 26.2.0 | 13 workspaces | 3 |
| `react-i18next` | 12.3.1 | 17.0.8 | 13 workspaces | 3 |
| `i18next-http-backend` | 3.0.6 | 4.0.0 | 2 workspaces | 3 |
| `immer` | 10.2.0 | 11.1.8 | 13 workspaces | 3 |
| `ua-parser-js` | 1.0.41 | 2.0.10 | 2 workspaces | 3 |
| `pnpm` | 10.33.4 | 11.1.3 | 13 workspaces | 4 |
| `vite` | 7.3.3 | 8.0.13 | ui-shared | 4 |
| `@vitejs/plugin-react` | 5.2.0 | 6.0.2 | 3 workspaces | 4 |
| `@tsconfig/vite-react` | 7.0.2 | 8.0.6 | root | 4 |
