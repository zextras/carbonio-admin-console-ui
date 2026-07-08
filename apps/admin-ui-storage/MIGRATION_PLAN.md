# Migration Plan: admin-ui-storage -> TanStack Form

**Jira:** [CO-3977](https://zextras.atlassian.net/browse/CO-3977)
**Goal:** Modernize all form handling in `admin-ui-storage/` to match the patterns established in `admin-ui-cos/`: TanStack Form + Zod validation + shared form utilities + React Compiler ESLint enforcement.

---

## Phase 0 -- Promote shared form utilities to `@zextras/ui-components`

**Rationale:** `RouteLeavingGuard` is already duplicated across 3 apps. `FormPageLayout` and `getFieldErrorProps` will be needed by storage too. Promoting them now eliminates duplication and gives all apps a shared foundation.

### Step 0.1: Add `@tanstack/react-form` to ui-components
- Add `@tanstack/react-form` as a dependency in `packages/ui-components/package.json`
- Add `@tanstack/react-store` as a dependency (for `useSelector` used in dirty-state tracking)

### Step 0.2: Promote `RouteLeavingGuard`
- Copy `apps/admin-ui-cos/src/views/ui-extras/nav-guard.tsx` -> `packages/ui-components/src/components/utilities/route-leaving-guard.tsx`
- Export from `packages/ui-components/src/index.ts`
- Remove local copies from `admin-ui-cos`, `admin-ui-domains`, `admin-ui-backup`
- Update all imports in those 3 apps to `from '@zextras/ui-components'`

### Step 0.3: Promote `FormPageLayout`
- Copy `apps/admin-ui-cos/src/views/form-page-layout.tsx` -> `packages/ui-components/src/components/layout/form-page-layout.tsx`
- Copy `apps/admin-ui-cos/src/views/page-layout.module.css` -> same location
- Update internal imports (Button, RouteLeavingGuard) to use `@zextras/ui-components` paths
- Export from `packages/ui-components/src/index.ts`
- Remove local copy from `admin-ui-cos`
- Update all imports in `admin-ui-cos` forms to `from '@zextras/ui-components'`

### Step 0.4: Promote `getFieldErrorProps` (generalized)
- Copy `apps/admin-ui-cos/src/views/cos/advanced/fields/field-error.ts` -> `packages/ui-components/src/utils/field-error.ts`
- **Generalize**: remove the COS-specific `COS_VALIDATION_MESSAGES` import -- accept error messages as a parameter or return the raw error key for the consumer to resolve
- Export from `packages/ui-components/src/index.ts`
- Update `admin-ui-cos` to import from `@zextras/ui-components` and resolve messages locally

### Step 0.5: Tests
- Add unit tests for all three promoted utilities in `packages/ui-components`

### Step 0.6: Verify
- `pnpm type-check` across workspace
- `pnpm lint` across workspace
- `pnpm test` for `admin-ui-cos`, `admin-ui-domains`, `admin-ui-backup`, `packages/ui-components`

---

## Phase 1 -- Foundation for `admin-ui-storage`

### Step 1.1: Add dependencies
- Add `@tanstack/react-form` to `apps/admin-ui-storage/package.json`

### Step 1.2: Enable React Compiler ESLint
- Edit root `eslint.config.js`: add a new override block:
  ```js
  {
    files: ['apps/admin-ui-storage/**/*'],
    plugins: {
      'react-compiler': reactCompiler,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      ...jsxA11y.configs.recommended.rules,
    },
  },
  ```
- Run `pnpm lint --filter admin-ui-storage` and fix any react-compiler violations (remove `useMemo`/`useCallback` per React Compiler rules)

### Step 1.3: Create form utility scaffolding
- Create `apps/admin-ui-storage/src/views/ui-extras/` (for any storage-specific form helpers not in ui-components)
- Create shared form types file if needed

### Step 1.4: Verify
- `pnpm lint --filter admin-ui-storage` passes with zero react-compiler errors
- `pnpm type-check --filter admin-ui-storage` passes
- Existing tests still pass

---

## Phase 2 -- Volume Create Wizard (#2) -- Reference Implementation

**Why first:** Simplest context-based form, has existing tests, establishes the migration pattern for all subsequent forms.

**Files touched:**
- `src/views/bucket/server-specifics/volume/create-volume/volume-context.ts` -- **delete**
- `src/views/bucket/server-specifics/volume/create-volume/new-volume.tsx` -- wizard shell
- `src/views/bucket/server-specifics/volume/create-volume/mailstores-create.tsx` -- step form
- `src/views/bucket/server-specifics/volume/create-volume/types.ts` -- **create** (form values + API type)
- `src/views/bucket/server-specifics/volume/create-volume/schema.ts` -- **create** (Zod)
- `src/views/bucket/server-specifics/volume/create-volume/tests/` -- update tests

### Step 2.1: Define form values + types
- Create `types.ts`: `VolumeCreateFormValues`, `VolumeCreateFormApi` (`ReactFormExtendedApi` alias)

### Step 2.2: Define Zod schema
- Create `schema.ts`: validate `volumeName` (required), `path` (required), `compressionThreshold` (non-negative int when compression enabled)

### Step 2.3: Migrate wizard shell (`NewVolume`)
- Replace `VolumeContext.Provider` + `useState<VolumeWizardDetail>` with `useForm({ defaultValues, validators, onSubmit })`
- Pass `form` down to `MailstoresCreate` as prop
- Compute `isDirty` via `useSelector(form.store, ...)` for wizard completion gating
- `onSubmit` calls `CreateVolumeRequest` with form values

### Step 2.4: Migrate step form (`MailstoresCreate`)
- Remove `useContext(VolumeContext)` + local error `useState`s
- Use `useField({ form, name })` or `<form.Field>` for each field
- Error display via `getFieldErrorProps()` from `@zextras/ui-components`

### Step 2.5: Update consumers
- `VolumesDetailPanel` / `VolumesDetailRoute` -- remove `VolumeContext` dependency, receive form values via props or callback

### Step 2.6: Tests
- Update existing tests (`new-volume.test.tsx`, `mailstores-create.test.tsx`)
- Add tests for Zod validation rules
- Test wizard completion gating based on form validity

### Step 2.7: Delete old context file
- Remove `volume-context.ts`

### Step 2.8: Verify
- `pnpm test --filter admin-ui-storage`
- `pnpm lint --filter admin-ui-storage`
- `pnpm type-check --filter admin-ui-storage`

---

## Phase 3 -- ModifyVolume (#4) -- Biggest Payoff

**Why second:** Most fragile form (~30 `useState`, ~13 dirty-tracking `useEffect`s). TanStack Form's built-in `isDirty`/`defaultValues` eliminates nearly all manual tracking.

**Files touched:**
- `src/views/bucket/server-specifics/volume/modify-volume/modify-volume.tsx`
- `src/views/bucket/server-specifics/volume/modify-volume/modify-volume-payload.ts`
- `src/views/bucket/server-specifics/volume/modify-volume/modify-volume-save-handlers.ts`
- `src/views/bucket/server-specifics/volume/modify-volume/types.ts` -- **create**
- `src/views/bucket/server-specifics/volume/modify-volume/schema.ts` -- **create**
- `src/views/bucket/server-specifics/volume/modify-volume/tests/` -- update tests

### Step 3.1: Define form values + types
- Create `types.ts`: `ModifyVolumeFormValues`, `ModifyVolumeFormApi`
- Map existing ~15 editable fields to the values type

### Step 3.2: Define Zod schema
- Create `schema.ts`: name (required), compressionThreshold (non-negative int when enabled), infrequentAccessThreshold (when enabled)
- Currently no validation exists -- this is a quality improvement

### Step 3.3: Migrate component
- Replace ~30 `useState` + ~13 `useEffect` dirty trackers with single `useForm({ defaultValues: currentVolume, validators, onSubmit })`
- `form.state.isDirty` replaces all manual dirty tracking
- `form.reset()` replaces manual undo (revert to `previousDetail` snapshot)
- Wrap in `FormPageLayout` (from `@zextras/ui-components`) with Save/Cancel + `RouteLeavingGuard`
- Handle local vs external volume render branches within field rendering

### Step 3.4: Update payload builder
- `modify-volume-payload.ts` receives typed form values instead of raw state

### Step 3.5: Tests
- Update existing tests
- Add tests for dirty detection (modify field -> isDirty true, reset -> isDirty false)
- Add tests for Zod validation
- Add tests for undo/reset flow

### Step 3.6: Verify
- Full lint/type-check/test for admin-ui-storage

---

## Phase 4 -- Connection / S3 Create (#1)

**Files touched:**
- `src/views/bucket/connection.tsx`
- `src/views/bucket/new-bucket.tsx` (wrapper)
- `src/views/bucket/schema.ts` -- **create** (shared S3 schema, reused by Phase 5)
- `src/views/bucket/types.ts` -- **create**
- `src/views/bucket/tests/connection.test.tsx` -- update

### Step 4.1: Define shared S3 form values + types
- `ConnectionFormValues`: bucketLabel, bucketName, accessKeyData, secretKey, urlInput, prefix, customRegion, regionSelection, acceptUntrustedSSL

### Step 4.2: Define shared Zod schema
- Reuse for both Connection and EditBucketDetailPanel (Phase 5)
- `bucketNameRegex = /^\S+$/`, `prefixRegex = /^[A-Za-z0-9_./-]*$/`
- Conditional endpoint URL requirement (required only when region is "None" or "Custom")

### Step 4.3: Migrate component
- Replace ~20 `useState` with `useForm`
- `hasSubmitted` gating replaced by form submission state
- Verify-and-create async flow integrated into `onSubmit`
- Error display via `getFieldErrorProps()`

### Step 4.4: Tests
- Update existing tests
- Add Zod validation tests
- Test conditional endpoint validation
- Test verify flow

### Step 4.5: Verify

---

## Phase 5 -- EditBucketDetailPanel (#7)

**Files touched:**
- `src/views/bucket/edit-bucket-details-panel.tsx`
- `src/views/bucket/verify-changes-modal.tsx` (integration)
- `src/views/bucket/tests/edit-bucket-details-panel.browser.test.tsx` -- update

### Step 5.1: Migrate component
- Reuse shared S3 schema from Phase 4
- Replace ~17 `useState` with `useForm({ defaultValues: bucketDetail })`
- `form.state.dirtyFields` replaces manual `changedFields` diff computation
- Wrap in `FormPageLayout` with Save/Cancel
- VerifyChangesModal receives `dirtyFields` from form state

### Step 5.2: Tests
- Update existing browser tests
- Add dirty-field detection tests
- Add validation tests

### Step 5.3: Verify

---

## Phase 6 -- Advanced Volume Create Wizard (#3)

**Why later:** Dual-context (`VolumeContext` + `AdvancedVolumeContext`) is the most architecturally complex migration. Needs the single-form-per-wizard pattern proven in earlier phases.

**Files touched:**
- `src/views/bucket/server-specifics/volume/create-volume/advanced-create-volume/create-advanced-volume-context.ts` -- **delete**
- `src/views/bucket/server-specifics/volume/create-volume/advanced-create-volume/create-mailstores-volume.tsx` -- wizard shell
- `src/views/bucket/server-specifics/volume/create-volume/advanced-create-volume/advanced-mailstores-definition.tsx` -- Step 1
- `src/views/bucket/server-specifics/volume/create-volume/advanced-create-volume/advanced-mailstores-config.tsx` -- Step 2
- `src/views/bucket/server-specifics/volume/create-volume/advanced-create-volume/advanced-mailstores-create.tsx` -- Step 3
- `src/views/bucket/server-specifics/volume/create-volume/advanced-create-volume/types.ts` -- **create**
- `src/views/bucket/server-specifics/volume/create-volume/advanced-create-volume/schema.ts` -- **create**
- Tests -- update + add new for steps 2-3

### Step 6.1: Define form values + types
- `AdvancedVolumeFormValues` with all ~13 fields

### Step 6.2: Define Zod schema
- volumeName (required), mutually exclusive tiering toggles

### Step 6.3: Unify dual-context into single form
- `CreateMailstoresVolume` creates one `useForm` instance
- Remove `AdvancedVolumeContext` entirely
- Coordinate with Phase 2's Volume form for shared fields (`volumeName`, `volumeAllocation`) -- pass as props or merge into a parent form
- Each step component receives the `form` prop and uses `useField`/`form.Field`

### Step 6.4: Tests
- Update Step 1 tests
- **Add** tests for Step 2 (`advanced-mailstores-config`) -- currently none
- **Add** tests for Step 3 (`advanced-mailstores-create`) -- currently none
- Add tests for tiering mutual exclusivity validation

### Step 6.5: Verify

---

## Phase 7 -- HSM Create (#5) + HSM Edit (#6)

**Why together:** Same shape, shared `HSMContext` type, same validation rules. Refactoring them in lockstep ensures consistency.

**Files touched:**
- `src/views/bucket/hsm/hsm-context/hsm-context.ts` -- **delete**
- `src/views/bucket/hsm/create-hsm-policy/create-hsm-policy.tsx`
- `src/views/bucket/hsm/create-hsm-policy/hsm-policy-settings.tsx`
- `src/views/bucket/hsm/create-hsm-policy/hsm-create-policy.tsx`
- `src/views/bucket/hsm/edit-hsm-policy/edit-hsm-policy.tsx`
- `src/views/bucket/hsm/edit-hsm-policy/edit-hsm-policy-detail-section.tsx`
- `src/views/bucket/hsm/edit-hsm-policy/edit-hsm-policy-volumes-section.tsx`
- `src/views/bucket/hsm/types.ts` -- **create** (shared between create + edit)
- `src/views/bucket/hsm/schema.ts` -- **create** (shared validation)
- Tests -- **create** (currently zero for both)

### Step 7.1: Define form values + types
- `HsmPolicyFormValues`: item-type booleans, `policyCriteria` (array), `sourceVolume`, `destinationVolume`
- Separate `isDataLoaded`/`isVolumeLoaded` hydration flags out of the form values type (edit-only concerns)

### Step 7.2: Define Zod schema
- At least one item type selected
- At least one policy criteria
- Source/destination volume mutual exclusion (cross-field refinement)

### Step 7.3: Migrate HSM Create
- Replace `HSMContext.Provider` + `useState` with `useForm`
- `policyCriteria` dynamic array -> TanStack Form's array field support
- Cross-field business rules (snackbar validation) -> Zod refinement or `onSubmit` validation
- Step 2 (`HSMcreatePolicy`) receives form as prop for read-only summary

### Step 7.4: Migrate HSM Edit
- Replace `HSMContext.Provider` + `useState` with `useForm({ defaultValues: parsedPolicy })`
- Query-string parsing stays as a pre-form-value hydration step
- `form.state.isDirty` replaces manual dirty propagation
- Wrap in `FormPageLayout` with Save/Cancel
- Both tab sections receive form as prop

### Step 7.5: Tests (new -- zero exist)
- HSM Create: test criteria add/remove, validation (min one type, min one criteria, source != dest), wizard flow
- HSM Edit: test hydration from query string, dirty detection, save flow

### Step 7.6: Delete old context file
- Remove `hsm-context.ts`

### Step 7.7: Verify

---

## Phase 8 -- HSM Settings (#8)

**Files touched:**
- `src/views/bucket/hsm/hsm-setting-panel.tsx`
- `src/views/bucket/hsm/types.ts` -- extend
- `src/views/bucket/hsm/schema.ts` -- extend
- Tests -- **create** (currently zero)

### Step 8.1: Migrate component
- Replace 4 `useState` + 4 dirty-tracking `useEffect`s with `useForm({ defaultValues: oldValues })`
- `form.state.isDirty` replaces manual tracking
- Wrap in `FormPageLayout`

### Step 8.2: Tests (new)
- Test dirty detection, save/cancel, settings persistence

### Step 8.3: Verify

---

## Cross-Cutting Concerns

### Patterns to follow (from admin-ui-cos)
- **Form root**: `useForm({ defaultValues, validators?, onSubmit })`, `isDirty` via `useSelector(form.store, (s) => !s.isDefaultValue)`, render in `<FormPageLayout>`, call `form.reset(value, { keepDefaultValues: true })` on submit success
- **Validation**: Zod schema in sibling `schema.ts`, wired as `validators.onChange` + `validators.onSubmit`
- **Fields**: `useField({ form, name })` or `<form.Field name>` render-prop
- **Types**: `ReactFormExtendedApi` alias per form domain in `types.ts`
- **No `useMemo`/`useCallback`**: React Compiler handles memoization (enforced by ESLint)
- **Wizards**: single `useForm` at wizard shell level, pass `form` prop to each step

### Verification after each phase
```bash
pnpm lint --filter admin-ui-storage
pnpm type-check --filter admin-ui-storage
pnpm test --filter admin-ui-storage
```

After Phase 0:
```bash
pnpm lint && pnpm type-check && pnpm test
```

### Forms explicitly excluded (not real forms)
- `VerifyChangesModal` -- single checkbox confirmation
- `DeleteBucketModel` -- single checkbox confirmation
