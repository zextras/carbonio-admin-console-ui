/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { GENERAL_SECTION } from '../../../constants';
import type { GetAccountQuotaRawResponse } from '../../../services/account-quota';
import { EditAccount } from '../edit-account';

const ACCOUNT_ID = 'mock-id';
const ACCOUNT_NAME = 'test-user@example.com';
const NOTIFICATION_URL = `/service/extension/zextras_admin/powerstore/quota/notification/configs/accounts/${ACCOUNT_ID}`;

const COS_SOURCE = { type: 'COS', id: 'cos-1', name: 'students' };
const DEFAULT_SOURCE = { type: 'DEFAULT' };

const mockGetAccountResponse = {
  account: [
    {
      id: ACCOUNT_ID,
      name: ACCOUNT_NAME,
      a: [
        { n: 'sn', _content: 'User' },
        { n: 'givenName', _content: 'Test' },
        { n: 'displayName', _content: 'Test User' },
        { n: 'zimbraCOSId', _content: 'cos-1' },
        { n: 'zimbraAccountStatus', _content: 'active' },
        { n: 'zimbraPrefLocale', _content: 'en' },
        { n: 'zimbraMailHost', _content: 'mail.example.com' },
      ],
    },
  ],
};

const LIMITED_QUOTA: GetAccountQuotaRawResponse = {
  total: {
    used: 5368709120,
    computedLimit: { type: 'limited', value: 10737418240, source: 'account' },
    status: 'UNDERQUOTA',
  },
  modules: { mailbox: { used: 4000000000 }, files: { used: 1000000000 }, wsc: { used: 368709120 } },
};

const UNLIMITED_QUOTA: GetAccountQuotaRawResponse = {
  ...LIMITED_QUOTA,
  total: { ...LIMITED_QUOTA.total, computedLimit: { type: 'unlimited', source: 'account' } },
};

const COS_CONTENT = {
  subject: 'Students, your storage is almost full',
  body: 'Hi {{displayName}}, you are using {{usedQuota}} of {{quotaLimit}}.',
  source: COS_SOURCE,
};

/** The account has no override: content from a customized COS, interval from the default. */
const INHERITING_FROM_CUSTOM_COS = {
  content: { ...COS_CONTENT, inherited: COS_CONTENT },
  interval: {
    days: 7,
    source: DEFAULT_SOURCE,
    inherited: { days: 7, source: DEFAULT_SOURCE },
  },
};

const DEFAULT_CONTENT = {
  subject: 'Your storage is almost full',
  body: "You've used 80% of your storage quota",
  source: DEFAULT_SOURCE,
};

/** The COS has no override either: everything comes from the Carbonio default. */
const INHERITING_FROM_DEFAULT = {
  content: { ...DEFAULT_CONTENT, inherited: DEFAULT_CONTENT },
  interval: INHERITING_FROM_CUSTOM_COS.interval,
};

const OWN_OVERRIDES = {
  content: {
    subject: 'Maja, your storage is almost full',
    body: 'Write to the IT desk before archiving anything.',
    source: { type: 'ACCOUNT' },
    inherited: COS_CONTENT,
  },
  interval: {
    days: 30,
    source: { type: 'ACCOUNT' },
    inherited: { days: 14, source: COS_SOURCE },
  },
};

const NO_CONTENT_RESPONSE = () => new HttpResponse(null, { status: 204 });

type SetupOptions = {
  config?: unknown;
  getStatus?: number;
  quota?: GetAccountQuotaRawResponse;
};

async function setupNotificationTest({
  config = INHERITING_FROM_CUSTOM_COS,
  getStatus = 200,
  quota = LIMITED_QUOTA,
}: SetupOptions = {}): Promise<void> {
  createBrowserSoapAPIInterceptor('GetAccount', mockGetAccountResponse);
  createBrowserSoapAPIInterceptor('SearchDirectory', { cos: [{ name: 'students', id: 'cos-1' }] });
  await createBrowserAPIInterceptor(
    'post',
    '/service/extension/zextras_admin/core/attributes/get',
    () =>
      HttpResponse.json({
        attributes: {
          abqMode: [{ value: 'enabled' }],
          backupEnabled: [{ value: 'TRUE' }],
          backupSelfUndeleteAllowed: [{ value: '' }],
        },
      }),
  );
  await createBrowserAPIInterceptor(
    'get',
    `/services/storages/admin/quota/accounts/${ACCOUNT_ID}`,
    () => HttpResponse.json(quota, { status: 200 }),
  );
  await createBrowserAPIInterceptor(
    'get',
    '/services/storages/admin/quota/config/domains/domain-id',
    () => HttpResponse.json(null, { status: 404 }),
  );
  await createBrowserAPIInterceptor('get', NOTIFICATION_URL, () =>
    getStatus === 200
      ? HttpResponse.json(config as Record<string, unknown>)
      : new HttpResponse(null, { status: getStatus }),
  );

  const queryClient = getQueryClient();
  queryClient.setQueryData(['advanced-supported'], { supported: true });

  await setupBrowserTest(
    <EditAccount
      account={{ id: ACCOUNT_ID, name: ACCOUNT_NAME }}
      onClose={(): void => {}}
      onSaved={(): void => {}}
      onDeleted={(): void => {}}
      defaultTab={GENERAL_SECTION}
    />,
    { queryClient, withDomainIdRoute: true, initialRouterEntry: '/domain-id' },
  );
  await expect.element(page.getByText('Storage usage')).toBeVisible();
}

