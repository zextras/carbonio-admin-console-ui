# TanStack Form Composition API Migration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all 5 form domains in admin-ui-cos from raw `useForm` + `ReactFormExtendedApi<any ×12>` to TanStack Form's composition API (`createFormHook` + `withForm` + registered field components via `useFieldContext`), eliminating all `any`-generics type aliases and prop-drilled form APIs.

**Architecture:** A single shared `useAppForm` hook is created via `createFormHook()` with all reusable field components registered (`ValidatedInput`, `TimeFieldGroup`, `QuotaGBField`, `FeatureSwitchField`). Each form page uses `useAppForm()` instead of `useForm()`. Section components are wrapped with `withForm()` HOC, which provides typed `form` without manual type aliases. Field components use `useFieldContext<T>()` to access their field API via context instead of `form` + `name` props.

**Tech Stack:** `@tanstack/react-form@^1.32.0` (installed), `createFormHook`, `createFormHookContexts`, `withForm`, `useFieldContext`, `useFormContext`, `form.AppField`, `form.AppForm`

---

## File Structure

### New files:
- `src/form/form-context.tsx` — `createFormHookContexts()` shared across all forms
- `src/form/form-hook.tsx` — `createFormHook()` with registered field/form components
- `src/form/field-components/validated-input.tsx` — reusable `ValidatedInput` using `useFieldContext`
- `src/form/field-components/time-field-group.tsx` — reusable `TimeFieldGroup` using `useFieldContext`
- `src/form/field-components/quota-gb-field.tsx` — reusable `QuotaGBField` using `useFieldContext`
- `src/form/field-components/feature-switch-field.tsx` — reusable `FeatureSwitchField` using `useFieldContext`
- `src/form/field-components/field-error.ts` — `getFieldErrorProps` helper (relocated)

### Modified files (Advanced form — 10 files):
- `src/views/cos/advanced/types.ts` — remove `CosFormApi`, keep `CosAdvancedFormValues`
- `src/views/cos/advanced/advanced-form.tsx` — `useForm` → `useAppForm`
- `src/views/cos/advanced/sections/general-options.tsx` — `withForm` HOC
- `src/views/cos/advanced/sections/forwarding.tsx` — `withForm` HOC
- `src/views/cos/advanced/sections/password.tsx` — `withForm` HOC
- `src/views/cos/advanced/sections/failed-login-policy.tsx` — `withForm` HOC
- `src/views/cos/advanced/sections/email-retention-policy.tsx` — `withForm` HOC
- `src/views/cos/advanced/sections/timeout-policy.tsx` — `withForm` HOC
- `src/views/cos/advanced/sections/quotas.tsx` — `withForm` HOC
- `src/views/cos/advanced/tests/cos-validated-input.browser.test.tsx` — update test pattern
- `src/views/cos/advanced/tests/time-field-group.browser.test.tsx` — update test pattern

### Modified files (Features form — 10 files):
- `src/views/cos/types.ts` — remove `CosFeaturesFormApi`, keep `CosFeaturesFormValues`
- `src/views/cos/cos-features/features-form.tsx` — `useForm` → `useAppForm`
- `src/views/cos/features/sections/general-section.tsx` — `withForm` HOC
- `src/views/cos/features/sections/mail-section.tsx` — `withForm` HOC
- `src/views/cos/features/sections/contacts-calendar-section.tsx` — `withForm` HOC
- `src/views/cos/features/sections/files-tasks-section.tsx` — `withForm` HOC
- `src/views/cos/features/sections/two-factor-section.tsx` — `withForm` HOC
- `src/views/cos/features/sections/grace-period-section.tsx` — `withForm` HOC
- `src/views/cos/features/sections/untrusted-network-section.tsx` — `withForm` HOC
- `src/views/cos/features/sections/grace-period-end-date-picker.tsx` — `withForm` HOC

### Modified files (WSC form — 2 files):
- `src/wsc/types.ts` — remove `WscCosFormApi`, keep `WscCosFormValues`
- `src/wsc/wsc-settings.tsx` — `withForm` HOC
- `src/wsc/wsc-cos-form.tsx` — `useForm` → `useAppForm`
- `src/wsc/tests/wsc-settings.browser.test.tsx` — update test pattern

### Modified files (Preferences form — 9 files):
- `src/views/cos/preferences/types.ts` — remove `CosPreferencesFormApi`, keep `CosPreferencesFormValues`
- `src/views/cos/preferences/preferences-form.tsx` — `useForm` → `useAppForm`
- `src/views/cos/preferences/sections/general-options.tsx` — `withForm` HOC
- `src/views/cos/preferences/sections/mail-options.tsx` — `withForm` HOC
- `src/views/cos/preferences/sections/receiving-mails.tsx` — `withForm` HOC
- `src/views/cos/preferences/sections/forwarding-options.tsx` — `withForm` HOC
- `src/views/cos/preferences/sections/sending-mails.tsx` — `withForm` HOC
- `src/views/cos/preferences/sections/contact-options.tsx` — `withForm` HOC
- `src/views/cos/preferences/sections/calendar-options.tsx` — `withForm` HOC

### Modified files (General Info form — 2 files):
- `src/views/cos/general-information/cos-info-fields.tsx` — `withForm` HOC, remove inline `CosInfoFormApi`
- `src/views/cos/general-information/general-information-form.tsx` — `useForm` → `useAppForm`

