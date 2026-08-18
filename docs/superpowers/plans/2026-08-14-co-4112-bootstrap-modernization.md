# CO-4112 Bootstrap Modernization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize `apps/admin-ui-bootstrap` to match `admin-ui-cos` standards — React Compiler compliance, zero `any`, accessibility improvements, and expanded test coverage.

**Architecture:** Incremental refactoring of the application shell module (30 source files). Each phase produces independently verifiable changes. No behavioral changes — purely structural, type-safety, a11y, and testing improvements.

**Tech Stack:** React 19 + React Compiler, TypeScript, Zustand, TanStack React Query, Vitest (jsdom + Playwright browser tests), ESLint strict config.

---

## Already Completed

- [x] All `useMemo` (11) and `useCallback` (5) removed — React Compiler handles memoization
- [x] All `set-state-in-effect` / `no-derived-state` lint errors fixed (routes, primaryBarViewWithSection, accountName)
- [x] `apps/admin-ui-bootstrap/**` added to strict ESLint config block in `eslint.config.js`
- [x] Lint passes clean (0 errors)

---

## Phase 1: Code Consistency (Quick Wins)

### Task 1: Fix variable name typo `parimaryBarItems` → `primaryBarItems`

**Files:**
- Modify: `apps/admin-ui-bootstrap/src/shell/shell-primary-bar.tsx:120,123,131`

- [ ] **Step 1: Rename the variable**

In `shell-primary-bar.tsx`, rename all 3 occurrences of `parimaryBarItems` to `primaryBarItems`:
- Line 120: `const parimaryBarItems: Array<any> = [];` → `const primaryBarItems: Array<any> = [];`
- Line 123: `parimaryBarItems.push(primaryBarItem);` → `primaryBarItems.push(primaryBarItem);`
- Line 131: `children: parimaryBarItems,` → `children: primaryBarItems,`

- [ ] **Step 2: Verify**

Run: `pnpm type-check --filter @zextras/admin-ui-bootstrap`
Expected: PASS (only pre-existing `posthog-js` errors)

---

### Task 2: Fix cross-package relative import in `bar.tsx`

**Files:**
- Modify: `apps/admin-ui-bootstrap/src/utility-bar/bar.tsx:22`

The file imports `IconName` via a deep relative path into `packages/ui-components` source. `IconName` is already exported from the package barrel.

- [ ] **Step 1: Replace the relative import**

Remove line 22:
```typescript
import { IconName } from '../../../../packages/ui-components/src/web-components/icon-registry';
```

Add `type IconName` to the existing `@zextras/ui-components` import on line 7:
```typescript
import { Button, type Container, Dropdown, type IconName, Tooltip } from '@zextras/ui-components';
```

Wait — `IconName` is a type export from `@zextras/ui-components`. Check the existing import:
```typescript
import { Button, Container, Dropdown, Tooltip } from '@zextras/ui-components';
```
Change to:
```typescript
import { Button, Container, Dropdown, type IconName, Tooltip } from '@zextras/ui-components';
```

Then delete the standalone `IconName` import line.

- [ ] **Step 2: Verify**

Run: `pnpm lint --filter @zextras/admin-ui-bootstrap && pnpm type-check --filter @zextras/admin-ui-bootstrap`
Expected: PASS

---

### Task 3: Replace `React.Fragment` keyed by array `index` with stable keys

**Files:**
- Modify: `apps/admin-ui-bootstrap/src/shell/shell-primary-bar.tsx:156-158`

The `map` over `primaryBarViewWithSection` uses `React.Fragment key={index}`. Each item already has a unique `id` (for section items) or `position` that can serve as a stable key.

- [ ] **Step 1: Replace the key**

Line 158: `<React.Fragment key={index}>` → `<React.Fragment key={view?.section?.id ?? view?.id ?? index}>`

This uses the section ID for section wrappers, the view ID for standalone views, and falls back to index only as a last resort.

Also remove `index` from the map callback if no longer used: `(view, index)` → `(view)` if `index` is only used for the key. Check — `index` is only used in `key={index}`, so change to `(view)` and use the composite key.

- [ ] **Step 2: Verify**

Run: `pnpm lint --filter @zextras/admin-ui-bootstrap`
Expected: PASS

