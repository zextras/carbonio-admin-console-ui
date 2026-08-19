# GlobalDetailPanel TanStack Form Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy `useState`/`useEffect` form state in `GlobalDetailPanel` (rendered at `/manage/domains/global/settings`) with a TanStack Form implementation.

**Architecture:** Single-file rewrite following `apps/admin-ui-backup/src/views/backup/server-advanced/server-advanced.tsx`: a wrapper that gates on `useAllConfig()` loading, and a content component owning `useForm` with zod validation. Dirty state comes from `useSelector(form.store, ...)`; save uses the AGENTS.md post-save pattern (`form.reset(value, { keepDefaultValues: true })` + query invalidation).

**Tech Stack:** `@tanstack/react-form` v1.32, `@tanstack/react-store` (transitive), zod 4 (already installed), MSW + vitest browser mode for tests.

**Spec:** `docs/superpowers/specs/2026-08-19-global-detail-panel-tanstack-form-design.md`

---

### Task 1: Add `@tanstack/react-form` dependency

**Files:**
- Modify: `apps/admin-ui-domains/package.json`

- [ ] **Step 1: Add the dependency**

In `apps/admin-ui-domains/package.json`, add to `dependencies` (keep alphabetical order, after `@tanstack/react-query`):

```json
    "@tanstack/react-form": "^1.32.0",
```

- [ ] **Step 2: Install**

Run from repo root: `pnpm install`
Expected: lockfile updated, no resolution errors.

- [ ] **Step 3: Commit**

```bash
git add apps/admin-ui-domains/package.json pnpm-lock.yaml
git commit -m "chore: add @tanstack/react-form to admin-ui-domains"
```

---

### Task 2: Write the failing browser test suite

**Files:**
- Create: `apps/admin-ui-domains/src/views/domain/global/tests/global-detail-panel.browser.test.tsx`

Notes for the implementer:
- The component fetches config via `useAllConfig()` which calls `soapFetch('GetAllConfig', ...)` → MSW endpoint `/service/admin/soap/GetAllConfigRequest`. Mock it with `createBrowserSoapAPIInterceptor('GetAllConfig', response)` where `response = { a: [{ n, _content }, ...] }`.
- Save posts to `/service/admin/soap/ModifyConfigRequest` via `modifyConfig`; `createBrowserSoapAPIInterceptor('ModifyConfig', {})` returns a promise resolving with the request params (contains `{ _jsns, a }`) — await it after clicking Save to assert the payload.
- ui-components `Input` uses its `label` prop as the input's `placeholder`, so `page.getByPlaceholder('Notification Sender')` targets the sender textbox. `Switch` renders with role `switch` accessible by label.
- Follow `apps/admin-ui-privacy/src/views/privacy/tests/privacy-view.browser.test.tsx` conventions. No `getByTestId` (AGENTS.md). `page` comes from `vitest/browser` and is NOT a Playwright page.

- [ ] **Step 1: Create the test file**

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	createBrowserAPIInterceptor,
	createBrowserSoapAPIInterceptor,
	resetMockWorker,
	setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { GlobalDetailPanel } from '../global-detail-panel';

const SENDER = 'notifications@test.com';
const RECIPIENT_1 = 'admin@test.com';
const RECIPIENT_2 = 'ops@test.com';

const SWITCH_LABELS = {
	mandatoryDisclaimer: 'Mandatory disclaimer for all domains',
	outboundDisclaimers: 'Only allow outbound disclaimers',
	searchAllDomains: `Allow searching users' information in all domains`,
} as const;

function getAllConfigResponse(): object {
	return {
		a: [
			{ n: 'carbonioNotificationFrom', _content: SENDER },
			{ n: 'carbonioNotificationRecipients', _content: RECIPIENT_1 },
			{ n: 'carbonioNotificationRecipients', _content: RECIPIENT_2 },
			{ n: 'zimbraDomainMandatoryMailSignatureEnabled', _content: 'TRUE' },
			{ n: 'zimbraAmavisOutboundDisclaimersOnly', _content: 'FALSE' },
			{ n: 'carbonioSearchAllDomainsByFeature', _content: 'TRUE' },
		],
	};
}

async function setupGlobalSettingsPanel(): Promise<void> {
	const getAllConfigInterceptor = createBrowserSoapAPIInterceptor(
		'GetAllConfig',
		getAllConfigResponse(),
	);

	setupBrowserTest(<GlobalDetailPanel />);

	await getAllConfigInterceptor;

	await expect.element(page.getByPlaceholder('Notification Sender')).toBeVisible();
}

