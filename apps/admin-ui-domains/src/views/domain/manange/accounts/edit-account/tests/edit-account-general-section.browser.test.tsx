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
import { page } from 'vitest/browser';

import { AccountContext } from '../../account-context';
import { EditAccountGeneralSection } from '../edit-account-general-section';

function buildMockContext(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    accountDetail: {
      uid: 'test-user',
      name: 'test-user@test-domain.com',
      sn: 'User',
      initials: 'T',
      givenName: 'Test',
      displayName: 'Test User',
      zimbraId: 'mock-zimbra-id',
      zimbraAccountStatus: 'active',
      zimbraCOSId: 'default-cos-id',
      zimbraPrefLocale: 'en',
      zimbraMailHost: 'mail.test-domain.com',
      zimbraCreateTimestamp: '20250115100000.000Z',
      zimbraLastLogonTimestamp: '20260320143000.000Z',
      zimbraMailQuota: 10737418240,
      zimbraHideInGal: 'FALSE',
      zimbraPasswordMustChange: 'FALSE',
      zimbraIsAdminAccount: 'FALSE',
      zimbraIsDelegatedAdminAccount: 'FALSE',
      zimbraIsExternalVirtualAccount: 'FALSE',
      zimbraIsSystemAccount: 'FALSE',
      domainName: 'test-domain.com',
      mail: 'test-user@test-domain.com',
      password: '',
      repeatPassword: '',
      description: 'A test account',
      zimbraNotes: 'Some notes',
      ...overrides,
    },
    cosDetail: {
      zimbraMailQuota: 5368709120,
      zimbraPrefLocale: 'en',
    },
    accSpecificDetail: {},
    directMemberList: [],
    inDirectMemberList: [],
    setSignatureItems: vi.fn(),
    setSignatureList: vi.fn(),
    setAccountDetail: vi.fn(),
    setAccSpecificDetail: vi.fn(),
    setDirectMemberList: vi.fn(),
    setInDirectMemberList: vi.fn(),
    setInitAccountDetail: vi.fn(),
    initAccountDetail: {
      zimbraMailQuota: 10737418240,
      mailboxQuotaUsed: 2147483648,
      zimbraCreateTimestamp: '20250115100000.000Z',
      zimbraLastLogonTimestamp: '20260320143000.000Z',
      domainName: 'test-domain.com',
    },
    otpList: [],
    identitiesList: [],
    folderList: [],
    setFolderList: vi.fn(),
    getListOtp: vi.fn(),
    getIdentitiesList: vi.fn(),
    deligateDetail: {},
    setDeligateDetail: vi.fn(),
    credentialList: [],
    getCredentialList: vi.fn(),
    initialGlobalRights: {},
    setinitialGlobalRights: vi.fn(),
    globalRights: {},
    setGlobalRights: vi.fn(),
    deleteAdministrationRights: [],
    setDeleteAdministrationRights: vi.fn(),
    userSessionList: [],
    setAllUserSessionList: vi.fn(),
    allUserSessionList: [],
    setUserSessionList: vi.fn(),
    defaultCOS: false,
    setDefaultCOS: vi.fn(),
    allowedDeletePassword: false,
    setAllowedDeletePassword: vi.fn(),
  };
}

function setupTest(contextOverrides: Record<string, unknown> = {}) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['advanced-supported'], { supported: true });
  const mockContext = buildMockContext(contextOverrides);

  createBrowserSoapAPIInterceptor('SearchDirectory', {
    searchTotal: 1,
    domain: [{ id: 'domain-123', name: 'test-domain.com' }],
  });

  return setupBrowserTest(
    <AccountContext.Provider value={mockContext as any}>
      <EditAccountGeneralSection setChange={vi.fn()} onQuotaErrorChange={vi.fn()} />
    </AccountContext.Provider>,
    { queryClient },
  );
}

describe('EditAccountGeneralSection (browser)', () => {
  describe('Last Access field', () => {
    it('should display the formatted last logon timestamp', async () => {
      setupTest();
      const lastAccessInput = page.getByRole('textbox', { name: 'Last Access' });
      await expect.element(lastAccessInput).toHaveValue(expect.stringContaining('20 Mar 2026'));
    });

    it('should show "Never logged in" when no last logon timestamp is set', async () => {
      setupTest({ zimbraLastLogonTimestamp: undefined });
      const lastAccessInput = page.getByRole('textbox', { name: 'Last Access' });
      await expect.element(lastAccessInput).toHaveValue('Never logged in');
    });

    it('should display the last logon date, not the creation date', async () => {
      setupTest();
      const lastAccessInput = page.getByRole('textbox', { name: 'Last Access' });
      await expect.element(lastAccessInput).toBeVisible();
      // Must show last logon (Mar 2026), not creation date (Jan 2025)
      await expect.element(lastAccessInput).toHaveValue(expect.stringContaining('2026'));
    });
  });
});