---

### Task 4: Normalize indentation (tabs vs spaces)

**Files:**
- Multiple files, notably `bootstrapper-context.ts` uses tabs while most files use spaces

- [ ] **Step 1: Run prettier to normalize**

```bash
cd apps/admin-ui-bootstrap && npx prettier --write "src/**/*.{ts,tsx}"
```

- [ ] **Step 2: Verify**

Run: `pnpm lint --filter @zextras/admin-ui-bootstrap`
Expected: PASS

---

## Phase 2: React Compiler Compliance

### Task 5: Remove all `FC` / `FunctionComponent` type annotations

Remove `FC` and `FunctionComponent` from all components. Replace with arrow function consts + explicit props `type` definitions (or `function` declarations per Task 7).

**Files with `FC` usage (8 files, 10 usages):**

| File | Line | Component | Current |
|------|------|-----------|---------|
| `utility-bar/panel.tsx` | 14 | `ShellUtilityPanel` | `export const ShellUtilityPanel: FC = () => {` |
| `utility-bar/bar.tsx` | 25 | `UtilityBarItem` | `const UtilityBarItem: FC<{ view: UtilityView }> = ({ view }) => {` |
| `utility-bar/bar.tsx` | 53 | `ShellUtilityBar` | `export const ShellUtilityBar: FC = () => {` |
| `shell/creation-button.tsx` | 56 | `CreationButton` | `export const CreationButton: FC<{ activeRoute?: AppRoute }> = ({ activeRoute }) => {` |
| `shell/shell-primary-bar.tsx` | 29 | `PrimaryBarElement` | `const PrimaryBarElement: FC<PrimaryBarItemProps> = (...) => {` |
| `shell/shell-primary-bar.tsx` | 88 | `ShellPrimaryBar` | `const ShellPrimaryBar: FC<{ activeRoute: AppRoute \| undefined }> = (...) => {` |
| `shell/shell-header.tsx` | 19 | `ShellHeader` | `const ShellHeader: FC<{ ... }> = ({ ... }) => {` |
| `shell/collapser.tsx` | 11 | `Collapser` | `export const Collapser: FunctionComponent<{ ... }> = (...) => (` |
| `boot/bootstrapper-router.tsx` | 16 | `ContextBridge` | `const ContextBridge: FC = () => {` |
| `boot/bootstrapper-router.tsx` | 43 | `BootstrapperRouter` | `export const BootstrapperRouter: FC = () => (` |
| `shell/tests/app-view-container.browser.test.tsx` | 15 | `StubView` | `const StubView: FC = () => ...` (test file — also fix) |

- [ ] **Step 1: For each file, remove `FC`/`FunctionComponent` from imports**

Remove `FC` (and `type FC`) and `FunctionComponent` from React imports. If `React` is no longer needed for other reasons, keep it only if used (e.g., `React.Fragment`, `React.CSSProperties`).

- [ ] **Step 2: For each component, replace `: FC<Props>` with explicit inline or extracted props type**

Pattern: `const Component: FC<Props> = ({ prop }) => {` → `const Component = ({ prop }: Props) => {`

For components without props (`: FC = () =>`):
```typescript
// Before
export const ShellUtilityPanel: FC = () => {
// After
export const ShellUtilityPanel = () => {
```

For components with inline props (`: FC<{ activeRoute?: AppRoute }>`):
```typescript
// Before
export const CreationButton: FC<{ activeRoute?: AppRoute }> = ({ activeRoute }) => {
// After
type CreationButtonProps = { activeRoute?: AppRoute };
export const CreationButton = ({ activeRoute }: CreationButtonProps) => {
```

For `Collapser` which uses `FunctionComponent`:
```typescript
// Before
import { FunctionComponent } from 'react';
export const Collapser: FunctionComponent<{ open: boolean; onClick: () => void }> = ({
// After (remove FunctionComponent import entirely)
type CollapserProps = { open: boolean; onClick: () => void };
export const Collapser = ({
  open,
  onClick,
}: CollapserProps) => (
```

- [ ] **Step 3: For test file `app-view-container.browser.test.tsx`**

