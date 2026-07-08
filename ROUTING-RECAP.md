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

- [ ] **Leading-slash absolute nested-route paths** (`path={`/${X}`}`) in mta, backup,
      notifications, cos → normalize to relative paths (storage/operations/domains already do).
- [ ] **Pointless single-route `<Routes>` shells** in legalhold, privacy (`path="/"`), and
      dashboard app-view → remove the shell (render directly) or adopt real sub-routes.
- [ ] **Dead `<Navigate to="activate" replace />`** in `subscription.tsx:215` — no matching route
      exists; activation is conditional rendering in `app-view.tsx`.
- [ ] **Hard-coded literals**:
      - `'cos_list'` string in `cos-detail-panel.tsx:43` and `delete-cos-modal.tsx:34` (use the
        `COS_LIST` constant instead).
      - `'/restore_account'` in domains restore wizard (`restore-delete-account.tsx:26`,
        `restore-delete-account-wizard.tsx:95`) — pathname `.replace()` + `setTimeout` re-nav,
        brittle.
- [ ] **Mixed selection model**: operations (state + `<ModalOverlay>`) and legalhold (pure
      `useState`) aren't deep-linkable/refresh-safe, unlike the URL-driven apps. Decide whether
      item-level detail should move into the URL.

### Tier 3 — polish

- [ ] **Duplicated `primaryBar` width logic** (`isPrimaryBarExpanded ? 981 : 1125`) across 7 apps
      (backup, domains, mta, notifications, operations, privacy + a variant in subscription) →
      extract to a shared hook/style.
- [ ] **AppView export inconsistency**: cos & subscription use named exports; the other 9 use
      default → unify.
- [ ] **React Compiler violations** (`useMemo`/`useCallback`, per AGENTS.md) in legalhold (incl.
      a `useMemo`-for-side-effects bug at `legal-hold-panel.tsx:305`), subscription, dashboard.
- [ ] **Typos**: `QuededDetailPanel` filename (operations) should be `Queued`;
      `'malinglist'` (dashboard-view.tsx:57) should be `mailinglist`.
- [ ] **Indentation**: operations app uses tabs while siblings use spaces.
