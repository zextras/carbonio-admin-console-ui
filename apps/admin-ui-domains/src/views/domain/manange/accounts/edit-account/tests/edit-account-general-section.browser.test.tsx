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

import { EditAccountGeneralSection } from '../edit-account-general-section';
import { AccountFormTestProvider } from './account-form-test-provider';

function buildMockAccountDetail(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
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
    };
}

function setupTest(contextOverrides: Record<string, unknown> = {}) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['advanced-supported'], { supported: true });
  const accountDetail = buildMockAccountDetail(contextOverrides);

  createBrowserSoapAPIInterceptor('SearchDirectory', {
    searchTotal: 1,
    domain: [{ id: 'domain-123', name: 'test-domain.com' }],
  });

  return setupBrowserTest(
    <AccountFormTestProvider values={accountDetail}>
      <EditAccountGeneralSection setChange={vi.fn()} onQuotaErrorChange={vi.fn()} />
    </AccountFormTestProvider>,
    { queryClient },
  );
}

describe('EditAccountGeneralSection (browser)', () => {
  describe('Last Access field', () => {
    it('should display the formatted last logon timestamp', async () => {
      setupTest();
      const lastAccessInput = page.getByText(/20 Mar 2026/);

      await expect.element(lastAccessInput).toBeVisible();
    });

    it('should show "Never logged in" when no last logon timestamp is set', async () => {
      setupTest({ zimbraLastLogonTimestamp: undefined });
      const lastAccessInput = page.getByText('Never logged in', { exact: true });
      await expect.element(lastAccessInput).toBeVisible();
    });

    it('should display the last logon date, not the creation date', async () => {
      setupTest();
      const lastAccessInput = page.getByText('Last Access');
      await expect.element(lastAccessInput).toBeVisible();
      // Must show last logon (Mar 2026), not creation date (Jan 2025)
      const lastLogonDate = page.getByText(/20 Mar 2026 | 03:30:00 PM/);
      await expect.element(lastLogonDate).toBeVisible();
    });
  });
});