```typescript
// Before
const StubView: FC = () => <div>STUB-APPVIEW</div>;
// After
const StubView = () => <div>STUB-APPVIEW</div>;
```

Remove `FC` import if unused.

- [ ] **Step 4: Verify**

Run: `pnpm lint --filter @zextras/admin-ui-bootstrap && pnpm type-check --filter @zextras/admin-ui-bootstrap`
Expected: PASS (only pre-existing `posthog-js` errors)

---

### Task 6: Convert all default exports to named exports

Convert these 6 default exports to named exports and update all import sites:

| File | Export | Import sites |
|------|--------|-------------|
| `shell/shell-primary-bar.tsx` | `export default ShellPrimaryBar` | `shell-navigation-bar.tsx:10`, `shell/tests/shell-primary-bar.browser.test.tsx:12` |
| `shell/app-view-container.tsx` | `export default function AppViewContainer` | `shell-view.tsx:11`, `shell/tests/app-view-container.browser.test.tsx:13` |
| `shell/shell-view.tsx` | `export default function ShellView` | `boot/bootstrapper-router.tsx:12` |
| `shell/shell-navigation-bar.tsx` | `export default function ShellNavigationBar` | `shell-view.tsx:13` |
| `boot/splash.tsx` | `export default LoadingView` | `index.tsx:17` |
| `shell/badge-wrap.tsx` | `export default BadgeWrap` | `shell-primary-bar.tsx:18` |

- [ ] **Step 1: `splash.tsx`** — Add named export

```typescript
// Before
const LoadingView = () => ( ... );
export default LoadingView;

// After
export const LoadingView = () => ( ... );
```

Update `index.tsx:17`:
```typescript
// Before
import LoadingView from './boot/splash';
// After
import { LoadingView } from './boot/splash';
```

- [ ] **Step 2: `badge-wrap.tsx`** — Convert to named export

```typescript
// Before
const BadgeWrap = ({ ... }: BadgeWrapProps) => ( ... );
BadgeWrap.displayName = 'BadgeWrap';
export default BadgeWrap;

// After
export const BadgeWrap = ({ ... }: BadgeWrapProps) => ( ... );
```

Remove `BadgeWrap.displayName` line (React Compiler handles display names).

Update `shell-primary-bar.tsx:18`:
```typescript
// Before
import BadgeWrap from './badge-wrap';
// After
import { BadgeWrap } from './badge-wrap';
```

- [ ] **Step 3: `shell-primary-bar.tsx`** — Convert to named export

```typescript
// Before (line 216)
export default ShellPrimaryBar;
// After
export { ShellPrimaryBar };
```

Update `shell-navigation-bar.tsx:10`:
```typescript
import { ShellPrimaryBar } from './shell-primary-bar';
```

Update `shell/tests/shell-primary-bar.browser.test.tsx:12`:
```typescript
import { ShellPrimaryBar } from '../shell-primary-bar';
```

- [ ] **Step 4: `app-view-container.tsx`** — Convert to named export

```typescript
// Before (line 20)
export default function AppViewContainer() {
// After
export function AppViewContainer() {
```

Update `shell-view.tsx:11`:
```typescript
import { AppViewContainer } from './app-view-container';
```

Update `shell/tests/app-view-container.browser.test.tsx:13`:
```typescript
import { AppViewContainer } from '../app-view-container';
```

- [ ] **Step 5: `shell-navigation-bar.tsx`** — Convert to named export

```typescript
// Before (line 12)
export default function ShellNavigationBar({ ... }: { ... }) {
// After — extract props type, use named export
type ShellNavigationBarProps = { activeRoute: AppRoute | undefined };
export function ShellNavigationBar({ activeRoute }: ShellNavigationBarProps) {
```

Update `shell-view.tsx:13`:
```typescript
import { ShellNavigationBar } from './shell-navigation-bar';
```

- [ ] **Step 6: `shell-view.tsx`** — Convert to named export

```typescript
// Before (line 29)
export default function ShellView() {
// After
export function ShellView() {
```

Update `bootstrapper-router.tsx:12`:
```typescript
import { ShellView } from '../shell/shell-view';
```

- [ ] **Step 7: Verify**

Run: `pnpm lint --filter @zextras/admin-ui-bootstrap && pnpm type-check --filter @zextras/admin-ui-bootstrap`
Expected: PASS

