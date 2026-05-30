/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserSoapAPIInterceptor,
  getGetInfoResponseMock,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { type ModifyCosBody } from '../../../services/modify-cos-service';
import { CosServerPools } from '../cos-server-pools/cos-server-pools';

const COS_ID = 'e00428a1-0c00-11d9-836a-000d93afea2a';

const mockCosData = {
  cos: [
    {
      id: COS_ID,
      name: 'default',
      a: [
        { n: 'zimbraId', _content: COS_ID },
        { n: 'zimbraMailHostPool', _content: 'server-1-id', c: true },
        { n: 'zimbraMailHostPool', _content: 'server-2-id' },
      ],
    },
  ],
};

const mockServers = {
  server: [
    { id: 'server-1-id', name: 'mail-server-1' },
    { id: 'server-2-id', name: 'mail-server-2' },
    { id: 'server-3-id', name: 'mail-server-3' },
  ],
};

const mockCosDataAllDisabled = {
  cos: [
    {
      id: COS_ID,
      name: 'default',
      a: [
        { n: 'zimbraId', _content: COS_ID },
        { n: 'zimbraMailHostPool', _content: 'server-1-id' },
        { n: 'zimbraMailHostPool', _content: 'server-2-id' },
      ],
    },
  ],
};

const mockCosDataNoPools = {
  cos: [
    {
      id: COS_ID,
      name: 'default',
      a: [{ n: 'zimbraId', _content: COS_ID }],
    },
  ],
};

async function setupServerPoolsTest(cosData = mockCosData, servers = mockServers) {
  createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
  createBrowserSoapAPIInterceptor('GetAllEffectiveRights', {
    grantee: { id: 'test-id', name: 'test@example.com' },
    target: [],
  });
  createBrowserSoapAPIInterceptor('GetCos', cosData);
  createBrowserSoapAPIInterceptor('GetAllServers', servers);
  createBrowserSoapAPIInterceptor('GetAccount', {});

  await setupBrowserTest(
    <Routes>
      <Route path="/:cosId/:operation" element={<CosServerPools />} />
    </Routes>,
    { initialRouterEntry: `/${COS_ID}/server-pools`, grantRights: 'cos' },
  );
  await expect.element(page.getByText('Server Pools')).toBeVisible();
}

async function selectServer(serverName: string) {
  const server = page.getByText(serverName);
  await server.click();
}

