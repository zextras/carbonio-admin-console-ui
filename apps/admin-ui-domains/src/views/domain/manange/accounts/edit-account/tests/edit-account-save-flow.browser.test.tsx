/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
import {
  advancedSupportedApiForBrowser,
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  setupBrowserTest as _setupBrowserTest,
} from 'admin-ui-test-utils';
import { type ReactElement } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { type RenderResult } from 'vitest-browser-react';

import ManageAccounts from '../../manage-accounts';

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';

function setupBrowserTest(ui: ReactElement): Promise<RenderResult> {
  const queryClient = getQueryClient();
  queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
    id: DOMAIN_ID,
    name: DOMAIN_NAME,
    a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
  });
  return _setupBrowserTest(ui, {
    queryClient,
    withDomainIdRoute: true,
    initialRouterEntry: `/${DOMAIN_ID}`,
  });
}

type AccountEntry = {
  name: string;
  id: string;
  a: Array<{ n: string; _content: string }>;
};

const buildAccount = (email: string, id: string, sn: string): AccountEntry => ({
  name: email,
  id,
  a: [
    { n: 'mail', _content: email },
    { n: 'sn', _content: sn },
    { n: 'zimbraId', _content: id },
    { n: 'zimbraCOSId', _content: 'cos-default-id' },
    { n: 'displayName', _content: email.split('@')[0] },
    { n: 'zimbraAccountStatus', _content: 'active' },
  ],
});

const JANE = buildAccount('jane@example.com', 'acc-1', 'Smith');

// the detail query is refetched after save; it must return the persisted
// surname so the form defaults update and isDirty clears (AGENTS.md pattern)
let persistedSn = 'Smith';

async function setupEditAccountInterceptors(): Promise<void> {
  await createBrowserSoapAPIInterceptor('SearchDirectory', {
    account: [JANE],
    searchTotal: 1,
    more: false,
  });
  await createBrowserSoapAPIInterceptor('CountAccount', {
    cos: [{ id: 'cos-default-id', name: 'default', _content: '1' }],
  });
  await createBrowserSoapAPIInterceptor('GetAccount', {
    account: [
      {
        ...JANE,
        a: JANE.a.map((attr) => (attr.n === 'sn' ? { ...attr, _content: persistedSn } : attr)),
      },
    ],
  });
  await createBrowserSoapAPIInterceptor('GetSignatures', { signature: [] });
  await createBrowserSoapAPIInterceptor('GetAccountMembership', { dl: [] });
  await createBrowserSoapAPIInterceptor('GetSessions', {});
  await createBrowserSoapAPIInterceptor('CheckRight', { allow: true });
  await createBrowserSoapAPIInterceptor('GetCos', {
    cos: [{ id: 'cos-default-id', name: 'default', a: [] }],
  });
  await createBrowserSoapAPIInterceptor('GetGrants', {});
  await createBrowserSoapAPIInterceptor('GetFolder', { folder: [] });
}

describe('EditAccount save flow (browser)', () => {
  beforeEach(async () => {
    await advancedSupportedApiForBrowser.withAdvancedNotSupported();
    persistedSn = 'Smith';
  });

  it('edits surname, saves, sends ModifyAccount and clears dirty state', async () => {
    await setupEditAccountInterceptors();
    const modifyAccountParams = await createBrowserSoapAPIInterceptor<
      {
        id: string;
        a: Array<{ n: string; _content: string }>;
      },
      { account: Array<AccountEntry> }
    >('ModifyAccount', { account: [JANE] });

    await setupBrowserTest(<ManageAccounts />);

    // open the edit view from the list
    await page.getByText('jane@example.com').click();

    // edit the surname on the general tab
    const surnameInput = page.getByLabelText(/surname/i);
    await surnameInput.fill('Doe');

    // save
    const saveButton = page.getByRole('button', { name: 'Save' });
    await expect.element(saveButton).toBeVisible();
    await saveButton.click();

    // the ModifyAccount request carries only the modified attribute
    const params = await modifyAccountParams;
    expect(params.id).toBe('acc-1');
    const attrs = params.a as Array<{ n: string; _content: string }>;
    expect(attrs).toContainEqual({ n: 'sn', _content: 'Doe' });
    expect(attrs).toHaveLength(1);

    // post-save: the refetched detail returns the persisted value, defaults
    // update and the dirty state clears (Save button disappears)
    persistedSn = 'Doe';
    await expect.element(saveButton).not.toBeInTheDocument();
  });
});
