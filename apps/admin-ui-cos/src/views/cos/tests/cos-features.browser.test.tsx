/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { type ModifyCosBody } from '../../../services/modify-cos-service';
import { CosFeatures } from '../cos-features/cos-features';

const COS_ID = 'e00428a1-0c00-11d9-836a-000d93afea2a';

const mockCosData = {
  cos: [
    {
      id: COS_ID,
      name: 'default',
      a: [
        { n: 'zimbraId', _content: COS_ID },
        { n: 'carbonioFeatureMailsAppEnabled', _content: 'TRUE' },
        { n: 'zimbraFeatureOutOfOfficeReplyEnabled', _content: 'TRUE' },
        { n: 'zimbraFeatureSignaturesEnabled', _content: 'TRUE' },
        { n: 'zimbraFeatureMobileSyncEnabled', _content: 'FALSE' },
        { n: 'zimbraFeatureContactsEnabled', _content: 'TRUE' },
        { n: 'zimbraFeatureCalendarEnabled', _content: 'TRUE' },
        { n: 'carbonioFeatureFilesAppEnabled', _content: 'TRUE' },
        { n: 'carbonioFeatureFilesEnabled', _content: 'TRUE' },
        { n: 'carbonioFeatureTasksEnabled', _content: 'TRUE' },
        { n: 'zimbraFeatureOptionsEnabled', _content: 'TRUE' },
        { n: 'carbonioOtpWizardFromUntrusted', _content: 'FALSE' },
        { n: 'carbonioFeatureOTPMgmtEnabled', _content: 'FALSE' },
        { n: 'carbonioOtpGracePeriodEnabled', _content: 'FALSE' },
        { n: 'carbonioOtpGracePeriodEndingTime', _content: '' },
      ],
    },
  ],
};

function mockCatalogServices(): void {
  createBrowserAPIInterceptor('get', '/services/catalog/services', () =>
    HttpResponse.json({ items: [] }),
  );
}

async function setupCosFeaturesTest(cosData = mockCosData) {
  mockCatalogServices();
  createBrowserSoapAPIInterceptor('GetCos', cosData);
  createBrowserSoapAPIInterceptor('GetAccount', {});
  createBrowserAPIInterceptor('post', '/service/extension/zextras_admin/core/attributes/get', () =>
    HttpResponse.json({
      attributes: {
        mobileContactFeatureSync: [{ value: 'disabled' }],
        mobileCalendarFeatureSync: [{ value: 'disabled' }],
      },
    }),
  );

  await setupBrowserTest(
    <Routes>
      <Route path="/:cosId/:operation" element={<CosFeatures />} />
    </Routes>,
    { initialRouterEntry: `/${COS_ID}/features`, grantRights: 'cos' },
  );
  await expect.element(page.getByText('Features')).toBeVisible();
}

const SWITCH_LABELS: Record<string, string> = {
  zimbraFeatureOptionsEnabled: 'Can access Settings',
  zimbraFeatureSignaturesEnabled: 'Mail Signatures',
  zimbraFeatureOutOfOfficeReplyEnabled: 'Out of Office Reply',
  carbonioFeatureOTPMgmtEnabled: 'Allow users to configure 2FA',
};

async function clickSwitchByInputName(inputName: string) {
  await page.getByText(SWITCH_LABELS[inputName]).click();
}

