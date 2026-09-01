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
import { page } from 'vitest/browser';

import { SECURITY, GENERAL_SECTION } from '../../../constants';
import type { GetAccountQuotaRawResponse } from '../../../services/account-quota';
import { EditAccount } from '../edit-account';

const ACCOUNT_ID = 'mock-id';
const ACCOUNT_NAME = 'test-user@example.com';

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

const mockAccountQuotaResponse: GetAccountQuotaRawResponse = {
  total: {
    used: 5368709120,
    computedLimit: { type: 'limited', value: 10737418240, source: 'account' },
    status: 'UNDERQUOTA',
  },
  modules: {
    mailbox: { used: 4000000000 },
    files: { used: 1000000000 },
    wsc: { used: 368709120 },
  },
};

function setupAdvancedEditAccountMocks(): void {
  createBrowserSoapAPIInterceptor('GetAccount', mockGetAccountResponse);
  createBrowserSoapAPIInterceptor('SearchDirectory', {
    cos: [{ name: 'default', id: 'cos-1' }],
  });
  createBrowserAPIInterceptor(
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
  createBrowserAPIInterceptor(
    'get',
    `/services/storages/admin/quota/accounts/${ACCOUNT_ID}`,
    () => HttpResponse.json(mockAccountQuotaResponse, { status: 200 }),
  );
  createBrowserAPIInterceptor(
    'get',
    '/services/storages/admin/quota/config/domains/domain-id',
    () => HttpResponse.json(null, { status: 404 }),
  );
}

describe('EditAccount (browser)', () => {
  it('shows Storage usage on initial load in the General tab when quota data is available', async () => {
    setupAdvancedEditAccountMocks();

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
  });

  it('does not show Save/Cancel on initial load before any edits', async () => {
    setupAdvancedEditAccountMocks();

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
    await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('hides the save button after saving the backup self-undelete switch', async () => {
    createBrowserSoapAPIInterceptor('GetAccount', mockGetAccountResponse);

    // stateful: the get endpoint reflects whatever the set endpoint last saved
    let selfUndeleteValue = '';
    createBrowserAPIInterceptor(
      'post',
      '/service/extension/zextras_admin/core/attributes/get',
      () =>
        HttpResponse.json({
          attributes: {
            abqMode: [{ value: '' }],
            backupEnabled: [{ value: '' }],
            backupSelfUndeleteAllowed: [{ value: selfUndeleteValue }],
          },
        }),
    );
    const setCoreAttributesInterceptor = await createBrowserAPIInterceptor(
      'post',
      '/service/extension/zextras_admin/core/attribute/set',
      () => {
        selfUndeleteValue = 'TRUE';
        return HttpResponse.json({});
      },
    );

    const queryClient = getQueryClient();
    queryClient.setQueryData(['advanced-supported'], { supported: true });

    await setupBrowserTest(
      <EditAccount
        account={{ id: ACCOUNT_ID, name: ACCOUNT_NAME }}
        onClose={(): void => {}}
        onSaved={(): void => {}}
        onDeleted={(): void => {}}
        defaultTab={SECURITY}
      />,
      { queryClient, withDomainIdRoute: true, initialRouterEntry: '/domain-id' },
    );

    const restoreSwitch = page.getByRole('switch', { name: 'Allow user to restore messages' });
    await expect.element(restoreSwitch).toBeVisible();
    await expect.element(restoreSwitch).not.toBeChecked();

    await restoreSwitch.click();
    await expect.element(restoreSwitch).toBeChecked();
    await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();

    await page.getByRole('button', { name: 'Save' }).click();

    await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    await expect.element(restoreSwitch).toBeChecked();

    expect(setCoreAttributesInterceptor.getCalledTimes()).toBe(1);
    const payload = (await setCoreAttributesInterceptor.getLastRequest().json()) as {
      backupSelfUndeleteAllowed?: { value: boolean; objectName: string; configType: string };
    };
    expect(payload.backupSelfUndeleteAllowed).toEqual({
      value: true,
      objectName: ACCOUNT_ID,
      configType: 'account',
    });
  });
});