describe('GlobalDetailPanel', { timeout: 20_000 }, () => {
	afterEach(() => {
		resetMockWorker();
	});

	it('renders fields from GetAllConfig', async () => {
		await setupGlobalSettingsPanel();

		await expect
			.element(page.getByPlaceholder('Notification Sender'))
			.toHaveValue(SENDER);
		await expect.element(page.getByText(RECIPIENT_1)).toBeVisible();
		await expect.element(page.getByText(RECIPIENT_2)).toBeVisible();
		await expect
			.element(page.getByRole('switch', { name: SWITCH_LABELS.mandatoryDisclaimer }))
			.toBeChecked();
		await expect
			.element(page.getByRole('switch', { name: SWITCH_LABELS.outboundDisclaimers }))
			.not.toBeChecked();
		await expect
			.element(page.getByRole('switch', { name: SWITCH_LABELS.searchAllDomains }))
			.toBeChecked();
	});

	it('shows no save/cancel buttons until dirty, and hides them after cancel', async () => {
		await setupGlobalSettingsPanel();

		await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();

		await page.getByRole('switch', { name: SWITCH_LABELS.mandatoryDisclaimer }).click();

		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

		await page.getByRole('button', { name: 'Cancel' }).click();

		await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
		await expect
			.element(page.getByRole('switch', { name: SWITCH_LABELS.mandatoryDisclaimer }))
			.toBeChecked();
	});

	it('shows an inline error and blocks save when sender email is invalid', async () => {
		const modifyConfigInterceptor = createBrowserSoapAPIInterceptor('ModifyConfig', {});
		await setupGlobalSettingsPanel();

		const senderInput = page.getByPlaceholder('Notification Sender');
		await userEvent.fill(senderInput, 'not-an-email');
		await page.getByRole('switch', { name: SWITCH_LABELS.searchAllDomains }).click();

		await expect.element(page.getByText('Enter a valid email address.')).toBeVisible();

		await page.getByRole('button', { name: 'Save' }).click();

		await expect.element(page.getByText('Enter a valid email address.')).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
		await expect
			.poll(async () => {
				try {
					await Promise.race([modifyConfigInterceptor, new Promise((r) => setTimeout(r, 50))]);
					return 'resolved';
				} catch {
					return 'pending';
				}
			})
			.not.toBe('resolved');
	});

	it('saves the expected ModifyConfig payload and clears dirty state', async () => {
		const modifyConfigInterceptor = createBrowserSoapAPIInterceptor('ModifyConfig', {});
		await setupGlobalSettingsPanel();

		await page.getByRole('switch', { name: SWITCH_LABELS.mandatoryDisclaimer }).click();
		await page.getByRole('switch', { name: SWITCH_LABELS.outboundDisclaimers }).click();

		await page.getByRole('button', { name: 'Save' }).click();

		const request = await modifyConfigInterceptor;

		expect(request).toMatchObject({
			_jsns: 'urn:zimbraAdmin',
			a: [
				{ n: 'carbonioNotificationFrom', _content: SENDER },
				{ n: 'carbonioNotificationRecipients', _content: RECIPIENT_1 },
				{ n: 'carbonioNotificationRecipients', _content: RECIPIENT_2 },
				{ n: 'zimbraDomainMandatoryMailSignatureEnabled', _content: 'FALSE' },
				{ n: 'zimbraAmavisOutboundDisclaimersOnly', _content: 'TRUE' },
				{ n: 'carbonioSearchAllDomainsByFeature', _content: 'TRUE' },
			],
		});

		await expect.element(page.getByText('The change has been saved successfully')).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
	});

	it('shows an error snackbar and stays dirty when save fails', async () => {
		createBrowserAPIInterceptor('post', '/service/admin/soap/ModifyConfigRequest', () =>
			HttpResponse.json(
				{
					Body: {
						Fault: {
							Reason: { Text: 'unknown document: ModifyConfigRequest' },
						},
					},
				},
				{ status: 500 },
			),
		);
		await setupGlobalSettingsPanel();

		await page.getByRole('switch', { name: SWITCH_LABELS.searchAllDomains }).click();
		await page.getByRole('button', { name: 'Save' }).click();

		await expect
			.element(page.getByText('Something went wrong. Please try again.'))
			.toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
	});
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run from repo root:
`pnpm vitest run apps/admin-ui-domains/src/views/domain/global/tests/global-detail-panel.browser.test.tsx --reporter=verbose`
Expected: FAIL — the named export `GlobalDetailPanel` does not exist yet (the module has only a default export), so rendering produces nothing / import is undefined.

- [ ] **Step 3: Commit the failing tests**

```bash
git add apps/admin-ui-domains/src/views/domain/global/tests/global-detail-panel.browser.test.tsx
git commit -m "test: add browser tests for GlobalDetailPanel TanStack Form conversion"
```

---

### Task 3: Rewrite `GlobalDetailPanel` with TanStack Form

**Files:**
- Modify: `apps/admin-ui-domains/src/views/domain/global/global-detail-panel.tsx` (full rewrite)
- Modify: `apps/admin-ui-domains/src/views/global-section-routes.ts:21` (import style)

- [ ] **Step 1: Replace the component file content**

Replace the entire content of `apps/admin-ui-domains/src/views/domain/global/global-detail-panel.tsx` with:

```tsx
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import {
  Button,
  ChipInput,
  ChipItem,
  Container,
  Input,
  ListRow,
  Padding,
  Row,
  Switch,
  useSnackbar,
} from '@zextras/ui-components';
import { useAllConfig } from '@zextras/ui-shared';
import { filter } from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Attribute } from '../../../../types';
import {
  CARBONIO_SEARCH_ALL_DOMAINS_BY_FEATURE,
  FALSE,
  TRUE,
  ZIMBRA_AMAVIS_OUTBOUND_DISCLAIMERS_ONLY,
  ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
} from '../../../constants';
import { modifyConfig } from '../../../services/modify-config';
import { isValidEmail } from '../../utility/utils';

type GlobalSettingsFormValues = {
  carbonioNotificationFrom: string;
  carbonioNotificationRecipients: Array<ChipItem>;
  zimbraDomainMandatoryMailSignatureEnabled: boolean;
  zimbraAmavisOutboundDisclaimersOnly: boolean;
  carbonioSearchAllDomainsByFeature: boolean;
};

const globalSettingsSchema = z.object({
  carbonioNotificationFrom: z
    .string()
    .refine((value) => value === '' || isValidEmail(value), {
      message: 'label.notification_error_msg',
    }),
  carbonioNotificationRecipients: z.array(z.any()),
  zimbraDomainMandatoryMailSignatureEnabled: z.boolean(),
  zimbraAmavisOutboundDisclaimersOnly: z.boolean(),
  carbonioSearchAllDomainsByFeature: z.boolean(),
});

function mapConfigToFormValues(configInformation: Array<Attribute>): GlobalSettingsFormValues {
  const notificationFrom = filter(configInformation, { n: 'carbonioNotificationFrom' });
  const notificationRecipients = filter(configInformation, {
    n: 'carbonioNotificationRecipients',
  });
  return {
    carbonioNotificationFrom: notificationFrom[0]?._content ?? '',
    carbonioNotificationRecipients: notificationRecipients.map((item) => ({
      label: item._content,
    })),
    zimbraDomainMandatoryMailSignatureEnabled:
      filter(configInformation, { n: ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED })[0]
        ?._content === TRUE,
    zimbraAmavisOutboundDisclaimersOnly:
      filter(configInformation, { n: ZIMBRA_AMAVIS_OUTBOUND_DISCLAIMERS_ONLY })[0]?._content ===
      TRUE,
    carbonioSearchAllDomainsByFeature:
      filter(configInformation, { n: CARBONIO_SEARCH_ALL_DOMAINS_BY_FEATURE })[0]?._content ===
      TRUE,
  };
}

function mapFormValuesToAttributes(values: GlobalSettingsFormValues): Array<Attribute> {
  const attributes: Array<Attribute> = [
    { n: 'carbonioNotificationFrom', _content: values.carbonioNotificationFrom },
  ];
  values.carbonioNotificationRecipients.forEach((item: ChipItem): void => {
    attributes.push({ n: 'carbonioNotificationRecipients', _content: item?.label });
  });
  attributes.push({
    n: ZIMBRA_DOMAIN_MANDATORY_MAIL_SIGNATURE_ENABLED,
    _content: values.zimbraDomainMandatoryMailSignatureEnabled ? TRUE : FALSE,
  });
  attributes.push({
    n: ZIMBRA_AMAVIS_OUTBOUND_DISCLAIMERS_ONLY,
    _content: values.zimbraAmavisOutboundDisclaimersOnly ? TRUE : FALSE,
  });
  attributes.push({
    n: CARBONIO_SEARCH_ALL_DOMAINS_BY_FEATURE,
    _content: values.carbonioSearchAllDomainsByFeature ? TRUE : FALSE,
  });
  return attributes;
}

const GlobalDetailPanelContent = ({
  configInformation,
  invalidate,
}: {
  configInformation: Array<Attribute>;
  invalidate: () => void;
}) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  const initialDefaults = mapConfigToFormValues(configInformation);

  const form = useForm({
    defaultValues: initialDefaults,
    validators: { onChange: globalSettingsSchema, onSubmit: globalSettingsSchema },
    onSubmit: async ({ value }) => {
      try {
        await modifyConfig(mapFormValuesToAttributes(value));

        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t('label.change_save_success_msg', 'The change has been saved successfully'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });

        if (
          value.zimbraDomainMandatoryMailSignatureEnabled &&
          value.zimbraDomainMandatoryMailSignatureEnabled !==
            initialDefaults.zimbraDomainMandatoryMailSignatureEnabled
        ) {
          setTimeout(() => {
            createSnackbar({
              key: 'success',
              severity: 'success',
              label: t(
                'label.mandatory_disclaimer_are_enable_for_all_domain',
                'The mandatory disclaimers are enabled for all domains',
              ),
              autoHideTimeout: 2000,
              hideButton: true,
              replace: true,
            });
          }, 2000);
        }
        if (
          value.zimbraAmavisOutboundDisclaimersOnly &&
          value.zimbraAmavisOutboundDisclaimersOnly !==
            initialDefaults.zimbraAmavisOutboundDisclaimersOnly
        ) {
          setTimeout(() => {
            createSnackbar({
              key: 'success',
              severity: 'success',
              label: t(
                'label.mandatory_disclaimer_are_enable_only_for_outbound_deliveries',
                'The mandatory disclaimers are enabled only for outbound deliveries',
              ),
              autoHideTimeout: 3000,
              hideButton: true,
              replace: true,
            });
          }, 4000);
        }

        form.reset(value, { keepDefaultValues: true });
        invalidate();
      } catch {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      }
    },
  });

  const isDirty = useSelector(form.store, (s) => !s.isDefaultValue);

  return (
    <Container
      orientation="column"
      crossAlignment="flex-start"
      mainAlignment="flex-start"
      style={{ overflowY: 'auto', position: 'relative' }}
      background="white"
    >
      <Row mainAlignment="flex-start" width="100%" padding={{ all: 'large' }}>
        <Container orientation="vertical" mainAlignment="space-around" height="1.9rem">
          <Row orientation="horizontal" width="100%">
            <Row mainAlignment="flex-start" width="50%" crossAlignment="center">
              <ds-text as="h1" weight="bold">{t('label.settings', 'Settings')}</ds-text>
            </Row>
            <Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
              <Padding right="small">
                {isDirty && (
                  <Button
                    label={t('label.cancel', 'Cancel')}
                    color="secondary"
                    onClick={() => form.reset()}
                  />
                )}
              </Padding>
              {isDirty && (
                <Button
                  label={t('label.save', 'Save')}
                  color="primary"
                  onClick={() => form.handleSubmit()}
                />
              )}
            </Row>
          </Row>
        </Container>
      </Row>
      <ds-divider></ds-divider>
      <Container
        orientation="column"
        crossAlignment="flex-start"
        mainAlignment="flex-start"
        width="100%"
        height="calc(100vh - 12.5rem)"
        padding={{ top: 'extralarge', right: 'large', bottom: 'large', left: 'large' }}
      >
        <Row mainAlignment="flex-start" width="100%" background="gray6" padding={{ top: 'small' }}>
          <ds-text as="h2" size="small" weight="bold" color="gray0">
            {t('label.domain_system_notifications', 'Domain System Notifications')}
          </ds-text>
        </Row>
        <ListRow>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            padding={{ top: 'large', bottom: 'small' }}
          >
            <form.Field name="carbonioNotificationFrom">
              {(field) => {
                const hasError = field.state.meta.errors.length > 0;
                return (
                  <Input
                    isRequired
                    inputName="carbonioNotificationFrom"
                    label={t('label.notification_sender', 'Notification Sender')}
                    backgroundColor="gray5"
                    value={field.state.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                      field.handleChange(e.target.value);
                    }}
                    hasError={hasError}
                    description={
                      hasError
                        ? t('label.notification_error_msg', 'Enter a valid email address.')
                        : undefined
                    }
                  />
                );
              }}
            </form.Field>
          </Container>
        </ListRow>
        <ListRow>
          <Container
            mainAlignment="flex-start"
            crossAlignment="flex-start"
            padding={{ top: 'large', bottom: 'small' }}
          >
            <form.Field name="carbonioNotificationRecipients">
              {(field) => (
                <ChipInput
                  isRequired
                  placeholder={t('label.send_notifications_to', 'Send notifications to...')}
                  background="gray5"
                  value={field.state.value}
                  onChange={(emails: Array<ChipItem>): void => {
                    field.handleChange(
                      emails.filter((email) => isValidEmail(email.label ?? '')),
                    );
                  }}
                />
              )}
            </form.Field>
          </Container>
        </ListRow>

        <ListRow>
          <Container
            crossAlignment="flex-start"
            mainAlignment="flex-start"
            height="auto"
            padding={{
              top: 'extralarge',
            }}
          >
            <form.Field name="zimbraDomainMandatoryMailSignatureEnabled">
              {(field) => (
                <Switch
                  label={t(
                    'label.enable_disclaimers_for_all_domains',
                    'Mandatory disclaimer for all domains',
                  )}
                  value={field.state.value}
                  onClick={(): void => field.handleChange(!field.state.value)}
                />
              )}
            </form.Field>
          </Container>
          <Container
            crossAlignment="flex-start"
            mainAlignment="flex-start"
            height="auto"
            padding={{
              top: 'extralarge',
            }}
          >
            <form.Field name="zimbraAmavisOutboundDisclaimersOnly">
              {(field) => (
                <Switch
                  label={t(
                    'label.only_allow_outbound_disclaimers',
                    'Only allow outbound disclaimers',
                  )}
                  value={field.state.value}
                  onClick={(): void => field.handleChange(!field.state.value)}
                />
              )}
            </form.Field>
          </Container>
        </ListRow>

        <ListRow>
          <Container
            crossAlignment="flex-start"
            mainAlignment="flex-start"
            height="auto"
            padding={{
              top: 'extralarge',
            }}
          >
            <form.Field name="carbonioSearchAllDomainsByFeature">
              {(field) => (
                <Switch
                  label={t(
                    'domain.globalSettings.allowSearchUserFromAllDomains',
                    `Allow searching users' information in all domains`,
                  )}
                  value={field.state.value}
                  onClick={(): void => field.handleChange(!field.state.value)}
                />
              )}
            </form.Field>
          </Container>
        </ListRow>
      </Container>
    </Container>
  );
};

