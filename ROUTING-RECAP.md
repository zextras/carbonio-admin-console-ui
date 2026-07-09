# Routing Refactor — Recap & Remaining Work

## Done (implemented this session)

### New shared primitives in `@zextras/ui-shared`

- **`useRelativePathname()`** (`packages/ui-shared/src/history/hooks.ts`) — strips the active
  app's registered route prefix from the current URL. Consumes the existing route registry
  (Zustand store) via `useCurrentRoute()`, so no app needs to hard-code its base path.
- **`buildPath(routeId, ...segments)`** — builds an absolute cross-app path from the registry.
  The section prefix (e.g. `manage/`) is read from the store, so callers never hard-code it.
- **Canonical route IDs** in `packages/ui-shared/src/constants/route-ids.ts` — single source of
  truth (`DOMAINS_ROUTE_ID`, `STORAGE_ROUTE_ID`, `SUBSCRIPTIONS_ROUTE_ID`, etc.), re-exported
  from `constants/index.ts` and the public `exports.ts`.

### 5 divergent URL-parsing strategies unified → 1

All list panels now use `useRelativePathname()` + react-router's `matchPath`, replacing:

| App | Previous parser |
|---|---|
| storage, mta, notifications | 3 identical copy-pasted `getRelativePathname` helpers + hard-coded base |
| operations | `pathname.split('/')` + `VALID_TABS` set lookup |
| backup | `location.pathname.split('/').filter(Boolean)` + `lastIndexOf('backup')` index arithmetic |

### Dashboard de-duplicated

- 5 cross-app `navigate()` calls (`dashboard-view.tsx`, `license-banner.tsx`) now use
  `buildPath()` instead of hard-coded `/${MANAGE}/...` templates.
- Re-declared peer route constants (`DOMAINS_ROUTE_ID`, `STORAGES_ROUTE_ID`, etc.) now sourced
  from `@zextras/ui-shared` via aliased re-exports in `constants.ts`.
- Now-redundant section constants (`MANAGE`, `MANAGE_APP_ID`, `LOG_AND_QUEUES`) deleted.

### Test infrastructure

- **`registerAppRoute(routeId, sectionId?)`** helper added to `admin-ui-test-utils`
  (`packages/test-utils/src/browser/utils/utils.tsx`) so isolated panel tests can seed the route
  registry, mirroring how the shell registers routes at boot.
- 11 new unit tests for the hooks (`history/tests/use-relative-pathname.test.tsx`,
  `history/tests/build-path.test.ts`).
- Affected browser tests updated (storage, mta, backup, dashboard license-banner).

### Verification (all green)

- `pnpm type-check` — 15/15 packages pass.
- `pnpm lint:fix` — 0 errors (only pre-existing legalhold warnings).
- Test suites: ui-shared 141, storage 223, mta 88, backup 149, operations 53, notifications 30,
  dashboard 17 — all pass.

**Net change:** +140/−91 across 16 modified files + 2 new files. **Not committed.**

### Done — `nav-guard` hoist to `@zextras/ui-components` (Tier 1, item 1)

- **New shared component** `packages/ui-components/src/components/navigation/route-leaving-guard.tsx`:
  based on the cleanest variant (cos — `useRef` not `useMemo`, no `as any`), **bakes the standard
  modal body as default** so `<RouteLeavingGuard when={isDirty} onSave={onSave} />` needs no
  children. `children` stays optional for custom bodies.
- Placed in `ui-components` (not `ui-shared`) to avoid the circular dependency
  (`ui-components → ui-shared` already). Declared `react-i18next` as a formal ui-components dep
  (was undeclared but used by 13 files).
- **Deleted 5 files**: 3× `nav-guard.tsx` (domains/cos/backup), `BackupRouteLeavingGuard.tsx`, and
  the cos nav-guard test (moved to `ui-components/.../navigation/tests/route-leaving-guard.browser.test.tsx`).
- **Migrated 16 consumers**: 12 domains forms, cos `form-page-layout`, 4 backup forms — consolidating
  backup's 2 mounting styles (wrapper vs direct-inline) into one consistent usage, and eliminating
  ~16 inline duplications of the modal body text.
- **Net:** +39/−585 (~546-line reduction). Verification: type-check 15/15, lint 0 errors,
  ui-components 321, cos 480, backup 149, domains 864 tests pass. **Not committed.**

### Done — decouple `route` from `path` (Tier 1, item 2)

- The store **no longer mutates** the app's `route` input. The raw route and the computed full URL
  now live in **separate fields**: `route` = raw app-declared segment (e.g. `'storage'`),
  `path` = full prefixed URL (e.g. `'manage/storage'`), derived once in `addRoute`.