async function waitForSection(): Promise<void> {
  await expect.element(page.getByText('Quota Notification Email')).toBeVisible();
}

describe('AccountQuotaNotification (browser)', () => {
  describe('Rendering', () => {
    it('shows the message inherited from a customized COS, by COS name', async () => {
      await setupNotificationTest();
      await waitForSection();

      await expect
        .element(
          page.getByRole('radio', { name: 'Use the message inherited from the COS (students)' }),
        )
        .toBeChecked();
      await expect
        .element(page.getByRole('group', { name: 'Message inherited from the COS (students)' }))
        .toBeVisible();
      await expect.element(page.getByText(COS_CONTENT.subject)).toBeVisible();
      await expect
        .element(page.getByRole('button', { name: 'Frequency' }))
        .toHaveTextContent('Same as the Carbonio default (every 7 days)');
    });

    it('says the Carbonio default is inherited when the COS has no override', async () => {
      await setupNotificationTest({ config: INHERITING_FROM_DEFAULT });
      await waitForSection();

      await expect
        .element(
          page.getByRole('radio', {
            name: 'Use the Carbonio default text, inherited from the COS',
          }),
        )
        .toBeChecked();
      await expect
        .element(
          page.getByRole('group', { name: 'Carbonio default text, inherited from the COS' }),
        )
        .toBeVisible();
      await expect.element(page.getByText(DEFAULT_CONTENT.subject)).toBeVisible();
    });

    it('shows the own custom message and frequency of the account', async () => {
      await setupNotificationTest({ config: OWN_OVERRIDES });
      await waitForSection();

      await expect
        .element(page.getByRole('radio', { name: 'Use a custom message for this account' }))
        .toBeChecked();
      await expect
        .element(page.getByRole('textbox', { name: 'Notification subject' }))
        .toHaveValue('Maja, your storage is almost full');
      await expect
        .element(page.getByRole('button', { name: 'Frequency' }))
        .toHaveTextContent('Every 30 days');
    });

    it('keeps the section enabled when the unlimited quota is on', async () => {
      await setupNotificationTest({ quota: UNLIMITED_QUOTA });
      await waitForSection();

      await expect.element(page.getByRole('switch', { name: 'Unlimited quota' })).toBeChecked();
      await expect
        .element(page.getByRole('radio', { name: 'Use a custom message for this account' }))
        .toBeEnabled();
    });

    it('does not show the section when the configuration is not available', async () => {
      await setupNotificationTest({ getStatus: 403 });

      await expect.element(page.getByText('Storage usage')).toBeVisible();
      await expect.element(page.getByText('Quota Notification Email')).not.toBeInTheDocument();
    });
  });

  describe('Editing', () => {
    it('shows Save and Cancel as soon as the radio changes and restores on Cancel', async () => {
      await setupNotificationTest();
      await waitForSection();
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();

      await userEvent.click(page.getByRole('radio', { name: 'Use a custom message for this account' }));
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();

      await page.getByRole('button', { name: 'Cancel' }).click();

      await expect
        .element(
          page.getByRole('radio', { name: 'Use the message inherited from the COS (students)' }),
        )
        .toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });

    it('stops typing at the limit and shows the counter and the limit message', async () => {
      await setupNotificationTest({ config: OWN_OVERRIDES });
      await waitForSection();
      const subject = page.getByRole('textbox', { name: 'Notification subject' });

      await userEvent.fill(subject, 'a'.repeat(135));
      await expect.element(page.getByText('135 / 150')).toBeVisible();

      await userEvent.fill(subject, 'a'.repeat(170));
      await expect.element(page.getByText('You reached the 150-character limit.')).toBeVisible();
      await expect.element(subject).toHaveValue('a'.repeat(150));
    });

    it('inserts a placeholder at the caret of the focused field', async () => {
      await setupNotificationTest({ config: OWN_OVERRIDES });
      await waitForSection();
      const message = page.getByRole('textbox', { name: 'Notification message' });

      await userEvent.fill(message, 'Hello ');
      await page.getByRole('button', { name: 'Display name' }).click();

      await expect.element(message).toHaveValue('Hello {{displayName}}');
    });
  });

  describe('Validation on save', () => {
    it('blocks the save, flags both fields and focuses the subject', async () => {
      const modifyAccount = await createBrowserAPIInterceptor(
        'post',
        '/service/admin/soap/ModifyAccountRequest',
        () => HttpResponse.json({ Body: { ModifyAccountResponse: {} } }),
      );
      const putContent = await createBrowserAPIInterceptor(
        'put',
        `${NOTIFICATION_URL}/content`,
        NO_CONTENT_RESPONSE,
      );
      await setupNotificationTest();
      await waitForSection();

      // another change in the same form: it must not be saved either
      const displayName = page.getByRole('textbox', { name: 'Display Name' });
      await userEvent.fill(displayName, 'Updated Name');
      await userEvent.click(page.getByRole('radio', { name: 'Use a custom message for this account' }));
      await page.getByRole('button', { name: 'Save' }).click();

      await expect.element(page.getByText('Enter a subject.')).toBeVisible();
      await expect.element(page.getByText('Enter a message.')).toBeVisible();
      await expect
        .element(page.getByRole('textbox', { name: 'Notification subject' }))
        .toHaveFocus();
      expect(putContent.getCalledTimes()).toBe(0);
      expect(modifyAccount.getCalledTimes()).toBe(0);
    });

    it('rejects an unknown placeholder', async () => {
      await setupNotificationTest();
      await waitForSection();

      await userEvent.click(page.getByRole('radio', { name: 'Use a custom message for this account' }));
      await userEvent.fill(page.getByRole('textbox', { name: 'Notification subject' }), 'Subject');
      await userEvent.fill(
        page.getByRole('textbox', { name: 'Notification message' }),
        'Hello {{firstName}}',
      );
      await page.getByRole('button', { name: 'Save' }).click();

      await expect
        .element(page.getByText('Unknown value {{firstName}}. Use the Insert value buttons.'))
        .toBeVisible();
    });
  });

  describe('Save', () => {
    it('PUTs the custom content, leaves the frequency alone and ends on the success snackbar', async () => {
      const putContent = await createBrowserAPIInterceptor(
        'put',
        `${NOTIFICATION_URL}/content`,
        NO_CONTENT_RESPONSE,
      );
      const putInterval = await createBrowserAPIInterceptor(
        'put',
        `${NOTIFICATION_URL}/interval`,
        NO_CONTENT_RESPONSE,
      );
      await setupNotificationTest();
      await waitForSection();
      await createBrowserAPIInterceptor('get', NOTIFICATION_URL, () =>
        HttpResponse.json({
          ...OWN_OVERRIDES,
          interval: INHERITING_FROM_CUSTOM_COS.interval,
        }),
      );

      await userEvent.click(page.getByRole('radio', { name: 'Use a custom message for this account' }));
      await userEvent.fill(
        page.getByRole('textbox', { name: 'Notification subject' }),
        'Maja, your storage is almost full',
      );
      await userEvent.fill(
        page.getByRole('textbox', { name: 'Notification message' }),
        'Write to the IT desk before archiving anything.',
      );
      await page.getByRole('button', { name: 'Save' }).click();

      await expect.poll(() => putContent.getLastRequest()).toBeTruthy();
      expect(await putContent.getLastRequest().json()).toEqual({
        subject: 'Maja, your storage is almost full',
        body: 'Write to the IT desk before archiving anything.',
      });
      expect(putInterval.getCalledTimes()).toBe(0);
      await expect.element(page.getByText('Changes have been saved successfully')).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });

    it('PUTs only the frequency when only the frequency changed', async () => {
      const putContent = await createBrowserAPIInterceptor(
        'put',
        `${NOTIFICATION_URL}/content`,
        NO_CONTENT_RESPONSE,
      );
      const putInterval = await createBrowserAPIInterceptor(
        'put',
        `${NOTIFICATION_URL}/interval`,
        NO_CONTENT_RESPONSE,
      );
      await setupNotificationTest();
      await waitForSection();
      await createBrowserAPIInterceptor('get', NOTIFICATION_URL, () =>
        HttpResponse.json({
          ...INHERITING_FROM_CUSTOM_COS,
          interval: { ...OWN_OVERRIDES.interval, days: 14 },
        }),
      );

      await page.getByRole('button', { name: 'Frequency' }).click();
      await page.getByRole('option', { name: 'Every 14 days' }).click();
      await page.getByRole('button', { name: 'Save' }).click();

      await expect.poll(() => putInterval.getLastRequest()).toBeTruthy();
      expect(await putInterval.getLastRequest().json()).toEqual({ days: 14 });
      expect(putContent.getCalledTimes()).toBe(0);
      await expect.element(page.getByText('Changes have been saved successfully')).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });

    it('DELETEs both overrides when the account goes back to inheriting', async () => {
      const deleteContent = await createBrowserAPIInterceptor(
        'delete',
        `${NOTIFICATION_URL}/content`,
        NO_CONTENT_RESPONSE,
      );
      const deleteInterval = await createBrowserAPIInterceptor(
        'delete',
        `${NOTIFICATION_URL}/interval`,
        NO_CONTENT_RESPONSE,
      );
      await setupNotificationTest({ config: OWN_OVERRIDES });
      await waitForSection();
      await createBrowserAPIInterceptor('get', NOTIFICATION_URL, () =>
        HttpResponse.json(INHERITING_FROM_CUSTOM_COS),
      );

      await userEvent.click(
        page.getByRole('radio', { name: 'Use the message inherited from the COS (students)' }),
      );
      await page.getByRole('button', { name: 'Frequency' }).click();
      await page.getByRole('option', { name: /^Same as the COS/ }).click();
      await page.getByRole('button', { name: 'Save' }).click();

      await expect.poll(() => deleteContent.getCalledTimes()).toBe(1);
      await expect.poll(() => deleteInterval.getCalledTimes()).toBe(1);
      await expect.element(page.getByText('Changes have been saved successfully')).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });

    it('reports a failed frequency, keeps it unsaved and never says everything was saved', async () => {
      await createBrowserAPIInterceptor(
        'put',
        `${NOTIFICATION_URL}/content`,
        NO_CONTENT_RESPONSE,
      );
      await createBrowserAPIInterceptor(
        'put',
        `${NOTIFICATION_URL}/interval`,
        () => new HttpResponse(null, { status: 500 }),
      );
      await setupNotificationTest();
      await waitForSection();
      await createBrowserAPIInterceptor('get', NOTIFICATION_URL, () =>
        HttpResponse.json({ ...OWN_OVERRIDES, interval: INHERITING_FROM_CUSTOM_COS.interval }),
      );

      await userEvent.click(page.getByRole('radio', { name: 'Use a custom message for this account' }));
      await userEvent.fill(page.getByRole('textbox', { name: 'Notification subject' }), 'Subject');
      await userEvent.fill(page.getByRole('textbox', { name: 'Notification message' }), 'Message');
      await page.getByRole('button', { name: 'Frequency' }).click();
      await page.getByRole('option', { name: 'Every 30 days' }).click();
      await page.getByRole('button', { name: 'Save' }).click();

      await expect
        .element(
          page.getByText('The quota notification frequency could not be saved. Please try again.'),
        )
        .toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
      await expect
        .element(page.getByRole('button', { name: 'Frequency' }))
        .toHaveTextContent('Every 30 days');
      await expect
        .element(page.getByText('Changes have been saved successfully'))
        .not.toBeInTheDocument();
    });

    it('shows the field error returned by the backend and focuses the field', async () => {
      await createBrowserAPIInterceptor(
        'put',
        `${NOTIFICATION_URL}/content`,
        () =>
          HttpResponse.json(
            { errors: [{ field: 'content.subject', code: 'FORBIDDEN_CHARACTER', detail: 'U+2028' }] },
            { status: 400 },
          ),
      );
      await setupNotificationTest();
      await waitForSection();

      await userEvent.click(page.getByRole('radio', { name: 'Use a custom message for this account' }));
      await userEvent.fill(page.getByRole('textbox', { name: 'Notification subject' }), 'Subject');
      await userEvent.fill(page.getByRole('textbox', { name: 'Notification message' }), 'Message');
      await page.getByRole('button', { name: 'Save' }).click();

      await expect
        .element(page.getByText('The text contains a character that is not allowed (U+2028).'))
        .toBeVisible();
      await expect
        .element(page.getByRole('textbox', { name: 'Notification subject' }))
        .toHaveFocus();
    });
  });
});
