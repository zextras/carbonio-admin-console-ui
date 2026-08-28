# Modernize Domain Disclaimer View (CO-4167) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the domain Disclaimer tab under `apps/admin-ui-domains/src/views/details/` and modernize it: TanStack Form + shared `useModifyDomain` hook (auto cache-flush/query-refresh + snackbar errors), accurate dirty-state protection via `FormPageLayout` (`Save`/`Cancel` only when dirty + route-leave guard), deprecated `Container`/`Row`/`Padding` replaced with CSS.

**Architecture:** Follows the established modernized-tab pattern (see `domain-gal-settings.tsx` + `use-domain-gal-form.ts`): a thin view component (`views/details/domain-disclaimer.tsx`) renders `FormPageLayout` with fields; a feature folder (`views/details/domain-disclaimer/`) holds the form hook and pure, unit-tested save-transform utils. The shared `useModifyDomain` hook (already tested in `src/services/tests/use-modify-domain.test.tsx`) replaces all manual `modifyDomain`/`flushCache`/`setQueryData` logic — this delivers the ticket's "refresh domain data automatically after saving" and "failures reported clearly". The delayed second snackbar is dropped (confirmed). Structure confirmed: **tab file + feature folder**.

**Tech Stack:** React 19 + React Compiler (no `useMemo`/`useCallback`), TanStack Form v1 (`form.Field` render props), TanStack React Query, `@zextras/ui-components` (`FormPageLayout`, `Switch`, `TextArea`), TinyMCE `Composer` (kept as-is), Vitest (jsdom unit + Playwright browser tests), MSW.

**Branch:** continue on current branch `CO-4140-refactor-admin-ui-domains` (clean status).

**Reference files** (read before starting):
- Pattern source: `apps/admin-ui-domains/src/views/domain/details/domain-gal-settings.tsx`, `.../domain-gal-settings/use-domain-gal-form.ts`, `.../domain-gal-settings/utils.ts`
- Shared hook: `apps/admin-ui-domains/src/services/use-modify-domain.ts` (does `flushCache` + invalidates `domainByIdKey(id, 1|0)` + quota, shows success/error snackbars)
- Layout: `packages/ui-components/src/components/layout/form-page-layout.tsx` (`.content` already pads `var(--padding-size-large) 1.5rem`)
- Error-mock pattern: `apps/admin-ui-domains/src/views/domain/details/tests/domain-authentication.browser.test.tsx:404-484`

**File structure after this plan:**

```
apps/admin-ui-domains/src/views/details/
├── domain-disclaimer.tsx                       (rewritten view)
├── domain-disclaimer.module.css                (moved, extended)
├── domain-disclaimer/
│   ├── use-domain-disclaimer-form.ts           (new)
│   ├── utils.ts                                (new)
│   └── utils.test.ts                           (new)
└── tests/
    ├── domain-disclaimer.browser.test.tsx      (moved, updated, extended)
    └── __screenshots__/domain-disclaimer.browser.test.tsx/  (moved, regenerated)
```

---

### Task 1: Move files under `views/details/` (pure move, zero behavior change)

**Files:**
- Move: `apps/admin-ui-domains/src/views/domain/details/domain-disclaimer.tsx` → `apps/admin-ui-domains/src/views/details/domain-disclaimer.tsx`
- Move: `apps/admin-ui-domains/src/views/domain/details/domain-disclaimer.module.css` → `apps/admin-ui-domains/src/views/details/domain-disclaimer.module.css`
- Move: `apps/admin-ui-domains/src/views/domain/details/tests/domain-disclaimer.browser.test.tsx` → `apps/admin-ui-domains/src/views/details/tests/domain-disclaimer.browser.test.tsx`
- Move: `apps/admin-ui-domains/src/views/domain/details/tests/__screenshots__/domain-disclaimer.browser.test.tsx/` → `apps/admin-ui-domains/src/views/details/tests/__screenshots__/domain-disclaimer.browser.test.tsx/`
- Modify: `apps/admin-ui-domains/src/views/domain-content-panel.tsx:35`
- Modify: `apps/admin-ui-domains/src/views/tests/domain-content-panel.browser.test.tsx:135`

- [ ] **Step 1: Move with git mv (preserves history)**

