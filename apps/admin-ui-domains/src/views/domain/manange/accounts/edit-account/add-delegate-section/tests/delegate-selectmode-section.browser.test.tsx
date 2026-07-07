/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { AccountContext } from '../../../account-context';
import DelegateSelectModeSection from '../delegate-selectmode-section';

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
    grantee: [{ name: '', type: 'usr' }],
    ...deligateDetailOverrides,
  };

  return setupBrowserTest(
    <AccountContext.Provider
      value={{ ...baseMockContext, deligateDetail } as any}
    >
      <DelegateSelectModeSection />
    </AccountContext.Provider>,
    { queryClient },
  );
}

describe('DelegateSelectModeSection', () => {
  it('should render delegate type selector', async () => {
    setupTest();

    await expect
      .element(page.getByText('I want to create a delegate'))
      .toBeVisible();
    await expect
      .element(page.getByText('Who will be the delegates?'))
      .toBeVisible();
  });

  it('should render account search input', async () => {
    setupTest();

    await expect
      .element(page.getByText('Search here for an Account'))
      .toBeVisible();
  });

  it('should show A User as default selection', async () => {
    setupTest({ grantee: [{ name: '', type: 'usr' }] });

    await expect.element(page.getByText('A User')).toBeVisible();
  });

  it('should search accounts when typing at least 3 characters', async () => {
    const searchInterceptor = createBrowserSoapAPIInterceptor(
      'SearchDirectory',
      {
        account: [
          { id: 'delegate-id', name: 'delegate@example.com' },
        ],
      },
    );

    setupTest();

    const input = page.getByRole('textbox');
    await userEvent.type(input, 'dele');

    await expect(searchInterceptor).resolves.toBeDefined();
  });

  it('should show existing grantee name in input when provided', async () => {
    setupTest({
      grantee: [{ name: 'existing@example.com', type: 'usr' }],
    });

    const input = page.getByRole('textbox');
    await expect.element(input).toHaveValue('existing@example.com');
  });
});