### Deleted files:
- `src/views/cos/advanced/fields/validated-input.tsx` — replaced by `src/form/field-components/validated-input.tsx`
- `src/views/cos/advanced/fields/time-field-group.tsx` — replaced by `src/form/field-components/time-field-group.tsx`
- `src/views/cos/advanced/fields/quota-gb-field.tsx` — replaced by `src/form/field-components/quota-gb-field.tsx`
- `src/views/cos/advanced/fields/field-error.ts` — replaced by `src/form/field-components/field-error.ts`
- `src/views/cos/fields/feature-switch-field.tsx` — replaced by `src/form/field-components/feature-switch-field.tsx`

---

## Task 1: Create Form Infrastructure — Context & Error Helper

**Files:**
- Create: `src/form/form-context.tsx`
- Create: `src/form/field-components/field-error.ts`

- [ ] **Step 1: Create `src/form/form-context.tsx`**

```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createFormHookContexts } from '@tanstack/react-form';

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();
```

- [ ] **Step 2: Create `src/form/field-components/field-error.ts`**

Copy `src/views/cos/advanced/fields/field-error.ts` to `src/form/field-components/field-error.ts` — the content is identical, just relocated:

```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AnyFieldApi } from '@tanstack/react-form';

import { COS_VALIDATION_MESSAGES } from '../../views/cos/advanced/schema';

type FieldErrorProps = { hasError: boolean; description?: string };

export function getFieldErrorProps(
  field: AnyFieldApi,
  isSubmitted: boolean,
  t: (key: string, defaultValue: string) => string,
): FieldErrorProps {
  const { meta } = field.state;
  const showError = (meta.isBlurred || isSubmitted) && !meta.isValid;
  if (!showError) return { hasError: false };
  const firstError = meta.errors[0];
  const key = typeof firstError === 'string' ? firstError : firstError?.message;
  return {
    hasError: true,
    description: key ? t(key, COS_VALIDATION_MESSAGES[key] ?? key) : undefined,
  };
}
```

> **Note:** `getFieldErrorProps` depends on `COS_VALIDATION_MESSAGES` from the advanced schema. For now, keep this import path. If other forms need their own validation messages, this can be parameterized later.

- [ ] **Step 3: Verify build compiles**

