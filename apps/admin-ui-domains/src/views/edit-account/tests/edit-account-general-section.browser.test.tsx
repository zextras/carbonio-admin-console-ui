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

import { useAccountForm } from '../account-form-context';
import { EditAccountGeneralSection } from '../general-section';
import { SettingsFields } from '../general-section/settings-fields';
import { AccountFormTestProvider } from './account-form-test-provider';

function CancelHarness() {
  const { resetToSaved } = useAccountForm();
  return (
    <button type="button" onClick={resetToSaved}>
      Cancel
    </button>
  );
}

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
      <EditAccountGeneralSection
        onNavigateToAdministration={vi.fn()}
      />
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

describe('EditAccountGeneralSection Default COS (browser)', () => {
  beforeEach(() => {
    createBrowserSoapAPIInterceptor('SearchDirectory', {
      cos: [
        { name: 'default', id: 'default-cos-id' },
        { name: 'Premium COS', id: 'premium-cos-id' },
      ],
    });
  });

  it('re-enables the COS select after cancel when Default COS was toggled on', async () => {
    const queryClient = getQueryClient();
    queryClient.setQueryData(['advanced-supported'], { supported: true });
    const accountDetail = buildMockAccountDetail({ zimbraCOSId: 'premium-cos-id' });

    await setupBrowserTest(
      <AccountFormTestProvider values={accountDetail}>
        <>
          <SettingsFields />
          <CancelHarness />
        </>
      </AccountFormTestProvider>,
      { queryClient },
    );

    const defaultCosSwitch = page.getByRole('switch', { name: 'Default COS' });
    const cosSelect = page.getByText('Default Class of Service', { exact: true });

    await expect.element(defaultCosSwitch).toHaveAttribute('aria-checked', 'false');

    await defaultCosSwitch.click();
    await expect.element(defaultCosSwitch).toHaveAttribute('aria-checked', 'true');

    await cosSelect.click();
    await expect.element(page.getByTestId('dropdown-popper-list')).not.toBeInTheDocument();

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect.element(defaultCosSwitch).toHaveAttribute('aria-checked', 'false');

    await cosSelect.click();
    await page.getByTestId('dropdown-popper-list').getByText('Premium COS').click();
    await expect.element(defaultCosSwitch).toHaveAttribute('aria-checked', 'false');
  });

  it('turns off Default COS and enables the select when default COS is first in the list', async () => {
    const queryClient = getQueryClient();
    queryClient.setQueryData(['advanced-supported'], { supported: true });
    const accountDetail = buildMockAccountDetail({ zimbraCOSId: 'default-cos-id' });

    await setupBrowserTest(
      <AccountFormTestProvider values={accountDetail}>
        <SettingsFields />
      </AccountFormTestProvider>,
      { queryClient },
    );

    const defaultCosSwitch = page.getByRole('switch', { name: 'Default COS' });
    const cosSelect = page.getByText('Default Class of Service', { exact: true });

    await expect.element(defaultCosSwitch).toHaveAttribute('aria-checked', 'true');

    await defaultCosSwitch.click();
    await expect.element(defaultCosSwitch).toHaveAttribute('aria-checked', 'false');
    await expect.element(page.getByText('default', { exact: true })).toBeVisible();

    await cosSelect.click();
    await expect.element(page.getByTestId('dropdown-popper-list')).toBeVisible();
  });
});