---

### Task 7: Convert arrow-function component declarations to `function` declarations

The ticket calls out these arrow const components for conversion to `function` declarations:

| Component | File | Notes |
|-----------|------|-------|
| `FirstAppRedirect` | `shell/app-view-container.tsx:12` | Arrow const → function |
| `BadgeWrap` | `shell/badge-wrap.tsx:34` | Arrow const → function (also being converted to named export in Task 6) |
| `TBridge` | `boot/bootstrapper.tsx:18` | Arrow const → function |
| `LoadingView` | `boot/splash.tsx:10` | Arrow const → function (also being converted to named export in Task 6) |

- [ ] **Step 1: `FirstAppRedirect`** — Convert

```typescript
// Before
const FirstAppRedirect = () => {
// After
function FirstAppRedirect() {
```

- [ ] **Step 2: `BadgeWrap`** — Convert (combine with Task 6 named export)

```typescript
// Before
export const BadgeWrap = ({ badge, children, isExpanded, ref }: BadgeWrapProps) => (
// After
export function BadgeWrap({ badge, children, isExpanded, ref }: BadgeWrapProps) {
```

Note: arrow returning JSX via `() => (...)` needs the body wrapped in `{ return (...); }`.

- [ ] **Step 3: `TBridge`** — Convert

```typescript
// Before
const TBridge = () => {
// After
function TBridge() {
```

- [ ] **Step 4: `LoadingView`** — Convert (combine with Task 6 named export)

```typescript
// Before
export const LoadingView = () => (
  <div className="splash">
    ...
  </div>
);
// After
export function LoadingView() {
  return (
    <div className="splash">
      ...
    </div>
  );
}
```

- [ ] **Step 5: Verify**

Run: `pnpm lint --filter @zextras/admin-ui-bootstrap && pnpm type-check --filter @zextras/admin-ui-bootstrap`
Expected: PASS

---

## Phase 3: Type Safety

### Task 8: Fix `any`-typed context in `bootstrapper-context.ts`

**Files:**
- Modify: `apps/admin-ui-bootstrap/src/boot/bootstrapper-context.ts`

Currently `createContext<any>({})` and `useI18nFactory(): any`.

- [ ] **Step 1: Define a proper context type**

```typescript
import { type I18nFactory } from '@zextras/ui-shared';
import { createContext, useContext } from 'react';

type BootstrapperContextValue = {
  i18nFactory?: I18nFactory;
};

export const BootstrapperContext = createContext<BootstrapperContextValue | null>(null);

export function useI18nFactory(): I18nFactory | undefined {
  const { i18nFactory } = useContext(BootstrapperContext);
  return i18nFactory;
}
```

- [ ] **Step 2: Check consumers of `BootstrapperContext`**

Search for `BootstrapperContext.Provider` usage and ensure the provider value matches the new type. If no provider is found (the context may be vestigial), the `null` default is safe.

- [ ] **Step 3: Verify**

Run: `pnpm type-check --filter @zextras/admin-ui-bootstrap`
Expected: PASS or only pre-existing errors

---

### Task 9: Replace `Array<any>` in `shell-primary-bar.tsx`

**Files:**
- Modify: `apps/admin-ui-bootstrap/src/shell/shell-primary-bar.tsx:108,110,120`

Three `Array<any>` usages exist in the derived `primaryBarViewWithSection` computation. These should use a proper union type.

- [ ] **Step 1: Define a type for the computed view-with-section items**

The array is a mix of `PrimaryBarView` (standalone items) and section wrapper objects (`{ position, badge, visible, section, children }`). Define:

```typescript
type SectionedPrimaryBarView = {
  position?: number;
  badge: { show: boolean; count: number; showCount: boolean; color: string };
  visible: boolean;
  section?: { id: string; position?: number; label?: string };
  children?: Array<PrimaryBarView>;
};

type PrimaryBarViewItem = PrimaryBarView | SectionedPrimaryBarView;
```

- [ ] **Step 2: Replace all 3 `Array<any>` with `Array<PrimaryBarViewItem>`**