```bash
cd apps/admin-ui-domains/src/views
mkdir -p details/tests
git mv domain/details/domain-disclaimer.tsx details/domain-disclaimer.tsx
git mv domain/details/domain-disclaimer.module.css details/domain-disclaimer.module.css
git mv domain/details/tests/domain-disclaimer.browser.test.tsx details/tests/domain-disclaimer.browser.test.tsx
git mv "domain/details/tests/__screenshots__/domain-disclaimer.browser.test.tsx" "details/tests/__screenshots__/domain-disclaimer.browser.test.tsx"
```

- [ ] **Step 2: Fix relative imports in `details/domain-disclaimer.tsx`** (one `../` level less; `./domain-disclaimer.module.css` and the test's `import DomainDisclaimer from '../domain-disclaimer'` are unchanged)

| Old import | New import |
|---|---|
| `'../../../../types'` | `'../../../types'` |
| `'../../../composer/composer'` | `'../../composer/composer'` |
| `'../../../constants'` | `'../../constants'` |
| `'../../../hooks/use-selected-domain'` | `'../../hooks/use-selected-domain'` |
| `'../../../services/modify-domain-service'` | `'../../services/modify-domain-service'` |

- [ ] **Step 3: Update the two reference sites**

`domain-content-panel.tsx:35`: `import DomainDisclaimer from './domain/details/domain-disclaimer';` → `import DomainDisclaimer from './details/domain-disclaimer';` (keep default import in this task; named export switch happens in Task 4)

`views/tests/domain-content-panel.browser.test.tsx:135`: `vi.mock('../domain/details/domain-disclaimer', () => ({ default: MockDomainDisclaimer }));` → `vi.mock('../details/domain-disclaimer', () => ({ default: MockDomainDisclaimer }));`

- [ ] **Step 4: Verify tests still pass**

Run: `pnpm vitest run apps/admin-ui-domains/src/views/details/tests/domain-disclaimer.browser.test.tsx apps/admin-ui-domains/src/views/tests/domain-content-panel.browser.test.tsx`
Expected: all pass (pure move; screenshot basenames unchanged)

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "refactor(admin-ui-domains): move domain disclaimer view under views/details"
```

---

### Task 2: Extract save transformations to `utils.ts` (TDD)

**Files:**
- Create: `apps/admin-ui-domains/src/views/details/domain-disclaimer/utils.ts`
- Test: `apps/admin-ui-domains/src/views/details/domain-disclaimer/utils.test.ts`

These are the transformations currently inlined in `onSave` (domain-disclaimer.tsx:126-187) — extracted verbatim into pure functions.

- [ ] **Step 1: Write the failing unit test**

```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, expect, it } from 'vitest';

import {
  buildDisclaimerDomainAttributes,
  encodeDisclaimerHtml,
  getDefaultDisclaimerFormValues,
  normalizeDisclaimerText,
} from '../utils';

describe('normalizeDisclaimerText', () => {
  it('replaces diacritics with an apostrophe after NFD decomposition', () => {
    expect(normalizeDisclaimerText('café')).toBe("cafe'");
  });

  it('wraps content with a newline every 997 characters', () => {
    const wrapped = normalizeDisclaimerText('a'.repeat(2000));
    const lines = wrapped.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toHaveLength(997);
    expect(lines[1]).toHaveLength(997);
    expect(lines[2]).toHaveLength(6);
  });

  it('leaves short plain text untouched', () => {
    expect(normalizeDisclaimerText('hello')).toBe('hello');
  });
});

describe('encodeDisclaimerHtml', () => {
  it('encodes non-ascii printable chars into html entities', () => {
    expect(encodeDisclaimerHtml('<p>Ünicödé</p>')).toBe('<p>&Uuml;nic&ouml;d&egrave;</p>');
  });

  it('keeps ascii content untouched', () => {
    expect(encodeDisclaimerHtml('<p>Hello & "world"</p>')).toBe('<p>Hello & "world"</p>');
  });
});