export const GlobalDetailPanel = () => {
  const { data: configInformation = [], isPending, invalidate } = useAllConfig();

  if (isPending) {
    return (
      <Container background="white" mainAlignment="flex-start">
        <Container mainAlignment="center" height="calc(100vh - 12.5rem)">
          <ds-spinner></ds-spinner>
        </Container>
      </Container>
    );
  }

  return (
    <GlobalDetailPanelContent configInformation={configInformation} invalidate={invalidate} />
  );
};
```

- [ ] **Step 2: Update the import in `global-section-routes.ts`**

Change line 21 of `apps/admin-ui-domains/src/views/global-section-routes.ts` from:

```ts
import GlobalDetailPanel from './domain/global/global-detail-panel';
```

to:

```ts
import { GlobalDetailPanel } from './domain/global/global-detail-panel';
```

(Keep the import's position in the sorted order — it does not change since the path is identical.)

- [ ] **Step 3: Run the browser tests to verify they pass**

Run from repo root:
`pnpm vitest run apps/admin-ui-domains/src/views/domain/global/tests/global-detail-panel.browser.test.tsx --reporter=verbose`
Expected: all 5 tests PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/admin-ui-domains/src/views/domain/global/global-detail-panel.tsx apps/admin-ui-domains/src/views/global-section-routes.ts
git commit -m "refactor: convert GlobalDetailPanel to TanStack Form"
```

