/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  grantUserCosRights,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { type ModifyCosBody } from '../../../services/modify-cos-service';
import { CosAdvanced } from '../advanced/cos-advanced';

const COS_ID = 'e00428a1-0c00-11d9-836a-000d93afea2a';

const mockCosData = {
  cos: [
    {
      id: COS_ID,
      name: 'default',
      a: [
        { n: 'zimbraId', _content: COS_ID },
        { n: 'zimbraMailForwardingAddressMaxLength', _content: '256' },
        { n: 'zimbraMailForwardingAddressMaxNumAddrs', _content: '10' },
        { n: 'zimbraContactMaxNumEntries', _content: '100' },
        { n: 'zimbraPasswordLocked', _content: 'FALSE' },
        { n: 'zimbraPasswordMinLength', _content: '6' },
        { n: 'zimbraPasswordMaxLength', _content: '64' },
        { n: 'zimbraPasswordBlockCommonEnabled', _content: 'FALSE' },
        { n: 'zimbraPasswordLockoutEnabled', _content: 'FALSE' },
        { n: 'zimbraPasswordLockoutMaxFailures', _content: '5' },
        { n: 'zimbraPasswordLockoutDuration', _content: '60m' },
        { n: 'zimbraPasswordLockoutFailureLifetime', _content: '1h' },
      ],
    },
  ],
};

const QUOTA_SEED = {
  type: 'success',
  totalComputedLimit: { type: 'unlimited' },
  totalQuotaSource: 'global',
};

function seedQueryClientData(
  queryClient: ReturnType<typeof getQueryClient>,
  cosData = mockCosData,
): void {
  queryClient.setQueryData(['cos', 'detail', COS_ID], cosData);
  queryClient.setQueryData(['cos', 'cos-quota', ''], QUOTA_SEED);
  queryClient.setQueryData(['cos', 'cos-quota', COS_ID], QUOTA_SEED);
}

function mockCoreAttributeSet(): void {
  createBrowserAPIInterceptor('post', '/service/extension/zextras_admin/core/attribute/set', () =>
    HttpResponse.json({}),
  );
}

function mockCatalogServices(): void {
  createBrowserAPIInterceptor('get', '/services/catalog/services', () =>
    HttpResponse.json({ items: [] }),
  );
}
function mockGetCoreAttributes(): void {
  createBrowserAPIInterceptor('post', '/service/extension/zextras_admin/core/attributes/get', () =>
    HttpResponse.json({ attributes: {} }),
  );
}
async function setupAdvancedQuotaTest(
  quotaSeed: {
    type: string;
    totalComputedLimit: { type: string; value?: number };
    totalQuotaSource: string;
  } = QUOTA_SEED,
): Promise<ReturnType<typeof getQueryClient>> {
  const queryClient = getQueryClient();
  await grantUserCosRights(queryClient);
  queryClient.setQueryData(['cos', 'detail', COS_ID], mockCosData);
  queryClient.setQueryData(['cos', 'cos-quota', ''], quotaSeed);
  queryClient.setQueryData(['cos', 'cos-quota', COS_ID], quotaSeed);
  queryClient.setQueryData(['advanced-supported'], { supported: true });
  mockCatalogServices();
  mockGetCoreAttributes();
  mockCoreAttributeSet();
  createBrowserSoapAPIInterceptor('GetCos', mockCosData);
  createBrowserSoapAPIInterceptor('ModifyCos', {});
  createBrowserSoapAPIInterceptor('FlushCache', {});
  createBrowserAPIInterceptor('put', `/services/storages/admin/quota/config/cos/${COS_ID}`, () =>
    HttpResponse.json({}),
  );

  await setupBrowserTest(
    <Routes>
      <Route path="/:cosId/:operation" element={<CosAdvanced />} />
    </Routes>,
    { initialRouterEntry: `/${COS_ID}/advanced`, queryClient },
  );
  await expect.element(page.getByText('Advanced')).toBeVisible();
  return queryClient;
}
async function setupCosAdvancedTest(cosData = mockCosData): Promise<void> {
  const queryClient = getQueryClient();
  await grantUserCosRights(queryClient);
  seedQueryClientData(queryClient, cosData);
  mockCatalogServices();
  createBrowserSoapAPIInterceptor('GetCos', cosData);

  await setupBrowserTest(
    <Routes>
      <Route path="/:cosId/:operation" element={<CosAdvanced />} />
    </Routes>,
    { initialRouterEntry: `/${COS_ID}/advanced`, queryClient },
  );
  await expect.element(page.getByText('Advanced')).toBeVisible();
}