describe('buildDisclaimerDomainAttributes', () => {
  it('builds enabled attributes with transformed content and domain name', () => {
    expect(
      buildDisclaimerDomainAttributes(
        {
          zimbraDomainMandatoryMailSignatureEnabled: true,
          zimbraAmavisDomainDisclaimerText: 'café',
          zimbraAmavisDomainDisclaimerHTML: '<p>Ünicödé</p>',
        },
        'example.com',
      ),
    ).toEqual([
      { n: 'zimbraAmavisDomainDisclaimerText', _content: "cafe'" },
      { n: 'zimbraAmavisDomainDisclaimerHTML', _content: '<p>&Uuml;nic&ouml;d&egrave;</p>' },
      { n: 'zimbraDomainMandatoryMailSignatureEnabled', _content: 'TRUE' },
      { n: 'amavisDisclaimerOptions', _content: 'example.com' },
    ]);
  });

  it('builds disabled attributes with empty disclaimer and options', () => {
    expect(
      buildDisclaimerDomainAttributes(
        {
          zimbraDomainMandatoryMailSignatureEnabled: false,
          zimbraAmavisDomainDisclaimerText: '',
          zimbraAmavisDomainDisclaimerHTML: '',
        },
        'example.com',
      ),
    ).toEqual([
      { n: 'zimbraAmavisDomainDisclaimerText', _content: '' },
      { n: 'zimbraAmavisDomainDisclaimerHTML', _content: '' },
      { n: 'zimbraDomainMandatoryMailSignatureEnabled', _content: 'FALSE' },
      { n: 'amavisDisclaimerOptions', _content: '' },
    ]);
  });
});