describe('CosServerPools', () => {
  beforeEach(async () => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    resetMockWorker();
  });

  describe('Rendering', () => {
    it('should render page title and General Options', async () => {
      await setupServerPoolsTest();
      await expect.element(page.getByText('Server Pools')).toBeVisible();
      await expect.element(page.getByText('General Options')).toBeVisible();
    });

    it('should render server table with correct rows', async () => {
      await setupServerPoolsTest();
      await expect.element(page.getByText('mail-server-1')).toBeVisible();
      await expect.element(page.getByText('mail-server-2')).toBeVisible();
      await expect.element(page.getByText('mail-server-3')).toBeVisible();
    });

    it('should show Enabled and Disabled status labels in the table', async () => {
      await setupServerPoolsTest();
      await expect.element(page.getByText('mail-server-1')).toBeVisible();
      const allEnabled = page.getByText('Enabled').all();
      const allDisabled = page.getByText('Disabled').all();
      expect(allEnabled.length).toBeGreaterThanOrEqual(1);
      expect(allDisabled.length).toBeGreaterThanOrEqual(2);
    });

    it('should hide server table when all pools are disabled', async () => {
      await setupServerPoolsTest(mockCosDataAllDisabled);
      await expect.element(page.getByText('General Options')).toBeVisible();
      await expect.element(page.getByText('Search for a specific server')).not.toBeInTheDocument();
    });

    it('should show server table when there are no pool entries', async () => {
      await setupServerPoolsTest(mockCosDataNoPools);
      await expect.element(page.getByPlaceholder('Search for a specific server')).toBeVisible();
      await expect.element(page.getByText('mail-server-1')).toBeVisible();
    });

    it('should render with empty server list and disabled search', async () => {
      await setupServerPoolsTest(mockCosData, { server: [] });
      await expect.element(page.getByText('General Options')).toBeVisible();
      const searchInput = page.getByPlaceholder('Search for a specific server');
      await expect.element(searchInput).toBeDisabled();
    });
  });

  describe('Row selection', () => {
    it('should enable the Enable button when a disabled server is selected', async () => {
      await setupServerPoolsTest();
      await selectServer('mail-server-3');

      const enableButton = page.getByRole('button', { name: 'enable' });
      const disableButton = page.getByRole('button', { name: 'disable' });
      await expect.element(enableButton).toBeEnabled();
      await expect.element(disableButton).toBeDisabled();
    });

    it('should enable the Disable button when an enabled server is selected', async () => {
      await setupServerPoolsTest();
      await selectServer('mail-server-1');

      const enableButton = page.getByRole('button', { name: 'enable' });
      const disableButton = page.getByRole('button', { name: 'disable' });
      await expect.element(enableButton).toBeDisabled();
      await expect.element(disableButton).toBeEnabled();
    });
  });

  describe('Enable action', () => {
    it('should send ModifyCos with correct body when enabling a server', async () => {
      const modifyCosPromise = createBrowserSoapAPIInterceptor('ModifyCos', {});
      createBrowserSoapAPIInterceptor('FlushCache', {});
      await setupServerPoolsTest();

      await selectServer('mail-server-3');

      const enableButton = page.getByRole('button', { name: 'enable' });
      await enableButton.click();

      const requestBody = (await modifyCosPromise) as ModifyCosBody;
      expect(requestBody._jsns).toBe('urn:zimbraAdmin');
      expect(requestBody.id._content).toBe(COS_ID);
      const poolAttrs = requestBody.a.filter((a: { n: string }) => a.n === 'zimbraMailHostPool');
      expect(poolAttrs.length).toBe(3);
      expect(poolAttrs.map((a: { _content: string }) => a._content)).toEqual([
        'server-1-id',
        'server-2-id',
        'server-3-id',
      ]);
    });
  });

  describe('Disable action', () => {
    it('should open confirmation modal when clicking disable on an enabled server', async () => {
      createBrowserSoapAPIInterceptor('FlushCache', {});
      await setupServerPoolsTest();
      await selectServer('mail-server-1');

      const disableButton = page.getByRole('button', { name: 'disable' });
      await expect.element(disableButton).toBeEnabled();
      await disableButton.click();

      await expect.element(page.getByText('Disabling pool', { exact: true })).toBeVisible();
    });

    it('should show server name in modal body', async () => {
      await setupServerPoolsTest();
      await selectServer('mail-server-1');

      const disableButton = page.getByRole('button', { name: 'disable' });
      await expect.element(disableButton).toBeEnabled();
      await disableButton.click();

      await expect.element(page.getByText('Disabling pool', { exact: true })).toBeVisible();
      await expect.element(page.getByText('You are disabling pool on mail-server-1')).toBeVisible();
    });

    it('should send ModifyCos with server removed when confirming disable', async () => {
      const modifyCosPromise = createBrowserSoapAPIInterceptor('ModifyCos', {});
      createBrowserSoapAPIInterceptor('FlushCache', {});
      await setupServerPoolsTest();

      await selectServer('mail-server-1');

      const disableButton = page.getByRole('button', { name: 'disable' });
      await expect.element(disableButton).toBeEnabled();
      await disableButton.click();

      await expect.element(page.getByText('Disabling pool', { exact: true })).toBeVisible();

      const confirmButton = page.getByRole('button', { name: 'Yes, Disable' });
      await confirmButton.click();

      const requestBody = (await modifyCosPromise) as ModifyCosBody;
      expect(requestBody.id._content).toBe(COS_ID);
      const poolAttrs = requestBody.a.filter((a: { n: string }) => a.n === 'zimbraMailHostPool');
      expect(poolAttrs.length).toBe(1);
      expect(poolAttrs[0]._content).toBe('server-2-id');
    });

    it('should send empty pool when disabling the last enabled server', async () => {
      const modifyCosPromise = createBrowserSoapAPIInterceptor('ModifyCos', {});
      createBrowserSoapAPIInterceptor('FlushCache', {});

      const cosDataSingleEnabled = {
        cos: [
          {
            id: COS_ID,
            name: 'default',
            a: [
              { n: 'zimbraId', _content: COS_ID },
              { n: 'zimbraMailHostPool', _content: 'server-1-id', c: true },
            ],
          },
        ],
      };
      await setupServerPoolsTest(cosDataSingleEnabled);

      await selectServer('mail-server-1');

      const disableButton = page.getByRole('button', { name: 'disable' });
      await expect.element(disableButton).toBeEnabled();
      await disableButton.click();

      await expect.element(page.getByText('Disabling pool', { exact: true })).toBeVisible();

      const confirmButton = page.getByRole('button', { name: 'Yes, Disable' });
      await confirmButton.click();

      const requestBody = (await modifyCosPromise) as ModifyCosBody;
      const poolAttrs = requestBody.a.filter((a: { n: string }) => a.n === 'zimbraMailHostPool');
      expect(poolAttrs.length).toBe(1);
      expect(poolAttrs[0]._content).toBe('');
    });

    it('should close modal without sending request when clicking No, Go Back', async () => {
      createBrowserSoapAPIInterceptor('FlushCache', {});
      await setupServerPoolsTest();
      await selectServer('mail-server-1');

      const disableButton = page.getByRole('button', { name: 'disable' });
      await expect.element(disableButton).toBeEnabled();
      await disableButton.click();

      await expect.element(page.getByText('Disabling pool', { exact: true })).toBeVisible();

      const goBackButton = page.getByRole('button', { name: 'No, Go Back' });
      await goBackButton.click();

      await expect
        .element(page.getByText('Disabling pool', { exact: true }))
        .not.toBeInTheDocument();
    });
  });

  describe('Search', () => {
    it('should filter server list when typing in search input', async () => {
      createBrowserSoapAPIInterceptor('FlushCache', {});
      await setupServerPoolsTest();

      const searchInput = page.getByPlaceholder('Search for a specific server');
      await searchInput.fill('server-1');

      await expect.element(page.getByText('mail-server-1')).toBeVisible();
      await expect.element(page.getByText('mail-server-2')).not.toBeInTheDocument();
      await expect.element(page.getByText('mail-server-3')).not.toBeInTheDocument();
    });

    it('should show all servers when search is cleared', async () => {
      await setupServerPoolsTest();

      const searchInput = page.getByPlaceholder('Search for a specific server');
      await searchInput.fill('server-1');

      await expect.element(page.getByText('mail-server-2')).not.toBeInTheDocument();

      await searchInput.fill('');

      await expect.element(page.getByText('mail-server-1')).toBeVisible();
      await expect.element(page.getByText('mail-server-2')).toBeVisible();
      await expect.element(page.getByText('mail-server-3')).toBeVisible();
    });
  });
});
