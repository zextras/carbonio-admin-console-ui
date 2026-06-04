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
        { n: 'zimbraMailQuota', _content: '1073741824' },
        { n: 'zimbraContactMaxNumEntries', _content: '100' },
        { n: 'zimbraQuotaWarnPercent', _content: '90' },
        { n: 'zimbraPasswordLocked', _content: 'FALSE' },
        { n: 'zimbraPasswordMinLength', _content: '6' },
        { n: 'zimbraPasswordMaxLength', _content: '64' },
        { n: 'zimbraPasswordBlockCommonEnabled', _content: 'FALSE' },
        { n: 'zimbraPasswordLockoutEnabled', _content: 'FALSE' },
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

    it('should render the Quotas section', async () => {
      await setupCosAdvancedTest();
      await expect.element(page.getByText('Quotas')).toBeVisible();
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

    it('should include multiple updated fields in the ModifyCos body', async () => {
      const modifyCosPromise = createBrowserSoapAPIInterceptor('ModifyCos', {});
      createBrowserSoapAPIInterceptor('FlushCache', {});
      mockCoreAttributeSet();
      await setupCosAdvancedTest();

      await userEvent.fill(
        page.getByRole('textbox', {
          name: 'Limit user-specified forwarding addresses to (char)',
        }),
        '512',
      );
      const maxNumInput = page.getByRole('textbox', {
        name: 'Max user-specific forwarding address',
      });
      await userEvent.fill(maxNumInput, '20');
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
      await page.getByRole('button', { name: 'Save' }).click();

      const requestBody = (await modifyCosPromise) as ModifyCosBody;
      const maxLengthAttr = requestBody.a.find(
        (a: { n: string }) => a.n === 'zimbraMailForwardingAddressMaxLength',
      );
      const maxNumAttr = requestBody.a.find(
        (a: { n: string }) => a.n === 'zimbraMailForwardingAddressMaxNumAddrs',
      );
      expect(maxLengthAttr!._content).toBe('512');
      expect(maxNumAttr!._content).toBe('20');
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

      const toggle = page.getByRole('switch', { name: 'Allow user to restore messages' });
      await expect.element(toggle).toBeVisible();
      expect(restoreToggleIcon()).toBe('ToggleRight');

      await userEvent.click(toggle);
      expect(restoreToggleIcon()).toBe('ToggleLeftOutline');

      await page.getByRole('button', { name: 'Save' }).click();

      expect(restoreToggleIcon()).toBe('ToggleLeftOutline');
    });
  });
});
