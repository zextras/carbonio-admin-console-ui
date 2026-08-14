/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

vi.mock('@zextras/ui-shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@zextras/ui-shared')>();
  return { ...actual, replaceHistory: vi.fn() };
});

import { replaceHistory } from '@zextras/ui-shared';
import {
  createBrowserSoapAPIInterceptor,
  getGetInfoResponseMock,
  getQueryClient,
  grantUserConfigRights,
  registerAppRoute,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import {
  ADVANCED,
  ADVANCED_LBL,
  BACKUP_BASIC,
  BACKUP_ROUTE_ID,
  CONFIGURATION_BACKUP,
  SERVER_CONFIG,
  SERVERS_LIST,
} from '../../../constants';
import { BackupListPanel } from '../backup-list-panel';

const mockedReplaceHistory = vi.mocked(replaceHistory);

const SERVER_NAME = 'mail.test.com';
const BACKUP_BASE = '/backup';

const SERVERS = [
  {
    id: 'server-1',
    name: SERVER_NAME,
    a: [{ n: 'zimbraServiceHostname', _content: SERVER_NAME }],
  },
];

function buildLicenseData(features: Array<{ name: string; quantity: string; enabled: boolean }>) {
  return {
    ok: true,
    response: {
      type: 'REGULAR',
      subType: 'PERPETUAL',
      maintenanceStatus: 'active',
      features,
    },
  };
}

function grantServerRights(queryClient: ReturnType<typeof getQueryClient>) {
  queryClient.setQueryData(
    ['effective-rights', 'test@example.com'],
    [
      {
        type: 'config',
        all: [{ setAttrs: [{ all: true }], getAttrs: [{ all: true }] }],
      },
      {
        type: 'server',
        all: [{ right: [{ n: 'listServer' }] }],
      },
    ],
  );
}

function setupInterceptors(): void {
  createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
  createBrowserSoapAPIInterceptor('GetAllServers', { server: SERVERS });
}

function seedLicense(queryClient: ReturnType<typeof getQueryClient>): void {
  queryClient.setQueryData(
    ['subscription', 'license'],
    buildLicenseData([{ name: BACKUP_BASIC, quantity: '1', enabled: true }]),
  );
}

describe('BackupListPanel', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  beforeEach(() => {
    registerAppRoute(BACKUP_ROUTE_ID);
  });

  afterEach(() => {
    resetMockWorker();
    mockedReplaceHistory.mockClear();
  });

  describe('Default Settings navigation', () => {
    beforeEach(async () => {
      localStorage.clear();
      queryClient = getQueryClient();
      await grantUserConfigRights(queryClient);
      grantServerRights(queryClient);
      seedLicense(queryClient);
      setupInterceptors();
    });

    it('navigates to /server_config when clicking Server Config', async () => {
      await setupBrowserTest(<BackupListPanel />, {
        initialRouterEntry: `${BACKUP_BASE}/${SERVERS_LIST}`,
        queryClient,
      });

      await page.getByText('Server Config', { exact: true }).click();

      expect(mockedReplaceHistory).toHaveBeenCalledWith(`/${SERVER_CONFIG}`);
    });

    it('navigates to /servers_list when clicking Servers List', async () => {
      await setupBrowserTest(<BackupListPanel />, {
        initialRouterEntry: `${BACKUP_BASE}/${SERVER_CONFIG}`,
        queryClient,
      });

      await page.getByText('Servers List', { exact: true }).click();

      expect(mockedReplaceHistory).toHaveBeenCalledWith(`/${SERVERS_LIST}`);
    });

    it('navigates to /advanced when clicking Advanced', async () => {
      await setupBrowserTest(<BackupListPanel />, {
        initialRouterEntry: `${BACKUP_BASE}/${SERVERS_LIST}`,
        queryClient,
      });

      await page.getByText('Advanced', { exact: true }).first().click();

      expect(mockedReplaceHistory).toHaveBeenCalledWith(`/${ADVANCED}`);
    });
  });

  describe('Server-Specific navigation', () => {
    beforeEach(async () => {
      localStorage.clear();
      queryClient = getQueryClient();
      await grantUserConfigRights(queryClient);
      grantServerRights(queryClient);
      seedLicense(queryClient);
      setupInterceptors();
    });

    it('navigates to /<server>/configuration_lbl when clicking Configuration', async () => {
      await setupBrowserTest(<BackupListPanel />, {
        initialRouterEntry: `${BACKUP_BASE}/${SERVER_NAME}/${CONFIGURATION_BACKUP}`,
        queryClient,
      });

      await page.getByText('Configuration', { exact: true }).click();

      expect(mockedReplaceHistory).toHaveBeenCalledWith(`/${SERVER_NAME}/${CONFIGURATION_BACKUP}`);
    });

    it('navigates to /<server>/advanced_lbl when clicking Advanced', async () => {
      await setupBrowserTest(<BackupListPanel />, {
        initialRouterEntry: `${BACKUP_BASE}/${SERVER_NAME}/${CONFIGURATION_BACKUP}`,
        queryClient,
      });

      await page.getByText('Advanced', { exact: true }).last().click();

      expect(mockedReplaceHistory).toHaveBeenCalledWith(`/${SERVER_NAME}/${ADVANCED_LBL}`);
    });
  });

  describe('Server dropdown', () => {
    beforeEach(async () => {
      localStorage.clear();
      queryClient = getQueryClient();
      await grantUserConfigRights(queryClient);
      grantServerRights(queryClient);
      seedLicense(queryClient);
      setupInterceptors();
    });

    it('navigates to server configuration when selecting a server from the dropdown', async () => {
      await setupBrowserTest(<BackupListPanel />, {
        initialRouterEntry: `${BACKUP_BASE}/${SERVERS_LIST}`,
        queryClient,
      });

      const input = page.getByPlaceholder('Select a Server');
      await input.click();
      await input.fill('mail');

      await page.getByText(SERVER_NAME).click();

      expect(mockedReplaceHistory).toHaveBeenCalledWith(`/${SERVER_NAME}/${CONFIGURATION_BACKUP}`);
    });

    it('navigates back to server_config when clearing the server search', async () => {
      await setupBrowserTest(<BackupListPanel />, {
        initialRouterEntry: `${BACKUP_BASE}/${SERVERS_LIST}`,
        queryClient,
      });

      const input = page.getByPlaceholder('Select a Server');
      await input.click();
      await input.fill('mail');
      await page.getByText(SERVER_NAME).click();
      mockedReplaceHistory.mockClear();

      await page.getByTestId('icon: CloseOutline').click();

      expect(mockedReplaceHistory).toHaveBeenCalledWith(`/${SERVER_CONFIG}`);
    });

    it('shows error message when server search has no matching results', async () => {
      await setupBrowserTest(<BackupListPanel />, {
        initialRouterEntry: `${BACKUP_BASE}/${SERVERS_LIST}`,
        queryClient,
      });

      const input = page.getByPlaceholder('Select a Server');
      await input.click();
      await input.fill('xyznomatch');

      await expect.element(page.getByText(/Not found/i)).toBeVisible();
    });
  });

  describe('Collapsible sections', () => {
    beforeEach(async () => {
      localStorage.clear();
      queryClient = getQueryClient();
      await grantUserConfigRights(queryClient);
      grantServerRights(queryClient);
      seedLicense(queryClient);
      setupInterceptors();
    });

    it('hides Global Server Settings options when the section header is clicked', async () => {
      await setupBrowserTest(<BackupListPanel />, {
        initialRouterEntry: `${BACKUP_BASE}/${SERVERS_LIST}`,
        queryClient,
      });

      await expect.element(page.getByText('Server Config', { exact: true })).toBeVisible();

      await page.getByText('Global Server Settings', { exact: true }).click();

      expect(page.getByText('Server Config', { exact: true }).elements()).toHaveLength(0);
    });

    it('shows Global Server Settings options again when re-expanded', async () => {
      await setupBrowserTest(<BackupListPanel />, {
        initialRouterEntry: `${BACKUP_BASE}/${SERVERS_LIST}`,
        queryClient,
      });

      await page.getByText('Global Server Settings', { exact: true }).click();
      expect(page.getByText('Server Config', { exact: true }).elements()).toHaveLength(0);

      await page.getByText('Global Server Settings', { exact: true }).click();

      await expect.element(page.getByText('Server Config', { exact: true })).toBeVisible();
    });

    it('hides Server Specifics dropdown when the section header is clicked', async () => {
      await setupBrowserTest(<BackupListPanel />, {
        initialRouterEntry: `${BACKUP_BASE}/${SERVERS_LIST}`,
        queryClient,
      });

      await expect.element(page.getByPlaceholder('Select a Server')).toBeVisible();

      await page.getByText('Server Specifics', { exact: true }).click();

      expect(page.getByPlaceholder('Select a Server').elements()).toHaveLength(0);
    });

    it('shows Server Specifics dropdown again when re-expanded', async () => {
      await setupBrowserTest(<BackupListPanel />, {
        initialRouterEntry: `${BACKUP_BASE}/${SERVERS_LIST}`,
        queryClient,
      });

      await page.getByText('Server Specifics', { exact: true }).click();
      expect(page.getByPlaceholder('Select a Server').elements()).toHaveLength(0);

      await page.getByText('Server Specifics', { exact: true }).click();

      await expect.element(page.getByPlaceholder('Select a Server')).toBeVisible();
    });
  });

  describe('License gating', () => {
    beforeEach(async () => {
      localStorage.clear();
      queryClient = getQueryClient();
      await grantUserConfigRights(queryClient);
      grantServerRights(queryClient);
      setupInterceptors();
    });

    it('disables the server dropdown when backup module is not licensed', async () => {
      queryClient.setQueryData(['subscription', 'license'], buildLicenseData([]));

      await setupBrowserTest(<BackupListPanel />, {
        initialRouterEntry: `${BACKUP_BASE}/${SERVERS_LIST}`,
        queryClient,
      });

      const input = page.getByPlaceholder('Select a Server');
      await expect.element(input).toBeDisabled();
    });
  });
});
