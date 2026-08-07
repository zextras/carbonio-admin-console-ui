# CO-4107 — Modernize admin-ui-dashboard: Improvement Plan

**Ticket:** [CO-4107](https://zextras.atlassian.net/browse/CO-4107) — *Modernize admin-ui-dashboard architecture to match admin-ui-cos standards*
**Related:** [CO-3770](https://zextras.atlassian.net/browse/CO-3770) (COS refactor — Done)
**Type:** Technical Improvement | **Status:** In Progress | **Sprint:** S16/26

## Ticket Summary

Refactor `apps/admin-ui-dashboard` to align with the architecture and conventions established in the refactored `admin-ui-cos` module. The dashboard is a small, contained module (~13 source files), making this a lower-risk refactor.

### Acceptance Criteria

1. Zero `useMemo`/`useCallback`/`FC` usage — React Compiler compliant.
2. No `any` in module source.
3. Centralized query-key factory; typed services/hooks layer.
4. Test coverage >= 80% (currently ~74%; server-list view at 1.1%).
5. All existing tests pass; lint and type-check clean.

---

## Suggested Improvements

### Tier 1 — Acceptance Criteria Blockers

| # | Area | Files | Detail |
|---|------|-------|--------|
| 1 | **Remove `FC`** (8 components) | `app.tsx`, `app-view.tsx`, `dashboard-view.tsx`, `quick-access-view.tsx`, `dashboard-notification.tsx`, `dashboard-server-list-view.tsx`, `carbonio-version-information-view.tsx`, `license-banner.tsx` | Replace `const X: FC<...> = (...) =>` with `function X({...}: XProps)` + named `type` definitions |
| 2 | **Remove `useMemo` (3) / `useCallback` (4)** | `app.tsx`, `dashboard-view.tsx`, `dashboard-server-list-view.tsx`, `license-banner.tsx` | React Compiler handles memoization; these are redundant |
| 3 | **Named exports** (6 files) | All except `app-view.tsx`, `license-banner.tsx` | Convert `export default` to named exports |
| 4 | **Extract `HomeTooltipView`** | `app.tsx:21-33` | Component defined inside `useCallback` — extract to module-level function |
| 5 | **Eliminate `any`** | `dashboard-server-list-view.tsx:38,96,103` | Type server rows and table headers with proper domain types |
| 6 | **Centralize query keys** | `hooks/use-server-version.ts` | Promote inline `serverVersionQueryKeys` into a `services/query-keys.ts` module |
| 7 | **Type service responses** | New `services/` layer | Discriminated `success/error` unions for all API responses |

### Tier 2 — Correctness & Quality

| # | Area | Files | Detail |
|---|------|-------|--------|
| 8 | **Fix React key collision** (BUG) | `dashboard-server-list-view.tsx:60,74,90` | Three sibling columns share `key={item?.name}` — make keys unique per column |
| 9 | **Remove derived-state effects** | `dashboard-view.tsx:64-70,80-92` | `userName` and `hasListServerRights` should be computed during render, not via `useEffect`+`useState` |
| 10 | **Replace hand-rolled event types** | `dashboard-server-list-view.tsx:49,62,76,91` | `{ stopPropagation: () => void }` → `React.MouseEvent` or rely on inference |
| 11 | **Fix naming typos** | Multiple | `goToMailNotificationt` → `goToMailNotification`, `sethasListServerRights` → `setHasListServerRights`, `licenseBannerProps` → `LicenseBannerProps`, i18n key `cumminity_edition` → `community_edition` |
| 12 | **Remove no-op Suspense** | `app-view.tsx` | `<Suspense>` wraps a statically-imported component with no suspense source — either use `React.lazy` or remove |

### Tier 3 — Accessibility & Testing

| # | Area | Files | Detail |
|---|------|-------|--------|
| 13 | **Keyboard a11y on clickable cards** | `quick-access-view.tsx:114-130` | Add `role="button"`, `tabIndex={0}`, `onKeyDown` handler |
| 14 | **Fix `getByTestId` in browser tests** | `license-banner.browser.test.tsx` | Add `aria-label` to close button, query via `getByRole('button', { name: ... })` |
| 15 | **Add server-list browser tests** | New `dashboard-server-list-view.browser.test.tsx` | Currently at 1.1% coverage — render table, assert rows, test advanced mode toggle |
| 16 | **Add community-edition test** | `carbonio-version-information-view.tsx` | Untested branch |

### Tier 4 — Housekeeping (Optional)

- Extract repeated `'--ds-text-font-size'` style casts in `carbonio-version-information-view.tsx` to a shared constant
- Replace ambient `declare const BASE_PATH` with typed config import
- Audit `package.json` for unused deps (`react-csv`, `qrcode.react`, `lodash-es`, `immer`, `zod`, `posthog-js`, `tailwindcss`, `clsx`, etc.)

---

## Current Codebase Overview

```
src/
├── app.tsx                                    # Microfrontend entry; registers DASHBOARD route
├── index.ts                                   # ESM re-export (default export)
├── constants.ts                               # Route IDs, section IDs, flags
├── globals.d.ts                               # declare module '*.properties'
├── custom.d.ts                                # declare module '*.svg' / '*.json' (typed as any)
├── hooks/
│   ├── use-server-version.ts                  # TanStack Query hook → fetches /.version
│   └── tests/
│       └── use-server-version.test.tsx        # Unit tests (jsdom)
└── views/
    ├── app-view.tsx                           # Page shell (PageHeader + Dashboard)
    ├── dashboard/
    │   ├── dashboard-view.tsx                 # Main dashboard composition
    │   ├── carbonio-version-information-view.tsx
    │   ├── quick-access-view.tsx              # Domain Accounts / Distribution List cards
    │   ├── dashboard-notification.tsx         # Advanced-only notifications panel
    │   ├── dashboard-server-list-view.tsx     # Mailstore servers table
    │   ├── license-banner.tsx                 # Maintenance expiry/expired/invalid banner
    │   └── tests/
    │       └── license-banner.browser.test.tsx
    └── tests/
        └── app-view.browser.test.tsx
```

**Patterns:** No local Zustand store. Server state via TanStack React Query + shared hooks from `@zextras/ui-shared`. Routing via react-router v8. i18n via react-i18next. Carbonio Design System custom elements (`ds-icon`, `ds-text`, `ds-divider`, `ds-spinner`).