describe('CosAdvanced', () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    resetMockWorker();
  });

  afterEach(() => {
    resetMockWorker();
  });

  describe('Rendering', () => {
    it('should render the page title', async () => {
      await setupCosAdvancedTest();
      await expect.element(page.getByText('Advanced')).toBeVisible();
    });

    it('should render the Forwarding section', async () => {
      await setupCosAdvancedTest();
      await expect.element(page.getByText('Forwarding', { exact: true })).toBeVisible();
    });

    it('should not show the Quotas section in CE', async () => {
      await setupCosAdvancedTest();
      await expect.element(page.getByText('Quotas')).not.toBeInTheDocument();
    });

    it('should render the Password section', async () => {
      await setupCosAdvancedTest();
      await expect.element(page.getByText('Password', { exact: true })).toBeVisible();
    });

    it('should render the Failed Login Policy section', async () => {
      await setupCosAdvancedTest();
      await expect.element(page.getByText('Failed Login Policy')).toBeVisible();
    });

    it('should render the Timeout Policy section', async () => {
      await setupCosAdvancedTest();
      await expect.element(page.getByText('Timeout Policy')).toBeVisible();
    });

    it('should render the Email Retention Policy section', async () => {
      await setupCosAdvancedTest();
      await expect.element(page.getByText('Email Retention Policy')).toBeVisible();
    });

    it('should not render the General Options section when advanced is not enabled', async () => {
      await setupCosAdvancedTest();
      await expect.element(page.getByText('General Options')).not.toBeInTheDocument();
    });

    it('should populate forwarding address max length from COS data', async () => {
      await setupCosAdvancedTest();
      const input = page.getByRole('textbox', {
        name: 'Limit user-specified forwarding addresses to (char)',
      });
      await expect.element(input).toHaveValue('256');
    });

    it('should populate forwarding address max num addresses from COS data', async () => {
      await setupCosAdvancedTest();
      const input = page.getByRole('textbox', { name: 'Max user-specific forwarding address' });
      await expect.element(input).toHaveValue('10');
    });

    it('should populate minimum password length from COS data', async () => {
      await setupCosAdvancedTest();
      const input = page.getByRole('textbox', { name: 'Minimum password length' });
      await expect.element(input).toHaveValue('6');
    });

    it('should render with empty forwarding fields when COS data has no forwarding attributes', async () => {
      const cosDataWithoutForwarding = {
        cos: [
          {
            id: COS_ID,
            name: 'default',
            a: [{ n: 'zimbraId', _content: COS_ID }],
          },
        ],
      };
      await setupCosAdvancedTest(cosDataWithoutForwarding);
      const input = page.getByRole('textbox', {
        name: 'Limit user-specified forwarding addresses to (char)',
      });
      await expect.element(input).toHaveValue('');
    });
  });

  describe('Dirty state', () => {
    it('should not show Save and Cancel buttons initially', async () => {
      await setupCosAdvancedTest();
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
      await expect.element(page.getByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });

    it('should show Save and Cancel buttons after editing a field', async () => {
      await setupCosAdvancedTest();
      const input = page.getByRole('textbox', {
        name: 'Limit user-specified forwarding addresses to (char)',
      });
      await userEvent.fill(input, '512');
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    });

    it('should restore initial field value and hide Save/Cancel after Cancel is clicked', async () => {
      await setupCosAdvancedTest();
      const input = page.getByRole('textbox', {
        name: 'Limit user-specified forwarding addresses to (char)',
      });
      await userEvent.fill(input, '512');
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();

      await page.getByRole('button', { name: 'Cancel' }).click();

      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
      await expect.element(input).toHaveValue('256');
    });

    it('should not mark dirty when a field is changed back to its original value', async () => {
      await setupCosAdvancedTest();
      const input = page.getByRole('textbox', {
        name: 'Limit user-specified forwarding addresses to (char)',
      });
      await userEvent.fill(input, '512');
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();

      await userEvent.clear(input);
      await userEvent.type(input, '256');
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });

    it('should remain dirty when multiple fields are changed and only one is reverted', async () => {
      await setupCosAdvancedTest();
      const maxLengthInput = page.getByRole('textbox', {
        name: 'Limit user-specified forwarding addresses to (char)',
      });
      const maxNumInput = page.getByRole('textbox', {
        name: 'Max user-specific forwarding address',
      });

      await userEvent.fill(maxLengthInput, '512');
      await userEvent.clear(maxNumInput);
      await userEvent.type(maxNumInput, '20');
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();

      await userEvent.fill(maxLengthInput, '256');
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });
  });

  describe('Save', () => {
    it('should send ModifyCos with correct zimbraId and urn', async () => {
      const modifyCosPromise = createBrowserSoapAPIInterceptor('ModifyCos', {});
      createBrowserSoapAPIInterceptor('FlushCache', {});
      mockCoreAttributeSet();
      await setupCosAdvancedTest();

      const input = page.getByRole('textbox', {
        name: 'Limit user-specified forwarding addresses to (char)',
      });
      await userEvent.fill(input, '512');
      await page.getByRole('button', { name: 'Save' }).click();

      const requestBody = (await modifyCosPromise) as ModifyCosBody;
      expect(requestBody._jsns).toBe('urn:zimbraAdmin');
      expect(requestBody.id._content).toBe(COS_ID);
    });

    it('should include the updated field value in the ModifyCos request body', async () => {
      const modifyCosPromise = createBrowserSoapAPIInterceptor('ModifyCos', {});
      createBrowserSoapAPIInterceptor('FlushCache', {});
      mockCoreAttributeSet();
      await setupCosAdvancedTest();

      const input = page.getByRole('textbox', {
        name: 'Limit user-specified forwarding addresses to (char)',
      });
      await userEvent.fill(input, '512');
      await page.getByRole('button', { name: 'Save' }).click();

      const requestBody = (await modifyCosPromise) as ModifyCosBody;
      const updatedAttr = requestBody.a.find(
        (a: { n: string }) => a.n === 'zimbraMailForwardingAddressMaxLength',
      );
      expect(updatedAttr).toBeDefined();
      expect(updatedAttr!._content).toBe('512');
    });

    it('should send FlushCache after a successful ModifyCos', async () => {
      createBrowserSoapAPIInterceptor('ModifyCos', {});
      const flushCachePromise = createBrowserSoapAPIInterceptor('FlushCache', {});
      mockCoreAttributeSet();
      await setupCosAdvancedTest();

      const input = page.getByRole('textbox', {
        name: 'Limit user-specified forwarding addresses to (char)',
      });
      await userEvent.fill(input, '512');
      await page.getByRole('button', { name: 'Save' }).click();

      const flushBody = await flushCachePromise;
      expect(flushBody).toBeDefined();
    });

    it('should hide Save and Cancel buttons after a successful save', async () => {
      createBrowserSoapAPIInterceptor('ModifyCos', {});
      createBrowserSoapAPIInterceptor('FlushCache', {});
      mockCoreAttributeSet();
      await setupCosAdvancedTest();

      createBrowserSoapAPIInterceptor('GetCos', {
        cos: [
          {
            ...mockCosData.cos[0],
            a: mockCosData.cos[0].a.map((attr) =>
              attr.n === 'zimbraMailForwardingAddressMaxLength'
                ? { n: attr.n, _content: '512' }
                : attr,
            ),
          },
        ],
      });

      const input = page.getByRole('textbox', {
        name: 'Limit user-specified forwarding addresses to (char)',
      });
      await userEvent.fill(input, '512');
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();

      await page.getByRole('button', { name: 'Save' }).click();

      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });
  });

  describe('Read-only mode', () => {
    async function setupReadOnlyCosAdvancedTest(): Promise<void> {
      const queryClient = getQueryClient();
      seedQueryClientData(queryClient);
      mockCatalogServices();
      queryClient.setQueryData(['account', 'info'], {
        id: 'test-user-id',
        name: 'test@example.com',
        displayName: '',
        signatures: { signature: [] },
        identities: undefined,
        rights: { targets: [] },
      });
      queryClient.setQueryData(
        ['effective-rights', 'test@example.com'],
        [
          {
            type: 'cos',
            all: [
              {
                right: [{ n: 'listCos' }],
                getAttrs: [{ all: true }],
              },
            ],
          },
        ],
      );
      createBrowserSoapAPIInterceptor('GetCos', mockCosData);

      await setupBrowserTest(
        <Routes>
          <Route path="/:cosId/:operation" element={<CosAdvanced />} />
        </Routes>,
        { initialRouterEntry: `/${COS_ID}/advanced`, queryClient },
      );
      await expect.element(page.getByText('Advanced')).toBeVisible();
    }

    it('should disable forwarding inputs when user has no COS setAttrs rights', async () => {
      await setupReadOnlyCosAdvancedTest();
      const input = page.getByRole('textbox', {
        name: 'Limit user-specified forwarding addresses to (char)',
      });
      await expect.element(input).toBeDisabled();
    });

    it('should disable password inputs when user has no COS setAttrs rights', async () => {
      await setupReadOnlyCosAdvancedTest();
      const input = page.getByRole('textbox', { name: 'Minimum password length' });
      await expect.element(input).toBeDisabled();
    });

    it('should not show Save/Cancel when clicking in read-only mode', async () => {
      await setupReadOnlyCosAdvancedTest();
      await page.getByText('Forwarding', { exact: true }).click();
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });
  });

  describe('Backup options', () => {
    function mockGetCoreAttributes(selfUndelete: boolean, enabled = false): void {
      createBrowserAPIInterceptor(
        'post',
        '/service/extension/zextras_admin/core/attributes/get',
        () =>
          HttpResponse.json({
            attributes: {
              backupSelfUndeleteAllowed: [{ value: selfUndelete ? 'TRUE' : '' }],
              backupEnabled: [{ value: enabled ? 'TRUE' : '' }],
            },
          }),
      );
    }

    function restoreToggleIcon(): string | null {
      return (
        document
          .querySelector('[role="switch"][aria-label="Allow user to restore messages"] ds-icon')
          ?.getAttribute('icon') ?? null
      );
    }

    async function setupAdvancedBackupTest(): Promise<void> {
      const queryClient = getQueryClient();
      await grantUserCosRights(queryClient);
      seedQueryClientData(queryClient);
      queryClient.setQueryData(['advanced-supported'], { supported: true });
      queryClient.setQueryData(['cos', 'file-quota', COS_ID], { limit: undefined });
      mockCatalogServices();
      mockGetCoreAttributes(true);
      mockCoreAttributeSet();
      createBrowserAPIInterceptor('get', `/services/storages/admin/quota/cos/${COS_ID}`, () =>
        HttpResponse.json({}),
      );
      createBrowserSoapAPIInterceptor('GetCos', mockCosData);
      createBrowserSoapAPIInterceptor('ModifyCos', {});
      createBrowserSoapAPIInterceptor('FlushCache', {});

      await setupBrowserTest(
        <Routes>
          <Route path="/:cosId/:operation" element={<CosAdvanced />} />
        </Routes>,
        { initialRouterEntry: `/${COS_ID}/advanced`, queryClient },
      );
      await expect.element(page.getByText('General Options')).toBeVisible();
    }

    it('keeps "Allow user to restore messages" off after saving it off', async () => {
      await setupAdvancedBackupTest();

      const restoreMessagesSwitch = page.getByRole('switch', {
        name: 'Allow user to restore messages',
      });
      await expect.element(restoreMessagesSwitch).toBeVisible();
      expect(restoreToggleIcon()).toBe('ToggleRight');

      await userEvent.click(restoreMessagesSwitch);
      expect(restoreToggleIcon()).toBe('ToggleLeftOutline');

      await page.getByRole('button', { name: 'Save' }).click();

      expect(restoreToggleIcon()).toBe('ToggleLeftOutline');
    });

    it('toggles "Enable / Disable Backup" switch and shows dirty state', async () => {
      await setupAdvancedBackupTest();

      const backupEnabledSwitch = page.getByRole('switch', { name: 'Enable / Disable Backup' });
      await expect.element(backupEnabledSwitch).toBeVisible();
      await expect.element(backupEnabledSwitch).not.toBeChecked();

      await userEvent.click(backupEnabledSwitch);
      await expect.element(backupEnabledSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();

      await userEvent.click(backupEnabledSwitch);
      await expect.element(backupEnabledSwitch).not.toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });
  });

  describe('Password section switches', () => {
    it('toggles "Prevent user from changing password" switch and shows dirty state', async () => {
      await setupCosAdvancedTest();

      const preventPasswordChangeSwitch = page.getByRole('switch', {
        name: 'Prevent user from changing password',
      });
      await expect.element(preventPasswordChangeSwitch).not.toBeChecked();
      await userEvent.click(preventPasswordChangeSwitch);
      await expect.element(preventPasswordChangeSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();

      await userEvent.click(preventPasswordChangeSwitch);
      await expect.element(preventPasswordChangeSwitch).not.toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });

    it('toggles "Reject common passwords" switch and shows dirty state', async () => {
      await setupCosAdvancedTest();

      const rejectCommonPasswordsSwitch = page.getByRole('switch', {
        name: 'Reject common passwords',
      });
      await expect.element(rejectCommonPasswordsSwitch).not.toBeChecked();
      await userEvent.click(rejectCommonPasswordsSwitch);
      await expect.element(rejectCommonPasswordsSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();

      await userEvent.click(rejectCommonPasswordsSwitch);
      await expect.element(rejectCommonPasswordsSwitch).not.toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });
  });

  describe('Failed Login Policy section', () => {
    it('toggles "Enable failed login lockout" switch and shows dirty state', async () => {
      await setupCosAdvancedTest();

      const lockoutEnabledSwitch = page.getByRole('switch', {
        name: 'Enable failed login lockout',
      });
      await expect.element(lockoutEnabledSwitch).not.toBeChecked();
      await userEvent.click(lockoutEnabledSwitch);
      await expect.element(lockoutEnabledSwitch).toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();

      await userEvent.click(lockoutEnabledSwitch);
      await expect.element(lockoutEnabledSwitch).not.toBeChecked();
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });

    it('disables lockout fields when lockout is not enabled', async () => {
      await setupCosAdvancedTest();

      const maxFailuresInput = page.getByRole('textbox', {
        name: 'Number of consecutive failed logins allowed',
      });
      await expect.element(maxFailuresInput).toBeDisabled();

      const lockoutDurationInput = page.getByRole('textbox', {
        name: 'Time to lockout the account',
      });
      await expect.element(lockoutDurationInput).toBeDisabled();
    });

    it('enables lockout fields when lockout is enabled', async () => {
      await setupCosAdvancedTest();

      const lockoutEnabledSwitch = page.getByRole('switch', {
        name: 'Enable failed login lockout',
      });
      await expect.element(lockoutEnabledSwitch).not.toBeChecked();
      await userEvent.click(lockoutEnabledSwitch);
      await expect.element(lockoutEnabledSwitch).toBeChecked();

      const maxFailuresInput = page.getByRole('textbox', {
        name: 'Number of consecutive failed logins allowed',
      });
      await expect.element(maxFailuresInput).toBeEnabled();

      const lockoutDurationInput = page.getByRole('textbox', {
        name: 'Time to lockout the account',
      });
      await expect.element(lockoutDurationInput).toBeEnabled();
    });

    it('edits lockout duration input and shows dirty state', async () => {
      await setupCosAdvancedTest();

      await userEvent.click(page.getByRole('switch', { name: 'Enable failed login lockout' }));
      const lockoutDurationInput = page.getByRole('textbox', {
        name: 'Time to lockout the account',
      });
      await expect.element(lockoutDurationInput).toHaveValue('60');
      await userEvent.fill(lockoutDurationInput, '30');
      await expect.element(lockoutDurationInput).toHaveValue('30');
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('edits lockout failure lifetime input and shows dirty state', async () => {
      await setupCosAdvancedTest();

      await userEvent.click(page.getByRole('switch', { name: 'Enable failed login lockout' }));
      const failureLifetimeInput = page.getByRole('textbox', {
        name: 'Time window in which the failed logins must occur to lock the account:',
      });
      await expect.element(failureLifetimeInput).toHaveValue('1');
      await userEvent.fill(failureLifetimeInput, '2');
      await expect.element(failureLifetimeInput).toHaveValue('2');
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('edits max failures input and shows dirty state', async () => {
      await setupCosAdvancedTest();

      await userEvent.click(page.getByRole('switch', { name: 'Enable failed login lockout' }));
      const maxFailuresInput = page.getByRole('textbox', {
        name: 'Number of consecutive failed logins allowed',
      });
      await expect.element(maxFailuresInput).toHaveValue('5');
      await userEvent.fill(maxFailuresInput, '10');
      await expect.element(maxFailuresInput).toHaveValue('10');
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });
  });

  describe('Total Quota section', () => {
    it('should restore the unlimited quota switch to ON after toggling it off and clicking Cancel', async () => {
      await setupAdvancedQuotaTest();
      const unlimitedSwitch = page.getByRole('switch', { name: 'Unlimited quota' });
      await expect.element(unlimitedSwitch).toBeChecked();

      await userEvent.click(unlimitedSwitch);
      await expect.element(unlimitedSwitch).not.toBeChecked();

      await page.getByRole('button', { name: 'Cancel' }).click();

      await expect.element(unlimitedSwitch).toBeChecked();
    });

    it('should restore the unlimited quota switch to ON after toggling it off and clicking revert', async () => {
      await setupAdvancedQuotaTest();
      const unlimitedSwitch = page.getByRole('switch', { name: 'Unlimited quota' });
      await expect.element(unlimitedSwitch).toBeChecked();

      await userEvent.click(unlimitedSwitch);
      await expect.element(unlimitedSwitch).not.toBeChecked();

      const revertIcon = page.getByRole('img', { name: 'Click to revert to the inherited value' });
      await userEvent.click(revertIcon);

      await expect.element(unlimitedSwitch).toBeChecked();
    });

    it('should show the revert icon after changing the quota input value', async () => {
      const limitedQuotaSeed = {
        type: 'success',
        totalComputedLimit: { type: 'limited', value: 1073741824 },
        totalQuotaSource: 'global',
      };
      const queryClient = getQueryClient();
      await grantUserCosRights(queryClient);
      queryClient.setQueryData(['cos', 'detail', COS_ID], mockCosData);
      queryClient.setQueryData(['cos', 'cos-quota', ''], limitedQuotaSeed);
      queryClient.setQueryData(['cos', 'cos-quota', COS_ID], limitedQuotaSeed);
      queryClient.setQueryData(['advanced-supported'], { supported: true });
      mockCatalogServices();
      createBrowserSoapAPIInterceptor('GetCos', mockCosData);

      await setupBrowserTest(
        <Routes>
          <Route path="/:cosId/:operation" element={<CosAdvanced />} />
        </Routes>,
        { initialRouterEntry: `/${COS_ID}/advanced`, queryClient },
      );

      const input = page.getByRole('textbox', { name: 'Total quota(GB)' });
      await expect.element(input).toHaveValue('1');

      await userEvent.fill(input, '15');

      await expect
        .element(page.getByRole('img', { name: 'Click to revert to the inherited value' }))
        .toBeVisible();
    });

    it('should not show the revert icon after saving a quota change', async () => {
      const queryClient = getQueryClient();
      await grantUserCosRights(queryClient);
      seedQueryClientData(queryClient);
      mockCoreAttributeSet();
      createBrowserSoapAPIInterceptor('GetCos', mockCosData);
      createBrowserSoapAPIInterceptor('ModifyCos', {});
      createBrowserSoapAPIInterceptor('FlushCache', {});
      createBrowserAPIInterceptor(
        'put',
        `/services/storages/admin/quota/config/cos/${COS_ID}`,
        () => HttpResponse.json({}),
      );

      await setupAdvancedQuotaTest();

      const unlimitedSwitch = page.getByRole('switch', { name: 'Unlimited quota' });
      await expect.element(unlimitedSwitch).toBeChecked();
      await userEvent.click(unlimitedSwitch);

      await page.getByRole('button', { name: 'Save' }).click();
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();

      queryClient.setQueryData(['cos', 'cos-quota', COS_ID], {
        type: 'success',
        totalComputedLimit: { type: 'limited', value: 1073741824 },
        totalQuotaSource: 'cos',
      });

      await expect.element(page.getByRole('textbox', { name: 'Total quota(GB)' })).toHaveValue('1');

      await expect
        .element(page.getByRole('img', { name: 'Click to revert to the inherited value' }))
        .not.toBeInTheDocument();
    });
  });
});