---

### Task 4: Regression tests, type-check and lint

**Files:** none (verification only)

- [ ] **Step 1: Run the domain app regression browser tests**

Run from repo root:
`pnpm vitest run apps/admin-ui-domains/src/views/tests/domain-content-panel.browser.test.tsx --reporter=verbose`
Expected: PASS (imports the changed `global-section-routes.ts`).

- [ ] **Step 2: Type-check and lint the domain app**

Run from repo root:
`pnpm --filter @zextras/admin-ui-domains type-lint`
Expected: no errors.

- [ ] **Step 3: Commit any fixes if needed**

If steps 1–2 required changes, commit them:

```bash
git add -A apps/admin-ui-domains
git commit -m "fix: address review findings from GlobalDetailPanel conversion"
```

---

## Self-Review Checklist (for the executor)

- Save blocked on invalid email (spec decision 1) — covered by Task 2 test 3.
- Single file, wrapper + content (spec decision 2) — Task 3.
- Named arrow export, no `FC`/default export (spec decision 3) — Task 3 + import update.
- AGENTS.md post-save pattern: `form.reset(value, { keepDefaultValues: true })` + `invalidate()` — Task 3 Step 1 `onSubmit`.
- No `useMemo`/`useCallback` (React Compiler) — Task 3 code has none.
- SPDX header on both new/modified source and test files — included in code blocks.
