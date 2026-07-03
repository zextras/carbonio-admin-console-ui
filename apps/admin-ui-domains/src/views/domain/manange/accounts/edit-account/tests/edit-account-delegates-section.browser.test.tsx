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
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { AccountContext } from '../../account-context';
import EditAccountDelegatesSection from '../edit-account-delegates-section';

const mockContextValue = {
  accountDetail: {
    zimbraMailDeliveryAddress: 'owner@example.com',
    zimbraId: 'owner-id',
    zimbraPrefDelegatedSendSaveTarget: 'inherit',
  },
  cosDetail: {
    zimbraPrefDelegatedSendSaveTarget: 'inherit',
  },
  accSpecificDetail: {},
  identitiesList: [],
  folderList: [],
  getIdentitiesList: vi.fn(),
  setDeligateDetail: vi.fn(),
  setAccountDetail: vi.fn(),
  setFolderList: vi.fn(),
  deligateDetail: {},
  setDefaultCOS: vi.fn(),
  setInDirectMemberList: vi.fn(),
  setSignatureItems: vi.fn(),
  setSignatureList: vi.fn(),
  setAllUserSessionList: vi.fn(),
  setAccSpecificDetail: vi.fn(),
  setAccountDetail: vi.fn(),
  setDirectMemberList: vi.fn(),
  setInitAccountDetail: vi.fn(),
  setUserSessionList: vi.fn(),
  setGlobalRights: vi.fn(),
  setinitialGlobalRights: vi.fn(),
  setDeleteAdministrationRights: vi.fn(),
};

function setupTest(contextOverrides: Record<string, unknown> = {}) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['advanced-supported'], { supported: true });

  return setupBrowserTest(
    <AccountContext.Provider
      value={{ ...mockContextValue, ...contextOverrides } as any}
    >
      <EditAccountDelegatesSection />
    </AccountContext.Provider>,
    { queryClient },
  );
}

describe('EditAccountDelegatesSection (browser)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render simplified delegate settings and disabled add rights button', async () => {
    setupTest();

    await expect
      .element(
        page.getByText("Delegate's general Send Settings", { exact: false }),
      )
      .toBeVisible();
    await expect
      .element(
        page.getByPlaceholder(
          'Start typing an Account / Group to add it to the rights',
        ),
      )
      .toBeVisible();
    await expect.element(page.getByText(/Read \/ Write/i).first()).toBeVisible();
    await expect.element(page.getByText(/Read Only/i).first()).toBeVisible();
    await expect.element(page.getByText(/Send/i).first()).toBeVisible();
    await expect.element(page.getByText(/Send on Behalf of/i).first()).toBeVisible();
    await expect
      .element(
        page.getByRole('button', {
          name: /ADD THE ACCOUNT \/ GROUP WITH SELECTED RIGHTS/i,
        }).first(),
      )
      .toBeDisabled();
  });

  it('should switch to advanced view and render delegate table empty state', async () => {
    setupTest();

    const switchControl = page.getByText(/Switch to Simplified View/i).first();
    await expect.element(switchControl).toBeVisible();
    await switchControl.click();

    await expect.element(page.getByRole('button', { name: /ADD NEW/i }).first()).toBeVisible();
    await expect.element(page.getByText('DELEGATES', { exact: true }).first()).toBeVisible();
    await expect.element(page.getByText('This list is empty.').first()).toBeVisible();
  });

  it('should open the add delegate wizard when clicking ADD NEW in advanced view', async () => {
    setupTest();

    const switchControl = page.getByText(/Switch to Simplified View/i).first();
    await expect.element(switchControl).toBeVisible();
    await switchControl.click();
    await userEvent.click(page.getByRole('button', { name: /ADD NEW/i }).first());

    await expect
      .element(page.getByText('Add user on Delegates List', { exact: true }).first())
      .toBeVisible();
  });

  it('should perform SearchDirectory when typing at least three characters', async () => {
    const searchInterceptor = createBrowserSoapAPIInterceptor('SearchDirectory', {
      account: [
        {
          id: 'delegate-id',
          name: 'delegate@example.com',
        },
      ],
      dl: [],
    });

    setupTest();

    const chipInput = page.getByPlaceholder(
      'Start typing an Account / Group to add it to the rights',
    );
    await userEvent.type(chipInput, 'abc');
    await expect(searchInterceptor).resolves.toHaveProperty('query');
  });

  it('should render an identity row and open edit wizard when delegate is selected', async () => {
    const delegateIdentity = {
      grantee: [{ id: 'delegate-id', name: 'delegate@example.com', type: 'usr' }],
      right: [{ _content: 'sendAs' }],
      folder: [{ perm: 'rwidxa', id: 'folder-1', zid: 'zid-1' }],
    };

    setupTest({ identitiesList: [delegateIdentity] });

    const switchControl = page.getByText(/Switch to Simplified View/i).first();
    await expect.element(switchControl).toBeVisible();
    await switchControl.click();

    await expect.element(page.getByText('delegate@example.com').first()).toBeVisible();
    await userEvent.click(page.getByText('delegate@example.com').first());
    await userEvent.click(page.getByRole('button', { name: /EDIT/i }).first());

    await expect
      .element(page.getByText('Add user on Delegates List', { exact: true }).first())
      .toBeVisible();
  });
});