- Line 108: `let primaryBarViewWithSection: Array<any> = [];`
- Line 110: `const allPrimaryBarView: Array<any> = primaryBarViews.filter(...)`
- Line 120: `const primaryBarItems: Array<any> = [];` (after typo fix)

- [ ] **Step 3: Fix any type errors from the new types**

The `.filter()` returns `PrimaryBarView[]`, which is assignable to `Array<PrimaryBarViewItem>`. The section wrapper objects need to match `SectionedPrimaryBarView`. Adjust as needed.

- [ ] **Step 4: Verify**

Run: `pnpm type-check --filter @zextras/admin-ui-bootstrap`
Expected: PASS

---

### Task 10: Replace `as unknown as Function` cast in `bootstrapper-router.tsx`

**Files:**
- Modify: `apps/admin-ui-bootstrap/src/boot/bootstrapper-router.tsx:21`

Currently: `const createModal = useContext(ModalManagerContext) as unknown as Function;`

- [ ] **Step 1: Check what `ModalManagerContext` provides**

Inspect the `ModalManagerContext` type from `@zextras/ui-components`. If it already has a typed value, remove the cast. If it's `null` or untyped, define a proper type:

```typescript
type CreateModal = (modal: unknown) => void;
const createModal = useContext(ModalManagerContext) as CreateModal;
```

Or better, check if `@zextras/ui-components` exports a typed hook like `useModalManager()` that returns the correct type.

- [ ] **Step 2: Replace the cast**

Use the narrowest safe type instead of `Function`. `Function` is banned by `@typescript-eslint/no-unsafe-function-type`.

- [ ] **Step 3: Verify**

Run: `pnpm lint --filter @zextras/admin-ui-bootstrap && pnpm type-check --filter @zextras/admin-ui-bootstrap`
Expected: PASS

---

### Task 11: Verify zero `any` in source files

**Files:**
- All `.ts`/`.tsx` in `apps/admin-ui-bootstrap/src/` (excluding `.d.ts` ambient declarations and test files)

- [ ] **Step 1: Search for remaining `any` usage**

```bash
rg '\bany\b' apps/admin-ui-bootstrap/src --glob '*.{ts,tsx}' --glob '!*.d.ts' --glob '!*.test.*'
```

- [ ] **Step 2: Fix any remaining instances**

Known remaining after Tasks 8-10:
- `globals.d.ts` — ambient module declarations (`.d.ts` files are exempt from the "zero `any`" criterion)
- Test files — may use `any` in mocks (acceptable)

- [ ] **Step 3: Verify**

Run: `pnpm lint --filter @zextras/admin-ui-bootstrap`
Expected: `@typescript-eslint/no-explicit-any` should show 0 warnings in non-`.d.ts` source files

---

## Phase 4: Accessibility

### Task 12: Add `aria-expanded` to the collapsible primary navigation bar

**Files:**
- Modify: `apps/admin-ui-bootstrap/src/shell/shell-primary-bar.tsx` (the `Container` for the primary bar)
- Modify: `apps/admin-ui-bootstrap/src/shell/collapser.tsx` (the toggle button)

- [ ] **Step 1: Add `aria-expanded` to the primary bar container**

In `shell-primary-bar.tsx`, the main `Container` (around line 140) should carry `aria-expanded={isOpen}`:

```tsx
<Container
  className={styles.primaryBarContainer}
  role="menu"
  aria-expanded={isOpen}
  ...
>
```

- [ ] **Step 2: Add `aria-expanded` and `aria-label` to the Collapser button**

In `collapser.tsx`:
```tsx
<button
  type="button"
  className={styles.bubble}
  onClick={onClick}
  data-open={open}
  aria-expanded={open}
  aria-label={open ? 'Collapse navigation' : 'Expand navigation'}
>
```

Note: Use i18n for the label text if a translation system is available, otherwise use a sensible default.

- [ ] **Step 3: Verify**

Run: `pnpm lint --filter @zextras/admin-ui-bootstrap`
Expected: PASS (jsx-a11y rules should be satisfied)

---

### Task 13: Add `aria-label`s to icon-only buttons

**Files:**
- `shell/shell-primary-bar.tsx` — `PrimaryBarElement` button (line 48)
- `utility-bar/bar.tsx` — `UtilityBarItem` button (line 34) and avatar button (line 94)
- `shell/collapser.tsx` — toggle button (handled in Task 12)

