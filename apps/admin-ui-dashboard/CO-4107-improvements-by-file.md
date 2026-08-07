# CO-4107 — Improvements by File

**Companion to:** [`CO-4107-improvements.md`](./CO-4107-improvements.md) (organized by tier/topic)
**Ticket:** [CO-4107](https://zextras.atlassian.net/browse/CO-4107)

This view reorganizes the same improvement items by the file they touch, so each file can be modified in a single pass. Each item cross-references its original tier number from `CO-4107-improvements.md`.

Legend: **T1** = Acceptance Criteria Blocker · **T2** = Correctness & Quality · **T3** = Accessibility & Testing · **T4** = Housekeeping.

---

## Source files

### `src/app.tsx`
- **T1 #1** Remove `FC` — `App: FC` (line 16) and `HomeTooltipView: FC` (line 21).
- **T1 #2** Remove `useCallback` (import line 9).
- **T1 #3** Convert `export default App` (line 54) to a named export.
- **T1 #4** Extract `HomeTooltipView` (lines 21–33) — component currently defined *inside* `useCallback`; move to a module-level function.

### `src/views/app-view.tsx`
- **T1 #1** Remove `FC` — `AppView: FC` (line 19).
- **T2 #12** Remove the no-op `<Suspense>` wrapper — it wraps a statically-imported component. Either use `React.lazy` or drop it.

### `src/views/dashboard/dashboard-view.tsx`
- **T1 #1** Remove `FC` — `Dashboard: FC` (line 38).
- **T1 #2** Remove `useCallback` ×3 — `openOperationView` (line 56), `goToMailStoreServerList` (line 69), `goToMailNotificationt` (line 73).
- **T1 #3** Convert `export default Dashboard` (line 121) to a named export.
- **T2 #9** Remove derived-state effects (lines 64–70, 80–92) — `userName` and `hasListServerRights` should be computed during render, not via `useEffect` + `useState`.
- **T2 #11** Fix naming typo: `goToMailNotificationt` → `goToMailNotification` (line 73); `sethasListServerRights` → `setHasListServerRights`.

### `src/views/dashboard/quick-access-view.tsx`
- **T1 #1** Remove `FC` — `QuickAccess: FC<{...}>` (line 11).
- **T1 #3** Convert `export default QuickAccess` (line 143) to a named export.
- **T3 #13** Keyboard a11y on clickable cards (lines 114–130) — add `role="button"`, `tabIndex={0}`, `onKeyDown` handler.

### `src/views/dashboard/dashboard-notification.tsx`
- **T1 #1** Remove `FC` — `DashboardNotification: FC<{...}>` (line 11).
- **T1 #3** Convert `export default DashboardNotification` (line 60) to a named export.

### `src/views/dashboard/dashboard-server-list-view.tsx`
- **T1 #1** Remove `FC` — `DashboardServerList: FC<{...}>` (line 30).
- **T1 #2** Remove `useMemo` (line 103, `headers`).
- **T1 #3** Convert `export default DashboardServerList` (line 189) to a named export.
- **T1 #5** Eliminate `any` — row type (line 96), `headers: any[]` (line 103).
- **T2 #8** **BUG** — React key collision: three sibling columns share `key={item?.name}` (lines 60, 74, 90); make keys unique per column.
- **T2 #10** Replace hand-rolled event type `{ stopPropagation: () => void }` with `React.MouseEvent` (lines 49, 62, 76, 91).

### `src/views/dashboard/carbonio-version-information-view.tsx`
- **T1 #1** Remove `FC` — `CarbonioVersionInformation: FC<{...}>` (line 12).
- **T1 #3** Convert `export default CarbonioVersionInformation` (line 73) to a named export.
- **T3 #16** Add a community-edition branch test (currently untested).
- **T4** Extract the repeated `'--ds-text-font-size'` style casts into a shared constant.

### `src/views/dashboard/license-banner.tsx`
- **T1 #1** Remove `FC` — `LicenseBanner: FC<licenseBannerProps>` (line 21).
- **T1 #2** Remove `useMemo` ×2 — `labelToShow` (line 80), `descriptionToShow` (line 102).
- **T2 #11** Fix naming typo: `licenseBannerProps` → `LicenseBannerProps` (line 21).

### `src/hooks/use-server-version.ts`
- **T1 #6** Promote the inline `serverVersionQueryKeys` into a centralized `services/query-keys.ts` module.

---

## New files to create

### `src/services/` (directory)
- **T1 #7** Typed service-response layer — discriminated `success`/`error` unions for all API responses.
- **T1 #6** Home for the centralized `query-keys.ts` (consumed by `use-server-version.ts`).

### `src/views/dashboard/tests/dashboard-server-list-view.browser.test.tsx`
- **T3 #15** New browser tests for the server-list view (currently at 1.1% coverage) — render the table, assert rows, exercise the advanced-mode toggle.

---

## Test files

### `src/views/dashboard/tests/license-banner.browser.test.tsx`
- **T3 #14** Stop using `getByTestId`. Add an `aria-label` to the close button and query via `getByRole('button', { name: ... })`.

---

## Config & type-declaration files

### `src/custom.d.ts`
- **T4** `content: any` (lines 7, 12) — type the `*.svg` / `*.json` module declarations properly.

### `src/globals.d.ts` / ambient `BASE_PATH`
- **T4** Replace the ambient `declare const BASE_PATH` with a typed config import.

### `package.json`
- **T4** Audit for unused dependencies (e.g. `react-csv`, `qrcode.react`, `lodash-es`, `immer`, `zod`, `posthog-js`, `tailwindcss`, `clsx`).

---

## i18n resource files
- **T2 #11** Fix i18n key typo `cumminity_edition` → `community_edition` (locate in the dashboard's properties file).

---

## Files with no changes
`src/index.ts`, `src/constants.ts`, `src/hooks/tests/use-server-version.test.tsx`, `src/views/tests/app-view.browser.test.tsx`.

---

**Summary:** 13 existing source/test files touched, 2 new files created, plus config/i18n touch-ups. Items #1 (FC), #2 (memo hooks), and #3 (named exports) recur across most view files — making those three a natural first sweep.
