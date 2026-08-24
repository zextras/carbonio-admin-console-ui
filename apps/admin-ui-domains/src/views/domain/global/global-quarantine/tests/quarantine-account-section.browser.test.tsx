/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  getAllConfigResponseMock,
  getQueryClient,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import type { QuarantineAccountData } from '../../../../../services/use-quarantine-account';
import { QuarantineAccountSection } from '../quarantine-account-section';

const ACCOUNT: QuarantineAccountData = {
  name: 'virus-quarantine@example.com',
  id: 'acc-1',
  retentionValue: '7',
  retentionInterval: 'd',
};

const NEW_ACCOUNT_NAME = 'virus-quarantine.new@example.com';

async function setupSection(account: QuarantineAccountData | undefined): Promise<void> {
  createBrowserSoapAPIInterceptor(
    'GetAllConfig',
    getAllConfigResponseMock({ zimbraDefaultDomainName: 'example.com' }),
  );
  const queryClient = getQueryClient();
  queryClient.setQueryData(
    ['all-config'],
    [{ n: 'zimbraDefaultDomainName', _content: 'example.com' }],
  );
  await setupBrowserTest(<QuarantineAccountSection account={account} />, { queryClient });
}

function createAccountInterceptor() {
  return createBrowserAPIInterceptor('post', '/service/admin/soap/CreateAccountRequest', () =>
    HttpResponse.json({
      Body: { CreateAccountResponse: { account: [{ name: NEW_ACCOUNT_NAME }] } },
    }),
  );
}

describe('QuarantineAccountSection', () => {
  afterEach(() => {
    resetMockWorker();
  });

  it('renders the quarantine account name and retention settings', async () => {
    await setupSection(ACCOUNT);

    await expect.element(page.getByText('virus-quarantine@example.com')).toBeVisible();
    await expect.element(page.getByText('Quarantine Account', { exact: true })).toBeVisible();
    await expect.element(page.getByText('7', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Days', { exact: true })).toBeVisible();
    await expect
      .element(page.getByRole('button', { name: /delete and re-create quarantine account/i }))
      .toBeVisible();
  });

  it('falls back to the raw interval when it is not a known unit', async () => {
    await setupSection({ ...ACCOUNT, retentionInterval: 'zz' });

    await expect.element(page.getByText('zz', { exact: true })).toBeVisible();
  });

  it('creates the quarantine account from the empty state', async () => {
    const createAccount = await createAccountInterceptor();
    createBrowserSoapAPIInterceptor('ModifyConfig', {});
    await setupSection(undefined);

    await expect
      .element(page.getByText(/there is not quarantine account/i))
      .toBeVisible();
    await page.getByRole('button', { name: /create a quarantine account/i }).click();

    await vi.waitFor(() => expect(createAccount.getCalledTimes()).toBe(1));
    const body = JSON.stringify(await createAccount.getLastRequest().json());
    expect(body).toContain('virus-quarantine.');
    expect(body).toContain('@example.com');
    await expect
      .element(page.getByText('The account has been created successfully'))
      .toBeVisible();
  });

  it('does not recreate when the confirmation is cancelled', async () => {
    const createAccount = await createAccountInterceptor();
    await setupSection(ACCOUNT);

    await page.getByRole('button', { name: /delete and re-create quarantine account/i }).click();
    await expect
      .element(page.getByText(/are you sure you want to delete and re-create quarantine account?/i))
      .toBeVisible();

    await page.getByRole('button', { name: 'NO, KEEP IT' }).click();
    await expect
      .poll(() =>
        page
          .getByText(/are you sure you want to delete and re-create quarantine account?/i)
          .elements(),
      )
      .toHaveLength(0);
    expect(createAccount.getCalledTimes()).toBe(0);
  });

  it('recreates the account and deletes the previous one on confirmation', async () => {
    const createAccount = await createAccountInterceptor();
    const modifyConfigParams = createBrowserSoapAPIInterceptor('ModifyConfig', {});
    createBrowserSoapAPIInterceptor('GetAccount', {
      account: [{ id: 'acc-1', name: 'virus-quarantine@example.com' }],
    });
    const deleteAccountParams = createBrowserSoapAPIInterceptor('DeleteAccount', {});
    await setupSection(ACCOUNT);

    await page.getByRole('button', { name: /delete and re-create quarantine account/i }).click();
    await page.getByRole('button', { name: /yes, delete and re-create it/i }).click();

    await expect
      .element(page.getByText('The account has been created successfully'))
      .toBeVisible();
    expect(createAccount.getCalledTimes()).toBe(1);
    expect(JSON.stringify(await modifyConfigParams)).toContain(NEW_ACCOUNT_NAME);
    expect(JSON.stringify(await deleteAccountParams)).toContain('acc-1');
  });
});