- [ ] **Step 1: Add `aria-label` to icon-only buttons in `PrimaryBarElement`**

The button at line 48 uses `icon={view.component as IconName}` and has no text label. Add:
```tsx
<Button
  type="ghost"
  color={'text'}
  icon={view.component as IconName}
  onClick={onClick}
  size={'extralarge'}
  className={styles.primaryBarButton}
  aria-label={view.label}
/>
```

- [ ] **Step 2: Add `aria-label` to icon-only buttons in `ShellUtilityBar`**

`UtilityBarItem` button (line 34):
```tsx
<Button
  type="ghost"
  color={...}
  icon={view.button as IconName}
  onClick={onClick}
  size="large"
  aria-label={view.label}
/>
```

Avatar dropdown button (line 94) — already has a Tooltip but needs `aria-label`:
```tsx
<Button
  type="ghost"
  icon="AvatarOutline"
  size={'extralarge'}
  color="primary"
  onClick={noop}
  aria-label={t('label.account_menu', 'Account menu')}
/>
```

- [ ] **Step 3: Verify**

Run: `pnpm lint --filter @zextras/admin-ui-bootstrap`
Expected: PASS (no jsx-a11y violations)

---

### Task 14: Verify `aria-live` regions for snackbar/modal

**Files:**
- Verify only — `@zextras/ui-components` SnackbarManager and ModalManager

- [ ] **Step 1: Check if `aria-live` exists in ui-components**

```bash
rg 'aria-live|role="status"|role="alert"' packages/ui-components/src --glob '*.tsx'
```

- [ ] **Step 2: If missing, document as a follow-up issue**

If `aria-live` is not present in the shared SnackbarManager, this is a `@zextras/ui-components` change, not a bootstrap change. Document it as a follow-up.

- [ ] **Step 3: If present, no action needed**

Mark this task as verified.

---

## Phase 5: Service Layer Review

### Task 15: Review `queryClient.setQueryData` in `init.ts`

**Files:**
- Modify (if needed): `apps/admin-ui-bootstrap/src/boot/init.ts:47`

Currently: `queryClient.setQueryData(['account', 'settings'], settings);`

- [ ] **Step 1: Check shared query-key conventions**

```bash
rg 'queryKey|QueryKey' packages/ui-shared/src --glob '*.ts' | head -30
```

Look for a `queryKeys` factory pattern (e.g., `accountQueryKeys.settings()`) and check if the hardcoded `['account', 'settings']` key matches.

- [ ] **Step 2: If a query-key factory exists, use it**

```typescript
// Before
queryClient.setQueryData(['account', 'settings'], settings);

// After (if factory exists)
queryClient.setQueryData(accountQueryKeys.settings(), settings);
```

- [ ] **Step 3: If no factory exists, extract the key to a constant for consistency**

At minimum, extract the magic string to a named constant.

- [ ] **Step 4: Verify**

Run: `pnpm type-check --filter @zextras/admin-ui-bootstrap`
Expected: PASS

---

## Phase 6: Testing

### Task 16: Add unit tests for `utility-bar/utils.ts`

**Files:**
- Create: `apps/admin-ui-bootstrap/src/utility-bar/tests/utils.test.ts`

- [ ] **Step 1: Write tests for `useUtilityViews` hook and `checkRoute` logic**

Test:
- `useUtilityViews` filters views by active route
- Views with `blacklistRoutes` are hidden when route matches
- Views with `whitelistRoutes` are only shown when route matches
- Views with no route restrictions are always shown
- `openLink` opens a URL in a new tab

- [ ] **Step 2: Run tests**

Run: `pnpm vitest run apps/admin-ui-bootstrap/src/utility-bar/tests/utils.test.ts`
Expected: PASS

---

### Task 17: Add unit tests for `creation-button.tsx`

**Files:**
- Create: `apps/admin-ui-bootstrap/src/shell/tests/creation-button.test.tsx`

- [ ] **Step 1: Write tests**

Test:
- Button renders with "Create" label
- Dropdown opens and closes
- `useSecondaryActions` builds correct items from actions + activeRoute
- Items are grouped by app, with dividers between groups

