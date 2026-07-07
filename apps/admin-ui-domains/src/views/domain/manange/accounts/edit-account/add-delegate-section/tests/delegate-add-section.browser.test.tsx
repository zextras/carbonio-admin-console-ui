/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { AccountContext } from '../../../account-context';
import DelegateAddSection from '../delegate-add-section';

const baseMockContext = {
  accountDetail: {
    zimbraMailDeliveryAddress: 'owner@example.com',
    zimbraId: 'owner-id',
  },
  cosDetail: {},
  accSpecificDetail: {},
  identitiesList: [],
  folderList: [],
  getIdentitiesList: vi.fn(),
  setDeligateDetail: vi.fn(),
  setAccountDetail: vi.fn(),
  setFolderList: vi.fn(),
  setDefaultCOS: vi.fn(),
  setInDirectMemberList: vi.fn(),
  setSignatureItems: vi.fn(),
  setSignatureList: vi.fn(),
  setAllUserSessionList: vi.fn(),
  setAccSpecificDetail: vi.fn(),
  setDirectMemberList: vi.fn(),
  setInitAccountDetail: vi.fn(),
  setUserSessionList: vi.fn(),
  setGlobalRights: vi.fn(),
  setinitialGlobalRights: vi.fn(),
  setDeleteAdministrationRights: vi.fn(),
};

function setupTest(deligateDetailOverrides: Record<string, unknown> = {}) {
  const queryClient = getQueryClient();

  const deligateDetail = {
    grantee: [{ name: 'delegate@example.com', type: 'usr' }],
    right: [{ _content: 'sendAs' }],
    delegeteRights: 'send_mails_only',
    ...deligateDetailOverrides,
  };

  return setupBrowserTest(
    <AccountContext.Provider
      value={{ ...baseMockContext, deligateDetail } as any}
    >
      <DelegateAddSection />
    </AccountContext.Provider>,
    { queryClient },
  );
}

describe('DelegateAddSection', () => {
  it('should render abstract section with delegate info', async () => {
    setupTest();

    await expect.element(page.getByText('Abstract')).toBeVisible();
    await expect
      .element(page.getByText(/The user delegate@example.com will be able to send mails/))
      .toBeVisible();
  });

  it('should display "as" text when right is sendAs', async () => {
    setupTest({ right: [{ _content: 'sendAs' }] });

    await expect
      .element(page.getByText(/will be able to send mails as/))
      .toBeVisible();
  });

  it('should display "on behalf of" text when right is sendOnBehalfOf', async () => {
    setupTest({ right: [{ _content: 'sendOnBehalfOf' }] });

    await expect
      .element(page.getByText(/will be able to send mails on behalf of/))
      .toBeVisible();
  });

  it('should show delegate rights labeled value', async () => {
    setupTest();

    await expect
      .element(page.getByText('Delegate`s rights'))
      .toBeVisible();
  });

  it('should show sending options when delegeteRights is not read_mails_only', async () => {
    setupTest({ delegeteRights: 'send_mails_only' });

    await expect
      .element(page.getByText('Sending Options', { exact: false }))
      .toBeVisible();
  });

  it('should hide sending options when delegeteRights is read_mails_only', async () => {
    setupTest({ delegeteRights: 'read_mails_only' });

    await expect
      .element(page.getByText('Sending Options', { exact: false }))
      .not.toBeInTheDocument();
  });
});
