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
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { AccountContext } from '../../account-context';
import EditAccountAdministrationSection from '../edit-account-administration-section';

const baseMockContext = {
  accountDetail: {
    zimbraId: 'test-account-id',
    name: 'testuser@example.com',
    zimbraIsAdminAccount: 'FALSE',
    zimbraIsDelegatedAdminAccount: 'FALSE',
  },
  initAccountDetail: {
    zimbraIsDelegatedAdminAccount: 'FALSE',
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
  deligateDetail: {},
};

function setupInterceptors(): void {
  createBrowserSoapAPIInterceptor('GetAccountMembership', { dl: [] });
  createBrowserSoapAPIInterceptor('SearchDirectory', {
    searchTotal: 1,
    domain: [{ id: 'domain-1', name: 'example.com' }],
  });
  createBrowserSoapAPIInterceptor('GetInfo', {
    attrs: { zimbraIsAdminAccount: 'TRUE' },
  });
}

function setupAdvancedGlobalAdminTest(
  contextOverrides: Record<string, unknown> = {},
) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['advanced-supported'], { supported: true });
  queryClient.setQueryData(['user-settings'], {
    attrs: { zimbraIsAdminAccount: 'TRUE' },
  });

  setupInterceptors();

  return setupBrowserTest(
    <AccountContext.Provider
      value={{ ...baseMockContext, ...contextOverrides } as any}
    >
      <EditAccountAdministrationSection setIsLoading={vi.fn()} />
    </AccountContext.Provider>,
    { queryClient },
  );
}

function setupNotAdvancedTest(contextOverrides: Record<string, unknown> = {}) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['advanced-supported'], { supported: false });
  queryClient.setQueryData(['user-settings'], {
    attrs: { zimbraIsAdminAccount: 'TRUE' },
  });

  setupInterceptors();

  return setupBrowserTest(
    <AccountContext.Provider
      value={{ ...baseMockContext, ...contextOverrides } as any}
    >
      <EditAccountAdministrationSection setIsLoading={vi.fn()} />
    </AccountContext.Provider>,
    { queryClient },
  );
}

describe('EditAccountAdministrationSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Roles section', () => {
    it('should render Roles header', async () => {
      setupAdvancedGlobalAdminTest();

      await expect.element(page.getByText('Roles')).toBeVisible();
    });
  });

  describe('Delegated administration switch', () => {
    it('should show Delegated administration switch when account is not global admin', async () => {
      setupAdvancedGlobalAdminTest({
        accountDetail: {
          ...baseMockContext.accountDetail,
          zimbraIsAdminAccount: 'FALSE',
        },
      });

      await expect
        .element(page.getByText('Delegated administration'))
        .toBeVisible();
    });

    it('should hide Delegated administration switch when account is global admin', async () => {
      setupAdvancedGlobalAdminTest({
        accountDetail: {
          ...baseMockContext.accountDetail,
          zimbraIsAdminAccount: 'TRUE',
        },
      });

      await expect
        .element(page.getByText('Delegated administration'))
        .not.toBeInTheDocument();
    });

    it('should not show Delegated administration in non-advanced mode', async () => {
      setupNotAdvancedTest();

      await expect
        .element(page.getByText('Delegated administration'))
        .not.toBeInTheDocument();
    });
  });

  describe('Domain and ACL selection', () => {
    it('should show Domain input when delegated admin is enabled', async () => {
      setupAdvancedGlobalAdminTest({
        accountDetail: {
          ...baseMockContext.accountDetail,
          zimbraIsAdminAccount: 'FALSE',
          zimbraIsDelegatedAdminAccount: 'TRUE',
        },
      });

      await expect.element(page.getByText('Domain').first()).toBeVisible();
    });

    it('should show Rights select when delegated admin is enabled', async () => {
      setupAdvancedGlobalAdminTest({
        accountDetail: {
          ...baseMockContext.accountDetail,
          zimbraIsAdminAccount: 'FALSE',
          zimbraIsDelegatedAdminAccount: 'TRUE',
        },
      });

      await expect
        .element(page.getByText('Rights (Access Control Lists)'))
        .toBeVisible();
    });

    it('should show Add button when delegated admin is enabled', async () => {
      setupAdvancedGlobalAdminTest({
        accountDetail: {
          ...baseMockContext.accountDetail,
          zimbraIsAdminAccount: 'FALSE',
          zimbraIsDelegatedAdminAccount: 'TRUE',
        },
      });

      await expect
        .element(page.getByRole('button', { name: /Add/i }))
        .toBeVisible();
    });

    it('should disable Add button when no domain selected', async () => {
      setupAdvancedGlobalAdminTest({
        accountDetail: {
          ...baseMockContext.accountDetail,
          zimbraIsAdminAccount: 'FALSE',
          zimbraIsDelegatedAdminAccount: 'TRUE',
        },
      });

      await expect
        .element(page.getByRole('button', { name: /Add/i }))
        .toBeDisabled();
    });
  });

  describe('Administration rights section', () => {
    it('should not show rights table when no distribution lists assigned', async () => {
      setupAdvancedGlobalAdminTest({
        accountDetail: {
          ...baseMockContext.accountDetail,
          zimbraIsAdminAccount: 'FALSE',
          zimbraIsDelegatedAdminAccount: 'TRUE',
        },
      });

      await expect
        .element(page.getByText('This account has Administration rights for'))
        .not.toBeInTheDocument();
    });
  });
});
