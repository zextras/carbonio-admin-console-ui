# CO-4146 — `global-delegates.tsx` Deep Refactor Design

Branch: `CO-4146-refactor-global-administrators`
Parent effort: CO-4140 (admin-ui-domains modernization), roadmap task 3.5 area.
Approved scope (user): **Deep refactor** — view modernization + typed account model + component extraction. No data-flow restructuring, no changes to `accountListDirectory` or its other consumers.

## Goals

- Bring `apps/admin-ui-domains/src/views/domain/global-delegates.tsx` to repo standards (AGENTS.md): named arrow-function export, zero `useMemo`/`useCallback`/`FC`/default export (file is already in the strict ESLint block, `eslint.config.js:100`), no `any`.
- Migrate all deprecated `Container`/`Row` usages (~20) to `<div>` + co-located CSS module (AGENTS.md §Deprecated Layout Components) — opportunistic migration while the file is being modified.
- Type the admin-account data model in the React Query hook.
- Extract the empty-state and pagination footer into small sibling components.
- Keep behavior and visuals identical; existing 12 characterization browser tests stay green unchanged (aside from the import statement).

## 1. Service typing — `src/services/use-admin-account-list.ts`

- Export `type AdminAccount` — the flattened SOAP entry consumed by the view:
  - known fields: `id: string; name: string; description?: string;` and `zimbraIsAdminAccount?, zimbraIsDelegatedAdminAccount?, zimbraIsExternalVirtualAccount?, zimbraIsSystemAccount?: string | undefined` (SOAP `TRUE`/`FALSE` strings)
  - index signature `[key: string]: unknown` for the remaining flattened attrs (matches `EditAccountProps['account']` which accepts `{ id; name; [key: string]: any }`).
- Type the raw wire shape: `type RawDirectoryEntry = { id: string; name?: string; a?: Array<{ n: string; _content: string }> }`.
- `flattenAttrs: (item: RawDirectoryEntry) => AdminAccount` (pure module function, unit-testable).
- `AdminAccountListResult.accounts: Array<AdminAccount>`.
- `accountListDirectory` and its 3 other consumers (`manage-accounts.tsx`, `manage-delegates.tsx`, `edit-account-delegates-section.tsx`): **untouched**.

## 2. View rewrite — `global-delegates.tsx`

- `export const GlobalDelegates = () => {...}` (named export; no `FC`, no return annotation).
- `function getAccountUserType(account: AdminAccount): string` — module-level pure function (priority order preserved: Admin → DelegatedAdmin → External → System → Normal).
- `headers: Array<THeader>` (import `THeader` type from `@zextras/ui-components`) — plain const inside the component (depends on reactive `t()`; React Compiler memoizes it), no `useMemo`.
- State cleanup:
  - drop `defaultTab` state — it is initialized to `'general'`, only ever reset to `'general'`, and `EditAccount` already defaults to `GENERAL_SECTION`; pass no `defaultTab` prop.
  - drop write-only `tableRef`.
  - `selectedAccount: AdminAccount | null` (render guard `showEditAccountView && selectedAccount !== null`).
- One typed cell-builder helper `function buildAccountCell(...)` (or inline loop) replaces the four nearly-identical `<ds-text>` blocks; keeps `stopPropagation` on the description cell only, and the `onClick → openDetailView(item)` wiring on all cells. Cells keep exact same ds-text props/keys.

## 3. Deprecated layout migration

All `Container`/`Row` replaced by `<div className={styles.*}>` in a new co-located `global-delegates.module.css`. Mapping (verified against `Container.tsx:114-123`):

- `mainAlignment` → `justify-content`; `crossAlignment` → `align-items`
- `orientation="horizontal"` → `flex-direction: row`; `orientation="vertical"/"column"` → `flex-direction: column`
- `background="gray6"` → `background: var(--color-gray6-regular)`
- `padding={{ top: 'large', ... }}` → `padding: var(--padding-size-large) ...` tokens
- `height="3.625rem"` / `height="fit"` / `width="100%"` / `width="fill"` / `width="53%"` → literal CSS in classes
- existing inline `style` props (`position: relative/absolute`, `overflow: auto`, `textAlign: center`, sticky footer `bottom: -4rem`) move into the module classes.

DOM nesting preserved 1:1 (same number of `<div>` levels as `Container`/`Row` wrappers) so visual output is unchanged. No `Container`/`Row`/`ContainerProps`/`RowProps` imports remain in the file.

## 4. Extracted components (new siblings, same directory)

- `global-delegates-empty-state.tsx` — `export const GlobalDelegatesEmptyState = () => ...`; logo image + "This list is empty." + Trans help text; uses shared `global-delegates.module.css`.
- `global-delegates-footer.tsx` — props `{ total: number; limit: number; setOffset: React.Dispatch<React.SetStateAction<number>>; setLimit: React.Dispatch<React.SetStateAction<number>> }`; sticky wrapper + `<Paging>` + `<TrackNumberPerPage>`; uses shared module CSS.
- Both: SPDX header, named export, `type ...Props`, no deprecated layout components.

## 5. Import-site updates (3 files)

- `src/views/global-section-routes.ts` — `import { GlobalDelegates } from './domain/global-delegates'`.
- `src/views/tests/global-delegates.browser.test.tsx` — named import.
- `src/views/tests/domain-content-panel.browser.test.tsx` — `vi.mock('../domain/global-delegates', () => ({ GlobalDelegates: MockGlobalDelegates }))`.

## 6. Tests

- Existing 12 tests in `global-delegates.browser.test.tsx` must pass without assertion changes (import-only change).
- Add to that suite (or alongside): 
  - pagination footer visible when accounts exist (e.g. "1-3 of 3" / page-size select visible via role)
  - footer absent in empty state.
- Unit test `global-delegates.test.ts` (jsdom) for the pure helper `getAccountUserType`: export it from the view module; assert the 5 priority branches (Admin / DelegatedAdmin / External / System / Normal).

## 7. Non-goals

- No change to `useAdminAccountList` query options/keys, `accountListDirectory`, or other consumers.
- No TanStack Form migration (no forms in this view).
- No routing/visual/UX changes.

## 8. Verification

- `pnpm lint` (strict block covers this file) and `pnpm type-check` green.
- `pnpm vitest run apps/admin-ui-domains/src/views/tests/global-delegates.browser.test.tsx apps/admin-ui-domains/src/views/tests/domain-content-panel.browser.test.tsx` green.
- `rg "Container|Row" apps/admin-ui-domains/src/views/domain/global-delegates*.tsx` → only non-layout hits (HoverableRowFactory, tableRef-free).