describe('CosFeatures', () => {
  beforeEach(async () => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    resetMockWorker();
  });

  describe('Rendering', () => {
    it('should render the page title', async () => {
      await setupCosFeaturesTest();
      await expect.element(page.getByText('Features')).toBeVisible();
    });

    it('should render the General section', async () => {
      await setupCosFeaturesTest();
      await expect.element(page.getByText('General')).toBeVisible();
      await expect.element(page.getByText('Can access Settings')).toBeVisible();
    });

    it('should render the Mail section', async () => {
      await setupCosFeaturesTest();
      await expect.element(page.getByText('Mail', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Mail Signatures')).toBeVisible();
      await expect.element(page.getByText('Out of Office Reply')).toBeVisible();
    });

    it('should render the Contacts section', async () => {
      await setupCosFeaturesTest();
      await expect.element(page.getByText('Contacts', { exact: true })).toBeVisible();
    });

    it('should render the Calendar section', async () => {
      await setupCosFeaturesTest();
      await expect.element(page.getByText('Calendar', { exact: true })).toBeVisible();
    });

    it('should render the Files section', async () => {
      await setupCosFeaturesTest();
      await expect.element(page.getByText('Files', { exact: true })).toBeVisible();
    });

    it('should render the Tasks section', async () => {
      await setupCosFeaturesTest();
      await expect.element(page.getByText('Tasks', { exact: true })).toBeVisible();
    });
  });

  describe('Dirty state', () => {
    it('should not show Save and Cancel buttons initially', async () => {
      await setupCosFeaturesTest();
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
      await expect.element(page.getByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    });

    it('should show Save and Cancel buttons after toggling a switch', async () => {
      await setupCosFeaturesTest();
      await clickSwitchByInputName('zimbraFeatureOptionsEnabled');
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    });

    it('should restore initial values when Cancel is clicked', async () => {
      await setupCosFeaturesTest();
      await clickSwitchByInputName('zimbraFeatureOptionsEnabled');
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();

      await page.getByRole('button', { name: 'Cancel' }).click();
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });
  });

  describe('Toggle interaction', () => {
    it('should mark as dirty when toggling Can access Settings', async () => {
      await setupCosFeaturesTest();
      await clickSwitchByInputName('zimbraFeatureOptionsEnabled');
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should mark as dirty when toggling Mail Signatures', async () => {
      await setupCosFeaturesTest();
      await clickSwitchByInputName('zimbraFeatureSignaturesEnabled');
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should mark as dirty when toggling Out of Office Reply', async () => {
      await setupCosFeaturesTest();
      await clickSwitchByInputName('zimbraFeatureOutOfOfficeReplyEnabled');
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

  describe('Save', () => {
    it('should send ModifyCos with correct body when saving', async () => {
      const modifyCosPromise = createBrowserSoapAPIInterceptor('ModifyCos', {});
      createBrowserSoapAPIInterceptor('FlushCache', {});
      await setupCosFeaturesTest();

      await clickSwitchByInputName('zimbraFeatureOptionsEnabled');
      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();

      await page.getByRole('button', { name: 'Save' }).click();

      const requestBody = (await modifyCosPromise) as ModifyCosBody;
      expect(requestBody._jsns).toBe('urn:zimbraAdmin');
      expect(requestBody.id._content).toBe(COS_ID);
      const toggledAttr = requestBody.a.find(
        (a: { n: string }) => a.n === 'zimbraFeatureOptionsEnabled',
      );
      expect(toggledAttr).toBeDefined();
      expect(toggledAttr!._content).toBe('FALSE');
    });

    it('should send FlushCache after saving', async () => {
      createBrowserSoapAPIInterceptor('ModifyCos', {});
      const flushCachePromise = createBrowserSoapAPIInterceptor('FlushCache', {});
      await setupCosFeaturesTest();

      await clickSwitchByInputName('zimbraFeatureOptionsEnabled');
      await page.getByRole('button', { name: 'Save' }).click();

      const flushBody = await flushCachePromise;
      expect(flushBody).toBeDefined();
    });

    it('should send ModifyCos with multiple toggled attributes', async () => {
      const modifyCosPromise = createBrowserSoapAPIInterceptor('ModifyCos', {});
      createBrowserSoapAPIInterceptor('FlushCache', {});
      await setupCosFeaturesTest();

      await clickSwitchByInputName('zimbraFeatureSignaturesEnabled');
      await clickSwitchByInputName('zimbraFeatureOutOfOfficeReplyEnabled');

      await page.getByRole('button', { name: 'Save' }).click();

      const requestBody = (await modifyCosPromise) as ModifyCosBody;
      const signaturesAttr = requestBody.a.find(
        (a: { n: string }) => a.n === 'zimbraFeatureSignaturesEnabled',
      );
      const outOfOfficeAttr = requestBody.a.find(
        (a: { n: string }) => a.n === 'zimbraFeatureOutOfOfficeReplyEnabled',
      );
      expect(signaturesAttr!._content).toBe('FALSE');
      expect(outOfOfficeAttr!._content).toBe('FALSE');
    });

    it('should not include mobile sync attributes in ModifyCos body', async () => {
      const modifyCosPromise = createBrowserSoapAPIInterceptor('ModifyCos', {});
      createBrowserSoapAPIInterceptor('FlushCache', {});
      await setupCosFeaturesTest();

      await clickSwitchByInputName('zimbraFeatureOptionsEnabled');
      await page.getByRole('button', { name: 'Save' }).click();

      const requestBody = (await modifyCosPromise) as ModifyCosBody;
      const mobileAttrs = requestBody.a.filter(
        (a: { n: string }) =>
          a.n === 'mobileCalendarFeatureSync' || a.n === 'mobileContactFeatureSync',
      );
      expect(mobileAttrs).toHaveLength(0);
    });
  });

  describe('Read-only mode', () => {
    it('should disable switches when user has no COS setAttrs rights', async () => {
      const queryClient = getQueryClient();
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
      createBrowserSoapAPIInterceptor('GetAccount', {});
      createBrowserSoapAPIInterceptor('FlushCache', {});
      createBrowserAPIInterceptor(
        'post',
        '/service/extension/zextras_admin/core/attributes/get',
        () => HttpResponse.json({ attributes: {} }),
      );

      await setupBrowserTest(
        <Routes>
          <Route path="/:cosId/:operation" element={<CosFeatures />} />
        </Routes>,
        { initialRouterEntry: `/${COS_ID}/features`, queryClient },
      );
      await expect.element(page.getByText('Features')).toBeVisible();

      await page.getByText('Can access Settings').click();
      await expect.element(page.getByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });
  });
});
