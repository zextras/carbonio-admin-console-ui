# COS App Routing Analysis

## Route Tree

```
/manage/cos                                    → AppView (always renders both panels)
  ┌─ CosListPanel (left panel, always mounted)
  └─ CosDetailPanel (right panel, nested routes):
       /manage/cos/cos_list                         → CosList (table)
       /manage/cos/create-new-cos                   → CreateCos (form)
       /manage/cos/:cosId/:operation                → CosDetailOperation
         /manage/cos/:cosId/general_information
         /manage/cos/:cosId/features
         /manage/cos/:cosId/wsc
         /manage/cos/:cosId/preferences
         /manage/cos/:cosId/server_pools
         /manage/cos/:cosId/advanced
```

## How `replaceHistory` Works

`replaceHistory` (from `@zextras/ui-shared`) resolves relative paths against the current registered route:

1. Finds the registered route whose path matches the current URL prefix (e.g. `manage/cos`)
2. Prepends it: `"/manage/cos" + "/{cosId}/general_information"` → `/manage/cos/{cosId}/general_information`
3. Uses `history.replace` (not `push`) — no browser back-button entry

So `replaceHistory("/${cosId}/general_information")` resolves to `/manage/cos/${cosId}/general_information`.

## All Navigation Calls

| File | Line | Call | Resolved URL | Notes |
|------|------|------|-------------|-------|
| `app.tsx` | 108 | `navigate("/manage/cos/create-new-cos")` | `/manage/cos/create-new-cos` | push |
| `cos-list-panel.tsx` | 103 | `replaceHistory("/${cosInfo.id}/general_information")` | `/manage/cos/${id}/general_information` | replace |
| `cos-list-panel.tsx` | 118 | `replaceHistory("/cos_list")` | `/manage/cos/cos_list` | replace |
| `cos-list-panel.tsx` | 160 | `replaceHistory("/${selectedCosId}/${view}")` | `/manage/cos/${id}/${view}` | replace |
| `cos-list-panel.tsx` | 169 | `replaceHistory("/${cosData.id}/general_information")` | `/manage/cos/${id}/general_information` | replace |
| `cos-list.tsx` | 105 | `replaceHistory("/${Cos.id}/general_information")` | `/manage/cos/${id}/general_information` | replace |
| `cos-general-information.tsx` | 321 | `replaceHistory("/")` | `/manage/cos/` | replace, ambiguous |
| `create-new-cos.tsx` | 53 | `replaceHistory("/${cos.id}/general_information")` | `/manage/cos/${id}/general_information` | hardcoded string |
| `create-new-cos.tsx` | 55 | `replaceHistory("/")` | `/manage/cos/` | replace, ambiguous |
| `create-new-cos.tsx` | 99 | `navigate("/manage/cos")` | `/manage/cos` | push |
| `general-list-panel.tsx` | 24 | `replaceHistory("/cos_list")` | `/manage/cos/cos_list` | replace |

## How cosId Is Obtained

Three different mechanisms are used across the app:

### A. `useParams()` — used by detail views (correct)

These components are rendered under the `/:cosId/:operation` route in `CosDetailPanel`, so `useParams()` works:

- `cos-general-information.tsx:47` — `const { cosId } = useParams()`
- `cos-features.tsx:29`
- `cos-advanced.tsx:92`
- `cos-server-pools.tsx:47`
- `COSPreferences.tsx:33`
- `wsc-cos-settings.tsx:24`

### B. Manual pathname parsing — `CosListPanel` (anti-pattern)

`cos-list-panel.tsx:120-128` manually splits `pathname` and indexes segments:

```typescript
const segments = pathname.split('/').filter(Boolean);
const urlCosId =
  segments.length >= 4 &&
  segments[0] === MANAGE_APP_ID &&
  segments[1] === COS_ROUTE_ID &&
  segments[2] !== COS_LIST &&
  segments[2] !== CREATE_NEW_COS_ROUTE_ID
    ? segments[2]
    : undefined;
```

### C. Internal React state — `CosListPanel` (anti-pattern)

`cos-list-panel.tsx:51` — `const [selectedCosId, setSelectedCosId] = useState(...)`

The cosId lives in both URL params and React state, synced bidirectionally via effects.

---

## Issues

### 1. `cosView` comparison uses relative paths that never match

**File:** `cos-list-panel.tsx:62-66`

```typescript
const cosView = (() => {
  if (pathname === `/${COS_LIST}` || pathname === '/') return COS_LIST;
  ...
})();
```

`pathname` from `useLocation()` is the full path (e.g. `/manage/cos/cos_list`). The comparison `pathname === '/cos_list'` **never matches**. It works by accident because the fallback segment parser returns the last segment.

### 2. Dual cosId state (URL + React state) creates fragile sync

`CosListPanel` maintains its own `selectedCosId` state separate from the URL. Sync chain:

1. User clicks COS → `setSelectedCosId(id)` + `replaceHistory` (line 168-169)
2. URL changes → `useEffect([pathname])` fires (line 108)
3. Effect re-parses URL → conditionally calls `setSelectedCosId` again (line 130)

The guard `urlCosId !== selectedCosId` prevents infinite loops but creates a fragile dependency chain.

### 3. `CosListPanel` cannot use `useParams()` for cosId

`CosListPanel` is rendered under the catch-all `/*` route in `app-view.tsx`, not under `/:cosId/:operation`. The `cosId` param is only available inside `CosDetailPanel`'s child routes. This is why manual pathname parsing was needed.

### 4. Manual pathname parsing with magic indices

`cos-list-panel.tsx:120-128` and `cos-list-panel.tsx:62-66` manually index URL segments by position. Tightly coupled to the URL structure — breaks if routes are reorganized.

### 5. Mixed navigation APIs

- `replaceHistory` — relative to current route, uses `history.replace` (no back button)
- `useNavigate` — absolute paths, uses `history.push` (adds to history)

`create-new-cos.tsx` uses **both**: `replaceHistory` on success (line 53) but `navigate` on cancel (line 99). Inconsistent UX — success has no back-button entry, cancel does.

### 6. Hardcoded string instead of constant

`create-new-cos.tsx:53`:

```typescript
replaceHistory(`/${cos.id}/general_information`);
```

Every other file uses the `GENERAL_INFORMATION` constant. Breaks if the constant value changes.

### 7. `replaceHistory("/")` is ambiguous

`cos-general-information.tsx:321` and `create-new-cos.tsx:55` call `replaceHistory("/")` which resolves to `/manage/cos/`. Works but the intent is unclear — navigating to "/" actually navigates to the COS base route.

### 8. URL flash on initial load

When navigating to `/manage/cos`, the pathname effect in `cos-list-panel.tsx:108-133` resets all state and redirects to `/manage/cos/cos_list`, causing a visible URL flash.

### 9. `cosName` effect can trigger unnecessary `replaceHistory`

`cos-list-panel.tsx:96-105`: Whenever `cosInformation` changes (which happens when `useCosDetail` refetches), this effect calls `replaceHistory` again — even if the URL is already correct. This can cause unnecessary re-renders.

---

## Recommendations

1. **Restructure routes** so `CosListPanel` can access `cosId` via `useParams()` or a shared context, eliminating manual pathname parsing
2. **Eliminate duplicate `selectedCosId` state** — derive it solely from the URL
3. **Replace all pathname parsing with route params or a shared hook**
4. **Standardize on one navigation API** (either `replaceHistory` or `navigate`, not both)
5. **Use the `GENERAL_INFORMATION` constant** in `create-new-cos.tsx:53`
6. **Replace `replaceHistory("/")` with explicit paths** for clarity
