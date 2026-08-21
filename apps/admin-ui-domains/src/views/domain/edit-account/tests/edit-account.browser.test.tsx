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

import { SECURITY } from '../../../../constants';
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
        { n: 'displayName', _content: 'Test User' },
        { n: 'zimbraCOSId', _content: 'cos-1' },
      ],
    },
  ],
};

describe('EditAccount (browser)', () => {
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
