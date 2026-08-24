/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  getAllConfigResponseMock,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { GlobalQuarantine } from '../global-quarantine';

const QUARANTINE_ACCOUNT_NAME = 'virus-quarantine@example.com';

function getQuarantinedMessage() {
  return {
    id: 'msg-1',
    su: 'Spam subject',
    d: 1750000000000,
    l: '2',
    e: [{ a: 'spammer@example.com', t: 'f', p: '' }],
    mp: [{ part: 'TEXT', ct: 'text/plain', body: true, content: 'spam body' }],
    _attrs: {
      'X-Spam-Score': '42',
      'X-Amavis-Alert': 'bad',
      'X-Envelope-From': '<spammer@example.com>',
      'X-Envelope-To': '<admin@example.com>',
    },
  };
}

async function setupQuarantineView(
  options: { withQuarantineAccount?: boolean; emptyAfterFirstRefetch?: boolean } = {},
): Promise<{ getSearchCalls: () => number }> {
  const withQuarantineAccount = options.withQuarantineAccount ?? true;
  const emptyAfterFirstRefetch = options.emptyAfterFirstRefetch ?? false;

  createBrowserSoapAPIInterceptor(
    'GetAllConfig',
    withQuarantineAccount
      ? getAllConfigResponseMock({ zimbraAmavisQuarantineAccount: QUARANTINE_ACCOUNT_NAME })
      : getAllConfigResponseMock(),
  );

  if (!withQuarantineAccount) {
    await setupBrowserTest(<GlobalQuarantine />, { grantRights: 'config' });
    return { getSearchCalls: () => 0 };
  }

  createBrowserSoapAPIInterceptor('GetAccount', {
    account: [
      {
        id: 'acc-1',
        name: QUARANTINE_ACCOUNT_NAME,
        a: [{ n: 'zimbraMailMessageLifetime', _content: '7d' }],
      },
    ],
  });

  let searchCalls = 0;
  await createBrowserAPIInterceptor('post', '/service/admin/soap/SearchRequest', () => {
    searchCalls += 1;
    const messages =
      emptyAfterFirstRefetch && searchCalls > 1 ? [] : [{ id: 'msg-1', d: 1750000000000 }];
    return HttpResponse.json({ Body: { SearchResponse: { m: messages } } });
  });

  let batchCalls = 0;
  await createBrowserAPIInterceptor('post', '/service/admin/soap/BatchRequest', () => {
    batchCalls += 1;
    const getMsgResponse = emptyAfterFirstRefetch && batchCalls > 1 ? [] : [{ m: [getQuarantinedMessage()] }];
    return HttpResponse.json({ Body: { BatchResponse: { GetMsgResponse: getMsgResponse } } });
  });

  await setupBrowserTest(<GlobalQuarantine />, { grantRights: 'config' });
  return { getSearchCalls: () => searchCalls };
}

describe('GlobalQuarantine', () => {
  afterEach(() => {
    resetMockWorker();
  });

  it('renders the create-account empty state when no quarantine account is configured', async () => {
    await setupQuarantineView({ withQuarantineAccount: false });

    await expect.element(page.getByText(/there is not quarantine account/i)).toBeVisible();
    await expect
      .element(page.getByRole('button', { name: /create a quarantine account/i }))
      .toBeVisible();
  });

  it('renders account name, retention settings and the quarantined message row', async () => {
    await setupQuarantineView();

    await expect.element(page.getByText(QUARANTINE_ACCOUNT_NAME)).toBeVisible();
    await expect.element(page.getByText('7', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Days', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Spam subject')).toBeVisible();
    await expect.element(page.getByText('spammer@example.com')).toBeVisible();
    await expect.element(page.getByText('42', { exact: true })).toBeVisible();
  });

  it('opens the message view and delivers the message, refreshing the list', async () => {
    const bounceMsgParams = createBrowserSoapAPIInterceptor('BounceMsg', {});
    await setupQuarantineView();

    await page.getByText('Spam subject').click();
    await expect
      .element(page.getByRole('button', { name: 'DELIVER', exact: true }))
      .toBeVisible();

    await page.getByRole('button', { name: 'DELIVER', exact: true }).click();
    await page.getByRole('button', { name: /yes, deliver/i }).click();

    await bounceMsgParams;
    await expect.element(page.getByText('Message delivered')).toBeVisible();
    await expect.element(page.getByText('Spam subject')).toBeVisible();
  });

  it('deletes a message from the message view and refreshes the list', async () => {
    const msgActionParams = createBrowserSoapAPIInterceptor('MsgAction', {});
    await setupQuarantineView({ emptyAfterFirstRefetch: true });

    await page.getByText('Spam subject').click();
    await page.getByRole('button', { name: 'DELETE', exact: true }).click();
    await page.getByRole('button', { name: /yes, delete/i }).click();

    await msgActionParams;
    await expect.element(page.getByText('Message deleted')).toBeVisible();
    await expect.element(page.getByText('This list is empty.')).toBeVisible();
  });

  it('labels the icon-only close button accessibly in the message view', async () => {
    await setupQuarantineView();

    await page.getByText('Spam subject').click();
    await expect
      .element(page.getByRole('button', { name: 'Close', exact: true }))
      .toBeVisible();
  });

  it('creates the quarantine account from the empty state and reports success', async () => {
    const newAccountName = 'virus-quarantine2@example.com';
    const createAccountParams = createBrowserSoapAPIInterceptor('CreateAccount', {
      account: [{ name: newAccountName }],
    });
    const modifyConfigParams = createBrowserSoapAPIInterceptor('ModifyConfig', {});
    await setupQuarantineView({ withQuarantineAccount: false });

    await page.getByRole('button', { name: /create a quarantine account/i }).click();

    await createAccountParams;
    expect(JSON.stringify(await modifyConfigParams)).toContain(newAccountName);
    await expect
      .element(page.getByText('The account has been created successfully'))
      .toBeVisible();
  });
});