- [ ] **Step 2: Run tests**

Run: `pnpm vitest run apps/admin-ui-bootstrap/src/shell/tests/creation-button.test.tsx`
Expected: PASS

---

### Task 18: Add unit tests for `tracker/` modules

**Files:**
- Create: `apps/admin-ui-bootstrap/src/tracker/tests/tracker.test.tsx`
- Create: `apps/admin-ui-bootstrap/src/tracker/tests/provider.test.tsx`

- [ ] **Step 1: Write tests for `useTracker` hook**

Test:
- `capture` delegates to PostHog
- Hook returns a `capture` function

- [ ] **Step 2: Write tests for `TrackerProvider`**

Test:
- Renders children when `isLoading` is true
- Renders `PostHogProvider` when analytics enabled
- Renders plain children when analytics disabled

- [ ] **Step 3: Run tests**

Run: `pnpm vitest run apps/admin-ui-bootstrap/src/tracker/tests/`
Expected: PASS

---

### Task 19: Add unit tests for `app-registry.ts` and `loader.ts`

**Files:**
- Create: `apps/admin-ui-bootstrap/src/apps/tests/app-registry.test.ts`
- Create: `apps/admin-ui-bootstrap/src/apps/tests/loader.test.ts`

- [ ] **Step 1: Write tests for app-registry**

Test:
- Registering an app adds it to the store
- Duplicate registrations are handled

- [ ] **Step 2: Write tests for loader**

Test:
- `loadAllApps` iterates entry points and mounts them
- Missing entry points are handled gracefully

- [ ] **Step 3: Run tests**

Run: `pnpm vitest run apps/admin-ui-bootstrap/src/apps/tests/`
Expected: PASS

---

### Task 20: Add unit test for `error-page.tsx`

**Files:**
- Create: `apps/admin-ui-bootstrap/src/boot/tests/error-page.test.tsx`

- [ ] **Step 1: Write test**

Test:
- ErrorPage renders an error message
- Any retry/reload button works

- [ ] **Step 2: Run tests**

Run: `pnpm vitest run apps/admin-ui-bootstrap/src/boot/tests/error-page.test.tsx`
Expected: PASS

---

### Task 21: Add browser tests for shell navigation flows

**Files:**
- Create: `apps/admin-ui-bootstrap/src/shell/tests/shell-navigation.browser.test.tsx`

- [ ] **Step 1: Write browser tests**

Test:
- Primary bar collapse/expand toggles width
- Clicking a nav item navigates to the correct route
- Collapsed bar shows sections as dividers
- Expanded bar shows section labels

Follow existing browser test conventions from `shell-primary-bar.browser.test.tsx` and `app-view-container.browser.test.tsx`.

- [ ] **Step 2: Run tests**

Run: `pnpm vitest run apps/admin-ui-bootstrap/src/shell/tests/shell-navigation.browser.test.tsx`
Expected: PASS

---

### Task 22: Verify test coverage >= 80%

- [ ] **Step 1: Run tests with coverage**

```bash
cd apps/admin-ui-bootstrap && pnpm test:ci
```

- [ ] **Step 2: Check coverage report**

Verify `lcov.info` is generated and overall coverage >= 80%. Identify remaining gaps.

- [ ] **Step 3: Add tests for any remaining critical uncovered paths**

Focus on init sequence, app loading, and route resolution.

---

## Phase 7: Final Verification

### Task 23: Full verification

- [ ] **Step 1: Lint**

Run: `pnpm lint`
Expected: 15/15 packages pass, 0 errors

- [ ] **Step 2: Type-check**

Run: `pnpm type-check`
Expected: Only pre-existing `posthog-js` errors (or fix by installing the missing type package)

- [ ] **Step 3: Tests**

Run: `pnpm test`
Expected: All tests pass

- [ ] **Step 4: Acceptance criteria check**

Verify against CO-4112 acceptance criteria:
- [x] Zero `useMemo`/`useCallback`/`FC` usage
- [x] No default exports for components
- [x] Zero `any` in source (non-`.d.ts`)
- [x] Test coverage >= 80%
- [x] All tests pass; lint and type-check clean
- [x] Cross-package import and naming typos resolved