Run: `pnpm build --filter admin-ui-cos 2>&1 | tail -5`
Expected: No errors from new files (they're not imported yet).

- [ ] **Step 4: Commit**

```bash
git add src/form/
git commit -m "refactor(cos): add form composition context and field-error helper"
```

---

## Task 2: Create Field Components Using `useFieldContext`

**Files:**
- Create: `src/form/field-components/validated-input.tsx`
- Create: `src/form/field-components/time-field-group.tsx`
- Create: `src/form/field-components/quota-gb-field.tsx`
- Create: `src/form/field-components/feature-switch-field.tsx`

Each field component replaces its `form` + `name` props with `useFieldContext<T>()`. The field API is obtained from context, provided by `<form.AppField>`.

- [ ] **Step 1: Create `src/form/field-components/validated-input.tsx`**

```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Input } from '@zextras/ui-components';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { useFieldContext } from '../form-context';
import { getFieldErrorProps } from './field-error';

type ValidatedInputProps = {
  label: string;
  disabled?: boolean;
};

export const ValidatedInput = ({ label, disabled = false }: ValidatedInputProps) => {
  const [t] = useTranslation();
  const field = useFieldContext<string>();
  const isSubmitted = useSelector(field.form.store, (s) => s.submissionAttempts > 0);
  const error = getFieldErrorProps(field, isSubmitted, t);

  return (
    <Input
      label={label}
      value={field.state.value ?? ''}
      backgroundColor="gray5"
      inputName={String(field.name)}
      onChange={(e: ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
      onBlur={() => field.handleBlur()}
      hasError={error.hasError}
      description={error.description}
      disabled={disabled}
    />
  );
};
```

- [ ] **Step 2: Create `src/form/field-components/time-field-group.tsx`**

```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, Input, ListRow, Select } from '@zextras/ui-components';
import type { ChangeEvent, FC } from 'react';
import { useTranslation } from 'react-i18next';

import type { TimeItems } from '../../../types/general';
import { useFieldContext } from '../form-context';
import { getFieldErrorProps } from './field-error';

type TimeFieldGroupProps = {
  label: string;
  readonlyCOS: boolean;
  timeItems: TimeItems;
  disabled?: boolean;
};

export const TimeFieldGroup: FC<TimeFieldGroupProps> = ({
  label,
  readonlyCOS,
  timeItems,
  disabled,
}) => {
  const [t] = useTranslation();
  const field = useFieldContext<string>();
  const isSubmitted = useSelector(field.form.store, (s) => s.submissionAttempts > 0);
  const raw = String(field.state.value ?? '');
  const hasUnit = raw.length >= 2;
  const num = hasUnit ? raw.slice(0, -1) : '';
  const unit = hasUnit ? raw.slice(-1) : '';
  const isDisabled = disabled || readonlyCOS;
  const error = getFieldErrorProps(field, isSubmitted, t);

  return (
    <ListRow>
      <Container width="83%" crossAlignment="flex-start" padding={{ right: 'small' }}>
        <Input
          label={label}
          value={num}
          backgroundColor="gray5"
          inputName={String(field.name)}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const v = e.target.value;
            field.handleChange(v ? `${v}${unit}` : '');
          }}
          onBlur={() => field.handleBlur()}
          hasError={error.hasError}
          description={error.description}
          disabled={isDisabled}
        />
      </Container>
      <Container width="17%" crossAlignment="flex-end" padding={{ left: 'small' }}>
        <Select
          items={timeItems}
          background="gray5"
          label={t('cos.time_range', 'Time Range')}
          selection={timeItems.find((item) => item.value === unit) ?? timeItems[0]}
          showCheckbox={false}
          onChange={(newUnit) => {
            if (newUnit) field.handleChange(num ? `${num}${newUnit}` : '');
          }}
          disabled={isDisabled}
        />
      </Container>
    </ListRow>
  );
};
```

- [ ] **Step 3: Create `src/form/field-components/quota-gb-field.tsx`**

```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { Container, Input, Padding } from '@zextras/ui-components';
import { isValidDecimalInput } from '@zextras/ui-shared';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { BytesToGB, GbToBytes } from '../../../utility/utils';
import { useFieldContext } from '../form-context';
import { getFieldErrorProps } from './field-error';
import { QuotaRevertIcon } from '../../views/cos/advanced/fields/quota-revert-icon';

type QuotaGBFieldInnerProps = {
  fieldState: {
    value: string | undefined;
    handleChange: (value: string) => void;
  };
  label: string;
  maximumDigitsLabel: string;
  disabled: boolean;
  hasError: boolean;
  description?: string;
  onBlur: () => void;
};

const QuotaGBFieldInner = ({
  fieldState,
  label,
  maximumDigitsLabel,
  disabled,
  hasError,
  description,
  onBlur,
}: QuotaGBFieldInnerProps) => {
  const [rawGB, setRawGB] = useState(
    () => (fieldState.value ? BytesToGB(fieldState.value).toFixed(2) : ''),
  );
  const [showMsg, setShowMsg] = useState(false);
  const isUserEditing = useRef(false);
  const initialValue = useRef(fieldState.value);
  const [t] = useTranslation();

  useEffect(() => {
    if (isUserEditing.current) {
      isUserEditing.current = false;
      return;
    }
    setRawGB(fieldState.value ? BytesToGB(fieldState.value).toFixed(2) : '');
    setShowMsg(false);
  }, [fieldState.value]);

  const showRevert = fieldState.value !== initialValue.current;

  const handleRevert = () => {
    const bytes = initialValue.current;
    fieldState.handleChange(bytes ?? '');
    setRawGB(bytes ? BytesToGB(bytes).toFixed(2) : '');
    setShowMsg(false);
  };

  const revertLabel = t('cos_quota.click_to_revert', 'Click to revert to the inherited value');
  const RevertIcon = showRevert
    ? () => <QuotaRevertIcon label={revertLabel} onClick={handleRevert} />
    : undefined;

  return (
    <>
      <Input
        label={label}
        value={rawGB}
        backgroundColor="gray5"
        inputName="zimbraMailQuota"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          if (!isValidDecimalInput(e.target.value)) return;
          const dp = e.target.value?.split('.')[1];
          if (dp && dp.length > 3) {
            setShowMsg(true);
            return;
          }
          setShowMsg(false);
          isUserEditing.current = true;
          setRawGB(e.target.value);
          fieldState.handleChange(
            e.target.value ? String(Math.round(GbToBytes(e.target.value))) : '',
          );
        }}
        onBlur={onBlur}
        hasError={hasError}
        description={description}
        disabled={disabled}
        CustomIcon={RevertIcon}
      />
      {showMsg && (
        <Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
          <Padding top="small">
            <ds-text as="span" size="extrasmall" weight="regular" color="primary">
              {maximumDigitsLabel}
            </ds-text>
          </Padding>
        </Container>
      )}
    </>
  );
};

type QuotaGBFieldProps = {
  label: string;
  maximumDigitsLabel: string;
  disabled: boolean;
};

export const QuotaGBField = ({ label, maximumDigitsLabel, disabled }: QuotaGBFieldProps) => {
  const [t] = useTranslation();
  const field = useFieldContext<string>();
  const isSubmitted = useSelector(field.form.store, (s) => s.submissionAttempts > 0);
  const error = getFieldErrorProps(field, isSubmitted, t);

  return (
    <QuotaGBFieldInner
      fieldState={{
        value: field.state.value as string | undefined,
        handleChange: field.handleChange,
      }}
      label={label}
      maximumDigitsLabel={maximumDigitsLabel}
      disabled={disabled}
      hasError={error.hasError}
      description={error.description}
      onBlur={() => field.handleBlur()}
    />
  );
};
```

- [ ] **Step 4: Create `src/form/field-components/feature-switch-field.tsx`**

```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Switch } from '@zextras/ui-components';
import type { FC } from 'react';

import { useFieldContext } from '../form-context';

type FeatureSwitchFieldProps = {
  label: string;
  disabled?: boolean;
};

export const FeatureSwitchField: FC<FeatureSwitchFieldProps> = ({ label, disabled }) => {
  const field = useFieldContext<string>();

  return (
    <Switch
      value={field.state.value === 'TRUE'}
      onClick={() => field.handleChange(field.state.value === 'TRUE' ? 'FALSE' : 'TRUE')}
      label={label}
      iconColor="primary"
      disabled={disabled}
    />
  );
};
```

- [ ] **Step 5: Commit**

```bash
git add src/form/
git commit -m "refactor(cos): add field components using useFieldContext"
```

---

## Task 3: Create Form Hook — `useAppForm` with Registered Components

**Files:**
- Create: `src/form/form-hook.tsx`

- [ ] **Step 1: Create `src/form/form-hook.tsx`**

```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createFormHook } from '@tanstack/react-form';

import { fieldContext, formContext } from './form-context';
import { FeatureSwitchField } from './field-components/feature-switch-field';
import { QuotaGBField } from './field-components/quota-gb-field';
import { TimeFieldGroup } from './field-components/time-field-group';
import { ValidatedInput } from './field-components/validated-input';

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    ValidatedInput,
    TimeFieldGroup,
    QuotaGBField,
    FeatureSwitchField,
  },
  formComponents: {},
  fieldContext,
  formContext,
});
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `pnpm type-check --filter admin-ui-cos 2>&1 | tail -10`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/form/form-hook.tsx
git commit -m "refactor(cos): create useAppForm with registered field components"
```

---

## Task 4: Migrate Advanced Form — Form Page & Type Cleanup

**Files:**
- Modify: `src/views/cos/advanced/types.ts`
- Modify: `src/views/cos/advanced/advanced-form.tsx`

- [ ] **Step 1: Update `src/views/cos/advanced/types.ts` — remove `CosFormApi`**

Replace the entire file with:

```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AccountType } from '../../../../types/account';

export type CosAdvancedFormValues = AccountType & {
  backupEnabled: boolean;
  backupSelfUndeleteAllowed: boolean;
};
```

- [ ] **Step 2: Update `src/views/cos/advanced/advanced-form.tsx`**

Changes:
1. Replace `import { useForm } from '@tanstack/react-form'` with `import { useAppForm } from '../../../form/form-hook'`
2. Replace `const form = useForm({` with `const form = useAppForm({`
3. Remove the import of `CosFormApi` from types (if present)
4. Wrap all child section components inside `<form.AppForm>` so they have access to form context

In the return JSX, wrap children:

```tsx
return (
  <FormPageLayout
    title={pageTitle}
    onSave={() => form.handleSubmit()}
    onCancel={() => {
      form.reset();
      quotaState.reset();
    }}
    unsavedChanges={isDirty}
  >
    <form.AppForm>
      <Container mainAlignment="flex-start" width="100%" orientation="vertical">
        {isAdvanced && <COSGeneralOptions form={form} readonlyCOS={readonlyCOS} />}
        <COSForwarding form={form} readonlyCOS={readonlyCOS} />
        <COSQuotas
          form={form}
          quotaState={quotaState}
          isTotalQuotaActive={isTotalQuotaActive}
          isAdvanced={isAdvanced}
          readonlyCOS={readonlyCOS}
          timeItems={timeItems}
        />
        <COSPassword form={form} readonlyCOS={readonlyCOS} />
        <COSFailedLoginPolicy form={form} readonlyCOS={readonlyCOS} timeItems={timeItems} />
        <COSTimeoutPolicy form={form} readonlyCOS={readonlyCOS} timeItems={timeItems} />
        <COSEmailRetentionPolicy form={form} readonlyCOS={readonlyCOS} timeItems={timeItems} />
      </Container>
    </form.AppForm>
  </FormPageLayout>
);
```

The imports at the top change to:
- Remove: `import { useForm } from '@tanstack/react-form'`
- Add: `import { useAppForm } from '../../../form/form-hook'`

Everything else stays the same. The `useAppForm` accepts the same options as `useForm`.

- [ ] **Step 3: Commit**

```bash
git add src/views/cos/advanced/types.ts src/views/cos/advanced/advanced-form.tsx
git commit -m "refactor(cos): migrate advanced form to useAppForm, remove CosFormApi"
```

---

## Task 5: Migrate Advanced Form — Section Components to `withForm`

Each section component currently receives `form: CosFormApi` as a prop. We wrap each with `withForm()` which provides a typed `form` via the render function. The `CosFormApi` type is no longer needed.

**The transformation pattern for every section:**

1. Remove the `form: CosFormApi` from the component props type
2. Wrap the component with `withForm({ defaultValues: {} as CosAdvancedFormValues, props: { ...remainingProps }, render: ... })`
3. Inside `render`, replace `<CosValidatedInput form={form} name={x} label={...} />` with `<form.AppField name={x} children={(field) => <field.ValidatedInput label={...} />} />`
4. Replace `<TimeFieldGroup form={form} name={x} ... />` with `<form.AppField name={x} children={(field) => <field.TimeFieldGroup ... />} />`
5. Replace `<QuotaGBField form={form} name={x} ... />` with `<form.AppField name={x} children={(field) => <field.QuotaGBField ... />} />`
6. Keep inline `form.Field name={x}` calls as-is (they work fine alongside `AppField`)
7. Keep `useSelector(form.store, ...)` calls as-is (they work in the render function)

**Files:**
- Modify: `src/views/cos/advanced/sections/general-options.tsx`
- Modify: `src/views/cos/advanced/sections/forwarding.tsx`
- Modify: `src/views/cos/advanced/sections/password.tsx`
- Modify: `src/views/cos/advanced/sections/failed-login-policy.tsx`
- Modify: `src/views/cos/advanced/sections/email-retention-policy.tsx`
- Modify: `src/views/cos/advanced/sections/timeout-policy.tsx`
- Modify: `src/views/cos/advanced/sections/quotas.tsx`

- [ ] **Step 1: Migrate `general-options.tsx`**

```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Container, Row, Switch } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import type { CosAdvancedFormValues } from '../types';
import { withForm } from '../../../../form/form-hook';

export const COSGeneralOptions = withForm({
  defaultValues: {} as CosAdvancedFormValues,
  props: {
    readonlyCOS: false as boolean,
  },
  render: function Render({ form, readonlyCOS }) {
    const [t] = useTranslation();

    return (
      <Row
        mainAlignment="flex-start"
        crossAlignment="flex-start"
        padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
        width="100%"
      >
        <Container
          mainAlignment="flex-start"
          crossAlignment="flex-start"
          width="50%"
          orientation="vertical"
          padding={{ bottom: 'large' }}
        >
          <ds-text as="strong" weight="bold">
            {t('cos.general_options', 'General Options')}
          </ds-text>
          <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
            <form.Field name="backupEnabled">
              {(field) => (
                <Switch
                  value={field.state.value}
                  onClick={() => field.handleChange(!field.state.value)}
                  label={t('cos.enable_backup', 'Enable backup')}
                  iconColor="primary"
                  disabled={readonlyCOS}
                />
              )}
            </form.Field>
          </Row>
          <Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
            <form.Field name="backupSelfUndeleteAllowed">
              {(field) => (
                <Switch
                  value={field.state.value}
                  onClick={() => field.handleChange(!field.state.value)}
                  label={t('cos.backup_self_undelete', 'Allow self-undelete')}
                  iconColor="primary"
                  disabled={readonlyCOS}
                />
              )}
            </form.Field>
          </Row>
        </Container>
      </Row>
    );
  },
});
```

> **Note:** The exact JSX content should match the original file. Read the original file first and preserve its structure. The key changes are: (1) wrap with `withForm`, (2) remove `CosFormApi` prop, (3) keep `form.Field` for inline fields.

- [ ] **Step 2: Migrate `forwarding.tsx`**

Read the original file. Transform:
- Remove `form: CosFormApi` from props
- Wrap with `withForm`
- Replace `<CosValidatedInput form={form} name={x} ... />` with `<form.AppField name={x} children={(field) => <field.ValidatedInput ... />} />`

Pattern for each `CosValidatedInput` replacement:
```tsx
// Before:
<CosValidatedInput form={form} name="zimbraMailForwardingAddressMaxLength" label={t('...')} disabled={readonlyCOS} />

// After:
<form.AppField
  name="zimbraMailForwardingAddressMaxLength"
  children={(field) => <field.ValidatedInput label={t('...')} disabled={readonlyCOS} />}
/>
```

- [ ] **Step 3: Migrate `password.tsx`**

Same pattern as forwarding. Has 10 `CosValidatedInput` usages plus inline `form.Field` for `Switch` toggles and `zimbraPasswordLocked`. Keep the inline `form.Field` calls as-is, only convert `CosValidatedInput` to `form.AppField`.

- [ ] **Step 4: Migrate `failed-login-policy.tsx`**

Has `useSelector(form.store, ...)` for conditional enabling, inline `form.Field` with time unit splitting, and 1 `CosValidatedInput`. The `useSelector` call works as-is in the `withForm` render function.

- [ ] **Step 5: Migrate `email-retention-policy.tsx`**

Uses `TimeFieldGroup` wrapper 3 times. Transform each:
```tsx
// Before:
<TimeFieldGroup form={form} name="zimbraMailMessageLifetime" label={t('...')} readonlyCOS={readonlyCOS} timeItems={timeItems} />

// After:
<form.AppField
  name="zimbraMailMessageLifetime"
  children={(field) => <field.TimeFieldGroup label={t('...')} readonlyCOS={readonlyCOS} timeItems={timeItems} />}
/>
```

- [ ] **Step 6: Migrate `timeout-policy.tsx`**

Same pattern as email-retention-policy — uses `TimeFieldGroup` 3 times.

- [ ] **Step 7: Migrate `quotas.tsx`**

Uses `QuotaGBField`, `CosValidatedInput`, and inline time-field pattern. Transform each:
```tsx
// QuotaGBField:
<form.AppField
  name="zimbraMailQuota"
  children={(field) => (
    <field.QuotaGBField label={t('...')} maximumDigitsLabel={t('...')} disabled={...} />
  )}
/>

// CosValidatedInput:
<form.AppField
  name="zimbraContactMaxNumEntries"
  children={(field) => <field.ValidatedInput label={t('...')} disabled={readonlyCOS} />}
/>
```

- [ ] **Step 8: Commit**

```bash
git add src/views/cos/advanced/sections/
git commit -m "refactor(cos): migrate advanced sections to withForm composition pattern"
```

---

## Task 6: Migrate Advanced Form — Tests

**Files:**
- Modify: `src/views/cos/advanced/tests/cos-validated-input.browser.test.tsx`
- Modify: `src/views/cos/advanced/tests/time-field-group.browser.test.tsx`

- [ ] **Step 1: Update `cos-validated-input.browser.test.tsx`**

The test creates a form and renders `CosValidatedInput` with `form` + `name` props. After migration:
1. Replace `useForm` with `useAppForm` from `src/form/form-hook`
2. Replace `<CosValidatedInput form={form} name="..." ... />` with `<form.AppField name="..." children={(field) => <field.ValidatedInput ... />} />`
3. Wrap the form content in `<form.AppForm>` for context

The test wrapper pattern becomes:
```tsx
import { useAppForm } from '../../../../form/form-hook';

// Inside the test render function:
const form = useAppForm({
  defaultValues: { ... },
  validators: { onChange: cosAdvancedSchema },
});

return (
  <form.AppForm>
    <form.AppField
      name="zimbraPasswordMinLength"
      children={(field) => <field.ValidatedInput label="Min Length" />}
    />
  </form.AppForm>
);
```

- [ ] **Step 2: Update `time-field-group.browser.test.tsx`**

Same pattern — replace `useForm` with `useAppForm`, replace `<TimeFieldGroup form={...} name={...} />` with `<form.AppField name={...} children={(field) => <field.TimeFieldGroup ... />} />`, wrap in `<form.AppForm>`.

- [ ] **Step 3: Run tests to verify**

Run: `pnpm vitest run apps/admin-ui-cos/src/views/cos/advanced/tests/ --reporter=verbose`
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/views/cos/advanced/tests/
git commit -m "refactor(cos): update advanced form tests for composition API"
```

---

## Task 7: Migrate Features Form

**Files:**
- Modify: `src/views/cos/types.ts`
- Modify: `src/views/cos/cos-features/features-form.tsx`
- Modify: `src/views/cos/features/sections/general-section.tsx`
- Modify: `src/views/cos/features/sections/mail-section.tsx`
- Modify: `src/views/cos/features/sections/contacts-calendar-section.tsx`
- Modify: `src/views/cos/features/sections/files-tasks-section.tsx`
- Modify: `src/views/cos/features/sections/two-factor-section.tsx`
- Modify: `src/views/cos/features/sections/grace-period-section.tsx`
- Modify: `src/views/cos/features/sections/untrusted-network-section.tsx`
- Modify: `src/views/cos/features/sections/grace-period-end-date-picker.tsx`

- [ ] **Step 1: Update `src/views/cos/types.ts` — remove `CosFeaturesFormApi`**

Replace the entire file with:

```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
type CosFeaturesFormValues = {
  carbonioFeatureMailsAppEnabled: string;
  zimbraFeatureOutOfOfficeReplyEnabled: string;
  zimbraFeatureSignaturesEnabled: string;
  zimbraFeatureMobileSyncEnabled: string;
  zimbraFeatureContactsEnabled: string;
  zimbraFeatureCalendarEnabled: string;
  carbonioFeatureFilesAppEnabled: string;
  carbonioFeatureFilesEnabled: string;
  carbonioFeatureTasksEnabled: string;
  zimbraFeatureOptionsEnabled: string;
  carbonioOtpWizardFromUntrusted: string;
  carbonioFeatureOTPMgmtEnabled: string;
  carbonioOtpGracePeriodEndingTime: string;
  carbonioOtpGracePeriodEnabled: string;
  mobileContactFeatureSync: string;
  mobileCalendarFeatureSync: string;
};

export type { CosFeaturesFormValues };
```

- [ ] **Step 2: Update `features-form.tsx` — `useForm` → `useAppForm`**

Changes:
1. Replace `import { useForm } from '@tanstack/react-form'` with `import { useAppForm } from '../../../form/form-hook'` (adjust relative path as needed — this file is at `src/views/cos/cos-features/features-form.tsx`, so path is `../../../form/form-hook`)
2. Replace `const form = useForm({` with `const form = useAppForm({`
3. Wrap children in `<form.AppForm>`
4. Remove the `CosFeaturesFormApi` import from `../types`

- [ ] **Step 3: Migrate each features section to `withForm`**

For each section file:

**Pattern for sections using `FeatureSwitchField`:**
```tsx
// Before:
import { FeatureSwitchField } from '../../fields/feature-switch-field';
import type { CosFeaturesFormApi } from '../../types';

type GeneralSectionProps = {
  form: CosFeaturesFormApi;
  readonlyCOS: boolean;
};

export const GeneralSection = ({ form, readonlyCOS }: GeneralSectionProps) => {
  // ...
  return (
    <FeatureSwitchField form={form} name="zimbraFeatureOptionsEnabled" label={t('...')} disabled={readonlyCOS} />
  );
};

// After:
import type { CosFeaturesFormValues } from '../../types';
import { withForm } from '../../../../form/form-hook';

export const GeneralSection = withForm({
  defaultValues: {} as CosFeaturesFormValues,
  props: {
    readonlyCOS: false as boolean,
  },
  render: function Render({ form, readonlyCOS }) {
    // ...
    return (
      <form.AppField
        name="zimbraFeatureOptionsEnabled"
        children={(field) => <field.FeatureSwitchField label={t('...')} disabled={readonlyCOS} />}
      />
    );
  },
});
```

**Pattern for sections using `useField`:**
```tsx
// Before:
import { useField } from '@tanstack/react-form';

const graceEnabledField = useField({ form, name: 'carbonioOtpGracePeriodEnabled' });

// After (inside withForm render):
// useField still works — just call it with the form from the render function:
const graceEnabledField = useField({ form, name: 'carbonioOtpGracePeriodEnabled' });
// OR use form.Field instead:
// <form.Field name="carbonioOtpGracePeriodEnabled">{(field) => ...}</form.Field>
```

Apply to all 8 section files. Each follows the same pattern.

- [ ] **Step 4: Commit**

```bash
git add src/views/cos/types.ts src/views/cos/cos-features/ src/views/cos/features/
git commit -m "refactor(cos): migrate features form to composition API"
```

---

## Task 8: Migrate WSC Form

**Files:**
- Modify: `src/wsc/types.ts`
- Modify: `src/wsc/wsc-cos-form.tsx`
- Modify: `src/wsc/wsc-settings.tsx`
- Modify: `src/wsc/tests/wsc-settings.browser.test.tsx`

- [ ] **Step 1: Update `src/wsc/types.ts` — remove `WscCosFormApi`**

```typescript
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
type WscCosFormValues = {
  carbonioFeatureWscEnabled: string;
  carbonioWscShowMessageReads: string;
  carbonioWscShowUsersPresence: string;
  carbonioWscMessageDeleteTimeLimit: string;
  carbonioWscMessageEditTimeLimit: string;
  carbonioWscPrivateChatCreation: string;
  carbonioWscGroupChatCreation: string;
  carbonioWscMaxGroupMembers: string;
  carbonioWscMaxRoomPictureSize: string;
  carbonioWscVideoCallEnabled: string;
  carbonioWscRecordingEnabled: string;
  carbonioWscVirtualBackgroundEnabled: string;
  carbonioWscAttachmentUpload: string;
  carbonioWscMaxAttachmentSize: string;
};

export type { WscCosFormValues };
```

- [ ] **Step 2: Update `wsc-cos-form.tsx` — `useForm` → `useAppForm`**

Changes:
1. Replace `import { useForm } from '@tanstack/react-form'` with `import { useAppForm } from '../form/form-hook'`
2. Replace `const form = useForm({` with `const form = useAppForm({`
3. Wrap `<WscSettings>` in `<form.AppForm>`
4. Remove `WscCosFormApi` import

```tsx
// In the return:
<form.AppForm>
  <WscSettings form={form} readonlyFeatures={readonlyCOS} />
</form.AppForm>
```

- [ ] **Step 3: Migrate `wsc-settings.tsx` to `withForm`**

This is a large file (520 lines) with many inline `form.Field` calls and `useSelector(form.store, ...)` calls. The migration:
1. Replace `import type { WscCosFormApi } from './types'` with `import type { WscCosFormValues } from './types'`
2. Add `import { withForm } from '../form/form-hook'`
3. Wrap the component with `withForm({ defaultValues: {} as WscCosFormValues, props: { readonlyFeatures: false as boolean | undefined }, render: ... })`
4. Keep all `form.Field` and `useSelector` calls as-is

The `withForm` wrapper provides the typed `form` via the render function, so `useSelector(form.store, ...)` still works.

- [ ] **Step 4: Update `wsc-settings.browser.test.tsx`**

Replace `useForm` with `useAppForm`, wrap form content in `<form.AppForm>`.

- [ ] **Step 5: Commit**

```bash
git add src/wsc/
git commit -m "refactor(cos): migrate WSC form to composition API"
```

---

## Task 9: Migrate Preferences Form

**Files:**
- Modify: `src/views/cos/preferences/types.ts`
- Modify: `src/views/cos/preferences/preferences-form.tsx`
- Modify: all 7 section files in `src/views/cos/preferences/sections/`

- [ ] **Step 1: Update `src/views/cos/preferences/types.ts` — remove `CosPreferencesFormApi`**

```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CosPrefAttributes } from '../../../../types/cos';

export type CosPreferencesFormValues = CosPrefAttributes;
```

- [ ] **Step 2: Update `preferences-form.tsx` — `useForm` → `useAppForm`**

Same pattern as other form pages:
1. Replace `import { useForm }` with `import { useAppForm }` from `../../../../form/form-hook`
2. Replace `useForm({` with `useAppForm({`
3. Wrap section components in `<form.AppForm>`
4. Remove `CosPreferencesFormApi` import

- [ ] **Step 3: Migrate each preferences section to `withForm`**

All 7 sections follow the same pattern:
1. Remove `CosPreferencesFormApi` prop
2. Wrap with `withForm({ defaultValues: {} as CosPreferencesFormValues, props: { ... }, render: ... })`
3. Keep `form.Field` inline calls as-is
4. Keep `useSelector(form.store, ...)` calls as-is

Apply to:
- `general-options.tsx` — has `form.Field` with `Select`
- `mail-options.tsx` — has `useSelector` for file size, `form.Field` with `Switch`, `Select`, `Input`
- `receiving-mails.tsx` — has `useSelector`, `form.Field` with `Input`+`Select` time splitting
- `forwarding-options.tsx` — has `form.Field` with `Switch`
- `sending-mails.tsx` — has `form.Field` with `Switch`
- `contact-options.tsx` — has `form.Field` with `Switch`
- `calendar-options.tsx` — has `form.Field` with `Select` and `Switch`

- [ ] **Step 4: Commit**

```bash
git add src/views/cos/preferences/
git commit -m "refactor(cos): migrate preferences form to composition API"
```

---

## Task 10: Migrate General Info Form

**Files:**
- Modify: `src/views/cos/general-information/general-information-form.tsx`
- Modify: `src/views/cos/general-information/cos-info-fields.tsx`

- [ ] **Step 1: Migrate `cos-info-fields.tsx` to `withForm`**

Changes:
1. Remove `import type { ReactFormExtendedApi } from '@tanstack/react-form'`
2. Remove the inline `CosInfoFormApi` type
3. Add `import { withForm } from '../../../../form/form-hook'`
4. Add `import type { GeneralInfoFormValues }` (or define inline)
5. Wrap with `withForm`

```typescript
import { withForm } from '../../../../form/form-hook';

export type GeneralInfoFormValues = {
  cn: string;
  description: string;
  zimbraNotes: string;
};

export const CosInfoFields = withForm({
  defaultValues: {} as GeneralInfoFormValues,
  props: {
    cosId: undefined as string | undefined,
    cosCreationDate: '' as string,
    totalAccount: 0 as number,
    totalDomain: 0 as number,
    canDeleteCOS: false as boolean,
    readonlyCOS: false as boolean,
  },
  render: function Render({ form, cosId, cosCreationDate, totalAccount, totalDomain, canDeleteCOS, readonlyCOS }) {
    const [t] = useTranslation();
    // ... same JSX, using form.Field for all fields
  },
});
```

- [ ] **Step 2: Migrate `general-information-form.tsx` — `useForm` → `useAppForm`**

Same pattern: replace `useForm` with `useAppForm`, wrap `<CosInfoFields>` in `<form.AppForm>`.

- [ ] **Step 3: Commit**

```bash
git add src/views/cos/general-information/
git commit -m "refactor(cos): migrate general info form to composition API"
```

---

## Task 11: Delete Old Field Component Files

**Files:**
- Delete: `src/views/cos/advanced/fields/validated-input.tsx`
- Delete: `src/views/cos/advanced/fields/time-field-group.tsx`
- Delete: `src/views/cos/advanced/fields/quota-gb-field.tsx`
- Delete: `src/views/cos/advanced/fields/field-error.ts`
- Delete: `src/views/cos/fields/feature-switch-field.tsx`

> **Keep:** `src/views/cos/advanced/fields/quota-revert-icon.tsx` — still imported by the new `QuotaGBField` in `src/form/field-components/quota-gb-field.tsx`

- [ ] **Step 1: Verify no remaining imports of old files**

Run: `grep -r "from.*advanced/fields/validated-input\|from.*advanced/fields/time-field-group\|from.*advanced/fields/quota-gb-field\|from.*advanced/fields/field-error\|from.*fields/feature-switch-field" apps/admin-ui-cos/src/`
Expected: No matches (all imports should now point to `src/form/`).

- [ ] **Step 2: Delete the old files**

```bash
rm src/views/cos/advanced/fields/validated-input.tsx
rm src/views/cos/advanced/fields/time-field-group.tsx
rm src/views/cos/advanced/fields/quota-gb-field.tsx
rm src/views/cos/advanced/fields/field-error.ts
rm src/views/cos/fields/feature-switch-field.tsx
```

- [ ] **Step 3: Commit**

```bash
git add -A src/views/cos/advanced/fields/ src/views/cos/fields/
git commit -m "refactor(cos): remove old field component files"
```

---

## Task 12: Final Verification & Cleanup

- [ ] **Step 1: Run type checking**

Run: `pnpm type-check --filter admin-ui-cos`
Expected: No errors.

- [ ] **Step 2: Run linting**

Run: `pnpm lint --filter admin-ui-cos`
Expected: No errors (in particular, no `@typescript-eslint/no-explicit-any` warnings from form types).

- [ ] **Step 3: Run all COS tests**

Run: `pnpm vitest run apps/admin-ui-cos/ --reporter=verbose`
Expected: All tests pass.

- [ ] **Step 4: Verify no `ReactFormExtendedApi` imports remain (except in types.ts files keeping values)**

Run: `grep -r "ReactFormExtendedApi" apps/admin-ui-cos/src/`
Expected: No matches — all form API type aliases have been removed.

- [ ] **Step 5: Verify no `any ×12` patterns remain**

Run: `grep -rn "any, any, any, any, any, any, any, any, any, any, any, any" apps/admin-ui-cos/src/`
Expected: No matches.

- [ ] **Step 6: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "refactor(cos): fix post-migration issues"
```

---

## Self-Review Checklist

1. **Spec coverage:** All 5 form domains (Advanced, Features, WSC, Preferences, General Info) are covered. All `XxxFormApi` type aliases are removed. All field wrapper components are migrated to `useFieldContext`. All section components use `withForm`. All form pages use `useAppForm`.

2. **Placeholder scan:** No TBD, TODO, or "implement later" patterns. All code steps show actual code or reference the specific transformation pattern with before/after examples.

3. **Type consistency:** `useAppForm` is exported from `src/form/form-hook.tsx` and imported consistently across all form pages. `withForm` is exported from the same module and used in all sections. `useFieldContext` is exported from `src/form/form-context.tsx` and used in all field components. `CosAdvancedFormValues`, `CosFeaturesFormValues`, `WscCosFormValues`, `CosPreferencesFormValues`, `GeneralInfoFormValues` types are kept (only the `XxxFormApi` aliases are removed).
