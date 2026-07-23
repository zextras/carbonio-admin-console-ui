# Improvement Recommendations — `domain-list.tsx`

Review against the codebase, especially the sibling reference
`apps/admin-ui-cos/src/views/cos/cos-list/cos-list.tsx` (the cleanest
implementation of this exact list pattern).

---

## Critical — bugs & correctness

1. **Crash on unknown status.** `STATUS_COLOR[domainIteam.zimbraDomainStatus].color`
   (lines 184, 189) throws if the server returns a status not in the map.
   `cos-list.tsx:75-81` solves this with a `getStatusDisplay()` fallback.
   Default status is hardcoded to `'active'` (line 147), but server data is
   uncontrolled.
2. **`eslint.config.js:93-113` applies an extra-strict override to *this folder
   only*** — `react-hooks/use-memo`, `preserve-manual-memoization`,
   `react-compiler/react-compiler`, and the full `jsx-a11y` ruleset are all
   `error`. This file currently violates several:
   - `STATUS_COLOR` (lines 90-119) is recreated on every render
     (manual-memoization concern).
   - `onClick` on non-interactive `<ds-text>` spans (lines 172, 185) trips
     `jsx-a11y/click-events-have-key-events` + `no-static-element-interactions`.
3. **Duplicate React keys** — both columns use `key={item?.id}` (lines 169, 183).
   Should be `${id}-name` / `${id}-status`.
4. **Typo `iteam`** (lines 140, 143, 192) — propagated everywhere; should be
   `item`.

---

## Architecture — align with the `cos-list.tsx` reference

5. **Use `ClickableRowFactory` + per-row `onClick`** instead of
   `HoverableRowFactory` with `onClick` duplicated on each `<ds-text>`. The
   `Table` component
   (`packages/ui-components/src/components/display/Table.tsx:62-74`) natively
   supports `TRow.onClick` — current code bypasses it and duplicates the
   handler.
6. **Hoist `STATUS_COLOR` to module scope** via a `buildStatusColorMap(t)`
   builder (same pattern as `general-information-form.tsx:44-67`). Fixes the
   memoization lint hit.
7. **Replace the inline `forEach`+if/else-if attribute parser** (lines 152-162)
   with the `parseCosAttributes()` pattern (`cos-list.tsx:57-73`) — ideally a
   shared `attributesToObject()` helper, since **no shared helper exists**
   despite 12+ call sites reimplementing this across `domain-resources.tsx`,
   `domain-mailing-list.tsx`, etc.
8. **Hoist `headers`** out of the component body.

---

## Cross-app DRY opportunities

9. **Lift `useDomainSearch` into `packages/ui-shared`** — its twin `useCosList`
   is already there with a byte-for-byte identical config (`staleTime`, `retry`,
   `keepPreviousData`).
10. **Lift `useDebouncedValue` into `ui-shared`** — currently copy-pasted
    identically in `admin-ui-domains` and `admin-ui-cos` (5 consumers).
11. **Unify the `Attribute` type** — defined locally in 6 places. Move to
    `ui-shared`.
12. **Rename `gardian.svg` → `guardian.svg`** and update 15 imports (the
    misspelling is the de-facto standard; only 1 file uses the correct name).

---

## UX / loading states (matching `cos-list.tsx`)

13. **Add `isPending` skeleton** (`<ds-page-shimmer>`) for the initial load —
    current code shows only a centered spinner while *keeping the empty state
    mounted*, which flickers.
14. **Add an in-page error fallback** — current code shows a snackbar only; on
    error the user sees an empty list with no explanation.
15. **Empty state + table both render at once** (line 276 sets table height to
    `'50%'`) — layout conflict; gate the table when empty.

---

## Code quality

16. **Extract magic numbers** to named constants: `700` (debounce),
    `'3.625rem'`, `'-4rem'`, `'53%'`. `cos-list.tsx` defines
    `DEBOUNCE_SEARCH_DELAY`, `HEADER_HEIGHT`, etc.
17. **Type the service** — `search-domain-service.ts` returns `Promise<any>`;
    the locally-declared `ZimbraDomainResponse` (lines 40-45) should be the
    service's generic param.
18. **`onDomainSelect`** uses `domain?.id` (line 128) but `domain` is
    non-optional — drop the `?.`.

---

## Suggested implementation plan

Two passes recommended:

- **Pass A (this file, low-risk):** items 1, 3, 4, 5, 6, 8, 16, 18 — purely
  local changes, all mirror existing patterns in `cos-list.tsx`. Makes the file
  lint-clean under the strict override and removes the crash bug.
- **Pass B (cross-app, higher-touch):** items 7, 9, 10, 11, 12 — shared-package
  refactors that touch multiple apps; worth a separate PR with broader test
  runs.
