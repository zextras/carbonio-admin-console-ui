/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  grantUserCosRights,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { CosAdvanced } from '../cos-advanced';

const COS_ID = 'e00428a1-0c00-11d9-836a-000d93afea2a';
const NOTIFICATION_URL = `/service/extension/zextras_admin/powerstore/quota/notification/configs/cos/${COS_ID}`;
const COS_SOURCE = { type: 'COS', id: COS_ID, name: 'default' };

const DEFAULT_SUBJECT = 'Your storage is almost full';
const DEFAULT_BODY = "You've used 80% of your storage quota";

const mockCosData = {
  cos: [
    {
      id: COS_ID,
      name: 'default',
      a: [
        { n: 'zimbraId', _content: COS_ID },
        { n: 'zimbraMailForwardingAddressMaxLength', _content: '256' },
        { n: 'zimbraMailForwardingAddressMaxNumAddrs', _content: '10' },
        { n: 'zimbraContactMaxNumEntries', _content: '100' },
      ],
    },
  ],
};

const DEFAULT_INHERITED = {
  subject: DEFAULT_SUBJECT,
  body: DEFAULT_BODY,
  source: { type: 'DEFAULT' },
};

const NEVER_CUSTOMIZED = {
  content: { ...DEFAULT_INHERITED, inherited: DEFAULT_INHERITED },
  interval: {
    days: 7,
    source: { type: 'DEFAULT' },
    inherited: { days: 7, source: { type: 'DEFAULT' } },
  },
};

const CUSTOMIZED = {
  content: {
    subject: 'Storage almost full',
    body: 'Hi {{displayName}}, you use {{usedQuota}} of {{quotaLimit}}.',
    source: COS_SOURCE,
    inherited: DEFAULT_INHERITED,
  },
  interval: {
    days: 14,
    source: COS_SOURCE,
    inherited: { days: 7, source: { type: 'DEFAULT' } },
  },
};

type RequestLike = { json: () => Promise<unknown> };

type SetupOptions = {
  config?: unknown;
  getStatus?: number;
  withCosRights?: boolean;
};

async function setupNotificationTest({
  config = NEVER_CUSTOMIZED,
  getStatus = 200,
  withCosRights = true,
}: SetupOptions = {}): Promise<void> {
  const queryClient = getQueryClient();
  if (withCosRights) {
    await grantUserCosRights(queryClient);
  }
  const quotaSeed = {
    type: 'success',
    totalComputedLimit: { type: 'unlimited' },
    totalQuotaSource: 'global',
  };
  queryClient.setQueryData(['cos', 'detail', COS_ID], mockCosData);
  queryClient.setQueryData(['cos', 'cos-quota', COS_ID], quotaSeed);
  queryClient.setQueryData(['advanced-supported'], { supported: true });
  createBrowserSoapAPIInterceptor('GetCos', mockCosData);
  await createBrowserAPIInterceptor('get', '/services/catalog/services', () =>
    HttpResponse.json({ items: [] }),
  );
  await createBrowserAPIInterceptor(
    'post',
    '/service/extension/zextras_admin/core/attributes/get',
    () => HttpResponse.json({ attributes: {} }),
  );
  await createBrowserAPIInterceptor('get', NOTIFICATION_URL, () =>
    getStatus === 200
      ? HttpResponse.json(config as Record<string, unknown>)
      : new HttpResponse(null, { status: getStatus }),
  );

  await setupBrowserTest(
    <Routes>
      <Route path="/:cosId/:operation" element={<CosAdvanced />} />
    </Routes>,
    { initialRouterEntry: `/${COS_ID}/advanced`, queryClient },
  );
  await expect.element(page.getByText('Advanced', { exact: true })).toBeVisible();
}

async function waitForSection(): Promise<void> {
  await expect.element(page.getByText('Quota Notification Email')).toBeVisible();
}