- **Types** (`types/apps/index.d.ts`): added `path` to `AppRoute`, `AppView`, `PrimaryBarView`;
  JSDoc on `AppRoute`/`AppRouteDescriptor`/`PrimarybarSection` documenting the
  section-id-as-URL-prefix dual role.
- **Consumers** read `.path` for URL purposes: `app-view-container.tsx` (mount + redirect),
  `shell-primary-bar.tsx` (nav map), `history/hooks.ts` (`useCurrentRoute`, `replaceHistory`,
  `buildPath`, `useRelativePathname`).
- JSDoc on the public `addRoute` wrapper (`exports.ts`).
- **Net:** +70/−27 across 10 files. Verification: type-check 15/15, lint 0 errors, ui-shared 141,
  bootstrap (full-shell) 3, storage/mta/backup list-panels + dashboard license-banner 47,
  notifications/operations 16 tests pass. **No URL/registration/behavior change. Not committed.**

---

## Still needs doing (from the original analysis)

### Tier 1 — highest payoff

- [x] **3 duplicated `nav-guard.tsx` files** (domains/cos/backup) → hoisted to a single
      `@zextras/ui-components` export (`RouteLeavingGuard`) with default body; backup's mounting
      styles consolidated; ~16 inline body duplications eliminated. *(done — see above)*
- [x] **Architectural: decouple or document `primarybarSection.id`-as-URL-prefix** → split into
      explicit `route` (raw) + `path` (prefixed URL) fields; store stopped mutating `route`;
      dual-role documented at every relevant type and `addRoute`. No URL/behavior change.
      *(done — see above)*

### Tier 2 — consistency / correctness

- [x] **Leading-slash absolute nested-route paths** (`path={`/${X}`}`) in mta, backup,
      notifications, cos → normalized to relative paths (22 paths across 4 detail panels).
      Verified by 5 routing test suites (40 tests). *(done)*
- [x] **Pointless single-route `<Routes>` shells** in legalhold, privacy (`path="/"`), and
      dashboard app-view → removed; each renders its content directly. *(done)*
- [x] **Dead `<Navigate to="activate" replace />`** in `subscription.tsx:215` → removed (was
      unreachable; app-view guards it via conditional rendering, and no `/activate` route exists).
      *(done)*
- [x] **Hard-coded literals**:
      - `'cos_list'` → `COS_LIST` constant in `cos-detail-panel.tsx` + `delete-cos-modal.tsx`. *(done)*
      - domains restore wizard `'/restore_account'` + `setTimeout` re-nav hack → replaced with a
        clean `key`-based remount (`wizardKey` counter; wizard gains `onReset` prop). Eliminates
        the navigate-away-and-back dance, the literal, and `useLocation`/`useNavigate` deps. *(done)*
- [x] **Mixed selection model**:
      - operations: left as state-based — its detail is a `<ModalOverlay>` (modals are correctly
        ephemeral, not deep-linked). *(decided: intentional)*
      - legalhold: refactored to URL-driven (`/services/legal_hold/restore/:accountId`) via the
        shared `useRelativePathname` + `matchPath`; removed `isShowRestoreView` boolean; account
        looked up from the loaded list; `RestoreAccountView` takes `onBack`. Limitation: cold
        deep-link to a non-default-page account needs a backend by-id endpoint (frontend-only max).
        *(done — pragmatic)*

### Tier 3 — polish

- [x] **Duplicated `primaryBar` width logic** (`isPrimaryBarExpanded ? 981 : 1125`) across 6 apps
      → extracted to a shared `useDetailViewMaxWidth()` hook in `@zextras/ui-shared`; removed the
      per-app `getContainerStyle`/ternary. Subscription's breakpoint-based variant left as-is
      (genuinely different responsive logic). +2 hook unit tests. *(done)*
- [x] **AppView export inconsistency**: unified all 11 apps to **named exports**
      (`export const AppView`) — converted the 9 that used `export default` + updated all
      importers (9 `app.tsx` + 6 tests). Aligns with AGENTS.md ("named exports, avoid default"). *(done)*
- [ ] **React Compiler violations** (`useMemo`/`useCallback`, per AGENTS.md) in legalhold (incl.
      a `useMemo`-for-side-effects bug at `legal-hold-panel.tsx:305`), subscription, dashboard.
- [x] **Typos**: `QuededDetailPanel` → `QueuedDetailPanel` (component identifier across 3 files;
      filename was already correct); `'malinglist'` → `'mailinglist'` (2 dashboard files). *(done)*
- [ ] **Indentation**: operations app uses tabs while siblings use spaces.
