# Input Component Family — Design

Date: 2026-09-22 (revised same day)
Status: Approved

## Context

`packages/ui-components/src/components/inputs/Input.tsx` is the legacy text-entry primitive, used in 109 app files (220 call sites) plus 4 internal wrappers (`PasswordInput`, `DatePicker`, `DropDownInput`, `InheritedInput`). Its API is legacy: `Container`-based layout, floating label, `CustomIcon` render prop, theme-util string concatenation, and an a11y baseline with no `aria-invalid`/`aria-describedby` wiring.

We are building a **family of small, intent-specific React components** instead of one god component. Usage analysis of all 220 call sites produced the taxonomy below.

Decision record:
- **React, not Lit**: all call sites use React-coupled APIs (`React.ChangeEvent`, controlled `value`, render props); the repo's `ds-*` Lit layer covers only non-interactive display primitives. Native `<input>` in light DOM gives the strongest accessibility (label association, autofill, password managers, IME, native validity).
- **Old `Input` stays untouched**: no rename, no deprecation, no codemod. Apps migrate **form by form**; the legacy component is retired naturally as forms move over.
- **No god component**: each public component has one clear intent and a minimal API. Shared visuals live in a private shell.
- **Error/description support is deferred**: will be added to the shell via TDD when the first migrating form needs validation.
- **TDD**: every component is built test-first (browser tests).

## Component taxonomy (evidence from usage analysis)

| Component | Intent | Call-site evidence |
|---|---|---|
| `PlainInput` | labeled single-line text field, native props passthrough | 168 sites (109 TanStack-form + 59 local-state) |
| `SearchInput` | filter/search box: search icon, clear button, label | 24 sites |
| `NumberInput` | numeric quantity: digit filtering, optional unit suffix, min/max | ~15 sites |
| `PasswordInput` | secret with show/hide toggle (real button, `aria-pressed`), `autoComplete` defaults | 4 raw + 4 wrapper files |
| `ComboboxInput` | type-to-filter + pick — full ARIA 1.2 combobox/listbox (replaces `DropDownInput`, which has no combobox semantics) | 19 files |
| `InheritedInput` | COS-override field: inherited vs overridden value, accessible revert button, provenance for AT | 8 files (+ related `InheritedSelect` ×8, `InheritedSwitch` ×13) |

Explicitly not components (compose at call site or defer): help-tooltip icon (7 sites), token entry w/ paste hygiene (3 sites), clearable plain fields (2 sites). `backgroundColor` is dropped from the new APIs — 218/220 call sites render the same default; it is noise, not a variant.

Deferred for later (decided): `DatePicker` (repair a11y, not rebuild), `TextArea`/`CustomTextArea` family, `InheritedSelect`/`InheritedSwitch`.

**Build order is dictated by the first migrating form.** `PlainInput` is built first: it is the workhorse and hardens the shared shell for the rest.

## Shared foundation (private, unexported)

`FieldShell` — renders `root > label + box > children`:

```html
<div class="root">
  <label class="label" for={id}>label</label>
  <div class="box" data-disabled={...}>
    <input id={id} class="input" ... />
  </div>
</div>
```

- `id` comes from the public component (React `useId()` unless the caller provides one) — `<label htmlFor>` is always wired.
- All six family members compose `FieldShell` + intent-specific behavior. Only intent-named components are exported.

## PlainInput API (approved)

```tsx
type PlainInputProps = React.ComponentPropsWithRef<'input'> & {
  /** Always rendered as a visible <label> above the field. */
  label: string;
};

export const PlainInput = ({ label, id, ...rest }: PlainInputProps) => { ... };
```

- Every native `<input>` prop (`value`, `onChange`, `type`, `disabled`, `required`, `autoComplete`, `placeholder`, `ref`, …) is passed straight through, natively typed; caller `className` is merged with the internal one.
- Controlled and uncontrolled usage work exactly like native HTML.
- Error support later extends the type (`& { hasError?: boolean; description?: string }`) without breaking changes.

## Visual states (from design spec)

Box: `display: flex; height: 2.5rem; padding: 0.625rem 0.75rem; justify-content: space-between; align-items: center; flex-shrink: 0; align-self: stretch; border-radius: 0.25rem; background: #FFF;`

| State | Spec |
|---|---|
| resting | border `1px solid #858C93` (no theme token exists — literal) |
| hover | border `1px solid #225CA8` → `var(--color-primary-hover)` |
| focused | ring totaling 3px of `rgba(43,115,210,0.25)` |
| disabled | no spec provided — gray background token + `cursor: not-allowed`, native `disabled` attr (flag: replace if a Figma spec arrives) |

- **Focus ring uses `box-shadow`, not a literal 3px border** (approved): on focus the 1px border-color becomes `rgba(43,115,210,0.25)` and a 2px outer `box-shadow` of the same color is added — visually identical to the literal 3px spec, with no content shift. The box uses `:focus-within` since the native input is the focus target.
- Label: secondary color, small font size, small gap above the box (minor visual, adjustable at review).
- `required` is native-only in v1 (free `aria-required`); the visual `*` marker comes with the error work later.

## Accessibility

- Visible `<label htmlFor>` above the field, always present (`label` is a required prop).
- Native `<input>` unmodified: keyboard, screen reader, autofill, IME all work as plain HTML.
- No ARIA needed in v1 beyond what native provides.

## Testing (TDD) — PlainInput

Browser test file `components/inputs/tests/plain-input.browser.test.tsx` (repo conventions; global `testTimeout` from `vitest.config.base.ts`). Red-green cycles:

1. Label association + id wiring (`getByRole('textbox', { name })`; custom `id` respected by `htmlFor`)
2. Controlled mode (`value` + `onChange` with `e.target.value`) and uncontrolled (`defaultValue`)
3. `disabled` blocks typing + disabled styling
4. Focus ring + hover border via computed styles
5. Native passthrough (`placeholder`, `type`, `autoComplete`, `required`, `ref` → `HTMLInputElement`)

## Files

File naming convention for the family: **kebab-case** (`plain-input.tsx`, `search-input.tsx`, …). Exported component/type names stay PascalCase (`PlainInput`, `PlainInputProps`).

- `packages/ui-components/src/components/inputs/field-shell.tsx` (private)
- `packages/ui-components/src/components/inputs/field-shell.module.css`
- `packages/ui-components/src/components/inputs/plain-input.tsx`
- `packages/ui-components/src/components/inputs/tests/plain-input.browser.test.tsx`
- Barrel: add `export * from './components/inputs/plain-input';` in the Inputs section of `src/index.ts`

## Verification

- `pnpm vitest run packages/ui-components/src/components/inputs/tests/plain-input.browser.test.tsx`
- `pnpm type-check`
- `pnpm lint`
- ui-components test suite for regressions (legacy `Input` untouched, so risk is low)