describe('getDefaultDisclaimerFormValues', () => {
  it('maps domain attributes to form default values', () => {
    expect(
      getDefaultDisclaimerFormValues([
        { n: 'zimbraDomainMandatoryMailSignatureEnabled', _content: 'TRUE' },
        { n: 'zimbraAmavisDomainDisclaimerText', _content: 'text' },
        { n: 'zimbraAmavisDomainDisclaimerHTML', _content: '<p>html</p>' },
      ]),
    ).toEqual({
      zimbraDomainMandatoryMailSignatureEnabled: true,
      zimbraAmavisDomainDisclaimerText: 'text',
      zimbraAmavisDomainDisclaimerHTML: '<p>html</p>',
    });
  });

  it('falls back to disabled and empty values when attributes are missing', () => {
    expect(getDefaultDisclaimerFormValues(undefined)).toEqual({
      zimbraDomainMandatoryMailSignatureEnabled: false,
      zimbraAmavisDomainDisclaimerText: '',
      zimbraAmavisDomainDisclaimerHTML: '',
    });
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm vitest run apps/admin-ui-domains/src/views/details/domain-disclaimer/utils.test.ts`
Expected: FAIL — cannot resolve `../utils`

- [ ] **Step 3: Implement `utils.ts`**

```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { encode } from 'html-entities';

import {
  AMAVIS_DISCLAIMER_OPTIONS,
  FALSE,
  TRUE,
  ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_HTML,
  ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_TEXT,
  ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
} from '../../../constants';

export type DomainDisclaimerFormValues = {
  zimbraDomainMandatoryMailSignatureEnabled: boolean;
  zimbraAmavisDomainDisclaimerText: string;
  zimbraAmavisDomainDisclaimerHTML: string;
};

type DomainAttribute = { n: string; _content?: string };

// RFC 5321 caps a line at 998 bytes including the newline (1 byte), so at most
// 997 content chars fit per line before wrapping.
const LONG_LINE_REGEX = /(.{997})/g;

function wrapLongLines(content: string): string {
  return content.replace(LONG_LINE_REGEX, '$1\n');
}

export function normalizeDisclaimerText(text: string): string {
  const withoutDiacritics = text.normalize('NFD').replaceAll(/\p{Diacritic}/gu, "'");
  return wrapLongLines(withoutDiacritics);
}

export function encodeDisclaimerHtml(html: string): string {
  return wrapLongLines(encode(html, { mode: 'nonAsciiPrintableOnly' }));
}

export function buildDisclaimerDomainAttributes(
  values: DomainDisclaimerFormValues,
  domainName: string | undefined,
): Array<{ n: string; _content: string }> {
  return [
    {
      n: ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_TEXT,
      _content: values.zimbraAmavisDomainDisclaimerText
        ? normalizeDisclaimerText(values.zimbraAmavisDomainDisclaimerText)
        : '',
    },
    {
      n: ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_HTML,
      _content: values.zimbraAmavisDomainDisclaimerHTML
        ? encodeDisclaimerHtml(values.zimbraAmavisDomainDisclaimerHTML)
        : '',
    },
    {
      n: ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
      _content: values.zimbraDomainMandatoryMailSignatureEnabled ? TRUE : FALSE,
    },
    {
      n: AMAVIS_DISCLAIMER_OPTIONS,
      _content: values.zimbraDomainMandatoryMailSignatureEnabled ? domainName ?? '' : '',
    },
  ];
}

export function getDefaultDisclaimerFormValues(
  domainInformation: Array<DomainAttribute> | undefined,
): DomainDisclaimerFormValues {
  const attrMap: Record<string, string> = {};
  domainInformation?.forEach((item) => {
    if (!attrMap[item.n]) {
      attrMap[item.n] = item._content ?? '';
    }
  });
  return {
    zimbraDomainMandatoryMailSignatureEnabled:
      attrMap[ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED] === TRUE,
    zimbraAmavisDomainDisclaimerText: attrMap[ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_TEXT] ?? '',
    zimbraAmavisDomainDisclaimerHTML: attrMap[ZIMBRA_AMAVIS_DOMAIN_DISCLAIMER_HTML] ?? '',
  };
}
```

(If an entity assertion fails, `html-entities` may emit numeric entities — print the actual value with `console.error` and adjust the expected string; the wrapping behavior is what matters.)

- [ ] **Step 4: Run to verify pass**

Run: `pnpm vitest run apps/admin-ui-domains/src/views/details/domain-disclaimer/utils.test.ts`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/admin-ui-domains/src/views/details/domain-disclaimer && git commit -m "refactor(admin-ui-domains): extract disclaimer save transformations to tested utils"
```

---

### Task 3: Create `useDomainDisclaimerForm` hook

**Files:**
- Create: `apps/admin-ui-domains/src/views/details/domain-disclaimer/use-domain-disclaimer-form.ts`

No separate hook unit test (consistent with `use-domain-gal-form.ts`; behavior is covered by Task 5 browser tests, and the mutation itself is already covered by `src/services/tests/use-modify-domain.test.tsx`).

- [ ] **Step 1: Write the hook**

```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useRef } from 'react';

import { ZIMBRA_ADMIN_URN } from '../../../constants';
import { useModifyDomain } from '../../../services/use-modify-domain';
import { buildDisclaimerDomainAttributes, type DomainDisclaimerFormValues } from './utils';

type UseDomainDisclaimerFormArgs = {
  defaultValues: DomainDisclaimerFormValues;
  domainId: string | undefined;
  domainName: string | undefined;
};

export function useDomainDisclaimerForm({
  defaultValues,
  domainId,
  domainName,
}: UseDomainDisclaimerFormArgs) {
  const saveInFlightRef = useRef(false);
  const modifyDomainMutation = useModifyDomain(domainId);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value, formApi }) => {
      try {
        await modifyDomainMutation.mutateAsync({
          id: domainId,
          _jsns: ZIMBRA_ADMIN_URN,
          a: buildDisclaimerDomainAttributes(value, domainName),
        });
        formApi.reset(value, { keepDefaultValues: true });
      } catch {
        // useModifyDomain already reports the failure via snackbar.
      }
    },
  });

  function handleSave(): void {
    if (saveInFlightRef.current) return;
    saveInFlightRef.current = true;
    void form.handleSubmit().finally(() => {
      saveInFlightRef.current = false;
    });
  }

  function handleCancel(): void {
    form.reset();
  }

  return { form, handleSave, handleCancel };
}

export type DomainDisclaimerFormApi = ReturnType<typeof useDomainDisclaimerForm>['form'];
```

Note: `useModifyDomain` onSuccess already does `await flushCache('domain', 'id', domainId)` + invalidates `domainByIdKey(id, 1)`, `domainByIdKey(id, 0)` and quota queries → ticket's "disclaimer changes refresh the domain data automatically after saving". The old manual `flushCache` + `isGlobalAdmin` + `setQueryData` logic is fully replaced. Per AGENTS.md post-save pattern, `formApi.reset(value, { keepDefaultValues: true })` + the hook's invalidation clears `isDirty`.

- [ ] **Step 2: Type-check**

Run: `pnpm type-check`
Expected: no new errors in admin-ui-domains

- [ ] **Step 3: Commit**

```bash
git add apps/admin-ui-domains/src/views/details/domain-disclaimer/use-domain-disclaimer-form.ts && git commit -m "refactor(admin-ui-domains): add domain disclaimer form hook on shared useModifyDomain"
```

---

### Task 4: Rewrite the view with `FormPageLayout` + TanStack Form

**Files:**
- Modify: `apps/admin-ui-domains/src/views/details/domain-disclaimer.tsx` (full rewrite)
- Modify: `apps/admin-ui-domains/src/views/details/domain-disclaimer.module.css`
- Modify: `apps/admin-ui-domains/src/views/domain-content-panel.tsx:35`
- Modify: `apps/admin-ui-domains/src/views/tests/domain-content-panel.browser.test.tsx:135`

- [ ] **Step 1: Rewrite `domain-disclaimer.tsx`**

```tsx
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import { FormPageLayout, Switch, TextArea } from '@zextras/ui-components';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

import Composer from '../../composer/composer';
import { useSelectedDomain } from '../../hooks/use-selected-domain';
import { useDomainDisclaimerForm } from './domain-disclaimer/use-domain-disclaimer-form';
import { getDefaultDisclaimerFormValues } from './domain-disclaimer/utils';
import styles from './domain-disclaimer.module.css';

export const DomainDisclaimer = () => {
  const [t] = useTranslation();
  const { data: domain } = useSelectedDomain();
  const domainInformation = domain?.a;
  const domainId = domain?.id;
  const domainName = domain?.name;

  const defaultValues = getDefaultDisclaimerFormValues(domainInformation);

  const { form, handleSave, handleCancel } = useDomainDisclaimerForm({
    defaultValues,
    domainId,
    domainName,
  });

  const isDirty = useSelector(form.store, (s) => !s.isDefaultValue);

  return (
    <div className={styles.page}>
      <FormPageLayout
        title={t('label.disclaimer', 'Disclaimer')}
        unsavedChanges={isDirty}
        onSave={handleSave}
        onCancel={handleCancel}
      >
        <form.Field name="zimbraDomainMandatoryMailSignatureEnabled">
          {(field) => (
            <Switch
              label={t(
                'label.enable_disclaimers_for_this_domain',
                'Enable disclaimers for this domain',
              )}
              value={field.state.value}
              onClick={() => {
                field.handleChange(!field.state.value);
              }}
            />
          )}
        </form.Field>

        <div className={styles.editorsGrid}>
          <section className={styles.editorColumn}>
            <ds-text as="h3" size="small" weight="bold" color="gray0">
              {t('label.text_editor', 'Text Editor')}
            </ds-text>
            <form.Field name="zimbraAmavisDomainDisclaimerText">
              {(field) => (
                <TextArea
                  label={''}
                  value={field.state.value}
                  // @ts-expect-error - needs a fix
                  onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                    field.handleChange(event.currentTarget.value);
                  }}
                  maxHeight="20.5rem"
                />
              )}
            </form.Field>
          </section>

          <section className={styles.editorColumn}>
            <ds-text as="h3" size="small" weight="bold" color="gray0">
              {t('label.rich_text_editor', 'Rich Text Editor')}
            </ds-text>
            <form.Field name="zimbraAmavisDomainDisclaimerHTML">
              {(field) => (
                <div className={styles.editorWrapper}>
                  <Composer
                    initialValue={defaultValues.zimbraAmavisDomainDisclaimerHTML}
                    value={field.state.value}
                    onEditorChange={(values) => {
                      field.handleChange(values[1]);
                    }}
                  />
                </div>
              )}
            </form.Field>
          </section>
        </div>
      </FormPageLayout>
    </div>
  );
};
```

Key points: named export (no `FC`, no default export); `form.Field` render props re-render on field change, keeping the controlled `Composer` value in sync on cancel/save (its selector flips `isDirty` → guaranteed re-render); the delayed "mandatory disclaimers is enabled" snackbar is dropped (confirmed); `isGlobalAdmin`/`useUserSettings`/`useQueryClient`/`useParams`/`flushCache`/manual state all removed — handled by the shared hook.

- [ ] **Step 2: Update `domain-disclaimer.module.css`**

```css
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
.page {
  height: calc(100vh - 105px);
  background: var(--color-gray6-regular);
  overflow-y: auto;
}

.editorsGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--padding-size-large);
  margin-top: var(--padding-size-extralarge);
  width: 100%;
}

.editorColumn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--padding-size-small);
  min-width: 0;
}

.editorWrapper {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  position: relative;
}

.editorWrapper .tox-edit-area iframe {
  background: var(--color-gray5-regular);
}
```

- [ ] **Step 3: Switch reference sites to the named export**

`domain-content-panel.tsx:35`: → `import { DomainDisclaimer } from './details/domain-disclaimer';`

`views/tests/domain-content-panel.browser.test.tsx:135`: → `vi.mock('../details/domain-disclaimer', () => ({ DomainDisclaimer: MockDomainDisclaimer }));`

- [ ] **Step 4: Type-check + lint**

Run: `pnpm type-check && pnpm lint`
Expected: no new errors (browser tests will be fixed in Task 5 — expect `domain-disclaimer.browser.test.tsx` failures if run now; that's the next task)

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "refactor(admin-ui-domains): modernize domain disclaimer view with TanStack Form and FormPageLayout"
```

---

### Task 5: Update and extend browser tests

**Files:**
- Modify: `apps/admin-ui-domains/src/views/details/tests/domain-disclaimer.browser.test.tsx` (full rewrite below)
- Delete+regenerate: `apps/admin-ui-domains/src/views/details/tests/__screenshots__/domain-disclaimer.browser.test.tsx/` (rendering changes: buttons now hidden when clean, new layout)

- [ ] **Step 1: Rewrite the test file**

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { domainByIdKey } from '@zextras/ui-shared';
import {
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  setupBrowserTest,
  worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { DomainDisclaimer } from '../domain-disclaimer';

const DOMAIN_ID = 'test-domain-id-123';
const DOMAIN_NAME = 'example.com';

type DomainAttribute = { n: string; _content: string };

function buildDisclaimerDomainAttributes(
  overrides: Array<DomainAttribute> = [],
): Array<DomainAttribute> {
  const defaults: Array<DomainAttribute> = [
    { n: 'zimbraDomainName', _content: DOMAIN_NAME },
    { n: 'zimbraId', _content: DOMAIN_ID },
    { n: 'zimbraDomainMandatoryMailSignatureEnabled', _content: 'TRUE' },
    { n: 'zimbraAmavisDomainDisclaimerText', _content: 'Sample disclaimer text' },
    { n: 'zimbraAmavisDomainDisclaimerHTML', _content: '<p>Sample HTML disclaimer</p>' },
  ];

  const overrideKeys = new Set(overrides.map((o) => o.n));
  const filtered = defaults.filter((d) => !overrideKeys.has(d.n));
  return [...filtered, ...overrides];
}

function setupDisclaimerTest(
  attributeOverrides: Array<DomainAttribute> = [],
): ReturnType<typeof getQueryClient> {
  const domainAttributes = buildDisclaimerDomainAttributes(attributeOverrides);
  const queryClient = getQueryClient();
  queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
    id: DOMAIN_ID,
    name: DOMAIN_NAME,
    a: domainAttributes,
  });
  return queryClient;
}

function renderDisclaimer(queryClient: ReturnType<typeof getQueryClient>): void {
  setupBrowserTest(<DomainDisclaimer />, {
    queryClient,
    initialRouterEntry: `/${DOMAIN_ID}/disclaimer`,
    withDomainIdRoute: true,
  });
}

describe('DomainDisclaimer', () => {
  describe('Rendering', () => {
    it('should render the Disclaimer header', async () => {
      renderDisclaimer(setupDisclaimerTest());
      await expect.element(page.getByText('Disclaimer', { exact: true })).toBeVisible();
    });

    it('should render the Disclaimer switch', async () => {
      renderDisclaimer(setupDisclaimerTest());
      await expect
        .element(page.getByRole('switch', { name: 'Enable disclaimers for this domain' }))
        .toBeVisible();
    });

    it('should render text in the TextArea from domain data', async () => {
      renderDisclaimer(setupDisclaimerTest());
      await expect.element(page.getByRole('textbox')).toHaveValue('Sample disclaimer text');
    });

    it('should not show Save and Cancel when not dirty', async () => {
      renderDisclaimer(setupDisclaimerTest());
      await expect.element(page.getByText('Disclaimer', { exact: true })).toBeVisible();
      await expect
        .element(page.getByRole('button', { name: /^save$/i }))
        .not.toBeInTheDocument();
      await expect
        .element(page.getByRole('button', { name: /^cancel$/i }))
        .not.toBeInTheDocument();
    });
  });

  describe('Dirty state', () => {
    it('should show Save and Cancel after typing in the TextArea', async () => {
      renderDisclaimer(setupDisclaimerTest());
      await userEvent.fill(page.getByRole('textbox'), 'New disclaimer');
      await expect
        .element(page.getByRole('button', { name: /^save$/i }))
        .toBeVisible();
      await expect
        .element(page.getByRole('button', { name: /^cancel$/i }))
        .toBeVisible();
    });

    it('should show Save and Cancel after toggling the switch', async () => {
      renderDisclaimer(setupDisclaimerTest());
      await page
        .getByRole('switch', { name: 'Enable disclaimers for this domain' })
        .click();
      await expect
        .element(page.getByRole('button', { name: /^save$/i }))
        .toBeVisible();
    });

    it('should revert changes and hide buttons when Cancel is clicked', async () => {
      renderDisclaimer(setupDisclaimerTest());
      await userEvent.fill(page.getByRole('textbox'), 'Discarded text');
      await page.getByRole('button', { name: /^cancel$/i }).click();
      await expect.element(page.getByRole('textbox')).toHaveValue('Sample disclaimer text');
      await expect
        .element(page.getByRole('button', { name: /^save$/i }))
        .not.toBeInTheDocument();
    });
  });

  describe('Save', () => {
    it('should call ModifyDomain with disclaimer attributes when Save is clicked', async () => {
      const modifyDomainInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
        domain: [{ name: DOMAIN_NAME, id: DOMAIN_ID, a: [] }],
      });
      createBrowserSoapAPIInterceptor('FlushCache', {});
      renderDisclaimer(setupDisclaimerTest());

      await userEvent.fill(page.getByRole('textbox'), 'New disclaimer');
      await page.getByRole('button', { name: /^save$/i }).click();

      const requestParams = (await modifyDomainInterceptor) as any;
      expect(requestParams.id).toBe(DOMAIN_ID);
      const textAttr = requestParams.a.find(
        (attr: any) => attr.n === 'zimbraAmavisDomainDisclaimerText',
      );
      expect(textAttr._content).toBe('New disclaimer');
      const enabledAttr = requestParams.a.find(
        (attr: any) => attr.n === 'zimbraDomainMandatoryMailSignatureEnabled',
      );
      expect(enabledAttr._content).toBe('TRUE');
      const optionsAttr = requestParams.a.find(
        (attr: any) => attr.n === 'amavisDisclaimerOptions',
      );
      expect(optionsAttr._content).toBe(DOMAIN_NAME);
    });

    it('should send empty disclaimer attributes when the switch is toggled off', async () => {
      const modifyDomainInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
        domain: [{ name: DOMAIN_NAME, id: DOMAIN_ID, a: [] }],
      });
      createBrowserSoapAPIInterceptor('FlushCache', {});
      renderDisclaimer(setupDisclaimerTest());

      await page
        .getByRole('switch', { name: 'Enable disclaimers for this domain' })
        .click();
      await page.getByRole('button', { name: /^save$/i }).click();

      const requestParams = (await modifyDomainInterceptor) as any;
      const enabledAttr = requestParams.a.find(
        (attr: any) => attr.n === 'zimbraDomainMandatoryMailSignatureEnabled',
      );
      expect(enabledAttr._content).toBe('FALSE');
      const optionsAttr = requestParams.a.find(
        (attr: any) => attr.n === 'amavisDisclaimerOptions',
      );
      expect(optionsAttr._content).toBe('');
    });

    it('should normalize diacritics in the text disclaimer on save', async () => {
      const modifyDomainInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
        domain: [{ name: DOMAIN_NAME, id: DOMAIN_ID, a: [] }],
      });
      createBrowserSoapAPIInterceptor('FlushCache', {});
      renderDisclaimer(setupDisclaimerTest());

      await userEvent.fill(page.getByRole('textbox'), 'Café');
      await page.getByRole('button', { name: /^save$/i }).click();

      const requestParams = (await modifyDomainInterceptor) as any;
      const textAttr = requestParams.a.find(
        (attr: any) => attr.n === 'zimbraAmavisDomainDisclaimerText',
      );
      expect(textAttr._content).toBe("Cafe'");
    });

    it('should show the success snackbar, refetch the domain and hide buttons after save', async () => {
      createBrowserSoapAPIInterceptor('ModifyDomain', {
        domain: [{ name: DOMAIN_NAME, id: DOMAIN_ID, a: [] }],
      });
      createBrowserSoapAPIInterceptor('FlushCache', {});
      const getDomainInterceptor = createBrowserSoapAPIInterceptor('GetDomain', {
        domain: [
          {
            name: DOMAIN_NAME,
            id: DOMAIN_ID,
            a: buildDisclaimerDomainAttributes([
              { n: 'zimbraAmavisDomainDisclaimerText', _content: 'New disclaimer' },
            ]),
          },
        ],
      });
      renderDisclaimer(setupDisclaimerTest());

      await userEvent.fill(page.getByRole('textbox'), 'New disclaimer');
      await page.getByRole('button', { name: /^save$/i }).click();

      await expect
        .element(page.getByText('The change has been saved successfully'))
        .toBeVisible();
      await getDomainInterceptor;
      await expect.element(page.getByRole('textbox')).toHaveValue('New disclaimer');
      await expect
        .element(page.getByRole('button', { name: /^save$/i }))
        .not.toBeInTheDocument();
    });

    it('should show an error snackbar and keep Save visible when ModifyDomain fails', async () => {
      worker.use(
        http.post('/service/admin/soap/ModifyDomainRequest', () =>
          HttpResponse.json(
            { Body: { Fault: { Reason: { Text: 'Server error' } } } },
            { status: 500 },
          ),
        ),
      );
      renderDisclaimer(setupDisclaimerTest());

      await userEvent.fill(page.getByRole('textbox'), 'New disclaimer');
      await page.getByRole('button', { name: /^save$/i }).click();

      await expect.element(page.getByText('Server error')).toBeVisible();
      await expect
        .element(page.getByRole('button', { name: /^save$/i }))
        .toBeVisible();
    });
  });
});
```

Notes: every save test mocks `FlushCache` because the shared hook always flushes after save (the old code skipped it for non-admins). Error path mirrors `domain-authentication.browser.test.tsx:404-425`. `worker` and `http`/`HttpResponse` come from `admin-ui-test-utils` / `msw` exactly as in that file.

- [ ] **Step 2: Regenerate screenshot baselines**

```bash
rm -rf "apps/admin-ui-domains/src/views/details/tests/__screenshots__/domain-disclaimer.browser.test.tsx"
pnpm vitest run apps/admin-ui-domains/src/views/details/tests/domain-disclaimer.browser.test.tsx
```

Expected: 11 tests pass; new baselines auto-generated. **Visually diff one new screenshot against the pre-refactor UI** (git show HEAD~N of the old png) — layout should match apart from Save/Cancel visibility.

- [ ] **Step 3: Run the route-level test**

Run: `pnpm vitest run apps/admin-ui-domains/src/views/tests/domain-content-panel.browser.test.tsx`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "test(admin-ui-domains): cover disclaimer dirty state, save transforms and error reporting"
```

---

### Task 6: Cleanup and full verification

**Files:**
- Modify: `apps/admin-ui-domains/types/domain/index.d.ts:130-134`

- [ ] **Step 1: Remove the orphaned `DomainDisclaimerType`** — verify first with `rg -n "DomainDisclaimerType" apps/ packages/` (after Tasks 2-5 the only remaining hit must be the definition itself), then delete the type from `types/domain/index.d.ts`.

- [ ] **Step 2: Full verification**

```bash
pnpm type-check
pnpm lint
pnpm vitest run apps/admin-ui-domains/src/views/details apps/admin-ui-domains/src/views/tests/domain-content-panel.browser.test.tsx apps/admin-ui-domains/src/services/tests/use-modify-domain.test.tsx
```

Expected: type-check clean, lint clean, all tests green.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "chore(admin-ui-domains): drop orphaned DomainDisclaimerType"
```
