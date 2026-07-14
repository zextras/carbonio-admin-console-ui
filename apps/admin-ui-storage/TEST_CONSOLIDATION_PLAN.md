# Test Consolidation Plan: `admin-ui-storage`

> **Scope:** All 33 test files under `apps/admin-ui-storage/src/`
> **Goal:** Reduce ~65-75 redundant tests across ~13 files without losing behavioral coverage.
> **Method:** Merge granular render checks, eliminate cross-file duplicates, extract shared helpers, collapse copy-pasted service tests into table-driven ones.

---

## Table of Contents

1. [Cross-File Route/Navigation Overlap](#1-cross-file-routenavigation-overlap)
2. [Overly Granular Rendering Tests](#2-overly-granular-rendering-tests)
3. [Duplicated Popover/Modal Patterns](#3-duplicated-popovermodal-patterns)
4. [Service Test Redundancy](#4-service-test-redundancy)
5. [Implementation Order](#5-implementation-order)

---

## 1. Cross-File Route/Navigation Overlap

**Files involved:**

| File | Role |
|------|------|
| `views/tests/app-view.browser.test.tsx` | Full integration: `<AppView />` with real API mocks |
| `views/bucket/tests/bucket-routes.browser.test.tsx` | Pure route→view mapping with stub components |
| `views/bucket/tests/bucket-list-panel.browser.test.tsx` | Sidebar `<StorageSidebar />` rendering + navigation |

### 1.1 Route mapping duplication: `app-view` vs `bucket-routes`

Both files test the same four route mappings:

| Behavior | `app-view` test | `bucket-routes` test |
|----------|-----------------|---------------------|
| Index `/` → `servers_list` redirect | `'redirects the index route to servers_list'` | `'redirects the index route to servers_list'` |
| `/servers_list` renders view | `'renders the servers list route...'` | `it.each` row `[SERVERS_LIST, ...]` |
| `/s3connector_list` renders view | `'renders the S3 connectors route...'` | `it.each` row `[S3CONNECTOR_LIST, ...]` |
| `/:server/data_volumes` renders view | `'renders the data volumes route...'` | `'renders VolumesDetailRoute for...'` |

**Action:** Keep route-mapping tests exclusively in `bucket-routes.browser.test.tsx`. In `app-view.browser.test.tsx`, refactor the overlapping tests to focus on **integration concerns only** (breadcrumb rendering, layout shell composition, real content after redirect).

**Also:** `bucket-routes.browser.test.tsx` re-declares the routing table inline (`StorageRoutes` at lines 22-33) instead of importing the real router config. This creates drift risk. **Import the real route config** so changes are automatically covered.

### 1.2 Sidebar rendering duplication: `app-view` vs `bucket-list-panel`

`app-view` test `'renders the list panel shell on the index route'` asserts `Global Servers` + `Server Details` + `Servers List` are all visible — the union of three separate `bucket-list-panel` tests.

| Assertion | `app-view` | `bucket-list-panel` |
|-----------|------------|---------------------|
| `Global Servers` visible | line 214 | lines 129, 202 |
| `Server Details` visible | line 215 | lines 136, 203 |
| `Servers List` visible | line 216 | lines 143, 210 |
| `S3 connectors` visible (advanced) | line 246 | lines 188, 211 |

**Action:** Remove the three standalone element-rendering assertions from `app-view`'s `'renders the list panel shell'` test (they're covered exhaustively by `bucket-list-panel`). Keep only integration-unique assertions (detail panel content, layout composition).

### 1.3 Internal redundancy in `bucket-list-panel.browser.test.tsx`

`Global Servers` is asserted in **two** tests: `'should render the Global Servers section'` (line 129) and `'should render both Global Servers and Server Details sections'` (line 202). Same for `Server Details` (lines 136, 203), `Servers List` (lines 143, 210), and `S3 connectors` (lines 188, 211).

**Action:** Delete the composite `'should render both Global Servers and Server Details sections'` (line 202) and `'should render all navigation items in advanced mode'` (line 210) tests — they are strict unions of the individual tests that precede them.

**Tests removed:** 2

### 1.4 Duplicated mock scaffold: `app-view` vs `bucket-list-panel`

~90 lines of mocking are duplicated nearly verbatim:

| Setup element | `app-view` location | `bucket-list-panel` location |
|---------------|---------------------|------------------------------|
| `SERVERS` array (2 servers, identical attrs) | lines 28-45 | lines 41-58 |
| `GetAllConfig` interceptor | lines 91-93 | lines 68-72 |
| `GetAllServers` interceptor | line 94 | lines 60-66 |
| SOAP `/service/admin/soap/zextras` handler | lines 100-127 | lines 76-101 |
| REST `/getAllServers` + `/services/catalog/services` | lines 95-97, 128-131 | lines 102-105 |
| `getQueryClient()` + `grantUserConfigRights` | lines 174-175 | lines 224-225 |

**Action:** Extract a shared test fixture into a new file (e.g., `views/tests/helpers/storage-test-setup.ts`) that exports:
- `STORAGE_TEST_SERVERS` constant
- `setupStorageInterceptors(options?)` function
- `setupStorageTestClient()` function

Then import in both test files.

**Label discrepancy to investigate:** `app-view` queries the server search as `'Search for a Server'` (line 202) while `bucket-list-panel` queries it as `'Select a Server'` (line 150). These target the same element — verify which label is correct.

---

## 2. Overly Granular Rendering Tests

**Pattern:** N separate tests, each mounting the component once to assert a single element visible. These should be 1 test with N `toBeVisible()` assertions.

### Consolidation targets

| File | Describe block | Current tests | Consolidated tests | Removed |
|------|---------------|---------------|-------------------|---------|
| `hsm-setting-panel.browser.test.tsx` | `Rendering` | 11 | 2 (`scheduling section`, `policies list section`) | **9** |
| `delete-hsm-policy.browser.test.tsx` | `Rendering` | 8 | 1 (`renders the default delete view`) | **7** |
| `edit-hsm-policy-detail-section.browser.test.tsx` | `Item type checkboxes` | 5 | 1 (`renders all item-type checkbox labels`) | **4** |
| `volumes-list.browser.test.tsx` | CE `Rendering` | 5 | 1 (`renders the CE-mode volume panel`) | **4** |
| `edit-hsm-policy-detail-section.browser.test.tsx` | `Rendering` (headers) | 4 | 1 (`renders section headers and server info`) | **3** |
| `bucket-detail-panel.browser.test.tsx` | `Table headers` | 3 | 1 (`renders table column headers`) | **2** |
| `bucket-detail-panel.browser.test.tsx` | `Bucket list with data` (display only) | 3 | 1 (`displays bucket labels, names, and IDs`) | **2** |
| `bucket-detail-panel.browser.test.tsx` | `Rendering` | 3 | 1 (`renders panel header, button, and filter`) | **2** |
| `server-detail-panel.browser.test.tsx` | CE `Table headers` | 3 | 1 (`renders CE table headers`) | **2** |
| `edit-hsm-policy-detail-section.browser.test.tsx` | `Criteria section` (render checks) | 3 | 1 (`renders criteria controls`) | **2** |
| `server-detail-panel.browser.test.tsx` | CE `Server list with data` | 2 | 1 (`displays server names and descriptions`) | **1** |
| `server-detail-panel.browser.test.tsx` | CE `Server row click navigation` | 2 | 1 (use `it.each`) | **1** |
| `volumes-list.browser.test.tsx` | `mapAdvancedVolume` isCurrent | 2 | 1 (use `it.each([true, false])`) | **1** |
| `volumes-list.browser.test.tsx` | `mapAdvancedVolume` storeType | 2 | 1 (use `it.each`) | **1** |
| `volumes-list.browser.test.tsx` | Advanced `Rendering` | 2 | 1 (drop subsumed test) | **1** |
| `delete-hsm-policy.browser.test.tsx` | `Button states` | 2 | 1 | **1** |
| **Total** | | **71** | **~19** | **~41** |

### In-repo template to follow

`hsm-policy-settings.browser.test.tsx` already consolidates correctly:
- Single test `'renders all item type checkboxes (All, Message, Document, Event, Contact)'` — 5 assertions in one test
- Section heading + helper text pairs grouped together

### Detailed consolidation examples

**`hsm-setting-panel.browser.test.tsx` — `Rendering` (11 → 2):**

```
Before (11 tests, 11 mounts):
  should render the server name in the title
  should render the Scheduling section label
  should render the Enable Scheduler switch
  should render the Schedule input with example
  should render the Apply Deduplication switch
  should render the HSM Policies List section
  should render the New button
  should render the Run All button
  should render the Delete button
  should render the Minimum Space Threshold input
  should render the default policy warning message

After (2 tests, 2 mounts):
  should render the scheduling section with all controls
    → assert: title, Scheduling label, Enable Scheduler switch,
      Schedule input, Apply Deduplication switch, Minimum Space Threshold

  should render the HSM policies list section with all controls
    → assert: HSM Policies List section, New button, Run All button,
      Delete button, default policy warning message
```

**`delete-hsm-policy.browser.test.tsx` — `Rendering` (8 → 1):**

```
Before (8 tests, 8 mounts):
  should render the modal title
  should render the confirmation message
  should render the Cancel button
  should render the Delete button
  should render the Help button
  should render the HSM Policy label
  should display the selected policy value with type prefix
  should display the clipboard copy hint message

After (1 test, 1 mount):
  should render the delete confirmation modal with all elements
    → assert all 8 elements visible in one render cycle
```

Note: The `Cancel`/`Delete` button rendering is also implicitly proven by the interaction tests that click them.

---

## 3. Duplicated Popover/Modal Patterns

**Files involved:**

| File | Component | Primitive | Popover tests |
|------|-----------|-----------|---------------|
| `views/bucket/tests/delete-bucket-model.browser.test.tsx` | `DeleteBucketModel` | native HTML `popover` | 2 |
| `views/bucket/tests/verify-changes-modal.browser.test.tsx` | `VerifyChangesModal` | native HTML `popover` | 2 |
| `views/bucket/tests/verify-error.browser.test.tsx` | `VerifyError` | native HTML `popover` | 1 |

All three components implement the same `useEffect`:
```ts
useEffect(() => {
  if (open) popoverRef.current?.showPopover();
  else      popoverRef.current?.hidePopover();
}, [open]);
```

### 3.1 Extract shared popover helper

**Action:** Create `assertPopoverOpenCloseBehavior` in `packages/admin-ui-test-utils`:

```ts
export async function assertPopoverOpenCloseBehavior(
  renderOpen: () => Promise<void>,
  renderClosed: () => Promise<void>,
): Promise<void> {
  const showSpy = vi.spyOn(HTMLElement.prototype, 'showPopover');
  await renderOpen();
  expect(showSpy).toHaveBeenCalledTimes(1);

  const hideSpy = vi.spyOn(HTMLElement.prototype, 'hidePopover');
  await renderClosed();
  expect(hideSpy).toHaveBeenCalledTimes(1);
}
```

Then replace the 5 individual popover tests across 3 files with calls to this helper (or fold the assertion into existing interaction tests).

**Tests removed/extracted:** 5

### 3.2 Remove strict-subset test in `verify-error`

Test 3 (`'should hide popover when close button is clicked'`) is a strict subset of test 4 (`'should hide popover without retry when cancel is clicked'`):

- Both click a button that calls the same `handleClose` function
- Both assert `hidePopover` was called
- Test 4 additionally asserts `onRetry` was NOT called

**Action:** Delete test 3.

**Tests removed:** 1

### 3.3 Remove redundant render-button checks in `delete-hsm-policy`

Render tests `'should render the Cancel button'` and `'should render the Delete button'` are implicitly proven by interaction tests `'should call setShowDeletePolicyView(false) when Cancel is clicked'` and `'should call onDeletePolicy when Delete is clicked'` — you cannot click a button that doesn't render.

**Action:** Already handled by the Rendering consolidation in section 2 (8 → 1).

---

## 4. Service Test Redundancy

### 4.1 `services/tests/bucket-service.test.ts` (~22 tests → ~6-8)

**Root cause:** The four mutation functions are identical passthroughs:
```ts
// createS3Connector, updateS3Connector, deleteS3Connector, testS3Connector
// ALL share this exact body:
return parseSoapContent(await fetchSoap('zextras', payload));
```

| Redundant pattern | Current tests | Issue | Action |
|-------------------|--------------|-------|--------|
| "should pass payload directly to fetchSoap" | ×4 (one per function) | Identical passthrough asserted 4× | Collapse to 1 table-driven |
| "should return mutation response on success" | ×4 | Same `parseSoapContent` path 4× | Collapse to 1 `it.each` |
| "should return failure response when server signals error" | ×3 | Same passthrough returning `{ ok: false }` 3× | Collapse to 1 `it.each` |
| `fetchSoap` plumbing test | ×1 | Tautology — already covered by all above | **Delete** |
| `listS3Regions` vs `listS3Connector` mirror tests | ×4 each (8 total) | Same logic, differ only in action string + error msg | Collapse each set to 1 `it.each` over both functions |
| `parseSoapContent` missing-content (2 tests) + `deleteS3Connector` throw (1 test) | ×3 | Triple coverage of same `if (!content)` guard | Collapse to 1 |

**Target structure:**
```
describe('bucket-service')
  describe('parseSoapContent')
    - throws when content is missing/empty (1 test, it.each over input variants)

  describe('list functions (parameterized)')
    - it.each([listS3Regions, listS3Connector]) returns values on success
    - it.each(...) returns empty array when values absent
    - it.each(...) throws server error when ok is false
    - it.each(...) throws fallback message when ok false and no error

  describe('mutation functions (parameterized)')
    - it.each([create, update, delete, test]) returns response on success
    - it.each([create, delete, test]) returns failure when ok is false
    - it.each([create, update, delete, test]) passes payload to fetchSoap
```

**Tests reduced:** ~22 → ~8

### 4.2 `modify-volume-save-handlers.test.ts` (12 → ~8)

| Redundant group | Current | Issue | Action |
|-----------------|---------|-------|--------|
| `handleAdvancedUpdateResponse` error paths | 3 tests (ok=false, ok missing, content missing) | All exercise the same `if (updateResponse?.ok)` falsy branch | Collapse to 1 parameterized test |
| `saveCeVolume` numeric mapping vs payload | 2 tests | Payload test already asserts `compressBlobs: 0, isCurrent: 0`; mapping test only adds `true → 1` | Fold into payload test with `it.each` |

**Tests reduced:** ~4

### 4.3 `services/tests/volume-service.test.ts` (5 → 3-4)

| Redundant group | Current | Issue | Action |
|-----------------|---------|-------|--------|
| `isCurrent` normalization | 2 tests (`1 → true`, `0 → false`) | Both test the same `=== 1` expression | Merge into 1 `it.each` |

**Tests reduced:** ~1

### 4.4 `modify-volume-payload.test.ts` — no redundancy, but over-specified

OPENIO/SWIFT tests assert magic placeholder values (`proxyPort: 1`, `proxyPort: 10`) instead of key presence. Not redundant, but brittle.

**Action (optional):** Loosen to `expect(payload).toHaveProperty('proxyPort')` rather than exact-value assertions.

---

## 5. Implementation Order

Prioritized by impact and independence:

### Phase 1: Extract shared helpers (unblocks others)

- [ ] Create `storage-test-setup.ts` shared mock fixture (section 1.4)
- [ ] Create `assertPopoverOpenCloseBehavior` helper in `admin-ui-test-utils` (section 3.1)

### Phase 2: Service test consolidation (independent, fast)

- [ ] Refactor `bucket-service.test.ts` to table-driven (~14 tests removed)
- [ ] Consolidate `modify-volume-save-handlers.test.ts` error paths (~4 removed)
- [ ] Merge `volume-service.test.ts` isCurrent tests (~1 removed)

### Phase 3: Granular rendering consolidation (bulk of savings)

- [ ] `hsm-setting-panel.browser.test.tsx` Rendering (9 removed)
- [ ] `delete-hsm-policy.browser.test.tsx` Rendering (7 removed)
- [ ] `edit-hsm-policy-detail-section.browser.test.tsx` checkboxes + headers (9 removed)
- [ ] `volumes-list.browser.test.tsx` CE rendering + isCurrent/storeType (7 removed)
- [ ] `bucket-detail-panel.browser.test.tsx` 3 groups (6 removed)
- [ ] `server-detail-panel.browser.test.tsx` headers + data + nav (5 removed)
- [ ] `hsm-setting-panel.browser.test.tsx` Button states (1 removed)

### Phase 4: Route/navigation deduplication

- [ ] Refactor `app-view.browser.test.tsx` to remove route-mapping overlap with `bucket-routes` (section 1.1)
- [ ] Remove duplicated sidebar assertions from `app-view` (section 1.2)
- [ ] Delete composite tests in `bucket-list-panel.browser.test.tsx` (section 1.3, 2 removed)
- [ ] Import real route config in `bucket-routes.browser.test.tsx` (section 1.1)
- [ ] Wire both app-view and bucket-list-panel to shared mock fixture (section 1.4)

### Phase 5: Popover pattern cleanup

- [ ] Replace 5 popover tests with shared helper calls (section 3.1)
- [ ] Delete strict-subset test in `verify-error.browser.test.tsx` (section 3.2)

---

## Summary

| Category | Files | Tests before | Tests after | Removed |
|----------|-------|-------------|-------------|---------|
| Route/nav overlap | 3 | ~30 | ~20 | ~10 |
| Granular rendering | 7 | ~71 | ~19 | ~41 |
| Popover patterns | 3 | ~19 | ~14 | ~5 |
| Service tests | 3 | ~39 | ~20 | ~19 |
| **Total** | **~13** | **~159** | **~73** | **~75** |

All consolidations preserve behavioral coverage — they remove only tests that assert identical code paths with identical inputs, or that are strict subsets of other tests.