/** The other COS save calls, so that a successful save can run to its end. */
async function mockOtherSaveCalls() {
  const modifyCos = await createBrowserAPIInterceptor(
    'post',
    '/service/admin/soap/ModifyCosRequest',
    () => HttpResponse.json({ Body: { ModifyCosResponse: {} } }),
  );
  createBrowserSoapAPIInterceptor('FlushCache', {});
  await createBrowserAPIInterceptor(
    'post',
    '/service/extension/zextras_admin/core/attribute/set',
    () => HttpResponse.json({}),
  );
  return modifyCos;
}

async function bodyOf(interceptor: { getLastRequest: () => RequestLike }): Promise<unknown> {
  return interceptor.getLastRequest().json();
}

describe('CosQuotaNotification', () => {
  describe('Rendering', () => {
    it('shows the Carbonio default text read-only with the default frequency', async () => {
      await setupNotificationTest();
      await waitForSection();

      await expect
        .element(page.getByRole('radio', { name: 'Use the Carbonio default text' }))
        .toBeChecked();
      await expect.element(page.getByText(DEFAULT_SUBJECT)).toBeVisible();
      await expect.element(page.getByText(DEFAULT_BODY)).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Frequency' })).toHaveTextContent(
        'Every 7 days',
      );
      await expect
        .element(page.getByRole('textbox', { name: 'Notification subject' }))
        .not.toBeInTheDocument();
    });

    it('shows the custom message of a customized COS', async () => {
      await setupNotificationTest({ config: CUSTOMIZED });
      await waitForSection();

      await expect
        .element(page.getByRole('radio', { name: 'Use a custom message for this COS' }))
        .toBeChecked();
      await expect
        .element(page.getByRole('textbox', { name: 'Notification subject' }))
        .toHaveValue('Storage almost full');
      await expect.element(page.getByRole('button', { name: 'Frequency' })).toHaveTextContent(
        'Every 14 days',
      );
    });

    it('keeps the section enabled when the unlimited quota is on', async () => {
      await setupNotificationTest();
      await waitForSection();

      await expect.element(page.getByRole('switch', { name: 'Unlimited quota' })).toBeChecked();
      await expect
        .element(page.getByRole('radio', { name: 'Use a custom message for this COS' }))
        .toBeEnabled();
    });

    it('does not show the section when the configuration is not available', async () => {
      await setupNotificationTest({ getStatus: 403 });

      await expect.element(page.getByText('Forwarding', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Quota Notification Email')).not.toBeInTheDocument();
    });

    it('disables the section for a read-only COS', async () => {
      await setupNotificationTest({ withCosRights: false });
      await waitForSection();

      await expect
        .element(page.getByRole('radio', { name: 'Use a custom message for this COS' }))
        .toBeDisabled();
      await expect.element(page.getByRole('button', { name: 'Frequency' })).toBeDisabled();
    });
  });

  describe('Custom message editor', () => {
    it('shows the Save and Cancel buttons as soon as the radio changes', async () => {
      await setupNotificationTest();
      await waitForSection();
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();

      await userEvent.click(page.getByRole('radio', { name: 'Use a custom message for this COS' }));

      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
      await expect.element(page.getByRole('textbox', { name: 'Notification subject' })).toBeVisible();
    });

    it('restores the saved state on Cancel', async () => {
      await setupNotificationTest();
      await waitForSection();

      await userEvent.click(page.getByRole('radio', { name: 'Use a custom message for this COS' }));
      await page.getByRole('button', { name: 'Cancel' }).click();

      await expect
        .element(page.getByRole('radio', { name: 'Use the Carbonio default text' }))
        .toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });

    it('shows the counter from 90% of the limit and stops typing at the limit', async () => {
      await setupNotificationTest({ config: CUSTOMIZED });
      await waitForSection();
      const subject = page.getByRole('textbox', { name: 'Notification subject' });

      await userEvent.fill(subject, 'a'.repeat(134));
      await expect.element(page.getByText('134 / 150')).not.toBeInTheDocument();

      await userEvent.fill(subject, 'a'.repeat(135));
      await expect.element(page.getByText('135 / 150')).toBeVisible();

      await userEvent.fill(subject, 'a'.repeat(160));
      await expect.element(page.getByText('150 / 150')).toBeVisible();
      await expect.element(page.getByText('You reached the 150-character limit.')).toBeVisible();
      await expect.element(subject).toHaveValue('a'.repeat(150));
    });

    it('counts an emoji as one character', async () => {
      await setupNotificationTest({ config: CUSTOMIZED });
      await waitForSection();
      const subject = page.getByRole('textbox', { name: 'Notification subject' });

      await userEvent.fill(subject, '😀'.repeat(135));

      await expect.element(page.getByText('135 / 150')).toBeVisible();
    });

    it('inserts a placeholder at the caret of the focused field', async () => {
      await setupNotificationTest({ config: CUSTOMIZED });
      await waitForSection();
      const subject = page.getByRole('textbox', { name: 'Notification subject' });

      await userEvent.fill(subject, 'Hi ');
      await page.getByRole('button', { name: 'Total storage' }).click();

      await expect.element(subject).toHaveValue('Hi {{quotaLimit}}');
    });

    it('keeps the insert buttons disabled while no field has the focus', async () => {
      await setupNotificationTest({ config: CUSTOMIZED });
      await waitForSection();

      await expect.element(page.getByRole('button', { name: 'Display name' })).toBeDisabled();

      await userEvent.click(page.getByRole('textbox', { name: 'Notification subject' }));

      await expect.element(page.getByRole('button', { name: 'Display name' })).toBeEnabled();
    });

    it('does not insert a placeholder that does not fit in the remaining characters', async () => {
      await setupNotificationTest({ config: CUSTOMIZED });
      await waitForSection();
      const subject = page.getByRole('textbox', { name: 'Notification subject' });

      await userEvent.fill(subject, 'a'.repeat(145));
      await page.getByRole('button', { name: 'Email address' }).click();

      await expect
        .element(page.getByText('There is no room for this value: the limit is 150 characters.'))
        .toBeVisible();
      await expect.element(subject).toHaveValue('a'.repeat(145));
    });
  });

  describe('Validation on save', () => {
    it('blocks the save, flags both fields and focuses the subject', async () => {
      const modifyCos = await mockOtherSaveCalls();
      const putContent = await createBrowserAPIInterceptor(
        'put',
        `${NOTIFICATION_URL}/content`,
        () => new HttpResponse(null, { status: 204 }),
      );
      await setupNotificationTest();
      await waitForSection();

      await userEvent.click(page.getByRole('radio', { name: 'Use a custom message for this COS' }));
      await page.getByRole('button', { name: 'Save' }).click();

      await expect.element(page.getByText('Enter a subject.')).toBeVisible();
      await expect.element(page.getByText('Enter a message.')).toBeVisible();
      await expect.element(page.getByRole('textbox', { name: 'Notification subject' })).toHaveFocus();
      expect(putContent.getCalledTimes()).toBe(0);
      expect(modifyCos.getCalledTimes()).toBe(0);
    });

    it('focuses the message when only the message is invalid', async () => {
      await mockOtherSaveCalls();
      await setupNotificationTest();
      await waitForSection();

      await userEvent.click(page.getByRole('radio', { name: 'Use a custom message for this COS' }));
      await userEvent.fill(page.getByRole('textbox', { name: 'Notification subject' }), 'Subject');
      await page.getByRole('button', { name: 'Save' }).click();

      await expect.element(page.getByText('Enter a message.')).toBeVisible();
      await expect.element(page.getByText('Enter a subject.')).not.toBeInTheDocument();
      await expect.element(page.getByRole('textbox', { name: 'Notification message' })).toHaveFocus();
    });

    it('rejects an unknown placeholder', async () => {
      await mockOtherSaveCalls();
      await setupNotificationTest();
      await waitForSection();

      await userEvent.click(page.getByRole('radio', { name: 'Use a custom message for this COS' }));
      await userEvent.fill(page.getByRole('textbox', { name: 'Notification subject' }), 'Subject');
      await userEvent.fill(
        page.getByRole('textbox', { name: 'Notification message' }),
        'Hello {{dispalyName}}',
      );
      await page.getByRole('button', { name: 'Save' }).click();

      await expect
        .element(page.getByText('Unknown value {{dispalyName}}. Use the Insert value buttons.'))
        .toBeVisible();
    });

    it('clears the error of a field as soon as it is edited', async () => {
      await mockOtherSaveCalls();
      await setupNotificationTest();
      await waitForSection();

      await userEvent.click(page.getByRole('radio', { name: 'Use a custom message for this COS' }));
      await page.getByRole('button', { name: 'Save' }).click();
      await expect.element(page.getByText('Enter a subject.')).toBeVisible();

      await userEvent.fill(page.getByRole('textbox', { name: 'Notification subject' }), 'Subject');

      await expect.element(page.getByText('Enter a subject.')).not.toBeInTheDocument();
    });
  });

  describe('Save', () => {
    it('PUTs the custom content and ends on the success snackbar', async () => {
      await mockOtherSaveCalls();
      const putContent = await createBrowserAPIInterceptor(
        'put',
        `${NOTIFICATION_URL}/content`,
        () => new HttpResponse(null, { status: 204 }),
      );
      const putInterval = await createBrowserAPIInterceptor(
        'put',
        `${NOTIFICATION_URL}/interval`,
        () => new HttpResponse(null, { status: 204 }),
      );
      await setupNotificationTest();
      await waitForSection();
      // after the save the form reads the new state
      await createBrowserAPIInterceptor('get', NOTIFICATION_URL, () =>
        HttpResponse.json({
          ...CUSTOMIZED,
          interval: NEVER_CUSTOMIZED.interval,
        }),
      );

      await userEvent.click(page.getByRole('radio', { name: 'Use a custom message for this COS' }));
      await userEvent.fill(
        page.getByRole('textbox', { name: 'Notification subject' }),
        'Storage almost full',
      );
      await userEvent.fill(
        page.getByRole('textbox', { name: 'Notification message' }),
        'Hi {{displayName}}, you use {{usedQuota}} of {{quotaLimit}}.',
      );
      await page.getByRole('button', { name: 'Save' }).click();

      await expect.poll(() => putContent.getLastRequest()).toBeTruthy();
      expect(await bodyOf(putContent)).toEqual({
        subject: 'Storage almost full',
        body: 'Hi {{displayName}}, you use {{usedQuota}} of {{quotaLimit}}.',
      });
      expect(putInterval.getCalledTimes()).toBe(0);
      await expect
        .element(page.getByText('Changes have been saved successfully'))
        .toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });

    it('PUTs only the frequency when only the frequency changed', async () => {
      await mockOtherSaveCalls();
      const putContent = await createBrowserAPIInterceptor(
        'put',
        `${NOTIFICATION_URL}/content`,
        () => new HttpResponse(null, { status: 204 }),
      );
      const putInterval = await createBrowserAPIInterceptor(
        'put',
        `${NOTIFICATION_URL}/interval`,
        () => new HttpResponse(null, { status: 204 }),
      );
      await setupNotificationTest();
      await waitForSection();
      await createBrowserAPIInterceptor('get', NOTIFICATION_URL, () =>
        HttpResponse.json({
          ...NEVER_CUSTOMIZED,
          interval: { ...NEVER_CUSTOMIZED.interval, days: 30, source: COS_SOURCE },
        }),
      );

      await page.getByRole('button', { name: 'Frequency' }).click();
      await page.getByRole('option', { name: 'Every 30 days' }).click();
      await page.getByRole('button', { name: 'Save' }).click();

      await expect.poll(() => putInterval.getLastRequest()).toBeTruthy();
      expect(await bodyOf(putInterval)).toEqual({ days: 30 });
      expect(putContent.getCalledTimes()).toBe(0);
      await expect
        .element(page.getByText('Changes have been saved successfully'))
        .toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });

    it('DELETEs the content override when going back to the default text', async () => {
      await mockOtherSaveCalls();
      const deleteContent = await createBrowserAPIInterceptor(
        'delete',
        `${NOTIFICATION_URL}/content`,
        () => new HttpResponse(null, { status: 204 }),
      );
      await setupNotificationTest({ config: CUSTOMIZED });
      await waitForSection();
      await createBrowserAPIInterceptor('get', NOTIFICATION_URL, () =>
        HttpResponse.json({ ...NEVER_CUSTOMIZED, interval: CUSTOMIZED.interval }),
      );

      await userEvent.click(page.getByRole('radio', { name: 'Use the Carbonio default text' }));
      await page.getByRole('button', { name: 'Save' }).click();

      await expect.poll(() => deleteContent.getCalledTimes()).toBe(1);
      await expect
        .element(page.getByText('Changes have been saved successfully'))
        .toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });

    it('reports a failed frequency, keeps it unsaved and skips the other COS changes', async () => {
      const modifyCos = await mockOtherSaveCalls();
      const putContent = await createBrowserAPIInterceptor(
        'put',
        `${NOTIFICATION_URL}/content`,
        () => new HttpResponse(null, { status: 204 }),
      );
      await createBrowserAPIInterceptor(
        'put',
        `${NOTIFICATION_URL}/interval`,
        () => new HttpResponse(null, { status: 500 }),
      );
      await setupNotificationTest();
      await waitForSection();
      await createBrowserAPIInterceptor('get', NOTIFICATION_URL, () =>
        HttpResponse.json({ ...CUSTOMIZED, interval: NEVER_CUSTOMIZED.interval }),
      );

      await userEvent.click(page.getByRole('radio', { name: 'Use a custom message for this COS' }));
      await userEvent.fill(
        page.getByRole('textbox', { name: 'Notification subject' }),
        'Storage almost full',
      );
      await userEvent.fill(
        page.getByRole('textbox', { name: 'Notification message' }),
        'Hi {{displayName}}, you use {{usedQuota}} of {{quotaLimit}}.',
      );
      await page.getByRole('button', { name: 'Frequency' }).click();
      await page.getByRole('option', { name: 'Every 30 days' }).click();
      await page.getByRole('button', { name: 'Save' }).click();

      await expect
        .element(
          page.getByText('The quota notification frequency could not be saved. Please try again.'),
        )
        .toBeVisible();
      await expect.poll(() => putContent.getCalledTimes()).toBe(1);
      // the content went through, the frequency did not: the form is still dirty
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Frequency' })).toHaveTextContent(
        'Every 30 days',
      );
      await expect
        .element(page.getByText('Changes have been saved successfully'))
        .not.toBeInTheDocument();
      expect(modifyCos.getCalledTimes()).toBe(0);
    });

    it('shows the field error returned by the backend and focuses the field', async () => {
      await mockOtherSaveCalls();
      await createBrowserAPIInterceptor(
        'put',
        `${NOTIFICATION_URL}/content`,
        () =>
          HttpResponse.json(
            { errors: [{ field: 'content.body', code: 'FORBIDDEN_CHARACTER', detail: 'U+2028' }] },
            { status: 400 },
          ),
      );
      await setupNotificationTest();
      await waitForSection();

      await userEvent.click(page.getByRole('radio', { name: 'Use a custom message for this COS' }));
      await userEvent.fill(page.getByRole('textbox', { name: 'Notification subject' }), 'Subject');
      await userEvent.fill(page.getByRole('textbox', { name: 'Notification message' }), 'Message');
      await page.getByRole('button', { name: 'Save' }).click();

      await expect
        .element(
          page.getByText('The text contains a character that is not allowed (U+2028).'),
        )
        .toBeVisible();
      await expect.element(page.getByRole('textbox', { name: 'Notification message' })).toHaveFocus();
    });
  });
});
