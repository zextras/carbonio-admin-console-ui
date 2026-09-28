/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  grantUserConfigRights,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { backupQueryKeys } from '../../services/backup-query-keys';
import { AppView } from '../app-view';

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

function mockDumpGlobalConfigWithData() {
  return createBrowserAPIInterceptor('post', '/service/admin/soap/zextras', () =>
    HttpResponse.json({
      Body: {
        response: {
          content: JSON.stringify({
            response: {
              privateKeyAlgorithm: 'RSA',
              encryptionKeyAlgorithm: 'AES256',
            },
          }),
        },
      },
    }),
  );
}

function mockDumpGlobalConfigEmpty() {
  // A well-formed response with an empty config: the query resolves instantly
  // instead of throwing on missing content, which would retry for ~7s.
  return createBrowserAPIInterceptor('post', '/service/admin/soap/zextras', () =>
    HttpResponse.json({
      Body: {
        response: {
          content: JSON.stringify({ ok: true, response: {} }),
        },
      },
    }),
  );
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

describe('AppView', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  beforeEach(async () => {
    queryClient = getQueryClient();
    await grantUserConfigRights(queryClient);
    queryClient.setQueryData(['all-config'], [{ n: 'carbonioSendAnalytics', _content: 'FALSE' }]);
    queryClient.setQueryData(
      ['subscription', 'license'],
      buildLicenseData([{ name: 'backup_basic', quantity: '1', enabled: true }]),
    );
    queryClient.removeQueries({ queryKey: backupQueryKeys.all });
  });

  describe('Layout', () => {
    it('should render the Global Server Settings, Server Config and Advanced options', async () => {
      createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });
      mockDumpGlobalConfigEmpty();

      await setupBrowserTest(<AppView />, {
        queryClient,
        initialRouterEntry: '/servers_list',
      });

      await expect.element(page.getByText('Global Server Settings')).toBeVisible();
      await expect.element(page.getByText('Server Config')).toBeVisible();
      await expect.element(page.getByText('Advanced', { exact: true })).toBeVisible();
    });
  });

  describe('BackupDetailPanel', () => {
    it('should show insufficient rights message when global config is not available', async () => {
      createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });
      mockDumpGlobalConfigEmpty();

      await setupBrowserTest(<AppView />, {
        queryClient,
        initialRouterEntry: '/server_config',
      });

      await expect
        .element(page.getByText(/You have no sufficient administration rights to see this section/))
        .toBeVisible();
    });

    it('should not show insufficient rights message when global config is loaded', async () => {
      createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });
      await mockDumpGlobalConfigWithData();

      queryClient.setQueryData(['global-config'], {
        privateKeyAlgorithm: 'RSA',
      });

      await setupBrowserTest(<AppView />, {
        queryClient,
        initialRouterEntry: '/server_config',
      });

      expect(
        page
          .getByText(/You have no sufficient administration rights to see this section/)
          .elements(),
      ).toHaveLength(0);
    });
  });

  describe('Server rights', () => {
    it('should show Servers List and Server Specifics when user has list server rights', async () => {
      createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });
      mockDumpGlobalConfigEmpty();
      grantServerRights(queryClient);

      await setupBrowserTest(<AppView />, {
        queryClient,
        initialRouterEntry: '/servers_list',
      });

      await expect.element(page.getByText('Servers List')).toBeVisible();
      await expect.element(page.getByText('Server Specifics')).toBeVisible();
    });

    it('should hide Servers List and Server Specifics when user lacks server rights', async () => {
      createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });
      mockDumpGlobalConfigEmpty();

      await setupBrowserTest(<AppView />, {
        queryClient,
        initialRouterEntry: '/servers_list',
      });

      expect(page.getByText('Servers List').elements()).toHaveLength(0);
      expect(page.getByText('Server Specifics').elements()).toHaveLength(0);
    });
  });

  describe('License gating', () => {
    it('should disable list options when backup module is not licensed', async () => {
      createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });
      mockDumpGlobalConfigEmpty();
      queryClient.setQueryData(['subscription', 'license'], buildLicenseData([]));

      await setupBrowserTest(<AppView />, {
        queryClient,
        initialRouterEntry: '/servers_list',
      });

      await expect.element(page.getByText('Global Server Settings')).toBeVisible();

      const serverConfigText = page.getByText('Server Config');
      await expect.element(serverConfigText).toBeVisible();
      await expect.element(serverConfigText).toHaveStyle({ opacity: '0.5' });

      const advancedText = page.getByText('Advanced', { exact: true });
      await expect.element(advancedText).toBeVisible();
      await expect.element(advancedText).toHaveStyle({ opacity: '0.5' });
    });
  });

  describe('Collapsible sections', () => {
    it('should hide Global Server Settings options when collapsed and show them again when expanded', async () => {
      createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });
      mockDumpGlobalConfigEmpty();

      await setupBrowserTest(<AppView />, {
        queryClient,
        initialRouterEntry: '/servers_list',
      });

      await expect.element(page.getByText('Server Config')).toBeVisible();

      await page.getByText('Global Server Settings').click();
      expect(page.getByText('Server Config').elements()).toHaveLength(0);

      await page.getByText('Global Server Settings').click();
      await expect.element(page.getByText('Server Config')).toBeVisible();
    });
  });
});
