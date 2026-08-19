# Design: Convert GlobalDetailPanel to TanStack Form

Date: 2026-08-19
Scope: `apps/admin-ui-domains/src/views/domain/global/global-detail-panel.tsx` (rendered at `/manage/domains/global` and `/manage/domains/global/settings`)

## Goal

Replace the legacy `useState`/triple-`useEffect` isDirty state management with a TanStack Form implementation, following the repo's reference patterns (`apps/admin-ui-backup/src/views/backup/server-advanced/server-advanced.tsx`, `apps/admin-ui-storage/src/views/hsm/hsm-setting-panel.tsx`). UI layout and SOAP behavior stay the same.

## Decisions (user-approved)

1. **Invalid sender email blocks the whole save** (standard TanStack Form validation) instead of the current partial-save behavior.
2. **Single file structure** — only 5 fields; wrapper + content components in one file (server-advanced pattern), no child section files.
3. **Named arrow function export**, no `FC`, no default export (AGENTS.md conventions). Update the import in `views/global-section-routes.ts`.
4. **TDD**: new browser test suite written before/with the implementation.

## Architecture

### Dependencies

Add `@tanstack/react-form: ^1.32.0` to `apps/admin-ui-domains/package.json` dependencies.

### Component split (one file)

1. **Wrapper** `GlobalDetailPanel` — calls `useAllConfig()`; renders `ds-spinner` while `isPending`; renders `<GlobalDetailPanelContent configInformation invalidate />` once loaded. Gating on load is required because TanStack Form captures `defaultValues` at mount.
2. **Content** `GlobalDetailPanelContent` — owns the form.

### Form shape

```ts
type GlobalSettingsFormValues = {
  carbonioNotificationFrom: string;
  carbonioNotificationRecipients: Array<ChipItem>;
  zimbraDomainMandatoryMailSignatureEnabled: boolean;
  zimbraAmavisOutboundDisclaimersOnly: boolean;
  carbonioSearchAllDomainsByFeature: boolean;
};
```

### Pure mappers

- `mapConfigToFormValues(config)` — sender = first matching `_content` (fallback `''`); recipients = one `{label}` per matching entry; booleans = `content === TRUE` with `false` fallback.
- `mapFormValuesToAttributes(values)` — `carbonioNotificationFrom` always pushed (empty string clears server value); one attr per recipient; booleans as `TRUE`/`FALSE`.

### Validation

Zod schema, `onChange` + `onSubmit`: `carbonioNotificationFrom` refines `v === '' || isValidEmail(v)` (reuses `isValidEmail` from `src/views/utility/utils.ts`). Errors surfaced via `field.state.meta.errors` on the Input (`hasError`, `description`).

### Fields

All 5 fields rendered via `form.Field`: Input, ChipInput (invalid emails filtered inside `handleChange`), 3 Switches (`field.handleChange(!field.state.value)`).

### Dirty / cancel / save

- `isDirty`: `useSelector(form.store, (s) => !s.isDefaultValue)` — replaces the 3 conflicting `useEffect`s.
- Cancel: `form.reset()`.
- Save: `form.handleSubmit()` → `onSubmit`:
  1. `await modifyConfig(attributes)`
  2. conditional delayed disclaimer snackbars (compare `value` vs pre-save defaults; setTimeout 2000/4000 — preserved from legacy)
  3. `form.reset(value, { keepDefaultValues: true })` + `invalidate()` (AGENTS.md post-save pattern)
  4. success/error snackbars as today

## Tests

New `apps/admin-ui-domains/src/views/domain/global/tests/global-detail-panel.browser.test.tsx` using `setupBrowserTest`, `createBrowserSoapAPIInterceptor('GetAllConfig', ...)`, MSW capture of `/service/admin/soap/ModifyConfig`, `resetMockWorker`:

1. Renders fields from GetAllConfig (sender, recipients, switch states)
2. No Save/Cancel until dirty; appear after edit; disappear after Cancel
3. Invalid sender email → inline error, save blocked, no ModifyConfig call
4. Save emits correct ModifyConfig payload; post-save isDirty cleared
5. Save error → error snackbar, stays dirty

## Verification

- `pnpm vitest run apps/admin-ui-domains/src/views/domain/global/tests/global-detail-panel.browser.test.tsx --reporter=verbose`
- `pnpm --filter @zextras/admin-ui-domains type-lint`
- Re-run `apps/admin-ui-domains/src/views/tests/domain-content-panel.browser.test.tsx` (imports changed route config)
